'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPage, getAvailablePages } from "@/app/actions/page-management";

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
    const [mode, setMode] = useState<'create' | 'existing'>('create');
    const [title, setTitle] = useState('');
    const [path, setPath] = useState('');
    const [parent, setParent] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingPages, setExistingPages] = useState<string[]>([]);
    const [selectedPage, setSelectedPage] = useState('');
    const [existingLabel, setExistingLabel] = useState('');
    const [selectedIconName, setSelectedIconName] = useState('FileText');

    useEffect(() => {
        if (mode === 'existing') {
            getAvailablePages().then(res => {
                if (res.success && res.pages) {
                    setExistingPages(res.pages);
                }
            });
        }
    }, [mode]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        setPath(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    };

    // Helper to find label by href for the onAdd callback
    const findLabelByHref = (items: any[], href: string): string | null => {
        for (const item of items) {
            if (item.href === href) return item.label;
            if (item.children) {
                const found = findLabelByHref(item.children, href);
                if (found) return found;
            }
        }
        return null;
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !path) return;
        setLoading(true);

        try {
            let finalPath = path;
            let fullHref = `/${path}`;
            let parentLabel = undefined;

            if (parent) {
                // Parent is now the HREF of the parent
                // Remove leading slash for file creation logic if present
                const cleanParentPath = parent.startsWith('/') ? parent.slice(1) : parent;
                finalPath = `${cleanParentPath}/${path}`;

                // Ensure parent href handling for the new item's href
                const parentHrefPrefix = parent.startsWith('/') ? parent : `/${parent}`;
                fullHref = `${parentHrefPrefix}/${path}`;

                // Find label for menu nesting
                const foundLabel = findLabelByHref(items, parent);
                if (foundLabel) parentLabel = foundLabel;
            }

            const res = await createPage(finalPath, title);
            if (res.success) {
                onAdd({ label: title, href: fullHref, iconName: selectedIconName }, parentLabel);
                setTitle('');
                setPath('');
                setParent('');
                setSelectedIconName('FileText');
                alert('Page created successfully!');
            } else {
                alert(res.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to create page');
        } finally {
            setLoading(false);
        }
    };

    const handleExistingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPage || !existingLabel) return;

        let parentLabel = undefined;
        if (parent) {
            const foundLabel = findLabelByHref(items, parent);
            if (foundLabel) parentLabel = foundLabel;
        }

        onAdd({ label: existingLabel, href: selectedPage, iconName: selectedIconName }, parentLabel);
        setExistingLabel('');
        setSelectedPage('');
        setParent('');
        setSelectedIconName('FileText');
        alert('Existing page added to menu!');
    };

    const renderOptionsWithValues = (opts: any[], prefix = '') => {
        return opts.reduce((acc: any[], item: any) => {
            acc.push(<option key={item.href} value={item.href}>{prefix + item.label}</option>);
            if (item.children) {
                acc.push(...renderOptionsWithValues(item.children, prefix + '\u00A0\u00A0\u00A0'));
            }
            return acc;
        }, []);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-dashed border-gray-200 dark:border-gray-800 mb-6">
            <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    type="button"
                    onClick={() => setMode('create')}
                    className={cn("flex items-center gap-2 pb-2 border-b-2 text-sm font-medium transition-colors", mode === 'create' ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700")}
                >
                    <Plus className="w-4 h-4" /> Create New Page
                </button>
                <button
                    type="button"
                    onClick={() => setMode('existing')}
                    className={cn("flex items-center gap-2 pb-2 border-b-2 text-sm font-medium transition-colors", mode === 'existing' ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700")}
                >
                    <FolderPlus className="w-4 h-4" /> Add Existing Page
                </button>
            </div>

            {mode === 'create' ? (
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Page Title</label>
                            <input type="text" placeholder="e.g. About Us" value={title} onChange={handleTitleChange} className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">URL Path</label>
                            <div className="flex items-center text-sm text-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-3 py-2">
                                <span className="mr-1">/</span>
                                <input type="text" value={path} readOnly className="bg-transparent border-none p-0 focus:ring-0 w-full" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Icon</label>
                            <select value={selectedIconName} onChange={e => setSelectedIconName(e.target.value)} className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500">
                                {ICON_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Parent Page (Optional)</label>
                            <select
                                value={parent}
                                onChange={e => setParent(e.target.value)}
                                className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Top Level (Root)</option>
                                {renderOptionsWithValues(items)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading} className="w-full md:w-auto" variant="primary">
                            {loading ? 'Creating...' : 'Create Page & Add to Menu'}
                        </Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleExistingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Select Page</label>
                            <select
                                value={selectedPage}
                                onChange={e => {
                                    const p = e.target.value;
                                    setSelectedPage(p);
                                    if (p) {
                                        const segments = p.split('/').filter(Boolean);
                                        const last = segments[segments.length - 1] || 'Home';
                                        setExistingLabel(last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' '));
                                    }
                                }}
                                className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500"
                            >
                                <option value="">-- Select a Page --</option>
                                {existingPages.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Menu Label</label>
                            <input type="text" value={existingLabel} onChange={e => setExistingLabel(e.target.value)} className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Icon</label>
                            <select value={selectedIconName} onChange={e => setSelectedIconName(e.target.value)} className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500">
                                {ICON_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Parent Page (Optional)</label>
                            <select
                                value={parent}
                                onChange={e => setParent(e.target.value)}
                                className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Top Level (Root)</option>
                                {renderOptionsWithValues(items)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={!selectedPage} className="w-full md:w-auto" variant="primary">
                            Add to Menu
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
