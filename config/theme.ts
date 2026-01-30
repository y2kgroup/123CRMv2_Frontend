import { FileText, LayoutDashboard, Users, Building2, Factory, Calculator, Store, CalendarDays, Settings, PieChart, Bell, Briefcase, Circle, Clipboard, Globe, Home, Image, Inbox, Layers, Link, Lock, Mail, Map, MessageSquare, Package, Search, Server, Smartphone, Star, Tag, Terminal, Trash2, Truck, User, Video, Wifi } from 'lucide-react';

export const themeVersion = 1769748861518;

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

export const defaultThemeConfig: ThemeConfig = {
    "header": {
        "bg": "#405189",
        "text": "#FFFFFF",
        "icon": "#FFFFFF",
        "boldText": true
    },
    "horizontalNav": {
        "bg": "#FFFFFF",
        "text": "#2563EB",
        "icon": "#2563EB",
        "activeBorder": "#FFFFFF",
        "activeText": "#2563EB",
        "activeBackground": "#DDE8FD",
        "activeBorderThickness": "1px",
        "displayMode": "both",
        "menuAlignment": "left",
        "boldText": false,
        "dropdown": {
            "bg": "#FFFFFF",
            "text": "#2563EB",
            "icon": "#6B7280",
            "border": "#E5E7EB",
            "borderWidth": "1px",
            "bold": false,
            "activeBackground": "#F3F4F6",
            "triggerMode": "click"
        }
    },
    "verticalNav": {
        "bg": "#405189",
        "text": "#FFFFFF",
        "icon": "#FFFFFF",
        "displayMode": "both",
        "boldText": false
    },
    "footer": {
        "bg": "#405189",
        "text": "#FFFFFF",
        "icon": "#6F6772",
        "boldText": true
    },
    "buttons": {
        "primary": {
            "bg": "#D5F2EE",
            "text": "#059669",
            "icon": "#059669",
            "border": "#ffffff",
            "displayMode": "both",
            "boldText": true,
            "borderWidth": "3px",
            "size": "medium"
        },
        "secondary": {
            "bg": "#FEF2E0",
            "text": "#D97706",
            "icon": "#D97706",
            "border": "#ffffff",
            "displayMode": "both",
            "boldText": true,
            "borderWidth": "3px",
            "size": "medium"
        },
        "tertiary": {
            "bg": "#FDE5ED",
            "text": "#DC2626",
            "icon": "#DC2626",
            "border": "#ffffff",
            "displayMode": "both",
            "boldText": true,
            "borderWidth": "3px",
            "size": "medium"
        },
        "action": {
            "bg": "#ffffff",
            "text": "#2563EB",
            "icon": "#2563EB",
            "border": "#ffffff",
            "displayMode": "icon",
            "boldText": false,
            "borderWidth": "1px",
            "size": "medium"
        },
        "actionCard": {
            "bg": "#DDE8FD",
            "text": "#2563EB",
            "icon": "#2563EB",
            "border": "#2563EB",
            "displayMode": "both",
            "boldText": false,
            "borderWidth": "1px",
            "size": "medium"
        }
    },
    "alerts": {
        "primary": {
            "bg": "#EEF2FF",
            "text": "#3730A3",
            "border": "#ffffff",
            "boldText": false
        },
        "secondary": {
            "bg": "#FEF2E0",
            "text": "#D97706",
            "border": "#ffffff",
            "boldText": false
        },
        "success": {
            "bg": "#ECFDF5",
            "text": "#065F46",
            "border": "#ffffff",
            "boldText": false
        },
        "danger": {
            "bg": "#FEF2F2",
            "text": "#991B1B",
            "border": "#ffffff",
            "boldText": false
        }
    }
};

export const defaultTheme: CustomTheme = {
    "light": {
        "header": {
            "bg": "#405189",
            "text": "#FFFFFF",
            "icon": "#FFFFFF",
            "boldText": true
        },
        "horizontalNav": {
            "bg": "#FFFFFF",
            "text": "#2563EB",
            "icon": "#2563EB",
            "activeBorder": "#FFFFFF",
            "activeText": "#2563EB",
            "activeBackground": "#DDE8FD",
            "activeBorderThickness": "1px",
            "displayMode": "both",
            "menuAlignment": "left",
            "boldText": false,
            "dropdown": {
                "bg": "#FFFFFF",
                "text": "#2563EB",
                "icon": "#6B7280",
                "border": "#E5E7EB",
                "borderWidth": "1px",
                "bold": false,
                "activeBackground": "#F3F4F6",
                "triggerMode": "click"
            }
        },
        "verticalNav": {
            "bg": "#405189",
            "text": "#FFFFFF",
            "icon": "#FFFFFF",
            "displayMode": "both",
            "boldText": false
        },
        "footer": {
            "bg": "#405189",
            "text": "#FFFFFF",
            "icon": "#6F6772",
            "boldText": true
        },
        "buttons": {
            "primary": {
                "bg": "#D5F2EE",
                "text": "#059669",
                "icon": "#059669",
                "border": "#ffffff",
                "displayMode": "both",
                "boldText": true,
                "borderWidth": "3px",
                "size": "medium"
            },
            "secondary": {
                "bg": "#FEF2E0",
                "text": "#D97706",
                "icon": "#D97706",
                "border": "#ffffff",
                "displayMode": "both",
                "boldText": true,
                "borderWidth": "3px",
                "size": "medium"
            },
            "tertiary": {
                "bg": "#FDE5ED",
                "text": "#DC2626",
                "icon": "#DC2626",
                "border": "#ffffff",
                "displayMode": "both",
                "boldText": true,
                "borderWidth": "3px",
                "size": "medium"
            },
            "action": {
                "bg": "#ffffff",
                "text": "#2563EB",
                "icon": "#2563EB",
                "border": "#ffffff",
                "displayMode": "icon",
                "boldText": false,
                "borderWidth": "1px",
                "size": "medium"
            },
            "actionCard": {
                "bg": "#DDE8FD",
                "text": "#2563EB",
                "icon": "#2563EB",
                "border": "#2563EB",
                "displayMode": "both",
                "boldText": false,
                "borderWidth": "1px",
                "size": "medium"
            }
        },
        "alerts": {
            "primary": {
                "bg": "#EEF2FF",
                "text": "#3730A3",
                "border": "#ffffff",
                "boldText": false
            },
            "secondary": {
                "bg": "#FEF2E0",
                "text": "#D97706",
                "border": "#ffffff",
                "boldText": false
            },
            "success": {
                "bg": "#ECFDF5",
                "text": "#065F46",
                "border": "#ffffff",
                "boldText": false
            },
            "danger": {
                "bg": "#FEF2F2",
                "text": "#991B1B",
                "border": "#ffffff",
                "boldText": false
            }
        }
    },
    "dark": {
        "header": {
            "bg": "#212529",
            "text": "#ced4da",
            "icon": "#ced4da",
            "boldText": false
        },
        "horizontalNav": {
            "bg": "#212529",
            "text": "#ced4da",
            "icon": "#ced4da",
            "activeBorder": "#405189",
            "activeText": "#ffffff",
            "activeBackground": "#405189",
            "activeBorderThickness": "3px",
            "displayMode": "both",
            "menuAlignment": "center",
            "boldText": false,
            "dropdown": {
                "bg": "#1F2937",
                "text": "#F3F4F6",
                "icon": "#9CA3AF",
                "border": "#374151",
                "borderWidth": "1px",
                "bold": false,
                "activeBackground": "#374151",
                "triggerMode": "click"
            }
        },
        "verticalNav": {
            "bg": "#212529",
            "text": "#ced4da",
            "icon": "#ced4da",
            "displayMode": "both",
            "boldText": false,
            "activeBackground": "#405189",
            "activeText": "#ffffff"
        },
        "footer": {
            "bg": "#212529",
            "text": "#adb5bd",
            "icon": "#adb5bd",
            "boldText": false
        },
        "buttons": {
            "primary": {
                "bg": "#405189",
                "text": "#ffffff",
                "icon": "#ffffff",
                "border": "#405189",
                "displayMode": "both",
                "boldText": true,
                "borderWidth": "1px",
                "size": "medium"
            },
            "secondary": {
                "bg": "#3577f1",
                "text": "#ffffff",
                "icon": "#ffffff",
                "border": "#3577f1",
                "displayMode": "both",
                "boldText": true,
                "borderWidth": "1px",
                "size": "medium"
            },
            "tertiary": {
                "bg": "#299cdb",
                "text": "#ffffff",
                "icon": "#ffffff",
                "border": "#299cdb",
                "displayMode": "both",
                "boldText": true,
                "borderWidth": "1px",
                "size": "medium"
            },
            "action": {
                "bg": "#2c3034",
                "text": "#ced4da",
                "icon": "#ced4da",
                "border": "#343a40",
                "displayMode": "icon",
                "boldText": false,
                "borderWidth": "1px",
                "size": "medium"
            },
            "actionCard": {
                "bg": "#2c3034",
                "text": "#ced4da",
                "icon": "#ced4da",
                "border": "#343a40",
                "displayMode": "both",
                "boldText": false,
                "borderWidth": "1px",
                "size": "medium"
            }
        },
        "alerts": {
            "primary": {
                "bg": "#405189",
                "text": "#ffffff",
                "border": "#405189",
                "boldText": true
            },
            "secondary": {
                "bg": "#3577f1",
                "text": "#ffffff",
                "border": "#3577f1",
                "boldText": true
            },
            "success": {
                "bg": "#0ab39c",
                "text": "#ffffff",
                "border": "#0ab39c",
                "boldText": true
            },
            "danger": {
                "bg": "#f06548",
                "text": "#ffffff",
                "border": "#f06548",
                "boldText": true
            }
        }
    },
    "branding": {
        "logoLight": "",
        "logoDark": "",
        "logoCollapsedLight": "",
        "logoCollapsedDark": "",
        "favicon": ""
    }
};
