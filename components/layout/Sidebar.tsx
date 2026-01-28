import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLayout, NavItem } from './LayoutContext';
import { ChevronLeft, ChevronRight, FileText, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

// --- Recursive Sidebar Item Component ---
interface SidebarItemProps {
    item: NavItem;
    isSidebarCollapsed: boolean;
    depth?: number;
    openSubMenus: string[];
    onToggleSubMenu: (label: string) => void;
    onNavigate: (e: React.MouseEvent, href: string) => void;
    displayMode: 'icon' | 'text' | 'both';
    pathname: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    item,
    isSidebarCollapsed,
    depth = 0,
    openSubMenus,
    onToggleSubMenu,
    onNavigate,
    displayMode,
    pathname
}) => {
    const hasChildren = item.children && item.children.length > 0;

    // Check if this item or any descendants are active
    const isActive = React.useMemo(() => {
        if (item.href === pathname) return true;
        if (hasChildren) {
            const checkChildren = (children: NavItem[]): boolean => {
                return children.some(child =>
                    child.href === pathname || (child.children && checkChildren(child.children))
                );
            };
            return checkChildren(item.children!);
        }
        return false;
    }, [pathname, item]);

    const isOpen = openSubMenus.includes(item.label);
    const Icon = item.icon || FileText;

    // --- RENDER LOGIC ---

    // 1. COLLAPSED MODE: Use Dropdown for top-level only (depth 0), recursive inside dropdown not supported well in pure CSS hover, 
    //    but Radix UI DropdownMenu supports nested Submenus.
    if (isSidebarCollapsed) {
        // Only top-level items hold the dropdown trigger. 
        // If we are deep inside (depth > 0), we shouldn't be rendering this component directly in the main list 
        // because the main list only shows the top icons. 
        // Wait, the main list loop calls this. 
        // So this component renders the TOP LEVEL item. 

        // If has children, we render a Dropdown.
        if (hasChildren) {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div
                            className={cn(
                                "relative flex items-center justify-center h-[40px] w-[40px] mx-auto rounded-md transition-all cursor-pointer",
                                isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                            title={item.label}
                        >
                            {(displayMode === 'both' || displayMode === 'icon') && (
                                <Icon className="w-5 h-5" style={{ color: isActive ? 'white' : 'inherit' }} />
                            )}
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="right"
                        className="min-w-[200px] ml-2"
                        style={{
                            backgroundColor: 'var(--h-nav-dropdown-bg)',
                            borderColor: 'var(--h-nav-dropdown-border)',
                            borderWidth: 'var(--h-nav-dropdown-border-width)',
                        }}
                    >
                        <DropdownMenuLabel style={{ color: 'var(--h-nav-dropdown-text)' }}>{item.label}</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[var(--h-nav-dropdown-border)]" />
                        {item.children!.map((child) => (
                            <CollapsedResultItem
                                key={child.href}
                                item={child}
                                onNavigate={onNavigate}
                                pathname={pathname}
                            />
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        // No children, just a link
        return (
            <Link
                href={item.href}
                onClick={(e) => onNavigate(e, item.href)}
                className={cn(
                    "relative flex items-center justify-center h-[40px] w-[40px] mx-auto rounded-md transition-all cursor-pointer",
                    isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
                title={item.label}
            >
                {(displayMode === 'both' || displayMode === 'icon') && (
                    <Icon className="w-5 h-5" style={{ color: isActive ? 'white' : 'inherit' }} />
                )}
            </Link>
        );
    }

    // 2. EXPANDED MODE (Recursive Tree)
    return (
        <div>
            <div
                onClick={(e) => {
                    if (hasChildren) {
                        e.preventDefault();
                        onToggleSubMenu(item.label);
                    } else {
                        onNavigate(e, item.href);
                    }
                }}
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer select-none",
                    isActive && !hasChildren ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white",
                    // Indentation based on depth
                    depth > 0 && "ml-4 border-l border-white/10"
                )}
                style={{
                    paddingLeft: depth === 0 ? '12px' : undefined, // Keep top level standard
                }}
            >
                {/* Only show Icon for Top Level (Depth 0) to avoid clutter? Or show all? User wants menu. Let's show if defined. */}
                {(displayMode === 'both' || displayMode === 'icon') && (
                    <Icon className={cn("w-5 h-5 flex-shrink-0", depth > 0 && "w-4 h-4 opacity-70")} />
                )}

                {(displayMode === 'both' || displayMode === 'text') && (
                    <span className="flex-1 truncate">{item.label}</span>
                )}

                {hasChildren && (
                    <ChevronRight
                        className={cn("w-4 h-4 transition-transform opacity-50", isOpen && "rotate-90")}
                    />
                )}
            </div>

            {/* Recursively render children if open */}
            {hasChildren && isOpen && (
                <div className="flex flex-col gap-1 mt-1">
                    {item.children!.map((child) => (
                        <SidebarItem
                            key={child.href || child.label}
                            item={child}
                            isSidebarCollapsed={false} // Always false if we are inside here
                            depth={depth + 1}
                            openSubMenus={openSubMenus}
                            onToggleSubMenu={onToggleSubMenu}
                            onNavigate={onNavigate}
                            displayMode={displayMode}
                            pathname={pathname}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Helper for Collapsed Mode Recursion (DropdownSub) ---
const CollapsedResultItem: React.FC<{ item: NavItem, onNavigate: any, pathname: string }> = ({ item, onNavigate, pathname }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.href === pathname;

    // Apply exact same styles as HorizontalNav for consistency
    const dropdownItemStyle = {
        color: 'var(--h-nav-dropdown-text)',
        fontWeight: 'var(--h-nav-dropdown-font-weight)',
    } as React.CSSProperties;

    // We use the horizontal nav variables for dropdowns because "Dropdown Menu Style" in settings is global/shared
    // or typically associated with the horizontal menu's dropdowns.

    if (hasChildren) {
        return (
            <DropdownMenuSub>
                <DropdownMenuSubTrigger
                    className="cursor-pointer focus:bg-[var(--h-nav-dropdown-active-bg)] focus:text-[var(--h-nav-dropdown-text)]"
                    style={dropdownItemStyle}
                >
                    {item.icon && <item.icon className="w-4 h-4 mr-2" style={{ color: 'var(--h-nav-dropdown-icon)' }} />}
                    <span>{item.label}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent
                    className="min-w-[200px] ml-2"
                    style={{
                        backgroundColor: 'var(--h-nav-dropdown-bg)',
                        borderColor: 'var(--h-nav-dropdown-border)',
                        borderWidth: 'var(--h-nav-dropdown-border-width)',
                    }}
                >
                    {item.children!.map(child => (
                        <CollapsedResultItem key={child.href} item={child} onNavigate={onNavigate} pathname={pathname} />
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuSub>
        );
    }

    return (
        <DropdownMenuItem
            className={cn(
                "cursor-pointer focus:outline-none",
                isActive && "bg-[var(--h-nav-dropdown-active-bg)]"
            )}
            style={dropdownItemStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--h-nav-dropdown-active-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isActive ? 'var(--h-nav-dropdown-active-bg)' : 'transparent')}
            onFocus={(e) => (e.currentTarget.style.backgroundColor = 'var(--h-nav-dropdown-active-bg)')}
            onBlur={(e) => (e.currentTarget.style.backgroundColor = isActive ? 'var(--h-nav-dropdown-active-bg)' : 'transparent')}
            onClick={(e) => onNavigate(e, item.href)}
        >
            {item.icon && <item.icon className="w-4 h-4 mr-2" style={{ color: 'var(--h-nav-dropdown-icon)' }} />}
            <span>{item.label}</span>
        </DropdownMenuItem>
    );
};


// --- MAIN SIDEBAR COMPONENT ---
export function Sidebar() {
    const pathname = usePathname();
    const { isSidebarCollapsed, toggleSidebar, customTheme, handleNavigation, theme, isMobileMenuOpen, setIsMobileMenuOpen, layoutMode, navItems } = useLayout();
    const [openSubMenus, setOpenSubMenus] = useState<string[]>([]);
    const activeTheme = theme === 'dark' ? customTheme.dark : customTheme.light;
    const { displayMode } = activeTheme.verticalNav;

    // Determine which logo to show
    let logoSrc = theme === 'dark' ? customTheme.branding?.logoDark : customTheme.branding?.logoLight;
    if (isSidebarCollapsed) {
        const collapsedLogo = theme === 'dark' ? customTheme.branding?.logoCollapsedDark : customTheme.branding?.logoCollapsedLight;
        if (collapsedLogo) logoSrc = collapsedLogo;
    }

    const onNavigate = (e: React.MouseEvent, href: string) => {
        handleNavigation(e, href);
        setIsMobileMenuOpen(false);
    };

    const onToggleSubMenu = (label: string) => {
        setOpenSubMenus(prev =>
            prev.includes(label)
                ? prev.filter(l => l !== label)
                : [...prev, label]
        );
    };

    return (
        <div
            className={cn(
                "flex flex-col fixed top-0 left-0 bottom-0 z-50 overflow-hidden transition-transform duration-300 border-r",
                "w-[250px]",
                isSidebarCollapsed ? "md:w-[70px]" : "md:w-[250px]",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
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

            <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
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
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-1 rounded hover:bg-white/10 transition-colors ml-auto"
                        style={{ color: 'var(--v-nav-text)' }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>

                <nav className="flex flex-col gap-1 px-2">
                    {navItems.map((item: NavItem, idx) => (
                        <SidebarItem
                            key={idx} // Using index fallback if id/label missing
                            item={item}
                            isSidebarCollapsed={isSidebarCollapsed}
                            openSubMenus={openSubMenus}
                            onToggleSubMenu={onToggleSubMenu}
                            onNavigate={onNavigate}
                            displayMode={displayMode}
                            pathname={pathname}
                        />
                    ))}
                </nav>
            </div>
        </div>
    );
}
