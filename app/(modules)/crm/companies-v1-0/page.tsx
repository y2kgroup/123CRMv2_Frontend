/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Filter, X, ExternalLink, FileText, Trash2, Pencil } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ActionButtonConfig, ColumnConfig, CellStyle } from '@/components/ui/data-table/types';
import { evaluateFormula } from '@/lib/formula';
import { useTableConfig } from '@/components/ui/data-table/useTableConfig';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { DataTableViewOptions } from '@/components/ui/data-table/DataTableViewOptions';
import { Badge } from '@/components/ui/badge';
import { useLayout } from '@/components/layout/LayoutContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FileDown, FileUp, CreditCard, Settings, MoreVertical } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ImportCompaniesDialog } from '@/components/companies/ImportCompaniesDialog';
import { GenericEntityDialog } from '@/components/ui/data-table/GenericEntityDialog';
import { AdvancedFilterSheet, FilterRule, MatchType } from '@/components/companies/AdvancedFilterSheet';
import { AboutCardDetails } from "@/components/companies/detail/AboutCard";
import { cn } from '@/lib/utils';
import { usePersistedData } from '@/hooks/use-persisted-data';
import { usePathname } from 'next/navigation';

import { TasksCard } from '@/components/companies/detail/TasksCard';
import { NotesCard } from '@/components/companies/detail/NotesCard';
import { FilesCard } from '@/components/companies/detail/FilesCard';

import Papa from 'papaparse';
import { exportTableToCSV } from '@/components/ui/data-table/export-utils';
import { MultiSelect } from '@/components/ui/multi-select';

// Requested specific columns only
const defaultColumns = [
    { id: 'select', label: 'Select', isMandatory: true, style: { alignment: 'center' } },
    { id: 'createdBy', label: 'Created By', isMandatory: true },
    { id: 'createdAt', label: 'Created At', isMandatory: true },
    { id: 'editedBy', label: 'Edited By', isMandatory: true },
    { id: 'editedAt', label: 'Edited At', isMandatory: true },
    { id: 'actions', label: 'Actions', isMandatory: true },
];



export default function Companiesv10Page() {
    const { theme: currentMode, customTheme } = useLayout();
    const activeTheme = currentMode === 'dark' ? customTheme.dark : customTheme.light;

    // --- Table Config ---
    const tableConfig = useTableConfig({
        tableId: 'crm-companies-v1-0',
        defaultColumns: defaultColumns,
        metadata: {
            singularName: 'Company',
            pluralName: 'Companies'
        }
    });

    const pathname = usePathname();
    const persistenceKey = `table-data-${pathname?.replace(/\//g, '-') || 'default'}`;
    const [tableData, setTableData] = usePersistedData<any>(persistenceKey, []);

    // --- Selection State ---
    const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    // --- Delete Confirmation State ---
    const [deleteConfirm, setDeleteConfirm] = React.useState<{
        open: boolean;
        type: 'single' | 'bulk';
        id?: string;
        name?: string;
    }>({ open: false, type: 'bulk' });

    const handleDelete = () => {
        setDeleteConfirm({ open: true, type: 'bulk' });
    };

    const handleDeleteRow = (id: string, name: string) => {
        setDeleteConfirm({ open: true, type: 'single', id, name });
    };

    const confirmDelete = () => {
        if (deleteConfirm.type === 'bulk') {
            setTableData(prev => prev.filter(row => !selectedRows.has(row.id)));
            setSelectedRows(new Set());
        } else if (deleteConfirm.type === 'single' && deleteConfirm.id) {
            setTableData(prev => prev.filter(row => row.id !== deleteConfirm.id));
            if (selectedRows.has(deleteConfirm.id)) {
                const newSelected = new Set(selectedRows);
                newSelected.delete(deleteConfirm.id);
                setSelectedRows(newSelected);
            }
        }
        setDeleteConfirm(prev => ({ ...prev, open: false }));
    };
    const toggleAll = () => {
        if (selectedRows.size === tableData.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(tableData.map(row => row.id)));
        }
    };

    // --- Advanced Filter State ---
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const [filterRules, setFilterRules] = React.useState<FilterRule[]>([]);
    const [filterMatchType, setFilterMatchType] = React.useState<MatchType>('AND');

    // --- Filter Logic ---
    const filteredData = useMemo(() => {
        let result = tableData;

        if (filterRules.length > 0) {
            result = result.filter(item => {
                const results = filterRules.map(rule => {
                    const itemValue = String(item[rule.columnId as keyof typeof item] || '').toLowerCase();
                    const filterValue = rule.value.toLowerCase();

                    if (!rule.columnId) return true;

                    switch (rule.operator) {
                        case 'contains': return itemValue.includes(filterValue);
                        case 'equals': return itemValue === filterValue;
                        case 'startsWith': return itemValue.startsWith(filterValue);
                        case 'endsWith': return itemValue.endsWith(filterValue);
                        case 'isEmpty': return itemValue === '';
                        case 'isNotEmpty': return itemValue !== '';
                        default: return true;
                    }
                });

                if (filterMatchType === 'AND') {
                    return results.every(Boolean);
                } else {
                    return results.some(Boolean);
                }
            });
        }
        return result;
    }, [tableData, filterRules, filterMatchType]);


    // --- Quick Edit State ---
    const [isQuickEditMode, setIsQuickEditMode] = React.useState(false);

    // --- Split View State ---
    const [isDetailViewOpen, setIsDetailViewOpen] = React.useState(false);
    const [showDetailCard, setShowDetailCard] = React.useState(false);

    // Load persisted setting
    React.useEffect(() => {
        const saved = localStorage.getItem('templates_showDetailCard');
        if (saved !== null) {
            setShowDetailCard(JSON.parse(saved));
        }
    }, []);
    const [panelWidth, setPanelWidth] = React.useState(400);
    const [isResizing, setIsResizing] = React.useState(false);
    const [activeCompanyId, setActiveCompanyId] = React.useState<string | null>(null);

    // --- Resize Logic ---
    const startResizing = React.useCallback((mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = React.useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = React.useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            const newWidth = window.innerWidth - mouseMoveEvent.clientX;
            // Min 250px, Max 80% of screen
            if (newWidth > 250 && newWidth < window.innerWidth * 0.8) {
                setPanelWidth(newWidth);
            }
        }
    }, [isResizing]);

    React.useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
        }
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    const activeCompany = React.useMemo(() => {
        return tableData.find(c => c.id === activeCompanyId);
    }, [tableData, activeCompanyId]);

    const handleRowClick = (item: any) => {
        if (showDetailCard) {
            setActiveCompanyId(item.id);
            setIsDetailViewOpen(true);
        } else {
            // Default navigate or just select
            // router.push(`/companies/company-detail?id=${item.id}`);
            // Since we don't have a template-detail page yet, we'll force Detail Card mode or do nothing
            setActiveCompanyId(item.id);
            setIsDetailViewOpen(true);
        }
    };

    const handleCellChange = (id: string, field: string, value: any) => {
        setTableData(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    // --- Column Definitions ---
    const columns = useMemo(() => {
        const baseColumns: Record<string, (item: any) => React.ReactNode> = {
            select: (item: any) => (
                <div className="flex justify-center">
                    <Checkbox
                        checked={selectedRows.has(item.id)}
                        onCheckedChange={() => toggleRow(item.id)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            ),
            createdBy: (item: any) => item ? <span className="text-slate-500">{item.createdBy}</span> : null,
            createdAt: (item: any) => item ? <span className="text-slate-500">{new Date(item.createdAt).toLocaleString()}</span> : null,
            editedBy: (item: any) => item ? <span className="text-slate-500">{item.editedBy}</span> : null,
            editedAt: (item: any) => item ? <span className="text-slate-500">{new Date(item.editedAt).toLocaleString()}</span> : null,
            actions: (item: any) => {
                const actionsConfig = tableConfig.config?.actions || [];
                // Backward compatibility: isVisibleInTable -> tableDisplayMode
                const effectiveActions = actionsConfig.map(a => ({
                    ...a,
                    mode: a.tableDisplayMode || (a.isVisibleInTable ? 'primary' : 'none')
                }));

                const primaryActions = effectiveActions.filter(a => a.mode === 'primary');
                const menuActions = effectiveActions.filter(a => a.mode === 'menu');

                // Helper for click handling (kept local to avoid dependency issues for now)
                const handleClick = (e: React.MouseEvent, action: any) => {
                    e.stopPropagation();
                    switch (action.id) {
                        case 'view':
                            setActiveCompanyId(item.id);
                            setIsDetailViewOpen(true);
                            break;
                        case 'edit':
                            handleEditRow(item);
                            break;
                        case 'delete':
                            handleDeleteRow(item.id, item.name || 'this item');
                            break;
                        case 'email':
                            if (item.email) window.location.href = `mailto:${item.email}`;
                            else if (item.emails?.[0]?.value) window.location.href = `mailto:${item.emails[0].value}`;
                            break;
                        case 'call':
                            if (item.phone) window.location.href = `tel:${item.phone}`;
                            else if (item.phones?.[0]?.value) window.location.href = `tel:${item.phones[0].value}`;
                            break;
                        default:
                            if (action.customUrl) {
                                window.open(action.customUrl.replace('{id}', item.id), '_blank');
                            }
                            break;
                    }
                };

                const rowAlignment = tableConfig.config?.rowStyle?.alignment || 'left';
                const justifyClass = rowAlignment === 'center' ? 'justify-center' : rowAlignment === 'right' ? 'justify-end' : 'justify-start';

                return (
                    <div className={`flex items-center gap-1 ${justifyClass}`}>
                        {primaryActions.map(action => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const IconComp = action.icon && (LucideIcons as any)[action.icon] ? (LucideIcons as any)[action.icon] : null;
                            if (!IconComp) return null;

                            return (
                                <button
                                    key={action.id}
                                    className={cn(
                                        "h-8 w-8 p-0 flex items-center justify-center rounded-md transition-colors",
                                        action.variant === 'default'
                                            ? "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    )}
                                    title={action.label}
                                    onClick={(e) => handleClick(e, action)}
                                >
                                    <IconComp className="h-4 w-4" />
                                </button>
                            );
                        })}

                        {menuActions.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className="h-8 w-8 p-0 flex items-center justify-center rounded-md bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                >
                                    {menuActions.map(action => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const IconComp = action.icon && (LucideIcons as any)[action.icon] ? (LucideIcons as any)[action.icon] : null;
                                        return (
                                            <DropdownMenuItem
                                                key={action.id}
                                                onClick={(e) => handleClick(e as any, action)}
                                                className={cn(
                                                    "cursor-pointer",
                                                    action.variant === 'default' && ""
                                                )}
                                            >
                                                {IconComp && <IconComp className="w-4 h-4 mr-2" />}
                                                {action.label}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                );
            },
            // Minimal fallbacks for other columns if user adds them back via config
            id: (item: any) => <span className="font-mono text-xs text-slate-500">{item.id}</span>,
            name: (item: any) => {
                const colConfig = tableConfig.config?.columns?.['name'];

                // Formula Support for Name Column
                if (colConfig?.type === 'formula' && colConfig.formula) {
                    const val = evaluateFormula(colConfig.formula, item);
                    return <span className="font-medium text-slate-900 dark:text-slate-100">{String(val)}</span>;
                }

                if (isQuickEditMode) {
                    return (
                        <div onClick={(e) => e.stopPropagation()}>
                            <Input
                                value={item.name}
                                onChange={(e) => handleCellChange(item.id, 'name', e.target.value)}
                                className="h-8 w-full font-medium"
                            />
                        </div>
                    );
                }
                return <span className="font-medium text-slate-900 dark:text-slate-100">{item.name}</span>;
            },
        };

        // Add Custom Columns
        if (tableConfig.config?.columns) {
            Object.values(tableConfig.config.columns).forEach((col) => {
                if (!baseColumns[col.id]) {
                    baseColumns[col.id] = (item: any) => {
                        let val = item[col.id];

                        // Formula Evaluation
                        // If it's a formula column, ignore the stored value (if any) and compute it
                        if (col.type === 'formula' && col.formula) {
                            val = evaluateFormula(col.formula, item);
                        }

                        // Prepare Badge Style
                        const badgeStyleCfg = (col as any).badgeStyle || (col as any).style || {};
                        const computedBadgeStyle: React.CSSProperties = {
                            backgroundColor: badgeStyleCfg.backgroundColor,
                            color: badgeStyleCfg.textColor || badgeStyleCfg.color,
                            fontSize: badgeStyleCfg.textSize === 'xs' ? '0.75rem' : badgeStyleCfg.textSize === 'sm' ? '0.875rem' : badgeStyleCfg.textSize === 'base' ? '1rem' : undefined,
                            fontWeight: badgeStyleCfg.fontWeight,
                            fontFamily: badgeStyleCfg.fontFamily,
                            textAlign: badgeStyleCfg.alignment as any
                        };

                        // --- MERGED COLUMN LOGIC ---
                        let mergedContent = null;
                        if (col.mergeWithColumnId && tableConfig.config?.columns) {
                            const mergedCol = Object.values(tableConfig.config.columns).find(c => c.id === col.mergeWithColumnId);
                            if (mergedCol) {
                                const mergedVal = item[mergedCol.id];
                                if (mergedVal) {
                                    if (mergedCol.type === 'image') {
                                        mergedContent = (
                                            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
                                                <img src={mergedVal} alt="Merged" className="w-full h-full object-cover" />
                                            </div>
                                        );
                                    } else if (mergedCol.type === 'select' && mergedCol.displayStyle === 'badge') {
                                        mergedContent = <span className="text-xs text-slate-500 font-medium">{String(mergedVal)}</span>;
                                    } else {
                                        mergedContent = <span className="text-sm text-slate-500">{String(mergedVal)}</span>;
                                    }
                                }
                            }
                        }

                        const mainContent = (() => {
                            // --- QUICK EDIT MODE ---
                            if (isQuickEditMode) {
                                // Handler wrapper
                                const handleChange = (v: any) => handleCellChange(item.id, col.id, v);

                                // Handle Multi-Select (Badge or Select types)
                                if (col.isMultiSelect && (col.type === 'select' || col.type === 'badge')) {
                                    return (
                                        <div onClick={(e) => e.stopPropagation()} className="min-w-[200px]">
                                            <MultiSelect
                                                options={col.dropdownOptions || []}
                                                value={(Array.isArray(val) ? val : (val ? [val] : []))
                                                    .map((v: any) => (typeof v === 'object' && v !== null && 'value' in v) ? v.value : v)
                                                    .filter((v: any) => typeof v === 'string')}
                                                onChange={handleChange}
                                                placeholder="Select..."
                                                className="h-auto min-h-8 py-1"
                                                badgeStyle={computedBadgeStyle}
                                            />
                                        </div>
                                    );
                                }

                                // Handle Single-Select (Badge or Select types) with options
                                if ((col.type === 'select' || col.type === 'badge') && col.dropdownOptions && col.dropdownOptions.length > 0) {
                                    return (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Select
                                                value={val || ''}
                                                onValueChange={handleChange}
                                            >
                                                <SelectTrigger className="h-8 w-full min-w-[120px]">
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {col.dropdownOptions.map(opt => (
                                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    );
                                }

                                // Fallback for empty dropdown options in Select/Badge type -> render Text Input so they can at least edit or see why
                                if (col.type === 'select' || col.type === 'badge') {
                                    return (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Input
                                                value={val || ''}
                                                onChange={(e) => handleChange(e.target.value)}
                                                className="h-8 w-full min-w-[100px]"
                                                placeholder="No options configured"
                                            />
                                        </div>
                                    );
                                }

                                if (col.type === 'date') {
                                    return (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Input
                                                type="date"
                                                value={val || ''}
                                                onChange={(e) => handleChange(e.target.value)}
                                                className="h-8 w-full"
                                            />
                                        </div>
                                    );
                                }

                                // Handle Complex Types (Email, Phone, Address, Website)
                                if (col.type === 'email' || col.type === 'phone' || col.type === 'address' || col.type === 'url') {
                                    const displayValue = (() => {
                                        if (Array.isArray(val)) {
                                            return val.map((v: any) => (typeof v === 'object' && 'value' in v) ? v.value : v).join(', ');
                                        }
                                        if (typeof val === 'object' && val !== null && 'value' in val) {
                                            return val.value;
                                        }
                                        return val || '';
                                    })();

                                    return (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Input
                                                value={displayValue}
                                                onChange={(e) => {
                                                    const newVal = e.target.value;
                                                    // Reconstruct structure based on input
                                                    // If original was array(of objects), split and map
                                                    // If original was single object, updated value
                                                    // If original was clean string (or empty), store as array of objects to be safe/consistent?
                                                    // Let's infer from current val structure if possible, default to array of objects for these types.

                                                    let structuresVal: any = newVal;

                                                    const isArrayStructure = Array.isArray(val) || (!val && (col.type === 'email' || col.type === 'phone')); // Default to array for email/phone

                                                    if (isArrayStructure) {
                                                        structuresVal = newVal.split(',').map(s => ({ value: s.trim(), label: 'Primary' })).filter(o => o.value);
                                                    } else if (typeof val === 'object' && val !== null) {
                                                        structuresVal = { ...val, value: newVal };
                                                    }

                                                    handleChange(structuresVal);
                                                }}
                                                className="h-8 w-full min-w-[150px]"
                                                placeholder={col.label}
                                            />
                                        </div>
                                    );
                                }

                                return (
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Input
                                            type={col.type === 'number' ? 'number' : 'text'}
                                            value={(() => {
                                                if (typeof val === 'object' && val !== null) return JSON.stringify(val);
                                                return val || '';
                                            })()}
                                            onChange={(e) => handleChange(e.target.value)}
                                            className="h-8 w-full min-w-[100px]"
                                        />
                                    </div>
                                );
                            }

                            // --- READ ONLY MODE ---
                            if (!val && val !== 0) return <span className="text-slate-400 italic text-xs">Empty</span>;

                            if (col.type === 'image') {
                                return (
                                    <div className="flex items-center justify-center">
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                                            <img src={val} alt="Avatar" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                );
                            }

                            if (col.type === 'currency') {
                                const formatted = new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                }).format(Number(val) || 0);
                                return <span className="text-slate-600 dark:text-slate-400 font-mono">{formatted}</span>;
                            }

                            if (col.type === 'badge' || (col.type === 'select' && (col.displayStyle === 'badge' || Array.isArray(val)))) {
                                const values = Array.isArray(val) ? val : [val];
                                return (
                                    <div className="flex flex-wrap gap-1">
                                        {values.map((v: any, i: number) => {
                                            const displayVal = (typeof v === 'object' && v !== null && 'value' in v) ? v.value : v;
                                            if (typeof displayVal === 'object') return null;
                                            return (
                                                <Badge key={i} variant="secondary" className="px-1.5 py-0 border-transparent transition-colors" style={computedBadgeStyle}>
                                                    {String(displayVal)}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                );
                            }

                            if (col.type === 'url') {
                                const href = val.startsWith('http') ? val : `https://${val}`;
                                return (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline hover:text-blue-700 text-xs" onClick={(e) => e.stopPropagation()}>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span className="truncate max-w-[150px]">{String(val).replace(/^https?:\/\/(www\.)?/, '')}</span>
                                    </a>
                                );
                            }

                            if (col.type === 'file') {
                                return (
                                    <a href={val} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline hover:text-blue-700 text-xs" onClick={(e) => e.stopPropagation()}>
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>View File</span>
                                    </a>
                                );
                            }

                            if (Array.isArray(val)) {
                                // For Badge/Select types, use badges
                                if ((col.type as string) === 'badge' || (col.type === 'select' && col.displayStyle === 'badge')) {
                                    return (
                                        <div className="flex flex-wrap gap-1">
                                            {val.map((v: any, i: number) => {
                                                const displayVal = (typeof v === 'object' && v !== null && 'value' in v) ? v.value : v;
                                                if (typeof displayVal === 'object') return null;
                                                return (
                                                    <Badge key={i} variant="secondary" className="px-1.5 py-0 border-transparent transition-colors font-normal bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                        {String(displayVal)}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    );
                                }

                                // For other multi-entry types (Email, Phone, Address), render seamlessly as text
                                let displayValues = val;
                                if (col.multiEntryDisplay === 'primary') {
                                    const primaryItem = val.find((v: any) => v && typeof v === 'object' && v.isPrimary);
                                    // Use primary item, or fallback to first item if exists
                                    displayValues = primaryItem ? [primaryItem] : (val.length > 0 ? [val[0]] : []);
                                }

                                const rowAlignment = tableConfig.config?.rowStyle?.alignment || 'left';
                                const alignClass = rowAlignment === 'center' ? 'items-center text-center' : rowAlignment === 'right' ? 'items-end text-right' : 'items-start text-left';

                                return (
                                    <div className={`flex flex-col gap-0.5 ${alignClass}`}>
                                        <span className="text-slate-600 dark:text-slate-400 text-sm truncate">
                                            {displayValues.map((v: any) => {
                                                const displayVal = (typeof v === 'object' && v !== null && 'value' in v) ? v.value : v;
                                                return String(displayVal);
                                            }).join(', ')}
                                        </span>
                                    </div>
                                );
                            }

                            if (typeof val === 'object') return <span className="text-slate-400 text-xs">Complex Data</span>;

                            return <span className="text-slate-600 dark:text-slate-400">{String(val)}</span>;
                        })();

                        const rowAlignmentOuter = tableConfig.config?.rowStyle?.alignment || 'left';
                        const justifyClassOuter = rowAlignmentOuter === 'center' ? 'justify-center' : rowAlignmentOuter === 'right' ? 'justify-end' : 'justify-start';

                        return (
                            <div className={`flex items-center gap-3 ${justifyClassOuter}`}>
                                {mergedContent}
                                {mainContent}
                            </div>
                        );
                    };
                }
            });
        }

        return baseColumns;
    }, [selectedRows, tableData, isQuickEditMode, tableConfig.config]);

    // --- Import Dialog State ---
    const [isImportOpen, setIsImportOpen] = React.useState(false);

    // --- Add/Edit Company State ---
    const [isAddCompanyOpen, setIsAddCompanyOpen] = React.useState(false);
    const [editingCompany, setEditingCompany] = React.useState<any>(null);

    const handleSaveCompany = (companyData: any) => {
        // Process any File objects in companyData into Blob URLs for display
        const processedData = { ...companyData };
        Object.keys(processedData).forEach(key => {
            const value = processedData[key];
            if (value instanceof File) {
                processedData[key] = URL.createObjectURL(value);
            }
        });

        // Auto-generate IDs for custom ID columns if this is a new entry or they are missing
        if (tableConfig.config?.columns) {
            Object.values(tableConfig.config.columns).forEach(col => {
                // If it's a Custom ID column
                if (col.type === 'id') {
                    // Generate if it's a new entry (ignore form value) OR if it's missing on an edit (unlikely but safe)
                    if (!editingCompany || !processedData[col.id] || processedData[col.id] === 'Auto-generated') {
                        const prefix = col.idPrefix || '';
                        const randomPart = Math.random().toString(36).substr(2, 6).toUpperCase();
                        processedData[col.id] = `${prefix}${randomPart}`;
                    }
                }
            });
        }

        const newEntry = {
            ...processedData, // Include all custom fields and raw data
            // Ensure standard fields are formatted correctly for the table (e.g. taking first email/phone)
            email: companyData.emails?.[0]?.value || companyData.email || '',
            phone: companyData.phones?.[0]?.value || companyData.phone || '',
            address: companyData.addresses?.[0]?.value || companyData.address || '',

            // Metadata
            createdBy: editingCompany?.createdBy || 'System',
            createdAt: editingCompany?.createdAt || new Date().toLocaleDateString(),
            editedBy: 'System',
            editedAt: new Date().toLocaleDateString(),
        };

        if (editingCompany) {
            setTableData(prev => prev.map(row => row.id === companyData.id ? { ...row, ...newEntry } : row));
        } else {
            setTableData(prev => [newEntry, ...prev]);
        }
        setIsAddCompanyOpen(false);
        setEditingCompany(null);
    };

    const handleEditRow = (company: any) => {
        setEditingCompany(company);
        setIsAddCompanyOpen(true);
    };

    const handleImportFile = (file: File) => {
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const parsedData = results.data.map((row: any, index) => ({
                        // ... simplistic parsing
                        id: row.id || index + 1,
                        name: row.name || 'Imported',
                        createdBy: 'System',
                        createdAt: new Date().toLocaleDateString(),
                        editedBy: '',
                        editedAt: ''
                    }));

                    setTableData(prev => [...prev, ...parsedData]);
                    alert(`Imported ${parsedData.length} records successfully!`);
                },
                error: (error) => {
                    console.error("Error parsing CSV:", error);
                    alert("Failed to parse CSV file.");
                }
            });
        }
    };


    const handleExport = () => {
        const columnsToExport = tableConfig.sortedColumns.map(col => ({ id: col.id, label: col.label }));

        // Hydrate formula values
        const dataToExport = tableData.map(row => {
            const newRow = { ...row };
            if (tableConfig.config?.columns) {
                Object.values(tableConfig.config.columns).forEach(col => {
                    if (col.type === 'formula' && col.formula) {
                        newRow[col.id] = evaluateFormula(col.formula, row);
                    }
                });
            }
            return newRow;
        });

        exportTableToCSV(dataToExport, 'companies-export.csv', columnsToExport);
    };

    // --- Action Menu Items ---
    const { setHeaderMenuItems, setHeaderActions } = useLayout();


    // Cleaning up actions on unmount
    React.useEffect(() => {
        return () => {
            setHeaderMenuItems(null);
            setHeaderActions(null);
        };
    }, [setHeaderMenuItems, setHeaderActions]);

    // Setting actions
    React.useEffect(() => {
        const itemStyle = {
            color: 'var(--h-nav-dropdown-text)',
            fontWeight: 'var(--h-nav-dropdown-font-weight)',
        } as React.CSSProperties;

        const iconStyle = {
            color: 'var(--h-nav-dropdown-icon)',
            opacity: 1
        };

        const handleMouseEnter = (e: any) => (e.currentTarget.style.backgroundColor = 'var(--h-nav-dropdown-active-bg)');
        const handleMouseLeave = (e: any) => (e.currentTarget.style.backgroundColor = 'transparent');
        const handleFocus = (e: any) => (e.currentTarget.style.backgroundColor = 'var(--h-nav-dropdown-active-bg)');
        const handleBlur = (e: any) => (e.currentTarget.style.backgroundColor = 'transparent');

        // Set Header Actions
        setHeaderActions(
            <div className="flex items-center gap-2">
                {selectedRows.size > 0 && (
                    <Button variant="tertiary" icon={Trash2} onClick={handleDelete}>
                        Delete
                    </Button>
                )}

                {filterRules.length > 0 && (
                    <Button
                        variant="tertiary"
                        className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-transparent transition-colors"
                        onClick={() => {
                            setFilterRules([]);
                            setFilterMatchType('AND');
                        }}
                    >
                        <span className="flex items-center gap-1.5">
                            <X className="w-4 h-4" />
                            Clear
                            <span className="ml-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-inset ring-red-700/10 dark:ring-red-400/20">
                                {filterRules.length}
                            </span>
                        </span>
                    </Button>
                )}

                <Button variant="secondary" icon={Pencil} onClick={() => setIsQuickEditMode(!isQuickEditMode)}>
                    {isQuickEditMode ? 'Done' : 'Quick Edit'}
                </Button>

                <Button variant="primary" icon={Plus} onClick={() => {
                    setEditingCompany(undefined);
                    setIsAddCompanyOpen(true);
                }}>
                    Add {tableConfig.config?.entityConfig?.singularName || 'Item'}
                </Button>

                <Button variant="action" icon={Filter} onClick={() => setIsFilterOpen(true)}>
                    Filter
                </Button>
            </div>
        );

        setHeaderMenuItems(
            <>
                <DropdownMenuItem
                    className="cursor-pointer focus:outline-none"
                    style={itemStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onClick={() => {
                        const newState = !showDetailCard;
                        setShowDetailCard(newState);
                        localStorage.setItem('templates_showDetailCard', JSON.stringify(newState));
                        if (!newState) setIsDetailViewOpen(false);
                    }}
                >
                    <CreditCard className="w-4 h-4 mr-2" style={iconStyle} />
                    {showDetailCard ? 'Disable Detail Card' : 'Enable Detail Card'}
                </DropdownMenuItem>

                <DataTableViewOptions
                    config={tableConfig}
                    mode="dialog"
                    showDetailCard={showDetailCard}
                    onShowDetailCardChange={(show) => {
                        setShowDetailCard(show);
                        localStorage.setItem('templates_showDetailCard', JSON.stringify(show));
                        if (!show) setIsDetailViewOpen(false);
                    }}
                    trigger={
                        <div
                            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer focus:outline-none"
                            style={itemStyle}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Settings className="mr-2 h-4 w-4" style={iconStyle} />
                            <span>Page Settings</span>
                        </div>
                    }
                />

                <DropdownMenuItem
                    className="cursor-pointer focus:outline-none"
                    style={itemStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onClick={handleExport}
                >
                    <FileDown className="w-4 h-4 mr-2" style={iconStyle} />
                    Export
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer focus:outline-none"
                    style={itemStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onClick={() => setIsImportOpen(true)}
                >
                    <FileUp className="w-4 h-4 mr-2" style={iconStyle} />
                    Import
                </DropdownMenuItem>
            </>
        );
    }, [tableConfig, selectedRows.size, setHeaderMenuItems, setHeaderActions, isQuickEditMode, filterRules.length, isDetailViewOpen, activeCompanyId]);

    // Extract column options for the filter
    // Extract column options for the filter
    const filterColumns = useMemo(() => {
        if (!tableConfig.sortedColumns) return [];
        return tableConfig.sortedColumns
            .filter(col => col.id !== 'select' && col.id !== 'actions' && col.isVisible)
            .filter(col => col.id !== 'select' && col.id !== 'actions')
            .map(col => ({
                id: col.id,
                label: col.label
            }));
    }, [tableConfig.sortedColumns]);

    const handleCardAction = (actionId: string, item: any) => {
        const action = tableConfig.config?.actions?.find(a => a.id === actionId);
        switch (actionId) {
            case 'view':
                // Already in view
                break;
            case 'edit':
                handleEditRow(item);
                break;
            case 'delete':
                handleDeleteRow(item.id, item.name);
                break;
            case 'email':
                if (item.email) window.location.href = `mailto:${item.email}`;
                else if (item.emails?.[0]?.value) window.location.href = `mailto:${item.emails[0].value}`;
                break;
            case 'call':
                if (item.phone) window.location.href = `tel:${item.phone}`;
                else if (item.phones?.[0]?.value) window.location.href = `tel:${item.phones[0].value}`;
                break;
            default:
                if (action?.customUrl) {
                    window.open(action.customUrl.replace('{id}', item.id), '_blank');
                }
                break;
        }
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
                <div className={`flex-1 min-w-0 transition-all duration-300`}>
                    <DataTable
                        data={filteredData}
                        config={tableConfig}
                        columns={columns}
                        isAllSelected={tableData.length > 0 && selectedRows.size === tableData.length}
                        onSelectAll={toggleAll}
                        onRowClick={handleRowClick}
                    />
                </div>
                {/* Side Panel for Split View */}
                {isDetailViewOpen && (
                    <div
                        className="relative bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 z-20 flex"
                        style={{ width: `${panelWidth}px`, transition: isResizing ? 'none' : 'width 0.3s ease' }}
                    >
                        <div
                            className="w-1.5 h-full bg-slate-200 dark:bg-slate-700 hover:bg-blue-400 dark:hover:bg-blue-600 cursor-ew-resize flex items-center justify-center shrink-0 transition-colors z-30"
                            onMouseDown={startResizing}
                        />

                        <div className="flex-1 flex flex-col overflow-hidden relative bg-white dark:bg-slate-900">
                            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                                {activeCompany ? (
                                    <div className="h-full flex flex-col">
                                        <div className="shrink-0">
                                            <AboutCardDetails
                                                company={activeCompany}
                                                detailLayout={tableConfig.config?.entityConfig?.detailLayout}
                                                detailStyles={tableConfig.config?.entityConfig?.detailStyles}
                                                buttonStyles={tableConfig.config?.entityConfig?.buttonStyles}
                                                columns={tableConfig.config?.columns}
                                                actions={tableConfig.config?.actions}
                                                onAction={handleCardAction}
                                                hiddenLabels={tableConfig.config?.entityConfig?.hiddenLabels}
                                            />
                                        </div>

                                        <div className="p-0 bg-slate-50 dark:bg-slate-900/50 flex-1">
                                            <div className="p-6 space-y-6">
                                                {(tableConfig.config?.entityConfig?.cardsLayout || ['tasks', 'notes', 'files']).map(cardId => {
                                                    switch (cardId) {
                                                        case 'tasks':
                                                            return (
                                                                <div key="tasks" className="h-[500px]">
                                                                    <TasksCard />
                                                                </div>
                                                            );
                                                        case 'notes':
                                                            return (
                                                                <div key="notes" className="h-[500px]">
                                                                    <NotesCard />
                                                                </div>
                                                            );
                                                        case 'files':
                                                            return (
                                                                <div key="files" className="h-[500px]">
                                                                    <FilesCard />
                                                                </div>
                                                            );
                                                        default:
                                                            return null;
                                                    }
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500 py-20">Select an item to view details</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between py-4 text-xs text-slate-500 shrink-0">
                <div>Showing {filteredData.length} of {tableData.length} Results</div>
                <div className="flex-1 mx-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 w-full" />
                </div>
            </div>

            <ImportCompaniesDialog
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
                onImport={handleImportFile}
            />

            <GenericEntityDialog
                open={isAddCompanyOpen}
                onOpenChange={(open) => { setIsAddCompanyOpen(open); if (!open) setEditingCompany(null); }}
                onSubmit={handleSaveCompany}
                initialData={editingCompany}
                entityConfig={tableConfig.config?.entityConfig || { singularName: 'Item', pluralName: 'Items', layout: [] }}
            />

            <AdvancedFilterSheet
                isOpen={isFilterOpen}
                onOpenChange={setIsFilterOpen}
                columns={filterColumns}
                onApply={(rules, type) => {
                    setFilterRules(rules);
                    setFilterMatchType(type);
                }}
                initialRules={filterRules}
                initialMatchType={filterMatchType}
            />

            <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            {deleteConfirm.type === 'bulk'
                                ? `Are you sure you want to delete ${selectedRows.size} selected items?`
                                : `Are you sure you want to delete "${typeof deleteConfirm.name === 'object' ? (deleteConfirm.name as any)?.value || JSON.stringify(deleteConfirm.name) : deleteConfirm.name}"?`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="action" onClick={() => setDeleteConfirm(prev => ({ ...prev, open: false }))}>Cancel</Button>
                        <Button variant="tertiary" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
