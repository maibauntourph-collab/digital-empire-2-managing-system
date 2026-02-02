import { NextResponse } from 'next/server';
import { getApplications, updateApplicationStatus, deleteApplication, addApplication } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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
    // Optional: Protect GET too if strict
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_session')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const apps = await getApplications();
    return NextResponse.json(apps.reverse());
}

// Allow public submission from apply page via API directly
export async function POST(request: Request) {
    const body = await request.json();
    const newApp = {
        id: `app-${Date.now()}`,
        type: body.category || '기타',
        name: body.name,
        company: body.company,
        phone: body.phone,
        content: body.content,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString()
    };
    await addApplication(newApp);
    return NextResponse.json(newApp);
}

export async function PATCH(request: Request) {
    if (!(await hasPermission('applications'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body;

    await updateApplicationStatus(id, status);
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    if (!(await hasPermission('applications'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
        await deleteApplication(id);
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
}
