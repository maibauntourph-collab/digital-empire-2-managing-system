import { NextResponse } from 'next/server';
import { createAdmin, findAdminByUsername } from '@/lib/db';
import connectToDatabase from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectToDatabase();

        const username = 'admin';
        const existing = await findAdminByUsername(username);

        if (existing) {
            return NextResponse.json({
                status: 'Already Exists',
                message: 'Admin account (admin) already exists. You can login.'
            });
        }

        const newAdmin = {
            id: `admin-super-${Date.now()}`,
            username: 'admin',
            password: 'admin123!',
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
            approved: true,
            createdAt: new Date().toISOString()
        };

        // We use createAdmin or equivalent logic. 
        // Note: lib/db.ts uses models directly now.
        await createAdmin(newAdmin);

        return NextResponse.json({
            status: 'Created',
            message: 'Successfully created default admin account.',
            account: {
                username: 'admin',
                password: 'admin123!'
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            status: 'Error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
