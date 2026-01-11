import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLayout } from './LayoutContext';
import { navItems } from '@/config/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

export function Sidebar() {
    const pathname = usePathname();
    const { isSidebarCollapsed, toggleSidebar, customTheme, handleNavigation, theme, isMobileMenuOpen, setIsMobileMenuOpen, layoutMode } = useLayout();
    const [openSubMenus, setOpenSubMenus] = React.useState<string[]>([]);
    const activeTheme = theme === 'dark' ? customTheme.dark : customTheme.light;
    const { displayMode } = activeTheme.verticalNav;

    return (
        <div
            className={cn(
                "flex flex-col fixed top-[70px] left-0 bottom-0 z-40 overflow-y-auto transition-transform duration-300 border-r",
                // Width Logic: Mobile always 250px. Desktop relies on collapse state.
                "w-[250px]",
                isSidebarCollapsed ? "md:w-[70px]" : "md:w-[250px]",

                // Visibility Logic:
                // Mobile: Drawer (transform)
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",

                // Desktop: Always show (reset transform), but HIDE if horizontal mode
                "md:translate-x-0",
                layoutMode === 'horizontal' ? "md:hidden" : "md:flex"
            )}
            style={{
                backgroundColor: 'var(--v-nav-bg)',
                borderColor: 'rgba(255,255,255,0.05)',
                fontWeight: 'var(--v-nav-font-weight)'
            }}
        >
            <div className="py-4">
                <div
                    className={cn(
                        "px-4 mb-2 flex items-center",
                        isSidebarCollapsed ? "justify-center" : "justify-between"
                    )}
                >
                    {!isSidebarCollapsed && (
                        <div className="text-xs font-semibold uppercase tracking-wider opacity-50" style={{ color: 'var(--v-nav-text)' }}>
                            Menu
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="hidden md:block p-1 rounded hover:bg-white/10 transition-colors"
                        style={{ color: 'var(--v-nav-text)' }}
                    >
                        {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                    {/* Close button for Mobile */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-1 rounded hover:bg-white/10 transition-colors ml-auto"
                        style={{ color: 'var(--v-nav-text)' }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>

                <nav className="flex flex-col gap-1 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(e) => {
                                    handleNavigation(e, item.href);
                                    setIsMobileMenuOpen(false);
                                }}
                                title={isSidebarCollapsed ? item.label : undefined}
                                style={{
                                    color: isActive ? 'var(--v-nav-text)' : 'var(--v-nav-text)',
                                    backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    opacity: isActive ? 1 : 0.7,
                                    fontWeight: 'var(--v-nav-font-weight)'
                                }}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all",
                                    !isActive && "hover:opacity-100 hover:bg-white/5",
                                    isSidebarCollapsed && "justify-center px-0"
                                )}
                            >
                                {(displayMode === 'both' || displayMode === 'icon') && (
                                    <Icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--v-nav-icon)' }} />
                                )}
                                {(displayMode === 'both' || displayMode === 'text') && !isSidebarCollapsed && (
                                    <span className="truncate">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
