'use client';

import React, { useMemo, useState } from 'react';
import {
    Filter,
    Plus,
    Search,
    Download,
    Upload,
    MoreHorizontal,
    FileText,
    Calendar,
    User,
    Building2,
    Folder,
    CheckSquare
} from 'lucide-react';
import { useLayout } from '@/components/layout/LayoutContext';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { useTableConfig } from '@/components/ui/data-table/useTableConfig';
import { evaluateFormula } from '@/lib/formula';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NoteDetailCard, Note } from '@/components/notes/NoteDetailCard';

// --- Mock Data ---
const MOCK_NOTES: Note[] = [
    {
        id: '1',
        title: 'Meeting Notes - Website Redesign',
        content: 'Discussed the main navigation structure. Client wants to emphasize the "Services" section. Need to mock up 3 variations by Friday.\n\nKey takeaways:\n- Use "Inter" font family\n- Primary color: #2563EB\n- Mobile-first approach is critical',
        createdAt: 'Oct 24, 2024',
        updatedAt: 'Oct 24, 2024',
        author: { name: 'John Doe' },
        relatedTo: { type: 'Project', id: 'p1', name: 'Website Scale' }
    },
    {
        id: '2',
        title: 'Call Log - Acme Corp Integration',
        content: 'Spoke with Sarah from IT. API keys have been generated. We need to whitelist their IP range before testing the connection.',
        createdAt: 'Oct 23, 2024',
        updatedAt: 'Oct 23, 2024',
        author: { name: 'Sarah Miller' },
        relatedTo: { type: 'Company', id: 'c1', name: 'Acme Corp' }
    },
    {
        id: '3',
        title: 'Feedback on Q3 Goals',
        content: 'Reviewing the quarterly performance. Exceeded sales targets by 15%. Need to focus more on customer retention for Q4.',
        createdAt: 'Oct 20, 2024',
        updatedAt: 'Oct 21, 2024',
        author: { name: 'John Doe' },
        relatedTo: { type: 'Contact', id: 'ct1', name: 'Mike Ross' }
    },
    {
        id: '4',
        title: 'Deployment Checklist',
        content: '1. Run unit tests\n2. Build production assets\n3. Verify environment variables\n4. Database migration\n5. Smoke test critical paths',
        createdAt: 'Oct 18, 2024',
        updatedAt: 'Oct 18, 2024',
        author: { name: 'Sarah Miller' },
        relatedTo: { type: 'Task', id: 't1', name: 'Deploy V2' }
    },
    {
        id: '5',
        title: 'Personal: Learning React 19',
        content: 'Check out the new compiler features. Memoization is automatic now? Need to read the docs on "use".',
        createdAt: 'Oct 15, 2024',
        updatedAt: 'Oct 15, 2024',
        author: { name: 'John Doe' }
    }
];

// --- Column Constants ---
const defaultColumns = [
    { id: 'select', label: 'Select', isMandatory: true, style: { width: '40px' } },
    { id: 'title', label: 'Note Title', isMandatory: true, style: { minWidth: '250px', fontWeight: '600' } },
    { id: 'relatedTo', label: 'Related To', isMandatory: true, style: { width: '180px' } },
    { id: 'createdAt', label: 'Created', isMandatory: true, style: { width: '120px' } },
    { id: 'author', label: 'Author', isMandatory: true, style: { width: '150px' } },
];

export default function NotesPage() {
    const { setHeaderActions, setHeaderMenuItems } = useLayout();

    // --- State ---
    const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
    const [filterText, setFilterText] = useState('');

    // --- Table Config ---
    const tableConfig = useTableConfig({
        tableId: 'crm-notes-v1',
        defaultColumns: defaultColumns
    });

    // --- Header Actions ---
    React.useEffect(() => {
        setHeaderActions(
            <div className="flex items-center gap-2">
                <Button variant="secondary" className="h-9 px-3" icon={Filter}>
                    Filters
                </Button>
                <Button variant="primary" className="h-9 w-auto px-4" icon={Plus}>
                    New Note
                </Button>
            </div>
        );

        setHeaderMenuItems(
            <>
                <DropdownMenuItem>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Notes
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Export Notes
                </DropdownMenuItem>
            </>
        );

        return () => {
            setHeaderActions(null);
            setHeaderMenuItems(null);
        };
    }, [setHeaderActions, setHeaderMenuItems]);

    // --- Data Processing ---
    const filteredNotes = useMemo(() => {
        return notes.filter(note =>
            note.title.toLowerCase().includes(filterText.toLowerCase()) ||
            note.content.toLowerCase().includes(filterText.toLowerCase()) ||
            note.relatedTo?.name.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [notes, filterText]);

    // --- Handlers ---
    const handleRowClick = (note: Note) => {
        setSelectedNoteId(note.id === selectedNoteId ? null : note.id);
    };

    const handleNoteUpdate = (updatedNote: Note) => {
        setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    };

    const handleNoteDelete = (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        setSelectedNoteId(null);
    }

    const toggleRow = (id: string) => {
        setSelectedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // --- Helpers ---
    const getEntityIcon = (type?: string) => {
        switch (type) {
            case 'Project': return Folder;
            case 'Company': return Building2;
            case 'Contact': return User;
            case 'Task': return CheckSquare;
            default: return FileText;
        }
    };

    // --- Column Definitions ---
    const columns = useMemo(() => {
        const renderers: Record<string, (item: Note) => React.ReactNode> = {
            select: (item) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={!!selectedRows[item.id]}
                        onCheckedChange={() => toggleRow(item.id)}
                    />
                </div>
            ),
            title: (item) => {
                const colConfig = tableConfig.config?.columns?.['title'];

                // Formula Support
                if (colConfig?.type === 'formula' && colConfig.formula) {
                    const val = evaluateFormula(colConfig.formula, item);
                    return <span className="font-semibold text-slate-900">{String(val)}</span>;
                }

                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-900">{item.title}</span>
                        <span className="text-xs text-slate-500 truncate max-w-[350px] block">
                            {item.content.replace(/\n/g, ' ')}
                        </span>
                    </div>
                );
            },
            relatedTo: (item) => {
                if (!item.relatedTo) return <span className="text-slate-400 text-xs">-</span>;
                const Icon = getEntityIcon(item.relatedTo.type);
                return (
                    <Badge variant="outline" className="font-normal gap-1.5 pl-1.5 pr-2.5 py-0.5 bg-slate-50/50">
                        <Icon className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[120px]">{item.relatedTo.name}</span>
                    </Badge>
                );
            },
            createdAt: (item) => (
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {item.createdAt}
                </div>
            ),
            author: (item) => (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-medium text-[10px] flex-shrink-0">
                        {item.author.name.charAt(0)}
                    </div>
                    <span className="text-sm text-slate-700">{item.author.name}</span>
                </div>
            )
        };
        return renderers;
    }, [selectedRows]);

    const selectedNote = notes.find(n => n.id === selectedNoteId);

    return (
        <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-slate-50/50">
            {/* Main Table Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out">
                <DataTable
                    data={filteredNotes}
                    config={tableConfig}
                    columns={columns}
                    onRowClick={handleRowClick}
                    isAllSelected={false}
                    onSelectAll={() => { }}
                />
            </div>

            {/* Detail Panel */}
            <div
                className={cn(
                    "border-l shadow-xl bg-white z-20 transition-all duration-300 ease-in-out",
                    selectedNoteId ? "w-[450px] translate-x-0" : "w-0 translate-x-full overflow-hidden opacity-0"
                )}
            >
                {selectedNote && (
                    <NoteDetailCard
                        note={selectedNote}
                        onClose={() => setSelectedNoteId(null)}
                        onUpdate={handleNoteUpdate}
                        onDelete={handleNoteDelete}
                    />
                )}
            </div>
        </div>
    );
}
