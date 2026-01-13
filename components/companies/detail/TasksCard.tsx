'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ListPlus, Trash2, Pencil, Check, X } from 'lucide-react';

interface Task {
    id: number;
    text: string;
    due: string;
    assignee: string;
    completed: boolean;
}

export function TasksCard() {
    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, text: 'Prepare quarterly business review presentation', due: 'Due Tomorrow', assignee: 'You', completed: false },
        { id: 2, text: 'Follow up on contract renewal discussion', due: 'Oct 24', assignee: 'Sarah D.', completed: false },
        { id: 3, text: 'Schedule technical integration meeting', due: 'Oct 28', assignee: 'Tech Team', completed: false },
        { id: 4, text: 'Send updated pricing proposal', due: 'Completed Yesterday', assignee: 'You', completed: true },
    ]);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleDelete = (id: number) => {
        setTasks((prev) => prev.filter(t => t.id !== id));
    };

    const startEditing = (task: Task) => {
        setEditingId(task.id);
        setEditText(task.text);
    };

    const cancelEdit = () => {
        // If canceling a newly created (empty) task, remove it
        const currentTask = tasks.find(t => t.id === editingId);
        if (currentTask && !currentTask.text.trim()) {
            handleDelete(editingId!);
        }
        setEditingId(null);
        setEditText('');
    };

    const saveEdit = (id: number) => {
        if (!editText.trim()) {
            // If saving an empty task, assume deletion or cancel
            handleDelete(id);
            setEditingId(null);
            return;
        }

        setTasks((prev) => prev.map(t => t.id === id ? { ...t, text: editText } : t));
        setEditingId(null);
        setEditText('');
    };

    const handleNewTask = () => {
        const newId = Date.now();
        const newTask: Task = {
            id: newId,
            text: '', // Start empty
            due: 'Due Today',
            assignee: 'You',
            completed: false
        };
        // Add to top of list
        setTasks((prev) => [newTask, ...prev]);
        // Immediately enter edit mode
        setEditingId(newId);
        setEditText('');
    };

    const pendingCount = tasks.filter(t => !t.completed).length;

    return (
        <Card className="flex flex-col h-full border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex-none flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">Tasks</CardTitle>
                    <span className="text-xs font-medium text-slate-500">{pendingCount} Pending</span>
                </div>
                <Button
                    variant="primary"
                    icon={ListPlus}
                    className="h-7 text-xs px-2"
                    onClick={handleNewTask}
                >
                    New Task
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
                {tasks.map(task => (
                    <div key={task.id} className={`group relative flex items-start gap-3 p-3 rounded-lg border transition-all ${task.completed ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 shadow-sm hover:border-blue-200'}`}>
                        <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="mt-1" />

                        <div className="flex-1 space-y-1 min-w-0">
                            {editingId === task.id ? (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full p-1.5 text-sm rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Enter task description..."
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEdit(task.id);
                                            if (e.key === 'Escape') cancelEdit();
                                        }}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={cancelEdit}
                                            className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => saveEdit(task.id)}
                                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start">
                                        <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                            {task.text}
                                        </p>

                                        {/* Action Buttons (Visible on Hover) */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-0.5 rounded border border-slate-100 shadow-sm">
                                            <button
                                                onClick={() => startEditing(task)}
                                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                title="Edit Task"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task.id)}
                                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                title="Delete Task"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs">
                                        <span className={`${task.completed ? 'text-slate-400' : 'text-red-500 font-medium'}`}>{task.due}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[8px] font-bold">
                                                {task.assignee.charAt(0)}
                                            </div>
                                            {task.assignee === 'You' ? 'Assigned to You' : `Assigned to ${task.assignee}`}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
