// src/components/products/ProductList/ProductList.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/src/types/index';
import ProductCard from '../ProductCard/ProductCard';

interface ProductListProps {
    initialProducts: Product[];
    categorySlug?: string;
}

const ProductList: React.FC<ProductListProps> = ({
    initialProducts,
    categorySlug
}) => {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low-high' | 'price-high-low'>('newest');
    const searchParams = useSearchParams();

    // Use categorySlug from props or from URL params
    const category = categorySlug || searchParams.get('category');

    // Filter products by category on client side
    useEffect(() => {
        if (category && category !== 'all') {
            setLoading(true);

            // Filter from initialProducts instead of API call
            const filteredProducts = initialProducts.filter(product => {
                // Check if product has a category object with slug
                if (typeof product.category === 'object' && product.category !== null) {
                    return (product.category as any).slug === category;
                }
                // Check if product has category as string
                return product.category === category;
            });

            setProducts(filteredProducts);
            setLoading(false);
        } else {
            setProducts(initialProducts);
        }
    }, [category, initialProducts]);

    // Sort products based on selected option
    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();

                case 'oldest':
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();

                case 'price-low-high':
                    const priceA = a.prices?.[0]?.amount || 0;
                    const priceB = b.prices?.[0]?.amount || 0;
                    return priceA - priceB;

                case 'price-high-low':
                    const priceC = a.prices?.[0]?.amount || 0;
                    const priceD = b.prices?.[0]?.amount || 0;
                    return priceD - priceC;

                default:
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            }
        });
    }, [products, sortBy]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                </div>
                <p className="mt-6 text-gray-600 font-medium">Loading products...</p>
                <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="bg-white rounded-xl overflow-hidden">
                <div className="p-12 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                        No products found
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                        {category && category !== 'all'
                            ? `There are currently no products available in the "${category}" category. Check back soon or browse other categories.`
                            : 'Our store is currently being stocked. Please check back soon for amazing products!'}
                    </p>
                    <button
                        onClick={() => window.location.href = '/products'}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Browse All Categories
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Sorting Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-2 sm:px-0">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <span className="text-gray-600 text-sm whitespace-nowrap">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="price-low-high">Price: Low to High</option>
                        <option value="price-high-low">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Products Grid - Mobile optimized with proper spacing */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4  sm:px-0">
                {sortedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>

            {/* Pagination would go here */}
            {sortedProducts.length > 12 && (
                <div className="mt-8 pt-6 border-t border-gray-200 px-2 sm:px-0">
                    <div className="flex justify-center">
                        <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                            Load More Products
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;