'use server';

import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'config', 'navigation.ts');

export async function saveNavigationConfig(items: any[]) {
    try {
        // 1. Collect all unique icons
        const iconSet = new Set<string>();

        const collectIcons = (list: any[]) => {
            list.forEach(item => {
                if (item.iconName) {
                    iconSet.add(item.iconName);
                }
                if (item.children) {
                    collectIcons(item.children);
                }
            });
        };
        collectIcons(items);

        const uniqueIcons = Array.from(iconSet).sort();

        // 2. Build Import Statement
        let fileContent = `import {\n`;
        uniqueIcons.forEach(icon => {
            if (icon) fileContent += `    ${icon},\n`;
        });
        // Always include basic ones if needed or rely on list
        fileContent += `} from 'lucide-react';\n\n`;

        // 3. Recursive helper to stringify items but keep icon references as variables
        const stringifyItem = (item: any, indent: string = '    '): string => {
            const props = [];

            // Allow arbitrary props, but specifically handle known ones
            // Label
            props.push(`label: '${item.label.replace(/'/g, "\\'")}'`);

            // Href
            if (item.href) props.push(`href: '${item.href}'`);

            // Icon (Variable reference)
            if (item.iconName) {
                props.push(`icon: ${item.iconName}`);
            }

            // Description (Optional)
            if (item.description) {
                props.push(`description: '${item.description.replace(/'/g, "\\'")}'`);
            }

            // Children
            if (item.children && item.children.length > 0) {
                const childrenStr = item.children.map((child: any) => stringifyItem(child, indent + '    ')).join(',\n' + indent + '    ');
                props.push(`children: [\n${indent}    ${childrenStr}\n${indent}]`);
            }

            // Preserve iconName for future restoration
            if (item.iconName) {
                props.push(`iconName: '${item.iconName}'`);
            }

            return `{ ${props.join(', ')} }`;
        };

        // 4. Build config array
        fileContent += `export const navItems = [\n`;
        items.forEach(item => {
            fileContent += `    ${stringifyItem(item)},\n`;
        });
        fileContent += `];\n`;

        // 5. Write to file
        await fs.writeFile(CONFIG_PATH, fileContent, 'utf-8');

        return { success: true };
    } catch (error) {
        console.error('Failed to save navigation config:', error);
        return { success: false, message: 'Failed to write config file' };
    }
}
