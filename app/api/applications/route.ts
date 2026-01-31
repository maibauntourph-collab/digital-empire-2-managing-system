import { NextResponse } from 'next/server';
import { ApplicationModel } from '@/lib/models';
import connectToDatabase from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.company || !body.phone || !body.category || !body.content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create new application document
        const newApplication = await ApplicationModel.create({
            type: body.category, // Map 'category' from frontend to 'type' in schema
            name: body.name,
            company: body.company,
            phone: body.phone,
            content: body.content,
            status: 'PENDING' // Default status
        });

        return NextResponse.json({
            success: true,
            message: 'Application saved successfully',
            id: newApplication.id
        });

    } catch (error: any) {
        console.error('Error saving application:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
