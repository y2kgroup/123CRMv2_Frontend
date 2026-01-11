import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Upload, Circle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea'; // Assuming we have or will use native textarea styled like input

interface ContactField {
    id: string;
    value: string;
    type: string;
    isPrimary: boolean;
}

interface AddCompanyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
    initialData?: any;
}

export function AddCompanyDialog({ open, onOpenChange, onSubmit, initialData }: AddCompanyDialogProps) {
    // Form State
    const [companyId, setCompanyId] = useState('COM29195636'); // Mock ID
    const [companyName, setCompanyName] = useState('');
    const [owner, setOwner] = useState('');
    const [industry, setIndustry] = useState('');
    const [website, setWebsite] = useState('');
    const [services, setServices] = useState('');
    const [logo, setLogo] = useState<File | null>(null);

    // Dynamic Lists
    const [emails, setEmails] = useState<ContactField[]>([
        { id: '1', value: '', type: 'Work', isPrimary: true }
    ]);
    const [phones, setPhones] = useState<ContactField[]>([
        { id: '1', value: '', type: 'Work', isPrimary: true }
    ]);
    const [addresses, setAddresses] = useState<ContactField[]>([
        { id: '1', value: '', type: 'Work', isPrimary: true }
    ]);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setCompanyId(initialData.id || 'COM' + Math.floor(Math.random() * 10000000));
                setCompanyName(initialData.name || '');
                setOwner(initialData.owner || '');
                setIndustry(initialData.industry || '');
                setWebsite(initialData.website || '');
                setServices(Array.isArray(initialData.services) ? initialData.services.join('\n') : (initialData.services || ''));
                // For complex lists (emails, phones, addresses), if they exist in initialData use them, else default.
                // Assuming initialData might have them or we map them.
                // For now, if initialData doesn't have them in the correct format, we might need to map simply or keep defaults.
                // Let's assume for this "v1" they might be simple strings in the table row but we want to edit them as lists?
                // The table row has `email`, `phone`, `address` as visible strings.
                // We should probably populate the first item of the list with that string implementation.
                setEmails(initialData.emails || [{ id: '1', value: initialData.email || '', type: 'Work', isPrimary: true }]);
                setPhones(initialData.phones || [{ id: '1', value: initialData.phone || '', type: 'Work', isPrimary: true }]);
                setAddresses(initialData.addresses || [{ id: '1', value: initialData.address || '', type: 'Work', isPrimary: true }]);

                setLogo(null); // Reset logo or handle existing URL if we had one
            } else {
                // Reset to defaults for "Add New"
                setCompanyId('COM' + Math.floor(Math.random() * 10000000));
                setCompanyName('');
                setOwner('');
                setIndustry('');
                setWebsite('');
                setServices('');
                setLogo(null);
                setEmails([{ id: '1', value: '', type: 'Work', isPrimary: true }]);
                setPhones([{ id: '1', value: '', type: 'Work', isPrimary: true }]);
                setAddresses([{ id: '1', value: '', type: 'Work', isPrimary: true }]);
            }
        }
    }, [open, initialData]);

    // Handlers
    const handleAddField = (
        setList: React.Dispatch<React.SetStateAction<ContactField[]>>,
        list: ContactField[]
    ) => {
        setList([...list, { id: Math.random().toString(), value: '', type: 'Work', isPrimary: list.length === 0 }]);
    };

    const handleRemoveField = (
        setList: React.Dispatch<React.SetStateAction<ContactField[]>>,
        list: ContactField[],
        id: string
    ) => {
        if (list.length > 1) {
            setList(list.filter(item => item.id !== id));
        }
    };

    const handleUpdateField = (
        setList: React.Dispatch<React.SetStateAction<ContactField[]>>,
        list: ContactField[],
        id: string,
        key: keyof ContactField,
        value: any
    ) => {
        setList(list.map(item => item.id === id ? { ...item, [key]: value } : item));
    };

    const handleSetPrimary = (
        setList: React.Dispatch<React.SetStateAction<ContactField[]>>,
        list: ContactField[],
        id: string
    ) => {
        setList(list.map(item => ({ ...item, isPrimary: item.id === id })));
    };

    const handleSubmit = () => {
        onSubmit({
            id: companyId,
            name: companyName,
            owner,
            industry,
            website,
            services: services.split('\n'),
            emails,
            phones,
            addresses,
            logo
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Company' : 'Add New Company'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Logo Upload */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Logo</div>
                            <Button variant="secondary" className="h-8 text-xs bg-white border border-gray-200 shadow-sm" onClick={() => document.getElementById('logo-upload')?.click()}>
                                Upload Logo
                            </Button>
                            <input
                                id="logo-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => setLogo(e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Company ID</Label>
                            <Input value={companyId} readOnly className="bg-gray-50 text-gray-500" />
                        </div>
                        <div className="space-y-2">
                            <Label>Company Name</Label>
                            <Input
                                placeholder="Company Name"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Owner</Label>
                            <Input
                                placeholder="Company Owner"
                                value={owner}
                                onChange={(e) => setOwner(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Email Addresses */}
                    <div className="space-y-3">
                        <Label>Email Address</Label>
                        {emails.map((item) => (
                            <div key={item.id} className="flex gap-2 items-start">
                                <Input
                                    placeholder="Enter company email"
                                    className="flex-1"
                                    value={item.value}
                                    onChange={(e) => handleUpdateField(setEmails, emails, item.id, 'value', e.target.value)}
                                />
                                <Select
                                    value={item.type}
                                    onValueChange={(val) => handleUpdateField(setEmails, emails, item.id, 'type', val)}
                                >
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Work">Work</SelectItem>
                                        <SelectItem value="Home">Home</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div
                                    className="flex items-center gap-1 cursor-pointer pt-2.5 px-1"
                                    onClick={() => handleSetPrimary(setEmails, emails, item.id)}
                                >
                                    {item.isPrimary ? (
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 fill-current" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-gray-300" />
                                    )}
                                    <span className={cn("text-xs font-medium", item.isPrimary ? "text-blue-600" : "text-gray-400")}>
                                        Primary
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleRemoveField(setEmails, emails, item.id)}
                                    className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => handleAddField(setEmails, emails)}
                            className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700 px-1"
                        >
                            <Plus className="w-4 h-4" /> Add another email
                        </button>
                    </div>

                    {/* Phone Numbers */}
                    <div className="space-y-3">
                        <Label>Phone Number</Label>
                        {phones.map((item) => (
                            <div key={item.id} className="flex gap-2 items-start">
                                <Input
                                    placeholder="Enter company phone (xxx-xxx-xxxx)"
                                    className="flex-1"
                                    value={item.value}
                                    onChange={(e) => handleUpdateField(setPhones, phones, item.id, 'value', e.target.value)}
                                />
                                <Select
                                    value={item.type}
                                    onValueChange={(val) => handleUpdateField(setPhones, phones, item.id, 'type', val)}
                                >
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Work">Work</SelectItem>
                                        <SelectItem value="Home">Home</SelectItem>
                                        <SelectItem value="Mobile">Mobile</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div
                                    className="flex items-center gap-1 cursor-pointer pt-2.5 px-1"
                                    onClick={() => handleSetPrimary(setPhones, phones, item.id)}
                                >
                                    {item.isPrimary ? (
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 fill-current" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-gray-300" />
                                    )}
                                    <span className={cn("text-xs font-medium", item.isPrimary ? "text-blue-600" : "text-gray-400")}>
                                        Primary
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleRemoveField(setPhones, phones, item.id)}
                                    className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => handleAddField(setPhones, phones)}
                            className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700 px-1"
                        >
                            <Plus className="w-4 h-4" /> Add another phone
                        </button>
                    </div>

                    {/* Addresses */}
                    <div className="space-y-3">
                        <Label>Address</Label>
                        {addresses.map((item) => (
                            <div key={item.id} className="flex gap-2 items-start">
                                <Input
                                    placeholder="Enter company address"
                                    className="flex-1"
                                    value={item.value}
                                    onChange={(e) => handleUpdateField(setAddresses, addresses, item.id, 'value', e.target.value)}
                                />
                                <Select
                                    value={item.type}
                                    onValueChange={(val) => handleUpdateField(setAddresses, addresses, item.id, 'type', val)}
                                >
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Work">Work</SelectItem>
                                        <SelectItem value="Home">Home</SelectItem>
                                        <SelectItem value="Billing">Billing</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div
                                    className="flex items-center gap-1 cursor-pointer pt-2.5 px-1"
                                    onClick={() => handleSetPrimary(setAddresses, addresses, item.id)}
                                >
                                    {item.isPrimary ? (
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 fill-current" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-gray-300" />
                                    )}
                                    <span className={cn("text-xs font-medium", item.isPrimary ? "text-blue-600" : "text-gray-400")}>
                                        Primary
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleRemoveField(setAddresses, addresses, item.id)}
                                    className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => handleAddField(setAddresses, addresses)}
                            className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700 px-1"
                        >
                            <Plus className="w-4 h-4" /> Add another address
                        </button>
                    </div>

                    {/* Industry */}
                    <div className="space-y-2">
                        <Label>Industry Type</Label>
                        <Select value={industry} onValueChange={setIndustry}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Industry" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Technology">Technology</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                <SelectItem value="Retail">Retail</SelectItem>
                                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                        <Label>Website</Label>
                        <Input
                            placeholder="Company website URL"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                        />
                    </div>

                    {/* Services */}
                    <div className="space-y-2">
                        <Label>Services</Label>
                        <Textarea
                            placeholder="List services offered"
                            value={services}
                            onChange={(e) => setServices(e.target.value)}
                            className="resize-y"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <div className="flex w-full justify-end gap-2">
                        <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSubmit}>{initialData ? 'Save Changes' : 'Save Company'}</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

