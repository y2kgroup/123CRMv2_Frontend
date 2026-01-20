import {
    Factory,
} from 'lucide-react';

export const navItems = [
    { label: 'Dashboard', href: '/', description: 'Overview of your activities' },
    { label: 'Companies', href: '/companies', description: 'Partner and client organizations' },
    { label: 'Settings', href: '/settings', description: 'Application configuration', children: [
        { label: 'Theme Customizer', href: '/settings/theme' }
    ] },
    { label: 'Templates', href: '/templates', icon: Factory, children: [
        { label: 'Data Table & Detail Card', href: '/templates/data-table-and-detail-card', icon: Factory, iconName: 'Factory' }
    ], iconName: 'Factory' },
];
