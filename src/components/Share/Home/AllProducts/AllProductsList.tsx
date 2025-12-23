'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/src/components/products/ProductCard/ProductCard';
import { Product } from '@/src/types/index';

interface AllProductsListProps {
  limit?: number;
  showLatestFirst?: boolean;
}

const AllProductsList: React.FC<AllProductsListProps> = ({ 
  limit = 50, 
  showLatestFirst = true 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Direct data fetch from your existing lib/data.ts
        const { getProducts } = await import('@/src/lib/data');
        const allProducts = await getProducts();

        // Sort products - latest first (by createdAt)
        let sortedProducts = [...allProducts];
        
        if (showLatestFirst) {
          sortedProducts.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Latest first
          });
        }

        // Take limited number of products
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
  }, [limit, showLatestFirst]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
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
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header with product count */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">All Products</h2>
            <p className="text-gray-600 mt-2">
              Showing {products.length} {products.length === 1 ? 'product' : 'products'}
              {showLatestFirst && ' (Latest first)'}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Latest Products First
            </span>
          </div>
        </div>

        {/* Products Grid - 5 columns on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              viewMode="grid"
            />
          ))}
        </div>

        {/* Footer with more info */}
        {products.length >= limit && (
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Showing first {limit} products. 
              <a href="/products" className="ml-2 text-blue-600 hover:text-blue-800 font-medium">
                View all products →
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProductsList;