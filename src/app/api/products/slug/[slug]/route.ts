// src/app/api/products/slug/[slug]/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Product from '@/src/models/Products';
import mongoose from 'mongoose';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> } // params is now a Promise
) {
    try {
        await dbConnect();

        // Await the params promise
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        let product;

        // যদি slug আসলে MongoDB ObjectId হয় (যেমন: 679f1a2b3c9d8e1234567890)
        if (mongoose.Types.ObjectId.isValid(slug)) {
            product = await Product.findOne({
                $or: [{ slug: slug }, { _id: slug }],
            })
                .populate('category')
                .lean();
        } else {
            // নরমাল slug (যেমন: premium-tshirt-2025)
            product = await Product.findOne({ slug: slug }).populate('category').lean();
        }

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found', requested: slug },
                { status: 404 }
            );
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error: any) {
        console.error('Slug API Error:', error);
        return NextResponse.json(
            { error: 'Server error', message: error.message },
            { status: 500 }
        );
    }
}