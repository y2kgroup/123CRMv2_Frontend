'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from '@/components/ui/label';
import { Task } from './TaskDetailCard';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTask: (task: Task) => void;
}

const MOCK_USERS = [
    { name: 'John Doe', id: 'u1' },
    { name: 'Sarah Miller', id: 'u2' },
    { name: 'Mike Ross', id: 'u3' },
];

export function AddTaskModal({ isOpen, onClose, onAddTask }: AddTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Task['priority']>('Medium');
    const [status, setStatus] = useState<Task['status']>('To Do');
    const [assigneeName, setAssigneeName] = useState<string>('John Doe');
    const [dueDate, setDueDate] = useState<string>(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    const [reminder, setReminder] = useState<string>('None');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            description,
            priority,
            status,
            dueDate,
            reminder,
            assignee: { name: assigneeName },
            subtasks: [],
            activity: [{
                id: Math.random().toString(36).substr(2, 9),
                user: 'You',
                action: 'created the task',
                time: 'Just now'
            }]
        };

        onAddTask(newTask);

        // Reset form
        setTitle('');
        setDescription('');
        setPriority('Medium');
        setStatus('To Do');
        setReminder('None');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Review Q3 Financials"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="To Do">To Do</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="assignee">Assignee</Label>
                            <Select value={assigneeName} onValueChange={setAssigneeName}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select assignee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MOCK_USERS.map(user => (
                                        <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        icon={CalendarIcon}
                                        className={cn(
                                            "w-full justify-start text-left font-normal border border-slate-200 h-10 px-3 bg-white hover:bg-slate-50 text-slate-900",
                                            !dueDate && "text-muted-foreground"
                                        )}
                                    >
                                        {dueDate ? dueDate : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate ? new Date(dueDate) : undefined}
                                        onSelect={(date) => date && setDueDate(format(date, "MMM d, yyyy"))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Reminder Row */}
                    <div className="grid gap-2">
                        <Label htmlFor="reminder">Reminder</Label>
                        <Select value={reminder} onValueChange={setReminder}>
                            <SelectTrigger>
                                <SelectValue placeholder="Set a reminder" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                <SelectItem value="At time of event">At time of event</SelectItem>
                                <SelectItem value="15 minutes before">15 minutes before</SelectItem>
                                <SelectItem value="1 hour before">1 hour before</SelectItem>
                                <SelectItem value="1 day before">1 day before</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Create Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
