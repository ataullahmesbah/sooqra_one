// src/app/components/CategoryGrid/CategoryGrid.tsx - UPDATED WITH FILTER
'use client';

import { useEffect, useState, useCallback } from 'react';
import CategoryCard from '../CategoryCard/CategoryCard';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  productCount?: number;
  image?: string;
  latestProduct?: {
    mainImage?: string;
    mainImageAlt?: string;
    title?: string;
  };
  slug?: string;
}

const CategoryGrid = () => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMoreCategories, setHasMoreCategories] = useState(false);

  // Filter and limit categories to show only those with products
  const filterAndLimitCategories = useCallback((categories: Category[], limit: number = 6): Category[] => {
    // Step 1: Filter out categories with productCount = 0 or undefined
    const categoriesWithProducts = categories.filter(cat =>
      cat.productCount && cat.productCount > 0
    );

    // Step 2: Sort by productCount (highest first) then by creation date
    const sortedCategories = categoriesWithProducts.sort((a, b) => {
      // First sort by product count (descending)
      if (b.productCount! > a.productCount!) return 1;
      if (b.productCount! < a.productCount!) return -1;
      // If product counts are equal, show newer categories first
      return 0;
    });

    // Step 3: Take only top N categories
    return sortedCategories.slice(0, limit);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Fetch more than 6 (e.g., 12) to have backup if some have 0 products
        const response = await fetch('/api/categories?limit=12&withCount=true&withLatestProduct=true');

        if (!response.ok) throw new Error('Failed to fetch categories');

        const data = await response.json();
        setAllCategories(data);

        // Filter and limit to 6 categories with products
        const filtered = filterAndLimitCategories(data, 6);
        setFilteredCategories(filtered);

        // Check if there are more categories available (for stats)
        const categoriesWithProducts = data.filter((cat: Category) =>
          cat.productCount && cat.productCount > 0
        );
        setHasMoreCategories(categoriesWithProducts.length > 6);

      } catch (err) {
        console.error('Error fetching categories:', err);
        setAllCategories([]);
        setFilteredCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [filterAndLimitCategories]);

  // Calculate stats
  const totalCategoriesWithProducts = allCategories.filter(cat =>
    cat.productCount && cat.productCount > 0
  ).length;

  return (
    <section className="py-10 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Shop By Categories
            </h2>
            <p className="text-gray-600">
              বিশুদ্ধ, প্রাকৃতিক ও স্বাস্থ্যকর খাবারের সেরা সংগ্রহ
            </p>
          </div>

          {/* Stats and Link */}
          <div className="mt-4 md:mt-0 items-end">

            <Link
              href="/categories"
              className="inline-flex items-center text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              All Categories
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-xl border border-gray-300"
              />
            ))}
          </div>
        )}

        {/* Categories Grid - Show only categories with products */}
        {!loading && filteredCategories.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {filteredCategories.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          </>
        )}

        {/* Empty State - Updated Message */}
        {!loading && filteredCategories.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories with Products</h3>
            <p className="text-gray-600 mb-4">
              {allCategories.length > 0
                ? 'All categories are currently empty. Please check back later.'
                : 'No categories available at the moment.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;