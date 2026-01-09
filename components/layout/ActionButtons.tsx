'use client';

import { Button } from "@/components/ui/Button";
import { Save, MoreVertical, RotateCcw } from "lucide-react";
import { useLayout } from "./LayoutContext";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export function ActionButtons() {
    const { resetTheme, hasChanges, saveTheme } = useLayout();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const isSettingsPage = pathname === '/settings';

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

            {isSettingsPage && (
                <div className="relative" ref={menuRef}>
                    <Button
                        onClick={() => setIsOpen(!isOpen)}
                        variant="action"
                        className="h-9 text-sm px-3"
                        icon={MoreVertical}
                    >
                        Action
                    </Button>

                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-card-bg rounded-md shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                            <button
                                onClick={() => {
                                    confirm("Are you sure you want to reset to default brand colors?");
                                    resetTheme();
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Change to Default
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
