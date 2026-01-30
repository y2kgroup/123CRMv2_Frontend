import { useEffect, useState, useMemo } from 'react';
import { TableConfig } from './types';

// Helper to reliably get table data key
const getPersistenceKey = (tableId: string) => {
    // Normalize IDs. 
    // This is a heuristic based on current app naming conventions.
    // 'crm-companies-v1-0' -> 'table-data-crm-companies-v1-0'
    return `table-data-${tableId}`;
};

export function useLookupData(config: TableConfig) {
    const [lookupData, setLookupData] = useState<Record<string, any[]>>({});

    // Identify needed tables
    const neededTables = useMemo(() => {
        if (!config?.columns) return [];
        const tables = new Set<string>();
        Object.values(config.columns).forEach(col => {
            if (col.type === 'lookup' && col.lookupConfig?.targetTableId) {
                tables.add(col.lookupConfig.targetTableId);
            }
        });
        return Array.from(tables);
    }, [config]);

    // Fetch data
    useEffect(() => {
        if (neededTables.length === 0) return;

        const newData: Record<string, any[]> = {};

        neededTables.forEach(tableId => {
            const key = getPersistenceKey(tableId);
            try {
                const item = localStorage.getItem(key);
                if (item) {
                    newData[tableId] = JSON.parse(item);
                } else {
                    console.warn(`[useLookupData] No data found for key: ${key}`);
                }
            } catch (e) {
                console.error(`[useLookupData] Failed to load data for ${tableId}`, e);
            }
        });

        // Only update if changes (deep check or just naive set for now)
        setLookupData(newData);

        // Optional: Listen for storage events if we want reactivity across tabs
        const handleStorage = (e: StorageEvent) => {
            if (e.key && neededTables.some(t => getPersistenceKey(t) === e.key)) {
                // Re-fetch specifics
                const changedTableId = neededTables.find(t => getPersistenceKey(t) === e.key);
                if (changedTableId) {
                    const newItem = localStorage.getItem(e.key);
                    setLookupData(prev => ({
                        ...prev,
                        [changedTableId]: newItem ? JSON.parse(newItem) : []
                    }));
                }
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [neededTables]);

    // Helper to get a specific value
    const getLookupValue = (targetTableId: string, foreignKeyVal: string, targetField: string) => {
        const tableData = lookupData[targetTableId];
        if (!tableData) return null;

        // Find row
        // We assume foreignKeyVal matches the 'id' of the target table for now, 
        // OR matches a unique name if the user selected a name column.
        // A smarter system would index this. For now, array.find is okay for small datasets.

        /* 
           Matching Strategy:
           1. Try to match by ID.
           2. Try to match by Name (common for simple text lookups).
        */
        const row = tableData.find((r: any) =>
            String(r.id) === String(foreignKeyVal) ||
            String(r.name) === String(foreignKeyVal)
        );

        if (!row) return null;

        // Get value
        const val = row[targetField];

        // Handle complex objects if targetField points to one (e.g. they looked up an 'email' column)
        if (Array.isArray(val)) {
            return val.map((v: any) => (typeof v === 'object' && 'value' in v) ? v.value : v).join(', ');
        }
        if (typeof val === 'object' && val !== null && 'value' in val) {
            return val.value;
        }

        return val;
    };

    return { lookupData, getLookupValue };
}
