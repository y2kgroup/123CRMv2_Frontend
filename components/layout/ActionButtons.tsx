'use client';

import { Button } from "@/components/ui/button";
import { Save, MoreVertical, RotateCcw } from "lucide-react";
import { useLayout } from "./LayoutContext";
import { usePathname } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ActionButtons() {
    const { resetTheme, hasChanges, saveTheme, headerMenuItems } = useLayout();
    const pathname = usePathname();


    return (
        <div className="flex items-center gap-2">
            {hasChanges && (
                <Button
                    variant="primary"
                    className="h-9 text-sm px-3"
                    icon={Save}
                    onClick={saveTheme}
                >
                    Save
                </Button>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="action"
                        className="h-9 text-sm px-3"
                        icon={MoreVertical}
                    >
                        Action
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-48"
                    style={{
                        backgroundColor: 'var(--h-nav-dropdown-bg)',
                        borderColor: 'var(--h-nav-dropdown-border)',
                        borderWidth: 'var(--h-nav-dropdown-border-width)',
                    }}
                >
                    {headerMenuItems ? (
                        headerMenuItems
                    ) : (
                        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
                            No actions available
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
