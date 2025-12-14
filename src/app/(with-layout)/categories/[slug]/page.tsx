// src/app/categories/[slug]/page.tsx
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

    const sortedProducts = getSortedProducts();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Loading Skeleton */}
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                        <div className="h-10 bg-gray-200 rounded w-64 mb-8"></div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                    <div className="h-10 bg-gray-200 rounded"></div>
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
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
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                {data.category.name}
                            </h1>
                            {data.category.description && (
                                <p className="text-gray-600 max-w-3xl">
                                    {data.category.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Sort Dropdown */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-medium text-gray-700 cursor-pointer"
                                >
                                    <option value="latest">Sort by: Latest</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name">Name: A to Z</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Results Count */}
                            <div className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg">
                                {data.count} {data.count === 1 ? 'Product' : 'Products'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {sortedProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {sortedProducts.map((product) => (
                                <Link
                                    key={product._id}
                                    href={`/shop/${product.slug || product._id}`}
                                    className="group block focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 rounded-lg"
                                >
                                    <div className="bg-white rounded-lg border-2 border-gray-800 hover:border-gray-600 hover:shadow-xl transition-all duration-300 overflow-hidden h-full">

                                        {/* Product Image */}
                                        <div className="relative h-56 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                            {product.mainImage ? (
                                                <>
                                                    <Image
                                                        src={product.mainImage}
                                                        alt={product.mainImageAlt || product.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="text-center">
                                                        <span className="text-4xl text-gray-400 font-bold">
                                                            {product.title.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Availability Badge */}
                                            {product.availability === 'OutOfStock' && (
                                                <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                                                    Out of Stock
                                                </div>
                                            )}
                                            {product.availability === 'PreOrder' && (
                                                <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-600 text-white text-xs font-bold rounded-full">
                                                    Pre-Order
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4 md:p-5">
                                            <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-gray-700 transition-colors duration-200 line-clamp-1">
                                                {product.title}
                                            </h3>


                                            {/* Replace your existing price and view button section with this */}

{/* Price and View Button Container */}
<div className="mt-4 pt-4 border-t border-gray-100">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
    
    {/* Price Section */}
    <div className="flex-1">
      {product.prices?.[0] ? (
        <div className="flex items-baseline">
          <span className="text-xl sm:text-2xl font-bold text-gray-900">
            {product.prices[0].currency === 'BDT' ? '৳' : '$'}
            {product.prices[0].amount.toLocaleString()}
          </span>
          {product.prices[0].currency !== 'BDT' && (
            <span className="text-xs sm:text-sm text-gray-500 ml-2">USD</span>
          )}
        </div>
      ) : (
        <span className="text-gray-500 text-sm">Price not available</span>
      )}
    </div>
    
    {/* View Button Section */}
    <div className="self-stretch sm:self-auto">
      <div className="flex items-center">
        <span className="text-gray-700 font-medium text-sm hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">
          View Details
        </span>
        <span className="text-gray-800 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 ml-1.5">
          →
        </span>
      </div>
    </div>
    
  </div>
</div>

                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Results Footer */}
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <p className="text-gray-600 text-sm">
                                    Showing <span className="font-semibold">{sortedProducts.length}</span> of{' '}
                                    <span className="font-semibold">{data.count}</span> products
                                </p>
                                <Link
                                    href="/categories"
                                    className="inline-flex items-center text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Categories
                                </Link>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16 md:py-24">
                        <div className="inline-block p-8 md:p-12 bg-white rounded-xl border-2 border-gray-800 shadow-lg max-w-2xl">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                No Products in {data.category.name}
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                There are currently no products available in this category. Please check back later or browse other categories.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/categories"
                                    className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 inline-flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    Browse All Categories
                                </Link>
                                <Link
                                    href="/"
                                    className="px-6 py-3 border-2 border-gray-800 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
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