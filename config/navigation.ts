import {
    Clipboard,
    Factory,
    Home,
} from 'lucide-react';

export const navItems = [
    {
        label: 'Settings', href: '/settings', description: 'Application configuration', children: [
            { label: 'Theme Customizer', href: '/settings/theme' }
        ]
    },
    {
        label: 'Templates', href: '/templates', icon: Factory, children: [
            { label: 'Data Table & Detail Card', href: '/templates/data-table-and-detail-card', icon: Factory, iconName: 'Factory' }
        ], iconName: 'Factory'
    },
    { label: 'Tasks', href: '/tasks', icon: Clipboard, iconName: 'Clipboard' },
    { label: 'CRM', href: '/crm', icon: Home, iconName: 'Home' },
];
