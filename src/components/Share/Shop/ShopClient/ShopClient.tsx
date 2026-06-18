'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CartSlider from '@/src/components/Share/Shop/CartSlider/CartSlider';
import ShopProductCard from '../ShopProductCard/ShopProductCard';

// ── Interfaces ────────────────────────────────────────────────────────────────
interface Price {
    currency: string;
    amount: number;
    exchangeRate?: number;
}

interface Size {
    name: string;
    quantity: number;
}

export interface ShopProduct {
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
    aggregateRating?: { ratingValue: number; reviewCount: number };
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
    products: ShopProduct[];
    structuredData: StructuredData;
}

// ── Skeleton Card ──────────────────────────────────────────────────────────────
function CardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 shimmer-bg" />
            </div>
            <div className="flex-1 p-2.5 sm:p-3 flex flex-col gap-2">
                <div className="h-2.5 bg-gray-100 rounded w-12" />
                <div className="space-y-1.5 flex-1">
                    <div className="h-2.5 bg-gray-100 rounded w-full" />
                    <div className="h-2.5 bg-gray-100 rounded w-4/5" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-2/5 mt-1" />
                <div className="flex gap-1.5">
                    <div className="flex-1 h-7 bg-gray-100 rounded-lg" />
                    <div className="flex-1 h-7 bg-gray-100 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ShopClient({ products, structuredData }: ShopClientProps) {
    const [sortOption, setSortOption] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const productsPerPage = 12;

    // ✅ Fix hydration issue
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Categories from tags
    const categories = useMemo(() => {
        const cats = new Set<string>();
        cats.add('all');
        products.forEach(p => p.tags?.forEach(t => cats.add(t.toLowerCase())));
        return Array.from(cats);
    }, [products]);

    // Filter
    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'all') return products;
        return products.filter(p =>
            p.tags?.some(t => t.toLowerCase() === selectedCategory)
        );
    }, [products, selectedCategory]);

    // Sort
    const sortedProducts = useMemo(() => {
        const items = [...filteredProducts];
        switch (sortOption) {
            case 'newest':
                return items.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case 'oldest':
                return items.sort((a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case 'price-low':
                return items.sort((a, b) =>
                    (a.prices.find(p => p.currency === 'BDT')?.amount || 0) -
                    (b.prices.find(p => p.currency === 'BDT')?.amount || 0));
            case 'price-high':
                return items.sort((a, b) =>
                    (b.prices.find(p => p.currency === 'BDT')?.amount || 0) -
                    (a.prices.find(p => p.currency === 'BDT')?.amount || 0));
            default:
                return items;
        }
    }, [filteredProducts, sortOption]);

    // Pagination
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
    const currentProducts = sortedProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    const formatCategory = (cat: string) =>
        cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1);

    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        setCurrentPage(1);
    };

    const handleSortChange = (value: string) => {
        setSortOption(value);
        setCurrentPage(1);
    };

    // Reset page when products change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, sortOption]);

    return (
        <>
            <style jsx global>{`
                .shimmer-bg {
                    background: linear-gradient(90deg,
                        #f0f0f0 0%, #e0e0e0 20%, #f0f0f0 40%, #f0f0f0 100%);
                    background-size: 200% 100%;
                    animation: shimmer 1.4s ease-in-out infinite;
                }
                @keyframes shimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>

            {/* Structured data - only client side */}
            {isClient && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            )}

            <div className="py-4 md:py-6">
                {/* ── Header ─────────────────────────────────────────────────── */}
                <div className="mb-6 md:mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-7 bg-gray-600 rounded-full flex-shrink-0" />
                            <div>
                                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                                    Shop Collection
                                </h1>
                                <p className="text-gray-400 text-xs mt-0.5">
                                    {sortedProducts.length} products found
                                </p>
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="relative flex-shrink-0">
                            <select
                                value={sortOption}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="appearance-none bg-white text-gray-700 border border-gray-200 rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:border-gray-400 text-xs font-medium w-40 cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="price-low">Price: Low → High</option>
                                <option value="price-high">Price: High → Low</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <svg className="h-3.5 w-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Category filter */}
                    {categories.length > 1 && (
                        <div className="flex flex-wrap gap-1.5">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${selectedCategory === cat
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {formatCategory(cat)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Products Grid ────────────────────────────────────────────── */}
                {currentProducts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-100 max-w-md mx-auto">
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm mb-4">No products found in this category</p>
                        <button
                            onClick={() => handleCategoryChange('all')}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium"
                        >
                            View All Products
                        </button>
                    </div>
                ) : (
                    <>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${selectedCategory}-${currentPage}-${sortOption}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4"
                            >
                                {currentProducts.map((product, index) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.25) }}
                                        className="h-full"
                                    >
                                        <ShopProductCard product={product} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {/* ── Pagination ── */}
                        {totalPages > 1 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-10 flex justify-center"
                            >
                                <nav className="flex items-center gap-1.5 flex-wrap justify-center">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                        let page: number;
                                        if (totalPages <= 5) page = i + 1;
                                        else if (currentPage <= 3) page = i + 1;
                                        else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                                        else page = currentPage - 2 + i;

                                        return (
                                            <button
                                                key={page}
                                                onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                className={`w-9 h-9 flex items-center justify-center rounded-lg font-medium text-sm transition-colors ${currentPage === page
                                                        ? 'bg-gray-900 text-white'
                                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </nav>
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            <CartSlider
                isOpen={isCartOpen}
                setIsOpen={setIsCartOpen}
                conversionRates={{ USD: 123, EUR: 135, BDT: 1 }}
            />
        </>
    );
}