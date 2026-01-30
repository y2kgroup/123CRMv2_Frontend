import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { data } = body;

        if (!data) {
            return NextResponse.json({ error: 'No data provided' }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), 'dev-snapshot.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving snapshot:', error);
        return NextResponse.json({ error: 'Failed to save snapshot' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'dev-snapshot.json');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ data: null });
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error reading snapshot:', error);
        return NextResponse.json({ error: 'Failed to read snapshot' }, { status: 500 });
    }
}
