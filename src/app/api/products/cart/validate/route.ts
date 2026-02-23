// src/app/api/products/cart/validate/route.ts

import { NextResponse } from 'next/server';
import Product from '@/src/models/Products';
import mongoose from 'mongoose';
import dbConnect from '@/src/lib/dbConnect';


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
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { productId, quantity, size }: RequestBody = await request.json();

        // console.log('Cart validate request received:', {
        //     productId,
        //     quantity,
        //     size,
        //     timestamp: new Date().toISOString()
        // });

        // Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            // console.log('Invalid product ID:', productId);
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
            // console.log('Invalid quantity:', quantity);
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

        // Find product
        const product = await Product.findById(productId).lean() as unknown as ProductDocument;

        if (!product) {
            // console.log('Product not found:', productId);
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

        // console.log('Found product:', {
        //     title: product.title,
        //     availability: product.availability,
        //     quantity: product.quantity,
        //     productType: product.productType,
        //     sizeRequirement: product.sizeRequirement,
        //     sizes: product.sizes
        // });

        // Check availability
        if (product.availability !== 'InStock') {
            // console.log('Product not in stock:', product.title);
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
            // console.log('Quantity exceeds max allowed:', quantity, '>', maxAllowed);
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

        // For Own products with mandatory size requirement
        if (product.productType === 'Own' && product.sizeRequirement === 'Mandatory' && size) {
            const sizeData = product.sizes.find((s: Size) => s.name === size);

            if (!sizeData) {
                // console.log('Size not found:', size, 'for product:', product.title);
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
                // console.log('Insufficient stock for size:', {
                //     size,
                //     requested: quantity,
                //     available: sizeData.quantity
                // });
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
                // console.log('Insufficient overall stock:', {
                //     requested: quantity,
                //     available: product.quantity
                // });
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

        // Return success
        // console.log('Cart item validated successfully:', {
        //     productId,
        //     title: product.title,
        //     quantity,
        //     size: size || 'N/A'
        // });

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