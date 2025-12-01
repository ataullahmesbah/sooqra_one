'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Interface definitions
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

interface ConversionRates {
    USD: number;
    EUR: number;
    BDT: number;
    [key: string]: number;
}

interface CartSliderProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    conversionRates: ConversionRates;
}

interface ValidationResponse {
    valid: boolean;
    message: string;
}

export default function CartSlider({ isOpen, setIsOpen, conversionRates }: CartSliderProps) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const updateCart = () => {
            const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const uniqueCart = removeDuplicateCartItems(storedCart);
            setCart(uniqueCart);
        };
        updateCart();
        window.addEventListener('cartUpdated', updateCart);
        return () => window.removeEventListener('cartUpdated', updateCart);
    }, []);

    // Remove duplicate cart items
    const removeDuplicateCartItems = (cartItems: CartItem[]): CartItem[] => {
        const uniqueItemsMap = new Map();

        cartItems.forEach(item => {
            const key = `${item._id}-${item.size || 'no-size'}`;

            if (uniqueItemsMap.has(key)) {
                const existingItem = uniqueItemsMap.get(key);
                const mergedQuantity = existingItem.quantity + item.quantity;
                const finalQuantity = Math.min(mergedQuantity, 3); // Max 3 products

                uniqueItemsMap.set(key, {
                    ...existingItem,
                    quantity: finalQuantity
                });
            } else {
                uniqueItemsMap.set(key, {
                    ...item,
                    quantity: Math.min(item.quantity, 3) // Ensure max 3
                });
            }
        });

        return Array.from(uniqueItemsMap.values());
    };

    const getSizeKey = (size?: string) => size || 'no-size';
    const getItemSizeKey = (item: CartItem) => item.size || 'no-size';

    const validateQuantityWithBackend = async (productId: string, newQuantity: number, size?: string): Promise<ValidationResponse> => {
        try {
            // Check maximum limit first
            if (newQuantity > 3) {
                return {
                    valid: false,
                    message: 'Maximum 3 products allowed per item'
                };
            }

            const response = await axios.post('/api/products/cart/validate', {
                productId,
                quantity: newQuantity,
                size,
            });
            return response.data;
        } catch (error: any) {
            console.error('Error validating quantity:', error);
            return {
                valid: false,
                message: error.response?.data?.message || 'Error checking product availability'
            };
        }
    };

    const handleQuantityChange = async (productId: string, newQuantity: number, size?: string) => {
        if (newQuantity < 1) return;

        setIsLoading(true);
        try {
            const validation = await validateQuantityWithBackend(productId, newQuantity, size);
            if (!validation.valid) {
                showCustomToast(validation.message, 'error');
                setIsLoading(false);
                return;
            }

            const updatedCart = cart.map((item) =>
                item._id === productId && getItemSizeKey(item) === getSizeKey(size)
                    ? { ...item, quantity: newQuantity }
                    : item
            );

            const uniqueCart = removeDuplicateCartItems(updatedCart);
            localStorage.setItem('cart', JSON.stringify(uniqueCart));
            setCart(uniqueCart);
            window.dispatchEvent(new Event('cartUpdated'));

            // Show success toast for quantity change
            if (newQuantity > 1) {
                showCustomToast(`Quantity updated to ${newQuantity}`, 'success');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            showCustomToast('Failed to update quantity', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveItem = (productId: string, size?: string) => {
        const updatedCart = cart.filter((item) =>
            !(item._id === productId && getItemSizeKey(item) === getSizeKey(size))
        );

        const uniqueCart = removeDuplicateCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(uniqueCart));
        setCart(uniqueCart);
        window.dispatchEvent(new Event('cartUpdated'));

        const product = cart.find(item => item._id === productId && getItemSizeKey(item) === getSizeKey(size));
        if (product) {
            showCustomToast(`${product.title} removed from cart`, 'success');
        }
    };

    // Custom Toast Function - Use global styles from ProductDetailsClient
    const showCustomToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        // Remove existing toast
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

    const getSubtotal = () => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const handleViewCart = async () => {
        setIsLoading(true);
        try {
            // Check for quantity limits before validation
            const exceededLimitItems = cart.filter(item => item.quantity > 3);
            if (exceededLimitItems.length > 0) {
                exceededLimitItems.forEach(item => {
                    showCustomToast(`Maximum 3 products allowed for ${item.title}`, 'error');
                });

                // Auto-correct quantities
                const correctedCart = cart.map(item => ({
                    ...item,
                    quantity: Math.min(item.quantity, 3)
                }));

                localStorage.setItem('cart', JSON.stringify(correctedCart));
                setCart(correctedCart);
                window.dispatchEvent(new Event('cartUpdated'));
                setIsLoading(false);
                return;
            }

            const cleanedCart = removeDuplicateCartItems(cart);
            if (cleanedCart.length !== cart.length) {
                localStorage.setItem('cart', JSON.stringify(cleanedCart));
                setCart(cleanedCart);
            }

            const validationPromises = cleanedCart.map(async (item) => {
                const validation = await validateQuantityWithBackend(item._id, item.quantity, item.size);
                return { ...validation, productId: item._id, size: item.size, title: item.title };
            });

            const results = await Promise.all(validationPromises);
            const invalidItems = results.filter((result) => !result.valid);

            if (invalidItems.length > 0) {
                invalidItems.forEach((item) => {
                    showCustomToast(`${item.title}: ${item.message}`, 'error');
                });

                const updatedCart = await Promise.all(
                    cleanedCart.map(async (item) => {
                        try {
                            const response = await axios.get(`/api/products/${item._id}`);
                            const product = response.data;
                            if (item.size) {
                                const sizeData = product.sizes?.find((s: any) => s.name === item.size);
                                if (!sizeData || item.quantity > sizeData.quantity) {
                                    return { ...item, quantity: Math.min(item.quantity, sizeData?.quantity || 0) };
                                }
                            } else if (item.quantity > product.quantity) {
                                return { ...item, quantity: Math.min(item.quantity, product.quantity) };
                            }
                            return item;
                        } catch (error) {
                            console.error(`Error updating product ${item._id}:`, error);
                            return item;
                        }
                    })
                );

                const finalCart = removeDuplicateCartItems(updatedCart);
                localStorage.setItem('cart', JSON.stringify(finalCart));
                setCart(finalCart);
                window.dispatchEvent(new Event('cartUpdated'));
                setIsLoading(false);
                return;
            }

            setIsOpen(false);
            router.push('/cart');
        } catch (error) {
            console.error('Error validating cart:', error);
            showCustomToast('Failed to validate cart items', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackdropClick = () => {
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleBackdropClick}
                        className="fixed inset-0 bg-black/70 z-40 md:bg-black/50"
                    />

                    {/* Cart Slider */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className={`fixed top-0 right-0 h-screen bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl z-50 overflow-hidden flex flex-col
                            ${isMobile ? 'w-full' : 'w-full sm:w-80 md:w-96'}`}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900/90 backdrop-blur-sm">
                            <h2 className="text-lg font-semibold text-white">
                                Your Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-300 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
                                disabled={isLoading}
                                aria-label="Close cart"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                    <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <p className="text-gray-400 text-sm font-medium mb-2">Your cart is empty</p>
                                    <p className="text-gray-500 text-xs">Add some products to get started</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <motion.div
                                        key={`${item._id}-${getItemSizeKey(item)}-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex items-start gap-3 pb-4 border-b border-gray-700 last:border-b-0"
                                    >
                                        {/* Product Image */}
                                        <div className="relative w-16 h-16 flex-shrink-0">
                                            <Image
                                                src={item.mainImage}
                                                alt={item.mainImageAlt || item.title}
                                                width={64}
                                                height={64}
                                                className="object-cover rounded-md shadow-sm"
                                                sizes="64px"
                                            />
                                            {item.quantity > 1 && (
                                                <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                                    {item.quantity}
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">{item.title}</h3>
                                            {item.size && (
                                                <p className="text-xs text-gray-300 mb-1">
                                                    Size: <span className="text-purple-300">{item.size}</span>
                                                </p>
                                            )}
                                            <p className="text-sm text-purple-300 font-semibold mb-2">
                                                ৳{(item.price * item.quantity).toLocaleString()}
                                            </p>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleQuantityChange(item._id, item.quantity - 1, item.size)}
                                                    disabled={item.quantity <= 1 || isLoading}
                                                    className="px-2 py-1 bg-gray-700 text-white rounded-full text-xs hover:bg-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    aria-label="Decrease quantity"
                                                >
                                                    −
                                                </button>
                                                <div className="relative">
                                                    <span className="text-sm text-white font-medium px-2">{item.quantity}</span>
                                                    <div className="absolute -bottom-1 left-0 right-0 text-center">
                                                        <span className="text-[10px] text-gray-400">/3</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleQuantityChange(item._id, item.quantity + 1, item.size)}
                                                    disabled={isLoading || item.quantity >= 3}
                                                    className="px-2 py-1 bg-gray-700 text-white rounded-full text-xs hover:bg-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    aria-label="Increase quantity"
                                                >
                                                    {isLoading ? (
                                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                    ) : (
                                                        '+'
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemoveItem(item._id, item.size)}
                                            className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-gray-800"
                                            disabled={isLoading}
                                            aria-label="Remove item"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer with Totals */}
                        {cart.length > 0 && (
                            <div className="border-t border-gray-700 bg-gray-900/80 backdrop-blur-sm">
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm text-gray-300">Subtotal</span>
                                        <span className="text-lg font-bold text-white">
                                            ৳{getSubtotal().toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <button
                                            onClick={handleViewCart}
                                            disabled={cart.length === 0 || isLoading}
                                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center rounded-lg font-medium text-sm hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                    Validating...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                    View Cart
                                                </>
                                            )}
                                        </button>

                                        <Link
                                            href="/shop"
                                            onClick={() => setIsOpen(false)}
                                            className="block w-full py-3 bg-gradient-to-r from-gray-800 to-gray-700 text-white text-center rounded-lg font-medium text-sm hover:from-gray-700 hover:to-gray-600 transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Continue Shopping
                                        </Link>
                                    </div>

                                    {isMobile && (
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="w-full py-3 mt-2 text-gray-400 hover:text-white text-center text-sm transition-colors"
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}