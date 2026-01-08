import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/src/types/index';
import axios from 'axios';
import CartSlider from '../../Share/Shop/CartSlider/CartSlider';

interface ProductCardProps {
    product: Product;
    viewMode?: 'grid' | 'list';
}

// Cart Item Interface
interface CartItem {
    _id: string;
    title: string;
    quantity: number;
    price: number;
    mainImage: string;
    mainImageAlt?: string;
    currency: string;
    size?: string;
}

// Validation Response Interface
interface ValidationResponse {
    valid: boolean;
    message: string;
    productId?: string;
    title?: string;
    availableQuantity?: number;
    maxPerOrder?: number;
}

// Conversion Rates Interface
interface ConversionRates {
    USD: number;
    EUR: number;
    BDT: number;
    [key: string]: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
    // Get price in BDT or first available price
    const bdtPrice = product.prices?.find(p => p.currency === 'BDT');
    const mainPrice = bdtPrice || product.prices?.[0];

    // Calculate discount if any
    const hasDiscount = product.prices?.some(p => p.exchangeRate && p.exchangeRate < 1);
    const discountPercentage = hasDiscount ? 15 : 0;

    // State for cart functionality
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [conversionRates, setConversionRates] = useState<ConversionRates>({ USD: 123, EUR: 135, BDT: 1 });
    const [isClient, setIsClient] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [quantity, setQuantity] = useState(1); // Fixed to 1 for card view
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [modalSelectedSize, setModalSelectedSize] = useState<string | null>(null);
    const [modalShowSizeError, setModalShowSizeError] = useState(false);

    // Initialize client-side
    useEffect(() => {
        setIsClient(true);

        // Remove the API call since it doesn't exist
        // Keep default conversion rates
        setConversionRates({ USD: 123, EUR: 135, BDT: 1 });

        // Alternatively, you can just set the default values directly:
        // const defaultRates = { USD: 123, EUR: 135, BDT: 1 };
        // setConversionRates(defaultRates);
    }, []);

    // Custom Toast Function
    const showCustomToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        if (!isClient) return;

        const existingToast = document.querySelector('.custom-toast-slider');
        if (existingToast) {
            document.body.removeChild(existingToast);
        }

        const toastElement = document.createElement('div');
        toastElement.className = `custom-toast-slider custom-toast-${type}`;

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
                    document.body.removeChild(toastElement);
                }
            }, 300);
        }, 4000);
    };

    // Refactored add to cart logic
    const addToCart = async (size: string | null): Promise<boolean> => {
        setIsAddingToCart(true);

        try {
            const response = await axios.post('/api/products/cart/validate', {
                productId: product._id,
                quantity: quantity,
                size: size || null,
            });
            const validation = response.data;

            if (!validation.valid) {
                showCustomToast(validation.message, 'error');
                return false;
            }

            const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItem = cart.find((item) =>
                item._id === product._id &&
                (item.size || null) === (size || null)
            );
            let newQuantity = quantity;

            if (existingItem) {
                newQuantity = existingItem.quantity + quantity;
                if (newQuantity > 3) {
                    showCustomToast('Cannot add more than 3 units of this product', 'error');
                    return false;
                }
                if (size) {
                    const sizeData = product.sizes?.find((s: any) => s.name === size);
                    if (sizeData && newQuantity > sizeData.quantity) {
                        showCustomToast(`Only ${sizeData.quantity} units available for size ${size}`, 'error');
                        return false;
                    }
                }
                cart.splice(cart.indexOf(existingItem), 1);
                cart.push({
                    ...existingItem,
                    quantity: newQuantity,
                    size: size || undefined
                });
                showCustomToast(`Cart updated with ${newQuantity} units of ${product.title}`, 'success');
            } else {
                const priceObj = product.prices.find((p: any) => p.currency === 'BDT') || product.prices[0];
                const priceInBDT = priceObj.currency === 'BDT'
                    ? priceObj.amount
                    : priceObj.amount * (conversionRates[priceObj.currency as keyof typeof conversionRates] || 1);
                cart.push({
                    _id: product._id,
                    title: product.title,
                    quantity: quantity,
                    price: priceInBDT,
                    mainImage: product.mainImage,
                    mainImageAlt: product.mainImageAlt,
                    currency: 'BDT',
                    size: size || undefined,
                });
                showCustomToast(`Added ${quantity} units of ${product.title} to cart`, 'success');
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));

            // Show success feedback
            setShowSuccess(true);
            setIsCartOpen(true);

            setTimeout(() => {
                setShowSuccess(false);
            }, 2000);

            return true;
        } catch (error: any) {
            console.error('Error validating product stock:', error);
            showCustomToast(error.response?.data?.message || 'Error checking product availability', 'error');
            return false;
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Handle Add to Cart click
    const handleAddToCart = () => {
        if (product.availability !== 'InStock' || product.productType === 'Affiliate') {
            showCustomToast('This product cannot be added to cart', 'error');
            return;
        }

        if (product.productType === 'Own' && product.sizeRequirement === 'Mandatory' && product.sizes) {
            const availableSizes = product.sizes.filter(s => s.quantity > 0);
            if (availableSizes.length === 0) {
                showCustomToast('No sizes available for this product', 'error');
                return;
            }
            setModalSelectedSize(null);
            setModalShowSizeError(false);
            setIsSizeModalOpen(true);
            return;
        }

        if (product.quantity <= 0) {
            showCustomToast('This product is out of stock', 'error');
            return;
        }

        addToCart(null);
    };

    // Handle modal add
    const handleModalAdd = async () => {
        if (!modalSelectedSize) {
            setModalShowSizeError(true);
            showCustomToast('Please select a size before adding to cart', 'error');
            return;
        }

        const success = await addToCart(modalSelectedSize);
        if (success) {
            setIsSizeModalOpen(false);
        }
    };

    // Get actual availability status
    const getActualAvailability = () => {
        if (product.productType === 'Affiliate') {
            return 'Affiliate';
        }

        if (product.availability !== 'InStock') {
            return product.availability;
        }

        const hasAvailableStock = (product.sizeRequirement === 'Mandatory' && product.sizes)
            ? product.sizes.some(s => s.quantity > 0)
            : (product.quantity ?? 0) > 0;

        if (!hasAvailableStock) {
            return 'OutOfStock';
        }

        return 'InStock';
    };

    const actualAvailability = getActualAvailability();

    // Check if add to cart button should be disabled
    const isAddToCartDisabled = () => {
        // Disable for affiliate products
        if (product.productType === 'Affiliate') {
            return true;
        }

        // Disable if not in stock
        if (actualAvailability !== 'InStock') {
            return true;
        }

        return false;
    };

    // Get button text based on product type
    const getAddToCartButtonText = () => {
        if (product.productType === 'Affiliate') {
            return 'Affiliate';
        }

        if (actualAvailability !== 'InStock') {
            return actualAvailability === 'OutOfStock' ? 'Out of Stock' : actualAvailability;
        }

        if (showSuccess) {
            return 'Added!';
        }

        if (isAddingToCart) {
            return 'Adding...';
        }

        return 'Add to Cart';
    };

    // Get button styling based on state
    const getAddToCartButtonStyle = () => {
        if (product.productType === 'Affiliate') {
            return 'bg-gray-300 text-gray-500 cursor-not-allowed';
        }

        if (actualAvailability !== 'InStock') {
            return 'bg-gray-300 text-gray-500 cursor-not-allowed';
        }

        if (showSuccess) {
            return 'bg-gradient-to-r from-green-600 to-green-700 text-white';
        }

        if (isAddingToCart) {
            return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white cursor-wait';
        }

        return 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700';
    };

    // Add CSS for toast
    useEffect(() => {
        if (!isClient) return;

        const style = document.createElement('style');
        style.textContent = `
            .custom-toast-slider {
                position: fixed;
                top: 24px;
                right: 24px;
                background: white;
                color: #1f2937;
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                border-left: 4px solid #374151;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 1001;
                max-width: 320px;
            }

            .custom-toast-slider.show {
                opacity: 1;
                transform: translateY(0);
            }

            .custom-toast-success {
                border-left-color: #10b981;
            }

            .custom-toast-error {
                border-left-color: #ef4444;
            }

            .toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .toast-icon {
                width: 20px;
                height: 20px;
                color: #374151;
                flex-shrink: 0;
            }

            .custom-toast-success .toast-icon {
                color: #10b981;
            }

            .custom-toast-error .toast-icon {
                color: #ef4444;
            }

            .toast-message {
                flex: 1;
                font-size: 14px;
                line-height: 1.4;
                color: #374151;
            }

            .toast-close {
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s;
            }

            .toast-close:hover {
                color: #374151;
                background: rgba(0, 0, 0, 0.05);
            }
        `;
        document.head.appendChild(style);

        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, [isClient]);

    return (
        <>
            {/* Main Product Card */}
            {viewMode === 'list' ? (
                <div className="group bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        {/* Image Section */}
                        <div className="lg:w-2/5 relative">
                            <Link href={`/products/${product.slug || product._id}`}>
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

                                    {/* Availability Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${product.productType === 'Affiliate'
                                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                                            : actualAvailability === 'InStock'
                                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                                                : actualAvailability === 'PreOrder'
                                                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg'
                                                    : 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                                            }`}>
                                            {product.productType === 'Affiliate'
                                                ? 'Affiliate'
                                                : actualAvailability === 'OutOfStock'
                                                    ? 'Out of Stock'
                                                    : actualAvailability}
                                        </span>
                                    </div>
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
                                            <Link href={`/products/${product.slug || product._id}`}>
                                                <h2 className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors line-clamp-2 mb-2">
                                                    {product.title}
                                                </h2>
                                            </Link>
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
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <Link
                                                href={`/products/${product.slug || product._id}`}
                                                className="px-8 py-3.5 bg-gradient-to-r from-gray-900 to-black text-white font-semibold rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:translate-y-[-2px] flex items-center justify-center gap-2 min-w-[140px]"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                View Details
                                            </Link>
                                            <button
                                                onClick={handleAddToCart}
                                                disabled={isAddToCartDisabled() || isAddingToCart}
                                                className={`px-8 py-3.5 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:translate-y-[-2px] flex items-center justify-center gap-2 min-w-[140px] ${getAddToCartButtonStyle()}`}
                                            >
                                                {isAddingToCart ? (
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : showSuccess ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : product.productType === 'Affiliate' ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                )}
                                                {getAddToCartButtonText()}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (

                <div className="group bg-white rounded-lg sm:rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg sm:hover:shadow-2xl transition-all duration-500 overflow-hidden h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                        <Link href={`/products/${product.slug || product._id}`}>
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
                                        <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </Link>

                        {/* Top Badges - Mobile Responsive changes */}
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 space-y-1">
                            {/* Availability Badge - With opacity */}
                            <div className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-sm sm:rounded text-[8px] sm:text-[10px] font-medium tracking-wide backdrop-blur-sm ${product.productType === 'Affiliate'
                                ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30'
                                : actualAvailability === 'InStock'
                                    ? 'bg-green-600 text-white'
                                    : actualAvailability === 'PreOrder'
                                        ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30'
                                        : 'bg-red-600 text-red-200 '
                                }`}>
                                <span className="opacity-100 font-bold">
                                    {product.productType === 'Affiliate'
                                        ? 'Affiliate'
                                        : actualAvailability === 'OutOfStock'
                                            ? 'Out of Stock'
                                            : actualAvailability === 'InStock'
                                                ? 'In Stock'
                                                : actualAvailability}
                                </span>
                            </div>

                            {/* Discount Badge - With opacity */}
                            {hasDiscount && (
                                <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-red-600/90 backdrop-blur-sm text-white text-[9px] sm:text-xs font-bold rounded">
                                    <span className="opacity-100">-{discountPercentage}%</span>
                                </div>
                            )}
                        </div>

                        {/* REMOVED RATING BADGE - No longer displayed */}
                    </div>

                    {/* Content - Mobile Optimized */}
                    <div className="flex-1 p-2 sm:p-3 lg:p-4 flex flex-col">
                        {/* Title - Show full title without truncation */}
                        <Link href={`/products/${product.slug || product._id}`} className="flex-1">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors mb-2 sm:mb-3 leading-tight break-words hyphens-auto overflow-visible">
                                {product.title}
                            </h3>
                        </Link>

                        {/* Price - Mobile optimized */}
                        <div className="mb-2 sm:mb-3">
                            {mainPrice && (
                                <div className="space-y-0.5">
                                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                                        <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                                            {mainPrice.currency === 'BDT' ? '৳' : '$'}{mainPrice.amount.toLocaleString()}
                                        </span>
                                        {hasDiscount && (
                                            <span className="text-xs sm:text-sm text-gray-500 line-through">
                                                {mainPrice.currency === 'BDT' ? '৳' : '$'}
                                                {(mainPrice.amount * 1.15).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    {hasDiscount && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] sm:text-xs text-red-600 font-semibold">
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

                        {/* Action Buttons - Responsive with different layouts */}
                        <div className="mt-auto">
                            {/* Mobile: Stacked buttons (one below other) */}
                            <div className="flex flex-col gap-1.5 sm:hidden">
                                {/* Buy Now Button - Always active */}
                                <Link
                                    href={`/products/${product.slug || product._id}`}
                                    className="w-full px-2 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium text-[10px] rounded hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center justify-center gap-1"
                                >
                                    Buy Now
                                </Link>

                                {/* Add to Cart Button - Disabled for Affiliate */}
                                {product.productType === 'Affiliate' ? (
                                    <button
                                        disabled
                                        className="w-full px-2 py-1.5 bg-gray-300 text-gray-500 font-medium text-[10px] rounded cursor-not-allowed flex items-center justify-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        <span>Affiliate</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isAddToCartDisabled() || isAddingToCart}
                                        className={`w-full px-2 py-1.5 font-medium text-[10px] rounded transition-all duration-200 flex items-center justify-center gap-1 ${getAddToCartButtonStyle()}`}
                                    >
                                        {isAddingToCart ? (
                                            <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : showSuccess ? (
                                            <>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span>Added</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span>Add to Cart</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Tablet, Laptop, Desktop: Side by side buttons - Fixed responsive sizing */}
                            <div className="hidden sm:flex gap-1.5 md:gap-2">
                                {/* Buy Now Button - Always active */}
                                <Link
                                    href={`/products/${product.slug || product._id}`}
                                    className="flex-1 min-w-0 px-2 py-1.5 md:px-3 md:py-2 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium text-xs whitespace-nowrap rounded hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center justify-center"
                                >
                                    Buy Now
                                </Link>

                                {/* Add to Cart Button - Disabled for Affiliate */}
                                {product.productType === 'Affiliate' ? (
                                    <button
                                        disabled
                                        className="flex-1 min-w-0 px-2 py-1.5 md:px-3 md:py-2 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 bg-gray-300 text-gray-500 font-medium text-xs whitespace-nowrap rounded cursor-not-allowed flex items-center justify-center gap-1"
                                    >
                                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        <span className="truncate">Affiliate</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isAddToCartDisabled() || isAddingToCart}
                                        className={`flex-1 min-w-0 px-2 py-1.5 md:px-3 md:py-2 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 font-medium text-xs whitespace-nowrap rounded transition-all duration-200 flex items-center justify-center gap-1 ${getAddToCartButtonStyle()}`}
                                    >
                                        {isAddingToCart ? (
                                            <svg className="animate-spin h-3.5 w-3.5 md:h-4 md:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : showSuccess ? (
                                            <>
                                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span className="truncate">Added</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span className="truncate">Cart</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                        </div>


                    </div>
                </div>
            )}

            {/* Size Selection Modal */}
            {isSizeModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setIsSizeModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Select Size</h3>
                            <button onClick={() => setIsSizeModalOpen(false)}>
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {product.sizes?.filter(s => s.quantity > 0).map(s => (
                                <button
                                    key={s.name}
                                    onClick={() => { setModalSelectedSize(s.name); setModalShowSizeError(false); }}
                                    className={`p-3 border rounded-lg text-center ${modalSelectedSize === s.name ? 'border-gray-800 bg-gray-100' : 'border-gray-300 hover:border-gray-500'}`}
                                >
                                    {s.name}
                                    <span className="block text-xs text-gray-500">({s.quantity} available)</span>
                                </button>
                            ))}
                        </div>
                        {modalShowSizeError && <p className="text-red-600 mb-4">Please select a size</p>}
                        <button
                            onClick={handleModalAdd}
                            disabled={isAddingToCart}
                            className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50"
                        >
                            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            )}

            {/* Cart Slider Component */}
            <CartSlider
                isOpen={isCartOpen}
                setIsOpen={setIsCartOpen}
                conversionRates={conversionRates}
            />
        </>
    );
};

export default ProductCard;