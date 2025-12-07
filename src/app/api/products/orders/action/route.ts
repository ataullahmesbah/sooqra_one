// src/app/api/products/orders/action/route.ts 
import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Order from '@/src/models/Order';
import Product from '@/src/models/Products';

interface ActionRequestBody {
    orderId: string;
    action: 'accept' | 'reject';
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body: ActionRequestBody = await request.json();
        const { orderId, action } = body;

        if (!orderId || !['accept', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid request parameters' },
                { status: 400 }
            );
        }

        console.log(`Processing ${action} for order: ${orderId}`);

        // Find order
        const order = await Order.findOne({ orderId });
        if (!order) {
            console.log(`Order not found: ${orderId}`);
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // TEMPORARY: Print current status options (TypeScript compatible)
        const statusPath = (Order.schema as any).path('status');
        if (statusPath && statusPath.enumValues) {
            console.log('Order schema status enum:', statusPath.enumValues);
        }

        // Check current status
        if (order.status === 'accepted' && action === 'accept') {
            return NextResponse.json(
                { error: 'Order is already accepted' },
                { status: 400 }
            );
        }

        if (order.status === 'rejected' && action === 'reject') {
            return NextResponse.json(
                { error: 'Order is already rejected' },
                { status: 400 }
            );
        }

        if (action === 'accept') {
            // Validate product availability
            console.log('Validating products for order:', orderId);

            const validationErrors: string[] = [];

            for (const item of order.products) {
                const product = await Product.findById(item.productId);

                if (!product) {
                    validationErrors.push(`Product "${item.title}" not found`);
                    continue;
                }

                console.log(`Checking product: ${product.title}, Quantity: ${item.quantity}, Size: ${item.size || 'N/A'}`);

                // Check availability
                if (product.availability !== 'InStock') {
                    validationErrors.push(`Product "${item.title}" is out of stock`);
                    continue;
                }

                // Check size-specific stock
                if (item.size && product.sizeRequirement === 'Mandatory') {
                    const sizeData = product.sizes.find((s: any) => s.name === item.size);
                    if (!sizeData) {
                        validationErrors.push(`Size "${item.size}" not available for "${item.title}"`);
                        continue;
                    }
                    if (sizeData.quantity < item.quantity) {
                        validationErrors.push(`Insufficient stock for "${item.title}" (Size: ${item.size}, Available: ${sizeData.quantity}, Needed: ${item.quantity})`);
                        continue;
                    }
                } else if (product.quantity < item.quantity) {
                    validationErrors.push(`Insufficient stock for "${item.title}" (Available: ${product.quantity}, Needed: ${item.quantity})`);
                }
            }

            if (validationErrors.length > 0) {
                console.log('Validation errors:', validationErrors);
                return NextResponse.json(
                    {
                        error: 'Product validation failed',
                        details: validationErrors
                    },
                    { status: 400 }
                );
            }

            // Update product quantities
            console.log('Updating product quantities...');
            for (const item of order.products) {
                const product = await Product.findById(item.productId);
                if (!product) continue;

                console.log(`Processing product: ${product.title}, Qty: ${item.quantity}, Size: ${item.size || 'N/A'}`);

                if (item.size && product.sizeRequirement === 'Mandatory') {
                    const sizeIndex = product.sizes.findIndex((s: any) => s.name === item.size);
                    if (sizeIndex !== -1) {
                        product.sizes[sizeIndex].quantity -= item.quantity;
                        product.quantity -= item.quantity;
                        await product.save();
                        console.log(`Updated size ${item.size} quantity to ${product.sizes[sizeIndex].quantity}`);
                    }
                } else {
                    product.quantity -= item.quantity;
                    await product.save();
                    console.log(`Updated general quantity to ${product.quantity}`);
                }
            }

            // Update order status - WORKAROUND VERSION
            console.log(`Updating order ${orderId} status to ${action === 'accept' ? 'accepted' : 'rejected'}`);

            const newStatus = action === 'accept' ? 'accepted' : 'rejected';

            // Direct MongoDB update (bypass Mongoose validation temporarily)
            const updateResult = await Order.updateOne(
                { orderId },
                {
                    $set: {
                        status: newStatus,
                        updatedAt: new Date()
                    }
                }
            );

            if (updateResult.matchedCount === 0) {
                return NextResponse.json(
                    { error: 'Failed to update order status' },
                    { status: 500 }
                );
            }

            console.log(`Order ${action}ed successfully`);
            return NextResponse.json(
                {
                    success: true,
                    message: `Order ${action}ed successfully`,
                    order: {
                        orderId: order.orderId,
                        status: newStatus,
                        updatedAt: new Date()
                    }
                },
                { status: 200 }
            );
        } else {
            // Reject order
            const newStatus = 'rejected';

            const updateResult = await Order.updateOne(
                { orderId },
                {
                    $set: {
                        status: newStatus,
                        updatedAt: new Date()
                    }
                }
            );

            if (updateResult.matchedCount === 0) {
                return NextResponse.json(
                    { error: 'Failed to update order status' },
                    { status: 500 }
                );
            }

            console.log('Order rejected successfully');
            return NextResponse.json(
                {
                    success: true,
                    message: 'Order rejected successfully',
                    order: {
                        orderId: order.orderId,
                        status: newStatus,
                        updatedAt: new Date()
                    }
                },
                { status: 200 }
            );
        }
    } catch (error: any) {
        console.error('Order action error:', error);

        return NextResponse.json(
            {
                error: 'Failed to process order action',
                details: error.message
            },
            { status: 500 }
        );
    }
}