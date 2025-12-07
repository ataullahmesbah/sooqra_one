// src/app/api/users/orders/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/src/lib/dbConnect';
import Order from '@/src/models/Order';
import { authOptions } from '../../auth/[...nextauth]/route';


export async function GET(request: Request) {
    try {
        // Authenticate user
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');
        const email = session.user.email;

        // Build query - only show orders for this specific user
        const query: any = {
            'customerInfo.email': email
        };

        // If searching by order ID
        if (orderId) {
            query.orderId = { $regex: orderId, $options: 'i' };
        }

        // Fetch orders sorted by date (newest first)
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .select('orderId customerInfo.name total createdAt status paymentMethod')
            .lean();

        return NextResponse.json(orders, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching user orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}