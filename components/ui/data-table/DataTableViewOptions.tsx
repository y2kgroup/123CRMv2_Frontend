'use client';

import React, { useState } from 'react';
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
import { Settings2, GripVertical, AlignLeft, AlignCenter, AlignRight, Palette, Plus, Pin } from 'lucide-react';

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
import { ColumnConfig, GlobalStyle, ColumnType, CellStyle } from './types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface DataTableViewOptionsProps {
    config: ReturnType<typeof useTableConfig>;
    trigger?: React.ReactNode;
    mode?: 'sheet' | 'dialog';
}

function AddColumnDialog({ onAdd }: { onAdd: (name: string, type: ColumnType, extra?: { displayStyle?: 'text' | 'badge'; dropdownOptions?: string[]; isMultiSelect?: boolean }) => void }) {
    const [name, setName] = useState('');
    const [type, setType] = useState<ColumnType>('text');
    const [displayStyle, setDisplayStyle] = useState<'text' | 'badge'>('text');
    const [options, setOptions] = useState('');
    const [isMultiSelect, setIsMultiSelect] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name) {
            onAdd(name, type, {
                displayStyle: type === 'select' ? displayStyle : undefined,
                dropdownOptions: (type === 'select' || type === 'badge') ? options.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                isMultiSelect: (type === 'select' || type === 'badge') ? isMultiSelect : undefined
            });
            setOpen(false);
            setName('');
            setType('text');
            setOptions('');
            setDisplayStyle('text');
            setIsMultiSelect(false);
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
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="address">Address</SelectItem>
                                <SelectItem value="currency">Currency</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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

                    {(type === 'select' || type === 'badge') && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="multiSelect" className="text-right">
                                Selection
                            </Label>
                            <div className="flex items-center gap-2 col-span-3">
                                <Switch
                                    id="multiSelect"
                                    checked={isMultiSelect}
                                    onCheckedChange={setIsMultiSelect}
                                />
                                <span className="text-xs text-slate-500">
                                    {isMultiSelect ? 'Multi-select' : 'Single-select'}
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
                                placeholder="Option 1, Option 2, Option 3"
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

function EditColumnDialog({ column, onUpdate, children }: { column: ColumnConfig, onUpdate: (id: string, updates: Partial<ColumnConfig>) => void, children: React.ReactNode }) {
    const [name, setName] = useState(column.label);
    const [type, setType] = useState<ColumnType>(column.type);
    const [displayStyle, setDisplayStyle] = useState<'text' | 'badge'>(column.displayStyle || 'text');
    const [options, setOptions] = useState(column.dropdownOptions?.join(', ') || '');
    const [isMultiSelect, setIsMultiSelect] = useState(column.isMultiSelect || false);
    const [open, setOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(column.id, {
            label: name,
            type,
            displayStyle: type === 'select' ? displayStyle : undefined,
            dropdownOptions: (type === 'select' || type === 'badge') ? options.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            isMultiSelect: (type === 'select' || type === 'badge') ? isMultiSelect : undefined
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="address">Address</SelectItem>
                                <SelectItem value="currency">Currency</SelectItem>
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

                    {(type === 'select' || type === 'badge') && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-multiSelect" className="text-right">
                                Selection
                            </Label>
                            <div className="flex items-center gap-2 col-span-3">
                                <Switch
                                    id="edit-multiSelect"
                                    checked={isMultiSelect}
                                    onCheckedChange={setIsMultiSelect}
                                />
                                <span className="text-xs text-slate-500">
                                    {isMultiSelect ? 'Multi-select' : 'Single-select'}
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
    onUpdateStyle?: (id: string, style: Partial<ColumnConfig['style']>) => void;
    showDrag?: boolean;
    showVisibility?: boolean;
    showStyling?: boolean;
}

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
            </div>
        </div>
    );
}

function SortableColumnItem({
    column,
    onUpdateColumn,
    onUpdateStyle,
    showDrag = true,
    showVisibility = true,
    showStyling = true
}: SortableColumnItemProps) {
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
                        <EditColumnDialog column={column} onUpdate={onUpdateColumn}>
                            <button className="hover:underline hover:text-blue-600 truncate text-left focus:outline-none">
                                {column.label}
                            </button>
                        </EditColumnDialog>
                    ) : (
                        <span className="truncate">{column.label}</span>
                    )}
                </div>

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

export function DataTableViewOptions({ config, trigger, mode = 'sheet' }: DataTableViewOptionsProps) {
    const { sortedColumns, reorderColumns, updateColumn, addColumn } = config;

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



    const content = (
        <Tabs defaultValue="columns" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="columns">Columns Configuration</TabsTrigger>
                <TabsTrigger value="alignment">Table Styles</TabsTrigger>
            </TabsList>

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
                                        showStyling={false}
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
                            title="Header Style"
                            style={config.config?.headerStyle}
                            onUpdate={(updates) => config.updateGlobalStyle?.('header', updates)}
                        />
                        <GlobalStyleSection
                            title="Rows Style"
                            style={config.config?.rowStyle}
                            onUpdate={(updates) => config.updateGlobalStyle?.('row', updates)}
                        />
                    </div>
                </div>
            </TabsContent>
        </Tabs>
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
