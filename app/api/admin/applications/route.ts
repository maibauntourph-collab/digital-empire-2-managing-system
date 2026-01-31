import { NextResponse } from 'next/server';
import { getApplications, updateApplicationStatus, deleteApplication, addApplication } from '@/lib/db';
import { cookies } from 'next/headers';

async function getUserRole() {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get('admin_session')?.value;
    if (!sessionValue) return null;
    try {
        const session = JSON.parse(Buffer.from(sessionValue, 'base64').toString('utf-8'));
        return session.role;
    } catch {
        return null;
    }
}

export async function GET() {
    const apps = await getApplications();
    return NextResponse.json(apps.reverse()); // Newest first
}

// Allow public submission from apply page via API directly if needed, but mostly for admin updates
export async function POST(request: Request) {
    const body = await request.json();
    // Public endpoint for submitting application
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
    const role = await getUserRole();
    if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, status } = body;

    await updateApplicationStatus(id, status);
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const role = await getUserRole();
    if (role !== 'SUPER_ADMIN') {
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
