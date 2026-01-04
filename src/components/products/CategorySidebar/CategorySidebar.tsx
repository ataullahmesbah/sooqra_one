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

    // Show only first 10 categories
    const visibleCategories = categoriesWithProducts.slice(0, 10);
    const hasMoreCategories = categoriesWithProducts.length > 10;

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
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-base font-semibold text-gray-900 tracking-tight uppercase">Product Categories</h2>
            </div>

            <div className="p-1">
                {/* All Category Button */}
                <div className="px-3 py-1">
                    <button
                        onClick={() => handleCategoryClick('all')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${selectedCategory === 'all'
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {/* Checkbox for All Products */}
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${selectedCategory === 'all'
                            ? 'bg-gray-800 border-gray-800'
                            : 'border-gray-300 group-hover:border-gray-400'
                            }`}>
                            {selectedCategory === 'all' && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        
                        {/* Category Name */}
                        <span className={`text-sm font-medium truncate ${selectedCategory === 'all' ? 'text-gray-900' : 'text-gray-700'}`}>
                            All Products
                        </span>
                    </button>
                </div>

                {/* Categories List with Scrollable Container */}
                <div className="max-h-[400px] overflow-y-auto pr-1">
                    <div className="space-y-1 px-3 py-1">
                        {visibleCategories.map((category) => (
                            <button
                                key={category._id}
                                onClick={() => handleCategoryClick(category.slug)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${selectedCategory === category.slug
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {/* Checkbox */}
                                <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${selectedCategory === category.slug
                                    ? 'bg-gray-800 border-gray-800'
                                    : 'border-gray-300 group-hover:border-gray-400'
                                    }`}>
                                    {selectedCategory === category.slug && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>

                                {/* Category Name */}
                                <span className={`text-sm truncate ${selectedCategory === category.slug ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                    {category.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Show More Categories Indicator */}
                {hasMoreCategories && (
                    <div className="px-4 pt-3 pb-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500 text-center">
                            +{categoriesWithProducts.length - 10} more categories
                        </div>
                    </div>
                )}

                {/* No Categories Message */}
                {categoriesWithProducts.length === 0 && (
                    <div className="text-center py-6 px-4">
                        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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