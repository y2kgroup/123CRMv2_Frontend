import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface CompanyDetailCardProps {
    company: any;
    onClose: () => void;
}

export function CompanyDetailCard({ company, onClose }: CompanyDetailCardProps) {
    if (!company) return null;

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#1e2329]">
            {/* Header / Actions */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
                <Button variant="tertiary" className="h-8 w-8 p-0 bg-transparent hover:bg-slate-100" onClick={onClose}>
                    <X className="h-4 w-4 text-slate-500" />
                </Button>
                <div className="flex gap-2">
                    <Button variant="tertiary" className="h-8 w-8 p-0 bg-transparent hover:bg-slate-100">
                        <div className="h-4 w-4 text-slate-500">…</div>
                    </Button>
                </div>
            </div>

            {/* Centered Identity */}
            <div className="flex flex-col items-center pt-8 pb-6 px-6 text-center">
                <div className={`h-20 w-20 rounded-2xl flex items-center justify-center text-3xl font-bold mb-4 ${['bg-red-100 text-red-600', 'bg-green-100 text-green-600', 'bg-blue-100 text-blue-600', 'bg-orange-100 text-orange-600', 'bg-purple-100 text-purple-600'][company.id.length % 5]
                    }`}>
                    {company.name.substring(0, 2).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {company.name}
                </h2>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    {company.industry}
                </div>

                <div className="flex items-center gap-3 w-full justify-center">
                    <Button className="flex-1 bg-[#405189] hover:bg-[#364574] text-white">
                        <span className="mr-2">✉</span> Send Email
                    </Button>
                    <Button variant="secondary" className="flex-1 border border-slate-200 hover:bg-slate-50">
                        <span className="mr-2">📞</span> Call
                    </Button>
                    <Button variant="tertiary" className="h-10 w-10 p-0 border border-slate-200">
                        <div className="h-4 w-4 rotate-90">…</div>
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
                {/* Information */}
                <div className="mb-6">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Information</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        A leading company in the {company.industry} sector. Located in New York.
                    </p>
                </div>

                {/* Services */}
                <div className="mb-6">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Services</h3>
                    <div className="flex flex-wrap gap-2">
                        {company.services?.map((s: string, i: number) => (
                            <Badge key={i} className="bg-[#405189] text-white font-normal hover:bg-[#364574]">
                                {s}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Details List */}
                <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Details</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-5 text-slate-400 mt-0.5">✉</div>
                            <div>
                                <div className="text-xs text-slate-400 mb-0.5">Email</div>
                                <a href={`mailto:${company.email}`} className="text-sm text-blue-600 hover:underline block">{company.email}</a>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 text-slate-400 mt-0.5">📞</div>
                            <div>
                                <div className="text-xs text-slate-400 mb-0.5">Phone</div>
                                <div className="text-sm text-blue-600 block">{company.phone}</div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 text-slate-400 mt-0.5">📍</div>
                            <div>
                                <div className="text-xs text-slate-400 mb-0.5">Address</div>
                                <div className="text-sm text-slate-700 dark:text-slate-300 block">{company.address}</div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 text-slate-400 mt-0.5">👤</div>
                            <div>
                                <div className="text-xs text-slate-400 mb-0.5">Owner</div>
                                <div className="text-sm text-slate-900 dark:text-slate-100 font-medium block">{company.owner}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
