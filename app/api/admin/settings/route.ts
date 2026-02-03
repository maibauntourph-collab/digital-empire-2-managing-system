import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Authorization check helper
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
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_session')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const settings = await getSettings();
    return NextResponse.json(settings);
}

export async function POST(request: Request) {
    if (!(await isSuperAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { botImageType } = body;

    if (!botImageType) {
        return NextResponse.json({ error: 'botImageType is required' }, { status: 400 });
    }

    await updateSettings({ botImageType });
    return NextResponse.json({ success: true, botImageType });
}
