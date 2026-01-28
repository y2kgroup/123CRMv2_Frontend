'use client';

import React, { useMemo, useState } from 'react';
import {
    LayoutList,
    Filter,
    Plus,
    MoreHorizontal,
    SlidersHorizontal,
    Search,
    Download,
    Upload,
    CheckSquare,
    Clock,
    AlertCircle
} from 'lucide-react';
import { useLayout } from '@/components/layout/LayoutContext';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { useTableConfig } from '@/components/ui/data-table/useTableConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import { TaskDetailCard, Task } from '@/components/tasks/TaskDetailCard';

// --- Mock Data ---
const MOCK_TASKS: Task[] = [
    {
        id: '1',
        title: 'Quarterly Sales Report',
        description: 'Compile sales data for Q3. Include breakdown by region and product line. Prepare slide deck for executive meeting.',
        status: 'To Do',
        priority: 'High',
        dueDate: 'Oct 25, 2024',
        assignee: { name: 'John Doe' },
        subtasks: [
            { id: '1-1', text: 'Gather Q3 sales data', completed: true },
            { id: '1-2', text: 'Analyze regional performance', completed: false },
            { id: '1-3', text: 'Create presentation slides', completed: false }
        ],
        activity: [
            { id: 'a1', user: 'John Doe', action: 'created the task', time: 'Yesterday at 4:30 PM' },
            { id: 'a2', user: 'Sarah Miller', action: 'commented', time: '10 mins ago', text: 'Added preliminary data for North region.' }
        ]
    },
    {
        id: '2',
        title: 'Client Onboarding - Acme Corp',
        description: 'Finalize contract and schedule kick-off meeting with the client team.',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: 'Nov 1, 2024',
        assignee: { name: 'Sarah Miller' },
        subtasks: [
            { id: '2-1', text: 'Send contract', completed: true },
            { id: '2-2', text: 'Schedule kick-off', completed: true },
            { id: '2-3', text: 'Setup account', completed: false }
        ]
    },
    {
        id: '3',
        title: 'Website Redesign Launch',
        description: 'Coordinate with dev team for the final deployment. Verify all links and forms.',
        status: 'In Progress',
        priority: 'High',
        dueDate: 'Nov 1, 2024',
        assignee: { name: 'Sarah Miller' },
        subtasks: []
    },
    {
        id: '4',
        title: 'Gather Q3 sales data',
        description: 'Need raw data exports from the CRM for all regions.',
        status: 'To Do',
        priority: 'Medium',
        dueDate: 'Oct 25, 2024',
        assignee: { name: 'Sarah Miller' },
        subtasks: []
    },
    {
        id: '5',
        title: 'Analyze regional performance',
        description: '',
        status: 'Done',
        priority: 'High',
        dueDate: 'Oct 23, 2024',
        assignee: { name: 'John Doe' }
    },
    {
        id: '6',
        title: 'Update Privacy Policy',
        description: 'Legal team requested updates to the privacy policy page.',
        status: 'To Do',
        priority: 'Low',
        dueDate: 'Nov 15, 2024',
        assignee: { name: 'John Doe' }
    }
];

// --- Column Constants ---
const defaultColumns = [
    { id: 'select', label: 'Select', isMandatory: true, style: { width: '40px' } },
    { id: 'title', label: 'Task Name', isMandatory: true, style: { minWidth: '300px', fontWeight: '600' } },
    { id: 'priority', label: 'Priority', isMandatory: true, style: { width: '100px' } },
    { id: 'status', label: 'Status', isMandatory: true, style: { width: '120px' } },
    { id: 'dueDate', label: 'Due Date', isMandatory: true, style: { width: '120px' } },
    { id: 'assignee', label: 'Assignee', isMandatory: true, style: { width: '150px' } },
];

export default function TasksPage() {
    const { setHeaderActions, setHeaderMenuItems } = useLayout();

    // --- State ---
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
    const [filterText, setFilterText] = useState('');

    // --- Table Config ---
    const tableConfig = useTableConfig({
        tableId: 'crm-tasks-v1',
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
                    New Task
                </Button>
            </div>
        );

        setHeaderMenuItems(
            <>
                <DropdownMenuItem>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Tasks
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Export Tasks
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Table Settings
                </DropdownMenuItem>
            </>
        );

        return () => {
            setHeaderActions(null);
            setHeaderMenuItems(null);
        };
    }, [setHeaderActions, setHeaderMenuItems, filterText]);

    // --- Data Processing ---
    const filteredTasks = useMemo(() => {
        return tasks.filter(task =>
            task.title.toLowerCase().includes(filterText.toLowerCase()) ||
            task.assignee.name.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [tasks, filterText]);

    // --- Handlers ---
    const handleRowClick = (task: Task) => {
        setSelectedTaskId(task.id === selectedTaskId ? null : task.id);
    };

    const handleTaskUpdate = (updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const toggleRow = (id: string) => {
        setSelectedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // --- Renderers ---
    const renderAvatar = (name: string, src?: string) => {
        if (src) {
            return (
                <div className="relative h-6 w-6 rounded-full overflow-hidden flex-shrink-0">
                    <Image src={src} alt={name} fill className="object-cover" />
                </div>
            );
        }
        return (
            <div className="h-6 w-6 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-medium text-[10px] flex-shrink-0">
                {name.charAt(0)}
            </div>
        );
    };

    // --- Column Definitions ---
    const columns = useMemo(() => {
        const renderers: Record<string, (item: Task) => React.ReactNode> = {
            select: (item) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={!!selectedRows[item.id]}
                        onCheckedChange={() => toggleRow(item.id)}
                    />
                </div>
            ),
            title: (item) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{item.title}</span>
                    {item.description && (
                        <span className="text-xs text-slate-500 truncate max-w-[300px]">{item.description}</span>
                    )}
                </div>
            ),
            priority: (item) => {
                const priorityColors: Record<string, string> = {
                    'High': 'bg-red-50 text-red-700 border-red-100',
                    'Medium': 'bg-amber-50 text-amber-700 border-amber-100',
                    'Low': 'bg-slate-50 text-slate-700 border-slate-100'
                };
                return (
                    <Badge variant="outline" className={`${priorityColors[item.priority] || ''} font-normal`}>
                        {item.priority}
                    </Badge>
                );
            },
            status: (item) => {
                const statusColors: Record<string, string> = {
                    'Done': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    'In Progress': 'bg-blue-50 text-blue-700 border-blue-100',
                    'To Do': 'bg-slate-50 text-slate-700 border-slate-100'
                };
                return (
                    <Badge variant="outline" className={`${statusColors[item.status] || ''} font-normal`}>
                        {item.status}
                    </Badge>
                );
            },
            dueDate: (item) => {
                const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'Done';
                return (
                    <div className={`flex items-center gap-1.5 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {item.dueDate}
                    </div>
                );
            },
            assignee: (item) => (
                <div className="flex items-center gap-2">
                    {renderAvatar(item.assignee.name, item.assignee.avatar)}
                    <span className="text-sm text-slate-700">{item.assignee.name}</span>
                </div>
            )
        };
        return renderers;
    }, [selectedRows]);

    const selectedTask = tasks.find(t => t.id === selectedTaskId);

    return (
        <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-slate-50/50">
            {/* Main Table Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out">
                <DataTable
                    data={filteredTasks}
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
                    selectedTaskId ? "w-[450px] translate-x-0" : "w-0 translate-x-full overflow-hidden opacity-0"
                )}
            >
                {selectedTask && (
                    <TaskDetailCard
                        task={selectedTask}
                        onClose={() => setSelectedTaskId(null)}
                        onUpdate={handleTaskUpdate}
                    />
                )}
            </div>
        </div>
    );
}
