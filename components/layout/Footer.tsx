'use client';

import { Heart } from 'lucide-react';

export function Footer() {
    return (
        <footer
            className="w-full h-[40px] flex items-center justify-between sticky bottom-0 z-50 px-6 border-t border-black/10 dark:border-white/10 transition-colors"
            style={{
                backgroundColor: 'var(--footer-bg)',
                color: 'var(--footer-text)',
                fontWeight: 'var(--footer-font-weight)'
            }}
        >
            <div className="text-xs opacity-70">
                {new Date().getFullYear()} © 123CRM.
            </div>
            <div className="text-xs opacity-70 hidden sm:flex items-center gap-1">
                Crafted with <Heart className="w-3 h-3 text-red-500 fill-red-500 inline-block" /> by Y2K Group IT
            </div>
        </footer>
    );
}
