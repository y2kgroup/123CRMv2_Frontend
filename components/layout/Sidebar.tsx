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
                    {navItems.map((item: any) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isOpen = openSubMenus.includes(item.label);
                        const isChildActive = item.children?.some((child: any) => pathname === child.href);
                        const isActive = pathname === item.href || isChildActive;
                        const Icon = item.icon;

                        const handleParentClick = (e: React.MouseEvent) => {
                            if (hasChildren && !isSidebarCollapsed) {
                                e.preventDefault();
                                setOpenSubMenus(prev =>
                                    prev.includes(item.label)
                                        ? prev.filter(l => l !== item.label)
                                        : [...prev, item.label]
                                );
                            } else {
                                handleNavigation(e, item.href);
                                setIsMobileMenuOpen(false);
                            }
                        };

                        return (
                            <div key={item.label}>
                                <div
                                    onClick={handleParentClick}
                                    title={isSidebarCollapsed ? item.label : undefined}
                                    style={{
                                        color: isActive ? 'var(--v-nav-text)' : 'var(--v-nav-text)',
                                        backgroundColor: isActive && !hasChildren ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        opacity: isActive ? 1 : 0.7,
                                        fontWeight: 'var(--v-nav-font-weight)',
                                        cursor: 'pointer'
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all group select-none",
                                        !isActive && "hover:opacity-100 hover:bg-white/5",
                                        isSidebarCollapsed && "justify-center px-0"
                                    )}
                                >
                                    {(displayMode === 'both' || displayMode === 'icon') && (
                                        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--v-nav-icon)' }} />
                                    )}
                                    {(displayMode === 'both' || displayMode === 'text') && !isSidebarCollapsed && (
                                        <>
                                            <span className="truncate flex-1">
                                                {hasChildren ? item.label : (
                                                    <Link href={item.href} onClick={(e) => {
                                                        handleNavigation(e, item.href);
                                                        setIsMobileMenuOpen(false);
                                                    }} className="block w-full h-full">
                                                        {item.label}
                                                    </Link>
                                                )}
                                            </span>
                                            {hasChildren && (
                                                <ChevronRight className={cn("w-4 h-4 transition-transform", isOpen && "rotate-90")} />
                                            )}
                                        </>
                                    )}
                                    {/* If collapsed, wrap icon in link if no children, or just show icon */}
                                    {isSidebarCollapsed && !hasChildren && (
                                        <Link href={item.href} className="absolute inset-0" onClick={(e) => {
                                            handleNavigation(e, item.href);
                                            setIsMobileMenuOpen(false);
                                        }} />
                                    )}
                                </div>

                                {/* Submenu */}
                                {hasChildren && !isSidebarCollapsed && isOpen && (
                                    <div className="ml-9 mt-1 flex flex-col gap-1 border-l border-white/10 pl-2">
                                        {item.children!.map((child: any) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                onClick={(e) => {
                                                    handleNavigation(e, child.href);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className={cn(
                                                    "block px-3 py-2 text-sm rounded-md transition-colors",
                                                    pathname === child.href ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
