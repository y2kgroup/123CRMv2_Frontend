import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Trash2, Save, Link as LinkIcon, Building2, Folder, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; // Assuming this exists or consistent with project

// --- Types ---
export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: {
        name: string;
        avatar?: string;
    };
    relatedTo?: {
        type: 'Project' | 'Contact' | 'Company' | 'Task';
        id: string;
        name: string;
    };
}

interface NoteDetailCardProps {
    note: Note;
    onClose: () => void;
    onUpdate: (note: Note) => void;
    onDelete?: (id: string) => void;
}

export const NoteDetailCard: React.FC<NoteDetailCardProps> = ({ note, onClose, onUpdate, onDelete }) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [isDirty, setIsDirty] = useState(false);

    // Reset state when note changes
    useEffect(() => {
        setTitle(note.title);
        setContent(note.content);
        setIsDirty(false);
    }, [note]);

    const handleSave = () => {
        onUpdate({
            ...note,
            title,
            content,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) // Simple date update mock
        });
        setIsDirty(false);
    };

    const getEntityIcon = (type?: string) => {
        switch (type) {
            case 'Project': return Folder;
            case 'Company': return Building2;
            case 'Contact': return User;
            case 'Task': return CheckSquare;
            default: return LinkIcon;
        }
    };
    const EntityIcon = getEntityIcon(note.relatedTo?.type);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-500">
                    <span className="text-sm font-medium">Note Details</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="tertiary" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600" onClick={() => onDelete?.(note.id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="h-4 w-px bg-slate-200 mx-1" />
                    <Button variant="tertiary" className="h-8 w-8 p-0" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Title Section */}
                    <div className="space-y-4">
                        <Input
                            value={title}
                            onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
                            className="text-xl font-semibold border-none px-0 shadow-none focus-visible:ring-0 h-auto placeholder:text-slate-400"
                            placeholder="Note Title"
                        />

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Calendar className="w-4 h-4" />
                                <span>Created {note.createdAt}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <User className="w-4 h-4" />
                                <span>{note.author.name}</span>
                            </div>

                            {/* Related To Badge */}
                            {note.relatedTo && (
                                <div className="col-span-2 flex items-center gap-2 pt-2">
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Related To:</span>
                                    <Badge variant="secondary" className="font-normal gap-1.5 pl-1.5 pr-2.5 py-0.5 h-6">
                                        <EntityIcon className="w-3.5 h-3.5 text-slate-500" />
                                        <span>{note.relatedTo.name}</span>
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Editor Area */}
                    <Textarea
                        value={content}
                        onChange={(e) => { setContent(e.target.value); setIsDirty(true); }}
                        className="min-h-[400px] border-none shadow-none focus-visible:ring-0 resize-none px-0 text-base leading-relaxed text-slate-700"
                        placeholder="Write your note here..."
                    />
                </div>
            </div>

            {/* Footer */}
            {isDirty && (
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                </div>
            )}
        </div>
    );
};
