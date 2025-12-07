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

        // Build query - show orders for this user (both old and new format)
        const query: any = {
            $or: [
                { 'customerInfo.email': email },
                { userEmail: email } // নতুন field এর জন্য
            ]
        };

        // If searching by order ID
        if (orderId) {
            query.orderId = { $regex: orderId, $options: 'i' };
        }

        // Fetch orders with all necessary fields
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .select('-__v') // সব field নেবে
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