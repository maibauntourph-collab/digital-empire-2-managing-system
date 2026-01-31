import { NextResponse } from 'next/server';
import { getReceipts, addReceipt, deleteReceipt } from '@/lib/db';

export const dynamic = 'force-dynamic';
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

export async function GET() {
    const receipts = await getReceipts();
    return NextResponse.json(receipts.reverse());
}

export async function POST(request: Request) {
    if (!(await isSuperAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const newReceipt = {
        id: `rcpt-${Date.now()}`,
        ...body,
        issueDate: new Date().toISOString()
    };

    await addReceipt(newReceipt);
    return NextResponse.json(newReceipt);
}

export async function DELETE(request: Request) {
    if (!(await isSuperAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
        await deleteReceipt(id);
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
}
