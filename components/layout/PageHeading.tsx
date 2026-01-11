'use client';

import { usePathname } from 'next/navigation';
import { navItems } from '@/config/navigation';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

export function PageHeading() {
    const pathname = usePathname();

    let activeItem: any = navItems[0];
    let breadcrumbs: string[] = [navItems[0].label];
    let description = navItems[0].description;

    // Find the active item (handle nested structure)
    for (const item of navItems) {
        if (item.href === pathname) {
            activeItem = item;
            breadcrumbs = [item.label];
            description = item.description;
            break;
        }
        if (item.children) {
            const child = item.children.find((c: any) => c.href === pathname);
            if (child) {
                activeItem = child;
                breadcrumbs = [item.label, child.label];
                // Use child description if available, otherwise fallback to empty string or keep parent?
                // For now, let's use the child description if it exists, otherwise empty.
                // The parent description might be too generic.
                description = (child as any).description || item.description;
                break;
            }
        }
    }

    // Check if the item has an explicit pageTitle override
    if ((activeItem as any).pageTitle) {
        breadcrumbs = [(activeItem as any).pageTitle];
    }

    return (
        <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                {breadcrumbs.map((part: string, index: number) => (
                    <Fragment key={index}>
                        {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                        <span>{part}</span>
                    </Fragment>
                ))}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
            </p>
        </div>
    );
}
