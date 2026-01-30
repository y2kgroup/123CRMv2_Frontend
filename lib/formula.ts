/**
 * Formula Evaluation Utility
 * 
 * Provides safe evaluation of user-defined formulas with support for:
 * - Mathematical operations (+, -, *, /, etc.)
 * - String concatenation
 * - Cross-table references via dot notation (e.g. {orders.total})
 * - Aggregation of One-to-Many relationships
 */

export interface FormulaContext {
    row: Record<string, any>;
    // Future: Add global variables or other context here
}

/**
 * Safely evaluates a formula string against a row context.
 * 
 * @param formula The user-defined formula string (e.g., "{price} * {qty}")
 * @param row The data object for the current row
 * @returns The calculated result (number or string) or null/error string
 */
export function evaluateFormula(formula: string, row: Record<string, any>): string | number | null {
    if (!formula) return null;

    try {
        // Pre-process: Sanitize smart quotes to normal quotes
        const sanitizedFormula = formula
            .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
            .replace(/[\u201C\u201D]/g, '"'); // Smart double quotes

        // 1. Parse tokens: Find all value references wrapped in {}
        // Updated regex: Matches {anything inside} except braces
        // This supports IDs with spaces like {First Name}
        const tokenRegex = /\{([^{}]+)\}/g;
        const tokens = new Set<string>();
        let match;

        while ((match = tokenRegex.exec(sanitizedFormula)) !== null) {
            tokens.add(match[1]);
        }

        // 2. Prepare safe variables
        const variables: Record<string, any> = {};
        let processedFormula = sanitizedFormula;

        // Map tokens to temporary variable names to avoid injection in the formula string
        let varCount = 0;
        tokens.forEach(token => {
            const safeVarName = `__var_${varCount++}`;
            const value = resolveValue(row, token);

            // Sanitize value for math operations
            variables[safeVarName] = value;

            // Replace ALL occurrences of {token} with safeVarName
            // Escape special regex chars in token for replacement
            const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            processedFormula = processedFormula.replace(new RegExp(`\\{${escapedToken}\\}`, 'g'), safeVarName);
        });

        // 3. Execute
        // Create a function with the variable names as arguments
        const varNames = Object.keys(variables);
        const varValues = Object.values(variables);

        // RESTRICTED SCOPE checks:
        // We only pass the variables we explicitly resolved.
        // We do NOT pass window, document, etc.
        // However, 'this' inside the function could theoretically access global scope in strict mode?
        // 'new Function' creates a function in the global scope, but it doesn't close over the current scope.
        // We rely on the fact that we are only evaluating an expression, not a block.
        // We return the result of the expression.

        // Safety: Ensure formula doesn't contain explicit function calls or unsafe keywords?
        // For v1, we assume the replacement of {..} leaves only operators and literals.
        // But user could type "window.location".
        // To trigger that, they would need to avoid {}, but write valid JS.
        // E.g. Formula: "window.location.href"
        // This would return the href.
        // MITIGATION: We can wrap the execution in a Proxy sandbox or regex check.
        // For high robustness without complex sandbox libs, we can simple regex check for unsafe keywords.

        const unsafeKeywords = ['window', 'document', 'eval', 'alert', 'console', 'fetch', 'XMLHttpRequest', 'globalThis', 'process'];
        if (unsafeKeywords.some(keyword => processedFormula.includes(keyword))) {
            return "#ERR: Unsafe Expression";
        }

        const func = new Function(...varNames, `return (${processedFormula});`);
        const result = func(...varValues);

        if (typeof result === 'number' && !isFinite(result)) return "#ERR: Infinity";
        if (typeof result === 'number' && isNaN(result)) return "#ERR: NaN";

        return result;

    } catch (error) {
        console.warn("Formula Evaluation Error:", error);
        return "#ERR: Syntax";
    }
}

/**
 * Resolves a value from the data context, handling dot notation and aggregations.
 */
function resolveValue(data: any, path: string): any {
    if (!data) return 0;

    // Handle dot notation
    const parts = path.split('.');
    let current = data;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // If current is an array (One-to-Many), we need to Map & Aggregate
        if (Array.isArray(current)) {
            // Map the rest of the path for each item
            const remainingPath = parts.slice(i).join('.');
            // "Recurse" manually: map each item to its resolved value
            const values = current.map(item => resolveValue(item, remainingPath));

            // Aggregate values
            // Heuristic: If numbers, SUM. If strings, JOIN.
            return aggregateValues(values);
        }

        if (current === undefined || current === null) return 0; // Default to 0/empty for missing paths needed for math
        current = current[part];
    }

    // Resolve Objects (like {id, value} wrapper)
    // If the Resolved Value is an object like {value: 100}, extract it.
    if (typeof current === 'object' && current !== null && 'value' in current) {
        return current.value;
    }

    // Resolve date strings to numbers?
    // User might want to do Date math. For now, keep as string/number.

    // Ensure we don't return objects to the math engine
    if (typeof current === 'object' && current !== null) {
        // Fallback: JSON string? or NaN?
        // Math with object is NaN.
        return NaN;
    }

    // Convert numeric strings to numbers for easier math? (Optional, JS does this for *, -, / but + is concat)
    // Best practice: if it looks like a number, treat as number.
    if (typeof current === 'string' && !isNaN(parseFloat(current)) && isFinite(Number(current))) {
        return Number(current);
    }

    return current;
}

/**
 * Aggregates an array of values.
 */
function aggregateValues(values: any[]): any {
    if (values.length === 0) return 0;

    // Filter out null/undefined
    const validValues = values.filter(v => v !== null && v !== undefined && v !== '');
    if (validValues.length === 0) return 0;

    // Check types
    const allNumbers = validValues.every(v => typeof v === 'number');

    if (allNumbers) {
        // SUM
        return validValues.reduce((a, b) => a + b, 0);
    } else {
        // JOIN
        return validValues.join(', ');
    }
}
