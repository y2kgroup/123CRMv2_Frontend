'use client';

import { useLayout, CustomTheme } from "@/components/layout/LayoutContext";
import { Button } from "@/components/ui/button";
import { Check, Settings as SettingsIcon, Save, Upload, Trash2, Image as ImageIcon, MoreVertical } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { customTheme, updateCustomTheme, layoutWidth, setLayoutWidth, theme } = useLayout();

    const activeTheme = theme === 'dark' ? customTheme.dark : customTheme.light;
    // Helper to safely access nested properties in activeTheme
    // Note: customTheme in contexts like (customTheme.horizontalNav as any) must be replaced with activeTheme

    const sections = [
        {
            title: "Layout Options",
            key: "layout",
            fields: [],
            customInput: (
                <div className="col-span-1 md:col-span-3">
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
                </div>
            )
        },
        {
            title: "Header",
            key: "header",
            fields: [
                { label: "Background Color", key: "bg" },
                { label: "Text Color", key: "text" },
                { label: "Icon Color", key: "icon" },
            ]
        },
        {
            title: "Branding",
            key: "branding",
            fields: [], // No color fields, custom inputs only
            customInput: (
                <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                    {/* Logos */}
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
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
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
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
                </div>
            )
        },
        {
            title: "Horizontal Menu",
            key: "horizontalNav",
            fields: [
                { label: "Background Color", key: "bg" },
                { label: "Text Color", key: "text" },
                { label: "Icon Color", key: "icon" },
                { label: "Active Text Color", key: "activeText" },
                { label: "Active Border Color", key: "activeBorder" },
                { label: "Active Background Color", key: "activeBackground" },
            ],
            // Custom slider for border width and Alignment
            customInput: (
                <div className="col-span-1 md:col-span-2 space-y-4 mt-4">
                    {/* Border Thickness */}
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

                    {/* Menu Alignment */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Menu Alignment
                        </label>
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md w-fit">
                            {[
                                { label: 'Left', value: 'left' },
                                { label: 'Center', value: 'center' },
                                { label: 'Right', value: 'right' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => updateCustomTheme('horizontalNav', { menuAlignment: opt.value })}
                                    className={cn(
                                        "px-4 py-1.5 text-xs font-medium rounded-sm transition-all",
                                        ((activeTheme.horizontalNav as any).menuAlignment || 'center') === opt.value
                                            ? "bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400 font-medium"
                                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dropdown Menu Style */}
                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-3">
                            Dropdown Menu Style
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Dropdown Colors */}
                            {[
                                { label: "Fill Color", key: "bg" },
                                { label: "Text Color", key: "text", hasBold: true },
                                { label: "Icon Color", key: "icon" },
                                { label: "Frame Color", key: "border" },
                                { label: "Active Background Color", key: "activeBackground" },
                            ].map(field => (
                                <div key={field.key} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            {field.label}
                                        </label>
                                    </div>
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
                                        {field.hasBold && (
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

                            {/* Dropdown Frame Thickness */}
                            <div className="col-span-1 sm:col-span-2 space-y-2 mt-2">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
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

                            {/* Menu Trigger Mode */}
                            <div className="col-span-1 sm:col-span-2 space-y-2 mt-4">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Menu Trigger
                                </label>
                                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-max">
                                    {['click', 'hover'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => {
                                                const currentDropdown = (activeTheme.horizontalNav as any).dropdown || {};
                                                updateCustomTheme('horizontalNav', {
                                                    dropdown: { ...currentDropdown, triggerMode: mode }
                                                });
                                            }}
                                            className={cn(
                                                "px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                                                ((activeTheme.horizontalNav as any).dropdown?.triggerMode || 'click') === mode
                                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                            )}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            options: [
                { label: "Icon Only", value: 'icon' },
                { label: "Text Only", value: 'text' },
                { label: "Icon & Text", value: 'both' },
            ]
        },
        {
            title: "Vertical Menu",
            key: "verticalNav",
            fields: [
                { label: "Background Color", key: "bg" },
                { label: "Text Color", key: "text" },
                { label: "Icon Color", key: "icon" },
            ],
            options: [
                { label: "Icon Only", value: 'icon' },
                { label: "Text Only", value: 'text' },
                { label: "Icon & Text", value: 'both' },
            ]
        },
        {
            title: "Footer",
            key: "footer",
            fields: [
                { label: "Background Color", key: "bg" },
                { label: "Text Color", key: "text" },
                { label: "Icon Color", key: "icon" },
            ]
        },
    ];

    const buttons = [
        { label: "Primary Buttons", key: "primary" },
        { label: "Secondary Buttons", key: "secondary" },
        { label: "Tertiary Buttons", key: "tertiary" },
        { label: "Action Button (Menu)", key: "action" },
    ];

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 bg-white dark:bg-card-bg rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Theme Customizer</h2>
                    <p className="text-sm text-gray-500 mt-1">Customize the look and feel of your application.</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-12">
                    {/* General Sections */}
                    {sections.map((section) => (
                        <div key={section.title} className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{section.title}</h2>

                                {/* Display Mode Toggle */}
                                {section.options && (
                                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
                                        {section.options.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => updateCustomTheme(section.key as any, { displayMode: opt.value })}
                                                className={`px-3 py-1 text-xs rounded-sm transition-all ${(activeTheme[section.key as keyof typeof activeTheme] as any).displayMode === opt.value
                                                    ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400 font-medium'
                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {section.fields.map(field => {
                                    // Skip rendering icon color if displayMode is text
                                    if (field.label === "Icon Color" && (section.key === 'horizontalNav' && (activeTheme.horizontalNav as any).displayMode === 'text')) {
                                        return null;
                                    }

                                    // Ensure value is defined to enable controlled input
                                    const rawValue = (activeTheme[section.key as keyof typeof activeTheme] as any)[field.key];
                                    const currentValue = rawValue || '#000000'; // Fallback to black or empty

                                    return (
                                        <div key={field.key} className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                {field.label}
                                            </label>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={currentValue}
                                                    onChange={(e) => updateCustomTheme(section.key as any, { [field.key]: e.target.value })}
                                                    className="w-10 h-10 p-0.5 rounded border border-gray-200 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={currentValue}
                                                    onChange={(e) => updateCustomTheme(section.key as any, { [field.key]: e.target.value })}
                                                    className="w-24 px-2 py-1 text-sm font-mono border border-gray-200 rounded focus:outline-none focus:border-blue-500 uppercase"
                                                    maxLength={7}
                                                />
                                                {/* Bold Toggle Inline */}
                                                {field.key === 'text' && (
                                                    <label className="flex items-center gap-2 cursor-pointer ml-2 select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={(activeTheme[section.key as keyof typeof activeTheme] as any).boldText || false}
                                                            onChange={(e) => updateCustomTheme(section.key as any, { boldText: e.target.checked })}
                                                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Bold</span>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {(section as any).customInput}
                            </div>
                        </div>
                    ))}

                    {/* Alert Settings */}
                    <div className="space-y-6">
                        <div className="border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alert Settings</h2>
                            <p className="text-sm text-gray-500 mt-1">Customize the colors and style of application alerts.</p>
                        </div>
                        <div className="space-y-8">
                            {/* Preview Section */}
                            <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Live Preview</h3>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg border flex items-center gap-3" style={{
                                        backgroundColor: activeTheme.alerts.primary.bg,
                                        color: activeTheme.alerts.primary.text,
                                        borderColor: activeTheme.alerts.primary.border,
                                        fontWeight: activeTheme.alerts.primary.boldText ? 700 : 500
                                    }}>
                                        <span>Hi! A simple <strong>Primary alert</strong> —check it out!</span>
                                    </div>
                                    <div className="p-4 rounded-lg border flex items-center gap-3" style={{
                                        backgroundColor: activeTheme.alerts.secondary.bg,
                                        color: activeTheme.alerts.secondary.text,
                                        borderColor: activeTheme.alerts.secondary.border,
                                        fontWeight: activeTheme.alerts.secondary.boldText ? 700 : 500
                                    }}>
                                        <span>How are you! A simple <strong>secondary alert</strong> —check it out!</span>
                                    </div>
                                    <div className="p-4 rounded-lg border flex items-center gap-3" style={{
                                        backgroundColor: activeTheme.alerts.success.bg,
                                        color: activeTheme.alerts.success.text,
                                        borderColor: activeTheme.alerts.success.border,
                                        fontWeight: activeTheme.alerts.success.boldText ? 700 : 500
                                    }}>
                                        <span>Yey! Everything worked! A simple <strong>success alert</strong> —check it out!</span>
                                    </div>
                                    <div className="p-4 rounded-lg border flex items-center gap-3" style={{
                                        backgroundColor: activeTheme.alerts.danger.bg,
                                        color: activeTheme.alerts.danger.text,
                                        borderColor: activeTheme.alerts.danger.border,
                                        fontWeight: activeTheme.alerts.danger.boldText ? 700 : 500
                                    }}>
                                        <span>Something is very wrong! A simple <strong>danger alert</strong> —check it out!</span>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="space-y-8">
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
                                                        {/* Bold Toggle Inline */}
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
                    </div>

                    {/* Button Settings */}
                    <div className="space-y-6">
                        <div className="border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Button Options</h2>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 justify-center">
                            <Button variant="primary" icon={Save}>Save</Button>
                            <Button variant="secondary" icon={SettingsIcon}>Secondary</Button>
                            <Button variant="tertiary" icon={Check}>Tertiary</Button>
                            <Button variant="action" icon={MoreVertical}>Action</Button>
                        </div>

                        <div className="space-y-8">
                            {buttons.map(btn => (
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
                                                    {/* Bold Toggle Inline */}
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

                                        {/* Border Thickness Slider */}
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
                </div>
            </div >
        </div >
    );
}
