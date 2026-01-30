import {
    Clipboard,
    Factory,
    FileText,
    Home,
} from 'lucide-react';

export const navItems = [
    { label: 'Settings', href: '/settings', description: 'Application configuration', children: [
        { label: 'Theme Customizer', href: '/settings/theme' }
    ] },
    { label: 'Templates', href: '/templates', icon: Factory, children: [
        { label: 'Data Table & Detail Card', href: '/templates/data-table-and-detail-card', icon: Factory, iconName: 'Factory' }
    ], iconName: 'Factory' },
    { label: 'Tasks', href: '/tasks', icon: Clipboard, iconName: 'Clipboard' },
    { label: 'Notes', href: '/notes', icon: FileText, iconName: 'FileText' },
    { label: 'CRM', href: '/crm', icon: Home, children: [
        { label: 'Customers', href: '/crm/customers', icon: FileText, iconName: 'FileText' },
        { label: 'Vendors', href: '/crm/vendors', icon: FileText, iconName: 'FileText' },
        { label: 'Projects', href: '/crm/projects', icon: FileText, iconName: 'FileText' }
    ], iconName: 'Home' },
];
