import React from 'react';
import Link from 'next/link';
import { Product } from '@/src/types/index';


interface ProductCardProps {
    product: Product;
    viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
    // Get price in BDT or first available price
    const bdtPrice = product.prices?.find(p => p.currency === 'BDT');
    const mainPrice = bdtPrice || product.prices?.[0];

    // Calculate discount if any
    const hasDiscount = product.prices?.some(p => p.exchangeRate && p.exchangeRate < 1);
    const discountPercentage = hasDiscount ? 15 : 0; // You can calculate actual discount

    if (viewMode === 'list') {
        return (
            <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="md:w-1/4 relative">
                        <Link href={`/product/${product.slug}`}>
                            <div className="relative h-48 md:h-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                                {product.mainImage ? (
                                    <img
                                        src={product.mainImage}
                                        alt={product.mainImageAlt || product.title}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}

                                {/* Availability Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.availability === 'InStock'
                                            ? 'bg-green-100 text-green-800'
                                            : product.availability === 'PreOrder'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                        {product.availability}
                                    </span>
                                </div>

                                {/* Discount Badge */}
                                {hasDiscount && (
                                    <div className="absolute top-3 right-3">
                                        <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-md">
                                            -{discountPercentage}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Content Section */}
                    <div className="md:w-3/4 p-6">
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <Link href={`/product/${product.slug}`}>
                                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                                            {product.title}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center space-x-1">
                                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="font-medium text-gray-900">
                                            {product.aggregateRating?.ratingValue?.toFixed(1) || '4.5'}
                                        </span>
                                        <span className="text-gray-500 text-sm">
                                            ({product.aggregateRating?.reviewCount || 0} reviews)
                                        </span>
                                    </div>
                                </div>

                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {product.shortDescription || product.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                        {product.brand}
                                    </span>
                                    {product.category && typeof product.category !== 'string' && (
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                                            {product.category.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-100">
                                <div className="mb-4 sm:mb-0">
                                    {mainPrice && (
                                        <div className="flex items-baseline space-x-3">
                                            <span className="text-3xl font-bold text-gray-900">
                                                {mainPrice.currency === 'BDT' ? '৳' : '$'}{mainPrice.amount.toLocaleString()}
                                            </span>
                                            {hasDiscount && (
                                                <span className="text-lg text-gray-500 line-through">
                                                    {mainPrice.currency === 'BDT' ? '৳' : '$'}
                                                    {(mainPrice.amount * 1.15).toLocaleString()}
                                                </span>
                                            )}
                                            {product.prices && product.prices.length > 1 && (
                                                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                    +{product.prices.length - 1} currencies
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-500 mt-1">
                                        Stock: {product.quantity} units
                                    </p>
                                </div>

                                <div className="flex space-x-3">
                                    <Link
                                        href={`/product/${product.slug}`}
                                        className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-lg hover:from-gray-900 hover:to-black transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        View Details
                                    </Link>
                                    {product.availability === 'InStock' && (
                                        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Add to Cart
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Grid View (Default)
    return (
        <div className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Image Container */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <Link href={`/product/${product.slug}`}>
                    <div className="relative h-64">
                        {product.mainImage ? (
                            <img
                                src={product.mainImage}
                                alt={product.mainImageAlt || product.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-20 h-20 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                </Link>

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    {/* Availability */}
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${product.availability === 'InStock'
                            ? 'bg-green-500/90 text-white shadow-lg'
                            : product.availability === 'PreOrder'
                                ? 'bg-yellow-500/90 text-white shadow-lg'
                                : 'bg-red-500/90 text-white shadow-lg'
                        }`}>
                        {product.availability}
                    </span>

                    {/* Discount */}
                    {hasDiscount && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg">
                            SAVE {discountPercentage}%
                        </span>
                    )}
                </div>

                {/* Quick Actions on hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-lg hover:scale-110 transition-all duration-200">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Category/Brand */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {product.brand}
                    </span>
                    <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">
                            {product.aggregateRating?.ratingValue?.toFixed(1) || '4.5'}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                            ({product.aggregateRating?.reviewCount || 0})
                        </span>
                    </div>
                </div>

                {/* Title */}
                <Link href={`/product/${product.slug}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                        {product.title}
                    </h3>
                </Link>

                {/* Description */}
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {product.shortDescription || product.description}
                </p>

                {/* Price */}
                <div className="mb-5">
                    {mainPrice && (
                        <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-bold text-gray-900">
                                {mainPrice.currency === 'BDT' ? '৳' : '$'}{mainPrice.amount.toLocaleString()}
                            </span>
                            {hasDiscount && (
                                <span className="text-sm text-gray-500 line-through">
                                    {mainPrice.currency === 'BDT' ? '৳' : '$'}
                                    {(mainPrice.amount * 1.15).toLocaleString()}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                    <Link
                        href={`/product/${product.slug}`}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm font-medium rounded-lg hover:from-gray-900 hover:to-black transition-all duration-200 text-center shadow-sm hover:shadow-md"
                    >
                        View Details
                    </Link>
                    {product.availability === 'InStock' && (
                        <button className="w-12 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Free shipping
                    </div>
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Easy returns
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;