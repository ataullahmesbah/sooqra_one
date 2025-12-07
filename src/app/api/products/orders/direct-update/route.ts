// src/app/api/products/orders/direct-update/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Order from '@/src/models/Order';

interface DirectUpdateBody {
    orderId: string;
    status: string;
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body: DirectUpdateBody = await request.json();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return NextResponse.json(
                { error: 'Order ID and status required' },
                { status: 400 }
            );
        }

        // Allow any status during debugging
        const allowedStatuses = ['pending', 'pending_payment', 'accepted', 'rejected', 'completed', 'cancelled'];

        if (!allowedStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        // Direct MongoDB update without validation
        const result = await Order.updateOne(
            { orderId },
            {
                $set: {
                    status: status,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Order status updated to ${status}`,
            orderId,
            status
        });

    } catch (error: any) {
        console.error('Direct update error:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}