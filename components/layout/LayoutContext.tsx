'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

export interface MenuSettings extends ColorSettings {
    activeBorder?: string;
    activeText?: string;
    activeBackground?: string;
    activeBorderThickness?: string;
    displayMode: 'icon' | 'text' | 'both';
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
        boldText: true
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
        ...defaultThemeConfig,
        horizontalNav: {
            ...defaultThemeConfig.horizontalNav,
            bg: '#1e1e2d', text: '#FFFFFF', icon: '#FFFFFF',
            activeBackground: '#2a2a3c',
            activeText: '#FFFFFF'
        },
        buttons: {
            ...defaultThemeConfig.buttons, // Buttons usually stay same or adapt slightly
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
        setVar('--h-nav-font-weight', activeConfig.horizontalNav.boldText ? '700' : '500');

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
            cancelNavigation
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
