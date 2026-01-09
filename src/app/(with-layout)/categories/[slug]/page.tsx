'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
    _id: string;
    title: string;
    slug?: string;
    mainImage?: string;
    mainImageAlt?: string;
    shortDescription?: string;
    description?: string;
    prices?: Array<{
        amount: number;
        currency: string;
    }>;
    availability?: string;
}

interface CategoryData {
    success: boolean;
    category: {
        _id: string;
        name: string;
        slug: string;
        description?: string;
    };
    products: Product[];
    count: number;
}

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [data, setData] = useState<CategoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('latest');
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(12); // Show 12 products per page

    useEffect(() => {
        fetchCategoryData();
    }, [slug]);

    const fetchCategoryData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/categories/${slug}`);

            if (!response.ok) {
                throw new Error('Failed to fetch category');
            }

            const result = await response.json();

            if (!result.success) {
                notFound();
            }

            setData(result);
        } catch (error) {
            console.error('Error fetching category:', error);
            notFound();
        } finally {
            setLoading(false);
        }
    };

    // Sort products
    const getSortedProducts = () => {
        if (!data?.products) return [];

        const products = [...data.products];

        switch (sortBy) {
            case 'price-low':
                return products.sort((a, b) => {
                    const priceA = a.prices?.[0]?.amount || 0;
                    const priceB = b.prices?.[0]?.amount || 0;
                    return priceA - priceB;
                });
            case 'price-high':
                return products.sort((a, b) => {
                    const priceA = a.prices?.[0]?.amount || 0;
                    const priceB = b.prices?.[0]?.amount || 0;
                    return priceB - priceA;
                });
            case 'name':
                return products.sort((a, b) =>
                    a.title.localeCompare(b.title)
                );
            default: // 'latest'
                return products;
        }
    };

    // Pagination logic
    const sortedProducts = getSortedProducts();
    const totalProducts = sortedProducts.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    // Get current products
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    // Change page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Generate page numbers
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Loading Skeleton */}
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                        <div className="h-10 bg-gray-200 rounded w-64 mb-8"></div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg border border-gray-200 p-3">
                                    <div className="h-40 bg-gray-200 rounded mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                                    <div className="h-8 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 mb-6">
                    <Link href="/" className="hover:text-gray-900 transition-colors duration-200">
                        Home
                    </Link>
                    <span>/</span>
                    <Link href="/categories" className="hover:text-gray-900 transition-colors duration-200">
                        Categories
                    </Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium truncate">
                        {data.category.name}
                    </span>
                </nav>

                {/* Category Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                {data.category.name}
                            </h1>
                            {data.category.description && (
                                <p className="text-gray-600 text-sm sm:text-base max-w-3xl">
                                    {data.category.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Sort Dropdown */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-xs sm:text-sm font-medium text-gray-700 cursor-pointer"
                                >
                                    <option value="latest">Sort: Latest</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name">Name: A to Z</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Results Count */}
                            <div className="px-3 py-1.5 bg-gray-900 text-white text-xs sm:text-sm font-medium rounded">
                                {data.count} {data.count === 1 ? 'Product' : 'Products'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {currentProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-8">
                            {currentProducts.map((product) => (
                                <Link
                                    key={product._id}
                                    href={`/products/${product.slug || product._id}`}
                                    className="group block focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">

                                        {/* Product Image */}
                                        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                            {product.mainImage ? (
                                                <>
                                                    <Image
                                                        src={product.mainImage}
                                                        alt={product.mainImageAlt || product.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 25vw"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center p-4">
                                                    <div className="text-center">
                                                        <span className="text-2xl sm:text-3xl text-gray-400 font-bold">
                                                            {product.title.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Availability Badge */}
                                            {product.availability === 'OutOfStock' && (
                                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500/20 backdrop-blur-sm text-red-200 text-[8px] sm:text-[10px] font-bold rounded-sm border border-red-400/30">
                                                    Out of Stock
                                                </div>
                                            )}
                                            {product.availability === 'PreOrder' && (
                                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-yellow-500/20 backdrop-blur-sm text-yellow-200 text-[8px] sm:text-[10px] font-bold rounded-sm border border-yellow-400/30">
                                                    Pre-Order
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 p-3 sm:p-4 flex flex-col">
                                           <h3 className="font-medium text-gray-900 text-xs sm:text-sm mb-2 group-hover:text-gray-700 transition-colors duration-200 leading-relaxed break-words hyphens-auto">
    {product.title}
</h3>

                                            {/* Price and View Button Container */}
                                            <div className="mt-auto pt-2 sm:pt-3 ">
                                                <div className="flex flex-col gap-2">




                                                    {/* Buy Now Button with Background */}
                                                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 sm:p-2.5 group-hover:bg-gray-100 transition-colors duration-300">
                                                            <div className="flex-1 min-w-0">
                                                                {product.prices?.[0] ? (
                                                                    <div className="flex items-baseline">
                                                                        <span className="text-sm sm:text-base font-bold text-gray-900">
                                                                            {product.prices[0].currency === 'BDT' ? '৳' : '$'}
                                                                            {product.prices[0].amount.toLocaleString()}
                                                                        </span>
                                                                        {product.prices[0].currency !== 'BDT' && (
                                                                            <span className="text-[10px] sm:text-xs text-gray-500 ml-1">USD</span>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-500 text-[10px] sm:text-xs">Price not available</span>
                                                                )}
                                                            </div>

                                                            {/* Buy Now Button with Gray Background */}
                                                            <button className="flex items-center gap-1 sm:gap-1.5 bg-gray-800 hover:bg-gray-900 text-white text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-1.5 rounded transition-all duration-300 hover:shadow-md group/btn">
                                                                <span>Buy Now</span>

                                                            </button>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <p className="text-gray-600 text-xs sm:text-sm">
                                        Showing <span className="font-semibold">{indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, totalProducts)}</span> of{' '}
                                        <span className="font-semibold">{totalProducts}</span> products
                                    </p>

                                    <div className="flex items-center gap-1">
                                        {/* Previous Button */}
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 bg-gray-900 text-white text-xs sm:text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                                        >
                                            ←
                                        </button>

                                        {/* Page Numbers */}
                                        <div className="flex items-center gap-1">
                                            {pageNumbers.map(number => (
                                                <button
                                                    key={number}
                                                    onClick={() => paginate(number)}
                                                    className={`w-8 h-8 flex items-center justify-center text-xs sm:text-sm font-medium rounded ${currentPage === number
                                                        ? 'bg-gray-900 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {number}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Next Button */}
                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1.5 bg-gray-900 text-white text-xs sm:text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                                        >
                                            →
                                        </button>
                                    </div>

                                    <Link
                                        href="/categories"
                                        className="inline-flex items-center text-gray-700 hover:text-gray-900 font-medium text-xs sm:text-sm transition-colors duration-200"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back to Categories
                                    </Link>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 sm:py-16">
                        <div className="inline-block p-6 sm:p-8 bg-white rounded-xl border border-gray-200 shadow-sm max-w-2xl">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                                No Products in {data.category.name}
                            </h3>
                            <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-md mx-auto">
                                There are currently no products available in this category. Please check back later or browse other categories.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    href="/categories"
                                    className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-900 text-white font-medium text-sm rounded hover:bg-gray-800 transition-colors duration-200 inline-flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    Browse All Categories
                                </Link>
                                <Link
                                    href="/"
                                    className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 text-gray-900 font-medium text-sm rounded hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Return to Homepage
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}