import { NextResponse } from 'next/server';
import { ReceiptModel } from '@/lib/models';
import connectToDatabase from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();

        // Validate required receipt fields
        // Schema: issueDate, merchantName, amount, items, approvalNo, cardName, cardNum
        if (!body.amount || !body.approvalNo) {
            return NextResponse.json({ error: 'Missing required receipt fields' }, { status: 400 });
        }

        const newReceipt = await ReceiptModel.create({
            issueDate: body.issueDate || new Date().toISOString(),
            merchantName: body.merchantName || 'Digital Empire II',
            amount: body.amount,
            items: body.items || ['Parking Fee'],
            approvalNo: body.approvalNo,
            cardName: body.cardName || 'Credit Card',
            cardNum: body.cardNum || '****-****-****-****'
        });

        return NextResponse.json({
            success: true,
            message: 'Receipt saved successfully',
            id: newReceipt.id
        });

    } catch (error: any) {
        console.error('Error saving receipt:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
