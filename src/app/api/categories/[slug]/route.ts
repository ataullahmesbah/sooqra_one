// src/app/api/categories/[slug]/route.ts
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

    console.log('🔍 API: Searching for category with slug:', slug);

    // Decode URL if needed
    const decodedSlug = decodeURIComponent(slug);
    
    // Find category
    const category = await Category.findOne({
      slug: { $regex: new RegExp(`^${decodedSlug}$`, 'i') }
    }).lean();

    if (!category) {
      console.log('❌ API: Category not found for slug:', decodedSlug);
      return NextResponse.json(
        { error: `Category not found: ${decodedSlug}`, success: false },
        { status: 404 }
      );
    }

    console.log('✅ API: Found category:', (category as any).name);
    
    // Fetch products
    const products = await Product.find({ 
      category: (category as any)._id 
    })
      .sort({ createdAt: -1 })
      .lean();

    console.log('🛒 API: Found products:', products.length);

    // Type assertion for the response
    const serializedCategory = {
      ...category,
      _id: (category as any)._id.toString(),
      createdAt: (category as any).createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: (category as any).updatedAt?.toISOString() || new Date().toISOString(),
    };

    const serializedProducts = (products as any[]).map(product => ({
      ...product,
      _id: product._id.toString(),
      category: product.category ? product.category.toString() : null,
      subCategory: product.subCategory ? product.subCategory.toString() : null,
    }));

    return NextResponse.json({
      success: true,
      category: serializedCategory,
      products: serializedProducts,
      count: products.length,
    }, { status: 200 });
  } catch (error: any) {
    console.error('🚨 API Error:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message, success: false },
      { status: 500 }
    );
  }
}