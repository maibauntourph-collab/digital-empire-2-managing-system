import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
        const sessionData = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
        const user = JSON.parse(sessionData);
        return NextResponse.json({ authenticated: true, user });
    } catch (error) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
