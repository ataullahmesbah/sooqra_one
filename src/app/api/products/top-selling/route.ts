import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Products from '@/src/models/Products';
import Order from '@/src/models/Order';
import TopSellingConfig from '@/src/models/TopSellingConfig';
import ProductVariant from '@/src/models/ProductVariant';

// Helper function to get product total sales from orders
async function getProductSales() {
    const orders = await Order.find({
        status: { $in: ['delivered', 'completed', 'pending'] }
    }).lean();

    const salesMap = new Map<string, number>();

    for (const order of orders) {
        for (const item of order.products) {
            const productId = item.productId.toString();
            const quantity = item.quantity || 1;

            if (salesMap.has(productId)) {
                salesMap.set(productId, (salesMap.get(productId) || 0) + quantity);
            } else {
                salesMap.set(productId, quantity);
            }
        }
    }

    return salesMap;
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '15');

        // Get admin manual selection config
        let config = await TopSellingConfig.findOne();
        if (!config) {
            config = await TopSellingConfig.create({
                mode: 'auto',
                pinnedProducts: []
            });
        }

        // Get all products with population
        const allProducts = await Products.find({ availability: 'InStock' })
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug')
            .lean();

        // Get sales data
        const salesMap = await getProductSales();

        // Calculate sales count for each product
        const productsWithSales = allProducts.map((product: any) => ({
            ...product,
            total_sales: salesMap.get(product._id.toString()) || 0
        }));

        let topProducts: any[] = [];

        if (config.mode === 'manual' && config.pinnedProducts.length > 0) {
            const pinnedProducts: any[] = [];
            const remainingProducts: any[] = [];

            for (const product of productsWithSales) {
                const pinnedIndex = config.pinnedProducts.findIndex(
                    (p: any) => p.productId.toString() === product._id.toString()
                );

                if (pinnedIndex !== -1) {
                    pinnedProducts.push({
                        ...product,
                        pinnedOrder: config.pinnedProducts[pinnedIndex].order,
                        isPinned: true
                    });
                } else {
                    remainingProducts.push(product);
                }
            }

            pinnedProducts.sort((a, b) => a.pinnedOrder - b.pinnedOrder);
            remainingProducts.sort((a, b) => b.total_sales - a.total_sales);
            topProducts = [...pinnedProducts, ...remainingProducts];
        } else {
            productsWithSales.sort((a, b) => b.total_sales - a.total_sales);
            topProducts = productsWithSales;
        }

        const limitedProducts = topProducts.slice(0, limit);

        // ✅ এখানেই Variant Price Range বের করার কোড যোগ করতে হবে
        const formattedProducts = [];

        for (const product of limitedProducts) {
            let displayPrice = null;
            let priceRange = null;

            // ✅ Check for variants - এই অংশটি আপডেট করুন
            if (product.hasVariants) {
                // Fetch variants from database
                const variants = await ProductVariant.find({ productId: product._id }).lean();

                if (variants && variants.length > 0) {
                    const variantPrices = variants.map((v: any) => v.price);
                    const minPrice = Math.min(...variantPrices);
                    const maxPrice = Math.max(...variantPrices);

                    if (minPrice === maxPrice) {
                        displayPrice = minPrice;
                    } else {
                        priceRange = { min: minPrice, max: maxPrice };
                    }
                }
            }

            // If no variants or variant price not found, use regular price
            if (!displayPrice && !priceRange) {
                const bdtPrice = product.prices?.find((p: any) => p.currency === 'BDT');
                if (bdtPrice) {
                    displayPrice = bdtPrice.amount;
                }
            }

            formattedProducts.push({
                _id: product._id,
                title: product.title,
                slug: product.slug,
                mainImage: product.mainImage,
                mainImageAlt: product.mainImageAlt,
                shortDescription: product.shortDescription,
                displayPrice,
                priceRange,
                hasVariants: product.hasVariants || false,
                total_sales: product.total_sales,
                isPinned: product.isPinned || false,
                pinnedOrder: product.pinnedOrder,
                brand: product.brand,
                category: product.category,
                subCategory: product.subCategory,
                availability: product.availability,
                productType: product.productType,
                quantity: product.quantity
            });
        }

        return NextResponse.json({
            success: true,
            mode: config.mode,
            products: formattedProducts,
            total: formattedProducts.length
        });

    } catch (error: any) {
        console.error('Error fetching top selling products:', error);
        return NextResponse.json(
            { error: `Failed to fetch top selling products: ${error.message}` },
            { status: 500 }
        );
    }
}