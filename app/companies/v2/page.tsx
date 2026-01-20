'use client';

import React, { useState, useMemo } from 'react';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useTableConfig } from '@/components/ui/data-table/useTableConfig';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { DataTableViewOptions } from '@/components/ui/data-table/DataTableViewOptions';
import { DataTableFacetedFilter } from '@/components/ui/data-table/DataTableFacetedFilter';
import { CompanyDetailCard } from '@/components/companies/CompanyDetailCard';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLayout } from '@/components/layout/LayoutContext';

// --- Mock Data Generator ---
const industries = ["Technology", "Logistics", "Finance", "Energy", "Healthcare", "Real Estate", "Manufacturing", "Retail", "Consulting", "Media", "Transportation", "Food & Beverage"];
const servicesOptions = ["Cloud Services", "Freight Forwarding", "Audit & Tax", "Renewable Energy", "Medical Supplies", "Commercial Leasing", "Prototyping", "E-commerce", "Strategy", "Digital Marketing", "Software Dev", "Catering"];
const creScores = ["S", "A", "B", "C", "D"];

const generateCompanies = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `COM${Math.floor(Math.random() * 90000000) + 10000000}`,
        name: `Company ${i + 1}`, // In a real app, use faker
        owner: ["John Smith", "Emily Johnson", "Michael Brown", "Sarah Davis", "David Wilson", "Jessica Miller", "Robert Taylor", "Jennifer Anderson", "William Thomas", "Lisa Martinez", "Richard Hernandez", "Mary Robinson", "Joseph Clark", "Patricia Rodriguez", "Charles Lewis"][i % 15],
        email: `contact@company${i + 1}.com`,
        phone: `555-01${10 + (i % 90)}-${1000 + i}`,
        address: `${100 + i} Market St, New York`,
        industry: industries[i % industries.length],
        website: `www.company${i + 1}.com`,
        services: [servicesOptions[i % servicesOptions.length]],
        cre: creScores[i % creScores.length],
        // status: ... // Removed as per screenshot not showing it explicitly as a main column, replaced by CRE or Industry Type
    }));
};

const initialData = generateCompanies(50);

const defaultColumns = [
    { id: 'id', label: 'ID', isMandatory: true },
    { id: 'name', label: 'COMPANY NAME', isMandatory: true },
    { id: 'owner', label: 'OWNER' },
    { id: 'email', label: 'EMAIL' },
    { id: 'phone', label: 'PHONE' },
    { id: 'address', label: 'ADDRESS' },
    { id: 'industry', label: 'INDUSTRY TYPE' },
    { id: 'website', label: 'WEBSITE' },
    { id: 'services', label: 'SERVICES' },
    { id: 'cre', label: 'CRE' },
    { id: 'actions', label: 'ACTION', isMandatory: true },
];

export default function CompaniesPage() {
    const { theme: currentMode, customTheme } = useLayout();
    const activeTheme = currentMode === 'dark' ? customTheme.dark : customTheme.light;
    const actionButtonStyles = activeTheme.buttons.action;
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [industryFilter, setIndustryFilter] = useState<Set<string>>(new Set());

    // --- Table Config ---
    const tableConfig = useTableConfig({
        tableId: 'companies-v2',
        defaultColumns: defaultColumns
    });

    // --- Filtering & Sorting Data ---
    const filteredData = useMemo(() => {
        let data = [...initialData];

        // 1. Search
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            data = data.filter(c =>
                c.name.toLowerCase().includes(lower) ||
                c.id.toLowerCase().includes(lower) ||
                c.owner.toLowerCase().includes(lower)
            );
        }

        // 2. Faceted Filters
        if (industryFilter.size > 0) {
            data = data.filter(c => industryFilter.has(c.industry));
        }

        // 3. Sorting
        const { sort } = tableConfig.config || { sort: { key: null, direction: null } };
        if (sort.key && sort.direction) {
            data.sort((a, b) => {
                // @ts-ignore
                const valA = a[sort.key];
                // @ts-ignore
                const valB = b[sort.key];

                if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [initialData, searchQuery, industryFilter, tableConfig.config?.sort]);

    const selectedCompany = useMemo(() =>
        initialData.find(c => c.id === selectedCompanyId),
        [selectedCompanyId]);

    // --- Column Definitions ---
    // These render functions map to the IDs in defaultColumns
    // --- Column Definitions ---
    // These render functions map to the IDs in defaultColumns
    const columns = useMemo(() => ({
        id: (item: any) => <span className="font-mono text-xs text-slate-500">{item.id}</span>,
        name: (item: any) => (
            <div className="flex items-center gap-2">
                <div className={`h-6 w-6 rounded-xs flex items-center justify-center text-[10px] font-bold ${['bg-red-100 text-red-600', 'bg-green-100 text-green-600', 'bg-blue-100 text-blue-600', 'bg-orange-100 text-orange-600', 'bg-purple-100 text-purple-600'][item.id.length % 5]
                    }`}>
                    {item.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{item.name}</span>
            </div>
        ),
        owner: (item: any) => <span className="text-slate-600 dark:text-slate-400">{item.owner}</span>,
        email: (item: any) => (
            <div className="flex items-center gap-1.5 text-blue-600">
                <div className="h-4 w-4 bg-orange-400 rounded-full flex items-center justify-center text-[10px] text-white font-bold">W</div>
                <a href={`mailto:${item.email}`} onClick={e => e.stopPropagation()} className="hover:underline">{item.email}</a>
            </div>
        ),
        phone: (item: any) => (
            <div className="flex items-center gap-1.5 text-slate-500">
                <div className="h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] text-white font-bold">M</div>
                <span>{item.phone}</span>
            </div>
        ),
        address: (item: any) => (
            <div className="flex items-center gap-1.5 text-slate-500">
                <div className="h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] text-white font-bold">W</div>
                <span>{item.address}</span>
            </div>
        ),
        industry: (item: any) => (
            <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full px-3">
                {item.industry}
            </Badge>
        ),
        website: (item: any) => <a href={`https://${item.website}`} className="text-blue-600 hover:underline" onClick={e => e.stopPropagation()}>{item.website}</a>,
        services: (item: any) => (
            <div className="flex gap-1 flex-wrap">
                {item.services.map((s: string, i: number) => (
                    <Badge key={i} variant="secondary" className="font-normal bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
                        {s}
                    </Badge>
                ))}
            </div>
        ),
        cre: (item: any) => (
            <div className="h-6 w-6 rounded-full border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 bg-slate-50">
                {item.cre}
            </div>
        ),
        actions: (item: any) => (
            <div className="flex items-center gap-1 text-slate-400">
                <Button variant="tertiary" className="h-7 w-7 p-0 bg-transparent hover:bg-slate-100 rounded-full"><div className="w-4 h-4 text-slate-400">✎</div></Button>
                <Button variant="tertiary" className="h-7 w-7 p-0 bg-transparent hover:bg-slate-100 rounded-full"><div className="w-4 h-4 text-slate-400">⎙</div></Button>
                <Button variant="tertiary" className="h-7 w-7 p-0 bg-transparent hover:bg-slate-100 rounded-full"><div className="w-4 h-4 text-slate-400">…</div></Button>
            </div>
        )
    }), []);

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-black/20 -m-6">
            {/* Header / Toolbar */}
            {/* Header / Toolbar */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2329] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search companies..."
                            className="pl-9 h-9 border-slate-200 dark:border-slate-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <DataTableViewOptions config={tableConfig} />
                    <Button
                        className="h-9 gap-1 px-3 py-1 text-xs"
                        style={{
                            backgroundColor: actionButtonStyles.bg,
                            color: actionButtonStyles.text,
                            borderColor: actionButtonStyles.border,
                            borderWidth: actionButtonStyles.borderWidth
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        Add Company
                    </Button>
                </div>
            </div>

            {/* Split View Content */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup orientation="horizontal">
                    {/* Left Panel: Table */}
                    <ResizablePanel defaultSize={selectedCompanyId ? 70 : 100} minSize={30}>
                        <div className="h-full overflow-y-auto p-6">
                            <DataTable
                                data={filteredData}
                                config={tableConfig}
                                columns={columns}
                                onRowClick={(item) => setSelectedCompanyId(item.id)}
                            />
                        </div>
                    </ResizablePanel>

                    {/* Resize Handle */}
                    {selectedCompanyId && <ResizableHandle withHandle />}

                    {/* Right Panel: Detail */}
                    {selectedCompanyId && (
                        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                            <div className="h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2329] overflow-y-auto">
                                <CompanyDetailCard
                                    company={selectedCompany}
                                    onClose={() => setSelectedCompanyId(null)}
                                />
                            </div>
                        </ResizablePanel>
                    )}
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
