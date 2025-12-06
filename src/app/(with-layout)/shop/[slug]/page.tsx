// src/app/shop/[slug]/page.tsx
import ProductDetailsClient from '@/src/components/Share/Shop/ProductDetailsClient/ProductDetailsClient';
import { Suspense } from 'react';
import { Metadata } from 'next';

type Params = {
    slug: string;
};

type Product = {
    _id: string;
    title: string;
    slug?: string;
    mainImage: string;
    mainImageAlt?: string;
    additionalImages: { url: string; alt: string }[];
    prices: { currency: string; amount: number }[];
    description: string;
    shortDescription?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
    category?: { name: string };
    availability: string;
    quantity: number;
    productType: string;
    sizeRequirement?: string;
    sizes?: { name: string; quantity: number }[];
    faqs?: { question: string; answer: string }[];
    specifications?: { name: string; value: string }[];
    aggregateRating?: { ratingValue: number; reviewCount: number };
    brand?: string;
    product_code?: string;
    isGlobal?: boolean;
    targetCity?: string;
    targetCountry?: string;
    affiliateLink?: string;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    // Await the params promise
    const { slug } = await params;

    try {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/products/slug/${slug}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            return {
                title: 'Product Not Found | Sooqra One',
                description: 'The product you are looking for does not exist.',
            };
        }

        const product: Product = await res.json();

        return {
            title: product.metaTitle || `${product.title} - Sooqra One`,
            description:
                product.metaDescription ||
                product.shortDescription ||
                product.description.slice(0, 160),
            keywords: product.keywords?.join(', ') || undefined,
            alternates: {
                canonical: `${process.env.NEXTAUTH_URL}/shop/${slug}`,
            },
            openGraph: {
                title: product.metaTitle || product.title,
                description: product.shortDescription || product.description.slice(0, 160),
                url: `${process.env.NEXTAUTH_URL}/shop/${slug}`,
                images: [
                    {
                        url: product.mainImage,
                        width: 1200,
                        height: 630,
                        alt: product.mainImageAlt || product.title,
                    },
                ],
            },
        };
    } catch (error) {
        return {
            title: 'Error | Sooqra One',
            description: 'An error occurred while loading the product.',
        };
    }
}

async function getProduct(slugOrId: string): Promise<Product> {
    const res = await fetch(
        `${process.env.NEXTAUTH_URL}/api/products/slug/${slugOrId}`,
        { cache: 'no-store' }
    );

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Product not found');
    }

    return res.json();
}

async function getLatestProducts(): Promise<Product[]> {
    const res = await fetch(
        `${process.env.NEXTAUTH_URL}/api/products?sort=createdAt&order=desc&limit=5`,
        { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    return res.json();
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    // Await the params promise
    const { slug } = await params;

    let product: Product | null = null;
    let latestProducts: Product[] = [];

    try {
        [product, latestProducts] = await Promise.all([
            getProduct(slug),
            getLatestProducts(),
        ]);
    } catch (error: any) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-3">Product Not Found</h1>
                    <p className="text-gray-600 mb-6">{error.message}</p>
                    <a
                        href="/shop"
                        className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                    >
                        ← Back to Shop
                    </a>
                </div>
            </div>
        );
    }

    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <ProductDetailsClient product={product} latestProducts={latestProducts} />
        </Suspense>
    );
}

function LoadingSkeleton() {
    return (
        <div className="container mx-auto py-12 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Image Skeleton */}
                <div className="space-y-4">
                    <div className="bg-gray-200 h-[400px] lg:h-[500px] rounded-xl animate-pulse" />
                    <div className="grid grid-cols-5 gap-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-gray-200 h-16 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* Details Skeleton */}
                <div className="space-y-6">
                    <div className="h-8 bg-gray-200 rounded-lg w-3/4 animate-pulse mb-4" />
                    <div className="h-5 bg-gray-200 rounded-lg w-1/2 animate-pulse" />

                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />

                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded-lg w-32 animate-pulse" />
                        <div className="flex gap-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-10 bg-gray-200 rounded-lg w-16 animate-pulse" />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="h-12 bg-gray-200 rounded-lg w-32 animate-pulse" />
                        <div className="h-12 bg-gray-200 rounded-lg w-32 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}