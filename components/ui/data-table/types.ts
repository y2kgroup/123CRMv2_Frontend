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

// Main Column Configuration Interface
export type ColumnType = 'text' | 'number' | 'badge' | 'date' | 'phone' | 'address' | 'select' | 'currency' | 'link' | 'user' | 'action';

export interface ColumnConfig {
    id: string;
    label: string;
    isVisible: boolean;
    order: number;
    isMandatory?: boolean; // If true, cannot be hidden (e.g. ID or Name)
    style: CellStyle;
    width?: string; // Custom width (e.g. "200px", "1fr")
    type: ColumnType; // Type of data in the column
    // Badge Styling
    badgeStyle?: GlobalStyle; // Style for badge-type columns
    // Dropdown Configuration
    displayStyle?: 'text' | 'badge'; // For 'select' type: how to display the selected value
    dropdownOptions?: string[]; // For 'select' type: available options
    isMultiSelect?: boolean; // For 'select' or 'badge' type: allow multiple values
}

export interface GlobalStyle {
    alignment: 'left' | 'center' | 'right';
    textSize: 'xs' | 'sm' | 'base';
    textColor?: string;
    backgroundColor?: string;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    fontFamily?: string;
}

// Global configuration for a specific table instance
export interface TableConfig {
    id: string; // Unique ID for storage (e.g. "companies-table-v1")
    columns: Record<string, ColumnConfig>; // Map column ID to config
    headerStyle?: GlobalStyle;
    rowStyle?: GlobalStyle;
    servicesStyle?: GlobalStyle; // Specific style for Service badges
    sort: SortConfig;
    pagination: {
        pageSize: number;
    };
}

// Helper to get default config
export const getDefaultColumnConfig = (id: string, label: string, order: number, isMandatory = false, type: ColumnType = 'text'): ColumnConfig => ({
    id,
    label,
    isVisible: true,
    order,
    isMandatory,
    type,
    style: {
        alignment: 'left',
        textSize: 'sm',
        fontWeight: 'normal'
    }
});
