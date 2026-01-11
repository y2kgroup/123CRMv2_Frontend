'use client';

import { ActionButtons } from "./ActionButtons";
import { PageHeading } from "./PageHeading";

import { useLayout } from "./LayoutContext";
import { cn } from "@/lib/utils";

export function ActionBar() {
    const { layoutWidth, headerActions, layoutMode } = useLayout();

    return (
        <div
            className={cn(
                "sticky z-10 pt-6 px-6 pb-6 bg-[var(--page-bg)] transition-colors",
                layoutMode === 'horizontal' ? "top-[120px]" : "top-[70px]"
            )}
        >
            <div
                className={cn(
                    "flex items-center justify-between p-4 rounded-lg shadow-sm border border-gray-100 dark:border-white/5 bg-white dark:bg-card-bg transition-all",
                    layoutWidth === 'boxed' ? "max-w-[1440px] mx-auto" : ""
                )}
            >
                <PageHeading />

                <div className="flex items-center gap-2">
                    {headerActions}
                    <ActionButtons />
                </div>
            </div>
        </div>
    );
}
