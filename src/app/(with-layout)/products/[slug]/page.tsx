// src/app/(with-layout)/products/[slug]/page.tsx

import ProductDetailsClient from '@/src/components/Share/Shop/ProductDetailsClient/ProductDetailsClient';
import { Suspense } from 'react';
import { Metadata } from 'next';
import NotFound from '@/src/app/not-found';

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

// ✅ ISR enabled - revalidate every 3600 seconds (1 hour)
export const revalidate = 3600;

// ❌ Remove this line - it disables caching
// export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    try {
        // ✅ Use cache with revalidation
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/products/slug/${slug}`, {
            next: { revalidate: 3600 }, // 1 hour cache
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
            description: product.metaDescription || product.shortDescription || product.description?.slice(0, 160),
            keywords: product.keywords?.join(', ') || undefined,
            alternates: {
                canonical: `${process.env.NEXTAUTH_URL}/products/${slug}`,
            },
            openGraph: {
                title: product.metaTitle || product.title,
                description: product.shortDescription || product.description?.slice(0, 160),
                url: `${process.env.NEXTAUTH_URL}/products/${slug}`,
                images: [{
                    url: product.mainImage,
                    width: 1200,
                    height: 630,
                    alt: product.mainImageAlt || product.title,
                }],
            },
        };
    } catch (error) {
        console.error('Metadata error:', error);
        return {
            title: 'Error | Sooqra One',
            description: 'An error occurred while loading the product.',
        };
    }
}

async function getProduct(slugOrId: string): Promise<Product | null> {
    try {
        // ✅ Remove 'no-store', use revalidate instead
        const res = await fetch(
            `${process.env.NEXTAUTH_URL}/api/products/slug/${slugOrId}`,
            {
                next: { revalidate: 3600 }, // 1 hour cache
            }
        );

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

async function getLatestProducts(): Promise<Product[]> {
    try {
        // ✅ Keep revalidate for latest products
        const res = await fetch(
            `${process.env.NEXTAUTH_URL}/api/products?sort=createdAt&order=desc&limit=5`,
            { next: { revalidate: 3600 } } // 1 hour cache
        );
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error('Error fetching latest products:', error);
        return [];
    }
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const [product, latestProducts] = await Promise.all([
        getProduct(slug),
        getLatestProducts(),
    ]);

    if (!product) {
        return <NotFound />;
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
                <div className="space-y-4">
                    <div className="bg-gray-200 h-[400px] lg:h-[500px] rounded-xl animate-pulse" />
                    <div className="grid grid-cols-5 gap-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-gray-200 h-16 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="h-8 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
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