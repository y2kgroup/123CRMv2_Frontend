
import React, { useMemo, useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragMoveEvent,
    DragEndEvent,
    DropAnimation,
    DragOverEvent,
    Modifier,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronRight, CornerDownRight, Trash2, X, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// --- Types ---
export interface MenuItem {
    label: string;
    href: string;
    icon?: any;
    iconName?: string; // Add iconName as optional
    children?: MenuItem[];
    // For internal use
    id?: string;
}

interface FlattenedItem extends MenuItem {
    parentId: string | null;
    depth: number;
    index: number;
    id: string; // Ensure id is always string
}

interface SortableItemProps {
    item: FlattenedItem;
    onRemove: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    depth: number;
    indentationWidth: number;
    style?: React.CSSProperties;
}

// --- Utilities ---

function flatten(
    items: MenuItem[],
    parentId: string | null = null,
    depth = 0,
    // Add seenIds to track unique keys during this flattening pass
    seenIds: Set<string> = new Set()
): FlattenedItem[] {
    // If this is the top level call (depth 0), we use the provided set or a new one.
    // Since this is recursive, we need to pass the SAME set instance down.
    // The initial call from component should probably handle this better, 
    // but here we can manage it by assuming if we are at root, we might reset?
    // Actually, reduce is cleaner if we just wrap it. But let's assume the recursive calls pass it.

    return items.reduce<FlattenedItem[]>((acc, item, index) => {
        // Generate a stable ID if not present. Ideally, href + label
        let id = item.id || `${item.href}-${item.label}`;

        // Ensure uniqueness for this pass
        let uniqueId = id;
        let counter = 1;
        while (seenIds.has(uniqueId)) {
            uniqueId = `${id}-${counter}`;
            counter++;
        }
        seenIds.add(uniqueId);

        const flattenedItem: FlattenedItem = {
            ...item,
            parentId,
            depth,
            index,
            id: uniqueId,
            children: undefined, // internal representation doesn't need children array
        };
        return [
            ...acc,
            flattenedItem,
            ...flatten(item.children || [], uniqueId, depth + 1, seenIds),
        ];
    }, []);
}

function buildTree(flattenedItems: FlattenedItem[]): MenuItem[] {
    const root: MenuItem[] = [];
    const map: Record<string, MenuItem> = {};

    // First pass: Create unique objects for all items
    flattenedItems.forEach((item) => {
        // Reconstruct the original item object
        // Note: We deliberately drop 'parentId', 'depth', 'index' but KEEP 'id' for persistence
        const { parentId, depth, index, children, ...rest } = item;
        map[item.id] = { ...rest, children: [] }; // Initialize children
    });

    // Second pass: Link them up
    flattenedItems.forEach((item) => {
        const node = map[item.id];
        if (item.parentId === null) {
            root.push(node);
        } else {
            const parent = map[item.parentId];
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(node);
            } else {
                // If parent not found (shouldn't happen in valid state), fallback to root
                root.push(node);
            }
        }
    });

    return root;
}

// --- Constants ---
const INDENTATION_WIDTH = 40;

// --- Sortable Item Component ---

function SortableItem({ item, onRemove, onDelete, onEdit, depth, indentationWidth, style }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const appliedStyle: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        marginLeft: `${item.depth * indentationWidth}px`,
        ...style,
    };

    return (
        <div
            ref={setNodeRef}
            style={appliedStyle}
            className={cn(
                "relative flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mb-2 group",
                isDragging && "opacity-50 z-50 shadow-xl ring-2 ring-blue-500/20"
            )}
        >
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="cursor-grab hover:text-blue-500 text-gray-400">
                <GripVertical className="w-5 h-5" />
            </div>

            {/* Indentation Guide (Visual only) */}
            {item.depth > 0 && (
                <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 text-gray-300">
                    <CornerDownRight className="w-4 h-4" />
                </div>
            )}

            {/* Icon (if exists) */}
            {item.icon && (
                <div className="text-gray-500 dark:text-gray-400">
                    {/* Render icon if it's a component, or just a placeholder if needed */}
                    {React.isValidElement(item.icon) ? item.icon : <item.icon className="w-4 h-4" />}
                </div>
            )}

            {/* Label & Path */}
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{item.label}</div>
                <div className="text-xs text-gray-500 truncate font-mono">{item.href}</div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Edit Button */}
                <button
                    type="button"
                    onClick={() => onEdit(item.id)}
                    style={{ color: '#3b82f6' }} // Blue
                    className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    title="Edit Page"
                >
                    <Pencil className="w-4 h-4" />
                </button>
                {/* Simple Remove (from menu) */}
                <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    style={{ color: '#f59e0b' }} // Amber
                    className="p-1 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded"
                    title="Remove from Menu"
                >
                    <X className="w-4 h-4" />
                </button>
                {/* Detailed delete logic is handled by parent */}
                <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    style={{ color: '#ef4444' }} // Red
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-2" // Added margin-left for separation if requested "move all the way to right"
                    title="Permanently Delete Page"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// --- Main Component ---

interface MenuBuilderProps {
    items: MenuItem[];
    onUpdate: (items: MenuItem[]) => void;
    onRemoveItem: (item: MenuItem) => void;
    onDeleteItem: (item: MenuItem) => void;
    onEditItem: (item: MenuItem) => void;
}

export function MenuBuilder({ items, onUpdate, onRemoveItem, onDeleteItem, onEditItem }: MenuBuilderProps) {
    // We manage the "flattened" state internally for DnD
    const [activeId, setActiveId] = useState<string | null>(null);

    // Memoize flattened items. 
    // IMPORTANT: We need local state for the flat items to allow immediate updates during drag
    // But prop 'items' is the source of truth.
    // We'll sync local state when 'items' prop changes externally (e.g. adding new page),
    // but during drag, we ignore prop updates or handle them carefully.
    // Actually, 'buildTree' converts flat -> nested, so we can just rely on parent 'onUpdate' if it's fast enough.
    // But usually DnD needs optimistic UI.
    // Let's derive initial state from props, but keep local state for formatting.

    // However, `useMemo` of props -> flat might cause re-renders resetting drag.
    // We should maintain `flatItems` in state, and update parent `onUpdate(buildTree(flatItems))` only on dragEnd.

    // Initializer
    const [flatItems, setFlatItems] = useState<FlattenedItem[]>(() => flatten(items));

    // Sync if parent updates `items` (e.g. adding a new page from the other tab)
    // We need to be careful not to overwrite local drag state.
    // Simple check: if activeId is null, we can sync.
    const isDragging = activeId !== null;

    // To avoid infinite loops or conflicts, we'll use a `useEffect` that updates `flatItems` ONLY if
    // the 'structure' changed externally and we aren't dragging.
    // Comparing deep equality is expensive.
    // Instead, we can assume parent `items` is authoritative.
    // But if `MenuBuilder` calls `onUpdate`, parent updates `items`, which triggers this effect...
    // It's a loop unless we break it. 
    // Standard pattern: Controlled component. `items` passed in. We treat `items` as source.
    // BUT `dnd-kit` requires stable state during drag.
    // We will flatten `items` in render? No, sorting logic needs the array properly ordered.

    // Let's allow `MenuBuilder` to be fully controlled.
    // We flatten `items` every render.
    const flatState = useMemo(() => flatten(items), [items]);

    // Wait, if we use `flatState` directly from props, `setFlatItems` (local optimisitc update) becomes tricky.
    // We need to calculate the new tree `onDragEnd` and call `onUpdate`.
    // `dnd-kit` needs us to return the *projected* state during drag for smooth visuals?
    // No, usually we just calculate the new order/depth on DragEnd. 
    // But to show "realtime" nesting changes, we need local state.

    // Let's use local state `localItems` initialized from `items`.
    // onPropChange: sync `localItems`.
    React.useEffect(() => {
        if (!activeId) {
            setFlatItems(flatten(items));
        }
    }, [items, activeId]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragMove = (event: DragMoveEvent) => {
        // Only needed if we want to visualize depth changes during drag?
        // For now, simple reorder.
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over, delta } = event;
        setActiveId(null);

        // If dropped outside
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Clone current items
        const newItems = [...flatItems];
        const activeIndex = newItems.findIndex((i) => i.id === activeId);
        const overIndex = newItems.findIndex((i) => i.id === overId);

        // Calculate new depth based on drag delta (horizontal)
        // dnd-kit delta.x
        // Each INDENTATION_WIDTH pixels moved right = +1 depth
        const activeItem = newItems[activeIndex];

        // Determine new depth
        // Ideally we project this: `projectedDepth = current + Math.round(delta.x / INDENTATION_WIDTH)`
        // Constrained by:
        // 1. Min depth: 0
        // 2. Max depth: PrevItem.depth + 1 (cannot be deeper than previous item's child)
        let projectedDepth = activeItem.depth + Math.round(delta.x / INDENTATION_WIDTH);

        if (activeId !== overId) {
            // Moved to a new position verticaly
            // We use arrayMove to get the new vertical order first
            const reordered = arrayMove(newItems, activeIndex, overIndex);

            // Now we validate the depth at the new position
            // Re-find indices after move
            const newActiveIndex = overIndex;
            const prevItem = reordered[newActiveIndex - 1];
            const nextItem = reordered[newActiveIndex + 1];

            // Constraint: Min depth 0
            if (projectedDepth < 0) projectedDepth = 0;

            // Constraint: Max depth
            // Can only be +1 deep relative to previous item
            const maxDepth = prevItem ? prevItem.depth + 1 : 0;
            if (projectedDepth > maxDepth) projectedDepth = maxDepth;

            // Update the item
            reordered[newActiveIndex] = {
                ...reordered[newActiveIndex],
                depth: projectedDepth,
                // ParentID will be recalculated
            };

            // Recalculate parentIds for the whole list based on depths?
            // It's easier to just rebuild safely.
            // Logic: for each item, parent is the closest preceding item with depth = item.depth - 1
            const finalLinear = recalculateParents(reordered);

            // Build tree and update parent
            const newTree = buildTree(finalLinear);
            onUpdate(newTree); // Update parent/server

        } else {
            // Just horizontal move (indent/outdent) without changing vertical index?
            // Or drag ended in same spot.
            if (delta.x === 0) return;

            // Apply depth change locally
            const reordered = [...newItems];
            const prevItem = reordered[activeIndex - 1];

            if (projectedDepth < 0) projectedDepth = 0;
            const maxDepth = prevItem ? prevItem.depth + 1 : 0;
            if (projectedDepth > maxDepth) projectedDepth = maxDepth;

            reordered[activeIndex] = { ...activeItem, depth: projectedDepth };

            const finalLinear = recalculateParents(reordered);
            const newTree = buildTree(finalLinear);
            onUpdate(newTree);
        }
    };

    const recalculateParents = (list: FlattenedItem[]): FlattenedItem[] => {
        // Stack to keep track of potential parents
        // lastAtDepth[d] = item
        const lastAtDepth: Record<number, string> = {};

        return list.map(item => {
            // If depth is 0, parent is null
            if (item.depth === 0) {
                lastAtDepth[0] = item.id;
                return { ...item, parentId: null };
            }

            // Parent is last item seen at depth-1
            const simpleParentId = lastAtDepth[item.depth - 1];
            // Update current depth tracker
            lastAtDepth[item.depth] = item.id;

            return { ...item, parentId: simpleParentId || null };
        });
    };

    const activeItem = activeId ? flatItems.find((i) => i.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        // animation
        >
            <SortableContext items={flatItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {flatItems.map((item) => (
                        <SortableItem
                            key={item.id}
                            item={item}
                            depth={item.depth}
                            indentationWidth={INDENTATION_WIDTH}
                            onRemove={(id) => {
                                const toRemove = flatItems.find(i => i.id === id);
                                if (toRemove) onRemoveItem(toRemove);
                            }}
                            onDelete={(id) => {
                                const toDel = flatItems.find(i => i.id === id);
                                if (toDel) onDeleteItem(toDel);
                            }}
                            onEdit={(id) => {
                                const toEdit = flatItems.find(i => i.id === id);
                                if (toEdit) onEditItem(toEdit);
                            }}
                        />
                    ))}
                </div>
            </SortableContext>

            <DragOverlay dropAnimation={null}>
                {activeItem ? (
                    <SortableItem
                        item={activeItem}
                        depth={activeItem.depth} // Keep original depth during drag
                        indentationWidth={INDENTATION_WIDTH}
                        onRemove={() => { }}
                        onDelete={() => { }}
                        onEdit={() => { }}
                        style={{ opacity: 1 }}
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
