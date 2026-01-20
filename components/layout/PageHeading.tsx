'use client';

import { usePathname } from 'next/navigation';
import { navItems } from '@/config/navigation';
import { useLayout } from './LayoutContext';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export function PageHeading() {
    const pathname = usePathname();
    const { pageHeadingContent } = useLayout();

    if (pageHeadingContent) {
        return <>{pageHeadingContent}</>;
    }

    // Keep description logic
    let description = '';
    // specific logic to find description based on pathname
    // Find the active item (handle nested structure)
    for (const item of navItems) {
        if (item.href === pathname) {
            description = item.description || '';
            break;
        }
        if (item.children) {
            const child = item.children.find((c: any) => c.href === pathname);
            if (child) {
                description = (child as any).description || item.description || '';
                break;
            }
        }
    }

    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Breadcrumbs />
            </h1>
            {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {description}
                </p>
            )}
        </div>
    );
}
