import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLayout, NavItem } from './LayoutContext';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
    const pathname = usePathname();
    const { isSidebarCollapsed, toggleSidebar, customTheme, handleNavigation, theme, isMobileMenuOpen, setIsMobileMenuOpen, layoutMode, navItems } = useLayout();
    const [openSubMenus, setOpenSubMenus] = React.useState<string[]>([]);
    const activeTheme = theme === 'dark' ? customTheme.dark : customTheme.light;
    const { displayMode } = activeTheme.verticalNav;

    // Determine which logo to show
    let logoSrc = theme === 'dark' ? customTheme.branding?.logoDark : customTheme.branding?.logoLight;
    if (isSidebarCollapsed) {
        const collapsedLogo = theme === 'dark' ? customTheme.branding?.logoCollapsedDark : customTheme.branding?.logoCollapsedLight;
        if (collapsedLogo) logoSrc = collapsedLogo;
    }

    return (
        <div
            className={cn(
                "flex flex-col fixed top-0 left-0 bottom-0 z-50 overflow-hidden transition-transform duration-300 border-r",
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
            {/* Sidebar Logo Area */}
            <div className="h-[70px] flex items-center justify-center shrink-0 border-b border-white/5 mx-4 mb-2">
                {logoSrc ? (
                    <img
                        src={logoSrc}
                        alt="Logo"
                        className={cn("object-contain", isSidebarCollapsed ? "h-8 w-8" : "h-8 w-auto")}
                    />
                ) : (
                    <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--v-nav-text)' }}>
                        {isSidebarCollapsed ? '123' : '123CRM'}
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto py-4">
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
                    {navItems.map((item: NavItem) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isOpen = openSubMenus.includes(item.label);
                        const isChildActive = item.children?.some((child: NavItem) => pathname === child.href);
                        const isActive = pathname === item.href || isChildActive;
                        const Icon = item.icon || FileText;

                        const handleParentClick = (e: React.MouseEvent) => {
                            if (isSidebarCollapsed && hasChildren) return; // Allow DropdownTrigger to handle it

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

                        const NavItemContent = (
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
                                    "relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all group select-none",
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
                        );

                        if (isSidebarCollapsed && hasChildren) {
                            return (
                                <DropdownMenu key={item.id || item.label || item.href}>
                                    <DropdownMenuTrigger asChild>
                                        {NavItemContent}
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="right" className="bg-[#1e2329] border-slate-700 text-slate-200 min-w-[200px] ml-2">
                                        <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-slate-700" />
                                        {item.children!.map((child: NavItem) => (
                                            <DropdownMenuItem
                                                key={child.href}
                                                className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white"
                                                onClick={(e) => {
                                                    handleNavigation(e, child.href);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                {child.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        }

                        return (
                            <div key={item.id || item.label || item.href}>
                                {NavItemContent}

                                {/* Submenu */}
                                {hasChildren && !isSidebarCollapsed && isOpen && (
                                    <div className="ml-9 mt-1 flex flex-col gap-1 border-l border-white/10 pl-2">
                                        {item.children!.map((child: NavItem) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                onClick={(e) => {
                                                    handleNavigation(e, child.href);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className={cn(
                                                    "block px-3 py-2 text-sm rounded-md transition-colors",
                                                    pathname === child.href
                                                        ? "text-white bg-white/10 font-medium"
                                                        : "text-slate-400 hover:text-white hover:bg-white/5"
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
