'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

// Filter out non-icon exports
const iconNames = Object.keys(LucideIcons).filter(key => key !== 'icons' && key !== 'createLucideIcon' && key !== 'default');

interface IconPickerProps {
    value?: string;
    onChange: (iconName: string) => void;
    trigger?: React.ReactNode;
}

const PAGE_SIZE = 48; // 6x8 grid

export function IconPicker({ value, onChange, trigger }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredIcons = useMemo(() => {
        if (!search) return iconNames;
        return iconNames.filter(name => name.toLowerCase().includes(search.toLowerCase()));
    }, [search]);

    const totalPages = Math.ceil(filteredIcons.length / PAGE_SIZE);

    const currentIcons = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredIcons.slice(start, start + PAGE_SIZE);
    }, [filteredIcons, currentPage]);

    // Reset pagination on search
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const SelectedIcon = value && (LucideIcons as any)[value];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="secondary" className="w-full justify-between px-3 h-9">
                        <span className="flex items-center gap-2 truncate">
                            {SelectedIcon ? <SelectedIcon className="w-4 h-4" /> : <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                            <span className={cn("truncate text-xs", !value && "text-slate-400 dark:text-slate-500")}>
                                {value || "Select Icon"}
                            </span>
                        </span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-6">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Select Icon</DialogTitle>
                    <DialogDescription>
                        Browse and select an icon for your column.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search icons..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                    {currentIcons.length > 0 ? (
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                            {currentIcons.map(iconName => {
                                const Icon = (LucideIcons as any)[iconName];
                                return (
                                    <Button
                                        key={iconName}
                                        variant="tertiary"
                                        className={cn(
                                            "h-12 w-12 p-0 flex flex-col items-center justify-center gap-1 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all",
                                            value === iconName && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-900"
                                        )}
                                        onClick={() => {
                                            onChange(iconName);
                                            setOpen(false);
                                        }}
                                        title={iconName}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </Button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Search className="w-8 h-8 mb-2 opacity-50" />
                            <p>No icons found for "{search}"</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="pt-4 flex items-center justify-between shrink-0">
                    <div className="text-xs text-slate-500">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center px-2">
                            <span className="text-sm font-medium w-8 text-center">{currentPage}</span>
                        </div>

                        <Button
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
