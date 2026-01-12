import React, { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Save, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export type FilterOperator = 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty';
export type MatchType = 'AND' | 'OR';

export interface FilterRule {
    id: string;
    columnId: string;
    operator: FilterOperator;
    value: string;
}

export interface SavedFilter {
    id: string;
    name: string;
    rules: FilterRule[];
    matchType: MatchType;
}

export interface AdvancedFilterSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    columns: { id: string; label: string }[];
    onApply: (rules: FilterRule[], matchType: MatchType) => void;
    initialRules?: FilterRule[];
    initialMatchType?: MatchType;
}

export function AdvancedFilterSheet({
    isOpen,
    onOpenChange,
    columns,
    onApply,
    initialRules = [],
    initialMatchType = 'AND',
}: AdvancedFilterSheetProps) {
    const [filterName, setFilterName] = useState('');
    const [matchType, setMatchType] = useState<MatchType>(initialMatchType);
    const [rules, setRules] = useState<FilterRule[]>(
        initialRules.length > 0 ? initialRules : []
    );

    // Mock Saved Filters State
    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
        {
            id: 'default-1',
            name: 'Active Tech Companies',
            matchType: 'AND',
            rules: [
                { id: 'r1', columnId: 'industry', operator: 'contains', value: 'Tech' },
                { id: 'r2', columnId: 'status', operator: 'equals', value: 'Active' }
            ]
        }
    ]);

    const [selectedFilterId, setSelectedFilterId] = useState<string | undefined>(undefined);

    const handleAddRule = () => {
        const newRule: FilterRule = {
            id: Math.random().toString(36).substr(2, 9),
            columnId: columns[0]?.id || '',
            operator: 'contains',
            value: '',
        };
        setRules([...rules, newRule]);
    };

    const handleRemoveRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id));
    };

    const handleUpdateRule = (id: string, field: keyof FilterRule, value: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleReset = () => {
        setFilterName('');
        setMatchType('AND');
        setRules([]);
        setSelectedFilterId(undefined);
    };

    const handleApply = () => {
        const validRules = rules.filter(r => r.columnId);
        onApply(validRules, matchType);
        onOpenChange(false);
    };

    const handleSaveFilter = () => {
        if (!filterName.trim()) return;
        const newId = Math.random().toString(36).substr(2, 9);
        const newFilter: SavedFilter = {
            id: newId,
            name: filterName,
            rules: [...rules],
            matchType
        };
        setSavedFilters([...savedFilters, newFilter]);
        setFilterName('');
        setSelectedFilterId(newId);
    };

    const handleLoadFilter = (filterId: string) => {
        const filter = savedFilters.find(f => f.id === filterId);
        if (filter) {
            setRules(filter.rules);
            setMatchType(filter.matchType);
            setSelectedFilterId(filterId);
        }
    };

    const handleDeleteFilter = () => {
        if (!selectedFilterId) return;
        // Confirm deletion? For now, just delete.
        setSavedFilters(savedFilters.filter(f => f.id !== selectedFilterId));
        handleReset(); // Reset view after deletion
    };

    const operators: { value: FilterOperator; label: string }[] = [
        { value: 'contains', label: 'Contains' },
        { value: 'equals', label: 'Is' },
        { value: 'startsWith', label: 'Starts with' },
        { value: 'endsWith', label: 'Ends with' },
        { value: 'isEmpty', label: 'Is Empty' },
        { value: 'isNotEmpty', label: 'Is Not Empty' },
    ];

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange} modal={false}>
            <SheetContent className="w-[400px] sm:w-[800px] flex flex-col h-full bg-white dark:bg-card-bg p-0 gap-0 border-l shadow-2xl">
                {/* Header */}
                <SheetHeader className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between space-y-0">
                    <SheetTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Filters</SheetTitle>
                </SheetHeader>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
                    <div className="space-y-6">

                        {/* 0. Saved Filters Dropdown */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                                Saved Filters
                            </label>
                            <div className="flex gap-2">
                                <Select
                                    value={selectedFilterId || "none"}
                                    onValueChange={handleLoadFilter}
                                >
                                    <SelectTrigger className="w-full h-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700">
                                        <SelectValue placeholder="Load a saved filter..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {savedFilters.length > 0 ? (
                                            <>
                                                <SelectItem value="none">Select a saved filter...</SelectItem>
                                                {savedFilters.map(filter => (
                                                    <SelectItem key={filter.id} value={filter.id}>{filter.name}</SelectItem>
                                                ))}
                                            </>
                                        ) : (
                                            <SelectItem value="none" disabled>No saved filters</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>

                                {selectedFilterId && (
                                    <Button
                                        variant="tertiary"
                                        onClick={handleDeleteFilter}
                                        className="h-10 w-10 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border border-gray-200 dark:border-gray-700"
                                        title="Delete Saved Filter"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* 1. Save Current Filter */}
                        <div className="border border-blue-100 dark:border-gray-800 rounded-lg p-5 bg-slate-50/50 dark:bg-slate-900/20">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 block">
                                Save Current Filter
                            </label>
                            <div className="flex gap-2.5 h-10">
                                <input
                                    placeholder="Filter Name..."
                                    value={filterName}
                                    onChange={(e) => setFilterName(e.target.value)}
                                    className="flex-1 min-w-0 h-full border border-gray-200 dark:border-gray-700 rounded-md px-3 text-sm bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                                />

                                <Button
                                    variant="primary"
                                    icon={Save}
                                    onClick={handleSaveFilter}
                                    disabled={!filterName.trim()}
                                    className="h-full px-6 rounded-md shrink-0 whitespace-nowrap min-w-[100px]"
                                >
                                    Save
                                </Button>
                            </div>
                        </div>

                        {/* 2. Match Toggle - Segmented Control Style */}
                        <div className="bg-gray-100 dark:bg-gray-900 p-1.5 rounded-md flex font-medium text-sm">
                            <button
                                onClick={() => setMatchType('AND')}
                                className={cn(
                                    "flex-1 py-1.5 rounded-sm transition-all duration-200",
                                    matchType === 'AND'
                                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Match All
                            </button>
                            <button
                                onClick={() => setMatchType('OR')}
                                className={cn(
                                    "flex-1 py-1.5 rounded-sm transition-all duration-200",
                                    matchType === 'OR'
                                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Match Any
                            </button>
                        </div>

                        {/* 3. Rules */}
                        <div className="space-y-0">
                            {rules.map((rule, index) => (
                                <div key={rule.id} className="group relative">
                                    {/* Vertical wrapper line logic could go here if needed */}
                                    <div className="flex items-start gap-3 py-3">
                                        <div className="grid grid-cols-[1.5fr,1fr,2fr] gap-3 flex-1">
                                            <Select
                                                value={rule.columnId}
                                                onValueChange={(val) => handleUpdateRule(rule.id, 'columnId', val)}
                                            >
                                                <SelectTrigger className="h-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-sm">
                                                    <SelectValue placeholder="Column" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {columns.map(col => (
                                                        <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Select
                                                value={rule.operator}
                                                onValueChange={(val) => handleUpdateRule(rule.id, 'operator', val as FilterOperator)}
                                            >
                                                <SelectTrigger className="h-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-sm">
                                                    <SelectValue placeholder="Op" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {operators.map(op => (
                                                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <div className="relative">
                                                <Input
                                                    value={rule.value}
                                                    onChange={(e) => handleUpdateRule(rule.id, 'value', e.target.value)}
                                                    className="h-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
                                                    disabled={rule.operator === 'isEmpty' || rule.operator === 'isNotEmpty'}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveRule(rule.id)}
                                            className="mt-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <Separator className="bg-gray-50 dark:bg-gray-900" />
                                </div>
                            ))}

                            <div className="pt-6">
                                <button
                                    onClick={handleAddRule}
                                    className="w-full border border-dashed border-blue-200 dark:border-blue-900/50 rounded-lg py-3 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Filter Rule
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer - Using Theme Buttons for Reset/Apply */}
                <SheetFooter className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 flex gap-4 bg-white dark:bg-card-bg sm:space-x-0">
                    <Button
                        variant="tertiary"
                        onClick={handleReset}
                        className="flex-1"
                    >
                        Reset
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleApply}
                        className="flex-1"
                    >
                        Apply Filters
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
