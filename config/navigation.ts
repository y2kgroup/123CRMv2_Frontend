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
    { label: 'Contacts', href: '/contacts', icon: Users, description: 'Manage your address book' },
    { label: 'Companies', href: '/companies', icon: Building2, description: 'Partner and client organizations' },
    { label: 'Production', href: '/production', icon: Factory, description: 'Monitor production lines' },
    { label: 'Accounting', href: '/accounting', icon: Calculator, description: 'Financial records and reports' },
    { label: 'Vendors', href: '/vendors', icon: Store, description: 'Manage external suppliers' },
    { label: 'Calendar', href: '/calendar', icon: CalendarDays, description: 'Schedule and events' },
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
