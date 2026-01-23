import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Upload, Circle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { EntityConfig, FormLayoutItem } from './types';

interface ContactField {
    id: string;
    value: string;
    type: string;
    isPrimary: boolean;
}

interface GenericEntityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    entityConfig: EntityConfig;
}

export function GenericEntityDialog({ open, onOpenChange, onSubmit, initialData, entityConfig }: GenericEntityDialogProps) {
    const { singularName, layout } = entityConfig;

    // Form State
    // We use a flexible record for all fields
    const [formData, setFormData] = useState<Record<string, any>>({});

    // Initialize state
    useEffect(() => {
        if (open) {
            if (initialData) {
                // Flatten services array to newline string for interaction
                const data = { ...initialData };
                if (Array.isArray(data.services)) {
                    data.services = data.services.join('\n');
                }
                // Ensure array fields exist
                if (!data.emails || data.emails.length === 0) data.emails = [{ id: '1', value: '', type: 'Work', isPrimary: true }];
                if (!data.phones || data.phones.length === 0) data.phones = [{ id: '1', value: '', type: 'Work', isPrimary: true }];
                if (!data.addresses || data.addresses.length === 0) data.addresses = [{ id: '1', value: '', type: 'Work', isPrimary: true }];

                setFormData(data);
            } else {
                // Default State
                setFormData({
                    id: 'ID-' + Math.floor(Math.random() * 10000000),
                    emails: [{ id: '1', value: '', type: 'Work', isPrimary: true }],
                    phones: [{ id: '1', value: '', type: 'Work', isPrimary: true }],
                    addresses: [{ id: '1', value: '', type: 'Work', isPrimary: true }]
                });
            }
        }
    }, [open, initialData]);

    const updateField = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Generic Handlers for Array Fields
    const handleAddField = (key: string) => {
        setFormData(prev => {
            let list = prev[key];
            if (!Array.isArray(list)) {
                list = list ? [{ id: '1', value: list, type: 'Work', isPrimary: true }] : [];
            }
            return {
                ...prev,
                [key]: [...list, { id: Math.random().toString(), value: '', type: 'Work', isPrimary: list.length === 0 }]
            };
        });
    };

    const handleRemoveField = (key: string, itemId: string) => {
        setFormData(prev => {
            let list = prev[key];
            if (!Array.isArray(list)) {
                // If it's a string, acts like a list of 1. If we remove it, it becomes empty list (or empty string?)
                // If we are "removing" the only item, we probably want to clear it.
                list = list ? [{ id: '1', value: list, type: 'Work', isPrimary: true }] : [];
            }
            if (list.length <= 1) return prev; // Don't allow removing last item? Or allow and clear? Original logic prevented it.
            return { ...prev, [key]: list.filter((i: any) => i.id !== itemId) };
        });
    };

    const handleUpdateArrayItem = (key: string, itemId: string, itemKey: string, value: any) => {
        setFormData(prev => {
            let list = prev[key];
            if (!Array.isArray(list)) {
                list = list ? [{ id: '1', value: list, type: 'Work', isPrimary: true }] : [];
            }
            return { ...prev, [key]: list.map((i: any) => i.id === itemId ? { ...i, [itemKey]: value } : i) };
        });
    };

    const handleSetPrimary = (key: string, itemId: string) => {
        setFormData(prev => {
            let list = prev[key];
            if (!Array.isArray(list)) {
                list = list ? [{ id: '1', value: list, type: 'Work', isPrimary: true }] : [];
            }
            return { ...prev, [key]: list.map((i: any) => ({ ...i, isPrimary: i.id === itemId })) };
        });
    };

    const handleSubmit = () => {
        // Process data before submit (e.g. split services)
        const submission = { ...formData };
        if (typeof submission.services === 'string') {
            submission.services = submission.services.split('\n').filter(s => s.trim());
        }
        onSubmit(submission);
        onOpenChange(false);
    };

    // Helper to genericize the array rendering
    const renderArrayField = (key: string, label: string, type: 'email' | 'phone' | 'address' | string) => {
        let list = formData[key];
        if (!Array.isArray(list)) {
            // Virtualize for rendering if string
            list = list ? [{ id: '1', value: list, type: 'Work', isPrimary: true }] : [];
            // Note: If completely empty, we might want to show one empty field?
            if (list.length === 0) list = [{ id: '1', value: '', type: 'Work', isPrimary: true }];
        }

        const inputPlaceholder = type === 'email' ? 'Enter email' : type === 'phone' ? 'Enter phone' : 'Enter address';
        const addLabel = type === 'email' ? 'Add another email' : type === 'phone' ? 'Add another phone' : 'Add another address';

        return (
            <div key={key} className="space-y-3">
                <Label>{label}</Label>
                {list.map((item: any) => (
                    <div key={item.id} className="flex gap-2 items-start">
                        <Input
                            placeholder={inputPlaceholder}
                            className="flex-1"
                            value={item.value}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (type === 'phone') {
                                    // Auto-formatting
                                    let v = val.replace(/\D/g, '');
                                    if (v.length > 3 && v.length <= 6) v = v.slice(0, 3) + '-' + v.slice(3);
                                    else if (v.length > 6) v = v.slice(0, 3) + '-' + v.slice(3, 6) + '-' + v.slice(6, 12);
                                    val = v;
                                }
                                handleUpdateArrayItem(key, item.id, 'value', val)
                            }}
                        />
                        <Select
                            value={item.type}
                            onValueChange={(val) => handleUpdateArrayItem(key, item.id, 'type', val)}
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Work">Work</SelectItem>
                                <SelectItem value="Home">Home</SelectItem>
                                {type === 'phone' && <SelectItem value="Mobile">Mobile</SelectItem>}
                                {type === 'address' && <SelectItem value="Billing">Billing</SelectItem>}
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <div
                            className="flex items-center gap-1 cursor-pointer pt-2.5 px-1"
                            onClick={() => handleSetPrimary(key, item.id)}
                        >
                            {item.isPrimary ? (
                                <CheckCircle2 className="w-5 h-5 text-blue-600 fill-current" />
                            ) : (
                                <Circle className="w-5 h-5 text-gray-300" />
                            )}
                            <span className={cn("text-xs font-medium", item.isPrimary ? "text-blue-600" : "text-gray-400")}>
                                Primary
                            </span>
                        </div>
                        <button
                            onClick={() => handleRemoveField(key, item.id)}
                            className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => handleAddField(key)}
                    className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700 px-1"
                >
                    <Plus className="w-4 h-4" /> {addLabel}
                </button>
            </div>
        );
    };

    // Render Helper
    const renderField = (item: FormLayoutItem) => {
        if (!item.visible) return null;

        // Custom Fields
        if (item.isCustom) {
            // System Fields are hidden from the form
            if (['createdBy', 'createdAt', 'editedBy', 'editedAt', 'select', 'actions'].includes(item.id)) {
                return null;
            }

            // --- Multi-Select Check for Custom Fields ---
            if (item.isMultiSelect && ['email', 'phone', 'address'].includes(item.type || '')) {
                // Ensure data is initialized as array if it is currently a string or null
                if (!Array.isArray(formData[item.id])) {
                    // We can't safely setState during render. 
                    // Render using a fallback or treat current string as first item.
                    const existingVal = formData[item.id];
                    const initList = existingVal
                        ? [{ id: '1', value: existingVal, type: 'Work', isPrimary: true }]
                        : [{ id: '1', value: '', type: 'Work', isPrimary: true }];

                    // We temporarily mock the list for render, but we need to update state?
                    // Better: handle this in handleAddField if list is missing?
                    // Actually, let's just use the initList for rendering. 
                    // The 'onChange' handlers need to handle the transition from string to array if needed?
                    // No, 'handleUpdateArrayItem' expects an array.
                    // Solution: Use a useEffect or key-based reset to ensure formData is correct?
                    // OR just coercing it here for the purposes of the 'renderArrayField' helper?
                    // Let's pass the coerced list to renderArrayField if we modify it to accept user provided list?
                    // No, keep it simple: renderArrayField reads state. Use a layout effect/or just check state?

                    // QUICK FIX: Render the array field but pass a virtualized data prop?
                    // Simpler: Just render the single input if state isn't array yet? No user wants multi.
                    // Let's coerce on the fly?
                    // If we coerce on the fly, the 'onChange' handlers need to know they are operating on a virtual array.
                    // Instead, let's allow 'renderArrayField' to take the current value as a prop, and if strictly not array, convert it.
                }

                // If formData[item.id] is NOT an array, let's force it to be one for the render, 
                // and the first interaction will set the state to an array.
                if (!Array.isArray(formData[item.id])) {
                    // Virtual array for rendering
                    const val = formData[item.id];
                    const virtualList = val
                        ? [{ id: '1', value: val, type: 'Work', isPrimary: true }]
                        : [{ id: '1', value: '', type: 'Work', isPrimary: true }];

                    // We need to intercept the handlers to set the array state on first edit.
                    // Or we can just render it. The handlers 'setFormData(prev => ...)' 
                    // will look for 'prev[key]'. If 'prev[key]' is string, 'handleUpdateArrayItem' fails.
                    // So we must fix the state.
                }
            }

            // For now, let's handle the specific Types that support multi-entry.
            if (item.isMultiSelect) {
                if (item.type === 'email' || item.type === 'phone' || item.type === 'address') {
                    // Check if state needs migration
                    if (formData[item.id] !== undefined && !Array.isArray(formData[item.id])) {
                        // This side-effect in render is bad. 
                        // But we can trigger an update in useEffect when layout changes?
                    }

                    // Safe-guard: if not array, we can't use the standard handlers easily without modifying them.
                    // Let's modify the handlers to handle migration?
                    // Modified 'handleUpdateArrayItem' etc?
                }
            }


            if (item.type === 'file') {
                return (
                    <div key={item.id} className="space-y-2">
                        <Label>
                            {item.label || item.id}
                            {item.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                onChange={(e) => updateField(item.id, e.target.files?.[0] || null)}
                                className={cn("cursor-pointer", !formData[item.id] ? "text-gray-500" : "")}
                            />
                        </div>
                        {formData[item.id] && formData[item.id] instanceof File && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Selected: {formData[item.id].name}
                            </p>
                        )}
                        {/* Display existing value if it's a URL string */}
                        {typeof formData[item.id] === 'string' && formData[item.id] && (
                            <p className="text-xs text-blue-600 truncate">Current: {formData[item.id]}</p>
                        )}
                    </div>
                );
            }

            if (item.type === 'image') {
                const previewUrl = formData[item.id] instanceof File
                    ? URL.createObjectURL(formData[item.id])
                    : (typeof formData[item.id] === 'string' ? formData[item.id] : null);

                return (
                    <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors overflow-hidden bg-gray-50">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Upload className="w-6 h-6" />
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {item.label || item.id}
                                {item.required && <span className="text-red-500 ml-1">*</span>}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" className="h-8 text-xs bg-white border border-gray-200 shadow-sm" onClick={() => document.getElementById(`file-${item.id}`)?.click()}>
                                    Upload Image
                                </Button>
                                {formData[item.id] && (
                                    <Button variant="tertiary" className="h-8 w-8 p-0 text-red-500" onClick={() => updateField(item.id, null)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            <input
                                id={`file-${item.id}`}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => updateField(item.id, e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>
                );
            }

            if (item.type === 'date') {
                return (
                    <div key={item.id} className="space-y-2">
                        <Label>
                            {item.label || item.id}
                            {item.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            type="date"
                            value={formData[item.id] || ''}
                            onChange={(e) => updateField(item.id, e.target.value)}
                        />
                    </div>
                );
            }

            // --- Standard Field Renderers ---
            if (item.type === 'id') {
                return (
                    <div key={item.id} className="space-y-2">
                        <Label>
                            {item.label || item.id}
                        </Label>
                        <Input
                            disabled
                            value={initialData ? (formData[item.id] || '') : "Auto-generated"}
                            className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-mono text-xs"
                        />
                    </div>
                );
            }

            // --- Multi-Select / Array Logic ---
            if (item.isMultiSelect && ['email', 'phone', 'address'].includes(item.type || '')) {
                // Determine effective type for helper
                const effectType = item.type || 'email';
                return renderArrayField(item.id, item.label || item.id, effectType);
            }

            if (item.type === 'phone') {
                return (
                    <div key={item.id} className="space-y-2">
                        <Label>
                            {item.label || item.id}
                            {item.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            type="tel"
                            placeholder="xxx-xxx-xxxx"
                            value={formData[item.id] || ''}
                            onChange={(e) => {
                                // Auto-formatting: xxx-xxx-xxxx
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 3 && val.length <= 6) {
                                    val = val.slice(0, 3) + '-' + val.slice(3);
                                } else if (val.length > 6) {
                                    val = val.slice(0, 3) + '-' + val.slice(3, 6) + '-' + val.slice(6, 12);
                                }
                                updateField(item.id, val);
                            }}
                        />
                    </div>
                );
            }

            if (item.type === 'currency') {
                return (
                    <div key={item.id} className="space-y-2">
                        <Label>
                            {item.label || item.id}
                            {item.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                                type="number"
                                step="0.01"
                                className="pl-6"
                                placeholder="0.00"
                                value={formData[item.id] || ''}
                                onChange={(e) => updateField(item.id, e.target.value)}
                            />
                        </div>
                    </div>
                );
            }

            if ((item.type === 'select' || item.type === 'badge') && item.dropdownOptions) {
                if (item.isMultiSelect) {
                    return (
                        <div key={item.id} className="space-y-2">
                            <Label>
                                {item.label || item.id}
                                {item.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <MultiSelect
                                options={item.dropdownOptions}
                                value={Array.isArray(formData[item.id]) ? formData[item.id] : (formData[item.id] ? [formData[item.id].toString()] : [])}
                                onChange={(val) => updateField(item.id, val)}
                                placeholder={`Select ${item.label || item.id}...`}
                            />
                        </div>
                    );
                } else {
                    return (
                        <div key={item.id} className="space-y-2">
                            <Label>
                                {item.label || item.id}
                                {item.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Select value={formData[item.id] || ''} onValueChange={(val) => updateField(item.id, val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={`Select ${item.label || item.id}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {item.dropdownOptions.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    );
                }
            }

            // Fallback for address/other custom types
            return (
                <div key={item.id} className="space-y-2">
                    <Label>
                        {item.label || item.id}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                        value={formData[item.id] || ''}
                        onChange={(e) => updateField(item.id, e.target.value)}
                        placeholder={item.type === 'address' ? 'Enter address (Google Maps placeholder)' : `Enter ${item.label || item.id}`}
                    />
                </div>
            );
        }

        // Standard Fields
        switch (item.id) {
            case 'logo':
                return (
                    <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors overflow-hidden bg-gray-50">
                            {formData.logo ? (
                                <img
                                    src={formData.logo instanceof File ? URL.createObjectURL(formData.logo) : formData.logo}
                                    alt="Logo"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Upload className="w-6 h-6" />
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{singularName} Logo</div>
                            <Button variant="secondary" className="h-8 text-xs bg-white border border-gray-200 shadow-sm" onClick={() => document.getElementById('logo-upload')?.click()}>
                                Upload Logo
                            </Button>
                            <input
                                id="logo-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => updateField('logo', e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>
                );
            case 'id':
                return (
                    <div key={item.id} className="space-y-2">
                        <Label>{item.label || `${singularName} ID`}</Label>
                        <Input value={formData.id || ''} readOnly className="bg-gray-50 text-gray-500" />
                    </div>
                );
            case 'name':
                return (
                    <div key={item.id} className="space-y-2">
                        <Label>{item.label || 'Name'}</Label>
                        <Input
                            placeholder={`${singularName} Name`}
                            value={formData.name || ''}
                            onChange={(e) => updateField('name', e.target.value)}
                        />
                    </div>
                );
            case 'owner':
                return (
                    <div key={item.id} className="space-y-2">
                        <Label>{item.label || 'Owner'}</Label>
                        <Input
                            placeholder={`${singularName} Owner`}
                            value={formData.owner || ''}
                            onChange={(e) => updateField('owner', e.target.value)}
                        />
                    </div>
                );
            case 'emails':
                return renderArrayField('emails', item.label || 'Email Address', 'email');
            case 'phones':
                return renderArrayField('phones', item.label || 'Phone Number', 'phone');
            case 'addresses':
                return renderArrayField('addresses', item.label || 'Address', 'address');
            case 'industry':
                return (
                    <div key={item.id} className="space-y-2">
                        <Label>{item.label || 'Industry Type'}</Label>
                        <Select value={formData.industry || ''} onValueChange={(val) => updateField('industry', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Industry" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Technology">Technology</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                <SelectItem value="Retail">Retail</SelectItem>
                                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );
            case 'website':
                return (
                    <div key={item.id} className="space-y-2">
                        <Label>{item.label || 'Website'}</Label>
                        <Input
                            placeholder="Website URL"
                            value={formData.website || ''}
                            onChange={(e) => updateField('website', e.target.value)}
                        />
                    </div>
                );
            case 'services':
                return (
                    <div key={item.id} className="space-y-2">
                        <Label>{item.label || 'Services'}</Label>
                        <Textarea
                            placeholder="List services offered"
                            value={formData.services || ''}
                            onChange={(e) => updateField('services', e.target.value)}
                            className="resize-y"
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? `Edit ${singularName}` : `Add New ${singularName}`}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {(layout || []).map(item => renderField(item))}
                </div>

                <DialogFooter>
                    <div className="flex w-full justify-end gap-2">
                        <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSubmit}>{initialData ? 'Save Changes' : `Save ${singularName}`}</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
