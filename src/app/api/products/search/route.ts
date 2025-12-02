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
}

// Interface for product price
interface ProductPrice {
    currency: string;
    amount: number;
    exchangeRate?: number;
}

// Interface for category
interface ProductCategory {
    _id: Types.ObjectId;
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
    _id: Types.ObjectId;
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
}

// Interface for MongoDB product document
interface MongoDBProduct {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    mainImage: string;
    mainImageAlt: string;
    prices: any[];
    description: string;
    shortDescription?: string;
    category: any;
    brand: string;
    quantity: number;
    availability: string;
    aggregateRating?: any;
    isGlobal: boolean;
    targetCountry?: string;
    targetCity?: string;
    keywords?: string[];
    createdAt: Date;
    [key: string]: any;
}

// Function to calculate relevance score
const calculateRelevanceScore = (product: MongoDBProduct, searchTerms: string[]): number => {
    let score = 0;
    const title = product.title.toLowerCase();
    const description = product.description.toLowerCase();
    const brand = product.brand.toLowerCase();
    const category = product.category?.name?.toLowerCase() || '';
    const keywords = product.keywords?.join(' ').toLowerCase() || '';

    searchTerms.forEach(term => {
        // Exact match in title - highest priority
        if (title.includes(term)) score += 10;

        // Exact match in brand
        if (brand.includes(term)) score += 8;

        // Exact match in category
        if (category.includes(term)) score += 7;

        // Exact match in keywords
        if (keywords.includes(term)) score += 6;

        // Exact match in description
        if (description.includes(term)) score += 5;

        // Partial match in title
        if (title.includes(term.substring(0, Math.max(3, term.length - 1)))) score += 4;

        // Check for number matches (like 2025)
        if (/\d{4}/.test(term) && title.includes(term)) score += 3;
    });

    // Boost score for in-stock products
    if (product.availability === 'InStock') score += 2;

    // Boost score for newer products
    const daysOld = (new Date().getTime() - new Date(product.createdAt).getTime()) / (1000 * 3600 * 24);
    if (daysOld < 30) score += 3; // Products less than 30 days old
    if (daysOld < 7) score += 2; // Products less than 7 days old

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

    // Remove common stop words (can be expanded)
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
            '2025': ['2025', '2024', '2023'],
            'shirt': ['shirt', 'shirts', 'shart', 'shert'],
            't-shirt': ['t-shirt', 'tshirt', 'tee shirt'],
            'honey': ['honey', 'honi', 'hone'],
            'nuts': ['nuts', 'nut', 'nutts'],
        };

        if (commonTypos[word]) {
            variations.push(...commonTypos[word]);
        }
    });

    // Remove duplicates
    return [...new Set(variations)];
};

// Type guard for MongoDB product
const isMongoDBProduct = (obj: any): obj is MongoDBProduct => {
    return obj &&
        typeof obj === 'object' &&
        '_id' in obj &&
        'title' in obj &&
        'slug' in obj;
};

// Helper function to safely convert to SearchResult
const convertToSearchResult = (product: any): SearchResult => {
    // Ensure _id is properly typed
    const _id = product._id instanceof Types.ObjectId
        ? product._id
        : new Types.ObjectId(product._id.toString());

    // Ensure category is properly typed
    const category: ProductCategory = {
        _id: product.category?._id instanceof Types.ObjectId
            ? product.category._id
            : new Types.ObjectId(product.category?._id?.toString() || new Types.ObjectId().toString()),
        name: product.category?.name || 'Uncategorized',
        slug: product.category?.slug || 'uncategorized'
    };

    // Ensure prices are properly typed
    const prices: ProductPrice[] = Array.isArray(product.prices)
        ? product.prices.map((price: any) => ({
            currency: price.currency || 'BDT',
            amount: typeof price.amount === 'number' ? price.amount : 0,
            exchangeRate: typeof price.exchangeRate === 'number' ? price.exchangeRate : undefined
        }))
        : [];

    // Ensure aggregateRating is properly typed
    const aggregateRating: AggregateRating = {
        ratingValue: product.aggregateRating?.ratingValue || 0,
        reviewCount: product.aggregateRating?.reviewCount || 0
    };

    return {
        _id,
        title: product.title || '',
        slug: product.slug || '',
        mainImage: product.mainImage || '',
        mainImageAlt: product.mainImageAlt || '',
        prices,
        description: product.description || '',
        shortDescription: product.shortDescription || undefined,
        category,
        brand: product.brand || '',
        quantity: typeof product.quantity === 'number' ? product.quantity : 0,
        availability: product.availability || 'InStock',
        aggregateRating,
        isGlobal: Boolean(product.isGlobal),
        targetCountry: product.targetCountry || undefined,
        targetCity: product.targetCity || undefined,
        keywords: Array.isArray(product.keywords) ? product.keywords : [],
        createdAt: product.createdAt ? new Date(product.createdAt) : new Date()
    };
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

        console.log('Search query:', query);

        // Normalize search terms
        const searchTerms = normalizeSearchQuery(query);
        console.log('Normalized search terms:', searchTerms);

        // If no search terms, return empty
        if (!query.trim() && !category) {
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
            });
        }

        // Build query conditions
        const conditions: any[] = [];

        // Text search conditions
        if (searchTerms.length > 0) {
            const textConditions: any[] = [];

            searchTerms.forEach(term => {
                const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

                textConditions.push(
                    { title: { $regex: regex } },
                    { description: { $regex: regex } },
                    { shortDescription: { $regex: regex } },
                    { brand: { $regex: regex } },
                    { keywords: { $in: [regex] } },
                    { product_code: { $regex: regex } }
                );

                // Search in size names
                textConditions.push({ 'sizes.name': { $regex: regex } });

                // Search in specifications
                textConditions.push(
                    { 'specifications.name': { $regex: regex } },
                    { 'specifications.value': { $regex: regex } }
                );

                // Search in FAQs
                textConditions.push(
                    { 'faqs.question': { $regex: regex } },
                    { 'faqs.answer': { $regex: regex } }
                );
            });

            conditions.push({ $or: textConditions });
        }

        // Category filter
        if (category) {
            // Check if category is ObjectId
            if (mongoose.Types.ObjectId.isValid(category)) {
                conditions.push({ category: new mongoose.Types.ObjectId(category) });
            } else {
                // Find category by slug or name
                const categoryDoc = await Category.findOne({
                    $or: [
                        { slug: category },
                        { name: { $regex: new RegExp(category, 'i') } }
                    ]
                });

                if (categoryDoc) {
                    conditions.push({ category: categoryDoc._id });
                }
            }
        }

        // Price filter
        if (minPrice || maxPrice) {
            const priceCondition: any = {};

            if (minPrice) {
                priceCondition['prices.amount'] = { $gte: parseFloat(minPrice) };
            }

            if (maxPrice) {
                if (priceCondition['prices.amount']) {
                    priceCondition['prices.amount'].$lte = parseFloat(maxPrice);
                } else {
                    priceCondition['prices.amount'] = { $lte: parseFloat(maxPrice) };
                }
            }

            // Filter only BDT prices for now
            priceCondition['prices.currency'] = 'BDT';
            conditions.push({ prices: { $elemMatch: priceCondition } });
        }

        // Availability filter
        if (availability) {
            conditions.push({ availability });
        }

        // Build final query
        const mongoQuery = conditions.length > 0 ? { $and: conditions } : {};

        // Execute query with pagination
        const skip = (page - 1) * limit;

        const products = await Product.find(mongoQuery)
            .populate('category', 'name slug')
            .skip(skip)
            .limit(limit)
            .lean<MongoDBProduct[]>();

        // Calculate total count for pagination
        const totalResults = await Product.countDocuments(mongoQuery);

        // Calculate relevance scores and sort
        let productsWithScores = products.map(product => ({
            ...product,
            relevanceScore: calculateRelevanceScore(product, searchTerms)
        }));

        // Filter out products with zero relevance score if searching by text
        if (searchTerms.length > 0) {
            productsWithScores = productsWithScores.filter(product => product.relevanceScore > 0);
        }

        // Sort based on selected option
        let sortedProducts = [...productsWithScores];

        if (sort === 'relevance' && searchTerms.length > 0) {
            sortedProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
        } else if (sort === 'price_asc') {
            sortedProducts.sort((a, b) => {
                const priceA = a.prices.find((p: any) => p.currency === 'BDT')?.amount || 0;
                const priceB = b.prices.find((p: any) => p.currency === 'BDT')?.amount || 0;
                return priceA - priceB;
            });
        } else if (sort === 'price_desc') {
            sortedProducts.sort((a, b) => {
                const priceA = a.prices.find((p: any) => p.currency === 'BDT')?.amount || 0;
                const priceB = b.prices.find((p: any) => p.currency === 'BDT')?.amount || 0;
                return priceB - priceA;
            });
        } else if (sort === 'newest') {
            sortedProducts.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } else if (sort === 'rating') {
            sortedProducts.sort((a, b) => {
                const ratingA = a.aggregateRating?.ratingValue || 0;
                const ratingB = b.aggregateRating?.ratingValue || 0;
                return ratingB - ratingA;
            });
        }

        // Format response using the helper function
        const formattedProducts: SearchResult[] = sortedProducts.map(convertToSearchResult);

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
        'panjabi': ['Punjabi Suit', 'Salwar Kameez', 'Traditional Dress', 'Ethnic Wear'],
        'shirt': ['T-Shirt', 'Formal Shirt', 'Casual Shirt', 'Polo Shirt'],
        '2025': ['2024 Collection', 'Latest Fashion', 'New Arrivals'],
        'honeynuts': ['Dry Fruits', 'Nuts', 'Healthy Snacks', 'Organic Food'],
        'sports': ['Sports Wear', 'Gym Clothes', 'Athletic Wear', 'Fitness Gear'],
    };

    Object.entries(commonRelated).forEach(([key, relatedTerms]) => {
        if (query.toLowerCase().includes(key)) {
            relatedTerms.forEach(term => suggestions.add(term));
        }
    });

    return Array.from(suggestions).slice(0, 10); // Return top 10 suggestions
}