'use server';

import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'config', 'theme.ts');

export async function saveThemeConfig(theme: any) {
    try {
        // We will reconstruct the file content. 
        // We assume the structure matches the CustomTheme interface.

        // Helper to stringify object with proper indentation
        const stringify = (obj: any) => JSON.stringify(obj, null, 4);

        const newVersion = Date.now();

        const fileContent = `import { FileText, LayoutDashboard, Users, Building2, Factory, Calculator, Store, CalendarDays, Settings, PieChart, Bell, Briefcase, Circle, Clipboard, Globe, Home, Image, Inbox, Layers, Link, Lock, Mail, Map, MessageSquare, Package, Search, Server, Smartphone, Star, Tag, Terminal, Trash2, Truck, User, Video, Wifi } from 'lucide-react';

export const themeVersion = ${newVersion};

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
    size?: 'small' | 'medium' | 'large';
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
        actionCard: ButtonSettings;
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

export const defaultThemeConfig: ThemeConfig = ${stringify(theme.light)};

export const defaultTheme: CustomTheme = ${stringify(theme)};
`;

        await fs.writeFile(CONFIG_PATH, fileContent, 'utf-8');

        return { success: true };
    } catch (error) {
        console.error('Failed to save theme config:', error);
        return { success: false, message: 'Failed to write theme config file' };
    }
}
