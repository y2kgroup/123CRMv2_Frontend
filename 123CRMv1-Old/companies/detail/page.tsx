"use client";

import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

import {
    Globe,
    Mail,
    Phone,
    Building2,
    MoreHorizontal,
    MoreVertical,
    FileText,
    FileImage,
    FileSpreadsheet,
    Download,
    Settings,
    LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

// Components
import { SortableWidget } from "@/components/features/companies/SortableWidget";
import { AboutCard } from "@/components/features/companies/AboutCard";
import { TasksCard, Task } from "@/components/features/companies/TasksCard";
import { NotesCard, Note } from "@/components/features/companies/NotesCard";
import { FilesCard, FileItem } from "@/components/features/companies/FilesCard";

// --- Mock Data ---
const companyData = {
    id: "COM-789012",
    name: "TechNova Solutions",
    owner: "John Smith",
    logo: "TN",
    industry: "Technology",
    website: "technovasolutions.com",
    email: "contact@technovasolutions.com",
    phone: "+1 555-0110",
    address: "123 Innovation Dr, San Francisco, CA 94105",
};

const tasksMock: Task[] = [
    {
        id: "1",
        title: "Prepare quarterly business review presentation",
        dueDate: "Due Tomorrow",
        assignee: "J",
        assigneeColor: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300",
        status: "pending"
    },
    {
        id: "2",
        title: "Follow up on contract renewal discussion",
        dueDate: "Oct 24",
        assignee: "S",
        assigneeColor: "bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-300",
        status: "pending"
    },
    {
        id: "3",
        title: "Schedule technical integration meeting",
        dueDate: "Oct 28",
        assignee: "T",
        assigneeColor: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300",
        status: "pending"
    },
    {
        id: "4",
        title: "Send updated pricing proposal",
        dueDate: "Completed Yesterday",
        assignee: "J",
        assigneeColor: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300",
        status: "completed"
    }
];

const filesMock: FileItem[] = [
    { id: "1", name: "Service_Contract_2024.pdf", size: "2.4 MB", type: "pdf", date: "Oct 15, 2023" },
    { id: "2", name: "Brand_Assets_Logo.png", size: "1.8 MB", type: "image", date: "Sep 28, 2023" },
    { id: "3", name: "Q3_Financial_Report.xlsx", size: "850 KB", type: "spreadsheet", date: "Oct 02, 2023" },
    { id: "4", name: "Project_Proposal_v2.pdf", size: "3.1 MB", type: "pdf", date: "Oct 20, 2023" },
];

const notesMock: Note[] = [
    { id: "1", text: "Client expressed interest in expanding the cloud migration project scope. Scheduled follow-up for next Tuesday.", date: "Today, 10:23 AM", author: "You" },
    { id: "2", text: "Key stakeholder meeting went well. They are happy with the current progress on the API integration.", date: "Oct 22, 2023", author: "Sarah D." },
    { id: "3", text: "Discussed pricing options for the enterprise plan. They're considering a 3-year commitment.", date: "Oct 21, 2023", author: "Mike R." },
    { id: "4", text: "Technical review completed. All systems are go for the next phase of deployment.", date: "Oct 20, 2023", author: "You" },
    { id: "5", text: "Contract negotiations are progressing well. Legal team is reviewing the final terms.", date: "Oct 19, 2023", author: "Jennifer L." },
    { id: "6", text: "Demo session scheduled for next week. Preparing presentation materials.", date: "Oct 18, 2023", author: "You" },
    { id: "7", text: "Customer feedback has been overwhelmingly positive. NPS score increased by 15 points.", date: "Oct 17, 2023", author: "Sarah D." },
    { id: "8", text: "Integration with their existing CRM system is complete. Testing phase begins Monday.", date: "Oct 16, 2023", author: "Mike R." },
];

// --- Layout Config ---
interface WidgetConfig {
    id: string;
    colSpan: string;
    heightClass?: string;
}

const defaultLayout: WidgetConfig[] = [
    { id: 'about', colSpan: 'lg:col-span-12 xl:col-span-3', heightClass: 'h-full' },
    { id: 'tasks', colSpan: 'lg:col-span-12 xl:col-span-3', heightClass: 'h-full' },
    { id: 'notes', colSpan: 'lg:col-span-12 xl:col-span-3', heightClass: 'h-full' },
    { id: 'files', colSpan: 'lg:col-span-12 xl:col-span-3', heightClass: 'h-full' },
];

export default function CompanyDetailPage() {
    const { theme } = useTheme();

    // Determine default height based on layout mode
    const defaultHeight = theme.layoutMode === "vertical" ? 'h-[975px]' : 'h-[925px]';

    // Core Data State
    const [tasks, setTasks] = useState<Task[]>(tasksMock);
    const [files] = useState<FileItem[]>(filesMock);
    const [notes, setNotes] = useState<Note[]>(notesMock);
    const [newNote, setNewNote] = useState("");
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

    // Layout State
    const [isEditMode, setIsEditMode] = useState(false);
    const [widgets, setWidgets] = useState<WidgetConfig[]>([
        { id: 'about', colSpan: 'lg:col-span-12 xl:col-span-3', heightClass: defaultHeight },
        { id: 'tasks', colSpan: 'lg:col-span-12 xl:col-span-3', heightClass: defaultHeight },
        { id: 'notes', colSpan: 'lg:col-span-12 xl:col-span-3', heightClass: defaultHeight },
        { id: 'files', colSpan: 'lg:col-span-12 xl:col-span-3', heightClass: defaultHeight },
    ]);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handlers
    const toggleTask = (taskId: string) => {
        setTasks(current => current.map(t =>
            t.id === taskId ? { ...t, status: t.status === "pending" ? "completed" : "pending" } : t
        ));
    };

    const handleSaveNote = () => {
        if (!newNote.trim()) return;
        const note: Note = {
            id: Date.now().toString(),
            text: newNote,
            date: "Just now",
            author: "You"
        };
        setNotes([note, ...notes]);
        setNewNote("");
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setWidgets((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleResize = (id: string, newSpan: string, newHeight?: string) => {
        setWidgets(current => current.map(w =>
            w.id === id ? { ...w, colSpan: newSpan, heightClass: newHeight || w.heightClass } : w
        ));
    };

    // Render Widget Function
    const renderWidget = (id: string) => {
        switch (id) {
            case 'about':
                return <AboutCard />;
            case 'tasks':
                return <TasksCard tasks={tasks} toggleTask={toggleTask} />;
            case 'notes':
                return <NotesCard notes={notes} newNote={newNote} setNewNote={setNewNote} onSave={handleSaveNote} />;
            case 'files':
                return <FilesCard files={files} onSelectFile={setSelectedFile} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-transparent relative -mx-6 -my-6">
            <div className={cn(
                "w-full px-6 flex-1 flex flex-col overflow-hidden",
                theme.layoutMode === "vertical" ? "pt-6 pb-6" : "py-6"
            )}>

                {/* --- 1. Header Card --- */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0 mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                {/* Large Logo */}
                                <div
                                    className="h-20 w-20 rounded-full flex items-center justify-center border"
                                    style={{
                                        backgroundColor: theme.colorScheme === 'dark' ? undefined : `${theme.actionButtonColor}10`,
                                        borderColor: theme.colorScheme === 'dark' ? undefined : `${theme.actionButtonColor}30`,
                                        color: theme.colorScheme === 'dark' ? undefined : theme.actionButtonColor
                                    }}
                                >
                                    <span className="text-2xl font-bold dark:text-blue-400">{companyData.logo}</span>
                                </div>

                                {/* Info */}
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                        {companyData.name}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                            <Building2 className="h-3.5 w-3.5" />
                                            <span>{companyData.industry}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                                            <Globe className="h-3.5 w-3.5" />
                                            <span>{companyData.website}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Actions */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Button
                                    className="flex-1 md:flex-none gap-2 text-white shadow-sm"
                                    style={{
                                        backgroundColor: theme.colorScheme === 'dark' ? undefined : theme.actionButtonColor,
                                        color: theme.colorScheme === 'dark' ? undefined : theme.actionButtonTextColor
                                    }}
                                >
                                    <Mail className="h-4 w-4" />
                                    Send Email
                                </Button>

                                {/* 3-Dot Menu - Right side after Send Email */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            size="icon"
                                            className="h-10 w-10 shadow-sm"
                                            style={{
                                                backgroundColor: theme.colorScheme === 'dark' ? undefined : theme.saveButtonColor,
                                                color: theme.colorScheme === 'dark' ? undefined : theme.saveButtonTextColor
                                            }}
                                        >
                                            <MoreVertical className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => setIsEditMode(!isEditMode)}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            {isEditMode ? "Done Editing" : "Edit Layout"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Settings className="mr-2 h-4 w-4" />
                                            Page Settings
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* --- 2. Flexible Grid Layout --- */}
                <div className="flex-1 min-h-0">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={widgets.map(w => w.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                                {widgets.map((widget) => (
                                    <SortableWidget
                                        key={widget.id}
                                        id={widget.id}
                                        colSpan={widget.colSpan}
                                        heightClass={widget.heightClass || (theme.layoutMode === "vertical" ? 'h-[975px]' : 'h-[925px]')}
                                        isEditMode={isEditMode}
                                        onResize={handleResize}
                                    >
                                        {renderWidget(widget.id)}
                                    </SortableWidget>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {/* File Preview Dialog */}
            <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
                <DialogContent className="sm:max-w-[600px] border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                selectedFile?.type === "pdf" && "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
                                selectedFile?.type === "image" && "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
                                selectedFile?.type === "spreadsheet" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                            )}>
                                {selectedFile?.type === "pdf" && <FileText className="h-4 w-4" />}
                                {selectedFile?.type === "image" && <FileImage className="h-4 w-4" />}
                                {selectedFile?.type === "spreadsheet" && <FileSpreadsheet className="h-4 w-4" />}
                            </div>
                            <DialogTitle className="text-lg font-semibold">{selectedFile?.name}</DialogTitle>
                        </div>
                        <DialogDescription>
                            {selectedFile?.size} • {selectedFile?.date}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 min-h-[300px]">
                        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            {selectedFile?.type === "image" ? (
                                <FileImage className="h-8 w-8 text-slate-400" />
                            ) : (
                                <FileText className="h-8 w-8 text-slate-400" />
                            )}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Preview not available for this file type</p>
                        <Button variant="link" className="text-blue-600 dark:text-blue-400 mt-2">
                            Download to view
                        </Button>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setSelectedFile(null)}>Close</Button>
                        <Button
                            className="gap-2 text-white"
                            style={{
                                backgroundColor: theme.colorScheme === 'dark' ? undefined : theme.actionButtonColor,
                                color: theme.colorScheme === 'dark' ? undefined : theme.actionButtonTextColor
                            }}
                        >
                            <Download className="h-4 w-4" /> Download File
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
