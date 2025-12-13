// src/app/api/categories/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Category from '@/src/models/Category';
import Product from '@/src/models/Products';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const withCount = searchParams.get('withCount') === 'true';
    const withLatestProduct = searchParams.get('withLatestProduct') === 'true';
    
    console.log('Fetching categories with product images...');
    
    // Get latest categories
    const categories = await Category.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    // Cast to any[] to avoid TypeScript errors
    const categoriesArray = categories as any[];
    
    if (categoriesArray.length === 0) {
      return NextResponse.json([], { status: 200 });
    }
    
    // Get categories with details
    const categoriesWithDetails = await Promise.all(
      categoriesArray.map(async (category) => {
        try {
          // Get product count
          const productCount = await Product.countDocuments({ 
            category: category._id 
          });
          
          // Get latest product for image
          let latestProduct: any = null;
          let categoryImage: string | null = null;
          
          if (withLatestProduct && productCount > 0) {
            const latestProductDoc = await Product.findOne(
              { category: category._id },
              { mainImage: 1, mainImageAlt: 1, title: 1, slug: 1 }
            )
            .sort({ createdAt: -1 })
            .lean();
            
            // Cast to any to access properties
            latestProduct = latestProductDoc as any;
            
            if (latestProduct && latestProduct.mainImage) {
              categoryImage = latestProduct.mainImage;
            }
          }
          
          return {
            _id: category._id.toString(),
            name: category.name,
            slug: category.slug,
            productCount: productCount || 0,
            image: categoryImage || null,
            latestProduct: latestProduct ? {
              mainImage: latestProduct.mainImage,
              mainImageAlt: latestProduct.mainImageAlt,
              title: latestProduct.title,
              slug: latestProduct.slug,
              _id: latestProduct._id?.toString()
            } : null,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
          };
        } catch (err) {
          console.error(`Error processing category ${category._id}:`, err);
          return {
            _id: category._id.toString(),
            name: category.name,
            slug: category.slug,
            productCount: 0,
            image: null,
            latestProduct: null,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
          };
        }
      })
    );
    
    return NextResponse.json(categoriesWithDetails, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: `Failed to fetch categories: ${error.message}` },
      { status: 500 }
    );
  }
}