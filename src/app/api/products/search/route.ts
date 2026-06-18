// src/app/api/products/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Product from '@/src/models/Products';
import ProductVariant from '@/src/models/ProductVariant';
import Category from '@/src/models/Category';
import dbConnect from '@/src/lib/dbConnect';

// ── Types ──────────────────────────────────────────────────────────────────────
interface ProductPrice { currency: string; amount: number; }
interface SearchResult {
    _id: string; title: string; slug: string;
    mainImage: string; mainImageAlt: string;
    prices: ProductPrice[];
    category: { _id: string; name: string; slug: string };
    brand: string; quantity: number; availability: string;
    aggregateRating: { ratingValue: number; reviewCount: number };
    bdtPrice: number;       // ✅ normal product price
    minVariantPrice: number | null;  // ✅ variant min price
    maxVariantPrice: number | null;  // ✅ variant max price
    hasVariants: boolean;
    createdAt: Date;
    keywords: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const getBDTPrice = (prices: any[]): number =>
    prices?.find((p: any) => p.currency === 'BDT')?.amount || 0;

const scoreProduct = (product: any, terms: string[]): number => {
    let s = 0;
    const t = (product.title || '').toLowerCase();
    const b = (product.brand || '').toLowerCase();
    const cat = (product.category?.name || '').toLowerCase();
    const kw = (product.keywords || []).join(' ').toLowerCase();
    const desc = (product.description || '').toLowerCase();

    terms.forEach(term => {
        if (t.includes(term)) s += 10;
        if (b.includes(term)) s += 8;
        if (cat.includes(term)) s += 7;
        if (kw.includes(term)) s += 6;
        if (desc.includes(term)) s += 3;
    });

    if (product.availability === 'InStock') s += 2;
    const days = product.createdAt
        ? (Date.now() - new Date(product.createdAt).getTime()) / 86400000 : 999;
    if (days < 7) s += 3;
    else if (days < 30) s += 2;
    if ((product.aggregateRating?.ratingValue || 0) >= 4) s += 1;
    return s;
};

// ── GET ────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const sp = request.nextUrl.searchParams;
        const query = (sp.get('q') || '').trim();
        const page = Math.max(1, parseInt(sp.get('page') || '1'));
        const limit = Math.min(50, parseInt(sp.get('limit') || '12'));
        const category = sp.get('category');
        const sortParam = sp.get('sort') || 'relevance';
        const minPrice = sp.get('minPrice');
        const maxPrice = sp.get('maxPrice');
        const availability = sp.get('availability');
        const brand = sp.get('brand');

        // Empty request
        if (!query && !category && !brand && !minPrice && !maxPrice) {
            return NextResponse.json({
                success: true, data: [],
                pagination: { page: 1, limit, totalPages: 0, totalResults: 0 },
            });
        }

        // ── Build query ────────────────────────────────────────────────────────
        const andConditions: any[] = [];

        if (query) {
            // ✅ Each word must match in at least ONE field — proper multi-word search
            const terms = query.toLowerCase()
                .replace(/[^\w\s\u0980-\u09FF-]/g, ' ')  // keep Bengali chars
                .split(/\s+/)
                .filter(w => w.length > 0);

            terms.forEach(term => {
                const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                andConditions.push({
                    $or: [
                        { title: rx },
                        { brand: rx },
                        { description: rx },
                        { shortDescription: rx },
                        { product_code: rx },
                        { keywords: { $in: [rx] } },
                        { bulletPoints: { $in: [rx] } },
                    ]
                });
            });
        }

        // Category
        if (category) {
            let catId: mongoose.Types.ObjectId;
            if (mongoose.Types.ObjectId.isValid(category)) {
                catId = new mongoose.Types.ObjectId(category);
            } else {
                const catDoc = await Category.findOne({
                    $or: [
                        { slug: category },
                        { name: { $regex: new RegExp(category, 'i') } }
                    ]
                });
                if (!catDoc) {
                    return NextResponse.json(
                        { success: false, error: 'Category not found', data: [] },
                        { status: 404 }
                    );
                }
                catId = catDoc._id;
            }
            andConditions.push({ category: catId });
        }

        // Brand
        if (brand) andConditions.push({ brand: { $regex: new RegExp(brand, 'i') } });

        // Price (BDT only, for non-variant products)
        if (minPrice || maxPrice) {
            const amountCond: any = {};
            if (minPrice && !isNaN(+minPrice)) amountCond.$gte = +minPrice;
            if (maxPrice && !isNaN(+maxPrice)) amountCond.$lte = +maxPrice;
            andConditions.push({
                prices: {
                    $elemMatch: {
                        currency: 'BDT',
                        amount: amountCond,
                    }
                }
            });
        }

        // Availability
        if (availability) andConditions.push({ availability });

        const mongoQuery = andConditions.length > 0 ? { $and: andConditions } : {};
        const skip = (page - 1) * limit;

        // ── Fetch products ─────────────────────────────────────────────────────
        // Fetch more than needed so we can re-rank by relevance then slice
        const fetchLimit = sortParam === 'relevance' ? limit * 4 : limit;

        const [products, totalResults] = await Promise.all([
            Product.find(mongoQuery)
                .populate('category', 'name slug')
                .skip(skip)
                .limit(fetchLimit)
                .lean(),
            Product.countDocuments(mongoQuery),
        ]);

        // ── Fetch variant prices in one batch ─────────────────────────────────
        // ✅ Find all product IDs that have variants
        const variantProductIds = products
            .filter((p: any) => p.hasVariants)
            .map((p: any) => p._id);

        // ✅ Batch fetch all variants for these products at once (no N+1 problem)
        const variantPriceMap: Record<string, { min: number; max: number }> = {};

        if (variantProductIds.length > 0) {
            const allVariants = await ProductVariant.find({
                productId: { $in: variantProductIds },
                quantity: { $gt: 0 }, // only in-stock variants
            })
                .select('productId price')
                .lean();

            allVariants.forEach((v: any) => {
                const pid = v.productId.toString();
                if (!variantPriceMap[pid]) {
                    variantPriceMap[pid] = { min: v.price, max: v.price };
                } else {
                    variantPriceMap[pid].min = Math.min(variantPriceMap[pid].min, v.price);
                    variantPriceMap[pid].max = Math.max(variantPriceMap[pid].max, v.price);
                }
            });
        }

        // ── Format ─────────────────────────────────────────────────────────────
        let formatted: (SearchResult & { _score?: number })[] = products.map((p: any) => {
            const pid = p._id.toString();
            const variantRange = variantPriceMap[pid] || null;

            return {
                _id: pid,
                title: p.title || '',
                slug: p.slug || '',
                mainImage: p.mainImage || '',
                mainImageAlt: p.mainImageAlt || '',
                prices: p.prices || [],
                category: p.category
                    ? { _id: p.category._id.toString(), name: p.category.name || '', slug: p.category.slug || '' }
                    : { _id: '', name: 'Uncategorized', slug: '' },
                brand: p.brand || '',
                quantity: p.quantity || 0,
                availability: p.availability || 'InStock',
                aggregateRating: {
                    ratingValue: p.aggregateRating?.ratingValue || 0,
                    reviewCount: p.aggregateRating?.reviewCount || 0,
                },
                keywords: p.keywords || [],
                createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
                hasVariants: !!p.hasVariants,
                // ✅ Variant products: use variant price range
                // ✅ Normal products: use BDT price from prices array
                bdtPrice: variantRange ? variantRange.min : getBDTPrice(p.prices),
                minVariantPrice: variantRange?.min ?? null,
                maxVariantPrice: variantRange?.max ?? null,
            };
        });

        // ── Sort ───────────────────────────────────────────────────────────────
        const queryTerms = query.toLowerCase().split(/\s+/).filter(w => w.length > 0);

        switch (sortParam) {
            case 'relevance':
                if (queryTerms.length > 0) {
                    formatted = formatted
                        .map(p => ({ ...p, _score: scoreProduct(p, queryTerms) }))
                        .sort((a, b) => (b._score || 0) - (a._score || 0))
                        .slice(0, limit);
                } else {
                    formatted = formatted.slice(0, limit);
                }
                break;

            case 'price_asc':
                // ✅ Sort by effective price (variant min or normal price)
                formatted.sort((a, b) => a.bdtPrice - b.bdtPrice);
                formatted = formatted.slice(0, limit);
                break;

            case 'price_desc':
                formatted.sort((a, b) => b.bdtPrice - a.bdtPrice);
                formatted = formatted.slice(0, limit);
                break;

            case 'newest':
                formatted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
                formatted = formatted.slice(0, limit);
                break;

            case 'rating':
                formatted.sort((a, b) =>
                    (b.aggregateRating.ratingValue || 0) - (a.aggregateRating.ratingValue || 0)
                );
                formatted = formatted.slice(0, limit);
                break;

            default:
                formatted = formatted.slice(0, limit);
        }

        return NextResponse.json(
            {
                success: true,
                data: formatted,
                pagination: {
                    page, limit,
                    totalPages: Math.ceil(totalResults / limit),
                    totalResults,
                },
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
                },
            }
        );

    } catch (error: any) {
        console.error('Search error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Internal server error',
                data: [],
                pagination: { page: 1, limit: 12, totalPages: 0, totalResults: 0 },
            },
            { status: 500 }
        );
    }
}