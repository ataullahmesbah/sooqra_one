// src/app/api/products/[slug]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Product from '@/src/models/Products';

interface Params {
    slug: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
    await dbConnect();
    try {
        const product = await Product.findOne({ slug: params.slug })
            .populate('category')
            .lean();

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: `Failed to fetch product: ${error.message}` }, { status: 500 });
    }
}