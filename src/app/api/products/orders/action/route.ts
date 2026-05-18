// src/app/api/products/orders/action/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Order from '@/src/models/Order';
import Product from '@/src/models/Products';

interface ActionRequestBody {
    orderId: string;
    action: 'accept' | 'reject' | 'return';
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body: ActionRequestBody = await request.json();
        const { orderId, action } = body;

        // ✅ action validation
        if (!orderId || !['accept', 'reject', 'return'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid request parameters' },
                { status: 400 }
            );
        }

        // Find order
        const order = await Order.findOne({ orderId });
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // ✅ Check current status for duplicate actions
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

        if (order.status === 'returned' && action === 'return') {
            return NextResponse.json(
                { error: 'Order is already returned' },
                { status: 400 }
            );
        }

        // ============================================
        // ✅ ACTION: ACCEPT
        // ============================================
        if (action === 'accept') {
            const validationErrors: string[] = [];

            // Validate product availability
            for (const item of order.products) {
                const product = await Product.findById(item.productId);

                if (!product) {
                    validationErrors.push(`Product "${item.title}" not found`);
                    continue;
                }

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
                return NextResponse.json(
                    {
                        error: 'Product validation failed',
                        details: validationErrors
                    },
                    { status: 400 }
                );
            }

            // Update product quantities
            for (const item of order.products) {
                const product = await Product.findById(item.productId);
                if (!product) continue;

                if (item.size && product.sizeRequirement === 'Mandatory') {
                    const sizeIndex = product.sizes.findIndex((s: any) => s.name === item.size);
                    if (sizeIndex !== -1) {
                        product.sizes[sizeIndex].quantity -= item.quantity;
                        product.quantity -= item.quantity;
                        await product.save();
                    }
                } else {
                    product.quantity -= item.quantity;
                    await product.save();
                }
            }

            // Update order status to accepted
            const updateResult = await Order.updateOne(
                { orderId },
                {
                    $set: {
                        status: 'accepted',
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

            return NextResponse.json(
                {
                    success: true,
                    message: 'Order accepted successfully',
                    order: {
                        orderId: order.orderId,
                        status: 'accepted',
                        updatedAt: new Date()
                    }
                },
                { status: 200 }
            );
        }

        // ============================================
        // ✅ ACTION: REJECT
        // ============================================
        if (action === 'reject') {
            const updateResult = await Order.updateOne(
                { orderId },
                {
                    $set: {
                        status: 'rejected',
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

            return NextResponse.json(
                {
                    success: true,
                    message: 'Order rejected successfully',
                    order: {
                        orderId: order.orderId,
                        status: 'rejected',
                        updatedAt: new Date()
                    }
                },
                { status: 200 }
            );
        }

        // ============================================
        // ✅ ACTION: RETURN (এটি এখানে যোগ করুন)
        // ============================================
        if (action === 'return') {
            // Check if order can be returned (only accepted orders can be returned)
            if (order.status !== 'accepted') {
                return NextResponse.json(
                    { error: 'Only accepted orders can be returned' },
                    { status: 400 }
                );
            }

            const updateResult = await Order.updateOne(
                { orderId },
                {
                    $set: {
                        status: 'returned',
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

            return NextResponse.json(
                {
                    success: true,
                    message: 'Order marked as returned',
                    order: {
                        orderId: order.orderId,
                        status: 'returned',
                        updatedAt: new Date()
                    }
                },
                { status: 200 }
            );
        }

        // If no action matched (should not happen)
        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );

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