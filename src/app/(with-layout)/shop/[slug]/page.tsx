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
                title: 'Product Not Found | Ataullah Mesbah',
                description: 'The product you are looking for does not exist.',
            };
        }

        const product: Product = await res.json();

        return {
            title: product.metaTitle || `${product.title} - Ataullah Mesbah`,
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
                        width: 800,
                        height: 800,
                        alt: product.mainImageAlt || product.title,
                    },
                ],
            },
        };
    } catch (error) {
        return {
            title: 'Error | Ataullah Mesbah',
            description: 'description',
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
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
                    <p className="text-red-400 mb-6">{error.message}</p>
                    <a
                        href="/shop"
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:opacity-90"
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
        <div className="container mx-auto py-16 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-gray-800 h-96 rounded-xl animate-pulse" />
                <div className="space-y-y-6">
                    <div className="h-10 bg-gray-800 rounded w-3/4 animate-pulse mb-4" />
                    <div className="h-6 bg-gray-800 rounded w-full animate-pulse" />
                    <div className="h-6 bg-gray-800 rounded w-5/6 animate-pulse mt-2" />
                    <div className="h-32 bg-gray-800 rounded mt-8 animate-pulse" />
                </div>
            </div>
        </div>
    );
}