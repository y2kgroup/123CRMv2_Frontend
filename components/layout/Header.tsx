'use client';

import { Search, Bell, User, Settings, Menu, ChevronDown, UserCircle, Moon, Sun, LayoutGrid, LogOut, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { useLayout } from './LayoutContext';
import { NotificationCenter } from './NotificationCenter';

export function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { toggleLayoutMode, layoutMode, theme, toggleTheme, customTheme, isSidebarCollapsed, toggleMobileMenu, headerActions, resetTheme, resetNavItems } = useLayout();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLayoutSwitch = () => {
        toggleLayoutMode();
        setIsDropdownOpen(false);
    };

    // Determine which logo to show
    let logoSrc = theme === 'dark' ? customTheme.branding?.logoDark : customTheme.branding?.logoLight;

    if (layoutMode === 'vertical' && isSidebarCollapsed) {
        const collapsedLogo = theme === 'dark' ? customTheme.branding?.logoCollapsedDark : customTheme.branding?.logoCollapsedLight;
        if (collapsedLogo) logoSrc = collapsedLogo;
    }

    const handleSaveSnapshot = async () => {
        try {
            const data: Record<string, any> = {};
            // Gather all localStorage data relevant to tables and config
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('table-') || key.startsWith('app-') || key.startsWith('templates_'))) {
                    try {
                        const val = localStorage.getItem(key);
                        if (val) data[key] = JSON.parse(val);
                    } catch (e) {
                        // ignore non-json
                        data[key] = localStorage.getItem(key);
                    }
                }
            }

            const res = await fetch('/api/dev/snapshot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data })
            });

            if (res.ok) {
                alert('Snapshot saved to dev-snapshot.json');
            } else {
                alert('Failed to save snapshot');
            }
        } catch (e) {
            console.error(e);
            alert('Error saving snapshot');
        }
    };

    return (
        <header
            className={cn(
                "h-[70px] flex items-center px-4 md:px-6 fixed top-0 right-0 z-50 transition-all duration-300 ease-in-out",
                layoutMode === 'vertical'
                    ? (isSidebarCollapsed ? "left-0 md:left-[70px]" : "left-0 md:left-[250px]")
                    : "left-0"
            )}
            style={{
                backgroundColor: 'var(--header-bg)',
                color: 'var(--header-text)',
                fontWeight: 'var(--header-font-weight)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            <div className="flex items-center gap-4 w-full">
                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-1 hover:bg-white/10 rounded"
                    onClick={toggleMobileMenu}
                >
                    <Menu className="w-6 h-6" style={{ color: 'var(--header-icon)' }} />
                </button>

                {/* Logo */}
                <div className={cn("flex items-center gap-2 mr-8", layoutMode === 'vertical' && "md:hidden")}>
                    {/* Dynamic Logo Logic */}
                    {logoSrc ? (
                        <img
                            src={logoSrc}
                            alt="Logo"
                            className="h-8 w-auto object-contain"
                        />
                    ) : (
                        <span className="text-xl font-bold tracking-tight">
                            {layoutMode === 'vertical' && isSidebarCollapsed ? '123' : '123CRM'}
                        </span>
                    )}
                </div>

                {/* Search */}
                <div className="hidden md:flex items-center justify-center flex-1">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--header-icon)' }} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-black/20 text-sm pl-10 pr-4 py-2 rounded-md outline-none focus:ring-1 focus:ring-white/20 border-none placeholder:text-white/50"
                            style={{ color: 'var(--header-text)' }}
                        />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 ml-auto">

                    <NotificationCenter />

                    {/* User Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <div
                            className="flex items-center gap-3 cursor-pointer p-1 hover:bg-white/10 rounded-md transition-colors"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20">
                                <User className="w-4 h-4" style={{ color: 'var(--header-icon)' }} />
                            </div>
                            <div className="flex flex-col items-start hidden sm:flex">
                                <span className="text-sm font-medium leading-none">Yosi Nuri</span>
                                <span className="text-xs opacity-70 mt-0.5">Developer</span>
                            </div>
                            <ChevronDown className="w-4 h-4 ml-1" style={{ color: 'var(--header-icon)' }} />
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-card-bg rounded-lg shadow-lg py-1 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                    <p className="text-sm font-semibold">My Account</p>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={handleSaveSnapshot}
                                        className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-blue-600 dark:text-blue-400"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Developer Mode - Save Snapshot
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Directly reset without confirm to avoid browser blocking issues
                                            resetTheme();
                                            resetNavItems();
                                            window.location.reload();
                                        }}
                                        className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-orange-600 dark:text-orange-400"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Developer Mode - Reset to Defaults
                                    </button>
                                    <button className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300">
                                        <UserCircle className="w-4 h-4" />
                                        Profile
                                    </button>
                                    <button
                                        onClick={toggleTheme}
                                        className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                                    >
                                        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                                    </button>
                                    <button
                                        onClick={handleLayoutSwitch}
                                        className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                        {layoutMode === 'horizontal' ? 'Switch to Vertical' : 'Switch to Horizontal'}
                                    </button>
                                </div>
                                <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                                    <button className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3">
                                        <LogOut className="w-4 h-4" />
                                        Log out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
