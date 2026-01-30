import {
    Building2,
    Clipboard,
    Factory,
    FileText,
    Home,
    Layers,
    Users,
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
        { label: 'Contacts', href: '/crm/contacts-v1-0', icon: Users, iconName: 'Users' },
        { label: 'Companies', href: '/crm/companies-v1-0', icon: Building2, iconName: 'Building2' },
        { label: 'Projects', href: '/crm/projects-v1-0', icon: Layers, iconName: 'Layers' },
        { label: 'Vendors', href: '/crm/vendors', icon: FileText, iconName: 'FileText' }
    ], iconName: 'Home' },
];
