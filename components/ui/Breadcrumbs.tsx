'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useLayout } from '@/components/layout/LayoutContext';

export function Breadcrumbs() {
    const pathname = usePathname();
    const { navItems } = useLayout();

    interface NavItem {
        href: string;
        label: string;
        children?: NavItem[];
    }

    // Helper to find label for a path segment
    const getLabel = (path: string, segment: string) => {
        // Try to match exact path
        const directMatch = navItems.find((item: NavItem) => item.href === path);
        if (directMatch) return directMatch.label;

        // Try to find in children
        for (const item of navItems as NavItem[]) {
            if (item.children) {
                const childMatch = item.children.find((child: NavItem) => child.href === path);
                if (childMatch) return childMatch.label;
            }
        }

        // Fallback: Capitalize segment
        return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    };

    if (!pathname) return null;

    const segments = pathname.split('/').filter(Boolean);

    // Build breadcrumb items
    const crumbs = segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        const label = getLabel(path, segment);

        return { path, label, isLast };
    });

    // Always start with Dashboard if not already there?
    // User requested "Paige title in the action bar will show the breadcrumb"

    return (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {crumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="w-4 h-4" />}
                    {crumb.isLast ? (
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {crumb.label}
                        </span>
                    ) : (
                        <Link
                            href={crumb.path}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </div>
            ))}
        </div>
    );
}
