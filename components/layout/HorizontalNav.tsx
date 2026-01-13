import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLayout } from './LayoutContext';
import { ActionButtons } from './ActionButtons';
import { ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { useState, Fragment } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function HorizontalNav() {
    const pathname = usePathname();
    const { customTheme, handleNavigation, theme, headerActions, navItems } = useLayout();
    const activeTheme = theme === 'dark' ? customTheme.dark : customTheme.light;
    const { displayMode } = activeTheme.horizontalNav;

    const activeItem = navItems.find(item => item.href === pathname) || navItems[0];

    return (
        <div
            className="h-[50px] flex items-center px-4 md:px-6 fixed top-[70px] left-0 right-0 z-40 hidden md:flex shadow-sm transition-colors"
            style={{
                backgroundColor: 'var(--h-nav-bg)',
                color: 'var(--h-nav-text)',
                fontWeight: 'var(--h-nav-font-weight)',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}
        >
            {/* Left: Spacer */}
            <div className="flex-1" />

            {/* Center: Navigation Items */}
            <nav className={cn(
                "flex items-center gap-1 overflow-x-auto no-scrollbar w-full",
                (activeTheme.horizontalNav as any).menuAlignment === 'left' ? "justify-start" :
                    (activeTheme.horizontalNav as any).menuAlignment === 'right' ? "justify-end" :
                        "justify-center"
            )}>
                {navItems.map((item: any, index: number) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isChildActive = item.children?.some((child: any) => pathname === child.href);
                    const isActive = pathname === item.href || isChildActive;
                    const Icon = item.icon || FileText;

                    const iconColor = isActive ? 'var(--h-nav-active-text)' : 'var(--h-nav-icon)';

                    if (hasChildren) {
                        return (
                            <NavDropdownItem
                                key={`${item.id || item.href}-${index}`}
                                item={item}
                                activeTheme={activeTheme}
                                pathname={pathname}
                                handleNavigation={handleNavigation}
                                displayMode={displayMode}
                            />
                        );
                    }

                    // Dynamic styles for simple link
                    const itemStyle = isActive
                        ? {
                            color: 'var(--h-nav-active-text)',
                            backgroundColor: 'var(--h-nav-active-bg)',
                            borderColor: 'var(--h-nav-active-border)',
                            borderBottomWidth: 'var(--h-nav-border-width)',
                            fontWeight: 'var(--h-nav-font-weight)'
                        }
                        : {
                            color: 'var(--h-nav-text)',
                            fontWeight: 'var(--h-nav-font-weight)'
                        };

                    return (
                        <Link
                            key={`${item.id || item.href}-${index}`}
                            href={item.href}
                            onClick={(e) => handleNavigation(e, item.href)}
                            style={itemStyle}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap border border-transparent",
                                !isActive && "hover:bg-black/5"
                            )}
                        >
                            {(displayMode === 'both' || displayMode === 'icon') && (
                                <Icon className="w-4 h-4" style={{ color: iconColor }} />
                            )}
                            {(displayMode === 'both' || displayMode === 'text') && (
                                <span>{item.label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Right: Actions */}
            <div className="flex-1 flex items-center justify-end pl-4 gap-2">
                {/* Actions moved to ActionBar */}
            </div>
        </div>
    );
}

function NavDropdownItem({ item, activeTheme, pathname, handleNavigation, displayMode }: any) {
    const { triggerMode } = (activeTheme.horizontalNav as any).dropdown || { triggerMode: 'click' };
    const [isOpen, setIsOpen] = useState(false);
    let timeoutId: NodeJS.Timeout;

    const isActive = pathname === item.href || item.children?.some((child: any) => pathname === child.href);
    const Icon = item.icon || FileText;
    const iconColor = isActive ? 'var(--h-nav-active-text)' : 'var(--h-nav-icon)';

    // Dynamic styles
    const itemStyle = isActive
        ? {
            color: 'var(--h-nav-active-text)',
            backgroundColor: 'var(--h-nav-active-bg)',
            borderColor: 'var(--h-nav-active-border)',
            borderBottomWidth: 'var(--h-nav-border-width)',
            fontWeight: 'var(--h-nav-font-weight)'
        }
        : {
            color: 'var(--h-nav-text)',
            fontWeight: 'var(--h-nav-font-weight)'
        };

    const handleMouseEnter = () => {
        if (triggerMode === 'hover') {
            clearTimeout(timeoutId);
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (triggerMode === 'hover') {
            timeoutId = setTimeout(() => setIsOpen(false), 150); // Small delay for UX
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="h-full flex items-center"
            >
                <DropdownMenuTrigger asChild>
                    <button
                        style={itemStyle}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap border border-transparent outline-none h-[34px]",
                            !isActive && "hover:bg-black/5"
                        )}
                        onClick={(e) => {
                            if (triggerMode === 'hover') {
                                // Optional: clicking on the main trigger in hover mode could navigate to parent? 
                                // For now, let's allow it to toggle or just do nothing if open.
                                // If it's a link, we might want to navigate. But item is a dropdown.
                            }
                        }}
                    >
                        {(displayMode === 'both' || displayMode === 'icon') && (
                            <Icon className="w-4 h-4" style={{ color: iconColor }} />
                        )}
                        {(displayMode === 'both' || displayMode === 'text') && (
                            <span>{item.label}</span>
                        )}
                        <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="center"
                    sideOffset={5}
                    className="min-w-[180px]"
                    style={{
                        backgroundColor: 'var(--h-nav-dropdown-bg)',
                        borderColor: 'var(--h-nav-dropdown-border)',
                        borderWidth: 'var(--h-nav-dropdown-border-width)',
                    }}
                    onMouseEnter={handleMouseEnter} // Keep open when hovering content
                    onMouseLeave={handleMouseLeave}
                >
                    {item.children.map((child: any) => (
                        <Link key={child.id || child.href} href={child.href} onClick={(e) => {
                            setIsOpen(false);
                            handleNavigation(e, child.href);
                        }}>
                            <DropdownMenuItem
                                className={cn("cursor-pointer focus:outline-none")}
                                style={{
                                    color: 'var(--h-nav-dropdown-text)',
                                    fontWeight: 'var(--h-nav-dropdown-font-weight)',
                                } as React.CSSProperties}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--h-nav-dropdown-active-bg)')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                onFocus={(e) => (e.currentTarget.style.backgroundColor = 'var(--h-nav-dropdown-active-bg)')}
                                onBlur={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                {(() => {
                                    const ChildIcon = child.icon || FileText;
                                    return (
                                        <ChildIcon
                                            className="w-4 h-4 mr-2"
                                            style={{
                                                color: 'var(--h-nav-dropdown-icon)',
                                                opacity: 1
                                            }}
                                        />
                                    );
                                })()}
                                <span style={{ fontWeight: 'var(--h-nav-dropdown-font-weight)' }}>
                                    {child.label}
                                </span>
                            </DropdownMenuItem>
                        </Link>
                    ))}
                </DropdownMenuContent>
            </div>
        </DropdownMenu>
    );
}

