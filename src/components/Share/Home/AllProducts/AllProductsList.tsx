'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/src/components/products/ProductCard/ProductCard';
import { Product } from '@/src/types/index';
import Link from 'next/link';

interface AllProductsListProps {
  limit?: number;
}

const AllProductsList: React.FC<AllProductsListProps> = ({
  limit = 35 // Default to 35 as requested
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Direct data fetch from your existing lib/data.ts
        const { getProducts } = await import('@/src/lib/data');
        const fetchedProducts = await getProducts();

        // Sort products - latest first (by createdAt)
        const sortedProducts = [...fetchedProducts].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA; // Latest first
        });

        setAllProducts(sortedProducts);

        // Take limited number of products (max 35)
        const limitedProducts = sortedProducts.slice(0, limit);
        setProducts(limitedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit]);

  const hasMoreProducts = allProducts.length > limit;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-700 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <div className="text-gray-400 text-5xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Products Found</h3>
          <p className="text-gray-600">Products will be available soon. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Header - Simplified without product count */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">All Products</h2>
          </div>

          {/* View All Button - Only show if more than 35 products */}
          {hasMoreProducts && (
            <div className="mt-4 md:mt-0">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-colors duration-300"
              >
                <span>View All Products</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Products Grid - Responsive: 2(mobile), 3(tablet), 4(laptop), 5(desktop+) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              viewMode="grid"
            />
          ))}
        </div>

        {/* View All Button - Bottom (for mobile users) */}
        {hasMoreProducts && (
          <div className="mt-8 sm:mt-10 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-300 shadow-sm hover:shadow-md"
            >
              <span>View All {allProducts.length} Products</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProductsList;