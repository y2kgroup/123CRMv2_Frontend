import { useState, useEffect } from 'react';

export function usePersistedData<T>(key: string, initialValue: T[]) {
    const [data, setData] = useState<T[]>(initialValue);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setData(parsed);
                }
            } catch (e) {
                console.error("Failed to parse saved data for key:", key, e);
            }
        }
        setIsLoaded(true);
    }, [key]);

    // Save to local storage on change
    useEffect(() => {
        if (isLoaded && typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(data));
        }
    }, [data, key, isLoaded]);

    return [data, setData] as const;
}
