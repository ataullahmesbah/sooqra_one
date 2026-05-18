// src/app/api/products/cart/validate/route.ts

import { NextResponse } from 'next/server';
import Product from '@/src/models/Products';
import mongoose from 'mongoose';
import dbConnect from '@/src/lib/dbConnect';
import ProductVariant from '@/src/models/ProductVariant';


// Interface definitions
interface Size {
    name: string;
    quantity: number;
}

interface ProductDocument {
    _id: mongoose.Types.ObjectId;
    title: string;
    availability: string;
    quantity: number;
    productType: 'Own' | 'Affiliate';
    sizeRequirement: 'Optional' | 'Mandatory';
    sizes: Size[];
    maxPerOrder?: number;
}

interface RequestBody {
    productId: string;
    quantity: number;
    size?: string;
    variantId?: string;
}




export async function POST(request: Request) {
    await dbConnect();
    try {
        const { productId, quantity, size, variantId }: RequestBody = await request.json();

        // Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json(
                {
                    valid: false,
                    message: 'Invalid product ID',
                    productId,
                    availableQuantity: 0
                },
                { status: 400 }
            );
        }

        // Validate quantity
        if (!quantity || quantity < 1) {
            return NextResponse.json(
                {
                    valid: false,
                    message: 'Quantity must be at least 1',
                    productId,
                    availableQuantity: 1
                },
                { status: 400 }
            );
        }

        const product = await Product.findById(productId).lean() as unknown as ProductDocument;

        if (!product) {
            return NextResponse.json(
                {
                    valid: false,
                    message: 'Product not found',
                    productId,
                    availableQuantity: 0
                },
                { status: 404 }
            );
        }

        // Check availability
        if (product.availability !== 'InStock') {
            return NextResponse.json(
                {
                    valid: false,
                    message: 'Product is out of stock',
                    productId,
                    title: product.title,
                    availableQuantity: 0
                },
                { status: 400 }
            );
        }

        // Check maximum per order
        const maxAllowed = product.maxPerOrder || 3;
        if (quantity > maxAllowed) {
            return NextResponse.json(
                {
                    valid: false,
                    message: `Maximum ${maxAllowed} units allowed`,
                    productId,
                    title: product.title,
                    availableQuantity: maxAllowed,
                    maxPerOrder: maxAllowed
                },
                { status: 400 }
            );
        }

        // ✅ If variantId is provided, validate variant stock
        if (variantId && mongoose.Types.ObjectId.isValid(variantId)) {
            const variant = await ProductVariant.findById(variantId);

            if (!variant) {
                return NextResponse.json(
                    {
                        valid: false,
                        message: 'Product variant not found',
                        productId,
                        availableQuantity: 0
                    },
                    { status: 400 }
                );
            }

            if (quantity > variant.quantity) {
                return NextResponse.json(
                    {
                        valid: false,
                        message: `Only ${variant.quantity} units available for ${variant.name}`,
                        productId,
                        title: `${product.title} (${variant.name})`,
                        availableQuantity: variant.quantity
                    },
                    { status: 400 }
                );
            }
        }
        // For Own products with mandatory size requirement
        else if (product.productType === 'Own' && product.sizeRequirement === 'Mandatory' && size) {
            const sizeData = product.sizes.find((s: Size) => s.name === size);

            if (!sizeData) {
                return NextResponse.json(
                    {
                        valid: false,
                        message: `Size "${size}" not available for this product`,
                        productId,
                        title: product.title,
                        availableSizes: product.sizes.map(s => s.name)
                    },
                    { status: 400 }
                );
            }

            if (quantity > sizeData.quantity) {
                return NextResponse.json(
                    {
                        valid: false,
                        message: `Only ${sizeData.quantity} units available for size "${size}"`,
                        productId,
                        title: product.title,
                        availableQuantity: sizeData.quantity,
                        size: size
                    },
                    { status: 400 }
                );
            }
        }
        // For products without size requirement or affiliate products
        else {
            if (quantity > product.quantity) {
                return NextResponse.json(
                    {
                        valid: false,
                        message: `Only ${product.quantity} units available`,
                        productId,
                        title: product.title,
                        availableQuantity: product.quantity
                    },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            {
                valid: true,
                productId,
                title: product.title,
                quantity,
                size,
                message: 'Item validated successfully'
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error validating cart:', error);
        return NextResponse.json(
            {
                valid: false,
                message: `Failed to validate cart: ${error.message}`,
                error: error.message
            },
            { status: 500 }
        );
    }
}