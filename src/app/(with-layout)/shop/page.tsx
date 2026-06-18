import ShopClient from '@/src/components/Share/Shop/ShopClient/ShopClient';
import ShopHeroSection from '@/src/components/Share/Shop/ShopHeroSection/ShopHeroSection';
import { Suspense } from 'react';
export const dynamic = 'force-dynamic';

// ── Interfaces ──────────────────────────────────────────────────────────────

interface Price {
    currency: string;
    amount: number;
    exchangeRate?: number;
}

interface Size {
    name: string;
    quantity: number;
}

interface Product {
    _id: string;
    title: string;
    slug: string;
    mainImage: string;
    mainImageAlt?: string;
    prices: Price[];
    quantity: number;
    availability: string;
    productType: string;
    sizeRequirement?: string;
    sizes?: Size[];
    hasVariants?: boolean;
    aggregateRating?: {
        ratingValue: number;
        reviewCount: number;
    };
    createdAt: string;
    tags?: string[];
}

interface StructuredData {
    '@context': string;
    '@type': string;
    name: string;
    description: string;
    url: string;
    itemListElement: Array<{
        '@type': string;
        position: number;
        name: string;
        image: string;
        url: string;
        offers: {
            '@type': string;
            priceCurrency: string;
            price: number;
            availability: string;
        };
    }>;
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata() {
    let products: Product[] = [];
    try {
        products = await getProducts();
    } catch (error) {
        console.error('Metadata fetch error:', error);
    }

    const description = products.length > 0
        ? `Browse our collection of ${products.length} high-quality products at Sooqra One. Find the best deals with fast delivery.`
        : 'Browse our collection of high-quality products at Sooqra One. Find the best deals with fast delivery.';

    return {
        title: 'Shop - Sooqra One | Premium Organic Products',
        description,
        openGraph: {
            title: 'Shop - Sooqra One | Premium Organic Products',
            description,
            url: `${process.env.NEXTAUTH_URL}/shop`,
            type: 'website',
            images: products[0]?.mainImage ? [{ url: products[0].mainImage, width: 1200, height: 630, alt: products[0].title }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Shop - Sooqra One | Premium Organic Products',
            description,
            images: products[0]?.mainImage ? [products[0].mainImage] : [],
        },
    };
}

// ── Structured data ───────────────────────────────────────────────────────────

function getStructuredData(products: Product[]): StructuredData {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Sooqra One Shop',
        description: 'Browse our collection of high-quality organic products at Sooqra One.',
        url: `${process.env.NEXTAUTH_URL}/shop`,
        itemListElement: products.slice(0, 20).map((product, index) => ({
            '@type': 'Product',
            position: index + 1,
            name: product.title,
            image: product.mainImage,
            url: `${process.env.NEXTAUTH_URL}/shop/${product.slug}`,
            offers: {
                '@type': 'Offer',
                priceCurrency: 'BDT',
                price: product.prices.find(p => p.currency === 'BDT')?.amount || 0,
                availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
        })),
    };
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getProducts(): Promise<Product[]> {
    const res = await fetch(
        `${process.env.NEXTAUTH_URL}/api/products?limit=100`,
        { cache: 'no-store' }  // ✅ Changed from next: { tags } to no-store for fresh data
    );
    if (!res.ok) throw new Error('Failed to fetch products');
    const products = await res.json();
    return products.sort((a: Product, b: Product) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function Shop() {
    let products: Product[] = [];
    let error = null;

    try {
        products = await getProducts();
    } catch (err) {
        console.error('Error fetching products:', err);
        error = 'Failed to load products';
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Shop</h1>
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl">
                        <p className="font-medium mb-1">Failed to load products</p>
                        <p className="text-sm">Please try again later or contact support.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero Banner */}
            <ShopHeroSection />

            {/* Products */}
            <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
                <Suspense fallback={<LoadingSkeleton />}>
                    <ShopClient
                        products={products}
                        structuredData={getStructuredData(products)}
                    />
                </Suspense>
            </div>
        </main>
    );
}

// ── Loading skeleton (Suspense fallback) ──────────────────────────────────────

function LoadingSkeleton() {
    return (
        <div className="py-6">
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-48 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded-lg w-28 animate-pulse" />
                </div>
                <div className="h-9 bg-gray-200 rounded-lg w-40 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                        <div className="aspect-square bg-gray-200" />
                        <div className="p-3 space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-full" />
                            <div className="h-3 bg-gray-200 rounded w-3/4" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                            <div className="flex gap-1.5 pt-1">
                                <div className="flex-1 h-7 bg-gray-200 rounded-lg" />
                                <div className="flex-1 h-7 bg-gray-200 rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}