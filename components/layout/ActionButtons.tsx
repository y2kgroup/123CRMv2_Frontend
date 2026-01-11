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
    const isSettingsPage = pathname?.startsWith('/settings');

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
                    {isSettingsPage ? (
                        <DropdownMenuItem
                            onClick={() => {
                                if (confirm("Are you sure you want to reset to default brand colors?")) {
                                    resetTheme();
                                }
                            }}
                            className="text-gray-700 dark:text-gray-200 cursor-pointer focus:outline-none"
                            style={{
                                color: 'var(--h-nav-dropdown-text)',
                                fontWeight: 'var(--h-nav-dropdown-font-weight)',
                            } as React.CSSProperties}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--h-nav-dropdown-active-bg)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            onFocus={(e) => (e.currentTarget.style.backgroundColor = 'var(--h-nav-dropdown-active-bg)')}
                            onBlur={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            <RotateCcw
                                className="w-4 h-4 mr-2"
                                style={{
                                    color: 'var(--h-nav-dropdown-icon)',
                                    opacity: 1
                                }}
                            />
                            Change to Default
                        </DropdownMenuItem>
                    ) : headerMenuItems ? (
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
