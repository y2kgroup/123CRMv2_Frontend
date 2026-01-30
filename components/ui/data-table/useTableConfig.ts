'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TableConfig, ColumnConfig, getDefaultColumnConfig, SortConfig, GlobalStyle, ColumnType, EntityConfig, FormLayoutItem } from './types';

interface UseTableConfigProps {
    tableId: string;
    defaultColumns: { id: string; label: string; isMandatory?: boolean; type?: ColumnType }[];
    metadata?: { singularName?: string; pluralName?: string };
}

const DEFAULT_HEADER_STYLE: GlobalStyle = {
    alignment: 'left',
    textSize: 'sm',
    textColor: '#2563eb', // Blue-600 to match main menu
    backgroundColor: '#ffffff', // White to match main menu
    fontWeight: 'bold',
    fontFamily: undefined
};

const DEFAULT_ROW_STYLE: GlobalStyle = {
    alignment: 'left',
    textSize: 'sm',
    textColor: undefined,
    backgroundColor: undefined,
    fontWeight: 'normal',
    fontFamily: undefined
};

const DEFAULT_SERVICES_STYLE: GlobalStyle = {
    alignment: 'center',
    textSize: 'xs',
    textColor: '#4338ca', // indigo-700
    backgroundColor: '#e0e7ff', // indigo-100
    fontWeight: 'normal',
    fontFamily: undefined
};

const DEFAULT_ACTIONS: import('./types').ActionButtonConfig[] = [
    { id: 'view', label: 'View Details', icon: 'Eye', actionType: 'system', variant: 'default', tableDisplayMode: 'primary', isVisibleInCard: false },
    { id: 'edit', label: 'Edit', icon: 'Pencil', actionType: 'system', variant: 'default', tableDisplayMode: 'primary', isVisibleInCard: false },
    { id: 'delete', label: 'Delete', icon: 'Trash2', actionType: 'system', variant: 'default', tableDisplayMode: 'primary', isVisibleInCard: false },
    { id: 'email', label: 'Send Email', icon: 'Mail', actionType: 'system', variant: 'default', tableDisplayMode: 'menu', isVisibleInCard: true },
    { id: 'call', label: 'Call', icon: 'Phone', actionType: 'system', variant: 'default', tableDisplayMode: 'menu', isVisibleInCard: true },
];

const DEFAULT_ENTITY_CONFIG: EntityConfig = {
    singularName: 'Item',
    pluralName: 'Items',
    layout: [
        { id: 'logo', visible: true, isCustom: false },
        { id: 'id', visible: true, isCustom: false },
        { id: 'name', visible: true, isCustom: false },
        { id: 'owner', visible: true, isCustom: false },
        { id: 'emails', visible: true, isCustom: false },
        { id: 'phones', visible: true, isCustom: false },
        { id: 'addresses', visible: true, isCustom: false },
        { id: 'industry', visible: true, isCustom: false },
        { id: 'website', visible: true, isCustom: false },
        { id: 'services', visible: true, isCustom: false }
        // Custom columns will be appended here
    ],
    detailLayout: {
        top: ['services'],
        left: ['email', 'phone', 'website', 'industry'],
        right: ['address', 'owner']
    },
    cardsLayout: ['tasks', 'notes', 'files'],
    hiddenLabels: [],
    detailStyles: {
        top: { alignment: 'left', textColor: '#000000', backgroundColor: '#ffffff' },
        left: { alignment: 'left', textColor: '#000000', backgroundColor: '#ffffff' },
        right: { alignment: 'left', textColor: '#000000', backgroundColor: '#ffffff' }
    },
    buttonStyles: {
        primary: { backgroundColor: '#ffffff', textColor: '#0f172a', iconColor: '#64748b', borderColor: '#e2e8f0', activeBorderThickness: '0px', displayMode: 'icon-text', iconPosition: 'left', fontWeight: 'medium' },
        secondary: { backgroundColor: '#ffffff', textColor: '#0f172a', iconColor: '#64748b', borderColor: '#e2e8f0', activeBorderThickness: '0px', displayMode: 'icon-text', iconPosition: 'left', fontWeight: 'medium' },
        tertiary: { backgroundColor: '#ffffff', textColor: '#0f172a', iconColor: '#64748b', borderColor: '#e2e8f0', activeBorderThickness: '0px', displayMode: 'icon-text', iconPosition: 'left', fontWeight: 'medium' },
        default: { backgroundColor: '#ffffff', textColor: '#0f172a', iconColor: '#64748b', borderColor: '#e2e8f0', activeBorderThickness: '0px', displayMode: 'icon-text', iconPosition: 'center', fontWeight: 'medium' }
    }
};

// Helper to sync layout with active columns
// Helper to sync layout with active columns
function syncEntityLayout(entityConfig: EntityConfig, columns: Record<string, ColumnConfig>): FormLayoutItem[] {
    let layout = entityConfig.layout ? [...entityConfig.layout] : [];

    // 1. Add missing columns
    const existingIds = new Set(layout.map(i => i.id));
    const columnsToAdd: FormLayoutItem[] = [];

    Object.values(columns).forEach((col: ColumnConfig) => {
        const standardIds = ['id', 'name', 'owner', 'emails', 'phones', 'addresses', 'industry', 'website', 'services', 'logo', 'createdBy', 'createdAt', 'editedBy', 'editedAt', 'select', 'actions'];
        // Fields that should never be in the form layout
        const formSystemFields = ['select', 'actions', 'createdBy', 'createdAt', 'editedBy', 'editedAt'];

        if (!existingIds.has(col.id) && !formSystemFields.includes(col.id)) {
            const isStandard = standardIds.includes(col.id);
            columnsToAdd.push({
                id: col.id,
                visible: true,
                isCustom: !isStandard,
                label: col.label,
                type: col.type,
                required: false
            });
        }
    });

    if (columnsToAdd.length > 0) {
        layout = [...layout, ...columnsToAdd];
    }

    // 2. Filter phantom columns AND sync type
    // We keep the item if it exists in columns. 
    // We also update its 'type' to match the column definition to ensure 'file'/'image' works.
    layout = layout
        .filter(item => {
            // Exclude system fields from Form Layout
            const systemFields = ['select', 'actions', 'createdBy', 'createdAt', 'editedBy', 'editedAt'];
            if (systemFields.includes(item.id)) return false;

            // Keep if it exists in columns
            if (columns[item.id]) return true;
            // Also keep standard fields that might not be explicit columns but are handled manually in GenericEntityDialog
            // (Only if we want to support fields not in columns, but user wanted strict sync.  
            // However, 'logo' is a standard field in GenericDialog but might NOT be in columns for some tables. 
            // Wait, previous logic was: filter if NOT in columns.
            // But 'logo' IS in columns if it's in defaultColumns. 
            // If it's NOT in columns, it should be removed according to user's strict sync request.
            return false;
        })
        .map(item => ({
            ...item,
            type: columns[item.id].type, // Always sync type
            required: item.required ?? false, // Persist required state
            dropdownOptions: columns[item.id].dropdownOptions, // Sync options
            isMultiSelect: columns[item.id].isMultiSelect, // Sync multi-select state
            lookupConfig: columns[item.id].lookupConfig // Sync lookup config
        }));

    return layout;
}

// Helper to clean up detail layout by removing IDs that don't exist in columns
function syncDetailLayout(detailLayout: import('./types').DetailLayout, columns: Record<string, ColumnConfig>): import('./types').DetailLayout {
    const validIds = new Set(Object.keys(columns));
    // Ensure special UI elements are always allowed if they make sense
    validIds.add('actions');
    validIds.add('logo');

    return {
        top: detailLayout.top?.filter(id => validIds.has(id)) || [],
        left: detailLayout.left?.filter(id => validIds.has(id)) || [],
        right: detailLayout.right?.filter(id => validIds.has(id)) || []
    };
}

export function useTableConfig({ tableId, defaultColumns, metadata }: UseTableConfigProps) {
    const [config, setConfig] = useState<TableConfig | null>(() => {
        if (typeof window === 'undefined') return null;

        const saved = localStorage.getItem(`table-config-${tableId}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // ... (existing column merge logic) ...
                // Merge saved config with any new default columns that might have been added
                const mergedColumns = { ...parsed.columns };
                const removedIds = new Set(parsed.removedColumnIds || []);

                defaultColumns.forEach((col, index) => {
                    // Skip if explicitly removed
                    if (removedIds.has(col.id)) return;

                    if (!mergedColumns[col.id]) {
                        mergedColumns[col.id] = getDefaultColumnConfig(col.id, col.label, index, col.isMandatory, col.type);
                        if (col.type === 'badge' && !mergedColumns[col.id].badgeStyle) {
                            mergedColumns[col.id].badgeStyle = DEFAULT_SERVICES_STYLE; // Use defaults
                        }
                    } else {
                        // Always sync mandatory status from code definition
                        mergedColumns[col.id].isMandatory = col.isMandatory;
                    }
                    // Ensure existing columns get type if missing (migration)
                    if (mergedColumns[col.id] && !mergedColumns[col.id].type && col.type) {
                        mergedColumns[col.id].type = col.type;
                        if (col.type === 'badge' && !mergedColumns[col.id].badgeStyle) {
                            mergedColumns[col.id].badgeStyle = DEFAULT_SERVICES_STYLE;
                        }
                    }
                });

                // Default Actions Migration
                if (!parsed.actions) {
                    parsed.actions = [...DEFAULT_ACTIONS];
                } else {
                    // Migrate isVisibleInTable to tableDisplayMode
                    parsed.actions = parsed.actions.map((action: any) => ({
                        ...action,
                        tableDisplayMode: action.tableDisplayMode || (action.isVisibleInTable ? 'primary' : 'none')
                    }));
                }

                // Entity Config Migration/Merge
                let mergedEntityConfig: EntityConfig = parsed.entityConfig;
                if (!mergedEntityConfig) {
                    mergedEntityConfig = { ...DEFAULT_ENTITY_CONFIG };
                }

                // Apply Metadata Overrides (Always enforce code-defined names)
                if (metadata) {
                    if (metadata.singularName) mergedEntityConfig.singularName = metadata.singularName;
                    if (metadata.pluralName) mergedEntityConfig.pluralName = metadata.pluralName;
                }

                // Ensure layout exists/migrated
                if (!mergedEntityConfig.layout) {
                    // ... (existing layout migration) ...
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const oldFields = (mergedEntityConfig as any).fields || {};
                    const newLayout: FormLayoutItem[] = [
                        { id: 'logo', visible: oldFields.logo ?? true, isCustom: false },
                        { id: 'id', visible: true, isCustom: false }, // Always visible by default
                        { id: 'name', visible: true, isCustom: false },
                        { id: 'owner', visible: true, isCustom: false },
                        { id: 'emails', visible: oldFields.emails ?? true, isCustom: false },
                        { id: 'phones', visible: oldFields.phones ?? true, isCustom: false },
                        { id: 'addresses', visible: oldFields.addresses ?? true, isCustom: false },
                        { id: 'industry', visible: oldFields.industry ?? true, isCustom: false },
                        { id: 'website', visible: oldFields.website ?? true, isCustom: false },
                        { id: 'services', visible: oldFields.services ?? true, isCustom: false }
                    ];
                    mergedEntityConfig = {
                        ...mergedEntityConfig,
                        layout: newLayout
                    };
                }

                // Ensure detailLayout exists (migration)
                if (!mergedEntityConfig.detailLayout) {
                    mergedEntityConfig.detailLayout = {
                        top: ['logo', 'name', 'industry', 'actions'],
                        left: ['emails', 'phones', 'website'],
                        right: ['addresses', 'owner']
                    };
                }

                // Ensure cardsLayout exists (migration)
                if (!mergedEntityConfig.cardsLayout) {
                    mergedEntityConfig.cardsLayout = ['tasks', 'notes', 'files'];
                }

                // SYNC APPLIED HERE
                mergedEntityConfig.layout = syncEntityLayout(mergedEntityConfig, mergedColumns);
                mergedEntityConfig.detailLayout = syncDetailLayout(mergedEntityConfig.detailLayout, mergedColumns);

                return {
                    ...parsed,
                    columns: mergedColumns,
                    headerStyle: parsed.headerStyle || DEFAULT_HEADER_STYLE,
                    rowStyle: parsed.rowStyle || DEFAULT_ROW_STYLE,
                    servicesStyle: parsed.servicesStyle || DEFAULT_SERVICES_STYLE,
                    entityConfig: mergedEntityConfig
                };
            } catch (e) {
                console.error("Failed to parse table config", e);
            }
        }

        // Default Config initialization
        const cols: Record<string, ColumnConfig> = {};
        defaultColumns.forEach((col, index) => {
            cols[col.id] = getDefaultColumnConfig(col.id, col.label, index, col.isMandatory, col.type);
            if (col.type === 'badge') {
                cols[col.id].badgeStyle = DEFAULT_SERVICES_STYLE;
            }
        });

        const defaultEntityConfig = {
            ...DEFAULT_ENTITY_CONFIG,
            layout: DEFAULT_ENTITY_CONFIG.layout ? [...DEFAULT_ENTITY_CONFIG.layout] : []
        };

        // Apply Metadata Overrides to Defaults
        if (metadata) {
            if (metadata.singularName) defaultEntityConfig.singularName = metadata.singularName;
            if (metadata.pluralName) defaultEntityConfig.pluralName = metadata.pluralName;
        }

        // SYNC APPLIED HERE
        defaultEntityConfig.layout = syncEntityLayout(defaultEntityConfig, cols);

        // Ensure detailLayout exists if missing (migration/init)
        if (!defaultEntityConfig.detailLayout) {
            defaultEntityConfig.detailLayout = {
                top: ['services'],
                left: ['emails', 'phones', 'website', 'industry'],
                right: ['addresses', 'owner']
            };
        }

        // SYNC DETAIL LAYOUT
        defaultEntityConfig.detailLayout = syncDetailLayout(defaultEntityConfig.detailLayout, cols);

        if (!defaultEntityConfig.cardsLayout) {
            defaultEntityConfig.cardsLayout = ['tasks', 'notes', 'files'];
        }

        return {
            id: tableId,
            columns: cols,
            headerStyle: DEFAULT_HEADER_STYLE,
            rowStyle: DEFAULT_ROW_STYLE,
            servicesStyle: DEFAULT_SERVICES_STYLE,
            sort: { key: null, direction: null },
            pagination: { pageSize: 10 },
            entityConfig: defaultEntityConfig
        };
    });

    // Save to localStorage on change
    useEffect(() => {
        if (config) {
            localStorage.setItem(`table-config-${tableId}`, JSON.stringify(config));
        }
    }, [config, tableId]);

    const updateColumn = useCallback((columnId: string, updates: Partial<ColumnConfig>) => {
        setConfig(prev => {
            if (!prev) return null;
            const updatedColumns = {
                ...prev.columns,
                [columnId]: { ...prev.columns[columnId], ...updates }
            };

            // Sync layout item if it exists
            const currentEntityConfig = prev.entityConfig || DEFAULT_ENTITY_CONFIG;
            const currentLayout = currentEntityConfig.layout || [];
            const newLayout = currentLayout.map(item => {
                if (item.id === columnId) {
                    return {
                        ...item,
                        // Update label if changed
                        label: updates.label !== undefined ? updates.label : item.label,
                        // Sync type/options if changed, or fall back to existing column data
                        type: updates.type !== undefined ? updates.type : item.type,
                        dropdownOptions: updates.dropdownOptions !== undefined ? updates.dropdownOptions : item.dropdownOptions,
                        isMultiSelect: updates.isMultiSelect !== undefined ? updates.isMultiSelect : item.isMultiSelect,
                        lookupConfig: updates.lookupConfig !== undefined ? updates.lookupConfig : item.lookupConfig
                    };
                }
                return item;
            });

            return {
                ...prev,
                columns: updatedColumns,
                entityConfig: {
                    ...currentEntityConfig,
                    layout: newLayout
                }
            };
        });
    }, []);

    const addColumn = useCallback((column: ColumnConfig) => {
        setConfig(prev => {
            if (!prev) return null;

            // Sync with entityConfig.layout
            const currentEntityConfig = prev.entityConfig || DEFAULT_ENTITY_CONFIG;
            const currentLayout = currentEntityConfig.layout || [];
            const isInLayout = currentLayout.some(i => i.id === column.id);
            let newLayout = currentLayout;

            if (!isInLayout) {
                newLayout = [
                    ...currentLayout,
                    {
                        id: column.id,
                        visible: true,
                        isCustom: true,
                        label: column.label,
                        type: column.type,
                        dropdownOptions: column.dropdownOptions,
                        isMultiSelect: column.isMultiSelect,
                        lookupConfig: column.lookupConfig
                    }
                ];
            }

            return {
                ...prev,
                columns: {
                    ...prev.columns,
                    [column.id]: column
                },
                entityConfig: {
                    ...currentEntityConfig,
                    layout: newLayout
                }
            };
        });
    }, []);

    const removeColumn = useCallback((columnId: string) => {
        setConfig(prev => {
            if (!prev) return null;

            const newColumns = { ...prev.columns };
            delete newColumns[columnId];

            // Add to removed list
            const currentRemoved = prev.removedColumnIds || [];
            const newRemoved = currentRemoved.includes(columnId) ? currentRemoved : [...currentRemoved, columnId];

            // Sync with entityConfig.layout
            const currentEntityConfig = prev.entityConfig || DEFAULT_ENTITY_CONFIG;
            const currentLayout = currentEntityConfig.layout || [];
            const newLayout = currentLayout.filter(i => i.id !== columnId);

            return {
                ...prev,
                columns: newColumns,
                removedColumnIds: newRemoved,
                entityConfig: {
                    ...currentEntityConfig,
                    layout: newLayout
                }
            };
        });
    }, []); // Added tableId dependency just in case, though not strictly used inside but consistent context

    const updateColumnStyle = useCallback((columnId: string, styleUpdates: Partial<ColumnConfig['style']>) => {
        setConfig(prev => {
            if (!prev) return null;
            return {
                ...prev,
                columns: {
                    ...prev.columns,
                    [columnId]: {
                        ...prev.columns[columnId],
                        style: { ...prev.columns[columnId].style, ...styleUpdates }
                    }
                }
            };
        });
    }, []);

    const updateGlobalStyle = useCallback((type: 'header' | 'row' | 'services', styleUpdates: Partial<GlobalStyle>) => {
        setConfig(prev => {
            if (!prev) return null;

            let targetStyle = prev.headerStyle;
            if (type === 'row') targetStyle = prev.rowStyle;
            if (type === 'services') targetStyle = prev.servicesStyle;

            return {
                ...prev,
                [type === 'header' ? 'headerStyle' : type === 'row' ? 'rowStyle' : 'servicesStyle']: {
                    ...targetStyle,
                    ...styleUpdates
                }
            };
        });
    }, []);

    const reorderColumns = useCallback((newOrder: string[]) => {
        setConfig(prev => {
            if (!prev) return null;
            const newColumns = { ...prev.columns };
            newOrder.forEach((id, index) => {
                if (newColumns[id]) {
                    newColumns[id].order = index;
                }
            });
            return { ...prev, columns: newColumns };
        });
    }, []);

    const setSort = useCallback((sort: SortConfig) => {
        setConfig(prev => {
            if (!prev) return null;
            return { ...prev, sort };
        });
    }, []);

    const setPageSize = useCallback((pageSize: number) => {
        setConfig(prev => {
            if (!prev) return null;
            return { ...prev, pagination: { ...prev.pagination, pageSize } };
        });
    }, []);

    const updateEntityConfig = useCallback((updates: Partial<EntityConfig>) => {
        setConfig(prev => {
            if (!prev) return null;
            return {
                ...prev,
                entityConfig: {
                    ...prev.entityConfig,
                    ...updates,
                    // If layout is provided in updates, use it, otherwise keep prev
                    layout: updates.layout || prev.entityConfig?.layout || DEFAULT_ENTITY_CONFIG.layout
                } as EntityConfig
            };
        });
    }, []);

    const resetColumns = useCallback(() => {
        setConfig(prev => {
            if (!prev) return null;
            const cols: Record<string, ColumnConfig> = {};
            const removedIds = new Set(prev.removedColumnIds || []);

            defaultColumns.forEach((col, index) => {
                // Respect explicitly removed columns during reset
                if (removedIds.has(col.id)) return;

                cols[col.id] = getDefaultColumnConfig(col.id, col.label, index, col.isMandatory, col.type);
                if (col.type === 'badge') {
                    cols[col.id].badgeStyle = DEFAULT_SERVICES_STYLE;
                }
            });

            // Resync layout to remove phantom fields from deleted columns
            const currentEntityConfig = prev.entityConfig || DEFAULT_ENTITY_CONFIG;
            const syncedLayout = syncEntityLayout(currentEntityConfig, cols);

            return {
                ...prev,
                columns: cols,
                entityConfig: {
                    ...currentEntityConfig,
                    layout: syncedLayout
                }
            };
        });
    }, [defaultColumns]);

    const resetStyles = useCallback(() => {
        setConfig(prev => {
            if (!prev) return null;
            return {
                ...prev,
                headerStyle: DEFAULT_HEADER_STYLE,
                rowStyle: DEFAULT_ROW_STYLE,
                servicesStyle: DEFAULT_SERVICES_STYLE,
                entityConfig: {
                    ...prev.entityConfig,
                    detailStyles: DEFAULT_ENTITY_CONFIG.detailStyles,
                    buttonStyles: DEFAULT_ENTITY_CONFIG.buttonStyles
                } as EntityConfig
            };
        });
    }, []);

    const resetForm = useCallback(() => {
        setConfig(prev => {
            if (!prev) return null;

            // Re-sync from scratch to get default order and visibility
            const defaultWithCurrentColumns = {
                ...DEFAULT_ENTITY_CONFIG,
                layout: DEFAULT_ENTITY_CONFIG.layout ? [...DEFAULT_ENTITY_CONFIG.layout] : []
            };
            const syncedLayout = syncEntityLayout(defaultWithCurrentColumns, prev.columns);

            return {
                ...prev,
                entityConfig: {
                    ...prev.entityConfig,
                    layout: syncedLayout
                } as EntityConfig
            };
        });
    }, []);

    const resetDetailLayout = useCallback(() => {
        setConfig(prev => {
            if (!prev) return null;
            return {
                ...prev,
                entityConfig: {
                    ...prev.entityConfig,
                    detailLayout: syncDetailLayout(DEFAULT_ENTITY_CONFIG.detailLayout || { top: [], left: [], right: [] }, prev.columns),
                    hiddenLabels: DEFAULT_ENTITY_CONFIG.hiddenLabels
                } as EntityConfig
            };
        });
    }, []);

    const resetActions = useCallback(() => {
        setConfig(prev => {
            if (!prev) return null;
            return {
                ...prev,
                actions: [...DEFAULT_ACTIONS]
            };
        });
    }, []);

    const resetToDefaults = useCallback(() => {
        localStorage.removeItem(`table-config-${tableId}`);
        const cols: Record<string, ColumnConfig> = {};
        defaultColumns.forEach((col, index) => {
            cols[col.id] = getDefaultColumnConfig(col.id, col.label, index, col.isMandatory, col.type);
            if (col.type === 'badge') {
                cols[col.id].badgeStyle = DEFAULT_SERVICES_STYLE;
            }
        });

        // Deep copy default entity config
        const newEntityConfig = {
            ...DEFAULT_ENTITY_CONFIG,
            layout: DEFAULT_ENTITY_CONFIG.layout ? [...DEFAULT_ENTITY_CONFIG.layout] : []
        };

        // Sync layout with columns
        newEntityConfig.layout = syncEntityLayout(newEntityConfig, cols);
        if (newEntityConfig.detailLayout) {
            newEntityConfig.detailLayout = syncDetailLayout(newEntityConfig.detailLayout, cols);
        }

        setConfig({
            id: tableId,
            columns: cols,
            headerStyle: DEFAULT_HEADER_STYLE,
            rowStyle: DEFAULT_ROW_STYLE,
            servicesStyle: DEFAULT_SERVICES_STYLE,
            sort: { key: null, direction: null },
            pagination: { pageSize: 10 },
            entityConfig: newEntityConfig,
            actions: [...DEFAULT_ACTIONS],
            removedColumnIds: []
        });
    }, [tableId, defaultColumns]);

    const sortedColumns = useMemo(() => config
        ? Object.values(config.columns).sort((a, b) => {
            // Priority 1: Pinned status
            const aPin = a.pinned || null;
            const bPin = b.pinned || null;

            if (aPin === bPin) {
                // Same pin state, sort by order
                return a.order - b.order;
            }

            if (aPin === 'left') return -1;
            if (bPin === 'left') return 1;
            if (aPin === 'right') return 1;
            if (bPin === 'right') return -1;

            return a.order - b.order;
        })
        : [], [config]);

    return useMemo(() => ({
        config,
        updateColumn,
        updateColumnStyle,
        updateGlobalStyle,
        addColumn,
        reorderColumns,
        setSort,
        setPageSize,
        updateEntityConfig,
        updateActions: (newActions: import('./types').ActionButtonConfig[]) => setConfig(prev => {
            if (!prev) return null;
            return {
                ...prev,
                actions: newActions
            };
        }),
        resetToDefaults,
        resetColumns,
        resetStyles,
        resetForm,
        resetDetailLayout,
        resetActions,
        removeColumn,
        sortedColumns
    }), [config, updateColumn, updateColumnStyle, updateGlobalStyle, addColumn, reorderColumns, setSort, setPageSize, updateEntityConfig, resetToDefaults, resetColumns, resetStyles, resetForm, resetDetailLayout, resetActions, removeColumn, sortedColumns]);
}
