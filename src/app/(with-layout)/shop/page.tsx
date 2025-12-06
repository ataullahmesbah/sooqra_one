// src/app/shop/page.tsx
import ShopAds from '@/src/components/Share/Shop/ShopAds/ShopAds';
import ShopClient from '@/src/components/Share/Shop/ShopClient/ShopClient';
import ShopHeroSection from '@/src/components/Share/Shop/ShopHeroSection/ShopHeroSection';
import { Suspense } from 'react';

// Interface definitions
interface Product {
    _id: string;
    title: string;
    slug: string;
    mainImage: string;
    mainImageAlt?: string;
    prices: Array<{
        currency: string;
        amount: number;
    }>;
    quantity: number;
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

export async function generateMetadata() {
    const products = await getProducts();
    const productCount = products.length;
    const description = `Browse our collection of ${productCount} high-quality products at Sooqra One. Find the best deals with fast delivery and top-notch customer service.`;

    return {
        title: 'Shop - Sooqra One | Premium Products',
        description,
        openGraph: {
            title: 'Shop - Sooqra One | Premium Products',
            description,
            url: `${process.env.NEXTAUTH_URL}/shop`,
            type: 'website',
            images: products[0]?.mainImage ? [{
                url: products[0].mainImage,
                width: 1200,
                height: 630,
                alt: products[0].title
            }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Shop - Sooqra One | Premium Products',
            description,
            images: products[0]?.mainImage ? [products[0].mainImage] : [],
        },
    };
}

function getStructuredData(products: Product[]): StructuredData {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Sooqra One Shop',
        description: 'Browse our collection of high-quality products at Sooqra One.',
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
                price: product.prices.find((p) => p.currency === 'BDT')?.amount || 0,
                availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
        })),
    };
}

async function getProducts(): Promise<Product[]> {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/products?limit=100`, {
        next: { tags: ['products'], revalidate: 60 },
    });
    if (!res.ok) {
        throw new Error('Failed to fetch products');
    }
    const products = await res.json();
    return products.sort((a: Product, b: Product) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default async function Shop() {
    let products: Product[] = [];
    try {
        products = await getProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Shop</h1>
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl">
                        <p className="font-medium mb-2">Failed to load products</p>
                        <p className="text-sm">Please try again later or contact support if the problem persists.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Shop Ads */}
            <ShopAds />

            {/* Hero Banner */}
            <ShopHeroSection />

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <Suspense fallback={<LoadingSkeleton />}>
                    <ShopClient products={products} structuredData={getStructuredData(products)} />
                </Suspense>
            </div>
        </main>
    );
}

function LoadingSkeleton() {
    return (
        <div className="py-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                        <div className="aspect-square bg-gray-200 animate-pulse"></div>
                        <div className="p-5 space-y-3">
                            <div className="h-5 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
                            <div className="h-6 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}