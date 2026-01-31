import { NextResponse } from 'next/server';
import { createAdmin, findAdminByUsername } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password, name, role } = body;

        if (!username || !password || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existing = await findAdminByUsername(username);
        if (existing) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }

        const newAdmin = {
            id: `admin-${Date.now()}`,
            username,
            password, // Plaintext for MVP
            name,
            role: role || 'MANAGER', // Default to MANAGER
            approved: false, // Requires Super Admin approval
            createdAt: new Date().toISOString()
        };

        await createAdmin(newAdmin);

        return NextResponse.json({ success: true, message: 'Account created. Please wait for Super Admin approval.' });

    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
