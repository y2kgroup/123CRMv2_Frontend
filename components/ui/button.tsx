'use client';

import { cn } from "@/lib/utils";
import React from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'action';
    icon?: LucideIcon;
    children?: React.ReactNode;
}

export function Button({ variant = 'primary', icon: Icon, children, className, ...props }: ButtonProps) {
    const vars = {
        '--bg': `var(--btn-${variant}-bg)`,
        '--text': `var(--btn-${variant}-text)`,
        '--icon': `var(--btn-${variant}-icon)`,
        '--border': `var(--btn-${variant}-border)`,
        '--border-width': `var(--btn-${variant}-border-width)`,
        '--font-weight': `var(--btn-${variant}-font-weight, 500)`,
        '--display-icon': `var(--btn-${variant}-display-icon, block)`,
        '--display-text': `var(--btn-${variant}-display-text, block)`,
    } as React.CSSProperties;

    return (
        <button
            className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-opacity hover:opacity-90",
                "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]",
                className
            )}
            style={{ ...vars, borderBottomWidth: 'var(--border-width)', fontWeight: 'var(--font-weight)' }}
            {...props}
        >
            {Icon && <Icon className="w-4 h-4 text-[var(--icon)]" style={{ display: 'var(--display-icon)' }} />}
            <span style={{ display: 'var(--display-text)' }}>{children}</span>
        </button>
    );
}
