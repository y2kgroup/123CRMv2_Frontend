'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Upload, FileText, FileImage, FileSpreadsheet, Pencil, Trash2, Check, X, Download, ExternalLink } from 'lucide-react';

interface FileItem {
    id: string;
    name: string;
    size: string;
    date: string;
    icon: any;
    color: string;
    bg: string;
    url?: string;
    type?: string;
}

export function FilesCard() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

    const [files, setFiles] = useState<FileItem[]>([
        { id: '1', name: 'Service_Contract_2024.pdf', size: '2.4 MB', date: 'Oct 15, 2023', icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
        { id: '2', name: 'Brand_Assets_Logo.png', size: '1.8 MB', date: 'Sep 28, 2023', icon: FileImage, color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: '3', name: 'Q3_Financial_Report.xlsx', size: '850 KB', date: 'Oct 02, 2023', icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-50' },
        { id: '4', name: 'Project_Proposal_v2.pdf', size: '3.1 MB', date: 'Oct 20, 2023', icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
    ]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleDelete = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setFiles((prev) => prev.filter(f => f.id !== id));
        if (previewFile?.id === id) setPreviewFile(null);
    };

    const startEditing = (file: FileItem, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(file.id);
        setEditName(file.name);
    };

    const cancelEdit = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setEditingId(null);
        setEditName('');
    };

    const saveEdit = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!editName.trim()) return;
        setFiles((prev) => prev.map(f => f.id === id ? { ...f, name: editName } : f));
        setEditingId(null);
        setEditName('');
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileClick = (file: FileItem) => {
        if (editingId === file.id) return;
        setPreviewFile(file);
    };

    const handleDownload = () => {
        if (!previewFile?.url) return;
        const link = document.createElement('a');
        link.href = previewFile.url;
        link.download = previewFile.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenInNewTab = () => {
        if (previewFile?.url) {
            window.open(previewFile.url, '_blank');
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Determine icon and color based on file type
        let icon = FileText;
        let color = 'text-slate-500';
        let bg = 'bg-slate-50';

        if (file.type.includes('image')) {
            icon = FileImage;
            color = 'text-purple-500';
            bg = 'bg-purple-50';
        } else if (file.type.includes('sheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
            icon = FileSpreadsheet;
            color = 'text-green-500';
            bg = 'bg-green-50';
        } else if (file.type.includes('pdf')) {
            icon = FileText;
            color = 'text-red-500';
            bg = 'bg-red-50';
        }

        // Format file size
        const size = file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${(file.size / 1024).toFixed(1)} KB`;

        const newFile: FileItem = {
            id: Date.now().toString(),
            name: file.name,
            size: size,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            icon: icon,
            color: color,
            bg: bg,
            url: URL.createObjectURL(file),
            type: file.type
        };

        setFiles(prev => [newFile, ...prev]);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <Card className="flex flex-col h-full border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="flex-none flex flex-row items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold">Files</CardTitle>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{files.length}</span>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <Button
                        variant="primary"
                        icon={Upload}
                        className="h-7 text-xs px-2"
                        onClick={handleUploadClick}
                    >
                        Upload
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-3">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            onClick={() => handleFileClick(file)}
                            className="group relative flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
                        >
                            <div className={`w-10 h-10 rounded-lg ${file.bg} flex items-center justify-center ${file.color}`}>
                                <file.icon className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                {editingId === file.id ? (
                                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full p-1.5 text-sm rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={(e) => cancelEdit(e)}
                                                className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => saveEdit(file.id, e)}
                                                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-medium text-slate-900 truncate pr-16">{file.name}</p>

                                            {/* Action Buttons (Visible on Hover) */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-0.5 rounded border border-slate-100 shadow-sm">
                                                <button
                                                    onClick={(e) => startEditing(file, e)}
                                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Rename File"
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(file.id, e)}
                                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete File"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                            <span>{file.size}</span>
                                            <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
                                            <span>{file.date}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
                <DialogContent className="max-w-[80vw] w-full">
                    <DialogHeader>
                        <DialogTitle>{previewFile?.name}</DialogTitle>
                    </DialogHeader>

                    <div className="flex items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg min-h-[600px]">
                        {previewFile?.type?.includes('image') && previewFile.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={previewFile.url}
                                alt={previewFile.name}
                                className="max-h-[70vh] max-w-full object-contain rounded-md shadow-sm"
                            />
                        ) : (
                            <div className="text-center space-y-3">
                                <div className={`w-16 h-16 rounded-2xl ${previewFile?.bg || 'bg-slate-100'} flex items-center justify-center mx-auto ${previewFile?.color || 'text-slate-500'}`}>
                                    {previewFile && <previewFile.icon className="w-8 h-8" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Preview not available</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {previewFile?.url
                                            ? "This file type cannot be previewed directly."
                                            : "This is a demo file."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={handleOpenInNewTab}
                            disabled={!previewFile?.url}
                            icon={ExternalLink}
                        >
                            Open in New Tab
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleDownload}
                            disabled={!previewFile?.url}
                            icon={Download}
                        >
                            Download File
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
