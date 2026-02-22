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
                canonical: `${process.env.NEXTAUTH_URL}/products/${slug}`,
            },
            openGraph: {
                title: product.metaTitle || product.title,
                description: product.shortDescription || product.description.slice(0, 160),
                url: `${process.env.NEXTAUTH_URL}/products/${slug}`,
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
            <div className="">
                < NotFound />
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