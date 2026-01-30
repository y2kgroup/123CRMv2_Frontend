'use server';

import fs from 'fs/promises';
import path from 'path';

export async function createPage(pagePath: string, title: string, template: 'default' | 'table' | 'detail' | 'data-table-template' = 'default') {
    if (!pagePath || !title) {
        return { success: false, message: 'Path and Title are required.' };
    }

    // Sanitize path: remove leading/trailing slashes, allow only safe chars
    const sanitizedPath = pagePath.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9\-\/]/gi, '');

    if (!sanitizedPath) {
        return { success: false, message: 'Invalid path.' };
    }

    // Determine target directory (check (modules) first)
    const modulesDir = path.join(process.cwd(), 'app', '(modules)');
    const rootDir = path.join(process.cwd(), 'app');

    // Split path to find root segment
    const parts = sanitizedPath.split('/');
    const rootSegment = parts[0];

    let targetBase = rootDir;

    // Check if the module exists in (modules)
    try {
        await fs.access(path.join(modulesDir, rootSegment));
        targetBase = modulesDir;
    } catch {
        // If not in (modules), stick to app root (or we could enforce creation in modules for new folders?)
        // For now, let's prefer (modules) for NEW top-level folders too if creation happens
        // But createPage implies folder might not exist.
        // Let's rely on createModule for creating the root segment.
        // If I am creating 'tasks/subpage', 'tasks' works.
        // If I am creating 'newpage', it goes to root app/newpage?
        // Let's enable (modules) preference.
        if (parts.length > 1) {
            // Subpage. Check root segment.
        }
    }

    // BETTER LOGIC: 
    // If we are nested, check where the parent is.
    // If top level, default to (modules) if it exists, otherwise keep old behavior?
    // Actually simplicity: usage of route groups implies grouping.
    // Let's construct the full path dynamically.

    let fullPath = path.join(rootDir, sanitizedPath);

    // Check if it exists in (modules) first to respect precedence
    const modulePath = path.join(modulesDir, sanitizedPath);
    // Or check if the root segment exists in modules
    try {
        await fs.access(path.join(modulesDir, rootSegment));
        // It exists in modules, so target modules
        fullPath = modulePath;
    } catch {
        // Does not exist in modules. 
        // If we are creating a fresh top-level page, do we want it in (modules)?
        // Probably yes for "clean explorer".
        // Let's force (modules) for pretty much everything except reserved names?
        // But user might want /about.
        // Let's check if (modules) dir itself exists.
        try {
            await fs.access(modulesDir);
            // (modules) system is active.
            // If path is not reserved, put it in (modules).
            const reserved = ['layout.tsx', 'page.tsx', 'loading.tsx', 'not-found.tsx', 'error.tsx', 'global-error.tsx', 'route.ts'];
            // These are files.

            // Let's assume if we are creating a FOLDER, it goes to (modules).
            fullPath = modulePath;
        } catch {
            // (modules) folder missing, use root
        }
    }

    const pageFile = path.join(fullPath, 'page.tsx');

    try {
        // Check if directory exists, if not create it
        await fs.mkdir(fullPath, { recursive: true });

        // Check if file already exists
        try {
            await fs.access(pageFile);
            return { success: false, message: 'Page already exists.' };
        } catch {
            // File does not exist, proceed
        }

        let content = '';

        if (template === 'data-table-template') {
            try {
                // Read from the template file
                const templatePath = path.join(process.cwd(), 'app', 'templates', 'data-table-and-detail-card', 'page.tsx');
                let templateContent = await fs.readFile(templatePath, 'utf8');

                // Rename the component to match the new page title (Sanitized) to avoid naming conflicts if possible, 
                // or just leave it as is since it's a default export.
                // However, having multiple "TablePage" components might be confusing in DevTools.
                // Let's try to rename "export default function TablePage" -> "export default function [NewName]"
                const safeComponentName = title.replace(/[^a-zA-Z0-9]/g, '') + 'Page';
                templateContent = templateContent.replace(/export default function \w+\(\)/, `export default function ${safeComponentName}()`);

                content = templateContent;
            } catch (err) {
                console.error('Error reading template file:', err);
                return { success: false, message: 'Failed to read template source file.' };
            }
        } else if (template === 'table') {
            content = `'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTableConfig } from '@/components/ui/data-table/useTableConfig';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { Checkbox } from '@/components/ui/checkbox';
import { useLayout } from '@/components/layout/LayoutContext';
import { Plus, Trash2 } from 'lucide-react';

// Default columns as requested
const defaultColumns = [
    { id: 'select', label: '', isMandatory: true, style: { alignment: 'center' } },
    { id: 'id', label: 'ID', isMandatory: true },
    { id: 'createdBy', label: 'CREATED BY' },
    { id: 'createdAt', label: 'CREATED AT' },
    { id: 'editedBy', label: 'EDITED BY' },
    { id: 'editedAt', label: 'EDITED AT' },
];

export default function TablePage() {
    const { setHeaderActions } = useLayout();

    // --- Table Config ---
    const tableConfig = useTableConfig({
        tableId: '${sanitizedPath.replace(/\//g, '-')}-table',
        defaultColumns: defaultColumns
    });

    // --- Mock Data ---
    const [tableData, setTableData] = useState(() => {
        return Array.from({ length: 20 }).map((_, i) => ({
            id: \`ITEM-\${(1000 + i).toString()}\`,
            createdBy: 'System',
            createdAt: new Date().toLocaleDateString(),
            editedBy: 'Admin',
            editedAt: new Date().toLocaleDateString(),
        }));
    });

    // --- Selection State ---
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    const toggleAll = () => {
        if (selectedRows.size === tableData.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(tableData.map(row => row.id)));
        }
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
        createdBy: (item: any) => <span className="text-slate-600 dark:text-slate-400">{item.createdBy}</span>,
        createdAt: (item: any) => <span className="text-slate-500">{item.createdAt}</span>,
        editedBy: (item: any) => <span className="text-slate-600 dark:text-slate-400">{item.editedBy}</span>,
        editedAt: (item: any) => <span className="text-slate-500">{item.editedAt}</span>,
    }), [selectedRows, tableData]);

    // --- Action Bar Injection ---
    useEffect(() => {
        setHeaderActions(
            <div className="flex items-center gap-2">
                {selectedRows.size > 0 && (
                    <Button variant="tertiary" icon={Trash2} onClick={() => {
                         if (confirm('Delete selected items?')) {
                             setTableData(prev => prev.filter(row => !selectedRows.has(row.id)));
                             setSelectedRows(new Set());
                         }
                    }}>
                        Delete ({selectedRows.size})
                    </Button>
                )}
                <Button variant="primary" icon={Plus} onClick={() => alert('Add Item Clicked')}>
                    Add Item
                </Button>
            </div>
        );

        return () => setHeaderActions(null);
    }, [setHeaderActions, selectedRows]);

    return (
        <div className="h-full flex flex-col gap-4">
             <div className="flex-1 min-h-0">
                <DataTable
                    data={tableData}
                    config={tableConfig}
                    columns={columns}
                    isAllSelected={tableData.length > 0 && selectedRows.size === tableData.length}
                    onSelectAll={toggleAll}
                />
            </div>
            <div className="flex items-center justify-between py-4 text-xs text-slate-500 shrink-0">
                <div>Showing {tableData.length} Results</div>
            </div>
        </div>
    );
}
`;
        } else if (template === 'detail') {
            content = `'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, MapPin, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DetailPage() {
    const router = useRouter();

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#1e2329] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header / Actions */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
                <Button variant="tertiary" className="h-8 pl-2 pr-3 gap-2 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 text-slate-500" />
                    <span className="text-xs text-slate-500">Back</span>
                </Button>
                <div className="flex gap-2">
                    <Button variant="secondary">Edit</Button>
                    <Button variant="primary">Save</Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                 {/* Identity Section */}
                <div className="flex flex-col items-center pt-8 pb-6 px-6 text-center border-b border-slate-100 dark:border-slate-800">
                    <div className="h-20 w-20 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold mb-4">
                        ${title.substring(0, 2).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        ${title}
                    </h2>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        Detail View
                    </div>

                    <div className="flex items-center gap-3 w-full max-w-md justify-center">
                        <Button className="flex-1 bg-[#405189] hover:bg-[#364574] text-white">
                            <Mail className="w-4 h-4 mr-2" /> Send Email
                        </Button>
                        <Button variant="secondary" className="flex-1 border border-slate-200 hover:bg-slate-50">
                            <Phone className="w-4 h-4 mr-2" /> Call
                        </Button>
                    </div>
                </div>

                <div className="px-6 py-6 max-w-3xl mx-auto">
                    {/* Information */}
                    <div className="mb-8">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Information</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            This is a detail page for <strong>${title}</strong>. You can customize this section to display relevant information, descriptions, or status updates.
                        </p>
                    </div>

                    {/* Details List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 mb-0.5">Email</div>
                                <div className="text-sm text-blue-600 hover:underline cursor-pointer">example@${title.toLowerCase().replace(/\s+/g, '')}.com</div>
                            </div>
                        </div>
                         <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 mb-0.5">Phone</div>
                                <div className="text-sm text-slate-700 dark:text-slate-300">+1 (555) 000-0000</div>
                            </div>
                        </div>
                         <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 mb-0.5">Address</div>
                                <div className="text-sm text-slate-700 dark:text-slate-300">123 Main St, City, Country</div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 mb-0.5">Created By</div>
                                <div className="text-sm text-slate-900 dark:text-slate-100 font-medium">System Admin</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
`;
        } else {
            // Default Template
            content = `import React from 'react';

export default function Page() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">${title}</h1>
            <div className="p-4 rounded-lg border border-gray-200 bg-white dark:bg-card-bg dark:border-gray-700">
                <p>Welcome to the newly created <strong>${title}</strong> page.</p>
            </div>
        </div>
    );
}
`;
        }

        await fs.writeFile(pageFile, content, 'utf8');
        return { success: true, message: 'Page created successfully.' };

    } catch (error: any) {
        console.error('Error creating page:', error);
        return { success: false, message: `Failed to create page: ${error.message}` };
    }
}

export async function deletePage(pagePath: string) {
    if (!pagePath) {
        return { success: false, message: 'Path is required.' };
    }

    // Sanitize path
    const sanitizedPath = pagePath.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9\-\/]/gi, '');
    if (!sanitizedPath) {
        return { success: false, message: 'Invalid path.' };
    }

    // Safety checks for core paths
    const protectedPaths = ['', 'settings', 'dashboard', 'api'];
    if (protectedPaths.includes(sanitizedPath)) {
        return { success: false, message: 'Cannot delete core system pages.' };
    }

    const appDir = path.join(process.cwd(), 'app');
    const modulesDir = path.join(appDir, '(modules)');

    // Check (modules) first
    let fullPath = path.join(modulesDir, sanitizedPath);
    try {
        await fs.access(fullPath);
    } catch {
        // Fallback to root
        fullPath = path.join(appDir, sanitizedPath);
    }

    try {
        await fs.access(fullPath);
        await fs.rm(fullPath, { recursive: true, force: true });
        return { success: true, message: 'Page deleted successfully.' };
    } catch (error: any) {
        // If the file/directory doesn't exist (ENOENT), we consider it a success
        // so the UI can proceed to remove the menu item.
        if (error.code === 'ENOENT' || error.message.includes('ENOENT')) {
            return { success: true, message: 'Page file not found (already deleted), removed from menu.' };
        }
        console.error('Error deleting page:', error);
        return { success: false, message: `Failed to delete page: ${error.message}` };
    }
}

export async function getAvailablePages() {
    const appDir = path.join(process.cwd(), 'app');
    const pages: string[] = [];

    async function checkDir(dir: string, base: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                if (entry.name.startsWith('.') || entry.name.startsWith('_') || entry.name === 'api') continue;
                await checkDir(path.join(dir, entry.name), base ? `${base}/${entry.name}` : entry.name);
            } else if (entry.name === 'page.tsx' || entry.name === 'page.js') {
                let route = base ? `/${base}` : '/';
                route = route.replace(/\/\([^)]+\)/g, '');
                if (route === '') route = '/';
                if (!pages.includes(route)) {
                    pages.push(route);
                }
            }
        }
    }

    try {
        await checkDir(appDir, '');
        return { success: true, pages: pages.sort() };
    } catch (error: any) {
        console.error('Error scanning pages:', error);
        return { success: false, message: error.message, pages: [] };
    }
}

export async function createModule(moduleName: string) {
    if (!moduleName) {
        return { success: false, message: 'Module Name is required.' };
    }

    // Sanitize path
    const sanitizedName = moduleName.toLowerCase().replace(/[^a-z0-9\-]/g, '');
    if (!sanitizedName) {
        return { success: false, message: 'Invalid module name.' };
    }

    // Default to (modules) for new modules
    const modulesDir = path.join(process.cwd(), 'app', '(modules)');
    const fullPath = path.join(modulesDir, sanitizedName);

    try {
        // Ensure (modules) exists
        await fs.mkdir(modulesDir, { recursive: true });

        await fs.mkdir(fullPath, { recursive: true });

        // Create a default page.tsx for the module to prevent VS Code folder compaction
        // and provide a landing page.
        const pageContent = `'use client';

import React from 'react';

export default function ModulePage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">${moduleName}</h1>
            <div className="p-4 rounded-lg border border-gray-200 bg-white dark:bg-card-bg dark:border-gray-700">
                <p>Welcome to the <strong>${moduleName}</strong> module.</p>
            </div>
        </div>
    );
}
`;
        await fs.writeFile(path.join(fullPath, 'page.tsx'), pageContent, 'utf8');

        return { success: true, message: 'Module folder created successfully.' };
    } catch (error: any) {
        console.error('Error creating module:', error);
        return { success: false, message: `Failed to create module: ${error.message}` };
    }
}

export async function getModules() {
    // Scan app/(modules) instead of app
    const modulesDir = path.join(process.cwd(), 'app', '(modules)');
    const appDir = path.join(process.cwd(), 'app');
    const modules: string[] = [];
    const protectedDirs = ['api', 'actions', 'fonts', 'lib', 'components', 'hooks', 'types', 'utils', 'styles', 'favicon.ico', 'globals.css', 'layout.tsx', 'page.tsx'];

    try {
        // Try scanning (modules)
        try {
            const entries = await fs.readdir(modulesDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
                    modules.push(entry.name);
                }
            }
        } catch {
            // (modules) might not exist yet, ignore
        }

        // Also scan root app for legacy/mixed modules?
        // User wants cleanliness. Let's ONLY scan (modules) + specific root ones if needed.
        // But for now, let's scan root too but filter duplicates or protected.
        // Actually, if we moved distinct folders, root should be clean.
        // Let's also scan root for anything that LOOKS like a module (not in protectedDirs).

        const rootEntries = await fs.readdir(appDir, { withFileTypes: true });
        for (const entry of rootEntries) {
            if (entry.isDirectory()) {
                if (entry.name.startsWith('.') || entry.name.startsWith('_') || entry.name === '(modules)') continue;
                if (protectedDirs.includes(entry.name)) continue;
                // Avoid duplicates
                if (!modules.includes(entry.name)) {
                    modules.push(entry.name);
                }
            }
        }

        return { success: true, modules: modules.sort() };
    } catch (error: any) {
        console.error('Error scanning modules:', error);
        return { success: false, message: error.message, modules: [] };
    }
}
