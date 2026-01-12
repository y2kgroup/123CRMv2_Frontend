'use client';

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash2, Filter, X } from 'lucide-react';
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
import Papa from 'papaparse';

const defaultColumns = [
    { id: 'select', label: '', isMandatory: true, style: { alignment: 'center' } }, // Center alignment for checkbox
    { id: 'id', label: 'ID', isMandatory: true },
    { id: 'name', label: 'COMPANY NAME', isMandatory: true },
    { id: 'owner', label: 'OWNER' },
    { id: 'industry', label: 'INDUSTRY' },
    { id: 'website', label: 'WEBSITE' },
    { id: 'services', label: 'SERVICES' },
    { id: 'email', label: 'EMAIL' },
    { id: 'phone', label: 'PHONE' },
    { id: 'address', label: 'ADDRESS' },
    { id: 'createdBy', label: 'CREATED BY' },
    { id: 'createdAt', label: 'CREATED AT' },
    { id: 'editedBy', label: 'EDITED BY' },
    { id: 'editedAt', label: 'EDITED AT' },
    { id: 'actions', label: 'ACTIONS', isMandatory: true },
];

export default function CompaniesPage() {
    const { theme: currentMode, customTheme } = useLayout();
    const activeTheme = currentMode === 'dark' ? customTheme.dark : customTheme.light;
    const actionButtonStyles = activeTheme.buttons.action;

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

    const handleCellChange = (id: string, field: string, value: any) => {
        setTableData(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    // --- Column Definitions ---
    const columns = useMemo(() => ({
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
                <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full px-3">
                    {item.industry}
                </Badge>
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
                <div className="flex gap-1 flex-wrap">
                    {item.services?.map((s: string, i: number) => (
                        <Badge key={i} variant="secondary" className="font-normal bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
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
                    onChange={(e) => handleCellChange(item.id, 'phone', e.target.value)}
                    className="h-8"
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
                <button
                    className="h-8 w-8 p-0 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    onClick={(e) => { e.stopPropagation(); /* Detail Logic */ }}
                >
                    <Eye className="h-4 w-4 text-slate-500" />
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
                        <DropdownMenuItem onClick={() => handleDeleteRow(item.id, item.name)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 cursor-pointer">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        ),
    }), [selectedRows, tableData, isQuickEditMode]);

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
                >
                    <CreditCard className="w-4 h-4 mr-2" style={iconStyle} />
                    Detail Card
                </DropdownMenuItem>

                <DataTableViewOptions
                    config={tableConfig}
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
    }, [tableConfig, selectedRows.size, setHeaderMenuItems, setHeaderActions, isQuickEditMode, filterRules.length]);

    // Extract column options for the filter
    const filterColumns = useMemo(() => [
        { id: 'name', label: 'Company Name' },
        { id: 'email', label: 'Contact Email' },
        { id: 'phone', label: 'Phone' },
        { id: 'website', label: 'Website' },
        { id: 'address', label: 'Address' },
        { id: 'owner', label: 'Owner' },
        { id: 'industry', label: 'Industry' },
    ], []);

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex-1 min-h-0">
                <DataTable
                    data={filteredData}
                    config={tableConfig}
                    columns={columns}
                    isAllSelected={tableData.length > 0 && selectedRows.size === tableData.length}
                    onSelectAll={toggleAll}
                />
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
        </div>
    );
}
