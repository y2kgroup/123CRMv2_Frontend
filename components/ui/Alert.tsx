import * as React from "react"
import { cn } from "@/lib/utils"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "primary" | "secondary" | "success" | "danger"
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = "primary", style, ...props }, ref) => {
        const vars = {
            '--bg': `var(--alert-${variant}-bg)`,
            '--text': `var(--alert-${variant}-text)`,
            '--border': `var(--alert-${variant}-border)`,
            '--font-weight': `var(--alert-${variant}-font-weight, 500)`,
        } as React.CSSProperties

        return (
            <div
                ref={ref}
                role="alert"
                className={cn(
                    "relative w-full rounded-lg px-4 py-3 text-sm flex items-center gap-3",
                    // Base styles using vars
                    "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]",
                    className
                )}
                style={{ ...vars, fontWeight: 'var(--font-weight)', ...style }}
                {...props}
            />
        )
    }
)
Alert.displayName = "Alert"

export { Alert }
