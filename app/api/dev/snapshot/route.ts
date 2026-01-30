import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { data } = body;

        if (!data) {
            return NextResponse.json({ error: 'No data provided' }, { status: 400 });
        }

        // Save to project root
        const filePath = path.join(process.cwd(), 'dev-snapshot.json');

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        console.log(`[DevSnapshot] Saved snapshot to ${filePath}`);

        return NextResponse.json({ success: true, path: filePath });
    } catch (e) {
        console.error('[DevSnapshot] Error saving snapshot:', e);
        return NextResponse.json({ error: 'Failed to save snapshot' }, { status: 500 });
    }
}
