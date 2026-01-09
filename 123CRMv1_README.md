# CRM Application

A modern CRM application built with Next.js 14, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Linting:** ESLint

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
123CRMv1/
├── app/                  # App Router directory
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── public/              # Static assets
├── node_modules/        # Dependencies
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── postcss.config.mjs   # PostCSS configuration
├── next.config.js       # Next.js configuration
└── .eslintrc.json       # ESLint configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

# Development Session Summary

**Session 1**  
**Start Date:** January 6, 2026  
**Start Time:** ~6:00 PM EST  
**End Time:** January 7, 2026 - 11:05 AM EST  

---

## 1. Dashboard Architecture Refactoring
- **Component Splitting**: Refactored the monolithic `page.tsx` into modular components (`AdminDashboard`, `ManagerDashboard`, `UserDashboard`) for better maintainability.
- **Shared Components**: Created reusable UI components including `DashboardHeader`, `StatCard`, `RecentActivity`, and `RevenueChart`.
- **Role-Based Access Control (RBAC)**: Implemented role-based rendering logic to display specific dashboards based on the user's role (Admin, Manager, User).

## 2. Layout & Theme System
- **Theme Context**: Enhanced `ThemeContext` to support robust state management for:
  - **Layout Modes**: Vertical Sidebar vs. Horizontal Navigation.
  - **Color Schemes**: Light vs. Dark mode with persistence.
  - **Content Width**: Boxed vs. Fluid layouts.
  - **Sidebar State**: Collapsed/Expanded states with persistence.
- **Global Constraints**: Enforced `html, body { height: 100%; overflow: hidden; }` in `globals.css` to eliminate page-level scrolling issues.
- **LayoutWrapper**: Completely restructured the main layout engine to handle scrolling internally, ensuring fixed headers and action bars across all views.

## 3. UI/UX Improvements
- **Theme Customizer Page**: Built a comprehensive settings page (`/settings/theme`) allowing users to toggle menus, colors, and layout preferences with live previews.
- **User Menu Updates**: 
  - Added quick toggles for **Dark/Light Mode** and **Vertical/Horizontal Layout** directly in the top-right user dropdown.
  - Removed deprecated "Settings" and "Preferences" links.
- **Navigation**:
  - **Vertical Mode**: Fixed `SidebarVertical` to handle collapsing correctly and restored branding text.
  - **Horizontal Mode**: Implemented `HorizontalActionBar` and content spacing fixes to ensure seamless navigation.

## 4. Critical Bug Fixes
- **Double-Scrolling Resolved**: Eliminated the issue where both the page body and content area would scroll. Now, only the content area scrolls.
- **Fixed Positioning**: Solved z-index and overlap issues where the Action Bar would cover content. Implemented conditional padding (`pt-24`) to handle layout differences dynamically.
- **Visual Gaps**: Removed erratic whitespace and layout gaps in both vertical and horizontal modes.

## 5. Technical Stack Updates
- **Dependencies**: Integrated `lucide-react` for modern, consistent iconography.
- **Utilities**: Added `cn` (clsx + tailwind-merge) utility for cleaner conditional class rendering.

---

**Session 2**  
**Start Date:** January 7, 2026  
**Start Time:** 11:05 PM EST  
**End Date:** January 8, 2026  
**End Time:** 12:07 AM EST  

---

## 1. Company Detail Page - Flexible Tile Layout System

### Core Features Implemented
- **Drag-and-Drop Grid Layout**: Integrated `@dnd-kit` library to enable sortable, draggable tiles on the Company Detail page
- **Dynamic Tile Resizing**: Added width and height controls for each tile with preset options:
  - **Width Options**: 1/4 (3 cols), 1/3 (4 cols), 1/2 (6 cols), 2/3 (8 cols), Full Width (12 cols)
  - **Height Options**: Auto, Compact (300px), Standard (500px), Tall (975px)
- **Edit Mode Toggle**: Implemented "Edit Layout" button to enable/disable tile customization
- **Responsive Grid**: Built on Tailwind's 12-column grid system with breakpoint support

### Components Created/Modified
- **`SortableWidget.tsx`**: New wrapper component providing drag handles, resize controls, and edit mode UI
- **`AboutCard.tsx`**: Company information card with proper flex layout for internal scrolling
- **`TasksCard.tsx`**: Task list with checkbox interactions and scrollable content
- **`NotesCard.tsx`**: Notes display with add note functionality and scrollable list
- **`FilesCard.tsx`**: File list with type icons and download actions
- **`app/companies/detail/page.tsx`**: Main detail page with layout state management and DnD context

### Layout & Scrolling Architecture
- **Fixed Tile Heights**: Implemented mode-specific default heights to prevent page scrolling:
  - **Vertical Mode**: 975px default height
  - **Horizontal Mode**: 925px default height
- **Internal Scrolling**: Each card uses `flex flex-col` with `overflow-y-auto` on content areas
- **Viewport Constraints**: Outer container uses `h-full flex flex-col` to fill viewport without overflow
- **Spacing Consistency**: Matched padding (`pt-6 pb-6`) across both layout modes for uniform appearance

### State Management
- **Widget Configuration**: Each tile stores `id`, `colSpan`, and `heightClass` in state
- **Drag-and-Drop Handlers**: `handleDragEnd` updates widget order using `arrayMove`
- **Resize Handlers**: `handleResize` updates individual tile dimensions
- **Persistent Layout**: Layout configuration stored in component state (ready for localStorage integration)

### Mock Data Enhancements
- **Expanded Notes**: Added 8 sample notes (up from 2) to demonstrate scrolling functionality
- **Realistic Content**: Tasks, files, and notes populated with business-relevant sample data

### UI/UX Refinements
- **Edit Mode Visual Feedback**: 
  - Tiles show resize and drag controls when edit mode is active
  - Dashed border and reduced opacity indicate editable state
  - Smooth transitions between edit and view modes
- **Responsive Behavior**: Grid collapses to single column on mobile, expands to 4 columns on xl screens
- **Accessibility**: Proper ARIA labels and keyboard navigation support via `@dnd-kit`

### Technical Improvements
- **TypeScript Interfaces**: Strongly typed `WidgetConfig`, `Task`, `Note`, and `FileItem` interfaces
- **Component Composition**: Clean separation of concerns with dedicated card components
- **Performance**: Optimized re-renders using React state and memoization where needed

### Bug Fixes
- **Height Control Implementation**: Fixed missing `heightClass` prop in `SortableWidget` component
- **Syntax Errors**: Resolved JSX closing tag issues during layout restructuring
- **Spacing Issues**: Corrected top padding in vertical mode to match other pages
- **Scroll Behavior**: Ensured tiles scroll internally rather than causing page-level scrolling

### Files Modified
1. `/app/companies/detail/page.tsx` - Main detail page with flexible grid
2. `/components/features/companies/SortableWidget.tsx` - Drag-and-drop wrapper
3. `/components/features/companies/AboutCard.tsx` - Company info card
4. `/components/features/companies/TasksCard.tsx` - Task list card
5. `/components/features/companies/NotesCard.tsx` - Notes card with scrolling
6. `/components/features/companies/FilesCard.tsx` - File list card

### Next Steps (Not Implemented)
- LocalStorage persistence for layout preferences
- Backend API integration for tasks, notes, and files
- Additional tile types (timeline, contacts, deals)
- Export/import layout configurations
- User-specific layout preferences

---
