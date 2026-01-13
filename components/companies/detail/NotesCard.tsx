'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Pencil, X } from 'lucide-react';

interface Note {
    id: string;
    text: string;
    author: string;
    date: string;
    timestamp: number;
}

export function NotesCard() {
    const [noteText, setNoteText] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const [notes, setNotes] = useState<Note[]>([
        {
            id: '1',
            text: 'Client expressed interest in expanding the cloud migration project scope. Scheduled follow-up for next Tuesday.',
            author: 'You',
            date: 'Today, 10:23 AM',
            timestamp: 1700000000000
        },
        {
            id: '2',
            text: 'Key stakeholder meeting went well. They are happy with the current progress on the API integration.',
            author: 'Sarah D.',
            date: 'Oct 22, 2023',
            timestamp: 1698000000000
        },
        {
            id: '3',
            text: "Discussed pricing options for the enterprise plan. They're considering a 3-year commitment.",
            author: 'Mike R.',
            date: 'Oct 21, 2023',
            timestamp: 1697900000000
        }
    ]);

    const handleSaveNote = () => {
        if (!noteText.trim()) return;

        const now = new Date();
        const newNote: Note = {
            id: Date.now().toString(),
            text: noteText,
            author: 'You',
            date: now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }),
            timestamp: now.getTime()
        };

        setNotes((prev) => [newNote, ...prev]);
        setNoteText('');
    };

    const handleDelete = (id: string) => {
        setNotes((prev) => prev.filter(n => n.id !== id));
    };

    const startEditing = (note: Note) => {
        setEditingId(note.id);
        setEditText(note.text);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText('');
    };

    const saveEdit = (id: string) => {
        if (!editText.trim()) return;

        setNotes((prev) => prev.map(n => n.id === id ? { ...n, text: editText } : n));
        setEditingId(null);
        setEditText('');
    };

    return (
        <Card className="flex flex-col h-full border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="flex-none flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold">Notes</CardTitle>
                <Button
                    variant="primary"
                    className="h-7 text-xs px-2"
                    icon={Check}
                    onClick={handleSaveNote}
                    disabled={!noteText.trim()}
                >
                    Save Note
                </Button>
            </CardHeader>

            {/* Sticky Input Area */}
            <div className="flex-none px-6 pb-4 bg-card z-10">
                <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full min-h-[100px] p-3 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none placeholder:text-slate-400"
                    placeholder="Add a quick note..."
                />
            </div>

            {/* Scrollable List Area */}
            <CardContent className="flex-1 overflow-y-auto min-h-0 pt-0">
                <div className="space-y-4">
                    {notes.map((note, index) => (
                        <div key={note.id} className="group relative">
                            {index > 0 && <Separator className="mb-4" />}

                            {editingId === note.id ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full min-h-[80px] p-2 text-sm rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={cancelEdit}
                                            className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => saveEdit(note.id)}
                                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start group/item">
                                        <p className="text-sm text-slate-700 leading-relaxed mb-2 pr-16 break-words">
                                            {note.text}
                                        </p>
                                        {/* Action Buttons (Visible on Hover) */}
                                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-1 absolute top-0 right-0 bg-white/80 backdrop-blur-sm p-1 rounded-bl-lg">
                                            <button
                                                onClick={() => startEditing(note)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Edit Note"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(note.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete Note"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[8px] font-bold">
                                                {note.author.charAt(0)}
                                            </div>
                                            <span className="font-medium text-slate-700">{note.author === 'You' ? 'You' : note.author}</span>
                                        </div>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span className="text-slate-400">{note.date}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
