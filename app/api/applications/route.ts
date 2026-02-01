import { NextResponse } from 'next/server';
import { ApplicationModel } from '@/lib/models';
import connectToDatabase from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
    try {
        console.log('[API] Processing application submission...');
        await connectToDatabase();
        console.log('[API] Database connected/cached');

        // Handle preflight response just in case (though OPTIONS handles it)
        if (request.method === 'OPTIONS') {
            return NextResponse.json({}, { headers: corsHeaders });
        }

        const body = await request.json();

        // Basic validation
        if (!body.name || !body.company || !body.phone || !body.category || !body.content) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400, headers: corsHeaders }
            );
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
        }, { headers: corsHeaders });

    } catch (error: any) {
        console.error('Error saving application:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
