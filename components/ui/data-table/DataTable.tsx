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
                                    style={{ width: column.width }}
                                    className={cn(
                                        "whitespace-nowrap transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer select-none sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 shadow-sm",
                                        column.style.alignment === 'center' && "text-center",
                                        column.style.alignment === 'right' && "text-right",
                                    )}
                                    onClick={() => handleSort(column.id)}
                                >
                                    <div className={cn(
                                        "flex items-center gap-1",
                                        column.style.alignment === 'center' && "justify-center",
                                        column.style.alignment === 'right' && "justify-end",
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
                                                column.style.alignment === 'center' && "text-center",
                                                column.style.alignment === 'right' && "text-right",
                                                column.style.textSize === 'xs' && "text-xs",
                                                column.style.textSize === 'sm' && "text-sm",
                                                column.style.textSize === 'base' && "text-base",
                                            )}
                                            style={{ color: column.style.textColor }}
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
