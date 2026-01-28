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
export type ColumnType = 'text' | 'number' | 'badge' | 'date' | 'phone' | 'email' | 'address' | 'select' | 'currency' | 'link' | 'user' | 'action' | 'file' | 'image' | 'id' | 'url';

export interface ColumnConfig {
    id: string;
    label: string;
    isVisible: boolean;
    pinned?: 'left' | 'right' | null;
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
    multiEntryDisplay?: 'all' | 'primary'; // For multi-entry text fields: show all or only primary
    // Icon Configuration
    icon?: string; // Lucide icon name
    showIconInTable?: boolean; // Show in table header
    showIconInCard?: boolean; // Show in detail card
    // ID Configuration
    idPrefix?: string; // For 'id' type: prefix for generated ID
    // Merging
    mergeWithColumnId?: string; // ID of the column to merge with this one (displayed before/after)
}

export interface ActionButtonConfig {
    id: string; // 'edit', 'delete', 'view', 'email', 'call' or custom
    label: string;
    icon?: string; // Lucide icon name
    actionType: 'system' | 'custom'; // 'system' triggers internal logic
    variant?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'actionCard';
    tableDisplayMode: 'primary' | 'menu' | 'none';
    isVisibleInTable?: boolean; // Deprecated, used for migration
    isVisibleInCard: boolean;
    customUrl?: string; // For custom link actions
}

export interface GlobalStyle {
    alignment: 'left' | 'center' | 'right';
    textSize: 'xs' | 'sm' | 'base';
    textColor?: string;
    backgroundColor?: string;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    fontFamily?: string;
    textWrap?: 'wrap' | 'nowrap';
    spacing?: 'compact' | 'normal' | 'relaxed';
    imageSize?: 'sm' | 'md' | 'lg' | 'xl';
}

// Global configuration for a specific table instance
export interface TableConfig {
    id: string; // Unique ID for storage (e.g. "companies-table-v1")
    columns: Record<string, ColumnConfig>; // Map column ID to config
    actions: ActionButtonConfig[]; // Configured actions
    headerStyle?: GlobalStyle;
    rowStyle?: GlobalStyle;
    servicesStyle?: GlobalStyle; // Specific style for Service badges
    sort: SortConfig;
    pagination: {
        pageSize: number;
    };
    entityConfig?: EntityConfig;
}

export interface FormLayoutItem {
    id: string; // matches column ID or standard field key (name, owner, etc.)
    label?: string; // Label override
    visible: boolean;
    isCustom: boolean; // true if it's a dynamic table column
    type?: ColumnType;
    required?: boolean;
    // Dropdown props synced from ColumnConfig
    dropdownOptions?: string[];
    isMultiSelect?: boolean;
}

export interface DetailLayout {
    top: string[];
    left: string[];
    right: string[];
}

export interface DetailSectionStyle {
    alignment: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    title?: string;
    spacing?: 'compact' | 'normal' | 'relaxed';
    imageSize?: 'sm' | 'md' | 'lg' | 'xl';
    textSize?: 'xs' | 'sm' | 'base';
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    fontFamily?: string;
    textWrap?: 'wrap' | 'nowrap';
}

export interface EntityConfig {
    singularName: string;
    pluralName: string;
    layout: FormLayoutItem[]; // Form Layout
    detailLayout?: DetailLayout; // Detail Card Layout
    cardsLayout?: string[]; // IDs of visible cards in order (e.g. ['tasks', 'notes', 'files'])
    detailStyles?: {
        top?: DetailSectionStyle;
        left?: DetailSectionStyle;
        right?: DetailSectionStyle;
    };
    hiddenLabels?: string[]; // Array of field IDs whose labels should be hidden in Detail Card
    buttonStyles?: {
        primary?: ButtonStyle;
        secondary?: ButtonStyle;
        tertiary?: ButtonStyle;
        default?: ButtonStyle;
    };
}

export interface ButtonStyle {
    backgroundColor?: string;
    textColor?: string;
    iconColor?: string;
    borderColor?: string;
    activeBorderThickness?: string;
    displayMode?: 'icon-only' | 'text-only' | 'icon-text';
    iconPosition?: 'left' | 'right' | 'center';
    size?: 'sm' | 'md' | 'lg';
    fontWeight?: 'normal' | 'medium' | 'bold';
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
