'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { ColumnConfig, SortConfig, TableConfig } from './types';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface DataTableProps<T> {
    data: T[];
    config: {
        config: TableConfig | null;
        setSort: (sort: SortConfig) => void;
        sortedColumns: ColumnConfig[];
    }

    columns: Record<string, (item: T) => React.ReactNode>; // Map column ID to render function
    onRowClick?: (item: T) => void;
    isAllSelected?: boolean;
    onSelectAll?: () => void;
}

export function DataTable<T extends { id: string | number }>({
    data,
    config,
    columns,
    onRowClick,
    isAllSelected,
    onSelectAll
}: DataTableProps<T>) {
    const { config: tableConfig, setSort, sortedColumns } = config;
    const [stickyOffsets, setStickyOffsets] = React.useState<Record<string, number>>({});
    const headerRef = React.useRef<HTMLTableRowElement>(null);

    // Measure sticky columns
    React.useLayoutEffect(() => {
        if (!headerRef.current) return;

        const offsets: Record<string, number> = {};
        let currentOffset = 0;
        const cells = Array.from(headerRef.current.children) as HTMLElement[];

        // Iterate through visible columns to calculate offsets for pinned ones
        const visibleCols = sortedColumns.filter(c => c.isVisible);

        visibleCols.forEach((col, index) => {
            if (col.pinned) {
                offsets[col.id] = currentOffset;
                // Add the width of this column to the offset for the NEXT pinned column
                // We measure the actual rendered width from the DOM
                const cell = cells[index];
                if (cell) {
                    currentOffset += cell.getBoundingClientRect().width;
                }
            }
        });

        setStickyOffsets(offsets);
    }, [sortedColumns, tableConfig?.headerStyle, tableConfig?.rowStyle, data]); // Re-measure on data/style/column change

    if (!tableConfig) return null;

    const visibleColumns = sortedColumns.filter(c => c.isVisible);

    const handleSort = (columnId: string) => {
        const currentSort = tableConfig.sort;
        let newDirection: 'asc' | 'desc' | null = 'asc';

        if (currentSort.key === columnId && currentSort.direction === 'asc') {
            newDirection = 'desc';
        } else if (currentSort.key === columnId && currentSort.direction === 'desc') {
            newDirection = null; // Toggle off
        }

        setSort({ key: newDirection ? columnId : null, direction: newDirection });
    };

    return (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2329] overflow-hidden h-full flex flex-col">
            <div className="flex-1 overflow-auto relative">
                <table className="w-full caption-bottom text-sm text-left relative">
                    <TableHeader className="bg-slate-50 dark:bg-slate-800">
                        <TableRow ref={headerRef}>
                            {visibleColumns.map((column) => (
                                <TableHead
                                    key={column.id}
                                    style={{
                                        width: column.width,
                                        backgroundColor: tableConfig.headerStyle?.backgroundColor,
                                        color: tableConfig.headerStyle?.textColor,
                                        fontFamily: tableConfig.headerStyle?.fontFamily,
                                        whiteSpace: tableConfig.headerStyle?.textWrap === 'wrap' ? 'normal' : 'nowrap',
                                        // Sticky Logic
                                        position: column.pinned ? 'sticky' : undefined,
                                        left: column.pinned ? stickyOffsets[column.id] || 0 : undefined,
                                        zIndex: column.pinned ? 20 : 10,
                                        // Add a right border if it's the last pinned column? Or visually separate all pinned
                                        boxShadow: column.pinned ? '2px 0 5px -2px rgba(0,0,0,0.1)' : undefined
                                    }}
                                    className={cn(
                                        "whitespace-nowrap transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer select-none top-0 shadow-sm",
                                        !column.pinned && "sticky z-10", // Normal sticky header
                                        column.pinned && "border-r border-slate-200 dark:border-slate-700",
                                        // Global Header Alignment
                                        tableConfig.headerStyle?.alignment === 'center' && "text-center",
                                        tableConfig.headerStyle?.alignment === 'right' && "text-right",
                                        // Global Header Text Size
                                        tableConfig.headerStyle?.textSize === 'xs' && "text-xs",
                                        tableConfig.headerStyle?.textSize === 'sm' && "text-sm",
                                        tableConfig.headerStyle?.textSize === 'base' && "text-base",
                                        // Global Header Font Weight
                                        tableConfig.headerStyle?.fontWeight === 'normal' && "font-normal",
                                        tableConfig.headerStyle?.fontWeight === 'medium' && "font-medium",
                                        tableConfig.headerStyle?.fontWeight === 'semibold' && "font-semibold",
                                        tableConfig.headerStyle?.fontWeight === 'bold' && "font-bold",
                                        // Default background if not set
                                        !tableConfig.headerStyle?.backgroundColor && "bg-slate-50 dark:bg-slate-800"
                                    )}
                                    onClick={() => handleSort(column.id)}
                                >
                                    <div className={cn(
                                        "flex items-center gap-1",
                                        // Inner Flex Alignment
                                        tableConfig.headerStyle?.alignment === 'center' && "justify-center",
                                        tableConfig.headerStyle?.alignment === 'right' && "justify-end",
                                    )}>
                                        {column.id === 'select' ? (
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={isAllSelected}
                                                    onCheckedChange={() => onSelectAll?.()}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                {column.showIconInTable && column.icon && (LucideIcons as any)[column.icon] && (
                                                    React.createElement((LucideIcons as any)[column.icon], { className: "w-4 h-4 mr-1 text-slate-400" })
                                                )}
                                                {column.label}
                                                {tableConfig.sort.key === column.id ? (
                                                    tableConfig.sort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                                                ) : (
                                                    <ChevronsUpDown className="w-3 h-3 opacity-30" />
                                                )}
                                            </>
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={cn(
                                        onRowClick && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    )}
                                >
                                    {visibleColumns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            className={cn(
                                                "border-b border-slate-100 dark:border-slate-800 whitespace-nowrap",
                                                column.pinned && "sticky z-10",
                                                column.pinned === 'left' && "border-r border-slate-100 dark:border-slate-800",
                                                column.pinned === 'right' && "border-l border-slate-100 dark:border-slate-800",
                                                // Global Row Alignment
                                                tableConfig.rowStyle?.alignment === 'center' && "text-center",
                                                tableConfig.rowStyle?.alignment === 'right' && "text-right",
                                                // Global Row Text Size
                                                tableConfig.rowStyle?.textSize === 'xs' && "text-xs",
                                                tableConfig.rowStyle?.textSize === 'sm' && "text-sm",
                                                tableConfig.rowStyle?.textSize === 'base' && "text-base",
                                                // Global Row Font Weight
                                                tableConfig.rowStyle?.fontWeight === 'normal' && "font-normal",
                                                tableConfig.rowStyle?.fontWeight === 'medium' && "font-medium",
                                                tableConfig.rowStyle?.fontWeight === 'semibold' && "font-semibold",
                                                tableConfig.rowStyle?.fontWeight === 'bold' && "font-bold",
                                            )}
                                            style={{
                                                color: tableConfig.rowStyle?.textColor,
                                                backgroundColor: column.pinned ? (tableConfig.rowStyle?.backgroundColor || 'var(--card-bg, white)') : tableConfig.rowStyle?.backgroundColor,
                                                fontFamily: tableConfig.rowStyle?.fontFamily,
                                                whiteSpace: tableConfig.rowStyle?.textWrap === 'wrap' ? 'normal' : 'nowrap',
                                                left: column.pinned === 'left' ? stickyOffsets[column.id] || 0 : undefined,
                                                right: undefined, // Right pinning not fully implemented yet
                                                boxShadow: column.pinned === 'left'
                                                    ? '2px 0 5px -2px rgba(0,0,0,0.1)'
                                                    : column.pinned === 'right'
                                                        ? '-2px 0 5px -2px rgba(0,0,0,0.1)'
                                                        : undefined
                                            }}
                                        >
                                            {columns[column.id] ? columns[column.id](row) : null}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </table>
            </div>
        </div>
    );
}
