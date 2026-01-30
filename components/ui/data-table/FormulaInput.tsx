'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList, CommandInput, CommandEmpty } from "@/components/ui/command";
import { ColumnConfig } from './types';

interface FormulaInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    columns: ColumnConfig[];
}

export function FormulaInput({ value, onChange, placeholder, columns }: FormulaInputProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const cursorPositionRef = useRef<number | null>(null);

    // Initial Render: Convert formula string to HTML with chips
    useEffect(() => {
        if (editorRef.current && value !== getFormulaFromHtml(editorRef.current.innerHTML)) {
            editorRef.current.innerHTML = convertFormulaToHtml(value, columns);
        }
    }, [value, columns]); // Only sync when value truly changes externally

    // Helper: Convert "{price} * 2" -> "price * 2" (HTML)
    const convertFormulaToHtml = (formula: string, cols: ColumnConfig[]) => {
        if (!formula) return '';
        // Replace {id} with <span ...>Label</span>
        return formula.replace(/\{([a-zA-Z0-9_\.]+)\}/g, (match, id) => {
            const col = cols.find(c => c.id === id);
            const label = col ? col.label : id;
            return createChipHtml(id, label);
        });
    };

    const createChipHtml = (id: string, label: string) => {
        // We use contentEditable=false to make the chip atomic
        return `<span contenteditable="false" data-id="${id}" class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 mx-0.5 select-none">${label}</span>`;
    };

    // Helper: Convert HTML -> "{price} * 2"
    const getFormulaFromHtml = (html: string) => {
        // Create a temporary div to parse
        const temp = document.createElement('div');
        temp.innerHTML = html;

        let formula = '';
        temp.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                formula += node.textContent;
            } else if (node.nodeName === 'SPAN' && (node as HTMLElement).dataset.id) {
                formula += `{${(node as HTMLElement).dataset.id}}`;
            } else if (node.nodeName === 'DIV') {
                // Handle newlines which chrome inserts as divs
                formula += '\n' + (node.textContent || '');
            } else {
                formula += node.textContent;
            }
        });
        return formula.replace(/\u00A0/g, ' '); // Replace &nbsp; with space
    };

    const handleInput = () => {
        if (editorRef.current) {
            const newFormula = getFormulaFromHtml(editorRef.current.innerHTML);
            if (newFormula !== value) {
                onChange(newFormula);
            }
            saveCursorPosition();
        }
    };

    const insertVariable = (col: ColumnConfig) => {
        setIsPopoverOpen(false);
        if (editorRef.current) {
            editorRef.current.focus();
            restoreCursorPosition();

            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();

                // Create Chip Element
                const chip = document.createElement('span');
                chip.contentEditable = "false";
                chip.dataset.id = col.id;
                chip.className = "inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 mx-0.5 select-none";
                chip.textContent = col.label;

                // Insert space before if needed? Better to let user control spacing.
                const spaceBefore = document.createTextNode('\u00A0');
                const spaceAfter = document.createTextNode('\u00A0');

                range.insertNode(spaceAfter);
                range.insertNode(chip);
                range.insertNode(spaceBefore);

                // Move cursor after
                range.setStartAfter(spaceAfter);
                range.setEndAfter(spaceAfter);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                // Should not happen if focused, but fallback append
                editorRef.current.innerHTML += `\u00A0${createChipHtml(col.id, col.label)}\u00A0`;
            }

            handleInput();
        }
    };

    const saveCursorPosition = () => {
        // Very basic saving - strict selection management is complex in contentEditable
        // For v1, we rely on the browser keeping selection unless we fully re-render from props
    };

    const restoreCursorPosition = () => {
        // Stub
    };

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="primary" icon={Plus} className="whitespace-nowrap">
                            Insert Variable
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[260px]" align="start">
                        <Command>
                            <CommandInput placeholder="Search columns..." />
                            <CommandList>
                                <CommandEmpty>No columns found.</CommandEmpty>
                                <CommandGroup>
                                    {columns.filter(c => c.type !== 'formula').map(col => (
                                        <CommandItem
                                            key={col.id}
                                            onSelect={() => insertVariable(col)}
                                            className="text-xs cursor-pointer"
                                        >
                                            {col.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                <div className="flex gap-1">
                    {['+', '-', '*', '/', '(', ')'].map(op => (
                        <button
                            key={op}
                            onClick={() => {
                                if (editorRef.current) {
                                    editorRef.current.focus();
                                    document.execCommand('insertText', false, ` ${op} `);
                                }
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono border"
                        >
                            {op}
                        </button>
                    ))}
                </div>
            </div>

            <div
                ref={editorRef}
                contentEditable
                className={cn(
                    "min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono leading-relaxed break-words whitespace-pre-wrap",
                    "focus:border-blue-500 transition-colors"
                )}
                onInput={handleInput}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault(); // Prevent newlines for basic formulas? Or allow?
                        // Allow for now, might be useful for long formulas
                    }
                }}
            />

            <p className="text-xs text-slate-500">
                Tip: Click "Insert Variable" or use the operators. Values are processed as <code>{`{id}`}</code>.
            </p>
        </div>
    );
}
