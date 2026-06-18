// src/app/(with-layout)/products/[slug]/page.tsx

import ProductDetailsClient from '@/src/components/Share/Shop/ProductDetailsClient/ProductDetailsClient';
import { Suspense } from 'react';
import { Metadata } from 'next';
import NotFound from '@/src/app/not-found';

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
    hasVariants?: boolean;
};

export const revalidate = 3600;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    try {
        const res = await fetch(
            `${process.env.NEXTAUTH_URL}/api/products/slug/${slug}`,
            { next: { revalidate: 3600 } }
        );
        if (!res.ok) return { title: 'Product Not Found | Sooqra One' };

        const product: Product = await res.json();
        return {
            title: product.metaTitle || `${product.title} - Sooqra One`,
            description:
                product.metaDescription ||
                product.shortDescription ||
                product.description?.slice(0, 160),
            keywords: product.keywords?.join(', ') || undefined,
            alternates: {
                // ✅ canonical points to /products/
                canonical: `${process.env.NEXTAUTH_URL}/products/${slug}`,
            },
            openGraph: {
                title: product.metaTitle || product.title,
                description:
                    product.shortDescription || product.description?.slice(0, 160),
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
    } catch {
        return { title: 'Error | Sooqra One' };
    }
}

async function getProduct(slug: string): Promise<Product | null> {
    try {
        const res = await fetch(
            `${process.env.NEXTAUTH_URL}/api/products/slug/${slug}`,
            { next: { revalidate: 3600 } }
        );
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

async function getLatestProducts(): Promise<Product[]> {
    try {
        const res = await fetch(
            `${process.env.NEXTAUTH_URL}/api/products?sort=createdAt&order=desc&limit=5`,
            { next: { revalidate: 3600 } }
        );
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export default async function ProductDetailsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const [product, latestProducts] = await Promise.all([
        getProduct(slug),
        getLatestProducts(),
    ]);

    if (!product) return <NotFound />;

    return (
        <Suspense fallback={<LoadingSkeleton />}>
            {/* ✅ basePath='/products' — breadcrumb: Home / Products / title */}
            <ProductDetailsClient
                product={product}
                latestProducts={latestProducts}
                basePath="/products"
            />
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
                    <div className="flex gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-10 bg-gray-200 rounded-lg w-16 animate-pulse" />
                        ))}
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