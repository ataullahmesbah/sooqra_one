// src/app/components/CategoryGrid/CategoryGrid.tsx
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

// ── Skeleton Card ──────────────────────────────────────────────────────────────
function CategorySkeletonCard() {
  return (
    <div className="category-skeleton-card">
      <div className="category-skeleton-image" />
      <div className="category-skeleton-content">
        <div className="category-skeleton-title" />
        <div className="category-skeleton-badge" />
      </div>
    </div>
  );
}

const CategoryGrid = () => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMoreCategories, setHasMoreCategories] = useState(false);

  const filterAndLimitCategories = useCallback((categories: Category[], limit: number = 6): Category[] => {
    const categoriesWithProducts = categories.filter(cat =>
      cat.productCount && cat.productCount > 0
    );
    const sortedCategories = categoriesWithProducts.sort((a, b) => {
      if (b.productCount! > a.productCount!) return 1;
      if (b.productCount! < a.productCount!) return -1;
      return 0;
    });
    return sortedCategories.slice(0, limit);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          '/api/categories?limit=12&withCount=true&withLatestProduct=true',
          { next: { revalidate: 600 }, cache: 'force-cache' }
        );
        if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status}`);

        const data = await response.json();
        const categoriesArray = Array.isArray(data)
          ? data
          : data.categories || data.data || [];

        setAllCategories(categoriesArray);
        const filtered = filterAndLimitCategories(categoriesArray, 6);
        setFilteredCategories(filtered);

        const categoriesWithProducts = categoriesArray.filter((cat: Category) =>
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

  const totalCategoriesWithProducts = allCategories.filter(cat =>
    cat.productCount && cat.productCount > 0
  ).length;

  return (
    <section className="category-grid-section">
      <div className="category-grid-container">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="category-grid-header">
          <div className="category-grid-header-left">
            {/* Title with left accent bar + half underline */}
            <div className="category-title-wrapper">
              <div className="category-title-accent" />
              <h2 className="category-section-title">Shop By Categories</h2>
            </div>
            <div className="category-title-underline" />
            {/* ✅ English subtitle */}
            <p className="category-section-subtitle">
              Shop the most popular products in our collection.
            </p>
          </div>

          <div className="category-grid-header-right">
            <Link href="/categories" className="all-categories-link">
              All Categories
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ── Skeleton Loading ────────────────────────────────────────────────── */}
        {loading && (
          <div className="category-grid">
            {[...Array(6)].map((_, i) => (
              <CategorySkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Categories Grid ─────────────────────────────────────────────────── */}
        {!loading && filteredCategories.length > 0 && (
          <div className="category-grid">
            {filteredCategories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}

        {/* ── Empty State ─────────────────────────────────────────────────────── */}
        {!loading && filteredCategories.length === 0 && (
          <div className="category-empty-state">
            <div className="category-empty-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="category-empty-title">No Categories Available</h3>
            <p className="category-empty-description">
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