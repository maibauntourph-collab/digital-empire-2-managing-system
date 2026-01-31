import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        return NextResponse.json({
            status: 'Error',
            message: 'MONGODB_URI environment variable is NOT defined.'
        }, { status: 500 });
    }

    try {
        // Try connecting
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

        return NextResponse.json({
            status: 'Success',
            message: 'Successfully connected to MongoDB!',
            dbName: mongoose.connection.name,
            host: mongoose.connection.host
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'Connection Failed',
            errorName: error.name,
            errorMessage: error.message,
            troubleshooting: error.name === 'MongooseServerSelectionError'
                ? 'Check MongoDB Atlas Network Access (IP Whitelist). Allow 0.0.0.0/0'
                : 'Check your username/password in MONGODB_URI'
        }, { status: 500 });
    }
}
