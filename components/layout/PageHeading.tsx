'use client';

import { usePathname } from 'next/navigation';
import { navItems } from '@/config/navigation';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

export function PageHeading() {
    const pathname = usePathname();
    const activeItem = navItems.find(item => item.href === pathname) || navItems[0];
    const fullTitle = (activeItem as any).pageTitle || activeItem.label;
    const parts = fullTitle.split(' / ');

    return (
        <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                {parts.map((part: string, index: number) => (
                    <Fragment key={index}>
                        {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                        <span>{part}</span>
                    </Fragment>
                ))}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeItem.description}
            </p>
        </div>
    );
}
