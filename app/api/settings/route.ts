import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const settings = await getSettings();
    // Only return public settings
    return NextResponse.json({
        botImageType: settings.botImageType
    });
}
