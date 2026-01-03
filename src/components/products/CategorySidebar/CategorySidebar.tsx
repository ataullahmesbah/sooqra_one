'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/src/types/index';

interface CategorySidebarProps {
    categories: Category[];
    currentCategorySlug?: string;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
    categories,
    currentCategorySlug
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState<string>(
        currentCategorySlug || 'all'
    );

    // Filter out categories with 0 products
    const categoriesWithProducts = categories.filter(
        category => (category.productCount || 0) > 0
    );

    useEffect(() => {
        const category = searchParams.get('category');
        setSelectedCategory(category || 'all');
    }, [searchParams]);

    const handleCategoryClick = (categorySlug: string) => {
        if (categorySlug === 'all') {
            router.push('/products');
        } else {
            router.push(`/products?category=${categorySlug}`);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-tight">Categories</h2>
            </div>

            <div className="p-4">
                {/* All Category Button */}
                <div className="mb-2">
                    <button
                        onClick={() => handleCategoryClick('all')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${selectedCategory === 'all'
                            ? 'bg-gray-100 text-gray-900 border border-gray-300'
                            : 'text-gray-700 hover:bg-gray-50 border border-gray-100 hover:border-gray-200'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Folder Icon */}
                            <div className={`w-6 h-6 rounded flex items-center justify-center ${selectedCategory === 'all'
                                ? 'text-gray-700'
                                : 'text-gray-500 group-hover:text-gray-700'
                                }`}>
                                {selectedCategory === 'all' ? (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                )}
                            </div>
                            <span className={`font-medium ${selectedCategory === 'all' ? 'text-gray-900' : 'text-gray-700'}`}>
                                All Products
                            </span>
                        </div>
                    </button>
                </div>

                {/* Categories List */}
                <div className="space-y-1">
                    {categoriesWithProducts.map((category) => (
                        <button
                            key={category._id}
                            onClick={() => handleCategoryClick(category.slug)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${selectedCategory === category.slug
                                ? 'bg-gray-100 text-gray-900 border border-gray-300'
                                : 'text-gray-700 hover:bg-gray-50 border border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* Folder Icon with Check Mark */}
                                <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${selectedCategory === category.slug
                                    ? 'text-gray-700'
                                    : 'text-gray-500 group-hover:text-gray-700'
                                    }`}>
                                    {selectedCategory === category.slug ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                    )}
                                </div>

                                {/* Category Name */}
                                <span className={`truncate font-medium ${selectedCategory === category.slug ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {category.name}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* No Categories Message */}
                {categoriesWithProducts.length === 0 && (
                    <div className="text-center py-4">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm">No categories available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategorySidebar;