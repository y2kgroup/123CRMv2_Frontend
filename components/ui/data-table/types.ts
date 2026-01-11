export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
    key: string | null;
    direction: SortDirection;
}

export type FilterOperator =
    | 'contains'
    | 'doesNotContain'
    | 'equals'
    | 'doesNotEqual'
    | 'startsWith'
    | 'endsWith'
    | 'isEmpty'
    | 'isNotEmpty';

export interface FilterRule {
    id: string;
    field: string;
    operator: FilterOperator;
    value: string | string[];
}

export interface FilterConfig {
    matchType: 'AND' | 'OR';
    rules: FilterRule[];
}

// Styling options for cells
export interface CellStyle {
    alignment: 'left' | 'center' | 'right';
    textSize?: 'xs' | 'sm' | 'base';
    textColor?: string;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    isTag?: boolean; // If true, renders as a badge
    tagColor?: string; // If isTag is true, use this color scheme
}

// Configuration for a single column
export interface ColumnConfig {
    id: string;
    label: string;
    isVisible: boolean;
    order: number;
    isMandatory?: boolean; // If true, cannot be hidden (e.g. ID or Name)
    style: CellStyle;
    width?: string; // Custom width (e.g. "200px", "1fr")
}

// Global configuration for a specific table instance
export interface TableConfig {
    id: string; // Unique ID for storage (e.g. "companies-table-v1")
    columns: Record<string, ColumnConfig>; // Map column ID to config
    sort: SortConfig;
    pagination: {
        pageSize: number;
    };
}

// Helper to get default config
export const getDefaultColumnConfig = (id: string, label: string, order: number, isMandatory = false): ColumnConfig => ({
    id,
    label,
    isVisible: true,
    order,
    isMandatory,
    style: {
        alignment: 'left',
        textSize: 'sm',
        fontWeight: 'normal'
    }
});
