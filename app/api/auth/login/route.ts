import { NextResponse } from 'next/server';
import { findAdminByUsername } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const admin = await findAdminByUsername(username);

        // In a real app, use bcrypt to compare hashes. Here simple string comparison as password is plaintext in JSON.
        if (!admin || admin.password !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (!admin.approved) {
            return NextResponse.json({ error: 'Account pending approval' }, { status: 403 });
        }

        // Set simple session cookie (In production, use JWT or iron-session)
        const sessionData = JSON.stringify({
            id: admin.id,
            username: admin.username,
            name: admin.name,
            role: admin.role
        });

        // Simple Base64 encoding for the cookie value (NOT SECURE, MVP only)
        const sessionValue = Buffer.from(sessionData).toString('base64');

        const cookieStore = await cookies();
        cookieStore.set('admin_session', sessionValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return NextResponse.json({ success: true, user: { name: admin.name, role: admin.role } });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: `System Error: ${error.message}` }, { status: 500 });
    }
}
