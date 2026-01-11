"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { ActionBar } from "@/components/ui/action-bar";
import { ActionButton } from "@/components/ui/action-button";
import { CompanyModal, CompanyData } from "@/components/companies/CompanyModal";
import { CompanyDetailCard } from "@/components/companies/CompanyDetailCard";
import { Input } from "@/components/ui/input";
import {
    Search,
    ListFilter,
    Settings,
    Plus,
    ExternalLink,
    Pencil,
    Trash2,
    Building2,
    X,
    ArrowUp,
    ArrowDown,
    ChevronsUpDown,
    Download,
    Upload,
    MoreVertical,
    PanelRight,
    Table,
    PencilLine,
    CheckSquare,
    FilePlus
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { exportToCSV, parseCSV } from "@/lib/csv-utils";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

// Mock Data (re-included for completeness)
const companyNames = [
    "TechNova Solutions", "BlueSky Logistics", "Apex Financial", "GreenEarth Energy",
    "Quantum Dynamics", "SilverLine Health", "Urban Architecture", "Fusion Media",
    "Starlight Retail", "Omega Manufacturing", "Pioneer Systems", "Vertex Consulting",
    "Horizon Properties", "Global Ventures", "Nebula Soft", "Rapid Transit",
    "Elite Catering", "Summit Constructions", "Crystal Clear Water", "Dynamic Designs",
    "IronClad Security", "Velocity Motors", "BrightPath Edu", "Zenith Pharma",
    "Echo Communications", "Solaris Power", "Oceanic Shipping", "Peak Performance",
    "Alpha Analytics", "Terra Firms"
];
const owners = [
    "John Smith", "Emily Johnson", "Michael Brown", "Sarah Davis", "David Wilson",
    "Jessica Miller", "Robert Taylor", "Jennifer Anderson", "William Thomas", "Lisa Martinez",
    "Richard Hernandez", "Mary Robinson", "Joseph Clark", "Patricia Rodriguez", "Charles Lewis"
];
const industries = ["Technology", "Logistics", "Finance", "Energy", "Healthcare", "Real Estate", "Manufacturing", "Retail", "Consulting", "Media", "Transportation", "Food & Beverage"];
const services = ["Cloud Services", "Freight Forwarding", "Audit & Tax", "Renewable Energy", "Medical Supplies", "Commercial Leasing", "Prototyping", "E-commerce", "Strategy", "Digital Marketing", "Software Dev", "Catering"];
const cities = ["New York", "San Francisco", "Austin", "Chicago", "Boston", "Seattle", "Denver", "Miami", "Los Angeles", "Atlanta"];
const streets = ["Market St", "Broadway", "Congress Ave", "Michigan Ave", "State St", "Pike St", "16th St", "Ocean Dr", "Sunset Blvd", "Peachtree St"];
const initialsColors = ["bg-red-100 text-red-600", "bg-green-100 text-green-600", "bg-yellow-100 text-yellow-600", "bg-purple-100 text-purple-600", "bg-pink-100 text-pink-600", "bg-indigo-100 text-indigo-600", "bg-blue-100 text-blue-600"];

interface Company {
    id: number | string;
    name: string;
    initials: string;
    colorClass: string;
    owner: string;
    ownerInitials: string;
    emails: { id: string; value: string; type: string; isPrimary: boolean }[];
    phones: { id: string; value: string; type: string; isPrimary: boolean }[];
    addresses: { id: string; value: string; type: string; isPrimary: boolean }[];
    industry: string;
    website: string;
    services: string;
    createdBy: string;
    createdByInitials: string;
    createTimestamp: string;
    editedBy: string;
    editedByInitials: string;
    editTimestamp: string;
    rating: number;
    description: string;
    logo?: string;
}

import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";
import { FilterSheet, FilterConfig, FilterRule } from "@/components/companies/FilterSheet";

export default function CompaniesPage() {
    const { theme } = useTheme();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
    const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Detail card state
    const [detailCardCompany, setDetailCardCompany] = useState<Company | null>(null);
    const [isDetailCardOpen, setIsDetailCardOpen] = useState(false);
    const [isDetailPanelVisible, setIsDetailPanelVisible] = useState(true);

    // Resizing state
    const [sidebarWidth, setSidebarWidth] = useState(66);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Quick Edit state
    const [isQuickEditMode, setIsQuickEditMode] = useState(false);

    const startResizing = React.useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = React.useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = React.useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const newWidth = ((mouseMoveEvent.clientX - containerRect.left) / containerRect.width) * 100;
            if (newWidth > 30 && newWidth < 80) { // Limits: 30% to 80%
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
        } else {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        }
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    // Delete confirmation state
    const [idsToDelete, setIdsToDelete] = useState<(number | string)[]>([]);

    // Filter builders state
    const [filterConfig, setFilterConfig] = useState<FilterConfig>({
        matchType: 'AND',
        rules: []
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({
        key: null,
        direction: null
    });
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search')?.toLowerCase() || "";

    useEffect(() => {
        const data: Company[] = [];
        const generateRandomId = () => Math.floor(10000000 + Math.random() * 90000000);

        const types = {
            email: ["Work", "Personal", "Other"],
            phone: ["Work", "Mobile", "Home", "Other"],
            address: ["Work", "Billing", "Shipping", "Other"]
        };

        const generateMockFields = (baseValue: string, category: 'email' | 'phone' | 'address') => {
            const count = Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 2 : 1; // 30% chance of multiple
            const fields = [];
            for (let i = 0; i < count; i++) {
                let val = baseValue;
                let type = types[category][0]; // Default Work

                if (i > 0) {
                    type = types[category][Math.floor(Math.random() * types[category].length)];
                    if (category === 'email') val = baseValue.replace('@', `${i}@`);
                    if (category === 'phone') val = `555-01${Math.floor(Math.random() * 90) + 10}-${Math.floor(1000 + Math.random() * 9000)}`;
                    if (category === 'address') val = `${Math.floor(Math.random() * 500)} Other St, City`;
                }
                // Ensure one Mobile for variety in Phone
                if (category === 'phone' && i === 0 && Math.random() > 0.5) type = "Mobile";

                fields.push({
                    id: Math.random().toString(36).substr(2, 9),
                    value: val,
                    type: type,
                    isPrimary: i === 0
                });
            }
            return fields;
        };

        for (let i = 0; i < 50; i++) {
            const companyName = companyNames[i % companyNames.length] + (i > 29 ? " " + (Math.floor(i / 30) + 1) : "");
            const owner = owners[i % owners.length];
            const industry = industries[i % industries.length];
            const service = services[i % services.length];
            const city = cities[i % cities.length];
            const street = streets[i % streets.length];
            const createdBy = owners[(i + 3) % owners.length];
            const editedBy = owners[(i + 1) % owners.length];

            const cDate = new Date(2023, i % 12, (i % 28) + 1, 9 + (i % 8), i % 60);
            const eDate = new Date(2024, i % 5, (i % 28) + 1, 9 + (i % 8), i % 60);

            const baseEmail = `contact@${companyName.toLowerCase().replace(/ /g, '').replace(/[0-9]/g, '')}.com`;
            const basePhone = `555-01${(10 + i).toString().padStart(2, '0')}-000${i % 10}`;
            const baseAddress = `${100 + i * 7} ${street}, ${city}`;

            data.push({
                id: generateRandomId(),
                name: companyName,
                initials: companyName.split(' ').slice(0, 2).map(n => n[0]).join(''),
                colorClass: initialsColors[i % initialsColors.length],
                owner: owner,
                ownerInitials: owner.charAt(0),
                emails: generateMockFields(baseEmail, 'email'),
                phones: generateMockFields(basePhone, 'phone'),
                addresses: generateMockFields(baseAddress, 'address'),
                industry: industry,
                website: `www.${companyName.toLowerCase().replace(/ /g, '').replace(/[0-9]/g, '')}.com`,
                services: service,
                createdBy: createdBy,
                createdByInitials: createdBy.charAt(0),
                createTimestamp: cDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + cDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                editedBy: editedBy,
                editedByInitials: editedBy.charAt(0),
                editTimestamp: eDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + eDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                rating: Math.floor(Math.random() * 5) + 1,
                description: `A leading company in the ${industry} sector. Located in ${city}.`
            });
        }
        setCompanies(data);
        setCompanies(data);
    }, []);

    // Default Selection: Select first company on load
    useEffect(() => {
        if (companies.length > 0 && !detailCardCompany) {
            setDetailCardCompany(companies[0]);
        }
    }, [companies, detailCardCompany]);

    const checkRule = (company: Company, rule: FilterRule) => {
        if (!rule.value) return true; // Ignore empty values
        const val = rule.value.toLowerCase();

        // Helper to get field value
        let fieldVal: string | string[] = "";

        switch (rule.field) {
            case 'name': fieldVal = company.name.toLowerCase(); break;
            case 'owner': fieldVal = company.owner; break; // Keep original case for select matching
            case 'industry': fieldVal = company.industry; break;
            case 'createdBy': fieldVal = company.createdBy; break;
            case 'editedBy': fieldVal = company.editedBy; break;
            case 'website': fieldVal = company.website.toLowerCase(); break;
            case 'email': fieldVal = company.emails.map(e => e.value.toLowerCase()); break;
            case 'phone': fieldVal = company.phones.map(p => p.value); break;
            case 'address': fieldVal = company.addresses.map(a => a.value.toLowerCase()); break;
            default: return true;
        }

        const isArray = Array.isArray(fieldVal);

        switch (rule.operator) {
            case 'contains':
                if (isArray) return (fieldVal as string[]).some(v => v.includes(val));
                return (fieldVal as string).includes(val);
            case 'equals':
                if (isArray) return (fieldVal as string[]).some(v => v === val);
                return (fieldVal as string).toLowerCase() === val;
            case 'startsWith':
                if (isArray) return (fieldVal as string[]).some(v => v.startsWith(val));
                return (fieldVal as string).startsWith(val);
            case 'endsWith':
                if (isArray) return (fieldVal as string[]).some(v => v.endsWith(val));
                return (fieldVal as string).endsWith(val);
            case 'is':
                return (fieldVal as string) === rule.value; // Exact match for select
            case 'isNot':
                return (fieldVal as string) !== rule.value;
            default:
                return true;
        }
    };

    const filteredCompanies = React.useMemo(() => {
        let result = companies.filter(company => {
            // 1. Search Query Filter
            const matchesSearch =
                company.name.toLowerCase().includes(searchQuery) ||
                company.owner.toLowerCase().includes(searchQuery) ||
                company.emails.some(e => e.value.toLowerCase().includes(searchQuery)) ||
                company.id.toString().includes(searchQuery);

            if (!matchesSearch) return false;

            // 2. Advanced Filters
            if (filterConfig.rules.length === 0) return true;

            const results = filterConfig.rules.map(rule => checkRule(company, rule));

            if (filterConfig.matchType === 'AND') {
                return results.every(Boolean);
            } else {
                return results.some(Boolean);
            }
        });

        // 3. Sorting
        if (sortConfig.key && sortConfig.direction) {
            result.sort((a, b) => {
                let valA: string | number = '';
                let valB: string | number = '';

                switch (sortConfig.key) {
                    case 'id': valA = a.id; valB = b.id; break;
                    case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
                    case 'owner': valA = a.owner.toLowerCase(); valB = b.owner.toLowerCase(); break;
                    case 'industry': valA = a.industry.toLowerCase(); valB = b.industry.toLowerCase(); break;
                    case 'website': valA = a.website.toLowerCase(); valB = b.website.toLowerCase(); break;
                    case 'services': valA = a.services.toLowerCase(); valB = b.services.toLowerCase(); break;
                    case 'createdBy': valA = a.createdBy.toLowerCase(); valB = b.createdBy.toLowerCase(); break;
                    case 'editedBy': valA = a.editedBy.toLowerCase(); valB = b.editedBy.toLowerCase(); break;
                    case 'createTimestamp': valA = new Date(a.createTimestamp).getTime(); valB = new Date(b.createTimestamp).getTime(); break;
                    case 'editTimestamp': valA = new Date(a.editTimestamp).getTime(); valB = new Date(b.editTimestamp).getTime(); break;
                    case 'email':
                        valA = (a.emails.find(e => e.isPrimary)?.value || a.emails[0]?.value || '').toLowerCase();
                        valB = (b.emails.find(e => e.isPrimary)?.value || b.emails[0]?.value || '').toLowerCase();
                        break;
                    case 'phone':
                        valA = (a.phones.find(p => p.isPrimary)?.value || a.phones[0]?.value || '').replace(/\D/g, '');
                        valB = (b.phones.find(p => p.isPrimary)?.value || b.phones[0]?.value || '').replace(/\D/g, '');
                        break;
                    case 'address':
                        valA = (a.addresses.find(ad => ad.isPrimary)?.value || a.addresses[0]?.value || '').toLowerCase();
                        valB = (b.addresses.find(ad => ad.isPrimary)?.value || b.addresses[0]?.value || '').toLowerCase();
                        break;
                    default: return 0;
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [companies, searchQuery, filterConfig, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const handleExport = () => {
        exportToCSV(filteredCompanies, [
            { header: "ID", accessor: (c) => String(c.id).startsWith('COM') ? String(c.id) : `COM${c.id}` },
            { header: "Company Name", accessor: (c) => c.name },
            { header: "Owner", accessor: (c) => c.owner },
            { header: "Industry", accessor: (c) => c.industry },
            { header: "Website", accessor: (c) => c.website },
            { header: "Services", accessor: (c) => c.services },
            { header: "Emails", accessor: (c) => c.emails.map(e => e.value).join("; ") },
            { header: "Phones", accessor: (c) => c.phones.map(p => p.value).join("; ") },
            { header: "Addresses", accessor: (c) => c.addresses.map(a => a.value).join("; ") },
            { header: "Created By", accessor: (c) => c.createdBy },
            { header: "Created At", accessor: (c) => c.createTimestamp },
            { header: "Edited By", accessor: (c) => c.editedBy },
            { header: "Edited At", accessor: (c) => c.editTimestamp }
        ], "companies_export.csv");
    };

    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                const rows = parseCSV(content);
                // Remove header if present (assume first line is header)
                const dataRows = rows.slice(1);

                const newCompanies: Company[] = [];
                let duplicateCount = 0;

                const existingNames = new Set(companies.map(c => c.name.toLowerCase()));
                const existingIds = new Set(companies.map(c => String(c.id)));

                dataRows.forEach(values => {
                    // Mapping - MUST match Export order
                    if (values.length >= 2) {
                        const [
                            id, name, owner, industry, website, services,
                            emailsStr, phonesStr, addressesStr,
                            createdBy, createdAt, editedBy, editedAt
                        ] = values.map(v => v.trim());

                        const nameClean = (name || "Unknown Company").trim();

                        // DUPLICATE CHECK: Name
                        if (existingNames.has(nameClean.toLowerCase())) {
                            duplicateCount++;
                            return; // Skip this one
                        }

                        // Generate a safe unique ID if imported one clashes or is missing
                        let safeId = id;
                        if (!safeId || existingIds.has(safeId)) {
                            safeId = `COM${Math.floor(Math.random() * 1000000000)}`;
                        }
                        // Add to existing IDs set to prevent internal duplicates in same batch
                        existingIds.add(safeId);
                        existingNames.add(nameClean.toLowerCase());

                        // Helper to parse multi-value fields
                        const parseMultiValue = (str: string) => {
                            const items = str ? str.split(';').map(s => s.trim()).filter(Boolean) : [];
                            if (items.length === 0) return [{ id: Math.random().toString(), value: "", type: "Work", isPrimary: true }];
                            return items.map((val, idx) => ({
                                id: Math.random().toString(),
                                value: val,
                                type: "Work",
                                isPrimary: idx === 0
                            }));
                        };

                        newCompanies.push({
                            id: safeId,
                            name: nameClean,
                            initials: nameClean.substring(0, 2).toUpperCase(),
                            colorClass: "bg-blue-100 text-blue-700", // Default
                            owner: owner || "Unassigned",
                            ownerInitials: (owner || "U").substring(0, 2).toUpperCase(),
                            emails: parseMultiValue(emailsStr),
                            phones: parseMultiValue(phonesStr),
                            addresses: parseMultiValue(addressesStr),
                            industry: industry || "Other",
                            website: website || "",
                            services: services || "",
                            createdBy: createdBy || "Import",
                            createdByInitials: (createdBy || "I").substring(0, 2).toUpperCase(),
                            createTimestamp: createdAt || new Date().toISOString(),
                            editedBy: editedBy || "",
                            editedByInitials: (editedBy || "").substring(0, 2).toUpperCase(),
                            editTimestamp: editedAt || "",
                            rating: 0,
                            description: ""
                        });
                    }
                });

                if (newCompanies.length > 0) {
                    setCompanies(prev => [...prev, ...newCompanies]);
                    alert(`Successfully imported ${newCompanies.length} companies.${duplicateCount > 0 ? `\nSkipped ${duplicateCount} duplicates.` : ''}`);
                } else if (duplicateCount > 0) {
                    alert(`No new companies imported. Skipped ${duplicateCount} duplicates.`);
                }
            }
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = '';
    };

    // Derive unique values for filters
    const uniqueValues = {
        owners: Array.from(new Set(companies.map(c => c.owner))).sort(),
        industries: Array.from(new Set(companies.map(c => c.industry))).sort(),
        creators: Array.from(new Set(companies.map(c => c.createdBy))).sort(),
        editors: Array.from(new Set(companies.map(c => c.editedBy))).sort()
    };

    const toggleSelection = (id: number | string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAll = (visibleIds: (number | string)[]) => {
        if (visibleIds.every(id => selectedIds.includes(id))) {
            // Deselect all visible
            setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
        } else {
            // Select all visible
            const newIds = [...selectedIds];
            visibleIds.forEach(id => {
                if (!newIds.includes(id)) newIds.push(id);
            });
            setSelectedIds(newIds);
        }
    };

    // Generic handler to update company fields (from Quick Edit)
    const handleCompanyUpdate = (id: number | string, field: keyof Company | 'email' | 'phone' | 'address', value: string) => {
        setCompanies(prev => {
            const updatedCompanies = prev.map(c => {
                if (c.id === id) {
                    if (field === 'email') {
                        const newEmails = [...c.emails];
                        const primaryIdx = newEmails.findIndex(e => e.isPrimary);
                        if (primaryIdx !== -1) newEmails[primaryIdx] = { ...newEmails[primaryIdx], value };
                        else if (newEmails.length > 0) newEmails[0] = { ...newEmails[0], value };
                        return { ...c, emails: newEmails };
                    }
                    if (field === 'phone') {
                        const newPhones = [...c.phones];
                        const primaryIdx = newPhones.findIndex(p => p.isPrimary);
                        if (primaryIdx !== -1) newPhones[primaryIdx] = { ...newPhones[primaryIdx], value };
                        else if (newPhones.length > 0) newPhones[0] = { ...newPhones[0], value };
                        return { ...c, phones: newPhones };
                    }
                    if (field === 'address') {
                        const newAddresses = [...c.addresses];
                        const primaryIdx = newAddresses.findIndex(a => a.isPrimary);
                        if (primaryIdx !== -1) newAddresses[primaryIdx] = { ...newAddresses[primaryIdx], value };
                        else if (newAddresses.length > 0) newAddresses[0] = { ...newAddresses[0], value };
                        return { ...c, addresses: newAddresses };
                    }
                    return { ...c, [field]: value };
                }
                return c;
            });

            // Sync Detail Card if needed
            if (detailCardCompany && detailCardCompany.id === id) {
                const updatedCompany = updatedCompanies.find(c => c.id === id);
                if (updatedCompany) setDetailCardCompany(updatedCompany);
            }

            return updatedCompanies;
        });
    };

    // Handle row click to open detail card
    const handleRowClick = (company: Company) => {
        setDetailCardCompany(company);
        setIsDetailCardOpen(true);
    };

    // Handle detail card close
    const handleDetailCardClose = () => {
        setIsDetailCardOpen(false);
        setDetailCardCompany(null);
    };

    const handleDeleteClick = (ids: (number | string)[]) => {
        setIdsToDelete(ids);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setCompanies(prev => prev.filter(c => !idsToDelete.includes(c.id)));
        setSelectedIds(prev => prev.filter(id => !idsToDelete.includes(id)));
        setIdsToDelete([]);
    };

    // Handle saving company from modal
    const handleSaveCompany = (data: CompanyData) => {
        setCompanies(prev => {
            if (data.id) {
                // Update existing
                const updatedCompanies = prev.map(c => c.id === data.id ? {
                    ...c,
                    name: data.name,
                    owner: data.owner,
                    industry: data.industry,
                    website: data.website,
                    services: data.services,
                    logo: data.logo,
                    emails: data.emails,
                    phones: data.phones,
                    addresses: data.addresses
                } : c);

                // Update detail card if it's currently showing this company
                if (detailCardCompany && detailCardCompany.id === data.id) {
                    const updatedCompany = updatedCompanies.find(c => c.id === data.id);
                    if (updatedCompany) {
                        setDetailCardCompany(updatedCompany);
                    }
                }

                return updatedCompanies;
            } else {
                // Create new (mock)
                const newCompany: Company = {
                    id: Math.floor(Math.random() * 1000000),
                    name: data.name,
                    initials: data.name.substring(0, 2).toUpperCase(),
                    colorClass: "bg-blue-100 text-blue-600",
                    owner: data.owner,
                    ownerInitials: data.owner.substring(0, 2).toUpperCase(),
                    emails: data.emails as any,
                    phones: data.phones as any,
                    addresses: data.addresses as any,
                    industry: data.industry,
                    website: data.website,
                    services: data.services,
                    logo: data.logo,
                    createdBy: "CurrentUser",
                    createdByInitials: "CU",
                    createTimestamp: new Date().toLocaleDateString(),
                    editedBy: "CurrentUser",
                    editedByInitials: "CU",
                    editTimestamp: new Date().toLocaleDateString(),
                    rating: 0,
                    description: ""
                };
                return [newCompany, ...prev];
            }
        });
        setIsModalOpen(false);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-transparent relative -mx-6 -my-6">
            {/* Hidden Input for Import */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".csv"
                onChange={handleFileUpload}
            />

            <ActionBar
                title="Companies"
                onExport={handleExport}
                onImport={handleImportClick}
                additionalMenuItems={
                    <>
                        <DropdownMenuItem onSelect={() => setIsDetailPanelVisible(!isDetailPanelVisible)}>
                            <PanelRight className="mr-2 h-4 w-4" />
                            {isDetailPanelVisible ? "Detail Panel On" : "Detail Panel Off"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                }
            >
                {selectedIds.length > 0 && (
                    <ActionButton
                        icon={Trash2}
                        label={`Delete (${selectedIds.length})`}
                        variant="destructive"
                        onClick={() => handleDeleteClick(selectedIds)}
                    />
                )}
                {filterConfig.rules.length > 0 && (
                    <ActionButton
                        icon={X}
                        label="Clear Filters"
                        variant="destructive"
                        onClick={() => setFilterConfig({ matchType: 'AND', rules: [] })}
                    />
                )}

                <ActionButton
                    icon={ListFilter}
                    label={filterConfig.rules.length > 0 ? `Filter (${filterConfig.rules.length})` : "Filter"}
                    variant="outline"
                    className={cn(
                        "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700",
                        filterConfig.rules.length > 0 && "border-2"
                    )}
                    onClick={() => setIsFilterOpen(true)}
                />

                <ActionButton
                    icon={PencilLine}
                    label="Quick Edit"
                    variant="outline"
                    className={cn(
                        "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700",
                        isQuickEditMode && "bg-blue-50 text-blue-600 border-blue-200"
                    )}
                    onClick={() => setIsQuickEditMode(!isQuickEditMode)}
                />

                <ActionButton
                    icon={Plus}
                    label="Add Company"
                    variant="default"
                    className="border-0"
                    onClick={() => {
                        setSelectedCompany(null);
                        setIsModalOpen(true);
                    }}
                />
            </ActionBar>

            <CompanyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCompany}
                initialData={selectedCompany}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                count={idsToDelete.length}
            />

            <FilterSheet
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApply={setFilterConfig}
                initialConfig={filterConfig}
                uniqueValues={uniqueValues}
            />

            <div
                ref={containerRef}
                className={cn(
                    "flex-1 overflow-hidden flex flex-row gap-0 pb-4 px-6 relative",
                    theme.layoutMode === "vertical" ? "pt-24" : "pt-6",
                    isResizing ? "cursor-col-resize select-none" : ""
                )}
            >

                <div
                    className={cn(
                        "flex-none overflow-auto bg-white dark:bg-[#1e2329] rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm relative transition-none", // Transition must be none for smooth dragging
                        !isResizing && "transition-all duration-300 ease-in-out" // Enable transition when not resizing for toggle animation
                    )}
                    style={{
                        width: isDetailPanelVisible ? `${sidebarWidth}%` : '100%'
                    }}
                >
                    <table className="min-w-full border-separate border-spacing-0">
                        <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                            <tr>
                                <th className="sticky top-0 left-0 z-30 px-6 py-3 text-left bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 w-12">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600 h-4 w-4 bg-white dark:bg-slate-700"
                                        checked={filteredCompanies.length > 0 && filteredCompanies.every(c => selectedIds.includes(c.id))}
                                        onChange={() => toggleAll(filteredCompanies.map(c => c.id))}
                                    />
                                </th>
                                <th
                                    className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    onClick={() => requestSort('id')}
                                >
                                    <div className="flex items-center gap-1">
                                        ID
                                        {sortConfig.key === 'id' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                        ) : <ChevronsUpDown className="h-3 w-3 text-slate-300" />}
                                    </div>
                                </th>
                                <th
                                    className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    onClick={() => requestSort('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Company Name
                                        {sortConfig.key === 'name' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                        ) : <ChevronsUpDown className="h-3 w-3 text-slate-300" />}
                                    </div>
                                </th>
                                <th
                                    className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    onClick={() => requestSort('owner')}
                                >
                                    <div className="flex items-center gap-1">
                                        Owner
                                        {sortConfig.key === 'owner' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                        ) : <ChevronsUpDown className="h-3 w-3 text-slate-300" />}
                                    </div>
                                </th>
                                <th
                                    className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    onClick={() => requestSort('email')}
                                >
                                    <div className="flex items-center gap-1">
                                        Email
                                        {sortConfig.key === 'email' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                        ) : <ChevronsUpDown className="h-3 w-3 text-slate-300" />}
                                    </div>
                                </th>
                                <th
                                    className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    onClick={() => requestSort('phone')}
                                >
                                    <div className="flex items-center gap-1">
                                        Phone
                                        {sortConfig.key === 'phone' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                        ) : <ChevronsUpDown className="h-3 w-3 text-slate-300" />}
                                    </div>
                                </th>
                                <th
                                    className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    onClick={() => requestSort('address')}
                                >
                                    <div className="flex items-center gap-1">
                                        Address
                                        {sortConfig.key === 'address' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                        ) : <ChevronsUpDown className="h-3 w-3 text-slate-300" />}
                                    </div>
                                </th>
                                <th
                                    className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    onClick={() => requestSort('industry')}
                                >
                                    <div className="flex items-center gap-1">
                                        Industry Type
                                        {sortConfig.key === 'industry' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                        ) : <ChevronsUpDown className="h-3 w-3 text-slate-300" />}
                                    </div>
                                </th>
                                <th
                                    className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    onClick={() => requestSort('website')}
                                >
                                    <div className="flex items-center gap-1">
                                        Website
                                        {sortConfig.key === 'website' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                        ) : <ChevronsUpDown className="h-3 w-3 text-slate-300" />}
                                    </div>
                                </th>
                                <th
                                    className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    onClick={() => requestSort('services')}
                                >
                                    <div className="flex items-center gap-1">
                                        Services
                                        {sortConfig.key === 'services' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                        ) : <ChevronsUpDown className="h-3 w-3 text-slate-300" />}
                                    </div>
                                </th>
                                <th
                                    className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    onClick={() => requestSort('createdBy')}
                                >
                                    <div className="flex items-center gap-1">
                                        Created By
                                        {sortConfig.key === 'createdBy' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                        ) : <ChevronsUpDown className="h-3 w-3 text-slate-300" />}
                                    </div>
                                </th>
                                <th
                                    className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    onClick={() => requestSort('createTimestamp')}
                                >
                                    <div className="flex items-center gap-1">
                                        Created At
                                        {sortConfig.key === 'createTimestamp' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                        ) : <ChevronsUpDown className="h-3 w-3 text-slate-300" />}
                                    </div>
                                </th>
                                <th
                                    className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    onClick={() => requestSort('editedBy')}
                                >
                                    <div className="flex items-center gap-1">
                                        Edited By
                                        {sortConfig.key === 'editedBy' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                        ) : <ChevronsUpDown className="h-3 w-3 text-slate-300" />}
                                    </div>
                                </th>
                                <th
                                    className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    onClick={() => requestSort('editTimestamp')}
                                >
                                    <div className="flex items-center gap-1">
                                        Edited At
                                        {sortConfig.key === 'editTimestamp' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                        ) : <ChevronsUpDown className="h-3 w-3 text-slate-300" />}
                                    </div>
                                </th>
                                <th className="sticky top-0 right-0 z-30 px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[#1e2329] divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredCompanies.length > 0 ? (
                                filteredCompanies.map((company) => (
                                    <tr
                                        key={company.id}
                                        className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors group cursor-pointer"
                                        onClick={() => handleRowClick(company)}
                                    >
                                        <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1e2329] group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600 h-4 w-4 bg-white dark:bg-slate-700"
                                                checked={selectedIds.includes(company.id)}
                                                onChange={() => toggleSelection(company.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono border-b border-slate-100 dark:border-slate-800">
                                            {String(company.id).startsWith('COM') ? company.id : `COM${company.id}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center">
                                                {company.logo ? (
                                                    <div className="h-8 w-8 rounded-lg mr-3 overflow-hidden">
                                                        <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold mr-3", company.colorClass)}>
                                                        {company.initials}
                                                    </div>
                                                )}
                                                {isQuickEditMode ? (
                                                    <input
                                                        type="text"
                                                        value={company.name}
                                                        onChange={(e) => handleCompanyUpdate(company.id, 'name', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                    />
                                                ) : (
                                                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{company.name}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                                            {isQuickEditMode ? (
                                                <input
                                                    type="text"
                                                    value={company.owner}
                                                    onChange={(e) => handleCompanyUpdate(company.id, 'owner', e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                />
                                            ) : (
                                                company.owner
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border-b border-slate-100 dark:border-slate-800">
                                            {(() => {
                                                const primary = company.emails.find(e => e.isPrimary) || company.emails[0];
                                                const hasMultiple = company.emails.length > 1;

                                                if (isQuickEditMode) {
                                                    return (
                                                        <input
                                                            type="text"
                                                            value={primary?.value || ''}
                                                            onChange={(e) => handleCompanyUpdate(company.id, 'email', e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                        />
                                                    );
                                                }

                                                return (
                                                    <div className="flex items-center gap-2 cursor-pointer hover:underline">
                                                        <div className={cn(
                                                            "h-5 flex items-center justify-center text-[10px] font-bold shrink-0 rounded-full",
                                                            hasMultiple
                                                                ? "w-auto px-1.5 bg-yellow-400 text-yellow-950"
                                                                : "w-5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                                                        )}>
                                                            {hasMultiple && "+"}{primary.type.charAt(0)}
                                                        </div>
                                                        {primary.value}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                            {(() => {
                                                const primary = company.phones.find(p => p.isPrimary) || company.phones[0];
                                                const hasMultiple = company.phones.length > 1;

                                                if (isQuickEditMode) {
                                                    return (
                                                        <input
                                                            type="text"
                                                            value={primary?.value || ''}
                                                            onChange={(e) => handleCompanyUpdate(company.id, 'phone', e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                        />
                                                    );
                                                }

                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "h-5 flex items-center justify-center text-[10px] font-bold shrink-0 rounded-full",
                                                            hasMultiple
                                                                ? "w-auto px-1.5 bg-yellow-400 text-yellow-950"
                                                                : "w-5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                                                        )}>
                                                            {hasMultiple && "+"}{primary.type.charAt(0)}
                                                        </div>
                                                        {primary.value}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 max-w-xs truncate">
                                            {(() => {
                                                const primary = company.addresses.find(a => a.isPrimary) || company.addresses[0];
                                                const hasMultiple = company.addresses.length > 1;

                                                if (isQuickEditMode) {
                                                    return (
                                                        <input
                                                            type="text"
                                                            value={primary?.value || ''}
                                                            onChange={(e) => handleCompanyUpdate(company.id, 'address', e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                        />
                                                    );
                                                }

                                                return (
                                                    <div className="flex items-center gap-2" title={primary.value}>
                                                        <div className={cn(
                                                            "h-5 flex items-center justify-center text-[10px] font-bold shrink-0 rounded-full",
                                                            hasMultiple
                                                                ? "w-auto px-1.5 bg-yellow-400 text-yellow-950"
                                                                : "w-5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                                                        )}>
                                                            {hasMultiple && "+"}{primary.type.charAt(0)}
                                                        </div>
                                                        <span className="truncate">{primary.value}</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap border-b border-slate-100 dark:border-slate-800">
                                            {isQuickEditMode ? (
                                                <input
                                                    type="text"
                                                    value={company.industry}
                                                    onChange={(e) => handleCompanyUpdate(company.id, 'industry', e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                />
                                            ) : (
                                                <span
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent"
                                                    style={{ backgroundColor: theme.badgeBackgroundColor, color: theme.badgeTextColor }}
                                                >
                                                    {company.industry}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border-b border-slate-100 dark:border-slate-800">
                                            {isQuickEditMode ? (
                                                <input
                                                    type="text"
                                                    value={company.website}
                                                    onChange={(e) => handleCompanyUpdate(company.id, 'website', e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                />
                                            ) : (
                                                <a href={`http://${company.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                                    {company.website}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                                            {isQuickEditMode ? (
                                                <input
                                                    type="text"
                                                    value={company.services}
                                                    onChange={(e) => handleCompanyUpdate(company.id, 'services', e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                />
                                            ) : (
                                                <span
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent"
                                                    style={{ backgroundColor: theme.badgeBackgroundColor, color: theme.badgeTextColor }}
                                                >
                                                    {company.services}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-300 font-bold">
                                                    {company.createdByInitials}
                                                </div>
                                                {company.createdBy}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-mono border-b border-slate-100 dark:border-slate-800">
                                            {company.createTimestamp}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-300 font-bold">
                                                    {company.editedByInitials}
                                                </div>
                                                {company.editedBy}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-mono border-b border-slate-100 dark:border-slate-800">
                                            {company.editTimestamp}
                                        </td>
                                        <td className="sticky right-0 z-10 px-6 py-4 whitespace-nowrap border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1e2329] group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    title="Edit"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const companyData: CompanyData = {
                                                            id: company.id,
                                                            name: company.name,
                                                            owner: company.owner,
                                                            industry: company.industry.toLowerCase(),
                                                            website: company.website.replace(/^https?:\/\//, '').replace(/^www\./, ''),
                                                            services: company.services,
                                                            emails: company.emails,
                                                            phones: company.phones,
                                                            addresses: company.addresses,
                                                            logo: company.logo // Include logo
                                                        };
                                                        setSelectedCompany(companyData);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-5 w-5" />
                                                </button>
                                                <button
                                                    className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    title="View Details"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRowClick(company);
                                                    }}
                                                >
                                                    <Building2 className="h-5 w-5" />
                                                </button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                                            <MoreVertical className="h-5 w-5" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* TODO: Implement Create Task */ }}>
                                                            <CheckSquare className="mr-2 h-4 w-4" />
                                                            Create Task
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* TODO: Implement Upload Document */ }}>
                                                            <FilePlus className="mr-2 h-4 w-4" />
                                                            Upload Document
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 dark:text-red-400"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteClick([company.id]);
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={15} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-[#1e2329]">
                                        <div className="flex flex-col items-center justify-center">
                                            <Search className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                                            <p className="text-lg font-medium">No results found</p>
                                            <p className="text-sm">No companies match "{searchQuery}"</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="bg-white dark:bg-[#1e2329] border-t border-slate-200 dark:border-slate-700 p-3 text-xs font-medium text-slate-500 dark:text-slate-400 sticky bottom-0 z-30">
                        Showing {filteredCompanies.length} of {companies.length} Results
                    </div>
                </div>

                {/* Drag Handle */}
                {isDetailPanelVisible && (
                    <div
                        className="w-2 mx-1 cursor-col-resize z-50 flex items-center justify-center self-center h-full group flex-none"
                        onMouseDown={startResizing}
                    >
                        <div className="w-1 h-12 bg-slate-200 dark:bg-slate-700 rounded-full group-hover:bg-blue-500 transition-colors" />
                    </div>
                )}

                {/* Right Panel - Detail Inspector */}
                <div className={cn(
                    "hidden overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2329] shadow-sm",
                    isDetailPanelVisible ? "lg:flex flex-1 min-w-0" : "hidden"
                )}>
                    <CompanyDetailCard
                        company={detailCardCompany!}
                        isOpen={true}
                        onClose={handleDetailCardClose}
                    />
                </div>

            </div>
        </div>
    );
}
