'use client';

import React, { useState, useMemo } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings2, GripVertical, AlignLeft, AlignCenter, AlignRight, Palette, Plus, Pin, Trash2, ArrowUp, X, Eye, Settings } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription
} from '@/components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useTableConfig } from './useTableConfig';
import { IconPicker } from '@/components/ui/IconPicker';
import { ColumnConfig, GlobalStyle, ColumnType, CellStyle, FormLayoutItem, DetailLayout } from './types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface DataTableViewOptionsProps {
    config: ReturnType<typeof useTableConfig>;
    trigger?: React.ReactNode;
    mode?: 'sheet' | 'dialog';
    showDetailCard?: boolean;
    onShowDetailCardChange?: (show: boolean) => void;
}



function AddColumnDialog({ onAdd }: { onAdd: (name: string, type: ColumnType, extra?: { displayStyle?: 'text' | 'badge'; dropdownOptions?: string[]; isMultiSelect?: boolean; idPrefix?: string }) => void }) {
    const [name, setName] = useState('');
    const [type, setType] = useState<ColumnType>('text');
    const [displayStyle, setDisplayStyle] = useState<'text' | 'badge'>('text');
    const [options, setOptions] = useState('');
    const [isMultiSelect, setIsMultiSelect] = useState(false);
    const [idPrefix, setIdPrefix] = useState(''); // New State for ID Prefix
    const [open, setOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name) {
            onAdd(name, type, {
                displayStyle: type === 'select' ? displayStyle : undefined,
                dropdownOptions: (type === 'select' || type === 'badge') ? options.split(/[,\n]+/).map(s => s.trim()).filter(Boolean) : undefined,
                isMultiSelect: ['select', 'badge', 'email', 'phone', 'address'].includes(type) ? isMultiSelect : undefined,
                idPrefix: type === 'id' ? idPrefix : undefined // Include prefix
            });
            setOpen(false);
            setName('');
            setType('text');
            setOptions('');
            setDisplayStyle('text');
            setIsMultiSelect(false);
            setIdPrefix('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="w-full text-xs dashed border-dashed bg-transparent border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    Add Column
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Column</DialogTitle>
                    <DialogDescription>
                        Create a custom column for your table.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g. Project Status"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type
                        </Label>
                        <Select value={type} onValueChange={(val: ColumnType) => setType(val)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="badge">Badge</SelectItem>
                                <SelectItem value="select">Drop-down</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="address">Address</SelectItem>
                                <SelectItem value="currency">Currency</SelectItem>
                                <SelectItem value="url">URL / Website</SelectItem>
                                <SelectItem value="file">File Upload</SelectItem>
                                <SelectItem value="image">Logo/Profile Picture</SelectItem>
                                <SelectItem value="id">ID</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {type === 'id' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="idPrefix" className="text-right">
                                ID Prefix
                            </Label>
                            <Input
                                id="idPrefix"
                                value={idPrefix}
                                onChange={(e) => setIdPrefix(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. INV-"
                            />
                        </div>
                    )}

                    {type === 'select' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="displayStyle" className="text-right">
                                Style
                            </Label>
                            <Select value={displayStyle} onValueChange={(val: 'text' | 'badge') => setDisplayStyle(val)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Display Style" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="badge">Badge</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {(type === 'select' || type === 'badge' || type === 'email' || type === 'phone' || type === 'address') && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="multiSelect" className="text-right">
                                {(type === 'select' || type === 'badge') ? 'Selection' : 'Entries'}
                            </Label>
                            <div className="flex items-center gap-2 col-span-3">
                                <Switch
                                    id="multiSelect"
                                    checked={isMultiSelect}
                                    onCheckedChange={setIsMultiSelect}
                                />
                                <span className="text-xs text-slate-500">
                                    {(type === 'select' || type === 'badge')
                                        ? (isMultiSelect ? 'Multi-select' : 'Single-select')
                                        : (isMultiSelect ? 'Allow Multiple Entries' : 'Single Entry Only')
                                    }
                                </span>
                            </div>
                        </div>
                    )}

                    {(type === 'select' || type === 'badge') && (
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="options" className="text-right pt-2">
                                Options
                            </Label>
                            <Textarea
                                id="options"
                                value={options}
                                onChange={(e) => setOptions(e.target.value)}
                                className="col-span-3"
                                placeholder="Option 1, Option 2 (or new lines)"
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit">Add Column</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditColumnDialog({ column, onUpdate, children, availableColumns }: { column: ColumnConfig, onUpdate: (id: string, updates: Partial<ColumnConfig>) => void, children: React.ReactNode, availableColumns?: ColumnConfig[] }) {
    const [name, setName] = useState(column.label);
    const [type, setType] = useState<ColumnType>(column.type);
    const [displayStyle, setDisplayStyle] = useState<'text' | 'badge'>(column.displayStyle || 'text');
    const [options, setOptions] = useState(column.dropdownOptions?.join(', ') || '');
    const [isMultiSelect, setIsMultiSelect] = useState(column.isMultiSelect || false);
    const [idPrefix, setIdPrefix] = useState(column.idPrefix || ''); // Edit State
    const [width, setWidth] = useState(column.width || '');

    // Icon State
    const [icon, setIcon] = useState(column.icon || '');
    const [showIconInTable, setShowIconInTable] = useState(column.showIconInTable || false);
    const [showIconInCard, setShowIconInCard] = useState(column.showIconInCard || false);

    // Merge State
    const [mergeWithColumnId, setMergeWithColumnId] = useState(column.mergeWithColumnId || 'none');

    const [open, setOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(column.id, {
            label: name,
            width: width || undefined,
            type,
            displayStyle: type === 'select' ? displayStyle : undefined,
            dropdownOptions: (type === 'select' || type === 'badge') ? options.split(/[,\n]+/).map(s => s.trim()).filter(Boolean) : undefined,
            isMultiSelect: ['select', 'badge', 'email', 'phone', 'address'].includes(type) ? isMultiSelect : undefined,
            idPrefix: type === 'id' ? idPrefix : undefined,
            icon,
            showIconInTable,
            showIconInCard,
            mergeWithColumnId: mergeWithColumnId === 'none' ? undefined : mergeWithColumnId
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Column</DialogTitle>
                    <DialogDescription>
                        Modify column details.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-width" className="text-right">
                            Width
                        </Label>
                        <Input
                            id="edit-width"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g. 200px, auto"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                            Icon
                        </Label>
                        <div className="col-span-3 space-y-3">
                            <IconPicker value={icon} onChange={setIcon} />

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="showIconTable"
                                        checked={showIconInTable}
                                        onCheckedChange={setShowIconInTable}
                                        className="scale-75 origin-left"
                                    />
                                    <Label htmlFor="showIconTable" className="text-xs text-slate-500 font-normal">Show in Table</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="showIconCard"
                                        checked={showIconInCard}
                                        onCheckedChange={setShowIconInCard}
                                        className="scale-75 origin-left"
                                    />
                                    <Label htmlFor="showIconCard" className="text-xs text-slate-500 font-normal">Show in Card</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-type" className="text-right">
                            Type
                        </Label>
                        <Select value={type} onValueChange={(val: ColumnType) => setType(val)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="badge">Badge</SelectItem>
                                <SelectItem value="select">Drop-down</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="address">Address</SelectItem>
                                <SelectItem value="currency">Currency</SelectItem>
                                <SelectItem value="url">URL / Website</SelectItem>
                                <SelectItem value="file">File Upload</SelectItem>
                                <SelectItem value="image">Logo/Profile Picture</SelectItem>
                                <SelectItem value="id">ID</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {type === 'id' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-idPrefix" className="text-right">
                                ID Prefix
                            </Label>
                            <Input
                                id="edit-idPrefix"
                                value={idPrefix}
                                onChange={(e) => setIdPrefix(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. INV-"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-merge" className="text-right">
                            Merge With
                        </Label>
                        <Select value={mergeWithColumnId} onValueChange={setMergeWithColumnId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {availableColumns?.filter(c => c.id !== column.id).map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {type === 'select' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-displayStyle" className="text-right">
                                Style
                            </Label>
                            <Select value={displayStyle} onValueChange={(val: 'text' | 'badge') => setDisplayStyle(val)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Display Style" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="badge">Badge</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {(type === 'select' || type === 'badge' || type === 'email' || type === 'phone' || type === 'address') && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-multiSelect" className="text-right">
                                {(type === 'select' || type === 'badge') ? 'Selection' : 'Entries'}
                            </Label>
                            <div className="flex items-center gap-2 col-span-3">
                                <Switch
                                    id="edit-multiSelect"
                                    checked={isMultiSelect}
                                    onCheckedChange={setIsMultiSelect}
                                />
                                <span className="text-xs text-slate-500">
                                    {(type === 'select' || type === 'badge')
                                        ? (isMultiSelect ? 'Multi-select' : 'Single-select')
                                        : (isMultiSelect ? 'Allow Multiple Entries' : 'Single Entry Only')
                                    }
                                </span>
                            </div>
                        </div>
                    )}

                    {(type === 'select' || type === 'badge') && (
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="edit-options" className="text-right pt-2">
                                Options
                            </Label>
                            <Textarea
                                id="edit-options"
                                value={options}
                                onChange={(e) => setOptions(e.target.value)}
                                className="col-span-3"
                                placeholder="Option 1, Option 2, Option 3"
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface SortableColumnItemProps {
    column: ColumnConfig;
    onUpdateColumn?: (id: string, updates: Partial<ColumnConfig>) => void;
    onRemoveColumn?: (id: string) => void;
    onUpdateStyle?: (id: string, style: Partial<ColumnConfig['style']>) => void;
    showDrag?: boolean;
    showVisibility?: boolean;
    showStyling?: boolean;
}

// ... SortableColumnItemProps

function GlobalStyleSection({
    title,
    style,
    onUpdate
}: {
    title: string;
    style?: GlobalStyle;
    onUpdate: (updates: Partial<GlobalStyle>) => void;
}) {
    if (!style) return null;

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
            <h5 className="font-medium text-sm text-gray-900 dark:text-gray-100">{title}</h5>
            <div className="grid grid-cols-2 gap-4">
                {/* Background Color */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Background Color</Label>
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded border shadow-sm overflow-hidden">
                            <input
                                type="color"
                                value={style.backgroundColor || '#ffffff'}
                                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                                className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer"
                            />
                        </div>
                        <Input
                            type="text"
                            value={style.backgroundColor || ''}
                            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                            placeholder="#FFFFFF"
                            className="h-8 text-xs font-mono"
                        />
                    </div>
                </div>

                {/* Text Color */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Text Color</Label>
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded border shadow-sm overflow-hidden">
                            <input
                                type="color"
                                value={style.textColor || '#000000'}
                                onChange={(e) => onUpdate({ textColor: e.target.value })}
                                className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer"
                            />
                        </div>
                        <Input
                            type="text"
                            value={style.textColor || ''}
                            onChange={(e) => onUpdate({ textColor: e.target.value })}
                            placeholder="#000000"
                            className="h-8 text-xs font-mono"
                        />
                    </div>
                </div>

                {/* Text Size */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Text Size</Label>
                    <Select
                        value={style.textSize || 'sm'}
                        onValueChange={(val: string) => onUpdate({ textSize: val as GlobalStyle['textSize'] })}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="xs">Extra Small (XS)</SelectItem>
                            <SelectItem value="sm">Small (SM)</SelectItem>
                            <SelectItem value="base">Medium (Base)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Font Weight */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Font Weight</Label>
                    <Select
                        value={style.fontWeight || 'normal'}
                        onValueChange={(val: string) => onUpdate({ fontWeight: val as GlobalStyle['fontWeight'] })}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Weight" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="semibold">Semibold</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Font Family */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Font Type</Label>
                    <Select
                        value={style.fontFamily || 'inherit'}
                        onValueChange={(val: string) => onUpdate({ fontFamily: val === 'inherit' ? undefined : val })}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Font" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="inherit">Default</SelectItem>
                            <SelectItem value="var(--font-geist-sans), sans-serif">Geist Sans</SelectItem>
                            <SelectItem value="var(--font-geist-mono), monospace">Geist Mono</SelectItem>
                            <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                            <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                            <SelectItem value="serif">Serif</SelectItem>
                            <SelectItem value="monospace">Monospace</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Alignment */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Alignment</Label>
                    <div className="flex bg-white dark:bg-gray-800 rounded-md border p-0.5">
                        <button
                            onClick={() => onUpdate({ alignment: 'left' })}
                            className={cn(
                                "flex-1 flex justify-center p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all",
                                style.alignment === 'left' && "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                            )}
                            title="Align Left"
                        >
                            <AlignLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => onUpdate({ alignment: 'center' })}
                            className={cn(
                                "flex-1 flex justify-center p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all",
                                style.alignment === 'center' && "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                            )}
                            title="Align Center"
                        >
                            <AlignCenter className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => onUpdate({ alignment: 'right' })}
                            className={cn(
                                "flex-1 flex justify-center p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all",
                                style.alignment === 'right' && "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                            )}
                            title="Align Right"
                        >
                            <AlignRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Text Wrapping */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Text Wrapping</Label>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={style.textWrap === 'wrap'}
                            onCheckedChange={(checked) => onUpdate({ textWrap: checked ? 'wrap' : 'nowrap' })}
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            {style.textWrap === 'wrap' ? 'Wrap' : 'No Wrap'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SortableColumnItem({
    column,
    onUpdateColumn,
    onRemoveColumn,
    onUpdateStyle,
    showDrag = true,
    showVisibility = true,
    showStyling = true,
    availableColumns
}: SortableColumnItemProps & { availableColumns?: ColumnConfig[] }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: column.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
    };

    const isSystemColumn = column.isMandatory || ['id', 'select', 'actions'].includes(column.id);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex flex-col gap-3 p-3 bg-white dark:bg-card-bg border rounded-md mb-2 group",
                isDragging ? "shadow-lg ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 opacity-90" : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
            )}
        >
            <div className="flex items-center gap-3 w-full">
                {/* Drag Handle */}
                {showDrag && (
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-move text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 shrink-0"
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>
                )}

                {/* Label - flex-1 to push toggles to the right */}
                <div className="flex-1 font-medium text-sm flex items-center gap-2 group/label min-w-0">
                    {onUpdateColumn ? (
                        <EditColumnDialog column={column} onUpdate={onUpdateColumn} availableColumns={availableColumns}>
                            <button className="hover:underline hover:text-blue-600 truncate text-left focus:outline-none">
                                {column.label}
                            </button>
                        </EditColumnDialog>
                    ) : (
                        <span className="truncate">{column.label}</span>
                    )}
                </div>

                {/* Delete Button (Custom Cols Only) */}
                {onRemoveColumn && !isSystemColumn && (
                    <Button
                        variant="tertiary"
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                            if (confirm(`Are you sure you want to delete column "${column.label}"?`)) {
                                onRemoveColumn(column.id);
                            }
                        }}
                        title="Delete Column"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                )}

                {/* Pin Toggle - Moved to Right */}
                {onUpdateColumn && (
                    <Button
                        variant="tertiary"
                        className={cn(
                            "h-6 w-6 p-0 mr-1 flex items-center justify-center transition-colors shrink-0",
                            column.pinned === 'left' ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" :
                                column.pinned === 'right' ? "text-green-600 bg-green-50 dark:bg-green-900/20" :
                                    "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        )}
                        onClick={() => {
                            const nextState = column.pinned === 'left' ? 'right' : column.pinned === 'right' ? null : 'left';
                            onUpdateColumn(column.id, { pinned: nextState });
                        }}
                        title={column.pinned === 'left' ? "Pinned Left (Click to Pin Right)" : column.pinned === 'right' ? "Pinned Right (Click to Unpin)" : "Pin Column"}
                    >
                        <Pin className={cn("h-3.5 w-3.5", column.pinned && "fill-current")} />
                    </Button>
                )}

                {/* Styling Options Trigger - Moved before switch */}
                {((column.type === 'badge') || (column.type === 'select' && column.displayStyle === 'badge')) && onUpdateColumn && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="tertiary" className="h-8 w-8 p-0 mr-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 flex items-center justify-center">
                                <Palette className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="end">
                            <GlobalStyleSection
                                title={`${column.label} Style`}
                                style={column.badgeStyle || {
                                    backgroundColor: '#f1f5f9',
                                    textColor: '#334155',
                                    textSize: 'xs',
                                    fontWeight: 'normal',
                                    alignment: 'center'
                                }}
                                onUpdate={(updates) => onUpdateColumn(column.id, {
                                    badgeStyle: { ...column.badgeStyle, ...updates } as GlobalStyle
                                })}
                            />
                        </PopoverContent>
                    </Popover>
                )}

                {/* Helper component for labeled switch */}
                {showVisibility && onUpdateColumn && (
                    <div className="flex items-center gap-6 mr-4 shrink-0">
                        {/* Show/Hide Toggle */}
                        <div className="flex items-center gap-2">
                            <Label htmlFor={`vis-${column.id}`} className="text-xs text-slate-500 font-normal">Show</Label>
                            <Switch
                                id={`vis-${column.id}`}
                                className="scale-75 origin-left"
                                checked={column.isVisible}
                                onCheckedChange={(checked) => onUpdateColumn(column.id, { isVisible: checked })}
                            />
                        </div>
                    </div>
                )}

                {showStyling && onUpdateStyle && column.type !== 'badge' && (
                    <div className="flex items-center gap-1 border-l pl-3 dark:border-gray-700 ml-auto">
                        <Select
                            value={column.style.textSize || 'sm'}
                            onValueChange={(val: string) => onUpdateStyle(column.id, { textSize: val as CellStyle['textSize'] })}
                        >
                            <SelectTrigger className="h-7 w-[70px] text-xs">
                                <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="xs">XS</SelectItem>
                                <SelectItem value="sm">SM</SelectItem>
                                <SelectItem value="base">MD</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-0.5 ml-2">
                            <button
                                onClick={() => onUpdateStyle(column.id, { alignment: 'left' })}
                                className={cn(
                                    "p-1 rounded hover:bg-white dark:hover:bg-gray-700 transition-all",
                                    column.style.alignment === 'left' && "bg-white dark:bg-gray-700 shadow-sm text-blue-600"
                                )}
                                title="Align Left"
                            >
                                <AlignLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => onUpdateStyle(column.id, { alignment: 'center' })}
                                className={cn(
                                    "p-1 rounded hover:bg-white dark:hover:bg-gray-700 transition-all",
                                    column.style.alignment === 'center' && "bg-white dark:bg-gray-700 shadow-sm text-blue-600"
                                )}
                                title="Align Center"
                            >
                                <AlignCenter className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => onUpdateStyle(column.id, { alignment: 'right' })}
                                className={cn(
                                    "p-1 rounded hover:bg-white dark:hover:bg-gray-700 transition-all",
                                    column.style.alignment === 'right' && "bg-white dark:bg-gray-700 shadow-sm text-blue-600"
                                )}
                                title="Align Right"
                            >
                                <AlignRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}




function SortableFormItem({
    item,
    onUpdate
}: {
    item: FormLayoutItem;
    onUpdate: (id: string, updates: Partial<FormLayoutItem>) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-3 p-3 bg-white dark:bg-card-bg border rounded-md mb-2 group",
                isDragging ? "shadow-lg ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 opacity-90" : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-move text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 shrink-0"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            <div className="flex-1 font-medium text-sm text-slate-700 dark:text-slate-300">
                {item.label ? (
                    <span className="flex items-center gap-2">
                        {item.label}
                        {item.isCustom && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border">Custom</span>}
                    </span>
                ) : (
                    <span className="capitalize">{item.id}</span>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Label htmlFor={`form-req-${item.id}`} className="text-xs text-slate-500 font-normal">Required</Label>
                    <Switch
                        id={`form-req-${item.id}`}
                        className="scale-75 origin-right"
                        checked={item.required || false}
                        onCheckedChange={(checked) => onUpdate(item.id, { required: checked })}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor={`form-vis-${item.id}`} className="text-xs text-slate-500 font-normal">Show</Label>
                    <Switch
                        id={`form-vis-${item.id}`}
                        className="scale-75 origin-right"
                        checked={item.visible}
                        onCheckedChange={(checked) => onUpdate(item.id, { visible: checked })}
                    />
                </div>
            </div>
        </div>
    );
}

export function DataTableViewOptions({ config, trigger, mode = 'sheet', showDetailCard, onShowDetailCardChange }: DataTableViewOptionsProps) {
    const { sortedColumns, reorderColumns, updateColumn, addColumn, removeColumn } = config;

    const handleAddColumn = (name: string, type: ColumnType, extra?: { displayStyle?: 'text' | 'badge'; dropdownOptions?: string[]; isMultiSelect?: boolean }) => {
        if (addColumn) {
            const id = name.toLowerCase().replace(/\s+/g, '-');
            addColumn({
                id,
                label: name,
                isVisible: true,
                order: sortedColumns.length,
                type,
                displayStyle: extra?.displayStyle,
                dropdownOptions: extra?.dropdownOptions,
                isMultiSelect: extra?.isMultiSelect,
                style: {
                    alignment: 'left',
                    textSize: 'sm',
                    fontWeight: 'normal'
                },
                badgeStyle: (type === 'badge' || (type === 'select' && extra?.displayStyle === 'badge')) ? {
                    backgroundColor: '#f1f5f9',
                    textColor: '#334155',
                    textSize: 'xs',
                    fontWeight: 'normal',
                    alignment: 'center'
                } : undefined
            });
        }
    };

    // Sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = sortedColumns.findIndex((item) => item.id === active.id);
            const newIndex = sortedColumns.findIndex((item) => item.id === over?.id);
            // Create new order array of IDs
            const newOrder = arrayMove(sortedColumns.map(c => c.id), oldIndex, newIndex);
            reorderColumns(newOrder);
        }
    };

    const handleFormDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const layout = config.config?.entityConfig?.layout;
        if (layout && active.id !== over?.id) {
            const oldIndex = layout.findIndex((item) => item.id === active.id);
            const newIndex = layout.findIndex((item) => item.id === over?.id);
            const newLayout = arrayMove(layout, oldIndex, newIndex);
            config.updateEntityConfig?.({ layout: newLayout });
        }
    };

    const updateFormItem = (itemId: string, updates: Partial<FormLayoutItem>) => {
        const layout = config.config?.entityConfig?.layout;
        if (layout) {
            const newLayout = layout.map(item => item.id === itemId ? { ...item, ...updates } : item);
            config.updateEntityConfig?.({ layout: newLayout });
        }
    };



    const handleActionDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = (config.config?.actions || []).findIndex((i) => i.id === active.id);
            const newIndex = (config.config?.actions || []).findIndex((i) => i.id === over.id);

            const newActions = arrayMove(config.config?.actions || [], oldIndex, newIndex);
            config.updateActions?.(newActions);
        }
    };

    const content = (
        <Tabs defaultValue="columns" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="columns">Columns</TabsTrigger>
                <TabsTrigger value="alignment">Styles</TabsTrigger>
                <TabsTrigger value="form-config">Form</TabsTrigger>
                <TabsTrigger value="detail">Detail Card</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="form-config" className="space-y-6">
                <div>
                    <h4 className="text-sm font-medium mb-4 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Entity Configuration
                    </h4>
                    <p className="text-sm text-slate-500 mb-6">
                        Configure the entity name and available form fields for the "New Item" dialog.
                    </p>

                    <div className="space-y-6">
                        {/* Entity Names */}
                        <div className="p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-900/50 grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="singularName">Singular Name</Label>
                                <Input
                                    id="singularName"
                                    value={config.config?.entityConfig?.singularName || ''}
                                    onChange={(e) => config.updateEntityConfig?.({ singularName: e.target.value })}
                                    placeholder="e.g. Customer"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pluralName">Plural Name</Label>
                                <Input
                                    id="pluralName"
                                    value={config.config?.entityConfig?.pluralName || ''}
                                    onChange={(e) => config.updateEntityConfig?.({ pluralName: e.target.value })}
                                    placeholder="e.g. Customers"
                                />
                            </div>
                        </div>

                        {/* Form Builder */}
                        <div>
                            <h5 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Form Layout</h5>
                            <p className="text-xs text-slate-500 mb-4">Drag to reorder fields. Use the switch to toggle visibility.</p>

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleFormDragEnd}
                            >
                                <SortableContext
                                    items={(config.config?.entityConfig?.layout || []).map(i => i.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-0">
                                        {(config.config?.entityConfig?.layout || []).map((item) => (
                                            <SortableFormItem
                                                key={item.id}
                                                item={item}
                                                onUpdate={updateFormItem}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="columns" className="space-y-6">
                <div>
                    <h4 className="text-sm font-medium mb-4 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Manage Columns
                    </h4>
                    <p className="text-sm text-slate-500 mb-4">
                        Drag to reorder columns. Toggle switches to show or hide them.
                    </p>

                    <AddColumnDialog onAdd={handleAddColumn} />

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={sortedColumns.map(c => c.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-0">
                                {sortedColumns.map((column) => (
                                    <SortableColumnItem
                                        key={column.id}
                                        column={column}
                                        onUpdateColumn={updateColumn}
                                        onRemoveColumn={removeColumn}
                                        showStyling={false}
                                        availableColumns={sortedColumns}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </TabsContent>

            <TabsContent value="alignment" className="space-y-6">
                <div>
                    <h4 className="text-sm font-medium mb-4 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Table Styles
                    </h4>
                    <p className="text-sm text-slate-500 mb-6">
                        Customize the appearance of the table header and rows.
                    </p>

                    <div className="space-y-6">
                        <GlobalStyleSection
                            title="Table Header"
                            style={config.config?.headerStyle}
                            onUpdate={(updates) => config.updateGlobalStyle?.('header', updates)}
                        />
                        <GlobalStyleSection
                            title="Table Rows"
                            style={config.config?.rowStyle}
                            onUpdate={(updates) => config.updateGlobalStyle?.('row', updates)}
                        />

                        <div>
                            <h4 className="text-sm font-medium mb-4 text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-8">
                                Card Styles
                            </h4>
                            <div className="space-y-6">
                                <GlobalStyleSection
                                    title="Card Top"
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    style={(config.config?.entityConfig?.detailStyles?.top || { alignment: 'left', textColor: '#000000', backgroundColor: '#ffffff' }) as any}
                                    onUpdate={(updates) => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const current = config.config?.entityConfig || {} as any;
                                        const styles = current.detailStyles || {};
                                        config.updateEntityConfig?.({
                                            detailStyles: {
                                                ...styles,
                                                top: { ...styles.top, ...updates } as any // Cast for textSize mismatch
                                            }
                                        });
                                    }}
                                />
                                <GlobalStyleSection
                                    title="Card Left"
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    style={(config.config?.entityConfig?.detailStyles?.left || { alignment: 'left', textColor: '#000000', backgroundColor: '#ffffff' }) as any}
                                    onUpdate={(updates) => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const current = config.config?.entityConfig || {} as any;
                                        const styles = current.detailStyles || {};
                                        config.updateEntityConfig?.({
                                            detailStyles: {
                                                ...styles,
                                                left: { ...styles.left, ...updates } as any
                                            }
                                        });
                                    }}
                                />
                                <GlobalStyleSection
                                    title="Card Right"
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    style={(config.config?.entityConfig?.detailStyles?.right || { alignment: 'left', textColor: '#000000', backgroundColor: '#ffffff' }) as any}
                                    onUpdate={(updates) => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const current = config.config?.entityConfig || {} as any;
                                        const styles = current.detailStyles || {};
                                        config.updateEntityConfig?.({
                                            detailStyles: {
                                                ...styles,
                                                right: { ...styles.right, ...updates } as any
                                            }
                                        });
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium mb-4 text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-8">
                                Button Styles
                            </h4>
                            <div className="space-y-6">
                                <ButtonStyleSection
                                    title="Default Buttons"
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    style={(config.config?.entityConfig?.buttonStyles?.default || { backgroundColor: '#ffffff', textColor: '#0f172a', iconColor: '#64748b', borderColor: '#e2e8f0', fontWeight: 'medium' }) as any}
                                    onUpdate={(updates) => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const current = config.config?.entityConfig || {} as any;
                                        const styles = current.buttonStyles || {};
                                        config.updateEntityConfig?.({
                                            buttonStyles: {
                                                ...styles,
                                                default: { ...styles.default, ...updates } as any
                                            }
                                        });
                                    }}
                                />
                                <ButtonStyleSection
                                    title="Primary Buttons"
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    style={(config.config?.entityConfig?.buttonStyles?.primary || { backgroundColor: '#ffffff', textColor: '#0f172a', iconColor: '#64748b', borderColor: '#e2e8f0', fontWeight: 'medium' }) as any}
                                    onUpdate={(updates) => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const current = config.config?.entityConfig || {} as any;
                                        const styles = current.buttonStyles || {};
                                        config.updateEntityConfig?.({
                                            buttonStyles: {
                                                ...styles,
                                                primary: { ...styles.primary, ...updates } as any
                                            }
                                        });
                                    }}
                                />
                                <ButtonStyleSection
                                    title="Secondary Buttons"
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    style={(config.config?.entityConfig?.buttonStyles?.secondary || { backgroundColor: '#ffffff', textColor: '#0f172a', iconColor: '#64748b', borderColor: '#e2e8f0', fontWeight: 'medium' }) as any}
                                    onUpdate={(updates) => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const current = config.config?.entityConfig || {} as any;
                                        const styles = current.buttonStyles || {};
                                        config.updateEntityConfig?.({
                                            buttonStyles: {
                                                ...styles,
                                                secondary: { ...styles.secondary, ...updates } as any
                                            }
                                        });
                                    }}
                                />
                                <ButtonStyleSection
                                    title="Tertiary Buttons"
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    style={(config.config?.entityConfig?.buttonStyles?.tertiary || { backgroundColor: '#ffffff', textColor: '#0f172a', iconColor: '#64748b', borderColor: '#e2e8f0', fontWeight: 'medium' }) as any}
                                    onUpdate={(updates) => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const current = config.config?.entityConfig || {} as any;
                                        const styles = current.buttonStyles || {};
                                        config.updateEntityConfig?.({
                                            buttonStyles: {
                                                ...styles,
                                                tertiary: { ...styles.tertiary, ...updates } as any
                                            }
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="detail" className="flex-1 overflow-auto p-4 space-y-6 pt-2">
                <DetailLayoutSection config={config} />
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
                <div>
                    <h4 className="text-sm font-medium mb-4 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Action Buttons
                    </h4>
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-slate-500">
                            Control which action buttons appear in the table row and detail card.
                        </p>
                        <AddActionDialog onAdd={(newAction) => {
                            const currentActions = config.config?.actions || [];
                            config.updateActions?.([...currentActions, newAction]);
                        }}>
                            <Button variant="secondary" className="h-8 gap-2">
                                <Plus className="h-4 w-4" />
                                Add Action
                            </Button>
                        </AddActionDialog>
                    </div>

                    <div className="space-y-3">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleActionDragEnd}
                        >
                            <SortableContext
                                items={(config.config?.actions || []).map(a => a.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    {config.config?.actions?.map((action, index) => (
                                        <SortableActionItem
                                            key={action.id}
                                            action={action}
                                            index={index}
                                            config={config}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
            </TabsContent>
        </Tabs >
    );

    if (mode === 'sheet') {
        return (
            <Sheet>
                <SheetTrigger asChild>
                    {trigger || (
                        <Button
                            variant="secondary"
                            className="ml-auto hidden h-8 lg:flex"
                        >
                            <Settings2 className="mr-2 h-4 w-4" />
                            View
                        </Button>
                    )}
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>View Settings</SheetTitle>
                        <SheetDescription>
                            Manage columns and table appearance.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                        {content}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="tertiary"
                        className="w-full justify-start font-normal px-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                        <Settings2 className="mr-2 h-4 w-4" />
                        Page Settings
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Page Settings</DialogTitle>
                    <DialogDescription>
                        Customize your view. Reorder columns, toggle visibility, and adjust styling.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 px-1">
                    {content}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between items-center bg-gray-50 -mx-6 -mb-6 p-4 mt-4 border-t">
                    <Button
                        type="button"
                        variant="tertiary"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => config.resetToDefaults?.()}
                    >
                        Restore Defaults
                    </Button>
                    <DialogClose asChild>
                        <Button type="button">Save</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


function DetailLayoutSection({ config }: { config: ReturnType<typeof useTableConfig> }) {
    const { config: tableConfig, sortedColumns, updateEntityConfig } = config;

    // Ensure we work with valid data
    const entityConfig = tableConfig?.entityConfig;
    if (!entityConfig) return null;

    const detailLayout = entityConfig.detailLayout || { top: [], left: [], right: [] };
    const detailStyles = entityConfig.detailStyles || {};

    // Helper to get label for standard fields or columns
    const getLabel = (id: string) => {
        if (id === 'logo') return 'Logo';
        if (id === 'name') return 'Name';
        if (id === 'industry') return 'Industry';
        if (id === 'actions') return 'Action Buttons';
        return tableConfig?.columns[id]?.label || id.replace(/([A-Z])/g, ' $1').trim();
    };

    // All available potential items (standard + columns)
    // All available potential items (standard + columns)
    const allPotentialItems = useMemo(() => {
        // Filter out system columns that shouldn't be draggable in Detail View
        const ignoredSystemColumns = ['select'];
        return sortedColumns
            .map(c => c.id)
            .filter(id => !ignoredSystemColumns.includes(id));
    }, [sortedColumns]);

    // "Hidden" are items not in any section
    const hiddenItems = useMemo(() => {
        const used = new Set([
            ...(detailLayout.top || []),
            ...(detailLayout.left || []),
            ...(detailLayout.right || [])
        ]);
        return allPotentialItems.filter(id => !used.has(id));
    }, [allPotentialItems, detailLayout]);

    // Drag Handler
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Identify source and destination containers
        const findContainer = (id: string): 'top' | 'left' | 'right' | 'hidden' | undefined => {
            if (detailLayout.top?.includes(id)) return 'top';
            if (detailLayout.left?.includes(id)) return 'left';
            if (detailLayout.right?.includes(id)) return 'right';
            if (hiddenItems.includes(id)) return 'hidden';
            if (['top', 'left', 'right', 'hidden'].includes(id)) return id as any; // Dropped on container placeholder
            return undefined;
        };

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer) return;

        // Helper to get array for container
        const getItems = (container: string) => {
            if (container === 'hidden') return hiddenItems;
            return (detailLayout as any)[container] || [];
        };

        const activeItems = getItems(activeContainer);
        const overItems = getItems(activeContainer); // Typo fixed below? No, need OVER items
        const targetItems = getItems(overContainer);

        // Move Logic
        let newLayout = { ...detailLayout };

        // If same container, Reorder
        if (activeContainer === overContainer && activeContainer !== 'hidden') {
            const oldIndex = activeItems.indexOf(activeId);
            const newIndex = targetItems.indexOf(overId);
            newLayout[activeContainer] = arrayMove(activeItems, oldIndex, newIndex);
        }
        // If different container
        else if (activeContainer !== overContainer) {
            // Remove from source
            if (activeContainer !== 'hidden') {
                newLayout[activeContainer] = activeItems.filter((id: string) => id !== activeId);
            }

            // Add to destination
            if (overContainer !== 'hidden') {
                let newDestItems = [...targetItems];
                const overIndex = newDestItems.indexOf(overId);

                if (overIndex >= 0) {
                    // Insert before dropped item
                    newDestItems.splice(overIndex, 0, activeId);
                } else {
                    // Append if dropped on container
                    newDestItems.push(activeId);
                }
                newLayout[overContainer] = newDestItems;
            }
        }

        updateEntityConfig({ detailLayout: newLayout as DetailLayout });
    };


    return (
        <div className="space-y-6">
            <DndContext
                sensors={useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="space-y-6">
                    {/* Top Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Section (Full Width)</Label>
                            <SectionStyleControl
                                style={detailStyles.top}
                                onUpdate={(s) => updateEntityConfig({ detailStyles: { ...detailStyles, top: s } })}
                            />
                        </div>
                        <DroppableZone id="top" items={detailLayout.top || []} getLabel={getLabel} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Left Column</Label>
                                <SectionStyleControl
                                    style={detailStyles.left}
                                    onUpdate={(s) => updateEntityConfig({ detailStyles: { ...detailStyles, left: s } })}
                                    showTitleInput
                                    title="Contact & Info"
                                />
                            </div>
                            <DroppableZone id="left" items={detailLayout.left || []} getLabel={getLabel} />
                        </div>

                        {/* Right Column */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Right Column</Label>
                                <SectionStyleControl
                                    style={detailStyles.right}
                                    onUpdate={(s) => updateEntityConfig({ detailStyles: { ...detailStyles, right: s } })}
                                    showTitleInput
                                    title="Details"
                                />
                            </div>
                            <DroppableZone id="right" items={detailLayout.right || []} getLabel={getLabel} />
                        </div>
                    </div>

                    {/* Hidden Items */}
                    <div className="space-y-2 pt-4 border-t">
                        <Label className="text-xs text-slate-400">Available / Hidden Fields</Label>
                        <DroppableZone id="hidden" items={hiddenItems} getLabel={getLabel} isHiddenZone />
                    </div>
                </div>
            </DndContext>

            <div className="pt-6 border-t">
                <h5 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-4">Related Cards Order</h5>
                <div className="space-y-2">
                    <CardsOrderSection config={config} />
                </div>
            </div>
        </div>
    );
}

// Helper for Section Styling
function SectionStyleControl({ style, onUpdate, title, showTitleInput }: { style?: any, onUpdate: (s: any) => void, title?: string, showTitleInput?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            {showTitleInput && (
                <Input
                    value={style?.title || title || ''}
                    onChange={(e) => onUpdate({ ...style, title: e.target.value })}
                    placeholder="Section Title"
                    className="h-7 w-[120px] text-xs px-2"
                />
            )}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded p-0.5">
                {['left', 'center', 'right'].map((align) => (
                    <button
                        key={align}
                        type="button"
                        onClick={() => onUpdate({ ...style, alignment: align })}
                        className={cn(
                            "p-1 rounded transition-all text-slate-400 hover:text-slate-600",
                            style?.alignment === align && "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
                        )}
                        title={`Align ${align}`}
                    >
                        {align === 'left' ? <AlignLeft className="w-3 h-3" /> : align === 'center' ? <AlignCenter className="w-3 h-3" /> : <AlignRight className="w-3 h-3" />}
                    </button>
                ))}
            </div>
        </div>
    )
}

function DroppableZone({ id, items, getLabel, isHiddenZone }: { id: string, items: string[], getLabel: (id: string) => string, isHiddenZone?: boolean }) {
    const { setNodeRef } = useSortable({ id });

    return (
        <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
            <div
                ref={setNodeRef}
                className={cn(
                    "min-h-[60px] rounded-md border p-2 space-y-2 transition-colors",
                    isHiddenZone
                        ? "bg-slate-50 dark:bg-slate-900 border-dashed border-slate-200"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                )}
            >
                {items.length === 0 && !isHiddenZone && (
                    <div className="text-center py-4 text-xs text-slate-400 italic">Empty Section</div>
                )}
                {items.map(itemId => (
                    <DraggableFieldItem key={itemId} id={itemId} label={getLabel(itemId)} isHidden={isHiddenZone} />
                ))}
            </div>
        </SortableContext>
    );
}

function DraggableFieldItem({ id, label, isHidden }: { id: string, label: string, isHidden?: boolean }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "flex items-center justify-between p-2 rounded text-sm border cursor-grab active:cursor-grabbing group bg-white dark:bg-slate-800",
                isDragging ? "shadow-lg ring-2 ring-blue-500 opacity-80" : "hover:border-blue-300 dark:hover:border-blue-700",
                isHidden && "opacity-75 bg-slate-50"
            )}
        >
            <span className="flex items-center gap-2">
                <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                {label}
            </span>
            {isHidden && <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 rounded">Hidden</span>}
        </div>
    );
}

function CardsOrderSection({ config }: { config: ReturnType<typeof useTableConfig> }) {
    const { config: tableConfig, updateEntityConfig } = config;

    const cardsLayout = tableConfig?.entityConfig?.cardsLayout || ['tasks', 'notes', 'files'];
    const cardLabels: Record<string, string> = { tasks: 'Tasks', notes: 'Notes', files: 'Files' };
    const allCards = ['tasks', 'notes', 'files'];
    const hiddenCards = allCards.filter(id => !cardsLayout.includes(id));

    // Dnd Handlers
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id && over) {
            const oldIndex = cardsLayout.indexOf(active.id as string);
            const newIndex = cardsLayout.indexOf(over.id as string);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newLayout = arrayMove(cardsLayout, oldIndex, newIndex);
                updateEntityConfig({ cardsLayout: newLayout });
            }
        }
    };

    const handleCardToggle = (cardId: string) => {
        const index = cardsLayout.indexOf(cardId);
        if (index !== -1) {
            // Remove (Hide)
            updateEntityConfig({ cardsLayout: cardsLayout.filter(id => id !== cardId) });
        } else {
            // Add (Show) - append to end
            updateEntityConfig({ cardsLayout: [...cardsLayout, cardId] });
        }
    };

    return (
        <div className="space-y-4">
            {/* Active Sorted Cards */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={cardsLayout} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {cardsLayout.map(cardId => (
                            <DraggableCardItem
                                key={cardId}
                                id={cardId}
                                label={cardLabels[cardId] || cardId}
                                onHide={() => handleCardToggle(cardId)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Hidden Cards */}
            {hiddenCards.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-dashed">
                    <Label className="text-xs text-slate-400">Hidden Cards</Label>
                    {hiddenCards.map(cardId => (
                        <div key={cardId} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-dashed rounded px-3 py-2 text-sm opacity-60">
                            <span className="font-medium text-slate-500">{cardLabels[cardId] || cardId}</span>
                            <Button
                                variant="tertiary"
                                className="h-6 w-fit px-2 py-0 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleCardToggle(cardId)}
                            >
                                + Show
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function DraggableCardItem({ id, label, onHide }: { id: string, label: string, onHide: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "flex items-center justify-between bg-white dark:bg-card-bg border rounded px-3 py-2 text-sm shadow-sm cursor-grab active:cursor-grabbing group",
                isDragging ? "shadow-lg ring-2 ring-blue-500 opacity-80" : "hover:border-blue-300 dark:hover:border-blue-700"
            )}
        >
            <span className="flex items-center gap-2 font-medium">
                <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                {label}
            </span>
            <div
                className="flex items-center"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on button
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Button
                    variant="tertiary"
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Hide"
                    onClick={onHide}
                >
                    <Eye className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
}

function SortableActionItem({
    action,
    index,
    config
}: {
    action: import('./types').ActionButtonConfig,
    index: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: action.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComp = action.icon && (LucideIcons as any)[action.icon] ? (LucideIcons as any)[action.icon] : null;

    return (
        <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-card-bg group">
            <div className="flex items-center gap-3">
                <div {...attributes} {...listeners} className="cursor-grab hover:text-slate-700 dark:hover:text-slate-300 text-slate-400">
                    <GripVertical className="h-4 w-4" />
                </div>
                <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    {IconComp ? <IconComp className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                </div>
                <div>
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-slate-400 capitalize">{action.id}</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Label htmlFor={`action-table-${action.id}`} className="text-xs font-normal text-slate-500">Table</Label>
                    <Select
                        value={action.tableDisplayMode || (action.isVisibleInTable ? 'primary' : 'none')}
                        onValueChange={(val: 'primary' | 'menu' | 'none') => {
                            const newActions = [...(config.config?.actions || [])];
                            newActions[index] = {
                                ...newActions[index],
                                tableDisplayMode: val,
                                isVisibleInTable: val === 'primary'
                            };
                            config.updateActions?.(newActions);
                        }}
                    >
                        <SelectTrigger className="h-6 w-24 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="menu">Menu</SelectItem>
                            <SelectItem value="none">Hidden</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Label htmlFor={`action-card-${action.id}`} className="text-xs font-normal text-slate-500">Card</Label>
                    <Switch
                        id={`action-card-${action.id}`}
                        checked={action.isVisibleInCard}
                        onCheckedChange={(checked) => {
                            const newActions = [...(config.config?.actions || [])];
                            newActions[index] = { ...newActions[index], isVisibleInCard: checked };
                            config.updateActions?.(newActions);
                        }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor={`action-variant-${action.id}`} className="text-xs font-normal text-slate-500">Level</Label>
                    <Select
                        value={action.variant || 'tertiary'}
                        onValueChange={(val: 'primary' | 'secondary' | 'tertiary' | 'default') => {
                            const newActions = [...(config.config?.actions || [])];
                            newActions[index] = { ...newActions[index], variant: val };
                            config.updateActions?.(newActions);
                        }}
                    >
                        <SelectTrigger className="h-6 w-24 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="tertiary">Tertiary</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="tertiary"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => {
                            if (confirm('Are you sure you want to delete this action?')) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const newActions = (config.config?.actions || []).filter((a: any) => a.id !== action.id);
                                config.updateActions?.(newActions);
                            }
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function AddActionDialog({ onAdd, children }: { onAdd: (action: import('./types').ActionButtonConfig) => void, children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState('');
    const [icon, setIcon] = useState('ExternalLink');
    const [url, setUrl] = useState('');
    const [tableMode, setTableMode] = useState<'primary' | 'menu' | 'none'>('primary');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const id = label.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substr(2, 4);
        onAdd({
            id,
            label,
            icon,
            customUrl: url,
            actionType: 'custom',
            tableDisplayMode: tableMode,
            isVisibleInCard: true,
            isVisibleInTable: tableMode === 'primary' // Sync for backward compat
        });
        setOpen(false);
        setLabel('');
        setUrl('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Custom Action</DialogTitle>
                    <DialogDescription>
                        Create a button that links to an external URL. Use {'{id}'} to pass the record ID.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="action-label" className="text-right">Label</Label>
                        <Input
                            id="action-label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g. Google Search"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="action-url" className="text-right">URL</Label>
                        <Input
                            id="action-url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="col-span-3"
                            placeholder="https://example.com?q={id}"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Icon</Label>
                        <div className="col-span-3">
                            <IconPicker value={icon} onChange={setIcon} />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Display</Label>
                        <Select value={tableMode} onValueChange={(val: any) => setTableMode(val)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="primary">Button (Primary)</SelectItem>
                                <SelectItem value="menu">Menu Item</SelectItem>
                                <SelectItem value="none">Hidden in Table</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Action</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ButtonStyleSection({
    title,
    style,
    onUpdate
}: {
    title: string;
    style?: import('./types').ButtonStyle;
    onUpdate: (updates: Partial<import('./types').ButtonStyle>) => void;
}) {
    if (!style) return null;

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
            <h5 className="font-medium text-sm text-gray-900 dark:text-gray-100">{title}</h5>
            <div className="grid grid-cols-2 gap-4">
                {/* Background Color */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Background Color</Label>
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded border shadow-sm overflow-hidden">
                            <input
                                type="color"
                                value={style.backgroundColor || '#ffffff'}
                                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                                className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer"
                            />
                        </div>
                        <Input
                            type="text"
                            value={style.backgroundColor || ''}
                            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                            placeholder="#FFFFFF"
                            className="h-8 text-xs font-mono"
                        />
                    </div>
                </div>

                {/* Text Color */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Text Color</Label>
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded border shadow-sm overflow-hidden">
                            <input
                                type="color"
                                value={style.textColor || '#000000'}
                                onChange={(e) => onUpdate({ textColor: e.target.value })}
                                className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer"
                            />
                        </div>
                        <Input
                            type="text"
                            value={style.textColor || ''}
                            onChange={(e) => onUpdate({ textColor: e.target.value })}
                            placeholder="#000000"
                            className="h-8 text-xs font-mono"
                        />
                    </div>
                </div>

                {/* Icon Color */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Icon Color</Label>
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded border shadow-sm overflow-hidden">
                            <input
                                type="color"
                                value={style.iconColor || '#000000'}
                                onChange={(e) => onUpdate({ iconColor: e.target.value })}
                                className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer"
                            />
                        </div>
                        <Input
                            type="text"
                            value={style.iconColor || ''}
                            onChange={(e) => onUpdate({ iconColor: e.target.value })}
                            placeholder="#000000"
                            className="h-8 text-xs font-mono"
                        />
                    </div>
                </div>

                {/* Border Color */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Border Color</Label>
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded border shadow-sm overflow-hidden">
                            <input
                                type="color"
                                value={style.borderColor || '#000000'}
                                onChange={(e) => onUpdate({ borderColor: e.target.value })}
                                className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer"
                            />
                        </div>
                        <Input
                            type="text"
                            value={style.borderColor || ''}
                            onChange={(e) => onUpdate({ borderColor: e.target.value })}
                            placeholder="#000000"
                            className="h-8 text-xs font-mono"
                        />
                    </div>
                </div>

                {/* Font Weight */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Font Weight</Label>
                    <Select
                        value={style.fontWeight || 'normal'}
                        onValueChange={(val: any) => onUpdate({ fontWeight: val })}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Weight" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Active Border */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <Label className="text-xs text-gray-500">Active Border</Label>
                        <span className="text-[10px] text-gray-400 font-mono">
                            {style.activeBorderThickness || '0px'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 h-8">
                        <input
                            type="range"
                            min="0"
                            max="8"
                            step="1"
                            value={parseInt(style.activeBorderThickness || '0') || 0}
                            onChange={(e) => onUpdate({ activeBorderThickness: `${e.target.value}px` })}
                            className="w-full cursor-pointer"
                        />
                    </div>
                </div>

                {/* Button Size */}
                <div className="col-span-2 space-y-1.5 pt-2 border-t mt-2">
                    <Label className="text-xs text-gray-500">Button Size</Label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
                        {[
                            { value: 'sm', label: 'Small' },
                            { value: 'md', label: 'Medium' },
                            { value: 'lg', label: 'Large' }
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-all ${(style.size || 'md') === opt.value
                                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                onClick={() => onUpdate({ size: opt.value as any })}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Display Mode */}
                <div className="col-span-2 space-y-1.5 border-t pt-4 mt-2">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
                        {[
                            { value: 'icon-only', label: 'Icon Only' },
                            { value: 'text-only', label: 'Text Only' },
                            { value: 'icon-text', label: 'Icon & Text' }
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-all ${(style.displayMode || 'icon-text') === opt.value
                                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                onClick={() => onUpdate({ displayMode: opt.value as any })}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Icon Position */}
                {(!style.displayMode || style.displayMode !== 'text-only') && (
                    <div className="col-span-2 space-y-1.5 pt-2">
                        <Label className="text-xs text-gray-500">Icon Position</Label>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
                            {[
                                { value: 'left', label: 'Left', icon: AlignLeft },
                                { value: 'center', label: 'Center', icon: AlignCenter },
                                { value: 'right', label: 'Right', icon: AlignRight }
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-sm transition-all ${(style.iconPosition || 'left') === opt.value
                                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                    onClick={() => onUpdate({ iconPosition: opt.value as any })}
                                    title={opt.label}
                                >
                                    <opt.icon className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-medium">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
