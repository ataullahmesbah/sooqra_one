import React from 'react';

import { getCategories, getProducts, getCategoryBySlug } from '@/src/lib/data';
import CategorySidebar from '@/src/components/products/CategorySidebar/CategorySidebar';
import ProductList from '@/src/components/products/ProductList/ProductList';
import Link from 'next/link';
import { FaArrowCircleRight, FaHome, FaChevronRight } from 'react-icons/fa';
import BreadcrumbNavigation from '@/src/components/products/BreadcrumbNavigation/BreadcrumbNavigation';


export const metadata = {
    title: 'Products - Premium E-commerce Store',
    description: 'Browse our premium collection of products across all categories',
};

interface ProductsPageProps {
    searchParams: Promise<{ category?: string }>;
}

const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
    try {
        // Get category from search params
        const params = await searchParams;
        const categorySlug = params.category || '';

        // Fetch data in parallel
        const [categories, products, currentCategory] = await Promise.all([
            getCategories(),
            getProducts(categorySlug),
            categorySlug ? getCategoryBySlug(categorySlug) : Promise.resolve(null),
        ]);

        // Generate page title based on category
        const pageTitle = currentCategory
            ? `${currentCategory.name} Products - Premium E-commerce Store`
            : 'All Products - Premium E-commerce Store';

        // Update metadata
        metadata.title = pageTitle;

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Breadcrumb Navigation */}
                <div className="bg-white border-b border-gray-200">
                    <div className="container mx-auto px-4 py-12">
                        <BreadcrumbNavigation
                            currentCategory={currentCategory}
                            categorySlug={categorySlug}
                        />

                        {/* Page Title add */}
                        <div className="mt-4">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {currentCategory
                                    ? currentCategory.name
                                    : 'All Products'
                                }
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {currentCategory
                                    ? `Browse our premium collection of ${currentCategory.name.toLowerCase()} products`
                                    : 'Discover our curated collection of premium products across all categories'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Sidebar - Categories */}
                        <div className="lg:w-1/4">
                            <CategorySidebar
                                categories={categories}
                                currentCategorySlug={categorySlug}
                            />
                        </div>

                        {/* Right Content - Products */}
                        <div className="lg:w-3/4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Products Header */}
                                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {currentCategory
                                                    ? `${currentCategory.name} Products`
                                                    : 'All Products'
                                                }
                                            </h2>
                                            <p className="text-gray-600 text-sm mt-1">
                                                {products.length} products available
                                            </p>
                                        </div>

                                        {/* Category Indicator */}
                                        {currentCategory && (
                                            <div className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Currently viewing: {currentCategory.name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Products List */}
                                <div className="p-6">
                                    {/* Pass categorySlug as prop */}
                                    <ProductList
                                        initialProducts={products}
                                        categorySlug={categorySlug} // এইভাবে pass করো
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error loading products page:', error);
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">Unable to load products. Please try again later.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }
};

export default ProductsPage;