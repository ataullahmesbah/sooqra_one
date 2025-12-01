'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

interface ShopClientProps {
    products: Product[];
    structuredData: StructuredData;
}

export default function ShopClient({ products, structuredData }: ShopClientProps) {
    const [sortOption, setSortOption] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    // Sort products
    const sortedProducts = useMemo(() => {
        switch (sortOption) {
            case 'newest':
                return [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case 'oldest':
                return [...products].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case 'price-low':
                return [...products].sort(
                    (a, b) =>
                        (a.prices.find((p) => p.currency === 'BDT')?.amount || 0) -
                        (b.prices.find((p) => p.currency === 'BDT')?.amount || 0)
                );
            case 'price-high':
                return [...products].sort(
                    (a, b) =>
                        (b.prices.find((p) => p.currency === 'BDT')?.amount || 0) -
                        (a.prices.find((p) => p.currency === 'BDT')?.amount || 0)
                );
            default:
                return [...products];
        }
    }, [products, sortOption]);

    // Pagination logic
    const currentProducts = sortedProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

    return (
        <div className="py-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Header with Sort */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 px-4 sm:px-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Available Products</h1>
                    <p className="text-gray-400">{sortedProducts.length} items</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400 hidden sm:inline">Sort:</span>
                    <div className="relative">
                        <select
                            value={sortOption}
                            onChange={(e) => {
                                setSortOption(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="appearance-none bg-gray-800 text-white border border-gray-700 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {currentProducts.length === 0 ? (
                <div className="text-center py-20 bg-gray-800/50 rounded-xl max-w-4xl mx-auto">
                    <p className="text-gray-400 mb-6">No products found</p>
                    <button
                        onClick={() => {
                            setSortOption('newest');
                            setCurrentPage(1);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-6">
                        {currentProducts.map((product) => {
                            const bdtPrice = product.prices.find((p) => p.currency === 'BDT')?.amount;

                            return (
                                <div key={product._id} className="group relative flex flex-col h-full">
                                    <Link
                                        href={`/shop/${product.slug || product._id}`}

                                      

                                        className="flex flex-col h-full rounded-xl overflow-hidden bg-gray-800/50 hover:bg-gray-800/70 transition-all duration-300 border border-gray-700/50 hover:border-purple-500/30 shadow-lg hover:shadow-xl hover:shadow-purple-500/10"
                                    >
                                        {/* Product Image */}
                                        <div className="relative aspect-square">
                                            <Image
                                                src={product.mainImage}
                                                alt={product.title}
                                                fill
                                                className="object-cover transition-opacity opacity-0 duration-300 group-hover:scale-105"
                                                onLoad={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.classList.remove('opacity-0');
                                                }}
                                                loading="lazy"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            />
                                            {/* Stock Status Badge - More subtle */}
                                            <div
                                                className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ${product.quantity > 0
                                                    ? 'bg-green-900/80 text-green-200'
                                                    : 'bg-red-700/90 text-red-200'
                                                    } backdrop-blur-sm`}
                                            >
                                                {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                            </div>
                                        </div>

                                        {/* Product Info - Fixed at bottom */}
                                        <div className="p-5 flex flex-col flex-grow justify-between">
                                            <div>
                                                <h3 className="amsfonts text-base text-white line-clamp-2">
                                                    {product.title}
                                                </h3>
                                            </div>

                                            <div className="mt-4 flex justify-between items-end">
                                                <p className="text-lg amsfonts text-white">
                                                    ৳{bdtPrice?.toLocaleString() || 'N/A'}
                                                </p>
                                                {product.quantity > 0 && (
                                                    <span className="text-xs text-gray-300 bg-gray-700/30 px-2 py-1 rounded-full">
                                                        {product.quantity} available
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-16 flex justify-center px-4 sm:px-6">
                            <nav className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800/50 border border-gray-700/50 disabled:opacity-50 hover:bg-gray-700/50 transition"
                                >
                                    ←
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    let page;
                                    if (totalPages <= 5) {
                                        page = i + 1;
                                    } else if (currentPage <= 3) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        page = totalPages - 4 + i;
                                    } else {
                                        page = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg ${currentPage === page
                                                ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                                                : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50'
                                                } transition`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800/50 border border-gray-700/50 disabled:opacity-50 hover:bg-gray-700/50 transition"
                                >
                                    →
                                </button>
                            </nav>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}