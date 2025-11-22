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
    availability: string;
    quantity: number;
    productType: 'Own' | 'Affiliate';
    sizeRequirement: 'Optional' | 'Mandatory';
    sizes: Size[];
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

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json(
                { valid: false, message: 'Invalid product ID' },
                { status: 400 }
            );
        }

        if (quantity < 1 || quantity > 3) {
            return NextResponse.json(
                { valid: false, message: 'Quantity must be between 1 and 3' },
                { status: 400 }
            );
        }

        const product = await Product.findById(productId).lean() as unknown as ProductDocument;
        if (!product) {
            return NextResponse.json(
                { valid: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        if (product.availability !== 'InStock' || product.quantity <= 0) {
            return NextResponse.json(
                { valid: false, message: 'Product is out of stock' },
                { status: 400 }
            );
        }

        // For Own products with mandatory size requirement
        if (product.productType === 'Own' && product.sizeRequirement === 'Mandatory' && size) {
            const sizeData = product.sizes.find((s: Size) => s.name === size);
            if (!sizeData) {
                return NextResponse.json(
                    { valid: false, message: `Size ${size} not available` },
                    { status: 400 }
                );
            }
            if (quantity > sizeData.quantity) {
                return NextResponse.json(
                    { valid: false, message: `Only ${sizeData.quantity} units available for size ${size}` },
                    { status: 400 }
                );
            }
        }
        // For products without size requirement or affiliate products
        else if (quantity > product.quantity) {
            return NextResponse.json(
                { valid: false, message: `Only ${product.quantity} units available` },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { valid: true },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error validating cart:', error);
        return NextResponse.json(
            { valid: false, message: `Failed to validate cart: ${error.message}` },
            { status: 500 }
        );
    }
}