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
    prices: Array<{
        currency: string;
        amount: number;
    }>;
    quantity: number;
    createdAt: string;
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
    const description = `Browse our collection of ${productCount} high-quality products at Ataullah Mesbah's shop. Find the best deals with fast delivery and top-notch customer service.`;

    return {
        title: 'Premium Shop - Ataullah Mesbah',
        description,
        openGraph: {
            title: 'Premium Shop - Ataullah Mesbah',
            description,
            url: `${process.env.NEXTAUTH_URL}/shop`,
            type: 'website',
            images: products[0]?.mainImage ? [{ url: products[0].mainImage, width: 400, height: 200, alt: products[0].title }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Premium Shop - Ataullah Mesbah',
            description,
            images: products[0]?.mainImage ? [products[0].mainImage] : [],
        },
    };
}

function getStructuredData(products: Product[]): StructuredData {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Premium Shop',
        description: 'Browse our collection of high-quality products at Ataullah Mesbah.',
        url: `${process.env.NEXTAUTH_URL}/shop`,
        itemListElement: products.map((product, index) => ({
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
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/products`, {
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
            <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">Shop</h1>
                    <p className="text-red-400 text-lg">Failed to load products. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen"
            style={{
                background: 'linear-gradient(to right, #111827, #111827 20%, #0f172a 70%, #111111 100%)',
            }}
        >
            {/* Shop Ads */}
            <ShopAds />

            {/* Hero Banner */}
            <ShopHeroSection />

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 py-12">
                <Suspense fallback={<LoadingSkeleton />}>
                    <ShopClient products={products} structuredData={getStructuredData(products)} />
                </Suspense>
            </div>

            {/* Bottom Border */}
            <div className="border-b border-gray-800"></div>
        </main>
    );
}

function LoadingSkeleton() {
    return (
        <div className="py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
                        <div className="aspect-square bg-gray-700 animate-pulse"></div>
                        <div className="p-4 space-y-3">
                            <div className="h-5 bg-gray-700 rounded-full w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-gray-700 rounded-full w-1/2 animate-pulse"></div>
                            <div className="h-6 bg-gray-700 rounded-full w-1/3 mt-2 animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}