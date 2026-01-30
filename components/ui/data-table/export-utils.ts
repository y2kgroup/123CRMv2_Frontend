
import Papa from 'papaparse';

/**
 * Exports table data to a CSV file, handling complex objects like arrays of emails/phones.
 * @param data The table data array (rows).
 * @param filename The desired filename for the downloaded CSV.
 * @param columns Optional array of column configurations to filter and label the export.
 */
export const exportTableToCSV = (data: any[], filename: string = 'export.csv', columns?: { id: string; label: string }[]) => {
    if (!data || data.length === 0) {
        alert("No data to export.");
        return;
    }

    // Pre-process data to flatten complex objects
    const cleanData = data.map(row => {
        const newRow: any = { ...row };

        Object.keys(newRow).forEach(key => {
            const val = newRow[key];

            // 1. Array handling (likely Emails, Phones, Addresses, or Multi-Selects)
            if (Array.isArray(val)) {
                // Check if it's an array of objects with 'value' property (standard CRM field structure)
                const hasValueProp = val.length > 0 && typeof val[0] === 'object' && val[0] !== null && 'value' in val[0];

                if (hasValueProp) {
                    // Extract values and join them
                    // Prioritize 'primary' if needed, but for export we usually want all of them.
                    // Let's semicolon separate them.
                    newRow[key] = val.map((v: any) => v.value).join('; ');
                } else {
                    // Simple array of strings/numbers
                    newRow[key] = val.join('; ');
                }
            }
            // 2. Single Object handling (if any remain)
            else if (typeof val === 'object' && val !== null) {
                // If it looks like a value object
                if ('value' in val) {
                    newRow[key] = val.value;
                } else {
                    // Fallback to JSON stringify so it's not [object Object]
                    newRow[key] = JSON.stringify(val);
                }
            }
        });

        return newRow;
    });

    let finalData = cleanData;

    // Filter by columns if provided
    if (columns && columns.length > 0) {
        finalData = cleanData.map(row => {
            const filteredRow: any = {};
            columns.forEach(col => {
                // Skip 'select' and 'actions' columns usually, but let the caller decide what they pass.
                if (col.id === 'select' || col.id === 'actions') return;

                // Use the label as the key (header) if available, otherwise ID
                // PapaParse uses keys as headers
                // Also handle cases where row[col.id] might be missing (undefined)
                // Note: The flattened data is in `row`, possibly under plural names (emails) or singular (email).
                // The column ID usually matches the data key.

                // Special handling: if column ID is 'email' but data is in 'emails', we might miss it if we strictly look for row['email'].
                // In 123CRM, the column ID usually matches the data key (e.g. 'emails' column shows 'emails' data).
                // But for standard fields, the data might have both.
                // If the column ID is 'emails', we take row['emails'].

                filteredRow[col.label || col.id] = row[col.id];
            });
            return filteredRow;
        });
    }

    const csv = Papa.unparse(finalData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
