import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/src/types/index';
import axios from 'axios';

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
    const discountPercentage = hasDiscount ? 15 : 0;

    // State for loading and success feedback
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Custom Toast Function
    const showCustomToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        // Remove existing toast
        const existingToast = document.querySelector('.custom-toast-product');
        if (existingToast) {
            existingToast.remove();
        }

        const toastElement = document.createElement('div');
        toastElement.className = `custom-toast-product toast-${type}`;

        const icons = {
            success: `
                <svg xmlns="http://www.w3.org/2000/svg" class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
            `,
            error: `
                <svg xmlns="http://www.w3.org/2000/svg" class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
            `,
            info: `
                <svg xmlns="http://www.w3.org/2000/svg" class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
            `
        };

        toastElement.innerHTML = `
            <div class="toast-content">
                ${icons[type]}
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(toastElement);

        setTimeout(() => {
            toastElement.classList.add('show');
        }, 10);

        setTimeout(() => {
            toastElement.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toastElement)) {
                    toastElement.remove();
                }
            }, 300);
        }, 4000);
    };

    // Add to Cart function with backend validation
    const handleAddToCart = async () => {
        if (product.availability !== 'InStock' || product.quantity <= 0) {
            showCustomToast('This product is out of stock', 'error');
            return;
        }

        if (product.productType === 'Affiliate') {
            showCustomToast('This is an affiliate product', 'info');
            return;
        }

        setIsAddingToCart(true);

        try {
            // Step 1: Validate with backend API
            const validationResponse = await axios.post('/api/products/cart/validate', {
                productId: product._id,
                quantity: 1, // Default quantity for card view
                size: null, // Size not required for card view
            });

            const validation = validationResponse.data;

            if (!validation.valid) {
                showCustomToast(validation.message, 'error');
                setIsAddingToCart(false);
                return;
            }

            // Step 2: Get current cart
            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');

            // Step 3: Check if product already exists in cart
            const existingItemIndex = currentCart.findIndex((item: any) =>
                item._id === product._id && (!item.size || item.size === '')
            );

            let newQuantity = 1;
            let updatedCart = [...currentCart];

            if (existingItemIndex > -1) {
                // Update quantity if already exists (max 3)
                const existingItem = currentCart[existingItemIndex];
                newQuantity = Math.min(existingItem.quantity + 1, 3);

                // Check if new quantity exceeds available stock
                if (newQuantity > product.quantity) {
                    showCustomToast(`Only ${product.quantity} units available`, 'error');
                    setIsAddingToCart(false);
                    return;
                }

                // Update the item
                updatedCart[existingItemIndex] = {
                    ...existingItem,
                    quantity: newQuantity
                };
            } else {
                // Add new item to cart
                // Check maximum quantity limit
                if (product.quantity <= 0) {
                    showCustomToast('Product out of stock', 'error');
                    setIsAddingToCart(false);
                    return;
                }

                const newItem = {
                    _id: product._id,
                    title: product.title,
                    price: mainPrice?.amount || 0,
                    quantity: 1,
                    mainImage: product.mainImage,
                    mainImageAlt: product.mainImageAlt,
                    currency: mainPrice?.currency || 'BDT',
                    size: '', // No size for card view
                };
                updatedCart.push(newItem);
            }

            // Step 4: Save to localStorage
            localStorage.setItem('cart', JSON.stringify(updatedCart));

            // Step 5: Dispatch custom event to update cart slider
            window.dispatchEvent(new Event('cartUpdated'));

            // Step 6: Show success feedback
            setShowSuccess(true);
            showCustomToast(
                existingItemIndex > -1
                    ? `Updated quantity to ${newQuantity}`
                    : `${product.title} added to cart!`,
                'success'
            );

            // Reset success state after 2 seconds
            setTimeout(() => {
                setShowSuccess(false);
            }, 2000);

        } catch (error: any) {
            console.error('Error adding to cart:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                'Failed to add to cart';
            showCustomToast(errorMessage, 'error');
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Check if product is actually in stock
    const isActuallyInStock = product.availability === 'InStock' &&
        product.quantity > 0 &&
        product.productType !== 'Affiliate';

    // Add CSS for toast
    React.useEffect(() => {
        if (typeof window === 'undefined') return;

        const style = document.createElement('style');
        style.textContent = `
            .custom-toast-product {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                transform: translateX(120%);
                transition: transform 0.3s ease;
                max-width: 350px;
                border: 1px solid #e5e7eb;
            }
            .custom-toast-product.show {
                transform: translateX(0);
            }
            .toast-success {
                border-left: 4px solid #10b981;
            }
            .toast-error {
                border-left: 4px solid #ef4444;
            }
            .toast-info {
                border-left: 4px solid #3b82f6;
            }
            .toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .toast-icon {
                width: 20px;
                height: 20px;
                flex-shrink: 0;
            }
            .toast-success .toast-icon {
                color: #10b981;
            }
            .toast-error .toast-icon {
                color: #ef4444;
            }
            .toast-info .toast-icon {
                color: #3b82f6;
            }
            .toast-message {
                font-size: 14px;
                color: #374151;
                flex: 1;
            }
            .toast-close {
                color: #9ca3af;
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .toast-close:hover {
                color: #6b7280;
                background: #f3f4f6;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // List View
    if (viewMode === 'list') {
        return (
            <div className="group bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="lg:w-2/5 relative">
                        <Link href={`/product/${product.slug}`}>
                            <div className="relative h-64 lg:h-full overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                                {product.mainImage ? (
                                    <img
                                        src={product.mainImage}
                                        alt={product.mainImageAlt || product.title}
                                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                                        loading="lazy"
                                        width={800}
                                        height={800}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-20 h-20 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Content Section */}
                    <div className="lg:w-3/5 p-6 lg:p-8">
                        <div className="h-full flex flex-col justify-between">
                            <div>
                                {/* Header */}
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <Link href={`/product/${product.slug}`}>
                                            <h2 className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors line-clamp-2 mb-2">
                                                {product.title}
                                            </h2>
                                        </Link>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                                                {product.brand}
                                            </span>
                                            {/* Stock Status Badge */}
                                            <span className={`text-xs px-3 py-1 rounded-full ${isActuallyInStock
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {isActuallyInStock ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    {product.aggregateRating?.ratingValue && (
                                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span className="ml-1 text-lg font-bold text-gray-900">
                                                    {product.aggregateRating.ratingValue.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Short Description */}
                                {product.shortDescription && (
                                    <p className="text-gray-600 mb-6 line-clamp-3">
                                        {product.shortDescription}
                                    </p>
                                )}
                            </div>

                            {/* Footer with Price and Actions */}
                            <div className="pt-6 border-t border-gray-100">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    {/* Price Section */}
                                    <div className="space-y-2">
                                        {mainPrice && (
                                            <div className="flex items-baseline gap-4">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                                                        {mainPrice.currency === 'BDT' ? '৳' : '$'}{mainPrice.amount.toLocaleString()}
                                                    </span>
                                                    {hasDiscount && (
                                                        <>
                                                            <span className="text-xl text-gray-500 line-through">
                                                                {mainPrice.currency === 'BDT' ? '৳' : '$'}
                                                                {(mainPrice.amount * 1.15).toLocaleString()}
                                                            </span>
                                                            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">
                                                                Save {discountPercentage}%
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {/* Stock Info */}
                                        <div className="text-sm text-gray-500">
                                            Available: {product.quantity} units
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <Link
                                            href={`/product/${product.slug}`}
                                            className="px-8 py-3.5 bg-gradient-to-r from-gray-900 to-black text-white font-semibold rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:translate-y-[-2px] flex items-center justify-center gap-2 min-w-[140px]"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            View Details
                                        </Link>
                                        {isActuallyInStock && (
                                            <button
                                                onClick={handleAddToCart}
                                                disabled={isAddingToCart}
                                                className={`px-8 py-3.5 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:translate-y-[-2px] flex items-center justify-center gap-2 min-w-[140px]
                                                    ${showSuccess
                                                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                                                        : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700'
                                                    }`}
                                            >
                                                {isAddingToCart ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Adding...
                                                    </>
                                                ) : showSuccess ? (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Added!
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        Add to Cart
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Grid View
    return (
        <div className="group bg-white rounded-3xl border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 overflow-hidden h-full flex flex-col">
            {/* Image Container */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                <Link href={`/product/${product.slug}`}>
                    <div className="relative aspect-square">
                        {product.mainImage ? (
                            <img
                                src={product.mainImage}
                                alt={product.mainImageAlt || product.title}
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                                width={800}
                                height={800}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-24 h-24 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>
                </Link>

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {/* Stock Status Badge */}
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg ${isActuallyInStock
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                        : 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                        }`}>
                        {isActuallyInStock ? 'In Stock' : 'Out of Stock'}
                    </span>

                    {/* Discount Badge */}
                    {hasDiscount && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-lg shadow-lg">
                            -{discountPercentage}%
                        </span>
                    )}
                </div>

                {/* Rating Badge */}
                {product.aggregateRating?.ratingValue && (
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 shadow-lg">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-white text-sm font-bold">
                            {product.aggregateRating.ratingValue.toFixed(1)}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 p-5 flex flex-col">
                {/* Brand and Category */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
                        {product.brand}
                    </span>
                    {product.category && typeof product.category !== 'string' && (
                        <span className="text-xs text-gray-500 truncate max-w-[100px]">
                            {product.category.name}
                        </span>
                    )}
                </div>

                {/* Title */}
                <Link href={`/product/${product.slug}`} className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 hover:text-gray-700 transition-colors line-clamp-2 mb-3 leading-tight group-hover:underline">
                        {product.title}
                    </h3>
                </Link>

                {/* Short Description */}
                {product.shortDescription && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                        {product.shortDescription}
                    </p>
                )}

                {/* Price */}
                <div className="mb-5">
                    {mainPrice && (
                        <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                    {mainPrice.currency === 'BDT' ? '৳' : '$'}{mainPrice.amount.toLocaleString()}
                                </span>
                                {hasDiscount && (
                                    <span className="text-base text-gray-500 line-through">
                                        {mainPrice.currency === 'BDT' ? '৳' : '$'}
                                        {(mainPrice.amount * 1.15).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            {hasDiscount && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-red-600 font-semibold">
                                        Save {discountPercentage}%
                                    </span>
                                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-600 rounded-full" style={{ width: `${discountPercentage}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-auto">
                    <div className="flex gap-2">
                        <Link
                            href={`/product/${product.slug}`}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-900 to-black text-white font-semibold text-sm rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Details
                        </Link>
                        {isActuallyInStock && (
                            <button
                                onClick={handleAddToCart}
                                disabled={isAddingToCart}
                                className={`flex-1 px-4 py-3 font-semibold text-sm rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2
                                    ${showSuccess
                                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                                        : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700'
                                    }`}
                            >
                                {isAddingToCart ? (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : showSuccess ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                )}
                                {showSuccess ? 'Added!' : 'Add'}
                            </button>
                        )}
                    </div>

                    {/* Stock Info */}
                    {!isActuallyInStock && (
                        <p className="text-xs text-red-600 text-center mt-3">
                            Out of Stock ({product.quantity} available)
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;