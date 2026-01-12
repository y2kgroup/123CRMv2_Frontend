'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';

type LayoutMode = 'horizontal' | 'vertical';
type LayoutWidth = 'full' | 'boxed';
type Theme = 'light' | 'dark';

export interface ColorSettings {
    bg: string;
    text: string;
    icon: string;
    border?: string;
    boldText?: boolean;
}

export interface DropdownSettings {
    bg: string;
    text: string;
    icon: string;
    border: string;
    borderWidth?: string;
    bold?: boolean;
    activeBackground?: string;
    triggerMode?: 'click' | 'hover';
}

export interface MenuSettings extends ColorSettings {
    activeBorder?: string;
    activeText?: string;
    activeBackground?: string;
    activeBorderThickness?: string;
    displayMode: 'icon' | 'text' | 'both';
    menuAlignment?: 'left' | 'center' | 'right';
    dropdown?: DropdownSettings;
}

export interface ButtonSettings {
    bg: string;
    text: string;
    icon: string;
    border: string;
    borderWidth?: string;
    displayMode?: 'icon' | 'text' | 'both';
    boldText?: boolean;
}

export interface AlertSettings {
    bg: string;
    text: string;
    border: string;
    boldText?: boolean;
}


export interface ThemeConfig {
    header: ColorSettings;
    horizontalNav: MenuSettings;
    verticalNav: MenuSettings;
    footer: ColorSettings;
    buttons: {
        primary: ButtonSettings;
        secondary: ButtonSettings;
        tertiary: ButtonSettings;
        action: ButtonSettings;
    };
    alerts: {
        primary: AlertSettings;
        secondary: AlertSettings;
        success: AlertSettings;
        danger: AlertSettings;
    };
}

export interface CustomTheme {
    light: ThemeConfig;
    dark: ThemeConfig;
    branding: {
        logoLight: string;
        logoDark: string;
        logoCollapsedLight: string;
        logoCollapsedDark: string;
        favicon: string;
    };
}

const defaultThemeConfig: ThemeConfig = {
    header: { bg: '#405189', text: '#FFFFFF', icon: '#FFFFFF', boldText: true },
    horizontalNav: {
        bg: '#FFFFFF', text: '#2563EB', icon: '#2563EB',
        activeBorder: '#2563EB', activeText: '#2563EB',
        activeBackground: '#DDE8FD',
        activeBorderThickness: '3px',
        displayMode: 'both',
        menuAlignment: 'center',
        boldText: true,
        dropdown: {
            bg: '#FFFFFF',
            text: '#1F2937', // gray-800
            icon: '#6B7280', // gray-500
            border: '#E5E7EB', // gray-200
            borderWidth: '1px',
            bold: false,
            activeBackground: '#F3F4F6', // gray-100
            triggerMode: 'click'
        }
    },
    verticalNav: {
        bg: '#405189', text: '#FFFFFF', icon: '#FFFFFF',
        displayMode: 'both',
        boldText: true
    },
    footer: { bg: '#405189', text: '#FFFFFF', icon: '#6F6772', boldText: true },
    buttons: {
        primary: { bg: '#D5F2EE', text: '#059669', icon: '#059669', border: '#10B981', displayMode: 'both', boldText: true, borderWidth: '3px' },
        secondary: { bg: '#FEF2E0', text: '#D97706', icon: '#D97706', border: '#D97706', displayMode: 'both', boldText: true, borderWidth: '3px' },
        tertiary: { bg: '#FDE5ED', text: '#DC2626', icon: '#DC2626', border: '#DC2626', displayMode: 'both', boldText: true, borderWidth: '3px' },
        action: { bg: '#DDE8FD', text: '#2563EB', icon: '#2563EB', border: '#2563EB', displayMode: 'icon', boldText: false, borderWidth: '1px' }
    },
    alerts: {
        primary: { bg: '#EEF2FF', text: '#3730A3', border: '#E0E7FF', boldText: true },
        secondary: { bg: '#FEF2E0', text: '#D97706', border: '#DBEAFE', boldText: true },
        success: { bg: '#ECFDF5', text: '#065F46', border: '#D1FAE5', boldText: true },
        danger: { bg: '#FEF2F2', text: '#991B1B', border: '#FEE2E2', boldText: true }
    }
};

const defaultTheme: CustomTheme = {
    light: defaultThemeConfig,
    dark: {
        header: { bg: '#212529', text: '#ced4da', icon: '#ced4da', boldText: false },
        horizontalNav: {
            bg: '#212529', text: '#ced4da', icon: '#ced4da',
            activeBorder: '#405189', activeText: '#ffffff',
            activeBackground: '#405189',
            activeBorderThickness: '3px',
            displayMode: 'both',
            menuAlignment: 'center',
            boldText: false,
            dropdown: {
                bg: '#1F2937', // gray-800
                text: '#F3F4F6', // gray-100
                icon: '#9CA3AF', // gray-400
                border: '#374151', // gray-700
                borderWidth: '1px',
                bold: false,
                activeBackground: '#374151', // gray-700
                triggerMode: 'click'
            }
        },
        verticalNav: {
            bg: '#212529', text: '#ced4da', icon: '#ced4da',
            displayMode: 'both',
            boldText: false,
            // Add active states for vertical nav if needed by interface, though currently Sidebar uses simple highlighting
            activeBackground: '#405189', activeText: '#ffffff'
        },
        footer: { bg: '#212529', text: '#adb5bd', icon: '#adb5bd', boldText: false },
        buttons: {
            primary: { bg: '#405189', text: '#ffffff', icon: '#ffffff', border: '#405189', displayMode: 'both', boldText: true, borderWidth: '1px' },
            secondary: { bg: '#3577f1', text: '#ffffff', icon: '#ffffff', border: '#3577f1', displayMode: 'both', boldText: true, borderWidth: '1px' },
            tertiary: { bg: '#299cdb', text: '#ffffff', icon: '#ffffff', border: '#299cdb', displayMode: 'both', boldText: true, borderWidth: '1px' },
            action: { bg: '#2c3034', text: '#ced4da', icon: '#ced4da', border: '#343a40', displayMode: 'icon', boldText: false, borderWidth: '1px' }
        },
        alerts: {
            primary: { bg: '#405189', text: '#ffffff', border: '#405189', boldText: true },
            secondary: { bg: '#3577f1', text: '#ffffff', border: '#3577f1', boldText: true },
            success: { bg: '#0ab39c', text: '#ffffff', border: '#0ab39c', boldText: true },
            danger: { bg: '#f06548', text: '#ffffff', border: '#f06548', boldText: true }
        }
    },
    branding: {
        logoLight: '',
        logoDark: '',
        logoCollapsedLight: '',
        logoCollapsedDark: '',
        favicon: ''
    }
};

import { navItems as initialNavItems } from '@/config/navigation';

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
    // Dynamic Nav
    navItems: any[];
    updateNavItems: (items: any[]) => void;
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

    // Apply CSS Variables
    useEffect(() => {
        const root = document.documentElement;
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

        setVar('--btn-primary-bg', activeConfig.buttons.primary.bg);
        setVar('--btn-primary-text', activeConfig.buttons.primary.text);
        setVar('--btn-primary-icon', activeConfig.buttons.primary.icon);
        setVar('--btn-primary-border', activeConfig.buttons.primary.border);
        setVar('--btn-primary-border-width', activeConfig.buttons.primary.borderWidth || '1px');
        setVar('--btn-primary-font-weight', activeConfig.buttons.primary.boldText ? '700' : '500');
        setButtonDisplay('primary', activeConfig.buttons.primary.displayMode);

        setVar('--btn-secondary-bg', activeConfig.buttons.secondary.bg);
        setVar('--btn-secondary-text', activeConfig.buttons.secondary.text);
        setVar('--btn-secondary-icon', activeConfig.buttons.secondary.icon);
        setVar('--btn-secondary-border', activeConfig.buttons.secondary.border);
        setVar('--btn-secondary-border-width', activeConfig.buttons.secondary.borderWidth || '1px');
        setVar('--btn-secondary-font-weight', activeConfig.buttons.secondary.boldText ? '700' : '500');
        setButtonDisplay('secondary', activeConfig.buttons.secondary.displayMode);

        setVar('--btn-tertiary-bg', activeConfig.buttons.tertiary.bg);
        setVar('--btn-tertiary-text', activeConfig.buttons.tertiary.text);
        setVar('--btn-tertiary-icon', activeConfig.buttons.tertiary.icon);
        setVar('--btn-tertiary-border', activeConfig.buttons.tertiary.border);
        setVar('--btn-tertiary-border-width', activeConfig.buttons.tertiary.borderWidth || '1px');
        setVar('--btn-tertiary-font-weight', activeConfig.buttons.tertiary.boldText ? '700' : '500');
        setButtonDisplay('tertiary', activeConfig.buttons.tertiary.displayMode);

        setVar('--btn-action-bg', activeConfig.buttons.action.bg);
        setVar('--btn-action-text', activeConfig.buttons.action.text);
        setVar('--btn-action-icon', activeConfig.buttons.action.icon);
        setVar('--btn-action-border', activeConfig.buttons.action.border);
        setVar('--btn-action-border-width', activeConfig.buttons.action.borderWidth || '0px');
        setVar('--btn-action-font-weight', activeConfig.buttons.action.boldText ? '700' : '500');
        setButtonDisplay('action', activeConfig.buttons.action.displayMode);

        // Alerts
        const alertVariants = ['primary', 'secondary', 'success', 'danger'] as const;
        alertVariants.forEach(variant => {
            const settings = activeConfig.alerts[variant];
            setVar(`--alert-${variant}-bg`, settings.bg);
            setVar(`--alert-${variant}-text`, settings.text);
            setVar(`--alert-${variant}-border`, settings.border);
            setVar(`--alert-${variant}-font-weight`, settings.boldText ? '700' : '500');
        });

    }, [customTheme, theme]);

    useEffect(() => {
        const savedMode = localStorage.getItem('layoutMode') as LayoutMode;
        const savedWidth = localStorage.getItem('layoutWidth') as LayoutWidth;
        const savedTheme = localStorage.getItem('theme') as Theme;
        const savedCustomTheme = localStorage.getItem('customTheme');

        if (savedMode) setLayoutModeState(savedMode);
        if (savedWidth) setLayoutWidthState(savedWidth);
        if (savedTheme) {
            setThemeState(savedTheme);
            if (savedTheme === 'dark') document.documentElement.classList.add('dark');
        }

        // Deep merge saved theme with default theme
        if (savedCustomTheme) {
            try {
                const parsed = JSON.parse(savedCustomTheme);
                // Handle Migration from Old Theme Structure
                if (!parsed.light || !parsed.dark) {
                    // Old structure detected, migrate to light/dark
                    setCustomTheme(prev => ({
                        ...prev,
                        light: { ...prev.light, ...parsed, branding: undefined }, // Apply old rules to light
                        dark: { ...prev.dark, ...parsed, branding: undefined }, // Apply old rules to dark as well (as a baseline)
                        branding: { ...prev.branding, ...parsed.branding }
                    }));
                } else {
                    setCustomTheme(prev => ({
                        ...prev,
                        ...parsed
                    }));
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
        setShowUnsavedAlert(false);
        setPendingUrl(null);
    };

    // Mobile Menu State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

    // Dynamic Navigation State
    const [navItems, setNavItems] = useState<any[]>(initialNavItems);

    // Persist navItems changes (optional, or just keep in state for session)
    // For now, let's persist to localStorage so edits survive refresh, similar to theme
    useEffect(() => {
        const savedNav = localStorage.getItem('navItems');
        if (savedNav) {
            try {
                const parsed = JSON.parse(savedNav);

                // Helper to find original icon
                const findOriginalIcon = (href: string, list: any[]): any => {
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
                const restoreIcons = (items: any[]): any[] => {
                    return items.map((item: any) => {
                        const originalIcon = findOriginalIcon(item.href, initialNavItems);
                        // Use original icon, or FileText for new pages, or keep existing if it somehow survived (unlikely from JSON)
                        const Icon = originalIcon || FileText;

                        return {
                            ...item,
                            icon: Icon,
                            children: item.children ? restoreIcons(item.children) : undefined
                        };
                    });
                };

                setNavItems(restoreIcons(parsed));
            } catch (e) {
                console.error("Failed to parse saved nav items", e);
            }
        }
    }, []);

    const updateNavItems = (newItems: any[]) => {
        setNavItems(newItems);
        localStorage.setItem('navItems', JSON.stringify(newItems));
        setHasChanges(true); // Treat as a change that might need saving if we were doing a bulk save, but here we save immediately to LS. 
        // However, 'hasChanges' usually triggers the "Unsaved Changes" alert. 
        // If we save to LS immediately, maybe we don't need 'hasChanges'?
        // The existing pattern for theme is 'updateCustomTheme' -> 'setHasChanges(true)'.
        // Let's follow that pattern if we want a "Save" button, or just save immediately.
        // The user asked to "control" them. 
        // Let's stick to immediate persistence for now or follow the pattern. 
        // Actually, the existing theme uses explicit 'saveTheme'. 
        // Let's make 'updateNavItems' just update state and setHasChanges, 
        // and include navItems in 'saveTheme' if we want unified saving, 
        // OR just autosave for now to simplify.
        // Given "Save" button exists in settings, maybe better to loop it in.
        // But 'saveTheme' currently only saves 'customTheme'.
        // Let's keep it simple: Autosave nav items for now to avoid refactoring save logic too much.
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
