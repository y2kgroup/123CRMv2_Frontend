import {
    LayoutDashboard,
    Users,
    Building2,
    Factory,
    Calculator,
    Store,
    CalendarDays,
    Settings
} from 'lucide-react';

export const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard, description: 'Overview of your activities' },
    { label: 'Companies', href: '/companies', icon: Building2, description: 'Partner and client organizations' },
    {
        label: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'Application configuration',
        children: [
            { label: 'Theme Customizer', href: '/settings/theme', icon: Settings }
        ]
    },
];
