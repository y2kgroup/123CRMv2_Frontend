'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPage, createModule, getModules, getAvailablePages } from "@/actions/page-management";

// Available icons
// Duplicated from SettingsPage for now to allow extraction
const ICON_OPTIONS = [
    { label: 'Document', value: 'FileText' },
    { label: 'Dashboard', value: 'LayoutDashboard' },
    { label: 'Users', value: 'Users' },
    { label: 'Building', value: 'Building2' },
    { label: 'Factory', value: 'Factory' },
    { label: 'Calculator', value: 'Calculator' },
    { label: 'Store', value: 'Store' },
    { label: 'Calendar', value: 'CalendarDays' },
    { label: 'Settings', value: 'Settings' },
    { label: 'Pie Chart', value: 'PieChart' },
    { label: 'Bell', value: 'Bell' },
    { label: 'Briefcase', value: 'Briefcase' },
    { label: 'Circle', value: 'Circle' },
    { label: 'Clipboard', value: 'Clipboard' },
    { label: 'Globe', value: 'Globe' },
    { label: 'Home', value: 'Home' },
    { label: 'Image', value: 'Image' },
    { label: 'Inbox', value: 'Inbox' },
    { label: 'Layers', value: 'Layers' },
    { label: 'Link', value: 'Link' },
    { label: 'Lock', value: 'Lock' },
    { label: 'Mail', value: 'Mail' },
    { label: 'Map', value: 'Map' },
    { label: 'Chat', value: 'MessageSquare' },
    { label: 'Package', value: 'Package' },
    { label: 'Search', value: 'Search' },
    { label: 'Server', value: 'Server' },
    { label: 'Phone', value: 'Smartphone' },
    { label: 'Star', value: 'Star' },
    { label: 'Tag', value: 'Tag' },
    { label: 'Terminal', value: 'Terminal' },
    { label: 'Tool', value: 'Tool' },
    { label: 'Trash', value: 'Trash2' },
    { label: 'Truck', value: 'Truck' },
    { label: 'User', value: 'User' },
    { label: 'Video', value: 'Video' },
    { label: 'Wifi', value: 'Wifi' },
];

interface PageCreatorProps {
    items: any[];
    onAdd: (newItem: any, parentLabel?: string) => void;
}

export function PageCreator({ items, onAdd }: PageCreatorProps) {
    // mode: 'module' = Create New Module (Tab 1) | 'page' = Add Page to Module (Tab 2)
    const [mode, setMode] = useState<'module' | 'page'>('module');

    // Module Creation State
    const [moduleName, setModuleName] = useState('');

    // Page Creation State
    const [pageTitle, setPageTitle] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('default');
    const [loading, setLoading] = useState(false);

    // New: Existing Page State
    const [creationType, setCreationType] = useState<'new' | 'existing'>('new');
    const [existingPages, setExistingPages] = useState<string[]>([]);
    const [selectedExistingPage, setSelectedExistingPage] = useState(''); // href

    // Helper Data
    const [availableModules, setAvailableModules] = useState<string[]>([]);
    const [selectedIconName, setSelectedIconName] = useState('FileText'); // For Module creation

    // Fetch modules and pages when switching to Page mode or on mount
    const fetchHelpers = async () => {
        const modRes = await getModules();
        if (modRes.success && modRes.modules) {
            setAvailableModules(modRes.modules);
        }

        const pageRes = await getAvailablePages();
        if (pageRes.success && pageRes.pages) {
            setExistingPages(pageRes.pages);
        }
    };

    useEffect(() => {
        fetchHelpers();
    }, [mode]);

    // --- Tab 1: Create Module ---
    const handleCreateModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!moduleName) return;
        setLoading(true);

        try {
            const res = await createModule(moduleName);
            if (res.success) {
                // Determine HREF for module (folder path)
                const sanitized = moduleName.toLowerCase().replace(/[^a-z0-9\-]/g, '');
                const href = `/${sanitized}`;

                onAdd({ label: moduleName, href: href, iconName: selectedIconName });
                setModuleName('');
                setSelectedIconName('FileText');
                alert('Module created and added to menu!');
                fetchHelpers(); // Refresh list
            } else {
                alert(res.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to create module');
        } finally {
            setLoading(false);
        }
    };

    // --- Tab 2: Add Page to Module ---
    const handleAddPageToModule = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation based on type
        if (!selectedModule) return;
        if (creationType === 'new' && !pageTitle) return;
        if (creationType === 'existing' && (!selectedExistingPage || !pageTitle)) return; // pageTitle acts as Label here

        setLoading(true);

        try {
            let fullHref = '';

            if (creationType === 'new') {
                // Path: module/page-name
                const pageSlug = pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                const fullPath = `${selectedModule}/${pageSlug}`;
                fullHref = `/${fullPath}`;

                // Create File
                const res = await createPage(fullPath, pageTitle, selectedTemplate as any);
                if (!res.success) {
                    alert(res.message);
                    setLoading(false);
                    return;
                }
            } else {
                // Existing Page
                fullHref = selectedExistingPage;
                // No file creation needed
            }

            // Parent is the Module Label.
            const moduleHref = `/${selectedModule}`;

            // Helper to find label in items tree
            const findLabel = (list: any[]): string | undefined => {
                for (const item of list) {
                    if (item.href === moduleHref || item.label.toLowerCase() === selectedModule.toLowerCase()) return item.label;
                    if (item.children) {
                        const found = findLabel(item.children);
                        if (found) return found;
                    }
                }
                return undefined;
            };

            const parentLabel = findLabel(items) || selectedModule;

            // Use the EXPLICIT pageTitle (which acts as Menu Label in "existing" mode) or fallback to name
            const finalLabel = pageTitle;

            onAdd({ label: finalLabel, href: fullHref, iconName: 'FileText' }, parentLabel);

            // Reset
            setPageTitle('');
            setSelectedExistingPage('');
            setSelectedTemplate('default');
            setCreationType('new'); // Reset to default

            alert(creationType === 'new' ? 'Page created and added to module!' : 'Existing page added to module!');

        } catch (err) {
            console.error(err);
            alert('Failed to add page');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-dashed border-gray-200 dark:border-gray-800 mb-6">
            <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    type="button"
                    onClick={() => setMode('module')}
                    className={cn("flex items-center gap-2 pb-2 border-b-2 text-sm font-medium transition-colors", mode === 'module' ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700")}
                >
                    <FolderPlus className="w-4 h-4" /> Create New Module
                </button>
                <button
                    type="button"
                    onClick={() => setMode('page')}
                    className={cn("flex items-center gap-2 pb-2 border-b-2 text-sm font-medium transition-colors", mode === 'page' ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700")}
                >
                    <Plus className="w-4 h-4" /> Add/Edit Page to Module
                </button>
            </div>

            {mode === 'module' ? (
                <form onSubmit={handleCreateModule} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Module Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Demo"
                                value={moduleName}
                                onChange={e => setModuleName(e.target.value)}
                                className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Creates a top-level menu item and folder.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Icon</label>
                            <select value={selectedIconName} onChange={e => setSelectedIconName(e.target.value)} className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500">
                                {ICON_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading} className="w-full md:w-auto" variant="primary">
                            {loading ? 'Creating...' : 'Create Module'}
                        </Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleAddPageToModule} className="space-y-4">
                    {/* Creation Type Toggle */}
                    <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="creationType"
                                value="new"
                                checked={creationType === 'new'}
                                onChange={() => setCreationType('new')}
                                className="accent-blue-600"
                            />
                            <span className="text-sm">Create New Page</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="creationType"
                                value="existing"
                                checked={creationType === 'existing'}
                                onChange={() => setCreationType('existing')}
                                className="accent-blue-600"
                            />
                            <span className="text-sm">Add Existing Page</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Select Module</label>
                            <select
                                value={selectedModule}
                                onChange={e => setSelectedModule(e.target.value)}
                                className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500"
                            >
                                <option value="">-- Select a Module --</option>
                                {availableModules.map(m => (
                                    <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        {creationType === 'new' ? (
                            <>
                                <div className="space-y-1 lg:col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Page Name</label>
                                    <input
                                        type="text"
                                        value={pageTitle}
                                        onChange={e => setPageTitle(e.target.value)}
                                        placeholder="e.g. My New Page"
                                        className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-1 lg:col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Template</label>
                                    <select
                                        value={selectedTemplate}
                                        onChange={e => setSelectedTemplate(e.target.value)}
                                        className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="default">Blank Page</option>
                                        <option value="data-table-template">Data Table & Detail Card</option>
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-1 lg:col-span-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Select Existing Page</label>
                                    <select
                                        value={selectedExistingPage}
                                        onChange={e => {
                                            setSelectedExistingPage(e.target.value);
                                            // Auto-fill label if empty
                                            if (!pageTitle) {
                                                const label = e.target.value.split('/').pop()?.replace(/-/g, ' ');
                                                if (label) setPageTitle(label.charAt(0).toUpperCase() + label.slice(1));
                                            }
                                        }}
                                        className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">-- Select Page --</option>
                                        {existingPages.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1 lg:col-span-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Menu Label (Editable)</label>
                                    <input
                                        type="text"
                                        value={pageTitle}
                                        onChange={e => setPageTitle(e.target.value)}
                                        placeholder="Type label here..."
                                        className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={!selectedModule || !pageTitle || loading || (creationType === 'existing' && !selectedExistingPage)} className="w-full md:w-auto" variant="primary">
                            {loading ? 'Adding...' : 'Add Page to Menu'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
