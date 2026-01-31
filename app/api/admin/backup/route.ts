import { NextResponse } from 'next/server';
import { getAdmins, getManagers, getApplications, getReceipts } from '@/lib/db';
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
    if (!(await isSuperAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const backup = {
        generatedAt: new Date().toISOString(),
        admins: await getAdmins(),
        managers: await getManagers(),
        applications: await getApplications(),
        receipts: await getReceipts()
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="empire-backup-${new Date().toISOString().slice(0, 10)}.json"`
        }
    });
}
