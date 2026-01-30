'use client';

import { useEffect, useState } from 'react';

export function SnapshotHydrator() {
    const [hydrating, setHydrating] = useState(false);

    useEffect(() => {
        const checkHydration = async () => {
            const lastHydrated = localStorage.getItem('app-dev-snapshot-hydrated');
            const localTimestamp = localStorage.getItem('app-snapshot-timestamp');

            setHydrating(true);

            try {
                const res = await fetch('/api/dev/snapshot');
                if (!res.ok) throw new Error('Failed to fetch snapshot');

                const { data } = await res.json();

                if (!data) {
                    setHydrating(false);
                    return;
                }

                const snapshotTimestamp = data['app-snapshot-timestamp'];

                // If we have hydrated before, AND the snapshot isn't newer, skip.
                if (lastHydrated && localTimestamp && snapshotTimestamp && Number(localTimestamp) >= Number(snapshotTimestamp)) {
                    setHydrating(false);
                    return;
                }

                if (data && typeof data === 'object') {
                    console.log('Hydrating from dev snapshot...', Object.keys(data).length, 'keys found.');

                    Object.entries(data).forEach(([key, value]) => {
                        if (typeof value === 'object') {
                            localStorage.setItem(key, JSON.stringify(value));
                        } else {
                            localStorage.setItem(key, String(value));
                        }
                    });

                    localStorage.setItem('app-dev-snapshot-hydrated', 'true');
                    // Reload to apply changes if we actually updated something
                    window.location.reload();
                } else {
                    setHydrating(false);
                }
            } catch (error) {
                console.error('Snapshot hydration failed:', error);
                // Don't mark as hydrated on error so we retry
                setHydrating(false);
            }
        };

        checkHydration();
    }, []);

    if (hydrating) {
        return (
            <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex items-center justify-center flex-col gap-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 font-medium">Initializing Developer Environment...</p>
            </div>
        );
    }

    return null;
}
