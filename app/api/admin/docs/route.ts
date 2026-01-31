import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';

async function isSuperAdmin() {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get('admin_session')?.value;
    if (!sessionValue) return false;
    try {
        const session = JSON.parse(Buffer.from(sessionValue, 'base64').toString('utf-8'));
        return session.role === 'SUPER_ADMIN';
    } catch {
        return false;
    }
}

const DOCS_DIR = path.join(process.cwd(), 'public', 'docs');

export async function GET() {
    try {
        const files = await fs.readdir(DOCS_DIR);
        // Filter only PDFs or specific files if needed
        const pdfs = files.filter(f => f.endsWith('.pdf'));
        return NextResponse.json(pdfs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to list docs' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!(await isSuperAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name.replace(/[^a-zA-Z0-9\uAC00-\uD7A3.-]/g, '_'); // Sanitize
        const filePath = path.join(DOCS_DIR, filename);

        await fs.writeFile(filePath, buffer);

        return NextResponse.json({ success: true, filename });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!(await isSuperAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }

    try {
        // Prevent directory traversal
        const safeName = path.basename(filename);
        await fs.unlink(path.join(DOCS_DIR, safeName));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
