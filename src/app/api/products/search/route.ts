

import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose';
import Product from '@/src/models/Products';
import Category from '@/src/models/Category';
import dbConnect from '@/src/lib/dbConnect';

// Interface for search query
interface SearchQuery {
    q?: string;
    page?: string;
    limit?: string;
    category?: string;
    sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
    minPrice?: string;
    maxPrice?: string;
    availability?: string;
    brand?: string;
}

// Interface for product price
interface ProductPrice {
    currency: string;
    amount: number;
    exchangeRate?: number;
}

// Interface for category
interface ProductCategory {
    _id: string;
    name: string;
    slug: string;
}

// Interface for aggregate rating
interface AggregateRating {
    ratingValue: number;
    reviewCount: number;
}

// Interface for search result
interface SearchResult {
    _id: string;
    title: string;
    slug: string;
    mainImage: string;
    mainImageAlt: string;
    prices: ProductPrice[];
    description: string;
    shortDescription?: string;
    category: ProductCategory;
    brand: string;
    quantity: number;
    availability: string;
    aggregateRating: AggregateRating;
    isGlobal: boolean;
    targetCountry?: string;
    targetCity?: string;
    keywords: string[];
    createdAt: Date;
    bdtPrice: number;
}

// Function to calculate relevance score
const calculateRelevanceScore = (product: any, searchTerms: string[]): number => {
    let score = 0;
    const title = product.title?.toLowerCase() || '';
    const description = product.description?.toLowerCase() || '';
    const brand = product.brand?.toLowerCase() || '';
    const categoryName = product.category?.name?.toLowerCase() || '';
    const keywords = product.keywords?.join(' ').toLowerCase() || '';

    searchTerms.forEach(term => {
        // Exact match in title - highest priority
        if (title.includes(term)) score += 10;

        // Exact match in brand
        if (brand.includes(term)) score += 8;

        // Exact match in category name
        if (categoryName.includes(term)) score += 7;

        // Exact match in keywords
        if (keywords.includes(term)) score += 6;

        // Exact match in description
        if (description.includes(term)) score += 5;

        // Partial match in title
        if (term.length > 3 && title.includes(term.substring(0, Math.max(3, term.length - 1)))) {
            score += 4;
        }

        // Check for number matches (like 2025)
        if (/\d{4}/.test(term) && title.includes(term)) score += 3;
    });

    // Boost score for in-stock products
    if (product.availability === 'InStock') score += 2;

    // Boost score for newer products
    const daysOld = product.createdAt
        ? (new Date().getTime() - new Date(product.createdAt).getTime()) / (1000 * 3600 * 24)
        : 1000;

    if (daysOld < 30) score += 3;
    if (daysOld < 7) score += 2;

    // Boost score for high rating
    if (product.aggregateRating?.ratingValue >= 4) score += 2;

    return score;
};

// Function to clean and normalize search query
const normalizeSearchQuery = (query: string): string[] => {
    if (!query) return [];

    // Convert to lowercase and trim
    const cleaned = query.toLowerCase().trim();

    // Remove special characters except spaces and hyphens
    const noSpecialChars = cleaned.replace(/[^\w\s-]/g, ' ');

    // Split into words and remove empty strings
    const words = noSpecialChars.split(/\s+/).filter(word => word.length > 0);

    // Remove common stop words
    const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const filteredWords = words.filter(word => !stopWords.has(word) && word.length > 1);

    // Generate variations for common misspellings
    const variations: string[] = [];
    filteredWords.forEach(word => {
        variations.push(word);

        // Add partial matches for longer words
        if (word.length > 3) {
            variations.push(word.substring(0, word.length - 1));
            variations.push(word.substring(0, word.length - 2));
        }

        // Add variations for common typos
        const commonTypos: Record<string, string[]> = {
            'panjabi': ['panjabi', 'punjabi', 'panjabi'],
            'collection': ['collection', 'collecton', 'colection'],
            'best': ['best', 'best', 'bests'],
            '2025': ['2025', '2024', '2023', '2022'],
            'shirt': ['shirt', 'shirts', 'shart', 'shert'],
            't-shirt': ['t-shirt', 'tshirt', 'tee shirt', 't shirt'],
            'honey': ['honey', 'honi', 'hone'],
            'nuts': ['nuts', 'nut', 'nutts'],
            'attar': ['attar', 'atar', 'attarr'],
            'sports': ['sports', 'sport', 'spotrs'],
            'fashion': ['fashion', 'fashon', 'fashin'],
        };

        if (commonTypos[word]) {
            variations.push(...commonTypos[word]);
        }
    });

    // Remove duplicates and return
    return [...new Set(variations)];
};

// Helper function to get BDT price
const getBDTPrice = (prices: any[]): number => {
    const bdtPrice = prices?.find((p: any) => p.currency === 'BDT');
    return bdtPrice?.amount || 0;
};

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get search parameters
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const category = searchParams.get('category');
        const sort = searchParams.get('sort') as SearchQuery['sort'] || 'relevance';
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const availability = searchParams.get('availability');
        const brand = searchParams.get('brand');

        console.log('Search query:', query);

        // Normalize search terms
        const searchTerms = normalizeSearchQuery(query);
        console.log('Normalized search terms:', searchTerms);

        // If no search terms and no filters, return empty
        if (!query.trim() && !category && !brand && !minPrice && !maxPrice) {
            return NextResponse.json({
                success: true,
                data: [],
                pagination: {
                    page: 1,
                    limit,
                    totalPages: 0,
                    totalResults: 0,
                },
                suggestions: [],
                searchTerms: [],
            });
        }

        // Build query conditions
        const conditions: any[] = [];

        // Text search conditions - Search in multiple fields
        if (searchTerms.length > 0) {
            const textConditions: any[] = [];

            searchTerms.forEach(term => {
                const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

                // Search in product fields
                textConditions.push(
                    { title: { $regex: regex } },
                    { description: { $regex: regex } },
                    { shortDescription: { $regex: regex } },
                    { brand: { $regex: regex } },
                    { product_code: { $regex: regex } }
                );

                // Search in keywords array
                textConditions.push({ keywords: { $in: [regex] } });

                // Search in category name via population
                textConditions.push({ 'category.name': { $regex: regex } });
            });

            if (textConditions.length > 0) {
                conditions.push({ $or: textConditions });
            }
        }

        // Category filter
        if (category) {
            let categoryId;

            // Check if category is ObjectId
            if (mongoose.Types.ObjectId.isValid(category)) {
                categoryId = new mongoose.Types.ObjectId(category);
            } else {
                // Find category by slug or name
                const categoryDoc = await Category.findOne({
                    $or: [
                        { slug: category },
                        { name: { $regex: new RegExp(category, 'i') } }
                    ]
                });

                if (categoryDoc) {
                    categoryId = categoryDoc._id;
                } else {
                    return NextResponse.json({
                        success: false,
                        error: 'Category not found',
                        data: [],
                    }, { status: 404 });
                }
            }

            conditions.push({ category: categoryId });
        }

        // Brand filter
        if (brand) {
            conditions.push({ brand: { $regex: new RegExp(brand, 'i') } });
        }

        // Price filter
        if (minPrice || maxPrice) {
            const priceCondition: any = {
                'prices.currency': 'BDT'
            };

            if (minPrice) {
                const min = parseFloat(minPrice);
                if (!isNaN(min)) {
                    priceCondition['prices.amount'] = { $gte: min };
                }
            }

            if (maxPrice) {
                const max = parseFloat(maxPrice);
                if (!isNaN(max)) {
                    if (priceCondition['prices.amount']) {
                        priceCondition['prices.amount'].$lte = max;
                    } else {
                        priceCondition['prices.amount'] = { $lte: max };
                    }
                }
            }

            conditions.push({ prices: { $elemMatch: priceCondition } });
        }

        // Availability filter
        if (availability) {
            conditions.push({ availability });
        }

        // Build final query
        const mongoQuery = conditions.length > 0 ? { $and: conditions } : {};

        console.log('MongoDB Query:', JSON.stringify(mongoQuery, null, 2));

        // Execute query with pagination
        const skip = (page - 1) * limit;

        const products = await Product.find(mongoQuery)
            .populate('category', 'name slug')
            .skip(skip)
            .limit(limit)
            .lean();

        // Calculate total count for pagination
        const totalResults = await Product.countDocuments(mongoQuery);

        // Format products and add BDT price
        let formattedProducts: SearchResult[] = products.map((product: any) => ({
            _id: product._id.toString(),
            title: product.title || '',
            slug: product.slug || '',
            mainImage: product.mainImage || '',
            mainImageAlt: product.mainImageAlt || '',
            prices: product.prices || [],
            description: product.description || '',
            shortDescription: product.shortDescription || undefined,
            category: product.category ? {
                _id: product.category._id.toString(),
                name: product.category.name || 'Uncategorized',
                slug: product.category.slug || 'uncategorized'
            } : {
                _id: '',
                name: 'Uncategorized',
                slug: 'uncategorized'
            },
            brand: product.brand || '',
            quantity: product.quantity || 0,
            availability: product.availability || 'InStock',
            aggregateRating: {
                ratingValue: product.aggregateRating?.ratingValue || 0,
                reviewCount: product.aggregateRating?.reviewCount || 0
            },
            isGlobal: product.isGlobal || false,
            targetCountry: product.targetCountry || undefined,
            targetCity: product.targetCity || undefined,
            keywords: product.keywords || [],
            createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
            bdtPrice: getBDTPrice(product.prices)
        }));

        // Calculate relevance scores and sort
        if (sort === 'relevance' && searchTerms.length > 0) {
            formattedProducts = formattedProducts
                .map(product => ({
                    ...product,
                    relevanceScore: calculateRelevanceScore(product, searchTerms)
                }))
                .filter(product => product.relevanceScore > 0)
                .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        } else if (sort === 'price_asc') {
            formattedProducts.sort((a, b) => a.bdtPrice - b.bdtPrice);
        } else if (sort === 'price_desc') {
            formattedProducts.sort((a, b) => b.bdtPrice - a.bdtPrice);
        } else if (sort === 'newest') {
            formattedProducts.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } else if (sort === 'rating') {
            formattedProducts.sort((a, b) =>
                (b.aggregateRating.ratingValue || 0) - (a.aggregateRating.ratingValue || 0)
            );
        }

        // Generate search suggestions
        const suggestions = await generateSuggestions(query, formattedProducts);

        return NextResponse.json({
            success: true,
            data: formattedProducts,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalResults / limit),
                totalResults,
            },
            suggestions,
            searchTerms,
        });

    } catch (error: any) {
        console.error('Search API error:', error);

        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error',
            data: [],
            pagination: {
                page: 1,
                limit: 12,
                totalPages: 0,
                totalResults: 0,
            },
            suggestions: [],
            searchTerms: [],
        }, { status: 500 });
    }
}

// Function to generate search suggestions
async function generateSuggestions(query: string, products: SearchResult[]): Promise<string[]> {
    if (!query.trim() || products.length === 0) return [];

    const suggestions: Set<string> = new Set();

    // Add category suggestions
    products.forEach(product => {
        if (product.category?.name) {
            suggestions.add(product.category.name);
        }
    });

    // Add brand suggestions
    products.forEach(product => {
        if (product.brand) {
            suggestions.add(product.brand);
        }
    });

    // Add keyword suggestions
    products.forEach(product => {
        if (product.keywords && product.keywords.length > 0) {
            product.keywords.forEach(keyword => {
                if (keyword.toLowerCase().includes(query.toLowerCase())) {
                    suggestions.add(keyword);
                }
            });
        }
    });

    // Generate related search terms
    const commonRelated: Record<string, string[]> = {
        'panjabi': ['Punjabi Dress', 'Salwar Kameez', 'Traditional Wear', 'Ethnic Dress'],
        'shirt': ['T-Shirt', 'Formal Shirt', 'Casual Shirt', 'Polo Shirt'],
        '2025': ['2024 Collection', 'Latest Fashion', 'New Arrivals', 'Trending Now'],
        'honey': ['Honey Products', 'Natural Honey', 'Organic Honey', 'Pure Honey'],
        'nuts': ['Dry Fruits', 'Mixed Nuts', 'Almonds', 'Cashews'],
        'sports': ['Sports Wear', 'Gym Clothes', 'Athletic Wear', 'Fitness Gear'],
        'attar': ['Perfume', 'Fragrance', 'Scent', 'Aroma'],
        'best': ['Top Rated', 'Popular', 'Recommended', 'Best Selling'],
    };

    Object.entries(commonRelated).forEach(([key, relatedTerms]) => {
        if (query.toLowerCase().includes(key)) {
            relatedTerms.forEach(term => suggestions.add(term));
        }
    });

    return Array.from(suggestions).slice(0, 8);
}