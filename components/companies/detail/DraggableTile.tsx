'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings2, Move, ArrowRightLeft, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

interface DraggableTileProps {
    id: string;
    colSpan: number;
    heightMode?: 'compact' | 'standard' | 'tall';
    isEditMode: boolean;
    onConfigChange?: (config: { colSpan: number; heightMode: 'compact' | 'standard' | 'tall' }) => void;
    children: React.ReactNode;
}

export function DraggableTile({ id, colSpan, heightMode = 'standard', isEditMode, onConfigChange, children }: DraggableTileProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    // Grid Classes
    const getColSpanClass = (span: number) => {
        switch (span) {
            case 2: return 'md:col-span-2';
            case 4: return 'md:col-span-2 xl:col-span-4';
            default: return 'col-span-1';
        }
    };

    // Height Classes
    const getHeightClass = (mode: string) => {
        switch (mode) {
            case 'compact': return 'h-[300px] overflow-hidden';
            case 'tall': return 'h-[950px] overflow-hidden';
            default: return 'h-[500px] overflow-hidden'; // Standard
        }
    };

    // Handlers for config changes
    const changeWidth = (val: string) => {
        if (onConfigChange) onConfigChange({ colSpan: parseInt(val), heightMode });
    };
    const changeHeight = (val: string) => {
        if (onConfigChange) onConfigChange({ colSpan, heightMode: val as any });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "relative group transition-all duration-200",
                getColSpanClass(colSpan),
                getHeightClass(heightMode),
                isEditMode && "ring-2 ring-dashed ring-slate-300 dark:ring-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/20"
            )}
        >
            {/* Edit Controls Overlay */}
            {isEditMode && (
                <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                    {/* Drag Handle */}
                    <div {...attributes} {...listeners} className="p-2 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-md cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                        <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Settings Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-md cursor-pointer text-slate-400 hover:text-blue-500 transition-colors">
                                <Settings2 className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-56 p-2"
                            style={{
                                backgroundColor: 'var(--h-nav-dropdown-bg)',
                                borderColor: 'var(--h-nav-dropdown-border)',
                                borderWidth: 'var(--h-nav-dropdown-border-width)',
                            }}
                        >
                            <DropdownMenuLabel
                                className="text-xs font-bold uppercase tracking-wider opacity-70"
                                style={{ color: 'var(--h-nav-dropdown-text)' }}
                            >
                                Width
                            </DropdownMenuLabel>

                            <DropdownMenuRadioGroup value={String(colSpan)} onValueChange={changeWidth}>
                                {['1', '2', '4'].map((val) => (
                                    <DropdownMenuRadioItem
                                        key={val}
                                        value={val}
                                        className="cursor-pointer text-sm pl-8 transition-colors"
                                        style={{
                                            color: 'var(--h-nav-dropdown-text)',
                                            fontWeight: 'var(--h-nav-dropdown-font-weight)'
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--h-nav-dropdown-active-bg)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                        onFocus={(e) => (e.currentTarget.style.backgroundColor = 'var(--h-nav-dropdown-active-bg)')}
                                        onBlur={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`h-4 border border-opacity-50 rounded-sm bg-opacity-20 ${val === '1' ? 'w-4' : val === '2' ? 'w-8' : 'w-12'}`} style={{ borderColor: 'var(--h-nav-dropdown-text)', backgroundColor: 'var(--h-nav-dropdown-text)' }}></div>
                                            {val === '1' ? '1/4 Width (Standard)' : val === '2' ? '1/2 Width (Wide)' : 'Full Width'}
                                        </div>
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>

                            <DropdownMenuSeparator className="opacity-20" style={{ backgroundColor: 'var(--h-nav-dropdown-text)' }} />

                            <DropdownMenuLabel
                                className="text-xs font-bold uppercase tracking-wider opacity-70"
                                style={{ color: 'var(--h-nav-dropdown-text)' }}
                            >
                                Height
                            </DropdownMenuLabel>

                            <DropdownMenuRadioGroup value={heightMode} onValueChange={changeHeight}>
                                {['compact', 'standard', 'tall'].map((mode) => (
                                    <DropdownMenuRadioItem
                                        key={mode}
                                        value={mode}
                                        className="cursor-pointer text-sm pl-8 transition-colors"
                                        style={{
                                            color: 'var(--h-nav-dropdown-text)',
                                            fontWeight: 'var(--h-nav-dropdown-font-weight)'
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--h-nav-dropdown-active-bg)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                        onFocus={(e) => (e.currentTarget.style.backgroundColor = 'var(--h-nav-dropdown-active-bg)')}
                                        onBlur={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                        {mode === 'compact' ? 'Compact (300px)' : mode === 'standard' ? 'Standard (500px)' : 'Tall (950px)'}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Content Container */}
            <div className={cn("h-full w-full", isEditMode && "pointer-events-none opacity-80 scale-[0.99]")}>
                {children}
            </div>
        </div>
    );
}
