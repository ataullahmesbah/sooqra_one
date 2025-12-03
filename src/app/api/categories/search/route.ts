import dbConnect from '@/src/lib/dbConnect';
import Category from '@/src/models/Category';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit') || '10');

        let categories;

        if (query.trim()) {
            // Search categories by name or slug
            categories = await Category.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { slug: { $regex: query, $options: 'i' } }
                ]
            })
                .limit(limit)
                .lean();
        } else {
            // Get all categories
            categories = await Category.find({})
                .limit(limit)
                .lean();
        }

        return NextResponse.json(categories, { status: 200 });

    } catch (error: any) {
        console.error('Categories search error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}