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
import { Checkbox } from '@/components/ui/checkbox';

interface DataTableProps<T> {
    data: T[];
    config: {
        config: TableConfig | null;
        setSort: (sort: SortConfig) => void;
        sortedColumns: ColumnConfig[];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                <table className="w-full caption-bottom text-sm text-left">
                    <TableHeader className="bg-slate-50 dark:bg-slate-800">
                        <TableRow>
                            {visibleColumns.map((column) => (
                                <TableHead
                                    key={column.id}
                                    style={{
                                        width: column.width,
                                        backgroundColor: tableConfig.headerStyle?.backgroundColor,
                                        color: tableConfig.headerStyle?.textColor,
                                        fontFamily: tableConfig.headerStyle?.fontFamily
                                    }}
                                    className={cn(
                                        "whitespace-nowrap transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer select-none sticky top-0 z-10 shadow-sm",
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
                                                "border-b border-slate-100 dark:border-slate-800",
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
                                                backgroundColor: tableConfig.rowStyle?.backgroundColor,
                                                fontFamily: tableConfig.rowStyle?.fontFamily
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
