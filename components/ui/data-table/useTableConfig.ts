'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TableConfig, ColumnConfig, getDefaultColumnConfig, SortConfig, GlobalStyle, ColumnType } from './types';

interface UseTableConfigProps {
    tableId: string;
    defaultColumns: { id: string; label: string; isMandatory?: boolean; type?: ColumnType }[];
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

export function useTableConfig({ tableId, defaultColumns }: UseTableConfigProps) {
    const [config, setConfig] = useState<TableConfig | null>(() => {
        if (typeof window === 'undefined') return null;

        const saved = localStorage.getItem(`table-config-${tableId}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge saved config with any new default columns that might have been added
                const mergedColumns = { ...parsed.columns };

                defaultColumns.forEach((col, index) => {
                    if (!mergedColumns[col.id]) {
                        mergedColumns[col.id] = getDefaultColumnConfig(col.id, col.label, index, col.isMandatory, col.type);
                        if (col.type === 'badge' && !mergedColumns[col.id].badgeStyle) {
                            mergedColumns[col.id].badgeStyle = DEFAULT_SERVICES_STYLE; // Use defaults
                        }
                    }
                    // Ensure existing columns get type if missing (migration)
                    if (mergedColumns[col.id] && !mergedColumns[col.id].type && col.type) {
                        mergedColumns[col.id].type = col.type;
                        if (col.type === 'badge' && !mergedColumns[col.id].badgeStyle) {
                            mergedColumns[col.id].badgeStyle = DEFAULT_SERVICES_STYLE;
                        }
                    }
                });

                return {
                    ...parsed,
                    columns: mergedColumns,
                    headerStyle: parsed.headerStyle || DEFAULT_HEADER_STYLE,
                    rowStyle: parsed.rowStyle || DEFAULT_ROW_STYLE,
                    servicesStyle: parsed.servicesStyle || DEFAULT_SERVICES_STYLE
                };
            } catch (e) {
                console.error("Failed to parse table config", e);
            }
        }

        // Default Config
        const cols: Record<string, ColumnConfig> = {};
        defaultColumns.forEach((col, index) => {
            cols[col.id] = getDefaultColumnConfig(col.id, col.label, index, col.isMandatory, col.type);
            if (col.type === 'badge') {
                cols[col.id].badgeStyle = DEFAULT_SERVICES_STYLE;
            }
        });

        return {
            id: tableId,
            columns: cols,
            headerStyle: DEFAULT_HEADER_STYLE,
            rowStyle: DEFAULT_ROW_STYLE,
            servicesStyle: DEFAULT_SERVICES_STYLE,
            sort: { key: null, direction: null },
            pagination: { pageSize: 10 }
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
            return {
                ...prev,
                columns: {
                    ...prev.columns,
                    [columnId]: { ...prev.columns[columnId], ...updates }
                }
            };
        });
    }, []);

    const addColumn = useCallback((column: ColumnConfig) => {
        setConfig(prev => {
            if (!prev) return null;
            return {
                ...prev,
                columns: {
                    ...prev.columns,
                    [column.id]: column
                }
            };
        });
    }, []);

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

    const resetToDefaults = useCallback(() => {
        localStorage.removeItem(`table-config-${tableId}`);
        const cols: Record<string, ColumnConfig> = {};
        defaultColumns.forEach((col, index) => {
            cols[col.id] = getDefaultColumnConfig(col.id, col.label, index, col.isMandatory, col.type);
            if (col.type === 'badge') {
                cols[col.id].badgeStyle = DEFAULT_SERVICES_STYLE;
            }
        });
        setConfig({
            id: tableId,
            columns: cols,
            headerStyle: DEFAULT_HEADER_STYLE,
            rowStyle: DEFAULT_ROW_STYLE,
            servicesStyle: DEFAULT_SERVICES_STYLE,
            sort: { key: null, direction: null },
            pagination: { pageSize: 10 }
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
        resetToDefaults,
        sortedColumns
    }), [config, updateColumn, updateColumnStyle, updateGlobalStyle, addColumn, reorderColumns, setSort, setPageSize, resetToDefaults, sortedColumns]);
}
