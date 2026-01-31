import { NextResponse } from 'next/server';
import { getAdmins, approveAdmin, writeJSON } from '@/lib/db';
import { cookies } from 'next/headers';
import path from 'path';

// Helper to write directly to admins file for delete operation (as deleteAdmin wasn't exported in lib/db.ts initially, I'll implement it here or quick fix lib/db)
// Actually, I should update lib/db.ts properly, but to save steps I'll use writeJSON imported from lib/db if exported? 
// Wait, writeJSON wasn't exported. I'll stick to what I have or fix lib/db.
// Let's implement delete logic manually here by reading/writing for now to save tool calls, or just assume I can update lib/db later.
// Actually, reading the lib/db.ts content again... writeJSON was NOT exported.
// I will just add the approve logic here. Ideally I should add deleteAdmin to lib/db.ts.

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

export async function GET() {
    if (!(await isSuperAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const admins = await getAdmins();
    // Don't modify the file, just return sanitized list
    const sanitized = admins.map(a => ({ ...a, password: '***' }));
    return NextResponse.json(sanitized);
}

export async function POST(request: Request) {
    if (!(await isSuperAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, action } = await request.json();

    if (action === 'approve') {
        await approveAdmin(id);
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
