// src/app/api/products/orders/validate-products/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Product from '@/src/models/Products';

// Interface definitions
interface ProductItem {
    productId: string;
    title: string;
    quantity: number;
    size?: string;
}

interface ValidateRequestBody {
    orderId: string;
    products: ProductItem[];
}

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { orderId, products }: ValidateRequestBody = await request.json();

        if (!orderId || !Array.isArray(products)) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        const validationResults: string[] = [];
        let isValid = true;

        for (const item of products) {
            const product = await Product.findById(item.productId);

            if (!product) {
                validationResults.push(`❌ Product "${item.title}" not found in our system`);
                isValid = false;
                continue;
            }

            if (product.sizeRequirement === 'Mandatory' && !item.size) {
                validationResults.push(`❌ Size is required for "${item.title}"`);
                isValid = false;
                continue;
            }

            if (item.size && product.sizeRequirement === 'Mandatory') {
                const sizeData = product.sizes.find((s: any) => s.name === item.size);
                if (!sizeData) {
                    validationResults.push(`❌ Size "${item.size}" not found for "${item.title}"`);
                    isValid = false;
                    continue;
                }
                if (sizeData.quantity < item.quantity) {
                    validationResults.push(`❌ Insufficient stock for "${item.title}" size "${item.size}" (Available: ${sizeData.quantity}, Needed: ${item.quantity})`);
                    isValid = false;
                    continue;
                }
            } else {
                if (product.quantity < item.quantity) {
                    validationResults.push(`❌ Insufficient stock for "${item.title}" (Available: ${product.quantity}, Needed: ${item.quantity})`);
                    isValid = false;
                    continue;
                }
            }

            if (product.quantity === 0) {
                validationResults.push(`❌ "${item.title}" is out of stock`);
                isValid = false;
            } else if (product.productType === 'Affiliate') {
                validationResults.push(`❌ "${item.title}" is an affiliate product and cannot be processed`);
                isValid = false;
            }
        }

        return NextResponse.json({
            isValid,
            issues: validationResults,
            orderId
        });

    } catch (error: any) {
        console.error('Product validation error:', error);
        return NextResponse.json(
            { error: 'Failed to validate products. Please try again.' },
            { status: 500 }
        );
    }
}