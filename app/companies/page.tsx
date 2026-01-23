/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Filter, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { MoreVertical, Settings, FileDown, FileUp, CreditCard, Pencil, Eye } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ImportCompaniesDialog } from '@/components/companies/ImportCompaniesDialog';
import { AddCompanyDialog } from '@/components/companies/AddCompanyDialog';
import { AdvancedFilterSheet, FilterRule, MatchType } from '@/components/companies/AdvancedFilterSheet';
import { AboutCardDetails } from "@/components/companies/detail/AboutCard";
import { TasksCard } from '@/components/companies/detail/TasksCard';
import { NotesCard } from '@/components/companies/detail/NotesCard';
import { FilesCard } from '@/components/companies/detail/FilesCard';

import Papa from 'papaparse';
import { MultiSelect } from '@/components/ui/multi-select';

export const defaultColumns = [
    { id: 'select', label: 'Select', isMandatory: true, style: { alignment: 'center' } }, // Center alignment for checkbox
    { id: 'id', label: 'ID', isMandatory: true },
    { id: 'name', label: 'Company Name', isMandatory: true },
    { id: 'owner', label: 'Owner' },
    { id: 'industry', label: 'Industry', type: 'badge' as const },
    { id: 'website', label: 'Website' },
    { id: 'services', label: 'Services', type: 'badge' as const },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'address', label: 'Address' },
    { id: 'createdBy', label: 'Created By' },
    { id: 'createdAt', label: 'Created At' },
    { id: 'editedBy', label: 'Edited By' },
    { id: 'editedAt', label: 'Edited At' },
    { id: 'actions', label: 'Actions', isMandatory: true },
];

// --- Helper Components ---

function AddressCell({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    React.useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps && inputRef.current) {
            try {
                const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
                    types: ['address'],
                });
                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place && place.formatted_address) {
                        onChange(place.formatted_address);
                    }
                });
            } catch (e) {
                console.warn('Google Maps Autocomplete failed to init', e);
            }
        }
    }, [onChange]);

    // Mock suggestions when Google is not available
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);

        if (!((window as any).google && (window as any).google.maps)) {
            if (val.length > 2) {
                // Mock Data
                const mock = [
                    `${val} St, New York, NY`,
                    `${val} Ave, Los Angeles, CA`,
                    `123 ${val} Blvd, Miami, FL`,
                    `${val} Rd, London, UK`
                ];
                setSuggestions(mock);
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
        }
    };

    return (
        <div className="relative">
            <Input
                ref={inputRef}
                value={value}
                onChange={handleInputChange}
                className="h-8 min-w-[150px]"
                placeholder="Search Place..."
                onClick={(e) => e.stopPropagation()}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border rounded-md shadow-lg max-h-40 overflow-auto">
                    {suggestions.map((s, i) => (
                        <div
                            key={i}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-xs"
                            onClick={() => {
                                onChange(s);
                                setShowSuggestions(false);
                            }}
                        >
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CompaniesPage() {
    const router = useRouter();
    const { theme: currentMode, customTheme } = useLayout();
    const activeTheme = currentMode === 'dark' ? customTheme.dark : customTheme.light;

    // --- Table Config ---
    const tableConfig = useTableConfig({
        tableId: 'companies-updated',
        defaultColumns: defaultColumns
    });

    const [tableData, setTableData] = React.useState<any[]>(() => {
        return Array.from({ length: 50 }).map((_, i) => ({
            id: `COM${(10000000 + i).toString()}`,
            name: i < 5 ? ['Acme Corp', 'Globex Corporation', 'Soylent Corp', 'Initech', 'Umbrella Corp'][i] : `Company ${i + 1}`,
            owner: i < 5 ? ['John Doe', 'Jane Smith', 'Harry Green', 'Peter Gibbons', 'Albert Wesker'][i] : `Owner ${i + 1}`,
            industry: i < 5 ? ['Technology', 'Manufacturing', 'Food & Beverage', 'Software', 'Pharmaceuticals'][i] : 'Technology',
            website: `www.company${i + 1}.com`,
            services: ['Service A', 'Service B'],
            email: `contact@company${i + 1}.com`,
            phone: `+1 555-01${(i + 1).toString().padStart(2, '0')}`,
            address: `${i * 10} Market St, City, ST`,
            createdBy: 'System',
            createdAt: '01/01/2023',
            editedBy: '',
            editedAt: ''
        }));
    });

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
            // Also unselect it if it was selected
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

                    // If no column selected, ignore rule (or treat as true)
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
    const [showDetailCard, setShowDetailCard] = React.useState(false); // Toggle state for Row Click behavior

    // Load persisted setting
    React.useEffect(() => {
        const saved = localStorage.getItem('companies_showDetailCard');
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
            // View Mode: OPEN CARD
            setActiveCompanyId(item.id);
            setIsDetailViewOpen(true);
        } else {
            // View Mode: NAVIGATE (Default)
            router.push(`/companies/company-detail?id=${item.id}`);
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
            id: (item: any) => <span className="font-mono text-xs text-slate-500">{item.id}</span>,
            name: (item: any) => (
                isQuickEditMode ? (
                    <Input
                        value={item.name}
                        onChange={(e) => handleCellChange(item.id, 'name', e.target.value)}
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{item.name}</span>
                    </div>
                )
            ),
            owner: (item: any) => (
                isQuickEditMode ? (
                    <Input
                        value={item.owner}
                        onChange={(e) => handleCellChange(item.id, 'owner', e.target.value)}
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className="text-slate-600 dark:text-slate-400">{item.owner}</span>
                )
            ),
            industry: (item: any) => (
                isQuickEditMode ? (
                    <Input
                        value={item.industry}
                        onChange={(e) => handleCellChange(item.id, 'industry', e.target.value)}
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <Badge
                        variant="secondary"
                        className="font-normal rounded-full px-3"
                        style={{
                            backgroundColor: tableConfig.config?.columns['industry']?.badgeStyle?.backgroundColor || '#f1f5f9', // slate-100
                            color: tableConfig.config?.columns['industry']?.badgeStyle?.textColor || '#334155', // slate-700
                            fontSize: tableConfig.config?.columns['industry']?.badgeStyle?.textSize === 'xs' ? '0.75rem' : tableConfig.config?.columns['industry']?.badgeStyle?.textSize === 'sm' ? '0.875rem' : '1rem',
                            fontWeight: tableConfig.config?.columns['industry']?.badgeStyle?.fontWeight || 'normal',
                            fontFamily: tableConfig.config?.columns['industry']?.badgeStyle?.fontFamily
                        }}
                    >
                        {item.industry}
                    </Badge >
                )
            ),
            website: (item: any) => (
                isQuickEditMode ? (
                    <Input
                        value={item.website}
                        onChange={(e) => handleCellChange(item.id, 'website', e.target.value)}
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <a href={`https://${item.website}`} className="text-blue-600 hover:underline" onClick={e => e.stopPropagation()}>{item.website}</a>
                )
            ),
            services: (item: any) => (
                isQuickEditMode ? (
                    <Input
                        value={item.services?.join(', ') || ''}
                        onChange={(e) => handleCellChange(item.id, 'services', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div className="flex gap-1 flex-wrap" style={{ justifyContent: tableConfig.config?.columns['services']?.badgeStyle?.alignment === 'center' ? 'center' : tableConfig.config?.columns['services']?.badgeStyle?.alignment === 'right' ? 'flex-end' : 'flex-start' }}>
                        {item.services?.map((s: string, i: number) => (
                            <Badge
                                key={i}
                                variant="secondary"
                                className="font-normal rounded-full transition-colors"
                                style={{
                                    backgroundColor: tableConfig.config?.columns['services']?.badgeStyle?.backgroundColor || '#e0e7ff',
                                    color: tableConfig.config?.columns['services']?.badgeStyle?.textColor || '#4338ca', // Fallback to indigo-700
                                    fontSize: tableConfig.config?.columns['services']?.badgeStyle?.textSize === 'xs' ? '0.75rem' : tableConfig.config?.columns['services']?.badgeStyle?.textSize === 'sm' ? '0.875rem' : '1rem',
                                    fontWeight: tableConfig.config?.columns['services']?.badgeStyle?.fontWeight || 'normal',
                                    fontFamily: tableConfig.config?.columns['services']?.badgeStyle?.fontFamily
                                }}
                            >
                                {s}
                            </Badge>
                        ))}
                    </div>
                )
            ),
            email: (item: any) => (
                isQuickEditMode ? (
                    <Input
                        value={item.email}
                        onChange={(e) => handleCellChange(item.id, 'email', e.target.value)}
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div className="flex items-center gap-1.5 text-blue-600">
                        <a href={`mailto:${item.email}`} onClick={e => e.stopPropagation()} className="hover:underline">{item.email}</a>
                    </div>
                )
            ),
            phone: (item: any) => (
                isQuickEditMode ? (
                    <Input
                        value={item.phone}
                        onChange={(e) => {
                            // Phone formatting: (xxx) xxx-xxxx or xxx-xxx-xxxx
                            // User asked for xxx-xxx-xxxx
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length > 10) val = val.slice(0, 10);
                            if (val.length > 6) val = `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6)}`;
                            else if (val.length > 3) val = `${val.slice(0, 3)}-${val.slice(3)}`;
                            handleCellChange(item.id, 'phone', val);
                        }}
                        className="h-8"
                        placeholder="xxx-xxx-xxxx"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className="text-slate-500">{item.phone}</span>
                )
            ),
            address: (item: any) => (
                isQuickEditMode ? (
                    <Input
                        value={item.address}
                        onChange={(e) => handleCellChange(item.id, 'address', e.target.value)}
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className="text-slate-500">{item.address}</span>
                )
            ),
            createdBy: (item: any) => <span className="text-slate-500">{item.createdBy}</span>,
            createdAt: (item: any) => <span className="text-slate-500">{item.createdAt}</span>,
            editedBy: (item: any) => <span className="text-slate-500">{item.editedBy}</span>,
            editedAt: (item: any) => <span className="text-slate-500">{item.editedAt}</span>,
            actions: (item: any) => (
                <div className="flex items-center gap-2 justify-end">
                    <button
                        className="h-8 w-8 p-0 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleEditRow(item); }}
                    >
                        <Pencil className="h-4 w-4 text-slate-500" />
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button
                                className="h-8 w-8 p-0 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <MoreVertical className="h-4 w-4 text-slate-500" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        >
                            <DropdownMenuItem
                                onClick={() => router.push(`/companies/company-detail?id=${item.id}`)}
                                className="cursor-pointer"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteRow(item.id, item.name)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 cursor-pointer">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        };

        // Add Custom Columns
        if (tableConfig.config?.columns) {
            Object.values(tableConfig.config.columns).forEach((col) => {
                // If column exists in config but not in baseColumns, it's a custom column
                if (!baseColumns[col.id]) {
                    baseColumns[col.id] = (item: any) => {
                        const val = item[col.id];

                        // --- EDIT MODE ---
                        if (isQuickEditMode) {
                            // Badge with Options -> Treat like Select
                            if ((col.type === 'select' || col.type === 'badge') && col.dropdownOptions && col.dropdownOptions.length > 0) {
                                if (col.isMultiSelect) {
                                    return (
                                        <MultiSelect
                                            options={col.dropdownOptions}
                                            value={Array.isArray(val) ? val : (val ? [String(val)] : [])}
                                            onChange={(newValue) => handleCellChange(item.id, col.id, newValue)}
                                            badgeStyle={{
                                                backgroundColor: col.badgeStyle?.backgroundColor || '#f1f5f9',
                                                color: col.badgeStyle?.textColor || '#334155',
                                                fontSize: col.badgeStyle?.textSize === 'xs' ? '0.75rem' : col.badgeStyle?.textSize === 'sm' ? '0.875rem' : '1rem',
                                                fontWeight: col.badgeStyle?.fontWeight || 'normal',
                                                fontFamily: col.badgeStyle?.fontFamily
                                            }}
                                        />
                                    );
                                }

                                return (
                                    <Select
                                        value={val || ''}
                                        onValueChange={(newValue) => handleCellChange(item.id, col.id, newValue)}
                                    >
                                        <SelectTrigger className="h-8 min-w-[120px]">
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {col.dropdownOptions.map((opt: string) => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                );
                            }

                            if (col.type === 'address') {
                                return (
                                    <AddressCell
                                        value={val || ''}
                                        onChange={(newVal) => handleCellChange(item.id, col.id, newVal)}
                                    />
                                );
                            }

                            if (col.type === 'phone') {
                                return (
                                    <Input
                                        value={val || ''}
                                        onChange={(e) => {
                                            let v = e.target.value.replace(/\D/g, '');
                                            if (v.length > 10) v = v.slice(0, 10);
                                            if (v.length > 6) v = `${v.slice(0, 3)}-${v.slice(3, 6)}-${v.slice(6)}`;
                                            else if (v.length > 3) v = `${v.slice(0, 3)}-${v.slice(3)}`;
                                            handleCellChange(item.id, col.id, v);
                                        }}
                                        className="h-8 min-w-[100px]"
                                        placeholder="xxx-xxx-xxxx"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                );
                            }

                            if (col.type === 'date') {
                                // Ensure value is YYYY-MM-DD for input type="date"
                                // If mock data is MM/DD/YYYY, we need to convert it.
                                // Assuming mock data might be dynamic, safe parsing is needed.
                                const rawVal = val ? String(val) : '';
                                let dateVal = rawVal;

                                // Simple check if it looks like MM/DD or MM/DD/YYYY and convert to YYYY-MM-DD
                                if (rawVal.includes('/')) {
                                    const parts = rawVal.split('/');
                                    if (parts.length === 2) {
                                        // MM/DD -> assume current year
                                        const date = new Date();
                                        dateVal = `${date.getFullYear()}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                                    } else if (parts.length === 3) {
                                        // MM/DD/YYYY -> YYYY-MM-DD
                                        dateVal = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                                    }
                                }

                                return (
                                    <div className="relative w-full h-8" onClick={(e) => {
                                        e.stopPropagation();
                                        const input = e.currentTarget.querySelector('input');
                                        if (input) {
                                            try {
                                                if (input.showPicker) input.showPicker();
                                                else input.focus();
                                            } catch (err) { input.focus(); }
                                        }
                                    }}>
                                        <Input
                                            type="date"
                                            value={dateVal}
                                            onChange={(e) => handleCellChange(item.id, col.id, e.target.value)}
                                            className="h-8 min-w-[100px] w-full cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Try to force picker again on direct click
                                                try {
                                                    if (e.currentTarget.showPicker) e.currentTarget.showPicker();
                                                } catch (e) { }
                                            }}
                                        />
                                    </div>
                                );
                            }

                            if (col.type === 'currency') {
                                return (
                                    <Input
                                        value={val || ''}
                                        onChange={(e) => {
                                            // Allow only numbers and decimals
                                            const v = e.target.value;
                                            if (/^[\d\.,$]*$/.test(v)) {
                                                handleCellChange(item.id, col.id, v);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            // Format on blur
                                            const raw = e.target.value.replace(/[^0-9.]/g, '');
                                            if (raw) {
                                                const formatted = Number(raw).toLocaleString('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                    minimumFractionDigits: 2
                                                });
                                                handleCellChange(item.id, col.id, formatted);
                                            }
                                        }}
                                        className="h-8 min-w-[100px]"
                                        placeholder="$0.00"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                );
                            }

                            return (
                                <Input
                                    value={val || ''}
                                    onChange={(e) => handleCellChange(item.id, col.id, e.target.value)}
                                    className="h-8 min-w-[100px]"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            );
                        }

                        // --- VIEW MODE ---
                        if (!val && val !== 0) return <span className="text-slate-400 italic text-xs">Empty</span>;

                        if (col.type === 'badge' || (col.type === 'select' && col.displayStyle === 'badge')) {
                            const badgeStyle = {
                                backgroundColor: col.badgeStyle?.backgroundColor || '#f1f5f9',
                                color: col.badgeStyle?.textColor || '#334155',
                                fontSize: col.badgeStyle?.textSize === 'xs' ? '0.75rem' : col.badgeStyle?.textSize === 'sm' ? '0.875rem' : '1rem',
                                fontWeight: col.badgeStyle?.fontWeight || 'normal',
                                fontFamily: col.badgeStyle?.fontFamily
                            };

                            if (Array.isArray(val)) {
                                return (
                                    <div className="flex gap-1 flex-wrap">
                                        {val.map((v, i) => (
                                            <Badge
                                                key={i}
                                                variant="secondary"
                                                className="font-normal rounded-full px-3"
                                                style={badgeStyle}
                                            >
                                                {v}
                                            </Badge>
                                        ))}
                                    </div>
                                );
                            }

                            return (
                                <Badge
                                    variant="secondary"
                                    className="font-normal rounded-full px-3"
                                    style={badgeStyle}
                                >
                                    {val}
                                </Badge>
                            );
                        }

                        if (col.type === 'currency') {
                            // Fix: Remove any non-numeric chars before formatting to ensure cleanliness, though val should be saved formatted.
                            // If val is "100", render "$100.00".
                            // If val is "$100.00", render as is or re-parse.
                            const numericVal = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, "")) : Number(val);
                            return <span className="text-slate-900 dark:text-slate-100 font-mono text-xs">
                                {isNaN(numericVal) ? val : numericVal.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
                            </span>;
                        }

                        return <span className="text-slate-600 dark:text-slate-400">{val}</span>;
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
        // Map form data to table row format if needed
        const newEntry = {
            id: companyData.id,
            name: companyData.name,
            owner: companyData.owner,
            industry: companyData.industry,
            website: companyData.website,
            services: companyData.services, // Array
            email: companyData.emails?.[0]?.value || '',
            phone: companyData.phones?.[0]?.value || '',
            address: companyData.addresses?.[0]?.value || '',
            createdBy: 'System',
            createdAt: new Date().toLocaleDateString(),
            editedBy: 'System', // Could be current user
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
                        id: row.id || row.ID || index + 1,
                        name: row.name || row.Name || row['Company Name'],
                        owner: row.owner || row.Owner,
                        industry: row.industry || row.Industry,
                        website: row.website || row.Website,
                        services: row.services ? row.services.split(',') : (row.Services ? row.Services.split(',') : []),
                        email: row.email || row.Email,
                        phone: row.phone || row.Phone,
                        address: row.address || row.Address,
                        createdBy: row.createdBy || 'System',
                        createdAt: row.createdAt || new Date().toLocaleDateString(),
                        editedBy: row.editedBy || '',
                        editedAt: row.editedAt || ''
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
        const csv = Papa.unparse(tableData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'companies_export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
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

        // Set Header Actions (Add Company Button & Delete Button)
        setHeaderActions(
            <div className="flex items-center gap-2">
                {selectedRows.size > 0 && (
                    <Button variant="tertiary" icon={Trash2} onClick={handleDelete}>
                        Delete
                    </Button>
                )}

                {/* Clear Filter Button */}
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
                    Add Company
                </Button>

                {/* Filter Button (Action) */}
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
                        localStorage.setItem('companies_showDetailCard', JSON.stringify(newState));
                        // If turning ON, we might want to open the view if a company is active, but let's just toggle the mode.
                        if (!newState) setIsDetailViewOpen(false); // Close if turning off? Optional.
                    }}
                >
                    <CreditCard className="w-4 h-4 mr-2" style={iconStyle} />
                    {showDetailCard ? 'Disable Detail Card' : 'Enable Detail Card'}
                </DropdownMenuItem>

                <DataTableViewOptions
                    config={tableConfig}
                    mode="dialog"
                    showDetailCard={showDetailCard}
                    onShowDetailCardChange={setShowDetailCard}
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
    const filterColumns = useMemo(() => {
        if (!tableConfig.sortedColumns) return [];
        return tableConfig.sortedColumns
            .filter(col => col.id !== 'select' && col.id !== 'actions' && col.isVisible) // Exclude system columns & hidden columns if desired, or allow filtering hidden ones. User said "all columns that we have on the table". Let's show visible ones or all? "Dynamic and get the column list of the page". Usually filtering hidden columns is useful. I'll include all non-system ones.
            .filter(col => col.id !== 'select' && col.id !== 'actions')
            .map(col => ({
                id: col.id,
                label: col.label
            }));
    }, [tableConfig.sortedColumns]);

    // Ensure menu item updates when state changes
    React.useEffect(() => {
        // This effect re-triggers the menu update when showDetailCard changes
    }, [showDetailCard]);

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
                        {/* Divider Handle */}
                        <div
                            className="w-1.5 h-full bg-slate-200 dark:bg-slate-700 hover:bg-blue-400 dark:hover:bg-blue-600 cursor-ew-resize flex items-center justify-center shrink-0 transition-colors z-30"
                            onMouseDown={startResizing}
                        >
                            {/* Visual Handle Grip (Optional, minimal look requested) */}
                        </div>

                        {/* Panel Content - Classic Clean (Flush) */}
                        <div className="flex-1 flex flex-col overflow-hidden relative bg-white dark:bg-slate-900">
                            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                                {activeCompany ? (
                                    <div className="h-full flex flex-col">
                                        <div className="shrink-0">
                                            <AboutCardDetails
                                                company={activeCompany}
                                                detailLayout={tableConfig.config?.entityConfig?.detailLayout}
                                                detailStyles={tableConfig.config?.entityConfig?.detailStyles}
                                                columns={tableConfig.config?.columns}
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
                                    <div className="text-center text-slate-500 py-20">Select a company to view details</div>
                                )}
                            </div>
                        </div>     {/* Footer Action Removed as per request */}
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

            <AddCompanyDialog
                key={editingCompany?.id || 'new-company'}
                open={isAddCompanyOpen}
                onOpenChange={(open) => { setIsAddCompanyOpen(open); if (!open) setEditingCompany(null); }}
                onSubmit={handleSaveCompany}
                initialData={editingCompany}
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
                                ? `Are you sure you want to delete ${selectedRows.size} selected companies? This action cannot be undone.`
                                : `Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`
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
