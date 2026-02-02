import { NextResponse } from 'next/server';
import { getManagers, addManager, deleteManager } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Authorization check helper
async function hasPermission(permission: string) {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get('admin_session')?.value;
    if (!sessionValue) return false;
    try {
        const session = JSON.parse(Buffer.from(sessionValue, 'base64').toString('utf-8'));
        if (session.role === 'SUPER_ADMIN') return true;
        return session.permissions && session.permissions.includes(permission);
    } catch {
        return false;
    }
}

export async function GET() {
    // Optional check
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_session')) return NextResponse.json([], { status: 401 });

    const managers = await getManagers();
    return NextResponse.json(managers);
}

export async function POST(request: Request) {
    if (!(await hasPermission('managers'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, role, department, email, phone } = body;

    const newManager = {
        id: `mgr-${Date.now()}`,
        name,
        role,
        department,
        email,
        phone,
        createdAt: new Date().toISOString()
    };

    await addManager(newManager);
    return NextResponse.json(newManager);
}

export async function DELETE(request: Request) {
    if (!(await hasPermission('managers'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
        await deleteManager(id);
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
}
