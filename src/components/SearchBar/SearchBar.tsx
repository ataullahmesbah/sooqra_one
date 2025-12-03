'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaTimes, FaStar, FaShoppingCart, FaExclamationTriangle } from 'react-icons/fa';

// Interface definitions - Update this part
interface SearchResult {
    _id: string; // Change from ObjectId to string for frontend
    title: string;
    slug: string;
    mainImage: string;
    mainImageAlt: string;
    prices: Array<{
        currency: string;
        amount: number;
        exchangeRate?: number;
    }>;
    description: string;
    shortDescription?: string;
    category: {
        _id: string;
        name: string;
        slug: string;
    };
    brand: string;
    quantity: number;
    availability: string;
    aggregateRating: {
        ratingValue: number;
        reviewCount: number;
    };
    isGlobal: boolean;
    keywords: string[];
}

// Update the API response interface too
interface SearchResponse {
    success: boolean;
    data: SearchResult[];
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalResults: number;
    };
    suggestions: string[];
    searchTerms: string[];
    error?: string;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [searchTerms, setSearchTerms] = useState<string[]>([]);

    const [sortBy, setSortBy] = useState('relevance');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        availability: '',
        category: '',
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        totalPages: 1,
        totalResults: 0,
    });

    const fetchSearchResults = async (searchQuery: string, page: number = 1) => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                q: searchQuery,
                page: page.toString(),
                limit: '12',
                sort: sortBy,
                ...(filters.minPrice && { minPrice: filters.minPrice }),
                ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
                ...(filters.availability && { availability: filters.availability }),
                ...(filters.category && { category: filters.category }),
            });

            const response = await fetch(`/api/products/search?${params}`);
            const data: SearchResponse = await response.json();

            if (data.success) {
                setSearchResults(data.data);
                setPagination(data.pagination);
                setSuggestions(data.suggestions);
                setSearchTerms(data.searchTerms);
            } else {
                setError(data.error || 'Failed to fetch search results');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (query) {
            fetchSearchResults(query);
        } else {
            setSearchResults([]);
            setPagination(prev => ({ ...prev, totalResults: 0 }));
        }
    }, [query, sortBy, filters]);

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchQuery = formData.get('search') as string;

        if (searchQuery.trim()) {
            router.push(`/shop/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        router.push(`/shop/search?q=${encodeURIComponent(suggestion)}`);
    };

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            availability: '',
            category: '',
        });
        setSortBy('relevance');
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
            fetchSearchResults(query, newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getBDTPrice = (prices: any[]) => {
        const bdtPrice = prices.find((p: any) => p.currency === 'BDT');
        return bdtPrice?.amount || 0;
    };

    // If no query or empty results
    if (!query.trim()) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
                            <FaSearch className="text-4xl text-gray-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            Search for Products
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Enter keywords to find amazing products in our collection
                        </p>
                        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search Sooqra One"
                                    className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-300 rounded-full focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-2 rounded-full font-medium hover:from-purple-700 hover:to-blue-600 transition-all"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Search Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            Search Results for "{query}"
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <div className="text-sm text-gray-300">
                                Found {pagination.totalResults} {pagination.totalResults === 1 ? 'product' : 'products'}
                            </div>

                            {searchTerms.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-sm text-gray-300">Searching for:</span>
                                    {searchTerms.map((term, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-700 text-gray-200 text-sm rounded-full"
                                        >
                                            {term}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Search Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="mb-6">
                                <p className="text-sm text-gray-300 mb-2">Try these related searches:</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.slice(0, 6).map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded-full transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search Box */}
                        <form onSubmit={handleSearchSubmit} className="mb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={query}
                                    placeholder="Search Sooqra One"
                                    className="w-full px-6 py-3 text-white bg-gray-700 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-1.5 rounded-full font-medium hover:from-purple-700 hover:to-blue-600 transition-all"
                                >
                                    Search Again
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Filters and Sorting */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FaFilter />
                            Filters
                        </button>

                        {(filters.minPrice || filters.maxPrice || filters.availability || filters.category) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <FaTimes />
                                Clear Filters
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="relevance">Relevance</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="newest">Newest</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                    </div>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Price Filter */}
                                    <div>
                                        <h3 className="font-medium text-gray-700 mb-3">Price Range (৳)</h3>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={filters.minPrice}
                                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={filters.maxPrice}
                                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Availability Filter */}
                                    <div>
                                        <h3 className="font-medium text-gray-700 mb-3">Availability</h3>
                                        <select
                                            value={filters.availability}
                                            onChange={(e) => handleFilterChange('availability', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">All</option>
                                            <option value="InStock">In Stock</option>
                                            <option value="OutOfStock">Out of Stock</option>
                                            <option value="PreOrder">Pre-Order</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Section */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="inline-block w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600">Searching products...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center max-w-md">
                            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-100">
                                <FaExclamationTriangle className="text-3xl text-red-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Search Error</h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={() => fetchSearchResults(query)}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-600 transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center max-w-md">
                            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-100">
                                <FaSearch className="text-3xl text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">
                                No results for "{query}"
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Try checking your spelling or use more general terms
                            </p>

                            {/* Search Suggestions */}
                            {suggestions.length > 0 && (
                                <div className="mb-8">
                                    <p className="text-gray-700 mb-3">Try these instead:</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {suggestions.slice(0, 8).map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                                <p className="text-yellow-700 text-sm">
                                    <span className="font-semibold">Tip:</span> Check each product page for other buying options or try different keywords.
                                </p>
                            </div>

                            <form onSubmit={handleSearchSubmit} className="mt-8">
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="Try different search terms..."
                                        className="w-full px-6 py-3 bg-white border-2 border-gray-300 rounded-full focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-1.5 rounded-full font-medium hover:from-purple-700 hover:to-blue-600 transition-all"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                            <AnimatePresence>
                                {searchResults.map((product, index) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 group"
                                    >
                                        <Link href={`/shop/${product.slug}`}>
                                            {/* Product Image */}
                                            <div className="relative h-64 overflow-hidden bg-gray-100">
                                                <Image
                                                    src={product.mainImage}
                                                    alt={product.mainImageAlt}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />

                                                {/* Badges */}
                                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                                    {product.availability === 'InStock' ? (
                                                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                                                            In Stock
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                                                            Out of Stock
                                                        </span>
                                                    )}

                                                    {product.isGlobal && (
                                                        <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                                                            Global
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
                                                            {product.title}
                                                        </h3>
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                                {product.category?.name}
                                                            </span>
                                                            <span className="text-sm text-gray-600">
                                                                {product.brand}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Rating */}
                                                    {product.aggregateRating?.ratingValue > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <FaStar className="text-yellow-400" />
                                                            <span className="text-sm font-semibold">
                                                                {product.aggregateRating.ratingValue.toFixed(1)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price */}
                                                <div className="mb-3">
                                                    <p className="text-2xl font-bold text-purple-600">
                                                        ৳{getBDTPrice(product.prices).toLocaleString()}
                                                    </p>
                                                    {product.quantity < 10 && product.quantity > 0 && (
                                                        <p className="text-xs text-orange-600">
                                                            Only {product.quantity} left in stock
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Keywords */}
                                                {product.keywords && product.keywords.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-3">
                                                        {product.keywords.slice(0, 3).map((keyword, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                                                            >
                                                                {keyword}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Short Description */}
                                                {product.shortDescription && (
                                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                                        {product.shortDescription}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mb-12">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-4 py-2 rounded-lg ${pagination.page === pageNum
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                } transition-colors`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading search...</p>
                </div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}