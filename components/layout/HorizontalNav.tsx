import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLayout } from './LayoutContext';
import { navItems } from '@/config/navigation';
import { ActionButtons } from './ActionButtons';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

export function HorizontalNav() {
    const pathname = usePathname();
    const { customTheme, handleNavigation, theme } = useLayout();
    const activeTheme = theme === 'dark' ? customTheme.dark : customTheme.light;
    const { displayMode } = activeTheme.horizontalNav;

    const activeItem = navItems.find(item => item.href === pathname) || navItems[0];
    const fullTitle = (activeItem as any).pageTitle || activeItem.label;
    const parts = fullTitle.split(' / ');

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
            {/* Left: Page Title */}
            <div className="flex-1 flex items-center justify-start pr-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 hidden lg:flex items-center gap-2 whitespace-nowrap" style={{ color: 'var(--h-nav-text)' }}>
                    {parts.map((part: string, index: number) => (
                        <Fragment key={index}>
                            {index > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                            <span>{part}</span>
                        </Fragment>
                    ))}
                </span>
            </div>

            {/* Center: Navigation Items */}
            <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar justify-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    // Dynamic styles for active/inactive state
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

                    const iconColor = isActive ? 'var(--h-nav-active-text)' : 'var(--h-nav-icon)';

                    return (
                        <Link
                            key={item.href}
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
            <div className="flex-1 flex items-center justify-end pl-4">
                <ActionButtons />
            </div>
        </div>
    );
}
