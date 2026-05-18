// /api/products/orders/[orderId]/route.ts 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import dbConnect from '@/src/lib/dbConnect';
import Order from '@/src/models/Order';

export async function DELETE(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { orderId } = await params;

    const deleted = await Order.findOneAndDelete({ orderId });
    if (!deleted) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order deleted' }, { status: 200 });
}