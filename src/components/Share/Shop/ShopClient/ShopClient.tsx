// src/components/Share/Shop/ShopClient/ShopClient.tsx
'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

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

interface ShopClientProps {
    products: Product[];
    structuredData: StructuredData;
}

export default function ShopClient({ products, structuredData }: ShopClientProps) {
    const [sortOption, setSortOption] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const productsPerPage = 12;

    // Extract unique categories from tags
    const categories = useMemo(() => {
        const cats = new Set<string>();
        cats.add('all');
        products.forEach(product => {
            product.tags?.forEach(tag => cats.add(tag.toLowerCase()));
        });
        return Array.from(cats);
    }, [products]);

    // Filter by category
    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'all') return products;
        return products.filter(product =>
            product.tags?.some(tag => tag.toLowerCase() === selectedCategory)
        );
    }, [products, selectedCategory]);

    // Sort products
    const sortedProducts = useMemo(() => {
        const items = [...filteredProducts];
        switch (sortOption) {
            case 'newest':
                return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case 'oldest':
                return items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case 'price-low':
                return items.sort(
                    (a, b) =>
                        (a.prices.find((p) => p.currency === 'BDT')?.amount || 0) -
                        (b.prices.find((p) => p.currency === 'BDT')?.amount || 0)
                );
            case 'price-high':
                return items.sort(
                    (a, b) =>
                        (b.prices.find((p) => p.currency === 'BDT')?.amount || 0) -
                        (a.prices.find((p) => p.currency === 'BDT')?.amount || 0)
                );
            default:
                return items;
        }
    }, [filteredProducts, sortOption]);

    // Pagination logic
    const currentProducts = sortedProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

    // Format category name for display
    const formatCategoryName = (category: string) => {
        return category === 'all' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1);
    };

    return (
        <div className="py-8">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Header Section */}
            <div className="mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Shop Collection</h1>
                        <p className="text-gray-600">
                            Discover {sortedProducts.length} premium products
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 hidden sm:inline">Sort by:</span>
                        <div className="relative">
                            <select
                                value={sortOption}
                                onChange={(e) => {
                                    setSortOption(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="appearance-none bg-white text-gray-800 border border-gray-300 rounded-lg py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm w-48"
                            >
                                <option value="newest">Newest Arrivals</option>
                                <option value="oldest">Oldest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
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

                {/* Category Filter */}
                <div className="mb-10">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Browse Categories</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === category
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {formatCategoryName(category)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {currentProducts.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-white rounded-xl shadow-sm max-w-4xl mx-auto border border-gray-200"
                >
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-600 mb-6">No products found in this category</p>
                    <button
                        onClick={() => {
                            setSelectedCategory('all');
                            setCurrentPage(1);
                        }}
                        className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                    >
                        View All Products
                    </button>
                </motion.div>
            ) : (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {currentProducts.map((product) => {
                            const bdtPrice = product.prices.find((p) => p.currency === 'BDT')?.amount;

                            return (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ y: -4 }}
                                    className="group"
                                >
                                    <Link
                                        href={`/shop/${product.slug || product._id}`}
                                        className="flex flex-col h-full rounded-xl overflow-hidden bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
                                    >
                                        {/* Product Image */}
                                        <div className="relative aspect-square overflow-hidden">
                                            <Image
                                                src={product.mainImage}
                                                alt={product.mainImageAlt || product.title}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                priority={false}
                                            />
                                            {/* Stock Status Badge */}
                                            <div className="absolute top-3 right-3">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${product.quantity > 0
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-5 flex flex-col flex-grow">
                                            <div className="mb-4">
                                                <h3 className="text-base font-medium text-gray-800 line-clamp-2 mb-2">
                                                    {product.title}
                                                </h3>
                                                {product.tags && product.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {product.tags.slice(0, 2).map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-auto">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xl font-bold text-gray-900">
                                                            ৳{bdtPrice?.toLocaleString() || 'N/A'}
                                                        </p>
                                                        {product.quantity > 0 && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {product.quantity} available
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            window.location.href = `/shop/${product.slug || product._id}`;
                                                        }}
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 flex justify-center"
                        >
                            <nav className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                    aria-label="Previous page"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
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
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium ${currentPage === page
                                                    ? 'bg-gray-800 text-white'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                } transition-colors`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                    aria-label="Next page"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </nav>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
}