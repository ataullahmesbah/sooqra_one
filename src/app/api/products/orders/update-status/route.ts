// src/app/api/products/orders/update-status/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Order from '@/src/models/Order';

// Interface definitions
interface UpdateStatusRequestBody {
    orderId: string;
    status: string;
    paymentDetails?: any;
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { orderId, status, paymentDetails }: UpdateStatusRequestBody = await request.json();

        // console.log('📦 Updating order:', orderId, 'to status:', status);

        const updatedOrder = await Order.findOneAndUpdate(
            { orderId: orderId },
            {
                status: status,
                paymentDetails: paymentDetails,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedOrder) {
            // console.log('❌ Order not found:', orderId);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // console.log('✅ Order updated successfully:', updatedOrder.orderId);
        return NextResponse.json({
            success: true,
            message: 'Order status updated',
            order: updatedOrder
        });
    } catch (error: any) {
        console.error('❌ Order status update error:', error);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }
}