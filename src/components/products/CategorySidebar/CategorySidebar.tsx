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

    // Calculate total products
    const totalProducts = categoriesWithProducts.reduce(
        (sum, category) => sum + (category.productCount || 0),
        0
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg font-semibold text-gray-900 uppercase">Categories</h2>
               
            </div>

            <div className="p-4">
                {/* All Category Button */}
                <div className="mb-3">
                    <button
                        onClick={() => handleCategoryClick('all')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${selectedCategory === 'all'
                                ? 'bg-blue-50 text-gray-700 border border-gray-200'
                                : 'text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <h3 className="font-medium">All Products</h3>
                                <p className="text-xs text-gray-500">
                                    Browse all categories
                                </p>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedCategory === 'all'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                            {totalProducts}
                        </span>
                    </button>
                </div>

                {/* Categories List */}
                <div className="space-y-2">
                    {categoriesWithProducts.map((category) => (
                        <button
                            key={category._id}
                            onClick={() => handleCategoryClick(category.slug)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${selectedCategory === category.slug
                                    ? 'bg-gray-50 text-gray-900 border border-gray-200'
                                    : 'text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                                }`}
                        >
                            <div className="flex items-center flex-1">
                                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mr-3">
                                    {category.image ? (
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-cover rounded-md"
                                        />
                                    ) : (
                                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className=" truncate">
                                        {category.name}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedCategory === category.slug
                                        ? 'bg-gray-200 text-gray-700'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {category.productCount || 0}
                                </span>
                                {selectedCategory === category.slug && (
                                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                
            </div>
        </div>
    );
};

export default CategorySidebar;