"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
    activeTab: string;
    setActiveTab: (value: string) => void;
} | null>(null);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue: string;
    onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    ({ className, defaultValue, onValueChange, children, ...props }, ref) => {
        const [activeTab, setActiveTab] = React.useState(defaultValue);

        const handleTabChange = React.useCallback((value: string) => {
            setActiveTab(value);
            onValueChange?.(value);
        }, [onValueChange]);

        return (
            <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
                <div ref={ref} className={cn("", className)} {...props}>
                    {children}
                </div>
            </TabsContext.Provider>
        )
    }
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "inline-flex h-10 items-center justify-start rounded-md p-1 text-slate-500",
                className
            )}
            {...props}
        />
    )
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className, value, onClick, ...props }, ref) => {
        const context = React.useContext(TabsContext);
        if (!context) throw new Error("TabsTrigger must be used within Tabs");

        const isActive = context.activeTab === value;

        return (
            <button
                ref={ref}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={(e) => {
                    context.setActiveTab(value);
                    onClick?.(e);
                }}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
                    isActive
                        ? "bg-[#3e4f8a] text-white shadow-sm font-semibold"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
                    className
                )}
                {...props}
            />
        )
    }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(TabsContext);
        if (!context) throw new Error("TabsContent must be used within Tabs");

        if (context.activeTab !== value) return null;

        return (
            <div
                ref={ref}
                role="tabpanel"
                className={cn(
                    "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
