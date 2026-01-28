'use client';

import { useLayout } from "@/components/layout/LayoutContext";
import { CustomTheme } from "@/config/theme";
import { Button } from "@/components/ui/button";
import { Check, Settings as SettingsIcon, Save, Upload, Trash2, Image as ImageIcon, MoreVertical, Plus, FolderPlus, FilePlus, FileText } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createPage, deletePage, getAvailablePages } from "@/actions/page-management";
import { saveNavigationConfig } from "@/actions/navigation-config";
import { saveThemeConfig } from "@/actions/theme-config";
import { MenuBuilder } from "@/components/settings/MenuBuilder";
import { PageCreator } from "@/components/settings/PageCreator";
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


    // Edit Dialog State
    const [editDialog, setEditDialog] = useState<{
        isOpen: boolean;
        item: any | null;
        label: string;
        iconName: string;
    }>({
        isOpen: false,
        item: null,
        label: '',
        iconName: 'FileText',
    });

    // Available icons
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



    const handleRemoveItem = async (itemType: 'remove' | 'delete', item: any) => {
        const message = itemType === 'delete'
            ? `Are you sure you want to PERMANENTLY DELETE the page "${item.label}"?\n\nThis action cannot be undone and will remove the file from your project.`
            : `Are you sure you want to remove "${item.label}" from the menu?\n\nThe page file will remain in your project.`;

        if (window.confirm(message)) {
            if (itemType === 'delete') {
                const res = await deletePage(item.href);
                if (!res.success) {
                    alert('Error deleting file: ' + res.message);
                    return;
                }
            }

            // Helper to recursively remove item from tree
            const removeItemRecursive = (list: any[]): any[] => {
                return list.filter(i => {
                    // Match roughly by reference or consistent fields
                    const isMatch = (i.id && i.id === item.id) || (i.href === item.href && i.label === item.label);
                    if (isMatch) return false;

                    if (i.children) {
                        i.children = removeItemRecursive(i.children);
                    }
                    return true;
                });
            };

            const newItems = removeItemRecursive(navItems);
            updateNavItems(newItems);
        }
    };

    const handleAddPage = (newItem: any, parentLabel?: string) => {
        const newItems = JSON.parse(JSON.stringify(navItems)); // Deep clone

        if (!parentLabel) {
            newItems.push(newItem);
        } else {
            const findAndAdd = (list: any[]) => {
                for (const item of list) {
                    // Match loosely by label (case-insensitive) just in case
                    if (item.label.toLowerCase() === parentLabel.toLowerCase()) {
                        if (!item.children) item.children = [];
                        item.children.push(newItem);
                        return true;
                    }
                    if (item.children && findAndAdd(item.children)) return true;
                }
                return false;
            };

            if (!findAndAdd(newItems)) {
                // Parent module not found in menu! Create it.
                // Assuming standard slug format for href
                const slug = parentLabel.toLowerCase().replace(/[^a-z0-9-]/g, '');
                const newModule = {
                    label: parentLabel,
                    href: `/${slug}`,
                    iconName: 'LayoutDashboard', // Default icon
                    children: [newItem]
                };
                newItems.push(newModule);
                // alert(`Note: Module "${parentLabel}" was missing from the menu, so it has been recreated.`);
            }
        }
        updateNavItems(newItems);
    };

    const handleEditItem = (item: any) => {
        setEditDialog({
            isOpen: true,
            item: item,
            label: item.label,
            iconName: item.iconName || 'FileText',
        });
    };

    const handleSaveEdit = () => {
        if (!editDialog.item) return;

        // Recursive update
        // Recursive update
        const updateItemInTree = (list: any[]): any[] => {
            return list.map(i => {
                // Match by ID if present, otherwise by strict reference or unique HREF check
                // Since we don't have unique IDs for all items yet, use HREF as a fallback key
                const isMatch = (i.id && i.id === editDialog.item.id) ||
                    (!i.id && i.href === editDialog.item.href && i.label === editDialog.item.label);

                if (isMatch) {
                    return { ...i, label: editDialog.label, iconName: editDialog.iconName };
                }
                if (i.children) {
                    return { ...i, children: updateItemInTree(i.children) };
                }
                return i;
            });
        };

        const newItems = updateItemInTree(navItems);
        updateNavItems(newItems);
        setEditDialog(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 bg-white dark:bg-card-bg rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto relative">
                    <Tabs defaultValue="layout" className="flex flex-col min-h-full w-full">
                        <div className="sticky top-0 z-10 bg-white dark:bg-card-bg px-6 pt-6 border-b border-gray-100 dark:border-gray-800 flex flex-row justify-between items-start gap-4">
                            <TabsList className="bg-transparent p-0 mb-4 justify-start h-auto flex-wrap gap-6">
                                <TabsTrigger value="layout" className="px-4 py-2">Layout Options</TabsTrigger>
                                <TabsTrigger value="branding" className="px-4 py-2">Branding</TabsTrigger>
                                <TabsTrigger value="header_footer" className="px-4 py-2">Header & Footer</TabsTrigger>
                                <TabsTrigger value="navigation" className="px-4 py-2">Navigation</TabsTrigger>
                                <TabsTrigger value="menus" className="px-4 py-2">Menus</TabsTrigger>
                                <TabsTrigger value="components" className="px-4 py-2">Components</TabsTrigger>
                            </TabsList>
                            <Button
                                variant="primary"
                                onClick={async () => {
                                    if (confirm('Are you sure you want to save the current theme settings as the PROJECT DEFAULT? This will update the code configuration file.')) {
                                        const res = await saveThemeConfig(customTheme);
                                        if (res.success) {
                                            alert('Theme saved as default! It will now persist even after a reset.');
                                        } else {
                                            alert('Failed to save: ' + res.message);
                                        }
                                    }
                                }}
                                className="text-xs shrink-0"
                                icon={Save}
                            >
                                Save Theme as Default
                            </Button>
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
                                                <div className="flex flex-col lg:flex-row gap-6">
                                                    {/* Left Column: Title & Color Inputs */}
                                                    <div className="flex-1 space-y-4">
                                                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pl-1">{btn.label}</h3>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
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
                                                        </div>
                                                    </div>

                                                    {/* Right Column: Controls Sidebar */}
                                                    <div className="w-full lg:w-72 flex flex-col gap-3 pt-0 lg:pt-9">
                                                        {/* Display Mode Toggle */}
                                                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md w-full">
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
                                                                    className={`flex-1 py-1 text-xs rounded-sm transition-all text-center whitespace-nowrap ${(activeTheme.buttons as any)[btn.key]?.displayMode === opt.value
                                                                        ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400 font-medium'
                                                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                                                        }`}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Size Toggle */}
                                                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md w-full">
                                                            {[
                                                                { label: 'Small', value: 'small' },
                                                                { label: 'Medium', value: 'medium' },
                                                                { label: 'Large', value: 'large' },
                                                            ].map(opt => (
                                                                <button
                                                                    key={opt.value}
                                                                    onClick={() => updateCustomTheme('buttons', {
                                                                        [btn.key]: { ...(activeTheme.buttons as any)[btn.key], size: opt.value }
                                                                    })}
                                                                    className={cn(
                                                                        "flex-1 py-1 text-xs rounded-sm transition-all text-center",
                                                                        ((activeTheme.buttons as any)[btn.key]?.size || 'medium') === opt.value
                                                                            ? "bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400 font-medium"
                                                                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                                                                    )}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Border Thickness Slider */}
                                                        <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md border border-dashed border-gray-200 dark:border-gray-700">
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                                    Active Border
                                                                </label>
                                                                <span className="text-[10px] text-gray-400 font-mono">
                                                                    {(activeTheme.buttons as any)[btn.key]?.borderWidth || '1px'}
                                                                </span>
                                                            </div>
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
                                                                className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                            />
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
                                            Customize the labels and links for your application navigation. Use drag-and-drop to reorder and nest items.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            onClick={async () => {
                                                if (confirm('Are you sure you want to save the current menu as the PROJECT DEFAULT? This will update the code configuration file.')) {
                                                    const res = await saveNavigationConfig(navItems);
                                                    if (res.success) {
                                                        alert('Menu saved as default! It will now persist even after a reset.');
                                                    } else {
                                                        alert('Failed to save: ' + res.message);
                                                    }
                                                }
                                            }}
                                            className="text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                        >
                                            Save as Project Default
                                        </Button>
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
                                </div>

                                <PageCreator items={navItems} onAdd={handleAddPage} />

                                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
                                    {/* Using new MenuBuilder with DnD support */}
                                    <MenuBuilder
                                        items={navItems}
                                        onUpdate={updateNavItems}
                                        onRemoveItem={(item) => handleRemoveItem('remove', item)}
                                        onDeleteItem={(item) => handleRemoveItem('delete', item)}

                                        onEditItem={handleEditItem}
                                    />
                                </div>
                            </TabsContent>

                        </div>
                    </Tabs>
                </div>
            </div >



            {/* Edit Item Dialog */}
            < Dialog open={editDialog.isOpen} onOpenChange={(open) => setEditDialog(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Menu Item</DialogTitle>
                        <DialogDescription>
                            Update the label and icon for this menu item.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase">Label</label>
                            <input
                                type="text"
                                value={editDialog.label}
                                onChange={(e) => setEditDialog(prev => ({ ...prev, label: e.target.value }))}
                                className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase">Icon</label>
                            <select
                                value={editDialog.iconName}
                                onChange={(e) => setEditDialog(prev => ({ ...prev, iconName: e.target.value }))}
                                className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500"
                            >
                                {ICON_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setEditDialog(prev => ({ ...prev, isOpen: false }))}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSaveEdit}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </div >
    );
}
