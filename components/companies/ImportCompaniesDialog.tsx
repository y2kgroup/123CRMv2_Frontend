"use client"

import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileUp, Upload, X, FileText } from 'lucide-react'

interface ImportCompaniesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (file: File) => void;
}

export function ImportCompaniesDialog({ open, onOpenChange, onImport }: ImportCompaniesDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        // Simple validation for now (CSV, Excel)
        const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        // Allow basic check, maybe expand later
        setFile(file);
    };

    const handleImport = () => {
        if (file) {
            onImport(file);
            onOpenChange(false);
            setFile(null); // Reset
        }
    };

    const triggerFileInput = () => {
        inputRef.current?.click();
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Import Companies</DialogTitle>
                    <DialogDescription>
                        Drag and drop your file here or click to browse.
                        Supported formats: .csv, .xlsx
                    </DialogDescription>
                </DialogHeader>

                <div
                    className={`
                        mt-4 border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                        flex flex-col items-center justify-center gap-4
                        ${dragActive ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleChange}
                    />

                    {file ? (
                        <div className="flex flex-col items-center gap-2 text-primary">
                            <FileText className="w-10 h-10" />
                            <div className="text-sm font-medium">{file.name}</div>
                            <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</div>
                            <Button
                                variant="tertiary"
                                className="mt-2 h-7 text-xs px-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                }}
                            >
                                Remove File
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                                <Upload className="w-6 h-6 text-slate-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium">Click to upload or drag and drop</span>
                                <span className="text-xs text-muted-foreground">CSV or Excel files up to 10MB</span>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleImport}
                        disabled={!file}
                    >
                        Import
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
