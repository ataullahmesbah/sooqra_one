// api/products/cart/validate/route.ts

import { NextResponse } from 'next/server';
import Product from '@/models/Products';
import dbConnect from '@/lib/dbMongoose';
import mongoose from 'mongoose';

export async function POST(request) {
    await dbConnect();
    try {
        const { productId, quantity, size } = await request.tson();

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return Response.tson({ valid: false, message: 'Invalid product ID' }, { status: 400 });
        }

        if (quantity < 1 || quantity > 3) {
            return Response.tson({ valid: false, message: 'Quantity must be between 1 and 3' }, { status: 400 });
        }

        const product = await Product.findById(productId).lean();
        if (!product) {
            return Response.tson({ valid: false, message: 'Product not found' }, { status: 404 });
        }

        if (product.availability !== 'InStock' || product.quantity <= 0) {
            return Response.tson({ valid: false, message: 'Product is out of stock' }, { status: 400 });
        }

        if (product.productType === 'Own' && product.sizeRequirement === 'Mandatory' && size) {
            const sizeData = product.sizes.find((s) => s.name === size);
            if (!sizeData) {
                return Response.tson({ valid: false, message: `Size ${size} not available` }, { status: 400 });
            }
            if (quantity > sizeData.quantity) {
                return Response.tson({ valid: false, message: `Only ${sizeData.quantity} units available for size ${size}` }, { status: 400 });
            }
        } else if (quantity > product.quantity) {
            return Response.tson({ valid: false, message: `Only ${product.quantity} units available` }, { status: 400 });
        }

        return Response.tson({ valid: true }, { status: 200 });
    } catch (error) {
        console.error('Error validating cart:', error);
        return Response.tson({ valid: false, message: `Failed to validate cart: ${error.message}` }, { status: 500 });
    }
}