'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, User, Building2, Globe } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ActionButtonConfig, ColumnConfig, DetailLayout, DetailSectionStyle, ButtonStyle } from '@/components/ui/data-table/types';
import { evaluateFormula } from '@/lib/formula';
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
    hiddenLabels?: string[];
    actions?: ActionButtonConfig[];
    onAction?: (actionId: string, company: CompanyData) => void;
}

// Helper to render a field value based on its type/config
const renderFieldValue = (company: CompanyData, fieldId: string, column?: ColumnConfig, options: { hasCustomColor?: boolean, customStyle?: React.CSSProperties } = {}) => {
    const value = company[fieldId];
    if (value === undefined || value === null || value === '') return <span className="text-slate-400 italic text-xs">Empty</span>;

    // Special cases for standard fields if no column config or if default behavior desired
    if (fieldId === 'website' && !Array.isArray(value)) {
        const displayVal = (typeof value === 'object' && value !== null && 'value' in value) ? value.value : value;
        return <a href={`https://${displayVal}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{String(displayVal)}</a>;
    }
    if (fieldId === 'email' && !Array.isArray(value)) {
        const displayVal = (typeof value === 'object' && value !== null && 'value' in value) ? value.value : value;
        return <a href={`mailto:${displayVal}`} className="text-blue-600 hover:underline break-all">{String(displayVal)}</a>;
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
            const colorClass = options.hasCustomColor ? "" : "text-slate-900 dark:text-slate-200";
            return <span className={cn("font-mono", colorClass)} style={options.customStyle}>
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
        if (column.type === 'formula' && column.formula) {
            const formulaVal = evaluateFormula(column.formula, company);
            const colorClass = options.hasCustomColor ? "" : "text-slate-900 dark:text-slate-200";
            return <span className={colorClass} style={options.customStyle}>{String(formulaVal ?? '')}</span>;
        }
    }

    // Default Array handling (e.g. services) if not caught above
    if (Array.isArray(value)) {
        const isBadgeStyle = (column?.type === 'badge' || (column?.type === 'select' && column?.displayStyle === 'badge'))
            && !['email', 'phone', 'address', 'emails', 'phones', 'addresses'].includes(fieldId);

        if (isBadgeStyle) {
            return (
                <div className="flex gap-1 flex-wrap">
                    {value.map((v, i) => {
                        const displayVal = (typeof v === 'object' && v !== null && 'value' in v) ? v.value : v;
                        if (typeof displayVal === 'object') return null; // Skip complex without value
                        return <Badge key={i} variant="secondary" className="font-normal rounded-full px-3">{String(displayVal)}</Badge>;
                    })}
                </div>
            );
        }

        const textColorClass = options.hasCustomColor ? "" : "text-slate-700 dark:text-slate-300";

        // Default Text List (Email, Phone, Address, etc.)
        return (
            <div className="flex flex-col gap-1">
                {value.map((v, i) => {
                    if (typeof v === 'object' && v !== null && 'value' in v) {
                        const label = v.label || (v.isPrimary ? 'Primary' : null);
                        const key = v.id || i;
                        return (
                            <div key={key} className={cn("text-sm flex items-center gap-1.5 flex-wrap", textColorClass)} style={options.customStyle}>
                                <span>{String(v.value)}</span>
                                {label && <span className="text-slate-400 text-xs">({label})</span>}
                            </div>
                        );
                    }
                    return (
                        <div key={i} className={cn("text-sm", textColorClass)} style={options.customStyle}>
                            {String(v)}
                        </div>
                    );
                })}
            </div>
        );
    }

    const defaultColorClass = options.hasCustomColor ? "" : "text-slate-900 dark:text-slate-200";
    return <span className={defaultColorClass} style={options.customStyle}>{String(value)}</span>;
};

export function AboutCardDetails({ company, detailLayout, detailStyles, buttonStyles, columns, actions, onAction, hiddenLabels }: AboutCardProps) {
    if (!company) return null;

    // Default Layout if none provided - matching new default in useTableConfig
    const layout = detailLayout || {
        top: ['logo', 'name', 'industry', 'actions'],
        left: ['email', 'phone', 'website', 'services'],
        right: ['address', 'owner']
    };

    // Helper to get label
    const getLabel = (id: string) => columns?.[id]?.label || id.replace(/([A-Z])/g, ' $1').trim(); // Fallback to Title Case

    const getSectionStyle = (section: 'top' | 'left' | 'right') => {
        const style = detailStyles?.[section];
        if (!style) return {};

        const css: React.CSSProperties = {
            backgroundColor: style.backgroundColor,
            color: style.textColor,
            fontFamily: style.fontFamily,
        };

        // Map text size
        if (style.textSize) {
            css.fontSize = { xs: '0.75rem', sm: '0.875rem', base: '1rem' }[style.textSize];
        }
        // Map font weight
        if (style.fontWeight) {
            css.fontWeight = { normal: 400, medium: 500, semibold: 600, bold: 700 }[style.fontWeight];
        }

        return css;
    };

    const renderSection = (fields: string[], section: 'top' | 'left' | 'right') => {
        if (!fields || fields.length === 0) return null;

        const style = detailStyles?.[section];
        const alignment = style?.alignment || 'left';
        const spacing = style?.spacing || 'normal';

        // Check for custom styles to optionally disable defaults
        const hasCustomColor = !!style?.textColor;
        const hasCustomSize = !!style?.textSize;
        const hasCustomWeight = !!style?.fontWeight;

        const computedStyle = getSectionStyle(section);
        // Extract text-related explicit styles to pass down
        const textStyleOverride: React.CSSProperties = {
            color: hasCustomColor ? computedStyle.color : undefined,
            fontSize: hasCustomSize ? computedStyle.fontSize : undefined,
            fontWeight: hasCustomWeight ? computedStyle.fontWeight : undefined,
            fontFamily: computedStyle.fontFamily
        };

        const spacingClass = {
            compact: "space-y-2",
            normal: "space-y-4",
            relaxed: "space-y-6"
        }[spacing];

        return (
            <div className={cn(
                spacingClass,
                alignment === 'center' && "items-center text-center",
                alignment === 'right' && "items-end text-right"
            )}>
                {fields.map(fieldId => {
                    // --- Standard Header Fields Rendering ---

                    if (fieldId === 'logo') {
                        const imageSize = style?.imageSize || 'md';
                        const sizeClasses = {
                            sm: "w-12 h-12",
                            md: "w-16 h-16",
                            lg: "w-24 h-24",
                            xl: "w-32 h-32"
                        }[imageSize];

                        return (
                            <div key={fieldId} className={cn("mb-4 flex",
                                alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'
                            )}>
                                {company.logo ? (
                                    <div className={cn("relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700", sizeClasses)}>
                                        <Image src={company.logo} alt={company.name || 'Company Logo'} fill className="object-cover" sizes="128px" />
                                    </div>
                                ) : (
                                    <div className={cn("rounded-2xl bg-slate-700 flex items-center justify-center text-white shadow-sm", sizeClasses)}>
                                        <Building2 className="w-1/2 h-1/2" />
                                    </div>
                                )}
                            </div>
                        );
                    }

                    if (fieldId === 'name') {
                        const col = columns?.['name'];
                        let displayValue = company.name;

                        if (col?.type === 'formula' && col.formula) {
                            displayValue = String(evaluateFormula(col.formula, company) ?? '');
                        }

                        return (
                            <h2 key={fieldId}
                                className={cn(
                                    "mb-1",
                                    !hasCustomSize && "text-xl",
                                    !hasCustomWeight && "font-bold",
                                    !hasCustomColor && "text-slate-900 dark:text-slate-100"
                                )}
                                style={textStyleOverride}
                            >
                                {displayValue}
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
                                            variant={(action.variant === 'default' ? 'secondary' : action.variant) as any || 'outline'}
                                            className={cn(
                                                "flex-1 max-w-[160px]",
                                                displayMode === 'icon-only' ? "gap-0" : "gap-2",
                                                sizeClasses[btnSize],
                                                displayMode === 'icon-only' && `px-0 justify-center ${iconOnlyWidths[btnSize]}`,
                                                iconPosition === 'right' ? "flex-row-reverse" : "flex-row",
                                                // Apply justification based on iconPosition, forcing center for icon-only
                                                (displayMode === 'icon-only' || iconPosition === 'center') ? "justify-center" : "justify-start"
                                            )}
                                            onClick={() => onAction?.(action.id, company)}
                                            style={{
                                                ...btnStyle,
                                                padding: displayMode === 'icon-only' ? '0' : undefined
                                            }}
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
                                {!(hiddenLabels?.includes(fieldId)) && (
                                    <div className="text-xs font-medium text-slate-400 mb-0.5 capitalize">
                                        {getLabel(fieldId)}
                                    </div>
                                )}
                                <div className={cn(
                                    !hasCustomWeight && "font-medium",
                                    !hasCustomSize && "text-sm",
                                    // Note: Color is handled inside renderFieldValue
                                )}
                                    style={textStyleOverride}
                                >
                                    {renderFieldValue(company, fieldId, columns?.[fieldId], { hasCustomColor, customStyle: textStyleOverride })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-6 md:p-8 pt-6">
            {/* Top Section */}
            {layout.top && layout.top.length > 0 && (
                <div
                    className={cn(
                        "mb-8 p-4 rounded-lg",
                        // Only apply default bg if no custom bg is set
                        !detailStyles?.top?.backgroundColor && "bg-slate-50 dark:bg-slate-800/50",
                        detailStyles?.top?.alignment === 'center' && "text-center",
                        detailStyles?.top?.alignment === 'right' && "text-right"
                    )}
                    style={getSectionStyle('top')}
                >
                    {renderSection(layout.top, 'top')}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div
                    className={cn(
                        "rounded-lg",
                        detailStyles?.left?.backgroundColor && "p-4", // Add padding if custom bg
                        detailStyles?.left?.alignment === 'center' && "text-center",
                        detailStyles?.left?.alignment === 'right' && "text-right"
                    )}
                    style={getSectionStyle('left')}
                >
                    <h3 className="text-xs font-semibold opacity-70 uppercase tracking-wider mb-4 border-b pb-2"
                        style={{
                            ...getSectionStyle('left'), // Apply text style to header too
                            borderColor: detailStyles?.left?.textColor ? 'currentColor' : undefined,
                            backgroundColor: 'transparent' // Reset bg just in case inherited from getSectionStyle
                        }}>
                        {detailStyles?.left?.title || "Contact & Info"}
                    </h3>
                    {renderSection(layout.left, 'left')}
                </div>

                {/* Right Column */}
                <div
                    className={cn(
                        "rounded-lg",
                        detailStyles?.right?.backgroundColor && "p-4", // Add padding if custom bg
                        detailStyles?.right?.alignment === 'center' && "text-center",
                        detailStyles?.right?.alignment === 'right' && "text-right"
                    )}
                    style={getSectionStyle('right')}
                >
                    <h3 className="text-xs font-semibold opacity-70 uppercase tracking-wider mb-4 border-b pb-2"
                        style={{
                            ...getSectionStyle('right'),
                            borderColor: detailStyles?.right?.textColor ? 'currentColor' : undefined,
                            backgroundColor: 'transparent'
                        }}>
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
                hiddenLabels={(company as any)?.hiddenLabels} // Fallback or pass prop if AboutCard receives it. Wait, AboutCard receives props.
            />
        </div>
    );
}
