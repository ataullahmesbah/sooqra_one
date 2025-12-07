// src/app/api/products/orders/validate-products/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Product from '@/src/models/Products';


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
        const body: ValidateRequestBody = await request.json();
        const { orderId, products } = body;

        if (!orderId || !Array.isArray(products)) {
            return NextResponse.json(
                { error: 'Invalid request data' },
                { status: 400 }
            );
        }

        const validationResults: string[] = [];
        let isValid = true;

        // Validate each product
        for (const item of products) {
            try {
                const product = await Product.findById(item.productId);

                if (!product) {
                    validationResults.push(`❌ Product "${item.title}" not found`);
                    isValid = false;
                    continue;
                }

                // Check if product is active
                if (product.availability !== 'InStock') {
                    validationResults.push(`❌ Product "${item.title}" is out of stock`);
                    isValid = false;
                    continue;
                }

                // Check quantity
                if (item.quantity < 1) {
                    validationResults.push(`❌ Invalid quantity for "${item.title}"`);
                    isValid = false;
                    continue;
                }

                // Check size requirements
                if (product.sizeRequirement === 'Mandatory' && !item.size) {
                    validationResults.push(`❌ Size is required for "${item.title}"`);
                    isValid = false;
                    continue;
                }

                if (item.size && product.sizeRequirement === 'Mandatory') {
                    const sizeData = product.sizes.find((s: any) => s.name === item.size);
                    if (!sizeData) {
                        validationResults.push(`❌ Size "${item.size}" not available for "${item.title}"`);
                        isValid = false;
                        continue;
                    }
                    if (sizeData.quantity < item.quantity) {
                        validationResults.push(`❌ Only ${sizeData.quantity} units available for "${item.title}" (Size: ${item.size})`);
                        isValid = false;
                        continue;
                    }
                } else if (product.quantity < item.quantity) {
                    validationResults.push(`❌ Only ${product.quantity} units available for "${item.title}"`);
                    isValid = false;
                    continue;
                }

                // All validations passed for this product
                validationResults.push(`✅ "${item.title}" - ${item.quantity} units available`);

            } catch (error) {
                validationResults.push(`❌ Error validating "${item.title}"`);
                isValid = false;
            }
        }

        return NextResponse.json({
            isValid,
            issues: validationResults,
            orderId
        }, { status: 200 });

    } catch (error: any) {
        console.error('Product validation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to validate products',
                details: error.message
            },
            { status: 500 }
        );
    }
}