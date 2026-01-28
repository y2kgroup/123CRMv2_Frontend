import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    CheckSquare,
    Clock,
    MoreHorizontal,
    Plus,
    Trash2,
    User,
    Paperclip,
    X
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import Image from 'next/image';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'To Do' | 'In Progress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    dueDate: string;
    assignee: {
        name: string;
        avatar?: string;
    };
    subtasks?: { id: string; text: string; completed: boolean }[];
    activity?: { id: string; user: string; action: string; time: string; text?: string }[];
}

interface TaskDetailCardProps {
    task: Task;
    onUpdate?: (updatedTask: Task) => void;
    onClose?: () => void;
}

export function TaskDetailCard({ task: initialTask, onUpdate, onClose }: TaskDetailCardProps) {
    const [task, setTask] = useState<Task>(initialTask);
    const [newSubtask, setNewSubtask] = useState('');
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        setTask(initialTask);
    }, [initialTask]);

    const handleStatusChange = (newStatus: Task['status']) => {
        const updated = { ...task, status: newStatus };
        setTask(updated);
        onUpdate?.(updated);
    };

    const handlePriorityChange = (newPriority: Task['priority']) => {
        const updated = { ...task, priority: newPriority };
        setTask(updated);
        onUpdate?.(updated);
    };

    const toggleSubtask = (subtaskId: string) => {
        const updatedSubtasks = task.subtasks?.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const updated = { ...task, subtasks: updatedSubtasks };
        setTask(updated);
        onUpdate?.(updated);
    };

    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        const subtask = {
            id: Math.random().toString(36).substr(2, 9),
            text: newSubtask,
            completed: false
        };
        const updated = { ...task, subtasks: [...(task.subtasks || []), subtask] };
        setTask(updated);
        setNewSubtask('');
        onUpdate?.(updated);
    };

    const addComment = () => {
        if (!newComment.trim()) return;
        const comment = {
            id: Math.random().toString(36).substr(2, 9),
            user: 'You',
            action: 'commented',
            time: 'Just now',
            text: newComment
        };
        const updated = { ...task, activity: [comment, ...(task.activity || [])] };
        setTask(updated);
        setNewComment('');
        onUpdate?.(updated);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-700 hover:bg-red-100/80';
            case 'Medium': return 'bg-amber-100 text-amber-700 hover:bg-amber-100/80';
            case 'Low': return 'bg-slate-100 text-slate-700 hover:bg-slate-100/80';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Done': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80';
            case 'In Progress': return 'bg-blue-100 text-blue-700 hover:bg-blue-100/80';
            case 'To Do': return 'bg-slate-100 text-slate-700 hover:bg-slate-100/80';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    // Helper for Avatar rendering
    const renderAvatar = (name: string, src?: string, size = 'h-8 w-8') => {
        if (src) {
            return (
                <div className={`relative rounded-full overflow-hidden ${size} flex-shrink-0`}>
                    <Image src={src} alt={name} fill className="object-cover" />
                </div>
            );
        }
        return (
            <div className={`rounded-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-medium ${size} flex-shrink-0`}>
                {name.charAt(0)}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white border-l">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <Button variant="tertiary" onClick={onClose} className="px-2" icon={X}>
                    Close
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="primary" className="h-8" icon={CheckSquare}>
                        Mark Complete
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="tertiary" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Task
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-8">
                    {/* Title & Description */}
                    <div className="space-y-4">
                        <Input
                            value={task.title}
                            onChange={(e) => {
                                const updated = { ...task, title: e.target.value };
                                setTask(updated);
                            }}
                            onBlur={() => onUpdate?.(task)}
                            className="text-xl font-bold border-none px-0 shadow-none focus-visible:ring-0 h-auto resize-none p-0"
                            placeholder="Task Title"
                        />
                        <Textarea
                            value={task.description}
                            onChange={(e) => {
                                const updated = { ...task, description: e.target.value };
                                setTask(updated);
                            }}
                            onBlur={() => onUpdate?.(task)}
                            className="min-h-[100px] border-none px-0 shadow-none focus-visible:ring-0 resize-none text-slate-600"
                            placeholder="Add a description..."
                        />
                    </div>

                    <Separator />

                    {/* Properties Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${getStatusColor(task.status)}`}>
                                        {task.status}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleStatusChange('To Do')}>To Do</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange('In Progress')}>In Progress</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange('Done')}>Done</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handlePriorityChange('Low')}>Low</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePriorityChange('Medium')}>Medium</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePriorityChange('High')}>High</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assignee</label>
                            <div className="flex items-center gap-2">
                                {renderAvatar(task.assignee.name, task.assignee.avatar, 'h-6 w-6 text-xs')}
                                <span className="text-sm text-slate-900">{task.assignee.name}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</label>
                            <div className="flex items-center gap-2 text-sm text-slate-900">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {task.dueDate}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Subtasks */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">Subtasks</h3>
                            <span className="text-xs text-slate-500">
                                {task.subtasks?.filter(t => t.completed).length || 0}/{task.subtasks?.length || 0}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {task.subtasks?.map((subtask) => (
                                <div key={subtask.id} className="flex items-start gap-2 group">
                                    <Checkbox
                                        checked={subtask.completed}
                                        onCheckedChange={() => toggleSubtask(subtask.id)}
                                        className="mt-1"
                                    />
                                    <span className={cn("text-sm flex-1", subtask.completed ? "text-slate-400 line-through" : "text-slate-700")}>
                                        {subtask.text}
                                    </span>
                                    <Button
                                        variant="tertiary"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 -mt-1 p-0"
                                        onClick={() => {
                                            const updated = {
                                                ...task,
                                                subtasks: task.subtasks?.filter(st => st.id !== subtask.id)
                                            };
                                            setTask(updated);
                                            onUpdate?.(updated);
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3 text-slate-400" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                                placeholder="Add a subtask..."
                                className="h-8 text-sm"
                            />
                            <Button variant="tertiary" onClick={addSubtask} className="p-2 h-8 w-8">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Activity & Notes */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Activity</h3>

                        <div className="flex gap-3">
                            {renderAvatar('You')}
                            <div className="flex-1 space-y-2">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="min-h-[80px] resize-none"
                                />
                                <div className="flex justify-between items-center">
                                    <Button variant="tertiary" icon={Paperclip}>
                                        Attach
                                    </Button>
                                    <Button variant="primary" onClick={addComment} disabled={!newComment.trim()}>
                                        Comment
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-4">
                            {task.activity?.map((item) => (
                                <div key={item.id} className="flex gap-3">
                                    {renderAvatar(item.user, undefined, 'h-8 w-8 mt-1')}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-900">{item.user}</span>
                                            <span className="text-xs text-slate-500">{item.action}</span>
                                            <span className="text-xs text-slate-400">• {item.time}</span>
                                        </div>
                                        {item.text && (
                                            <p className="text-sm text-slate-600">{item.text}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskDetailCard;
