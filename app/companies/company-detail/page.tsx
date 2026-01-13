'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useLayout } from '@/components/layout/LayoutContext';
import { Globe, Building2, Pencil, Check, Settings, ArrowLeft } from 'lucide-react';

// Sub Components
import { AboutCard } from '@/components/companies/detail/AboutCard';
import { TasksCard } from '@/components/companies/detail/TasksCard';
import { NotesCard } from '@/components/companies/detail/NotesCard';
import { FilesCard } from '@/components/companies/detail/FilesCard';
import { DraggableTile } from '@/components/companies/detail/DraggableTile';

// Layout Configuration Interface
interface TileConfig {
    id: string;
    colSpan: number;
    heightMode: 'compact' | 'standard' | 'tall';
}

const DEFAULT_LAYOUT: TileConfig[] = [
    { id: 'about', colSpan: 1, heightMode: 'standard' },
    { id: 'tasks', colSpan: 1, heightMode: 'standard' },
    { id: 'notes', colSpan: 1, heightMode: 'standard' },
    { id: 'files', colSpan: 1, heightMode: 'standard' },
];

// Helper to generate consistent mock data based on ID (replicates CompaniesPage logic)
const getCompanyData = (id: string | null) => {
    if (!id) return null;

    const idNum = parseInt(id.replace('COM', '')) || 0;
    const index = idNum - 10000000;

    // Safety check if index is way out of bounds or negative
    if (index < 0) return {
        id: id,
        name: 'Unknown Company',
        owner: 'Unknown',
        industry: 'Technology',
        website: 'example.com',
        services: [],
        email: 'contact@example.com',
        phone: '',
        address: ''
    };

    return {
        id: id,
        name: index < 5 ? ['Acme Corp', 'Globex Corporation', 'Soylent Corp', 'Initech', 'Umbrella Corp'][index] : `Company ${index + 1}`,
        owner: index < 5 ? ['John Doe', 'Jane Smith', 'Harry Green', 'Peter Gibbons', 'Albert Wesker'][index] : `Owner ${index + 1}`,
        industry: index < 5 ? ['Technology', 'Manufacturing', 'Food & Beverage', 'Software', 'Pharmaceuticals'][index] : 'Technology',
        website: `www.company${index + 1}.com`,
        services: ['Service A', 'Service B'],
        email: `contact@company${index + 1}.com`,
        phone: `+1 555-01${(index + 1).toString().padStart(2, '0')}`,
        address: `${index * 10} Market St, City, ST`,
    };
};

export default function DetailPage() {
    const router = useRouter();
    const { setPageHeadingContent, setHeaderActions, setHeaderMenuItems } = useLayout();
    const searchParams = useSearchParams();
    const companyId = searchParams.get('id');
    const [company, setCompany] = useState<any>(null);

    const [isEditMode, setIsEditMode] = useState(false);
    const [tiles, setTiles] = useState<TileConfig[]>(DEFAULT_LAYOUT);

    // Load Company Data
    useEffect(() => {
        const data = getCompanyData(companyId);
        // Fallback default if no ID provided, just so page isn't empty during dev
        if (!data) {
            setCompany({
                id: 'COM10000000',
                name: 'TechNova Solutions',
                owner: 'John Smith',
                industry: 'Technology',
                website: 'technovasolutions.com',
                services: ['Software Development', 'Consulting'],
                email: 'contact@technovasolutions.com',
                phone: '+1 555-0110',
                address: '123 Innovation Dr, San Francisco, CA 94105'
            });
        } else {
            setCompany(data);
        }
    }, [companyId]);

    // Persist layout
    useEffect(() => {
        const savedLayout = localStorage.getItem('companyDetailLayout_v4');
        if (savedLayout) {
            try {
                setTiles(JSON.parse(savedLayout));
            } catch (e) { console.error("Failed to load layout", e) }
        }
    }, []);

    const saveLayout = () => {
        localStorage.setItem('companyDetailLayout_v4', JSON.stringify(tiles));
        setIsEditMode(false);
    };

    // Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Logic for Drag End
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setTiles((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Logic for Config Change
    const handleConfigChange = (id: string, newConfig: { colSpan: number, heightMode: 'compact' | 'standard' | 'tall' }) => {
        setTiles(prev => prev.map(tile => {
            if (tile.id === id) {
                return { ...tile, ...newConfig };
            }
            return tile;
        }));
    };

    // Set Header Content (Dynamic)
    useEffect(() => {
        if (!company) return;

        const initials = company.name.substring(0, 2).toUpperCase();

        setPageHeadingContent(
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/companies')}
                    className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-300">
                    {initials}
                </div>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{company.name}</h1>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {company.industry}</span>
                        <span className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer"><Globe className="w-3 h-3" /> {company.website}</span>
                    </div>
                </div>
            </div>
        );

        // Menu Actions - Dynamic based on Edit Mode
        if (isEditMode) {
            // In Edit Mode: Show "Done Editing"
            setHeaderMenuItems(
                <DropdownMenuItem
                    onClick={saveLayout}
                    className="cursor-pointer font-medium text-green-600 focus:text-green-700 focus:bg-green-50"
                >
                    <Check className="w-4 h-4 mr-2" />
                    Done Editing
                </DropdownMenuItem>
            );
        } else {
            // In View Mode: Show "Edit Page Layout"
            setHeaderMenuItems(
                <DropdownMenuItem
                    onClick={() => setIsEditMode(true)}
                    className="cursor-pointer"
                >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Page Layout
                </DropdownMenuItem>
            );
        }

        return () => {
            setPageHeadingContent(null);
            setHeaderActions(null);
            setHeaderMenuItems(null);
        };
    }, [setPageHeadingContent, setHeaderActions, setHeaderMenuItems, isEditMode, tiles, company]);

    const renderTileContent = (id: string) => {
        switch (id) {
            case 'about': return <AboutCard company={company} />;
            case 'tasks': return <TasksCard />;
            case 'notes': return <NotesCard />;
            case 'files': return <FilesCard />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950/50 px-6 pb-6 pt-0 gap-6 overflow-y-auto">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={tiles.map(t => t.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start pb-0">
                        {tiles.map((tile) => (
                            <DraggableTile
                                key={tile.id}
                                id={tile.id}
                                colSpan={tile.colSpan}
                                heightMode={tile.heightMode}
                                isEditMode={isEditMode}
                                onConfigChange={(cfg) => handleConfigChange(tile.id, cfg)}
                            >
                                {renderTileContent(tile.id)}
                            </DraggableTile>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
