'use server';

import fs from 'fs/promises';
import path from 'path';

export async function createPage(pagePath: string, title: string) {
    if (!pagePath || !title) {
        return { success: false, message: 'Path and Title are required.' };
    }

    // Sanitize path: remove leading/trailing slashes, allow only safe chars
    const sanitizedPath = pagePath.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9\-\/]/gi, '');

    if (!sanitizedPath) {
        return { success: false, message: 'Invalid path.' };
    }

    const fullPath = path.join(process.cwd(), 'app', sanitizedPath);
    const pageFile = path.join(fullPath, 'page.tsx');

    try {
        // Check if directory exists, if not create it
        await fs.mkdir(fullPath, { recursive: true });

        // Check if file already exists
        try {
            await fs.access(pageFile);
            return { success: false, message: 'Page already exists.' };
        } catch {
            // File does not exist, proceed
        }

        const content = `import React from 'react';

export default function Page() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">${title}</h1>
            <div className="p-4 rounded-lg border border-gray-200 bg-white dark:bg-card-bg dark:border-gray-700">
                <p>Welcome to the newly created <strong>${title}</strong> page.</p>
            </div>
        </div>
    );
}
`;

        await fs.writeFile(pageFile, content, 'utf8');
        return { success: true, message: 'Page created successfully.' };

    } catch (error: any) {
        console.error('Error creating page:', error);
        return { success: false, message: `Failed to create page: ${error.message}` };
    }
}

export async function deletePage(pagePath: string) {
    if (!pagePath) {
        return { success: false, message: 'Path is required.' };
    }

    // Sanitize path
    const sanitizedPath = pagePath.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9\-\/]/gi, '');
    if (!sanitizedPath) {
        return { success: false, message: 'Invalid path.' };
    }

    // Safety checks for core paths
    const protectedPaths = ['', 'settings', 'dashboard', 'api'];
    if (protectedPaths.includes(sanitizedPath)) {
        return { success: false, message: 'Cannot delete core system pages.' };
    }

    const fullPath = path.join(process.cwd(), 'app', sanitizedPath);

    try {
        await fs.access(fullPath);
        await fs.rm(fullPath, { recursive: true, force: true });
        return { success: true, message: 'Page deleted successfully.' };
    } catch (error: any) {
        console.error('Error deleting page:', error);
        return { success: false, message: `Failed to delete page: ${error.message}` };
    }
}

export async function getAvailablePages() {
    const appDir = path.join(process.cwd(), 'app');
    const pages: string[] = [];

    async function checkDir(dir: string, base: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                if (entry.name.startsWith('.') || entry.name.startsWith('_') || entry.name === 'api') continue;
                await checkDir(path.join(dir, entry.name), base ? `${base}/${entry.name}` : entry.name);
            } else if (entry.name === 'page.tsx' || entry.name === 'page.js') {
                let route = base ? `/${base}` : '/';
                route = route.replace(/\/\([^)]+\)/g, '');
                if (route === '') route = '/';
                if (!pages.includes(route)) {
                    pages.push(route);
                }
            }
        }
    }

    try {
        await checkDir(appDir, '');
        return { success: true, pages: pages.sort() };
    } catch (error: any) {
        console.error('Error scanning pages:', error);
        return { success: false, message: error.message, pages: [] };
    }
}
