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
    const router = useRouter();

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

    // Custom Toast Function
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
                                const sizeData = product.sizes.find((s: any) => s.name === item.size);
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

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-screen w-full sm:w-80 md:w-96 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="flex justify-between items-center p-4 border-b border-gray-700">
                            <h2 className="text-lg font-semibold text-white">Your Cart ({cart.length} items)</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-300 hover:text-white transition-colors"
                                disabled={isLoading}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4  space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
                            {cart.length === 0 ? (
                                <p className="text-gray-400 text-center text-sm font-medium">Your cart is empty</p>
                            ) : (
                                cart.map((item, index) => (
                                    <motion.div
                                        key={`${item._id}-${getItemSizeKey(item)}-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex items-start gap-3 border-b border-gray-700 pb-4"
                                    >
                                        <div className="relative w-16 h-16 flex-shrink-0">
                                            <Image
                                                src={item.mainImage}
                                                alt={item.title}
                                                width={64}
                                                height={64}
                                                className="object-cover rounded-md shadow-sm"
                                                sizes="64px"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h3 className="text-sm font-medium text-white line-clamp-2">{item.title}</h3>
                                            {item.size && <p className="text-xs text-gray-300">Size: {item.size}</p>}
                                            <p className="text-xs text-purple-300 font-semibold">৳{(item.price * item.quantity).toLocaleString()}</p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleQuantityChange(item._id, item.quantity - 1, item.size)}
                                                    disabled={item.quantity <= 1 || isLoading}
                                                    className="px-2 py-1 bg-gray-700 text-white rounded-full text-xs hover:bg-purple-600 transition disabled:opacity-50"
                                                >
                                                    −
                                                </button>
                                                <span className="text-sm text-white font-medium">{item.quantity}/3</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item._id, item.quantity + 1, item.size)}
                                                    disabled={isLoading || item.quantity >= 3}
                                                    className="px-2 py-1 bg-gray-700 text-white rounded-full text-xs hover:bg-purple-600 transition disabled:opacity-50"
                                                >
                                                    {isLoading ? '...' : '+'}
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(item._id, item.size)}
                                            className="text-red-400 hover:text-red-600 transition"
                                            disabled={isLoading}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>
                        <div className=" p-4 border-t border-gray-700 bg-gray-900/80 backdrop-blur-sm fixed bottom-0 w-full sm:w-80 md:w-96">
                            <div className="flex justify-between text-sm font-semibold text-white mb-3">
                                <span>Subtotal</span>
                                <span>৳{getSubtotal().toLocaleString()}</span>
                            </div>
                            <button
                                onClick={handleViewCart}
                                disabled={cart.length === 0 || isLoading}
                                className="block w-full py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center rounded-lg font-medium text-sm hover:from-purple-700 hover:to-purple-800 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Validating...' : 'View Cart'}
                            </button>

                            <Link
                                href="/shop"
                                className="block w-full py-2 mt-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white text-center rounded-lg font-medium text-sm hover:from-gray-600 hover:to-gray-500 transition shadow-md"
                                onClick={() => setIsOpen(false)}
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </motion.div>

                    <style jsx>{`
                    .custom-toast-slider {
                        position: fixed;
                        bottom: 24px;
                        right: 24px;
                        background: linear-gradient(135deg, #1a1a1a 0%, #2d1b4e 100%);
                        color: #fff;
                        padding: 16px 20px;
                        border-radius: 12px;
                        box-shadow: 0 10px 25px rgba(128, 0, 128, 0.3);
                        border-left: 4px solid #8b5cf6;
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        z-index: 1001;
                        max-width: 320px;
                        backdrop-filter: blur(10px);
                    }
                    
                    .custom-toast-slider.show {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    
                    .custom-toast-success {
                        border-left-color: #10b981;
                        background: linear-gradient(135deg, #1a1a1a 0%, #064e3b 100%);
                    }
                    
                    .custom-toast-error {
                        border-left-color: #ef4444;
                        background: linear-gradient(135deg, #1a1a1a 0%, #7f1d1d 100%);
                    }
                    
                    .toast-content {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    
                    .toast-icon {
                        width: 20px;
                        height: 20px;
                        color: #8b5cf6;
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
                        color: #fff;
                        background: rgba(255,255,255,0.1);
                    }
                `}</style>
                </>
            )}
        </AnimatePresence>
    );
}