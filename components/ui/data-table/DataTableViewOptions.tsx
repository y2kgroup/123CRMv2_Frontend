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
import { Settings2, GripVertical, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { useTableConfig } from './useTableConfig';
import { ColumnConfig } from './types';

interface DataTableViewOptionsProps {
    config: ReturnType<typeof useTableConfig>;
    trigger?: React.ReactNode;
}

interface SortableColumnItemProps {
    column: ColumnConfig;
    onToggleVisibility: (id: string, visible: boolean) => void;
    onUpdateStyle: (id: string, style: Partial<ColumnConfig['style']>) => void;
}

function SortableColumnItem({ column, onToggleVisibility, onUpdateStyle }: SortableColumnItemProps) {
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
            <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-move text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1"
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                {/* Visibility Toggle */}
                <Switch
                    checked={column.isVisible}
                    disabled={column.isMandatory}
                    onCheckedChange={(checked) => onToggleVisibility(column.id, checked)}
                />

                {/* Label */}
                <div className="flex-1 font-medium text-sm">
                    {column.label}
                    {column.isMandatory && (
                        <span className="ml-2 text-xs text-gray-400 font-normal italic">(Required)</span>
                    )}
                </div>

                {/* Styling Options Trigger (Simplified inline for now) */}
                <div className="flex items-center gap-1 border-l pl-3 dark:border-gray-700">
                    <Select
                        value={column.style.textSize || 'sm'}
                        onValueChange={(val: any) => onUpdateStyle(column.id, { textSize: val })}
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
            </div>
        </div>
    );
}

export function DataTableViewOptions({ config, trigger }: DataTableViewOptionsProps) {
    const { sortedColumns, reorderColumns, updateColumn, updateColumnStyle } = config;

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

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button variant="action" className="hidden h-9 lg:flex gap-2 text-xs">
                        <Settings2 className="h-4 w-4" />
                        Page Settings
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>Page Settings</SheetTitle>
                    <SheetDescription>
                        Customize your view. Reorder columns, toggle visibility, and adjust styling.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-medium mb-4 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Columns Configuration
                        </h4>

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
                                            onToggleVisibility={(id, visible) => updateColumn(id, { isVisible: visible })}
                                            onUpdateStyle={updateColumnStyle}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
