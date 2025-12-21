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
    const [sortBy, setSortBy] = useState('createdAt');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const searchParams = useSearchParams();

    // Use categorySlug from props or from URL params
    const category = categorySlug || searchParams.get('category');

    // Filter products by category on client side
    useEffect(() => {
        if (category && category !== 'all') {
            setLoading(true);

            // Filter from initialProducts instead of API call
            // Check both category.slug and category directly
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

    // Sort products
    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => {
            switch (sortBy) {
                case 'price':
                    const priceA = a.prices?.[0]?.amount || 0;
                    const priceB = b.prices?.[0]?.amount || 0;
                    return priceA - priceB;
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'rating':
                    const ratingA = a.aggregateRating?.ratingValue || 0;
                    const ratingB = b.aggregateRating?.ratingValue || 0;
                    return ratingB - ratingA;
                default:
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            }
        });
    }, [products, sortBy]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-sm border border-gray-200">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
        <div>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>

            {/* Results Count */}
            <div className="mt-8 text-center">
                <p className="text-gray-600">
                    Showing <span className="font-semibold">{sortedProducts.length}</span> products
                    {category && category !== 'all' && (
                        <span className="ml-2">
                            in <span className="font-semibold text-blue-600">{category}</span> category
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
};

export default ProductList;