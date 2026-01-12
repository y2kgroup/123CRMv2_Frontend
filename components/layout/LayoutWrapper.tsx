'use client';

import { Header } from './Header';
import { HorizontalNav } from './HorizontalNav';
import { Sidebar } from './Sidebar';
import { ActionBar } from './ActionBar';
import { PageHeading } from './PageHeading'; // Import
import { Footer } from './Footer';
import { LayoutProvider, useLayout } from './LayoutContext';
import { cn } from '@/lib/utils'; // Make sure you import cn!
import { NavigationAlert } from '@/components/ui/navigation-alert';

interface LayoutWrapperProps {
    children: React.ReactNode;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
    const {
        layoutMode,
        isSidebarCollapsed,
        layoutWidth,
        showUnsavedAlert,
        confirmNavigation,
        cancelNavigation,
        isMobileMenuOpen,
        setIsMobileMenuOpen
    } = useLayout();

    return (
        <div className="h-screen overflow-hidden flex flex-col">
            <Header />

            {/* Mobile Menu Overlay */}
            {layoutMode === 'vertical' && isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {layoutMode === 'horizontal' && <HorizontalNav />}
            <Sidebar />

            <main
                className={cn(
                    "flex-1 flex flex-col fade-in transition-all duration-300 overflow-hidden",
                    layoutMode === 'horizontal'
                        ? "pt-[70px] md:pt-[120px]"
                        : cn("pt-[70px]", isSidebarCollapsed ? "md:pl-[70px]" : "md:pl-[250px]")
                )}
            >
                <div>
                    <ActionBar />
                </div>

                <div className="flex-1 p-4 md:p-6 pt-0 overflow-hidden">
                    <div className={cn(
                        "w-full h-full flex flex-col transition-all duration-300",
                        layoutWidth === 'boxed' ? "max-w-[1440px] mx-auto shadow-sm bg-white dark:bg-card-bg rounded-md border border-gray-100 dark:border-gray-800 p-6" : ""
                    )}>
                        {children}
                    </div>
                </div>
                <Footer />
            </main>
            {/* Unsaved Changes Alert */}
            <NavigationAlert
                isOpen={showUnsavedAlert}
                onConfirm={confirmNavigation}
                onCancel={cancelNavigation}
            />
        </div >
    );
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
    return (
        <LayoutProvider>
            <LayoutContent>{children}</LayoutContent>
        </LayoutProvider>
    );
}
