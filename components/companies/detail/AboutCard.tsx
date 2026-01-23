'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, User, Building2, Globe } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ColumnConfig, DetailLayout, DetailSectionStyle, ActionButtonConfig, ButtonStyle } from '@/components/ui/data-table/types';
import { cn } from '@/lib/utils';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

interface AboutCardProps {
    company?: CompanyData;
    detailLayout?: DetailLayout;
    detailStyles?: {
        top?: DetailSectionStyle;
        left?: DetailSectionStyle;
        right?: DetailSectionStyle;
    };
    buttonStyles?: {
        primary?: ButtonStyle;
        secondary?: ButtonStyle;
        tertiary?: ButtonStyle;
    };
    columns?: Record<string, ColumnConfig>;
    actions?: ActionButtonConfig[];
    onAction?: (actionId: string, company: CompanyData) => void;
}

// Helper to render a field value based on its type/config
const renderFieldValue = (company: CompanyData, fieldId: string, column?: ColumnConfig) => {
    const value = company[fieldId];
    if (value === undefined || value === null || value === '') return <span className="text-slate-400 italic text-xs">Empty</span>;

    // Special cases for standard fields if no column config or if default behavior desired
    if (fieldId === 'website' && !Array.isArray(value)) {
        return <a href={`https://${value}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{value}</a>;
    }
    if (fieldId === 'email' && !Array.isArray(value)) {
        return <a href={`mailto:${value}`} className="text-blue-600 hover:underline break-all">{value}</a>;
    }

    if (column) {
        if (column.type === 'badge' || (column.type === 'select' && column.displayStyle === 'badge')) {
            const badgeStyle = {
                backgroundColor: column.badgeStyle?.backgroundColor || '#f1f5f9',
                color: column.badgeStyle?.textColor || '#334155',
                fontSize: column.badgeStyle?.textSize === 'xs' ? '0.75rem' : column.badgeStyle?.textSize === 'sm' ? '0.875rem' : '1rem',
                fontWeight: column.badgeStyle?.fontWeight || 'normal',
                fontFamily: column.badgeStyle?.fontFamily
            };
            if (Array.isArray(value)) {
                return (
                    <div className="flex gap-1 flex-wrap">
                        {value.map((v, i) => <Badge key={i} variant="secondary" className="font-normal rounded-full px-3" style={badgeStyle}>{v}</Badge>)}
                    </div>
                );
            }
            return <Badge variant="secondary" className="font-normal rounded-full px-3" style={badgeStyle}>{value}</Badge>;
        }
        if (column.type === 'currency') {
            const numericVal = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : Number(value);
            return <span className="font-mono text-slate-900 dark:text-slate-200">
                {isNaN(numericVal) ? value : numericVal.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
            </span>;
        }
        if (column.type === 'url') {
            const href = typeof value === 'string' && value.startsWith('http') ? value : `https://${value}`;
            return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1.5 break-all">
                <LucideIcons.ExternalLink className="w-3 h-3 shrink-0" />
                {value}
            </a>;
        }
    }

    // Default Array handling (e.g. services) if not caught above
    if (Array.isArray(value)) {
        return (
            <div className="flex gap-1 flex-wrap">
                {value.map((v, i) => {
                    // Handle object items (like the new emails/phones/addresses structure)
                    if (typeof v === 'object' && v !== null && 'value' in v) {
                        const displayVal = v.isPrimary ? `${v.value} (Primary)` : v.value;
                        return <Badge key={v.id || i} variant="secondary" className="font-normal bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">{displayVal}</Badge>;
                    }
                    // Handle primitive items
                    return <Badge key={i} variant="secondary" className="font-normal bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">{v}</Badge>
                })}
            </div>
        );
    }

    return <span className="text-slate-900 dark:text-slate-200">{value}</span>;
}




export function AboutCardDetails({ company, detailLayout, detailStyles, buttonStyles, columns, actions, onAction }: AboutCardProps) {
    if (!company) return null;

    // Default Layout if none provided - matching new default in useTableConfig
    const layout = detailLayout || {
        top: ['logo', 'name', 'industry', 'actions'],
        left: ['email', 'phone', 'website', 'services'],
        right: ['address', 'owner']
    };

    // Helper to get label
    const getLabel = (id: string) => columns?.[id]?.label || id.replace(/([A-Z])/g, ' $1').trim(); // Fallback to Title Case

    const renderSection = (fields: string[], section: 'top' | 'left' | 'right') => {
        if (!fields || fields.length === 0) return null;

        const style = detailStyles?.[section];
        const alignment = style?.alignment || 'left';

        return (
            <div className={cn(
                "space-y-4",
                alignment === 'center' && "items-center text-center",
                alignment === 'right' && "items-end text-right"
            )}>
                {fields.map(fieldId => {
                    // --- Standard Header Fields Rendering ---

                    if (fieldId === 'logo') {
                        return (
                            <div key={fieldId} className={cn("mb-4 flex",
                                alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'
                            )}>
                                {company.logo ? (
                                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                                        <Image src={company.logo} alt={company.name || 'Company Logo'} fill className="object-cover" sizes="64px" />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center text-white shadow-sm">
                                        <Building2 className="w-8 h-8" />
                                    </div>
                                )}
                            </div>
                        );
                    }

                    if (fieldId === 'name') {
                        return (
                            <h2 key={fieldId} className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                                {company.name}
                            </h2>
                        );
                    }



                    if (fieldId === 'actions') {
                        const visibleActions = actions?.filter(a => a.isVisibleInCard) || [];
                        if (visibleActions.length === 0) return null;

                        return (
                            <div key={fieldId} className={cn("flex flex-wrap items-center gap-3 w-full px-4 mb-4",
                                alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'
                            )}>
                                {visibleActions.map(action => {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const IconComp = action.icon && (LucideIcons as any)[action.icon] ? (LucideIcons as any)[action.icon] : null;

                                    // Map variant to style key
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const v = action.variant as any;
                                    let variantKey: 'primary' | 'secondary' | 'tertiary' | 'default' = 'secondary';
                                    if (v === 'primary') variantKey = 'primary';
                                    else if (v === 'secondary') variantKey = 'secondary';
                                    else if (v === 'tertiary') variantKey = 'tertiary';
                                    else if (v === 'default') variantKey = 'default';
                                    else variantKey = 'default'; // Fallback

                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const styleConfig = (buttonStyles as any)?.[variantKey];

                                    const btnStyle: React.CSSProperties = styleConfig ? {
                                        backgroundColor: styleConfig.backgroundColor,
                                        color: styleConfig.textColor,
                                        borderColor: styleConfig.borderColor,
                                        fontWeight: styleConfig.fontWeight,
                                        borderWidth: '1px',
                                        borderBottomWidth: styleConfig.activeBorderThickness,
                                        borderStyle: 'solid',
                                        // Set CSS variables for Button component internal styling overrides
                                        '--icon': styleConfig.iconColor || styleConfig.textColor,
                                        '--text': styleConfig.textColor
                                    } as React.CSSProperties : {};

                                    const displayMode = styleConfig?.displayMode || 'icon-text';
                                    const iconPosition = styleConfig?.iconPosition || 'left';
                                    const showIcon = displayMode !== 'text-only';
                                    const showText = displayMode !== 'icon-only';

                                    // Resolved Icon Component
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const ResolvedIcon = showIcon && action.icon && (LucideIcons as any)[action.icon] ? (LucideIcons as any)[action.icon] : null;

                                    const btnSize = (styleConfig?.size || 'md') as 'sm' | 'md' | 'lg';
                                    // console.log('[AboutCard] Action:', action.label, 'Variant:', action.variant, 'Size:', btnSize, 'StyleConfig:', styleConfig);
                                    const sizeClasses = {
                                        sm: "h-7 px-2 text-xs",
                                        md: "h-9 px-4 text-sm",
                                        lg: "h-11 px-6 text-base"
                                    };
                                    const iconOnlyWidths = {
                                        sm: "max-w-[28px]",
                                        md: "max-w-[36px]",
                                        lg: "max-w-[44px]"
                                    };

                                    return (
                                        <Button
                                            key={action.id}
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            variant={action.variant as any || 'outline'}
                                            className={cn(
                                                "flex-1 max-w-[160px] gap-2",
                                                sizeClasses[btnSize],
                                                displayMode === 'icon-only' && `px-0 justify-center ${iconOnlyWidths[btnSize]}`,
                                                iconPosition === 'right' ? "flex-row-reverse" : "flex-row",
                                                // Apply justification based on iconPosition, forcing center for icon-only
                                                (displayMode === 'icon-only' || iconPosition === 'center') ? "justify-center" : "justify-start"
                                            )}
                                            onClick={() => onAction?.(action.id, company)}
                                            style={btnStyle}
                                            title={action.label}
                                            icon={ResolvedIcon} // Pass as prop for proper layout control
                                        >
                                            {showText ? action.label : null}
                                        </Button>
                                    );
                                })}
                            </div>
                        );
                    }

                    // --- Regular Fields Rendering ---
                    return (
                        <div key={fieldId} className={cn(
                            "flex items-start gap-3", // reduced gap
                            alignment === 'right' ? "flex-row-reverse text-right" : "flex-row text-left",
                            alignment === 'center' && "flex-col items-center text-center"
                        )}>
                            {/* Icons for standard fields */}
                            <div className={cn("shrink-0 mt-0.5 text-slate-400 dark:text-slate-500", alignment === 'center' && "mb-1")}>
                                {(() => {
                                    const col = columns?.[fieldId];
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    if (col?.showIconInCard && col?.icon && (LucideIcons as any)[col.icon]) {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const IconComp = (LucideIcons as any)[col.icon];
                                        return <IconComp className="w-4 h-4" />;
                                    }

                                    // Default Icons
                                    if (fieldId === 'email') return <Mail className="w-4 h-4" />;
                                    if (fieldId === 'phone') return <Phone className="w-4 h-4" />;
                                    if (fieldId === 'address') return <MapPin className="w-4 h-4" />;
                                    if (fieldId === 'owner') return <User className="w-4 h-4" />;
                                    if (fieldId === 'website') return <Globe className="w-4 h-4" />;

                                    return (alignment !== 'center' && <div className="w-4 h-4" />); // Spacer
                                })()}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-slate-400 mb-0.5 capitalize">
                                    {getLabel(fieldId)}
                                </div>
                                <div className="text-sm font-medium">
                                    {renderFieldValue(company, fieldId, columns?.[fieldId])}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-6 md:p-8 pt-6"> {/* Added top padding back since header is gone */}
            {/* Top Section */}
            {layout.top && layout.top.length > 0 && (
                <div className={cn(
                    "mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg",
                    detailStyles?.top?.alignment === 'center' && "text-center",
                    detailStyles?.top?.alignment === 'right' && "text-right"
                )}>
                    {renderSection(layout.top, 'top')}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">
                        {detailStyles?.left?.title || "Contact & Info"}
                    </h3>
                    {renderSection(layout.left, 'left')}
                </div>

                {/* Right Column */}
                <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">
                        {detailStyles?.right?.title || "Details"}
                    </h3>
                    {renderSection(layout.right, 'right')}
                </div>
            </div>
        </div>
    );
}

export function AboutCard({ company, detailLayout, detailStyles, columns }: AboutCardProps) {
    if (!company) {
        return (
            <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-400 p-8">
                No company data available
            </Card>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto">
            {/* Removed AboutCardHeader */}
            <AboutCardDetails
                company={company}
                detailLayout={detailLayout}
                detailStyles={detailStyles}
                columns={columns}
            />
        </div>
    );
}
