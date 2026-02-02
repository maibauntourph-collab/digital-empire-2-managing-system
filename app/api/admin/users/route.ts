import { NextResponse } from 'next/server';
import { getAdmins, approveAdmin, createAdmin, deleteAdmin, updateAdminPermissions } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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
    const sanitized = admins.map(a => ({ ...a, password: '***' }));
    return NextResponse.json(sanitized);
}

export async function POST(request: Request) {
    if (!(await isSuperAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { action } = body;

        if (action === 'create') {
            const { username, password, name, permissions } = body;
            if (!username || !password || !name) {
                return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
            }
            // Create user
            await createAdmin({
                username,
                password, // Note: In prod use bcrypt
                name,
                role: 'MANAGER',
                approved: true, // Auto-approve if created by Super Admin
                permissions: permissions || []
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'approve') {
            const { id } = body;
            await approveAdmin(id);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    if (!(await isSuperAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    try {
        const { id, permissions } = await request.json();
        if (!id || !Array.isArray(permissions)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }
        await updateAdminPermissions(id, permissions);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!(await isSuperAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        await deleteAdmin(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
