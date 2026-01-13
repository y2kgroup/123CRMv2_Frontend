'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, User, Building2, MoreHorizontal } from 'lucide-react';

export interface CompanyData {
    id: string;
    name: string;
    owner: string;
    industry: string;
    website: string;
    services: string[];
    email: string;
    phone: string;
    address: string;
}

interface AboutCardProps {
    company?: CompanyData;
}

export function AboutCardHeader({ company }: AboutCardProps) {
    if (!company) return null;

    return (
        <div className="flex flex-col items-center text-center p-6 md:p-8 bg-white dark:bg-slate-900">
            <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center text-white mb-4 shadow-sm">
                <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {company.name}
            </h2>
            <p className="text-sm text-slate-500 font-medium mb-6">
                {company.industry}
            </p>

            <div className="flex items-center gap-3 w-full justify-center px-4">
                <Button variant="actionCard" icon={Mail} className="h-9 px-4 flex-1">
                    Send Email
                </Button>
                <Button variant="actionCard" icon={Phone} className="h-9 px-4 flex-1">
                    Call
                </Button>
            </div>
        </div>
    );
}

export function AboutCardDetails({ company }: AboutCardProps) {
    if (!company) return null;

    return (
        <div className="p-6 md:p-8 pt-0">
            {/* Services Section */}
            <div className="mb-8">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    SERVICES
                </h3>
                <div className="flex flex-wrap gap-2">
                    {company.services.map((service, i) => (
                        <Badge
                            key={i}
                            variant="secondary"
                            className="font-medium bg-slate-700 text-white hover:bg-slate-800 border-none px-3 py-1"
                        >
                            {service}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Details Section */}
            <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    DETAILS
                </h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                            <div className="text-xs font-medium text-slate-400 mb-0.5">Email</div>
                            <a href={`mailto:${company.email}`} className="text-sm font-medium text-blue-600 hover:underline block break-all">
                                {company.email}
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                            <div className="text-xs font-medium text-slate-400 mb-0.5">Phone</div>
                            <div className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                                {company.phone}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                            <div className="text-xs font-medium text-slate-400 mb-0.5">Address</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-200">
                                {company.address}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                            <div className="text-xs font-medium text-slate-400 mb-0.5">Owner</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-200">
                                {company.owner}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AboutCard({ company }: AboutCardProps) {
    // Wrapper for backward compatibility if used elsewhere, though not intended for use in split view anymore
    if (!company) {
        return (
            <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-400 p-8">
                No company data available
            </Card>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            <AboutCardHeader company={company} />
            <AboutCardDetails company={company} />
        </div>
    );
}
