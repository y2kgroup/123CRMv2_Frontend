'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { FileText } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

type LayoutMode = 'horizontal' | 'vertical';
type LayoutWidth = 'full' | 'boxed';
type Theme = 'light' | 'dark';


import { defaultTheme, ThemeConfig, CustomTheme, ColorSettings, MenuSettings, ButtonSettings, AlertSettings, DropdownSettings, themeVersion } from '@/config/theme';

import { navItems as initialNavItems } from '@/config/navigation';

export interface NavItem {
    label: string;
    href: string;
    description?: string;
    icon?: any;
    iconName?: string;
    children?: NavItem[];
    id?: string;
}

// --- Icon Restoration Logic ---
// --- Icon Restoration Logic ---
// Helper to find original icon
const findOriginalIcon = (href: string, list: NavItem[]): any => {
    for (const item of list) {
        if (item.href === href) return item.icon;
        if (item.children) {
            const found = findOriginalIcon(href, item.children);
            if (found) return found;
        }
    }
    return null;
};

// Helper to restore icons recursively
const restoreIcons = (items: NavItem[]): NavItem[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconsMap = LucideIcons as Record<string, any>;

    return items.map((item: NavItem) => {
        let Icon = FileText;

        // 1. Try to restore from 'iconName' if present (user selected icon)
        if (item.iconName && IconsMap[item.iconName]) {
            Icon = IconsMap[item.iconName];
        }
        // 2. Or try to find original icon from config (built-in pages)
        else {
            const originalIcon = findOriginalIcon(item.href, initialNavItems);
            if (originalIcon) Icon = originalIcon;
        }

        return {
            ...item,
            icon: Icon,
            children: item.children ? restoreIcons(item.children) : undefined
        };
    });
};

// Helper to remove duplicates (sibling-level only)
const removeDuplicates = (items: NavItem[]): NavItem[] => {
    const seenInThisLevel = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.reduce((acc: any[], item: NavItem) => {
        // Use ID or Href for uniqueness
        const key = item.href || item.label;

        // Only filter if we've seen this exact key AT THIS LEVEL
        if (key && seenInThisLevel.has(key)) {
            return acc;
        }
        if (key) seenInThisLevel.add(key);

        const newItem = { ...item };
        if (newItem.children) {
            // Recursively clean children with a FRESH set for that level
            newItem.children = removeDuplicates(newItem.children);
        }
        acc.push(newItem);
        return acc;
    }, []);
};

// ... (existing interfaces)

interface LayoutContextType {
    layoutMode: LayoutMode;
    setLayoutMode: (mode: LayoutMode) => void;
    toggleLayoutMode: () => void;
    layoutWidth: LayoutWidth;
    setLayoutWidth: (width: LayoutWidth) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    customTheme: CustomTheme;
    updateCustomTheme: (section: keyof ThemeConfig | 'branding', settings: any) => void;
    saveTheme: () => void;
    resetTheme: () => void;
    hasChanges: boolean;
    setHasChanges: (hasChanges: boolean) => void;
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
    // Navigation Interception
    showUnsavedAlert: boolean;
    setShowUnsavedAlert: (show: boolean) => void;
    handleNavigation: (e: React.MouseEvent, path: string) => void;
    pendingUrl: string | null;
    confirmNavigation: () => void;
    cancelNavigation: () => void;
    // Mobile Menu
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    toggleMobileMenu: () => void;
    headerActions: React.ReactNode;
    setHeaderActions: (actions: React.ReactNode) => void;
    headerMenuItems: React.ReactNode;
    setHeaderMenuItems: (items: React.ReactNode) => void;
    pageHeadingContent: React.ReactNode;
    setPageHeadingContent: (content: React.ReactNode) => void;
    // Dynamic Nav
    navItems: NavItem[];
    updateNavItems: (items: NavItem[]) => void;
    resetNavItems: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
    const [layoutMode, setLayoutModeState] = useState<LayoutMode>('horizontal');
    const [layoutWidth, setLayoutWidthState] = useState<LayoutWidth>('full');
    const [theme, setThemeState] = useState<Theme>('light');
    const [customTheme, setCustomTheme] = useState<CustomTheme>(defaultTheme);
    const [hasChanges, setHasChanges] = useState(false);
    const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [headerActions, setHeaderActions] = useState<React.ReactNode>(null);
    const [headerMenuItems, setHeaderMenuItems] = useState<React.ReactNode>(null);
    const [pageHeadingContent, setPageHeadingContent] = useState<React.ReactNode>(null);


    // Apply CSS Variables
    useEffect(() => {
        const root = document.documentElement;

        // Skip applying CSS if not initialized (to avoid flashing defaults before load)
        // Actually, defaults are fine, but let's wait for init to be consistent
        if (!isInitialized) return;

        const setVar = (name: string, value: string) => {
            if (value) root.style.setProperty(name, value);
        };

        const activeConfig = theme === 'dark' ? customTheme.dark : customTheme.light;

        // Header
        setVar('--header-bg', activeConfig.header.bg);
        setVar('--header-text', activeConfig.header.text);
        setVar('--header-icon', activeConfig.header.icon);
        setVar('--header-font-weight', activeConfig.header.boldText ? '700' : '400');

        // Horizontal Nav
        setVar('--h-nav-bg', activeConfig.horizontalNav.bg);
        setVar('--h-nav-text', activeConfig.horizontalNav.text);
        setVar('--h-nav-icon', activeConfig.horizontalNav.icon);
        setVar('--h-nav-active-border', activeConfig.horizontalNav.activeBorder || activeConfig.horizontalNav.text);
        setVar('--h-nav-active-text', activeConfig.horizontalNav.activeText || activeConfig.horizontalNav.text);
        setVar('--h-nav-active-bg', activeConfig.horizontalNav.activeBackground || 'rgba(0,0,0,0.05)');
        setVar('--h-nav-border-width', activeConfig.horizontalNav.activeBorderThickness || '2px');
        setVar('--h-nav-border-width', activeConfig.horizontalNav.activeBorderThickness || '2px');
        setVar('--h-nav-font-weight', activeConfig.horizontalNav.boldText ? '700' : '500');

        // Horizontal Nav Dropdown
        if (activeConfig.horizontalNav.dropdown) {
            setVar('--h-nav-dropdown-bg', activeConfig.horizontalNav.dropdown.bg);
            setVar('--h-nav-dropdown-text', activeConfig.horizontalNav.dropdown.text);
            setVar('--h-nav-dropdown-icon', activeConfig.horizontalNav.dropdown.icon);
            setVar('--h-nav-dropdown-border', activeConfig.horizontalNav.dropdown.border);
            setVar('--h-nav-dropdown-border-width', activeConfig.horizontalNav.dropdown.borderWidth || '1px');
            setVar('--h-nav-dropdown-font-weight', activeConfig.horizontalNav.dropdown.bold ? '700' : '400');
            setVar('--h-nav-dropdown-active-bg', activeConfig.horizontalNav.dropdown.activeBackground || '#F3F4F6');
        } else {
            // Fallback default values
            setVar('--h-nav-dropdown-bg', '#fff');
            setVar('--h-nav-dropdown-text', '#000');
            setVar('--h-nav-dropdown-icon', '#666');
            setVar('--h-nav-dropdown-border', '#ddd');
            setVar('--h-nav-dropdown-border-width', '1px');
            setVar('--h-nav-dropdown-font-weight', '400');
            setVar('--h-nav-dropdown-active-bg', '#F3F4F6');
        }

        // Vertical Nav
        setVar('--v-nav-bg', activeConfig.verticalNav.bg);
        setVar('--v-nav-text', activeConfig.verticalNav.text);
        setVar('--v-nav-icon', activeConfig.verticalNav.icon);
        setVar('--v-nav-font-weight', activeConfig.verticalNav.boldText ? '700' : '500');

        // Footer
        setVar('--footer-bg', activeConfig.footer.bg);
        setVar('--footer-text', activeConfig.footer.text);
        setVar('--footer-icon', activeConfig.footer.icon);
        setVar('--footer-font-weight', activeConfig.footer.boldText ? '700' : '400');

        // Buttons
        const setButtonDisplay = (variant: string, mode: 'icon' | 'text' | 'both' = 'both') => {
            const iconDisplay = (mode === 'text') ? 'none' : 'block';
            const textDisplay = (mode === 'icon') ? 'none' : 'block';
            setVar(`--btn-${variant}-display-icon`, iconDisplay);
            setVar(`--btn-${variant}-display-text`, textDisplay);
        };

        const setButtonSize = (variant: string, size: 'small' | 'medium' | 'large' = 'medium') => {
            let padding = '8px 16px';
            let fontSize = '14px';
            let iconSize = '16px';

            if (size === 'small') {
                padding = '4px 12px';
                fontSize = '12px';
                iconSize = '14px';
            } else if (size === 'large') {
                padding = '12px 24px';
                fontSize = '16px';
                iconSize = '20px';
            }

            setVar(`--btn-${variant}-padding`, padding);
            setVar(`--btn-${variant}-font-size`, fontSize);
            setVar(`--btn-${variant}-icon-size`, iconSize);
        };

        setVar('--btn-primary-bg', activeConfig.buttons.primary.bg);
        setVar('--btn-primary-text', activeConfig.buttons.primary.text);
        setVar('--btn-primary-icon', activeConfig.buttons.primary.icon);
        setVar('--btn-primary-border', activeConfig.buttons.primary.border);
        setVar('--btn-primary-border-width', activeConfig.buttons.primary.borderWidth || '1px');
        setVar('--btn-primary-font-weight', activeConfig.buttons.primary.boldText ? '700' : '500');
        setVar('--btn-primary-font-weight', activeConfig.buttons.primary.boldText ? '700' : '500');
        setButtonDisplay('primary', activeConfig.buttons.primary.displayMode);
        setButtonSize('primary', activeConfig.buttons.primary.size);

        setVar('--btn-secondary-bg', activeConfig.buttons.secondary.bg);
        setVar('--btn-secondary-text', activeConfig.buttons.secondary.text);
        setVar('--btn-secondary-icon', activeConfig.buttons.secondary.icon);
        setVar('--btn-secondary-border', activeConfig.buttons.secondary.border);
        setVar('--btn-secondary-border-width', activeConfig.buttons.secondary.borderWidth || '1px');
        setVar('--btn-secondary-font-weight', activeConfig.buttons.secondary.boldText ? '700' : '500');
        setVar('--btn-secondary-font-weight', activeConfig.buttons.secondary.boldText ? '700' : '500');
        setButtonDisplay('secondary', activeConfig.buttons.secondary.displayMode);
        setButtonSize('secondary', activeConfig.buttons.secondary.size);

        setVar('--btn-tertiary-bg', activeConfig.buttons.tertiary.bg);
        setVar('--btn-tertiary-text', activeConfig.buttons.tertiary.text);
        setVar('--btn-tertiary-icon', activeConfig.buttons.tertiary.icon);
        setVar('--btn-tertiary-border', activeConfig.buttons.tertiary.border);
        setVar('--btn-tertiary-border-width', activeConfig.buttons.tertiary.borderWidth || '1px');
        setVar('--btn-tertiary-font-weight', activeConfig.buttons.tertiary.boldText ? '700' : '500');
        setVar('--btn-tertiary-font-weight', activeConfig.buttons.tertiary.boldText ? '700' : '500');
        setButtonDisplay('tertiary', activeConfig.buttons.tertiary.displayMode);
        setButtonSize('tertiary', activeConfig.buttons.tertiary.size);

        setVar('--btn-action-bg', activeConfig.buttons.action.bg);
        setVar('--btn-action-text', activeConfig.buttons.action.text);
        setVar('--btn-action-icon', activeConfig.buttons.action.icon);
        setVar('--btn-action-border', activeConfig.buttons.action.border);
        setVar('--btn-action-border-width', activeConfig.buttons.action.borderWidth || '0px');
        setVar('--btn-action-font-weight', activeConfig.buttons.action.boldText ? '700' : '500');
        setVar('--btn-action-font-weight', activeConfig.buttons.action.boldText ? '700' : '500');
        setButtonDisplay('action', activeConfig.buttons.action.displayMode);
        setButtonSize('action', activeConfig.buttons.action.size);

        setVar('--btn-actionCard-bg', activeConfig.buttons.actionCard.bg);
        setVar('--btn-actionCard-text', activeConfig.buttons.actionCard.text);
        setVar('--btn-actionCard-icon', activeConfig.buttons.actionCard.icon);
        setVar('--btn-actionCard-border', activeConfig.buttons.actionCard.border);
        setVar('--btn-actionCard-border-width', activeConfig.buttons.actionCard.borderWidth || '0px');
        setVar('--btn-actionCard-font-weight', activeConfig.buttons.actionCard.boldText ? '700' : '500');
        setVar('--btn-actionCard-font-weight', activeConfig.buttons.actionCard.boldText ? '700' : '500');
        setButtonDisplay('actionCard', activeConfig.buttons.actionCard.displayMode);
        setButtonSize('actionCard', activeConfig.buttons.actionCard.size);

        // Alerts
        const alertVariants = ['primary', 'secondary', 'success', 'danger'] as const;
        alertVariants.forEach(variant => {
            const settings = activeConfig.alerts[variant];
            setVar(`--alert-${variant}-bg`, settings.bg);
            setVar(`--alert-${variant}-text`, settings.text);
            setVar(`--alert-${variant}-border`, settings.border);
            setVar(`--alert-${variant}-font-weight`, settings.boldText ? '700' : '500');
        });

    }, [customTheme, theme, isInitialized]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const savedMode = localStorage.getItem('layoutMode') as LayoutMode;
        const savedWidth = localStorage.getItem('layoutWidth') as LayoutWidth;
        const savedTheme = localStorage.getItem('theme') as Theme;
        const savedCustomTheme = localStorage.getItem('customTheme');

        const savedVersion = parseInt(localStorage.getItem('themeVersion') || '0', 10);
        const pTheme = savedTheme;

        // If local version is stale, we force update to defaultTheme (Server Config)
        if (themeVersion > savedVersion) {
            localStorage.setItem('customTheme', JSON.stringify(defaultTheme));
            localStorage.setItem('themeVersion', String(themeVersion));
            console.log('Theme configuration updated from server (Version ' + themeVersion + ')');
        }

        if (savedMode) setLayoutModeState(savedMode);
        if (savedWidth) setLayoutWidthState(savedWidth);
        if (pTheme) {
            setThemeState(pTheme);
            if (pTheme === 'dark') document.documentElement.classList.add('dark');
        }



        // Deep merge saved theme with default theme
        if (savedCustomTheme && themeVersion <= savedVersion) {
            try {
                const parsed = JSON.parse(savedCustomTheme);
                // Handle Migration from Old Theme Structure
                if (!parsed.light || !parsed.dark) {
                    // Old structure detected, migrate to light/dark
                    setCustomTheme(prev => {
                        const newLight = { ...prev.light, ...parsed, branding: undefined };
                        // Ensure nested objects (buttons, alerts) are merged, not replaced if missing keys
                        if (parsed.buttons) newLight.buttons = { ...prev.light.buttons, ...parsed.buttons };
                        if (parsed.alerts) newLight.alerts = { ...prev.light.alerts, ...parsed.alerts };

                        const newDark = { ...prev.dark, ...parsed, branding: undefined };
                        if (parsed.buttons) newDark.buttons = { ...prev.dark.buttons, ...parsed.buttons };
                        if (parsed.alerts) newDark.alerts = { ...prev.dark.alerts, ...parsed.alerts };

                        return {
                            ...prev,
                            light: newLight,
                            dark: newDark,
                            branding: { ...prev.branding, ...parsed.branding }
                        };
                    });
                } else {
                    // New structure detected
                    setCustomTheme(prev => {
                        // Deep merge light and dark configs to preserve new keys (like actionCard)
                        return {
                            ...prev,
                            light: {
                                ...prev.light,
                                ...parsed.light,
                                buttons: { ...prev.light.buttons, ...parsed.light?.buttons },
                                alerts: { ...prev.light.alerts, ...parsed.light?.alerts }
                            },
                            dark: {
                                ...prev.dark,
                                ...parsed.dark,
                                buttons: { ...prev.dark.buttons, ...parsed.dark?.buttons },
                                alerts: { ...prev.dark.alerts, ...parsed.dark?.alerts }
                            },
                            branding: { ...prev.branding, ...parsed.branding }
                        };
                    });
                }
            } catch (e) {
                console.error("Failed to parse persisted theme", e);
            }
        }

        setIsInitialized(true);
    }, []);
    // Effect for Favicon (unchanged)
    useEffect(() => {
        if (!isInitialized) return;

        const updateFavicon = () => {
            const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            const faviconUrl = customTheme.branding.favicon;
            if (faviconUrl) {
                link.href = faviconUrl;
                document.getElementsByTagName('head')[0].appendChild(link);
            }
        };
        updateFavicon();
    }, [customTheme.branding.favicon, isInitialized]);

    const setLayoutMode = (mode: LayoutMode) => {
        setLayoutModeState(mode);
        localStorage.setItem('layoutMode', mode);
    };

    const toggleLayoutMode = () => {
        const newMode = layoutMode === 'horizontal' ? 'vertical' : 'horizontal';
        setLayoutMode(newMode);
    };

    const setLayoutWidth = (width: LayoutWidth) => {
        setLayoutWidthState(width);
        localStorage.setItem('layoutWidth', width);
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const updateCustomTheme = (section: keyof ThemeConfig | 'branding', settings: any) => {
        setCustomTheme(prev => {
            if (section === 'branding') {
                return { ...prev, branding: { ...prev.branding, ...settings } };
            }
            // Update the ACTIVE theme config
            const activeMode = theme; // 'light' or 'dark'
            return {
                ...prev,
                [activeMode]: {
                    ...prev[activeMode],
                    [section]: {
                        ...prev[activeMode][section as keyof ThemeConfig],
                        ...settings
                    }
                }
            };
        });
        setHasChanges(true);
    };

    const saveTheme = () => {
        localStorage.setItem('customTheme', JSON.stringify(customTheme));
        // Also save nav items
        localStorage.setItem('navItems', JSON.stringify(navItems));
        setHasChanges(false);
    };

    const resetTheme = () => {
        setCustomTheme(defaultTheme);
        localStorage.removeItem('customTheme');
        setHasChanges(false);
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem('sidebarCollapsed', String(newState));
            return newState;
        });
    };

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = ''; // Required for Chrome
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);


    const handleNavigation = (e: React.MouseEvent, path: string) => {
        if (hasChanges) {
            e.preventDefault();
            setPendingUrl(path);
            setShowUnsavedAlert(true);
        }
    };

    const confirmNavigation = () => {
        setShowUnsavedAlert(false);
        setHasChanges(false);
        if (pendingUrl) {
            router.push(pendingUrl);
            setPendingUrl(null);
        }
    };

    const cancelNavigation = () => {
        setPendingUrl(null);
        setShowUnsavedAlert(false);
    };

    // Mobile Menu State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

    // Dynamic Navigation State
    const [navItems, setNavItems] = useState<NavItem[]>(() => {
        if (typeof window === 'undefined') return initialNavItems;
        const savedNav = localStorage.getItem('navItems');
        if (savedNav) {
            try {
                const parsed = JSON.parse(savedNav);
                // First deduplicate, then restore icons
                const uniqueItems = removeDuplicates(parsed);
                return restoreIcons(uniqueItems);
            } catch (e) {
                console.error("Failed to parse saved nav items", e);
            }
        }
        return initialNavItems;
    });

    const updateNavItems = (newItems: NavItem[]) => {
        // ALWAYS hydrate icons before setting state, because inputs (e.g. from JSON.clone) might lack them.
        // Also deduplicate to prevent key errors
        const uniqueItems = removeDuplicates(newItems);
        const hydratedItems = restoreIcons(uniqueItems);

        setNavItems(hydratedItems);
        // Do NOT save to localStorage yet. Wait for saveTheme().
        // localStorage.setItem('navItems', JSON.stringify(uniqueItems)); 
        setHasChanges(true);
    };

    const resetNavItems = () => {
        setNavItems(initialNavItems);
        localStorage.removeItem('navItems');
        setHasChanges(false);
    };


    if (!isInitialized) return null;

    return (
        <LayoutContext.Provider value={{
            layoutMode, setLayoutMode, toggleLayoutMode,
            layoutWidth, setLayoutWidth,
            theme, setTheme, toggleTheme,
            customTheme, updateCustomTheme, resetTheme, saveTheme,
            hasChanges, setHasChanges,
            isSidebarCollapsed, toggleSidebar,
            // Navigation Interception
            showUnsavedAlert,
            setShowUnsavedAlert,
            handleNavigation,
            pendingUrl,
            confirmNavigation,
            cancelNavigation,
            // Mobile Menu
            isMobileMenuOpen,
            setIsMobileMenuOpen,
            toggleMobileMenu,
            headerActions,
            setHeaderActions,
            headerMenuItems,
            setHeaderMenuItems,
            // Dynamic Page Heading
            pageHeadingContent,
            setPageHeadingContent,
            // Dynamic Nav
            navItems,
            updateNavItems,
            resetNavItems
        }}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayout() {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
}
