// src/app/categories/page.tsx - Filter categories with products only
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
    _id: string;
    name: string;
    slug?: string;
    productCount: number;
    image?: string;
    latestProduct?: {
        mainImage?: string;
        mainImageAlt?: string;
        title?: string;
    };
}

export default function AllCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCategories: 0,
        totalProducts: 0,
        maxProducts: 0,
        categoriesWithProducts: 0
    });

    useEffect(() => {
        fetchAllCategories();
    }, []);

    const fetchAllCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/categories?withCount=true&withLatestProduct=true');

            if (!response.ok) throw new Error('Failed to fetch categories');

            const data = await response.json();

            // Filter out categories with productCount = 0
            const categoriesWithProducts = data.filter((cat: Category) => cat.productCount > 0);

            setCategories(categoriesWithProducts);

            // Calculate stats
            const totalProducts = data.reduce((sum: number, cat: Category) => sum + cat.productCount, 0);
            const maxProducts = Math.max(...data.map((cat: Category) => cat.productCount));

            setStats({
                totalCategories: data.length,
                totalProducts,
                maxProducts,
                categoriesWithProducts: categoriesWithProducts.length
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                {/* Header Section */}
                <div className="mb-8 md:mb-12">
                    {/* Breadcrumb */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                        <Link href="/" className="hover:text-gray-900 transition-colors duration-200">
                            Home
                        </Link>
                        <span>/</span>
                        <span className="text-gray-800 font-medium">All Categories</span>
                    </nav>

                    {/* Page Title */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            All Product Categories
                        </h1>
                        <p className="text-gray-600 max-w-3xl">
                            Browse through our complete collection of product categories
                        </p>
                    </div>
                </div>

                {/* Stats Bar - Updated */}
                {!loading && categories.length > 0 && (
                    <div className="mb-8 md:mb-10">
                        <div className="flex flex-wrap gap-4">
                            <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                                <span className="text-gray-600 text-sm">Showing </span>
                                <span className="font-semibold text-gray-900">{stats.categoriesWithProducts}</span>
                                <span className="text-gray-600 text-sm"> categories with products</span>
                            </div>
                            <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                                <span className="text-gray-600 text-sm">Total </span>
                                <span className="font-semibold text-gray-900">{stats.totalProducts}</span>
                                <span className="text-gray-600 text-sm"> products</span>
                            </div>
                            {stats.totalCategories > stats.categoriesWithProducts && (
                                <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                                    <span className="text-gray-600 text-sm">Hidden </span>
                                    <span className="font-semibold text-gray-900">
                                        {stats.totalCategories - stats.categoriesWithProducts}
                                    </span>
                                    <span className="text-gray-600 text-sm"> empty categories</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-xl border border-gray-300"></div>
                        ))}
                    </div>
                )}

                {/* Categories Grid - Only show if categories with products exist */}
                {!loading && categories.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {categories.map((category) => {
                            const imageSrc = category.image || category.latestProduct?.mainImage;
                            const imageAlt = category.latestProduct?.mainImageAlt || category.name;

                            return (
                                <Link
                                    key={category._id}
                                    href={`/categories/${category.slug || category._id}`}
                                    className="group block focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 rounded-xl"
                                >
                                    <div className="bg-white rounded-xl border-2 border-gray-800 hover:border-gray-600 hover:shadow-xl transition-all duration-300 overflow-hidden h-full">

                                        {/* Image Section */}
                                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                            {imageSrc ? (
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={imageSrc}
                                                        alt={imageAlt}
                                                        fill
                                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="text-center p-4">
                                                        <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                                            <span className="text-2xl text-white font-bold">
                                                                {category.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-4">
                                            <div className="mb-3">
                                                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-gray-700 transition-colors duration-200 line-clamp-1">
                                                    {category.name}
                                                </h3>

                                                {/* Product Count Badge */}
                                                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${category.productCount > 10
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                    {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                                                </div>
                                            </div>

                                            {/* Gray Link */}
                                            <div className="pt-3 border-t border-gray-100">
                                                <span className="inline-flex items-center text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200">
                                                    Browse products
                                                    <svg className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Empty State - Updated */}
                {!loading && categories.length === 0 && (
                    <div className="text-center py-16 md:py-24">
                        <div className="inline-block p-8 md:p-12 bg-white rounded-xl border border-gray-300 max-w-md">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {stats.totalCategories > 0 ? 'No Categories with Products' : 'No Categories Found'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {stats.totalCategories > 0
                                    ? 'All categories are currently empty. Please check back later.'
                                    : 'There are no categories available at the moment.'}
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center px-5 py-2.5 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Go to Homepage
                            </Link>
                        </div>
                    </div>
                )}

                {/* Back to Home */}
                {!loading && categories.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Homepage
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}