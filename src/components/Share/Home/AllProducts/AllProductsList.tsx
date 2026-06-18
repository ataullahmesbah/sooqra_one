// src/components/products/AllProductsList/AllProductsList.tsx
'use client';

import React from 'react';
import ProductCard from '@/src/components/products/ProductCard/ProductCard';
import Link from 'next/link';
import { useCachedProducts } from '@/src/hooks/useCachedProducts';

interface AllProductsListProps {
  limit?: number;
}

// ── Skeleton card — matches real ProductCard grid layout exactly ──────────────
function ProductSkeletonCard() {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-pulse">
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
          }}
        />
      </div>
      {/* Content */}
      <div className="p-2 sm:p-3 flex flex-col gap-2 flex-1">
        {/* Availability badge */}
        <div className="h-3 w-12 bg-gray-200 rounded-full" />
        {/* Title — 2 lines */}
        <div className="space-y-1.5 flex-1">
          <div className="h-2.5 bg-gray-200 rounded w-full" />
          <div className="h-2.5 bg-gray-200 rounded w-4/5" />
          <div className="h-2.5 bg-gray-200 rounded w-3/5" />
        </div>
        {/* Price */}
        <div className="h-4 bg-gray-200 rounded w-2/5 mt-1" />
        {/* Buttons */}
        <div className="flex gap-1.5 mt-1">
          <div className="flex-1 h-7 bg-gray-200 rounded" />
          <div className="flex-1 h-7 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

const AllProductsList: React.FC<AllProductsListProps> = ({ limit = 35 }) => {
  const { products, allProducts, loading, error, lastUpdated } = useCachedProducts(limit);
  const hasMoreProducts = allProducts.length > limit;

  // ── Skeleton loading — no spinner ─────────────────────────────────────────
  if (loading && products.length === 0) {
    return (
      <>
        {/* Inject shimmer keyframe once */}
        <style>{`
          @keyframes skeleton-shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position:  200% 0; }
          }
        `}</style>
        <div className="py-6 sm:py-8">
          <div className="container mx-auto px-2 sm:px-4">
            {/* Header skeleton */}
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-1 h-7 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-44 bg-gray-200 rounded animate-pulse" />
            </div>
            {/* Grid skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductSkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error && products.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (products.length === 0 && !loading) {
    return (
      <div className="text-center py-10">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Products Found</h3>
          <p className="text-gray-500 text-sm">Products will be available soon. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      <div className="py-6 sm:py-8">
        <div className="container mx-auto px-2 sm:px-4">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              {/* Left accent bar — consistent with TopSelling & Category */}
              <div className="w-2 h-7 bg-gray-500 rounded-full flex-shrink-0" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                Popular Products
              </h2>
            </div>

            {hasMoreProducts && (
              <div className="mt-3 md:mt-0">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 bg-white px-3 py-1.5 rounded-full hover:border-gray-400 hover:text-gray-800 transition-all"
                >
                  View All Products
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* ── Products Grid ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                viewMode="grid"
              />
            ))}
          </div>

          {/* ── Background refresh indicator (non-intrusive) ──────────────── */}
          {loading && products.length > 0 && (
            <div className="fixed bottom-4 right-4 bg-gray-800/90 text-white text-xs px-3 py-1.5 rounded-full shadow-lg z-50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Updating...
            </div>
          )}

          {/* ── View All — bottom ───────────────────────────────────────────── */}
          {hasMoreProducts && (
            <div className="mt-8 sm:mt-10 flex justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                View All {allProducts.length} Products
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default AllProductsList;