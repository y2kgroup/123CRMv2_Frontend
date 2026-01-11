'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TableConfig, ColumnConfig, getDefaultColumnConfig, SortConfig } from './types';

interface UseTableConfigProps {
    tableId: string;
    defaultColumns: { id: string; label: string; isMandatory?: boolean }[];
}

export function useTableConfig({ tableId, defaultColumns }: UseTableConfigProps) {
    const [config, setConfig] = useState<TableConfig | null>(null);

    // Initialize config from localStorage or defaults
    useEffect(() => {
        const saved = localStorage.getItem(`table-config-${tableId}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge saved config with any new default columns that might have been added
                const mergedColumns = { ...parsed.columns };

                defaultColumns.forEach((col, index) => {
                    if (!mergedColumns[col.id]) {
                        mergedColumns[col.id] = getDefaultColumnConfig(col.id, col.label, index, col.isMandatory);
                    }
                });

                setConfig({
                    ...parsed,
                    columns: mergedColumns
                });
                return;
            } catch (e) {
                console.error("Failed to parse table config", e);
            }
        }

        // Default Config
        const cols: Record<string, ColumnConfig> = {};
        defaultColumns.forEach((col, index) => {
            cols[col.id] = getDefaultColumnConfig(col.id, col.label, index, col.isMandatory);
        });

        setConfig({
            id: tableId,
            columns: cols,
            sort: { key: null, direction: null },
            pagination: { pageSize: 10 }
        });
    }, [tableId, defaultColumns]);

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

    const sortedColumns = useMemo(() => config
        ? Object.values(config.columns).sort((a, b) => a.order - b.order)
        : [], [config]);

    return useMemo(() => ({
        config,
        updateColumn,
        updateColumnStyle,
        reorderColumns,
        setSort,
        setPageSize,
        sortedColumns
    }), [config, updateColumn, updateColumnStyle, reorderColumns, setSort, setPageSize, sortedColumns]);
}
