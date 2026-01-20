'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash2, Filter, X } from 'lucide-react';
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
import { AboutCard, AboutCardHeader, AboutCardDetails } from "@/components/companies/detail/AboutCard";
import { TasksCard } from '@/components/companies/detail/TasksCard';
import { NotesCard } from '@/components/companies/detail/NotesCard';
import { FilesCard } from '@/components/companies/detail/FilesCard';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Papa from 'papaparse';
import { MultiSelect } from '@/components/ui/multi-select';

// Requested specific columns only
const defaultColumns = [
    { id: 'select', label: 'Select', isMandatory: true, style: { alignment: 'center' } },
    { id: 'createdBy', label: 'Created By' },
    { id: 'createdAt', label: 'Created At' },
    { id: 'editedBy', label: 'Edited By' },
    { id: 'editedAt', label: 'Edited At' },
    { id: 'actions', label: 'Actions', isMandatory: true },
];

// Reusing AddressCell helper for consistency if needed in future, though not in current columns
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

export default function TemplatesPage() {
    const router = useRouter();
    const { theme: currentMode, customTheme } = useLayout();
    const activeTheme = currentMode === 'dark' ? customTheme.dark : customTheme.light;
    const actionButtonStyles = activeTheme.buttons.action;

    // --- Table Config ---
    const tableConfig = useTableConfig({
        tableId: 'templates-data-table',
        defaultColumns: defaultColumns
    });

    const [tableData, setTableData] = React.useState<any[]>(() => {
        return Array.from({ length: 50 }).map((_, i) => ({
            id: `TMP${(10000000 + i).toString()}`,
            name: i < 5 ? ['Template A', 'Template B', 'Template C', 'Template D', 'Template E'][i] : `Template ${i + 1}`,
            owner: i < 5 ? ['John Doe', 'Jane Smith', 'Harry Green', 'Peter Gibbons', 'Albert Wesker'][i] : `Owner ${i + 1}`,
            industry: 'Technology',
            website: `www.template${i + 1}.com`,
            services: ['Service A', 'Service B'],
            email: `contact@template${i + 1}.com`,
            phone: `+1 555-01${(i + 1).toString().padStart(2, '0')}`,
            address: `${i * 10} Market St, City, ST`,
            createdBy: 'System',
            createdAt: '01/01/2023',
            editedBy: 'Admin',
            editedAt: '01/05/2023'
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
            createdAt: (item: any) => item ? <span className="text-slate-500">{item.createdAt}</span> : null,
            editedBy: (item: any) => item ? <span className="text-slate-500">{item.editedBy}</span> : null,
            editedAt: (item: any) => item ? <span className="text-slate-500">{item.editedAt}</span> : null,
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
                                onClick={() => { setActiveCompanyId(item.id); setIsDetailViewOpen(true); }}
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
            // Minimal fallbacks for other columns if user adds them back via config
            id: (item: any) => <span className="font-mono text-xs text-slate-500">{item.id}</span>,
            name: (item: any) => <span className="font-medium text-slate-900 dark:text-slate-100">{item.name}</span>,
        };

        // Add Custom Columns
        if (tableConfig.config?.columns) {
            Object.values(tableConfig.config.columns).forEach((col) => {
                if (!baseColumns[col.id]) {
                    baseColumns[col.id] = (item: any) => {
                        const val = item[col.id];
                        if (!val && val !== 0) return <span className="text-slate-400 italic text-xs">Empty</span>;
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
        const newEntry = {
            id: companyData.id,
            name: companyData.name,
            owner: companyData.owner,
            industry: companyData.industry,
            website: companyData.website,
            services: companyData.services,
            email: companyData.emails?.[0]?.value || '',
            phone: companyData.phones?.[0]?.value || '',
            address: companyData.addresses?.[0]?.value || '',
            createdBy: 'System',
            createdAt: new Date().toLocaleDateString(),
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
        const csv = Papa.unparse(tableData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'templates_export.csv');
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
                    Add Item
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
    const filterColumns = useMemo(() => [
        { id: 'createdBy', label: 'Created By' },
        { id: 'editedBy', label: 'Edited By' },
        { id: 'name', label: 'Name' } // Include name in filters just in case
    ], []);

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
                            {activeCompany && (
                                <div className="shrink-0 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                                    <AboutCardHeader company={activeCompany} />
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                                {activeCompany ? (
                                    <div className="h-full flex flex-col">
                                        <div className="shrink-0">
                                            <AboutCardDetails company={activeCompany} />
                                        </div>

                                        <div className="p-0 bg-slate-50 dark:bg-slate-900/50 flex-1">
                                            <div className="p-6 space-y-6">
                                                <div className="h-[500px]">
                                                    <TasksCard />
                                                </div>
                                                <div className="h-[500px]">
                                                    <NotesCard />
                                                </div>
                                                <div className="h-[500px]">
                                                    <FilesCard />
                                                </div>
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

            <AddCompanyDialog
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
                                ? `Are you sure you want to delete ${selectedRows.size} selected items?`
                                : `Are you sure you want to delete "${deleteConfirm.name}"?`
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
