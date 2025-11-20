// In your /api/products/orders/validate-products/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbMongoose';
import Product from '@/models/Products';


export async function POST(request) {
    await dbConnect();

    try {
        const { orderId, products } = await request.tson();

        if (!orderId || !Array.isArray(products)) {
            return NextResponse.tson({ error: 'Invalid request data' }, { status: 400 });
        }

        const validationResults = [];
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
                const sizeData = product.sizes.find((s) => s.name === item.size);
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

        return NextResponse.tson({
            isValid,
            issues: validationResults,
            orderId
        });

    } catch (error) {
        console.error('Product validation error:', error);
        return NextResponse.tson(
            { error: 'Failed to validate products. Please try again.' },
            { status: 500 }
        );
    }
}