'use client';

import { useLayout, CustomTheme } from "@/components/layout/LayoutContext";
import { Button } from "@/components/ui/button";
import { Check, Settings as SettingsIcon, Save, Upload, Trash2, Image as ImageIcon, MoreVertical, Plus, FolderPlus, FilePlus, FileText } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createPage, deletePage, getAvailablePages } from "@/app/actions/page-management";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function SettingsPage() {
    const { customTheme, updateCustomTheme, layoutWidth, setLayoutWidth, theme, navItems, updateNavItems, resetNavItems } = useLayout();
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        actionLabel: string;
        variant: 'destructive' | 'default';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        description: '',
        actionLabel: '',
        variant: 'default',
        onConfirm: () => { },
    });

    const activeTheme = theme === 'dark' ? customTheme.dark : customTheme.light;

    // --- Helper Components ---
    const ColorPicker = ({ label, value, onChange, showBold, isBold, onBoldChange }: any) => (
        <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {label}
            </label>
            <div className="flex flex-wrap items-center gap-3">
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-10 h-10 p-0.5 rounded border border-gray-200 cursor-pointer"
                />
                <input
                    type="text"
                    value={value || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-24 px-2 py-1 text-sm font-mono border border-gray-200 rounded focus:outline-none focus:border-blue-500 uppercase"
                    maxLength={7}
                />
                {showBold && (
                    <label className="flex items-center gap-2 cursor-pointer ml-2 select-none">
                        <input
                            type="checkbox"
                            checked={isBold || false}
                            onChange={(e) => onBoldChange(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Bold</span>
                    </label>
                )}
            </div>
        </div>
    );

    const DisplayModeToggle = ({ current, onChange }: any) => (
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
            {[
                { label: 'Icon Only', value: 'icon' },
                { label: 'Text Only', value: 'text' },
                { label: 'Icon & Text', value: 'both' },
            ].map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={cn(
                        "px-3 py-1 text-xs rounded-sm transition-all",
                        current === opt.value
                            ? "bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400 font-medium"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );

    const PageCreator = ({ items, onAdd }: { items: any[], onAdd: (newItem: any, parentLabel?: string) => void }) => {
        const [mode, setMode] = useState<'create' | 'existing'>('create');
        const [title, setTitle] = useState('');
        const [path, setPath] = useState('');
        const [parent, setParent] = useState('');
        const [loading, setLoading] = useState(false);
        const [existingPages, setExistingPages] = useState<string[]>([]);
        const [selectedPage, setSelectedPage] = useState('');
        const [existingLabel, setExistingLabel] = useState('');

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

        const handleCreateSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!title || !path) return;
            setLoading(true);

            try {
                const res = await createPage(path, title);
                if (res.success) {
                    onAdd({ label: title, href: `/${path}` }, parent || undefined);
                    setTitle('');
                    setPath('');
                    setParent('');
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
            onAdd({ label: existingLabel, href: selectedPage, icon: FileText }, parent || undefined);
            setExistingLabel('');
            setSelectedPage('');
            setParent('');
            alert('Existing page added to menu!');
        };

        const renderOptions = (opts: any[], prefix = '') => {
            return opts.reduce((acc: any[], item: any) => {
                acc.push(<option key={item.label + prefix} value={item.label}>{prefix + item.label}</option>);
                if (item.children) {
                    acc.push(...renderOptions(item.children, prefix + '\u00A0\u00A0\u00A0'));
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <label className="text-[10px] uppercase font-bold text-gray-400">Add to Menu (Optional)</label>
                                <select value={parent} onChange={e => setParent(e.target.value)} className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500">
                                    <option value="">Top Level (Root)</option>
                                    {renderOptions(items)}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <label className="text-[10px] uppercase font-bold text-gray-400">Add to Menu (Optional)</label>
                                <select value={parent} onChange={e => setParent(e.target.value)} className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500">
                                    <option value="">Top Level (Root)</option>
                                    {renderOptions(items)}
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
    };

    const MenuEditor = ({ items, onUpdate, depth = 0 }: { items: any[], onUpdate: (items: any[]) => void, depth?: number }) => {
        const handleDeleteItem = (index: number, item: any) => {
            setDeleteDialog({
                isOpen: true,
                title: `Delete Page "${item.label}"`,
                description: `Are you sure you want to permanently delete this page file? This action cannot be undone and will remove the file from your project.`,
                actionLabel: 'Delete Permanently',
                variant: 'destructive',
                onConfirm: async () => {
                    const newItems = [...items];
                    newItems.splice(index, 1);
                    onUpdate(newItems);

                    const res = await deletePage(item.href);
                    if (!res.success) {
                        alert('Error deleting file: ' + res.message);
                    }
                }
            });
        };

        const handleRemoveFromMenu = (index: number) => {
            setDeleteDialog({
                isOpen: true,
                title: 'Remove from Menu',
                description: 'Are you sure you want to remove this item from the navigation menu? The page file will remain.',
                actionLabel: 'Remove',
                variant: 'default',
                onConfirm: () => {
                    const newItems = [...items];
                    newItems.splice(index, 1);
                    onUpdate(newItems);
                }
            });
        };

        return (
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className={cn("rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800", depth > 0 && "ml-6 border-l-4 border-l-blue-500/20")}>
                        <div className="p-3 flex gap-3 items-start">
                            <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-400">Label</label>
                                        <input
                                            type="text"
                                            value={item.label}
                                            onChange={e => {
                                                const newItems = [...items];
                                                newItems[index] = { ...item, label: e.target.value };
                                                onUpdate(newItems);
                                            }}
                                            className="w-full text-sm px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-400">Path</label>
                                        <input
                                            type="text"
                                            value={item.href}
                                            disabled={item.children && item.children.length > 0}
                                            onChange={e => {
                                                const newItems = [...items];
                                                newItems[index] = { ...item, href: e.target.value };
                                                onUpdate(newItems);
                                            }}
                                            className="w-full text-sm px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 pt-4">
                                <button
                                    type="button"
                                    className="h-6 w-6 flex items-center justify-center text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                                    title="Remove from Menu"
                                    onClick={() => handleRemoveFromMenu(index)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                {!['/', '/settings', '/dashboard'].includes(item.href) && (
                                    <button
                                        type="button"
                                        className="h-6 w-6 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        title="Permanently Delete Page File"
                                        onClick={() => handleDeleteItem(index, item)}
                                    >
                                        <FilePlus className="w-3.5 h-3.5 rotate-45" />
                                    </button>
                                )}
                            </div>
                        </div>
                        {item.children && item.children.length > 0 && (
                            <div className="p-3 pt-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 mt-2">Submenu Items</p>
                                <MenuEditor items={item.children} depth={depth + 1} onUpdate={(newChildren) => {
                                    const newItems = [...items];
                                    newItems[index] = { ...item, children: newChildren };
                                    onUpdate(newItems);
                                }} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const handleAddPage = (newItem: any, parentLabel?: string) => {
        const newItems = JSON.parse(JSON.stringify(navItems)); // Deep clone

        if (!parentLabel) {
            newItems.push(newItem);
        } else {
            const findAndAdd = (list: any[]) => {
                for (const item of list) {
                    if (item.label === parentLabel) {
                        if (!item.children) item.children = [];
                        item.children.push(newItem);
                        return true;
                    }
                    if (item.children && findAndAdd(item.children)) return true;
                }
                return false;
            };
            findAndAdd(newItems);
        }
        updateNavItems(newItems);
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 bg-white dark:bg-card-bg rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto relative">
                    <Tabs defaultValue="layout" className="flex flex-col min-h-full w-full">
                        <div className="sticky top-0 z-10 bg-white dark:bg-card-bg px-6 pt-6 border-b border-gray-100 dark:border-gray-800">
                            <TabsList className="bg-transparent p-0 mb-4 w-full justify-start h-auto flex-wrap gap-6">
                                <TabsTrigger value="layout" className="px-4 py-2">Layout Options</TabsTrigger>
                                <TabsTrigger value="branding" className="px-4 py-2">Branding</TabsTrigger>
                                <TabsTrigger value="header_footer" className="px-4 py-2">Header & Footer</TabsTrigger>
                                <TabsTrigger value="navigation" className="px-4 py-2">Navigation</TabsTrigger>
                                <TabsTrigger value="menus" className="px-4 py-2">Menus</TabsTrigger>
                                <TabsTrigger value="components" className="px-4 py-2">Components</TabsTrigger>
                            </TabsList>
                        </div>
                        <div className="p-6">

                            {/* --- TAB: LAYOUT OPTIONS --- */}
                            <TabsContent value="layout" className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Content Width</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Choose between a full-width fluid layout or a centered boxed layout.
                                        </p>
                                    </div>
                                    <div className="flex bg-white dark:bg-gray-700 p-1 rounded-md border border-gray-200 dark:border-gray-600">
                                        {[
                                            { label: 'Full Width', value: 'full' },
                                            { label: 'Boxed', value: 'boxed' },
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setLayoutWidth(opt.value as 'full' | 'boxed')}
                                                className={cn(
                                                    "px-4 py-1.5 text-xs font-medium rounded-sm transition-all",
                                                    layoutWidth === opt.value
                                                        ? "bg-blue-50 text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400"
                                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* --- TAB: BRANDING --- */}
                            <TabsContent value="branding" className="space-y-8">
                                {/* Logos */}
                                <div className="space-y-6">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 border-b pb-2 border-gray-100 dark:border-gray-800">
                                        <ImageIcon className="w-4 h-4" /> Application Logos
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {['logoLight', 'logoDark', 'logoCollapsedLight', 'logoCollapsedDark'].map((type) => {
                                            const isDark = type.toLowerCase().includes('dark');
                                            const isCollapsed = type.includes('Collapsed');
                                            const value = (customTheme.branding as any)[type];

                                            const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                if (file.size > 500 * 1024) { // 500KB limit
                                                    alert("File is too large! Please choose an image under 500KB.");
                                                    return;
                                                }

                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    updateCustomTheme('branding', { [type]: reader.result as string });
                                                };
                                                reader.readAsDataURL(file);
                                            };

                                            let label = isDark ? 'Dark Mode' : 'Light Mode';
                                            if (isCollapsed) label += ' (Collapsed)';
                                            else label += ' (Expanded)';

                                            return (
                                                <div key={type} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {label}
                                                        </label>
                                                        {value && (
                                                            <button
                                                                onClick={() => updateCustomTheme('branding', { [type]: '' })}
                                                                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                                                            >
                                                                <Trash2 className="w-3 h-3" /> Remove
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-16 h-16 rounded border flex items-center justify-center overflow-hidden relative",
                                                            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
                                                        )}>
                                                            {value ? (
                                                                <img src={value} alt="Logo" className="max-w-full max-h-full object-contain" />
                                                            ) : (
                                                                <span className="text-xs text-gray-400">None</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
                                                                <Upload className="w-4 h-4" />
                                                                Upload
                                                                <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Favicon */}
                                <div className="space-y-6">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 border-b pb-2 border-gray-100 dark:border-gray-800">
                                        <ImageIcon className="w-4 h-4" /> Browser Favicon
                                    </h3>
                                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 max-w-md">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Favicon (All Themes)
                                            </label>
                                            {customTheme.branding.favicon && (
                                                <button
                                                    onClick={() => updateCustomTheme('branding', { favicon: '' })}
                                                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded border border-gray-200 bg-white flex items-center justify-center overflow-hidden relative">
                                                {customTheme.branding.favicon ? (
                                                    <img src={customTheme.branding.favicon} alt="Icon" className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <span className="text-xs text-gray-400">None</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
                                                    <Upload className="w-4 h-4" />
                                                    Upload
                                                    <input type="file" className="hidden" accept="image/x-icon,image/png,image/svg+xml"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                updateCustomTheme('branding', { favicon: reader.result as string });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* --- TAB: HEADER & FOOTER --- */}
                            <TabsContent value="header_footer" className="space-y-8">
                                {/* Header Section */}
                                <div className="space-y-6">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-100 dark:border-gray-800">Header Styling</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <ColorPicker
                                            label="Background Color"
                                            value={(activeTheme.header as any)?.bg}
                                            onChange={(val: string) => updateCustomTheme('header', { bg: val })}
                                        />
                                        <ColorPicker
                                            label="Text Color"
                                            value={(activeTheme.header as any)?.text}
                                            onChange={(val: string) => updateCustomTheme('header', { text: val })}
                                        />
                                        <ColorPicker
                                            label="Icon Color"
                                            value={(activeTheme.header as any)?.icon}
                                            onChange={(val: string) => updateCustomTheme('header', { icon: val })}
                                        />
                                    </div>
                                </div>

                                {/* Footer Section */}
                                <div className="space-y-6">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-100 dark:border-gray-800">Footer Styling</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <ColorPicker
                                            label="Background Color"
                                            value={(activeTheme.footer as any)?.bg}
                                            onChange={(val: string) => updateCustomTheme('footer', { bg: val })}
                                        />
                                        <ColorPicker
                                            label="Text Color"
                                            value={(activeTheme.footer as any)?.text}
                                            onChange={(val: string) => updateCustomTheme('footer', { text: val })}
                                        />
                                        <ColorPicker
                                            label="Icon Color"
                                            value={(activeTheme.footer as any)?.icon}
                                            onChange={(val: string) => updateCustomTheme('footer', { icon: val })}
                                        />
                                    </div>
                                </div>
                            </TabsContent>


                            {/* --- TAB: NAVIGATION --- */}
                            <TabsContent value="navigation" className="space-y-8">
                                {/* Horizontal Menu */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-gray-800">
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Horizontal Menu</h3>
                                        <DisplayModeToggle
                                            current={(activeTheme.horizontalNav as any).displayMode}
                                            onChange={(val: string) => updateCustomTheme('horizontalNav', { displayMode: val })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <ColorPicker label="Background" value={(activeTheme.horizontalNav as any).bg} onChange={(v: string) => updateCustomTheme('horizontalNav', { bg: v })} />
                                        <ColorPicker label="Text" value={(activeTheme.horizontalNav as any).text} onChange={(v: string) => updateCustomTheme('horizontalNav', { text: v })} showBold isBold={(activeTheme.horizontalNav as any).boldText} onBoldChange={(b: boolean) => updateCustomTheme('horizontalNav', { boldText: b })} />
                                        {(activeTheme.horizontalNav as any).displayMode !== 'text' && (
                                            <ColorPicker label="Icon" value={(activeTheme.horizontalNav as any).icon} onChange={(v: string) => updateCustomTheme('horizontalNav', { icon: v })} />
                                        )}
                                        <ColorPicker label="Active Text" value={(activeTheme.horizontalNav as any).activeText} onChange={(v: string) => updateCustomTheme('horizontalNav', { activeText: v })} />
                                        <ColorPicker label="Active Border" value={(activeTheme.horizontalNav as any).activeBorder} onChange={(v: string) => updateCustomTheme('horizontalNav', { activeBorder: v })} />
                                        <ColorPicker label="Active Background" value={(activeTheme.horizontalNav as any).activeBackground} onChange={(v: string) => updateCustomTheme('horizontalNav', { activeBackground: v })} />
                                    </div>

                                    {/* Custom Inputs for Horizontal Nav */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                Active Border Thickness
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="8"
                                                step="1"
                                                value={parseInt((activeTheme.horizontalNav as any).activeBorderThickness || '2')}
                                                onChange={(e) => updateCustomTheme('horizontalNav', { activeBorderThickness: `${e.target.value}px` })}
                                                className="w-full accent-blue-600"
                                            />
                                            <div className="text-xs text-gray-400">
                                                Current: {(activeTheme.horizontalNav as any).activeBorderThickness || '2px'}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                Menu Alignment
                                            </label>
                                            <div className="flex bg-white dark:bg-gray-700 p-1 rounded-md w-fit">
                                                {[
                                                    { label: 'Left', value: 'left' },
                                                    { label: 'Center', value: 'center' },
                                                    { label: 'Right', value: 'right' },
                                                ].map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => updateCustomTheme('horizontalNav', { menuAlignment: opt.value })}
                                                        className={cn(
                                                            "px-3 py-1 text-xs font-medium rounded-sm transition-all",
                                                            ((activeTheme.horizontalNav as any).menuAlignment || 'center') === opt.value
                                                                ? "bg-blue-50 dark:bg-gray-600 text-blue-600 dark:text-blue-400 font-medium shadow-sm"
                                                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                        )}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dropdown Settings */}
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">Dropdown Menu Style</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[
                                                { label: "Fill Color", key: "bg" },
                                                { label: "Text Color", key: "text", hasBold: true },
                                                { label: "Icon Color", key: "icon" },
                                                { label: "Frame Color", key: "border" },
                                                { label: "Active Background", key: "activeBackground" },
                                            ].map(field => (
                                                <div key={field.key} className="space-y-2">
                                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                        {field.label}
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={((activeTheme.horizontalNav as any).dropdown?.[field.key]) || ((field.key === 'activeBackground') ? '#F3F4F6' : '#ffffff')}
                                                            onChange={(e) => {
                                                                const currentDropdown = (activeTheme.horizontalNav as any).dropdown || {};
                                                                updateCustomTheme('horizontalNav', {
                                                                    dropdown: { ...currentDropdown, [field.key]: e.target.value }
                                                                });
                                                            }}
                                                            className="w-10 h-10 p-0.5 rounded border border-gray-200 cursor-pointer"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={((activeTheme.horizontalNav as any).dropdown?.[field.key]) || ((field.key === 'activeBackground') ? '#F3F4F6' : '#ffffff')}
                                                            onChange={(e) => {
                                                                const currentDropdown = (activeTheme.horizontalNav as any).dropdown || {};
                                                                updateCustomTheme('horizontalNav', {
                                                                    dropdown: { ...currentDropdown, [field.key]: e.target.value }
                                                                });
                                                            }}
                                                            className="w-24 px-2 py-1 text-sm font-mono border border-gray-200 rounded focus:outline-none focus:border-blue-500 uppercase"
                                                            maxLength={7}
                                                        />
                                                        {(field as any).hasBold && (
                                                            <label className="flex items-center gap-2 cursor-pointer ml-2 select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={((activeTheme.horizontalNav as any).dropdown?.bold) || false}
                                                                    onChange={(e) => {
                                                                        const currentDropdown = (activeTheme.horizontalNav as any).dropdown || {};
                                                                        updateCustomTheme('horizontalNav', {
                                                                            dropdown: { ...currentDropdown, bold: e.target.checked }
                                                                        });
                                                                    }}
                                                                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Bold</span>
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                    Frame Thickness
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="5"
                                                    step="1"
                                                    value={parseInt((activeTheme.horizontalNav as any).dropdown?.borderWidth || '1')}
                                                    onChange={(e) => {
                                                        const currentDropdown = (activeTheme.horizontalNav as any).dropdown || {};
                                                        updateCustomTheme('horizontalNav', {
                                                            dropdown: { ...currentDropdown, borderWidth: `${e.target.value}px` }
                                                        });
                                                    }}
                                                    className="w-full accent-blue-600"
                                                />
                                                <div className="text-xs text-gray-400">
                                                    Current: {(activeTheme.horizontalNav as any).dropdown?.borderWidth || '1px'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vertical Menu */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-gray-800">
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Vertical Menu</h3>
                                        <DisplayModeToggle
                                            current={(activeTheme.verticalNav as any).displayMode}
                                            onChange={(val: string) => updateCustomTheme('verticalNav', { displayMode: val })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <ColorPicker label="Background" value={(activeTheme.verticalNav as any).bg} onChange={(v: string) => updateCustomTheme('verticalNav', { bg: v })} />
                                        <ColorPicker label="Text" value={(activeTheme.verticalNav as any).text} onChange={(v: string) => updateCustomTheme('verticalNav', { text: v })} showBold isBold={(activeTheme.verticalNav as any).boldText} onBoldChange={(b: boolean) => updateCustomTheme('verticalNav', { boldText: b })} />
                                        <ColorPicker label="Icon" value={(activeTheme.verticalNav as any).icon} onChange={(v: string) => updateCustomTheme('verticalNav', { icon: v })} />
                                    </div>
                                </div>
                            </TabsContent>


                            {/* --- TAB: COMPONENTS --- */}
                            <TabsContent value="components" className="space-y-8">
                                {/* Alert Settings */}
                                <div className="space-y-6">
                                    <div className="border-b border-gray-100 dark:border-gray-800 pb-2">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alert Settings</h2>
                                    </div>

                                    {/* Alert Preview */}
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 grid gap-3">
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Preview</h4>
                                        {['primary', 'secondary', 'success', 'danger'].map(type => {
                                            const theme = (activeTheme.alerts as any)[type];
                                            return (
                                                <div key={type} className="p-3 rounded-lg border text-sm flex items-center gap-2" style={{
                                                    backgroundColor: theme.bg, color: theme.text, borderColor: theme.border, fontWeight: theme.boldText ? 700 : 500
                                                }}>
                                                    Sample <strong>{type} alert</strong> style.
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Alert Controls */}
                                    <div className="space-y-6">
                                        {[
                                            { key: 'primary', label: 'Primary Alert' },
                                            { key: 'secondary', label: 'Secondary Alert' },
                                            { key: 'success', label: 'Success Alert' },
                                            { key: 'danger', label: 'Danger Alert' }
                                        ].map((alert) => (
                                            <div key={alert.key}>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">{alert.label}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {['bg', 'text', 'border'].map(prop => (
                                                        <div key={prop} className="space-y-2">
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                                {prop === 'bg' ? 'Background' : prop} Color
                                                            </label>
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="color"
                                                                    value={(activeTheme.alerts as any)[alert.key][prop]}
                                                                    onChange={(e) => {
                                                                        const newAlerts = { ...activeTheme.alerts };
                                                                        (newAlerts as any)[alert.key][prop] = e.target.value;
                                                                        updateCustomTheme('alerts', newAlerts);
                                                                    }}
                                                                    className="w-10 h-10 p-0.5 rounded border border-gray-200 cursor-pointer"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={(activeTheme.alerts as any)[alert.key][prop]}
                                                                    onChange={(e) => {
                                                                        const newAlerts = { ...activeTheme.alerts };
                                                                        (newAlerts as any)[alert.key][prop] = e.target.value;
                                                                        updateCustomTheme('alerts', newAlerts);
                                                                    }}
                                                                    className="w-24 px-2 py-1 text-sm font-mono border border-gray-200 rounded focus:outline-none focus:border-blue-500 uppercase"
                                                                    maxLength={7}
                                                                />
                                                                {prop === 'text' && (
                                                                    <label className="flex items-center gap-2 cursor-pointer ml-2 select-none">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={(activeTheme.alerts as any)[alert.key].boldText || false}
                                                                            onChange={(e) => {
                                                                                const newAlerts = { ...activeTheme.alerts };
                                                                                (newAlerts as any)[alert.key].boldText = e.target.checked;
                                                                                updateCustomTheme('alerts', newAlerts);
                                                                            }}
                                                                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                        />
                                                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Bold</span>
                                                                    </label>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Button Options */}
                                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="border-b border-gray-100 dark:border-gray-800 pb-2">
                                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Button Options</h2>
                                    </div>

                                    {/* Button Preview */}
                                    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 justify-center">
                                        <Button variant="primary" icon={Save}>Save</Button>
                                        <Button variant="secondary" icon={SettingsIcon}>Secondary</Button>
                                        <Button variant="tertiary" icon={Check}>Tertiary</Button>
                                        <Button variant="action" icon={MoreVertical}>Action</Button>
                                    </div>


                                    <div className="space-y-8">
                                        {[
                                            { label: "Primary Buttons", key: "primary" },
                                            { label: "Secondary Buttons", key: "secondary" },
                                            { label: "Tertiary Buttons", key: "tertiary" },
                                            { label: "Action Button (Menu)", key: "action" },
                                        ].map(btn => (
                                            <div key={btn.key} className="border-t border-gray-100 dark:border-gray-700 pt-6 first:border-0 first:pt-0">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{btn.label}</h3>
                                                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
                                                        {[
                                                            { label: 'Icon Only', value: 'icon' },
                                                            { label: 'Text Only', value: 'text' },
                                                            { label: 'Icon & Text', value: 'both' },
                                                        ].map(opt => (
                                                            <button
                                                                key={opt.value}
                                                                onClick={() => updateCustomTheme('buttons', {
                                                                    [btn.key]: { ...(activeTheme.buttons as any)[btn.key], displayMode: opt.value }
                                                                })}
                                                                className={`px-3 py-1 text-xs rounded-sm transition-all ${(activeTheme.buttons as any)[btn.key]?.displayMode === opt.value
                                                                    ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400 font-medium'
                                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                                                    }`}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                    {['bg', 'text', 'icon', 'border'].map(prop => (
                                                        <div key={prop} className="space-y-2">
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                                {prop === 'bg' ? 'Background' : prop} Color
                                                            </label>
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="color"
                                                                    value={(activeTheme.buttons as any)[btn.key][prop]}
                                                                    onChange={(e) => {
                                                                        const newButtons = { ...activeTheme.buttons };
                                                                        (newButtons as any)[btn.key][prop] = e.target.value;
                                                                        updateCustomTheme('buttons', newButtons);
                                                                    }}
                                                                    className="w-10 h-10 p-0.5 rounded border border-gray-200 cursor-pointer"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={(activeTheme.buttons as any)[btn.key][prop]}
                                                                    onChange={(e) => {
                                                                        const newButtons = { ...activeTheme.buttons };
                                                                        (newButtons as any)[btn.key][prop] = e.target.value;
                                                                        updateCustomTheme('buttons', newButtons);
                                                                    }}
                                                                    className="w-24 px-2 py-1 text-sm font-mono border border-gray-200 rounded focus:outline-none focus:border-blue-500 uppercase"
                                                                    maxLength={7}
                                                                />
                                                                {prop === 'text' && (
                                                                    <label className="flex items-center gap-2 cursor-pointer ml-2 select-none">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={(activeTheme.buttons as any)[btn.key].boldText || false}
                                                                            onChange={(e) => {
                                                                                const newButtons = { ...activeTheme.buttons };
                                                                                (newButtons as any)[btn.key].boldText = e.target.checked;
                                                                                updateCustomTheme('buttons', newButtons);
                                                                            }}
                                                                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                        />
                                                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Bold</span>
                                                                    </label>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-2 mt-4">
                                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                            Active Border Thickness
                                                        </label>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="8"
                                                            step="1"
                                                            value={parseInt((activeTheme.buttons as any)[btn.key]?.borderWidth || '1')}
                                                            onChange={(e) => {
                                                                updateCustomTheme('buttons', {
                                                                    [btn.key]: { ...(activeTheme.buttons as any)[btn.key], borderWidth: `${e.target.value}px` }
                                                                });
                                                            }}
                                                            className="w-full accent-blue-600"
                                                        />
                                                        <div className="text-xs text-gray-400">
                                                            Current: {(activeTheme.buttons as any)[btn.key]?.borderWidth || '1px'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* --- TAB: MENUS --- */}
                            <TabsContent value="menus" className="space-y-8">
                                <div className="flex items-center justify-between border-b pb-4 border-gray-100 dark:border-gray-800">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Menu Structure</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Customize the labels and links for your application navigation.
                                        </p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to reset the menu structure to default?')) {
                                                resetNavItems();
                                            }
                                        }}
                                        className="text-xs"
                                    >
                                        Reset to Defaults
                                    </Button>
                                </div>

                                <PageCreator items={navItems} onAdd={handleAddPage} />

                                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
                                    <MenuEditor items={navItems} onUpdate={updateNavItems} />
                                </div>
                            </TabsContent>

                        </div>
                    </Tabs>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{deleteDialog.title}</DialogTitle>
                        <DialogDescription>
                            {deleteDialog.description}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setDeleteDialog(prev => ({ ...prev, isOpen: false }))}>
                            Cancel
                        </Button>
                        <Button
                            variant={deleteDialog.variant === 'destructive' ? 'tertiary' : 'primary'}
                            className={deleteDialog.variant === 'destructive' ? "bg-red-600 text-white hover:bg-red-700 border-transparent" : ""}
                            onClick={() => {
                                deleteDialog.onConfirm();
                                setDeleteDialog(prev => ({ ...prev, isOpen: false }));
                            }}
                        >
                            {deleteDialog.actionLabel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
