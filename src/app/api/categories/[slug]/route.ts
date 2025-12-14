// src/app/api/categories/[slug]/route.ts - OPTIMIZED
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Category from '@/src/models/Category';
import Product from '@/src/models/Products';

interface Params {
  slug: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    await dbConnect();
    const { slug } = await context.params;

    // Decode URL if needed
    const decodedSlug = decodeURIComponent(slug);

    // Find category - multiple matching strategies
    let category = await Category.findOne({
      slug: { $regex: new RegExp(`^${decodedSlug}$`, 'i') }
    }).lean();

    if (!category) {
      // Try to find by name (convert slug to name)
      const categoryName = decodedSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      category = await Category.findOne({
        name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
      }).lean();
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found', success: false },
        { status: 404 }
      );
    }

    // Fetch products for this category
    const products = await Product.find({
      category: (category as any)._id
    })
      .sort({ createdAt: -1 })
      .select('title slug mainImage mainImageAlt shortDescription description prices availability')
      .lean();

    // Prepare response data
    const responseData = {
      success: true,
      category: {
        _id: (category as any)._id.toString(),
        name: (category as any).name,
        slug: (category as any).slug,
        description: (category as any).description || null,
        createdAt: (category as any).createdAt?.toISOString() || null,
        updatedAt: (category as any).updatedAt?.toISOString() || null,
      },
      products: (products as any[]).map(product => ({
        _id: product._id.toString(),
        title: product.title,
        slug: product.slug || null,
        mainImage: product.mainImage || null,
        mainImageAlt: product.mainImageAlt || null,
        shortDescription: product.shortDescription || null,
        description: product.description || null,
        prices: product.prices || [],
        availability: product.availability || 'InStock',
      })),
      count: products.length,
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Server error',
        details: error.message,
        success: false
      },
      { status: 500 }
    );
  }
}