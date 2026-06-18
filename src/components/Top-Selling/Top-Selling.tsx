'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import CartSlider from '../Share/Shop/CartSlider/CartSlider';

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface Variant {
    _id: string;
    name: string;
    weight: string;
    price: number;
    comparePrice: number;
    quantity: number;
    isDefault: boolean;
}

interface Product {
    _id: string;
    title: string;
    slug: string;
    mainImage: string;
    mainImageAlt?: string;
    displayPrice: number | null;
    priceRange: { min: number; max: number } | null;
    hasVariants: boolean;
    total_sales: number;
    brand?: string;
    availability?: string;
    productType?: string;
    quantity?: number;
    sizeRequirement?: string;
    sizes?: Array<{ name: string; quantity: number }>;
}

interface CartItem {
    _id: string;
    title: string;
    quantity: number;
    price: number;
    mainImage: string;
    mainImageAlt?: string;
    currency: string;
    size?: string;
    variantId?: string;
    variantName?: string;
    variantWeight?: string;
}

interface ConversionRates {
    USD: number;
    EUR: number;
    BDT: number;
    [key: string]: number;
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-100 flex flex-col animate-pulse flex-shrink-0">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200" />
            <div className="p-3 flex flex-col gap-2.5">
                <div className="h-3 w-16 bg-gray-200 rounded-full" />
                <div className="space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-1" />
                <div className="flex gap-2 mt-2">
                    <div className="flex-1 h-8 bg-gray-200 rounded-lg" />
                    <div className="flex-1 h-8 bg-gray-200 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function TopSellingCarousel() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(5);
    // ✅ Animation direction & sliding state
    const [isSliding, setIsSliding] = useState(false);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

    // ✅ Per-card states
    const [addingCardId, setAddingCardId] = useState<string | null>(null);
    const [successCardId, setSuccessCardId] = useState<string | null>(null);

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [conversionRates] = useState<ConversionRates>({ USD: 123, EUR: 135, BDT: 1 });
    const [quantity] = useState(1);

    // Variant modal state
    const [variants, setVariants] = useState<Variant[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [variantModalError, setVariantModalError] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [variantModalForBuyNow, setVariantModalForBuyNow] = useState(false);

    // Size modal state
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [modalSelectedSize, setModalSelectedSize] = useState<string | null>(null);
    const [modalShowSizeError, setModalShowSizeError] = useState(false);
    const [sizeModalForBuyNow, setSizeModalForBuyNow] = useState(false);

    const [isClient, setIsClient] = useState(false);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // ─── Init ───────────────────────────────────────────────────────────────────

    useEffect(() => {
        setIsClient(true);
        fetchTopSelling();
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            stopAutoPlay();
        };
    }, []);

    useEffect(() => {
        if (products.length > 0 && visibleCount > 0) startAutoPlay();
        return () => stopAutoPlay();
    }, [products, currentIndex, visibleCount]);

    // ─── Inject CSS for slide animation ────────────────────────────────────────

    useEffect(() => {
        if (!isClient) return;
        const style = document.createElement('style');
        style.id = 'top-selling-styles';
        style.textContent = `
            /* Toast */
            .custom-toast-top-selling {
                position: fixed; top: 24px; right: 24px;
                background: white; color: #1f2937;
                padding: 16px 20px; border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                border-left: 4px solid #374151;
                opacity: 0; transform: translateY(20px);
                transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
                z-index: 1001; max-width: 320px;
            }
            .custom-toast-top-selling.show { opacity: 1; transform: translateY(0); }
            .custom-toast-success { border-left-color: #10b981; }
            .custom-toast-error   { border-left-color: #ef4444; }
            .toast-content { display: flex; align-items: center; gap: 12px; }
            .toast-icon { width: 20px; height: 20px; color: #374151; flex-shrink: 0; }
            .custom-toast-success .toast-icon { color: #10b981; }
            .custom-toast-error .toast-icon   { color: #ef4444; }
            .toast-message { flex: 1; font-size: 14px; line-height: 1.4; color: #374151; }
            .toast-close { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s; }
            .toast-close:hover { color: #374151; background: rgba(0,0,0,0.05); }

            /* ✅ Slide animations */
            @keyframes slideInFromRight {
                from { opacity: 0; transform: translateX(40px); }
                to   { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideInFromLeft {
                from { opacity: 0; transform: translateX(-40px); }
                to   { opacity: 1; transform: translateX(0); }
            }
            .slide-in-right {
                animation: slideInFromRight 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
            }
            .slide-in-left {
                animation: slideInFromLeft 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
            }
            /* stagger children */
            .slide-in-right > *:nth-child(1), .slide-in-left > *:nth-child(1) { animation-delay: 0ms; }
            .slide-in-right > *:nth-child(2), .slide-in-left > *:nth-child(2) { animation-delay: 40ms; }
            .slide-in-right > *:nth-child(3), .slide-in-left > *:nth-child(3) { animation-delay: 80ms; }
            .slide-in-right > *:nth-child(4), .slide-in-left > *:nth-child(4) { animation-delay: 120ms; }
            .slide-in-right > *:nth-child(5), .slide-in-left > *:nth-child(5) { animation-delay: 160ms; }
        `;
        document.head.appendChild(style);
        return () => {
            const el = document.getElementById('top-selling-styles');
            if (el) document.head.removeChild(el);
        };
    }, [isClient]);

    // ─── Toast ──────────────────────────────────────────────────────────────────

    const showCustomToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        if (!isClient) return;
        const existing = document.querySelector('.custom-toast-top-selling');
        if (existing) document.body.removeChild(existing);

        const el = document.createElement('div');
        el.className = `custom-toast-top-selling custom-toast-${type}`;

        const icons = {
            success: `<svg xmlns="http://www.w3.org/2000/svg" class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
            error: `<svg xmlns="http://www.w3.org/2000/svg" class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`,
            info: `<svg xmlns="http://www.w3.org/2000/svg" class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`,
        };

        el.innerHTML = `
            <div class="toast-content">
                ${icons[type]}
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
        `;
        document.body.appendChild(el);
        setTimeout(() => el.classList.add('show'), 10);
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => { if (document.body.contains(el)) document.body.removeChild(el); }, 300);
        }, 4000);
    };

    // ─── Data ───────────────────────────────────────────────────────────────────

    const fetchTopSelling = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products/top-selling?limit=15');
            const data = await response.json();
            if (data.success) setProducts(data.products);
        } catch (error) {
            console.error('Error fetching top selling:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVariants = async (productId: string): Promise<Variant[]> => {
        try {
            const res = await fetch(`/api/products/variants?productId=${productId}`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setVariants(data);
                return data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching variants:', error);
            return [];
        }
    };

    // ─── Carousel with smooth animation ────────────────────────────────────────

    const handleResize = () => {
        const w = window.innerWidth;
        if (w < 640) setVisibleCount(2); // ✅ mobile: 2 cards
        else if (w < 768) setVisibleCount(2);
        else if (w < 1024) setVisibleCount(3);
        else if (w < 1280) setVisibleCount(4);
        else setVisibleCount(5);
    };

    const startAutoPlay = () => {
        stopAutoPlay();
        autoPlayRef.current = setInterval(() => triggerSlide('left'), 5000);
    };

    const stopAutoPlay = () => {
        if (autoPlayRef.current) { clearInterval(autoPlayRef.current); autoPlayRef.current = null; }
    };

    // ✅ Animated slide — set direction, trigger animation, then update index
    const triggerSlide = (direction: 'left' | 'right') => {
        if (isSliding) return;
        setSlideDirection(direction);
        setIsSliding(true);
        setTimeout(() => {
            if (direction === 'left') {
                setCurrentIndex(prev =>
                    prev + visibleCount < products.length ? prev + 1 : 0
                );
            } else {
                setCurrentIndex(prev =>
                    prev > 0 ? prev - 1 : Math.max(0, products.length - visibleCount)
                );
            }
            setIsSliding(false);
        }, 30); // short delay so class re-applies
    };

    const nextSlide = () => triggerSlide('left');
    const prevSlide = () => triggerSlide('right');

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        stopAutoPlay();
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        touchEndX.current = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
        startAutoPlay();
    };

    // ─── Price ──────────────────────────────────────────────────────────────────

    const formatPrice = (product: Product) => {
        if (product.priceRange && product.priceRange.min !== product.priceRange.max)
            return `৳${product.priceRange.min.toLocaleString()} – ৳${product.priceRange.max.toLocaleString()}`;
        if (product.priceRange)
            return `৳${product.priceRange.min.toLocaleString()}`;
        if (product.displayPrice)
            return `৳${product.displayPrice.toLocaleString()}`;
        return 'Price on request';
    };

    // ─── Core addToCart ─────────────────────────────────────────────────────────

    const addToCart = async (
        product: Product,
        size: string | null = null,
        variant?: Variant | null
    ): Promise<boolean> => {
        setAddingCardId(product._id);

        try {
            const response = await axios.post('/api/products/cart/validate', {
                productId: product._id,
                quantity,
                size: size || null,
                variantId: variant?._id || null,
            });
            const validation = response.data;

            if (!validation.valid) {
                showCustomToast(validation.message, 'error');
                return false;
            }

            const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItem = cart.find(
                item =>
                    item._id === product._id &&
                    (item.size || null) === (size || null) &&
                    (item.variantId || null) === (variant?._id || null)
            );

            let newQuantity = quantity;

            if (existingItem) {
                newQuantity = existingItem.quantity + quantity;
                if (newQuantity > 3) {
                    showCustomToast('Cannot add more than 3 units of this product', 'error');
                    return false;
                }
                if (size && product.sizes) {
                    const sizeData = product.sizes.find(s => s.name === size);
                    if (sizeData && newQuantity > sizeData.quantity) {
                        showCustomToast(`Only ${sizeData.quantity} units available for size ${size}`, 'error');
                        return false;
                    }
                }
                cart.splice(cart.indexOf(existingItem), 1);
                cart.push({ ...existingItem, quantity: newQuantity, size: size || undefined });
                showCustomToast(`Cart updated with ${newQuantity} units of ${product.title}`, 'success');
            } else {
                const priceInBDT = variant ? variant.price : product.displayPrice || 0;
                cart.push({
                    _id: product._id,
                    title: product.title,
                    quantity,
                    price: priceInBDT,
                    mainImage: product.mainImage,
                    mainImageAlt: product.mainImageAlt,
                    currency: 'BDT',
                    size: size || undefined,
                    variantId: variant?._id,
                    variantName: variant?.name,
                    variantWeight: variant?.weight,
                });
                showCustomToast(`Added ${quantity} units of ${product.title} to cart`, 'success');
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));

            setSuccessCardId(product._id);
            setIsCartOpen(true);
            setTimeout(() => setSuccessCardId(null), 2000);

            return true;
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            showCustomToast(error.response?.data?.message || 'Error checking product availability', 'error');
            return false;
        } finally {
            setAddingCardId(null);
        }
    };

    // ─── Availability ──────────────────────────────────────────────────────────

    const getActualAvailability = (product: Product): string => {
        if (product.productType === 'Affiliate') return 'Affiliate';
        if (product.availability !== 'InStock') return product.availability || 'OutOfStock';
        const hasStock =
            product.sizeRequirement === 'Mandatory' && product.sizes
                ? product.sizes.some(s => s.quantity > 0)
                : (product.quantity ?? 0) > 0;
        return hasStock ? 'InStock' : 'OutOfStock';
    };

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleAddToCart = async (product: Product) => {
        const av = getActualAvailability(product);
        if (av !== 'InStock') { showCustomToast('This product cannot be added to cart', 'error'); return; }

        if (product.hasVariants) {
            setCurrentProduct(product);
            const variantsData = await fetchVariants(product._id);
            if (variantsData.length > 0) {
                setSelectedVariant(null); setVariantModalError(false);
                setVariantModalForBuyNow(false); setIsVariantModalOpen(true);
            }
            return;
        }

        if (product.sizeRequirement === 'Mandatory' && product.sizes) {
            const availableSizes = product.sizes.filter(s => s.quantity > 0);
            if (availableSizes.length === 0) { showCustomToast('No sizes available', 'error'); return; }
            setCurrentProduct(product); setModalSelectedSize(null);
            setModalShowSizeError(false); setSizeModalForBuyNow(false); setIsSizeModalOpen(true);
            return;
        }

        if ((product.quantity ?? 0) <= 0) { showCustomToast('This product is out of stock', 'error'); return; }
        await addToCart(product);
    };

    const handleBuyNow = async (product: Product) => {
        const av = getActualAvailability(product);
        if (av !== 'InStock') { showCustomToast('This product cannot be purchased', 'error'); return; }

        if (product.hasVariants) {
            setCurrentProduct(product);
            const variantsData = await fetchVariants(product._id);
            if (variantsData.length > 0) {
                setSelectedVariant(null); setVariantModalError(false);
                setVariantModalForBuyNow(true); setIsVariantModalOpen(true);
            }
            return;
        }

        if (product.sizeRequirement === 'Mandatory' && product.sizes) {
            const availableSizes = product.sizes.filter(s => s.quantity > 0);
            if (availableSizes.length === 0) { showCustomToast('No sizes available', 'error'); return; }
            setCurrentProduct(product); setModalSelectedSize(null);
            setModalShowSizeError(false); setSizeModalForBuyNow(true); setIsSizeModalOpen(true);
            return;
        }

        const success = await addToCart(product);
        if (success) window.location.href = '/checkout';
    };

    const handleVariantModalAdd = async () => {
        if (!selectedVariant || !currentProduct) {
            setVariantModalError(true);
            showCustomToast('Please select a variant', 'error');
            return;
        }
        const success = await addToCart(currentProduct, null, selectedVariant);
        if (success) {
            setIsVariantModalOpen(false); setSelectedVariant(null);
            const wasBuyNow = variantModalForBuyNow;
            setVariantModalForBuyNow(false); setCurrentProduct(null);
            if (wasBuyNow) window.location.href = '/checkout';
        }
    };

    const handleSizeModalAdd = async () => {
        if (!modalSelectedSize || !currentProduct) {
            setModalShowSizeError(true);
            showCustomToast('Please select a size before adding to cart', 'error');
            return;
        }
        const success = await addToCart(currentProduct, modalSelectedSize);
        if (success) {
            setIsSizeModalOpen(false); setModalSelectedSize(null);
            const wasBuyNow = sizeModalForBuyNow;
            setSizeModalForBuyNow(false); setCurrentProduct(null);
            if (wasBuyNow) window.location.href = '/checkout';
        }
    };

    // ─── Button styles (per-card) ──────────────────────────────────────────────

    const getCartButtonStyle = (product: Product) => {
        const av = getActualAvailability(product);
        if (av !== 'InStock') return 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
        if (successCardId === product._id) return 'bg-green-500 text-white border border-green-500';
        if (addingCardId === product._id) return 'bg-gray-600 text-white border border-gray-600 cursor-wait';
        return 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50';
    };

    const isCartDisabled = (product: Product) =>
        getActualAvailability(product) !== 'InStock' || addingCardId === product._id;

    // ─── Render ────────────────────────────────────────────────────────────────

    // ✅ Skeleton — matches real layout exactly
    if (loading) {
        return (
            <div className="w-full py-12 md:py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    {/* Header skeleton — left aligned */}
                    <div className="mb-10 space-y-2">
                        <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="w-12 h-0.5 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                    {/* ✅ 2 cols on mobile, matching real grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
                        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    const visibleProducts = products.slice(currentIndex, currentIndex + visibleCount);
    // ✅ Animation class based on direction
    const animClass = slideDirection === 'left' ? 'slide-in-right' : 'slide-in-left';

    return (
        <>
            <div className="w-full py-12 md:py-16 bg-gray-50">
                <div className="container mx-auto px-4">

                    {/* ✅ Section Header — left aligned with thick left border */}
                    <div className="mb-8 md:mb-10">
                        <div className="flex items-center gap-3">
                            {/* Thick left accent border */}
                            <div className="w-2 h-7 md:h-9 bg-gray-500 rounded-full flex-shrink-0" />
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                                Top Selling Products
                            </h2>
                        </div>
                        {/* ✅ Underline only under the title, half-width style */}
                        <div className="ml-4 mt-2 w-24 h-0.5 bg-gray-700 rounded-full opacity-60" />
                    </div>

                    {/* Carousel */}
                    <div
                        className="relative group"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Prev Button */}
                        {currentIndex > 0 && (
                            <button
                                onClick={() => { prevSlide(); startAutoPlay(); }}
                                className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 md:p-3 shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-gray-200"
                            >
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}

                        {/* ✅ Cards Grid — overflow hidden to clip slide animation */}
                        <div className="overflow-hidden">
                            <div
                                key={currentIndex} // ✅ force re-mount so animation re-triggers
                                className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 ${animClass}`}
                            >
                                {visibleProducts.map((product) => {
                                    const av = getActualAvailability(product);
                                    const isAdding = addingCardId === product._id;
                                    const isSuccess = successCardId === product._id;

                                    return (
                                        <div
                                            key={product._id}
                                            className="group/card bg-gray-100 rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col"
                                        >
                                            {/* ✅ Next.js Image */}
                                            <Link href={`/products/${product.slug}`}>
                                                <div className="relative overflow-hidden bg-gray-50 aspect-square">
                                                    <Image
                                                        src={product.mainImage}
                                                        alt={product.mainImageAlt || product.title}
                                                        fill
                                                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                                                        className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                                                        loading="lazy"
                                                    />
                                                    {/* Availability badge */}
                                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                        <span className="bg-red-500 text-white text-[7px] font-semibold px-2 py-0.5 rounded-full shadow-sm tracking-wide uppercase">
                                                            Top Selling
                                                        </span>
                                                        {av !== 'InStock' && (
                                                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${av === 'Affiliate' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-white'}`}>
                                                                {av === 'OutOfStock' ? 'Out of Stock' : av}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {av === 'InStock' && (
                                                        <div className="absolute top-2 right-2">
                                                            <span className="bg-green-500 text-white text-[9px] font-medium px-2 py-0.5 rounded-full">
                                                                In Stock
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>

                                            {/* Content */}
                                            <div className="flex-1 p-2.5 md:p-3 flex flex-col">
                                                <Link href={`/products/${product.slug}`} className="flex-1 mb-2">
                                                    <h3 className="text-gray-800 font-semibold text-[12px] md:text-[13px] leading-snug line-clamp-2 min-h-[34px] hover:text-gray-950 transition-colors">
                                                        {product.title}
                                                    </h3>
                                                </Link>

                                                {/* ✅ Price only — no "Multiple variants" label */}
                                                <div className="mb-2.5">
                                                    <span className="text-gray-900 font-bold text-sm md:text-[15px]">
                                                        {formatPrice(product)}
                                                    </span>
                                                </div>

                                                {/* Buttons */}
                                                <div className="mt-auto">
                                                    {/* Mobile (< sm): stacked */}
                                                    <div className="flex flex-col gap-1.5 sm:hidden">
                                                        <Link
                                                            href={`/products/${product.slug}`}
                                                            className="w-full py-1.5 bg-gray-800 text-white font-medium text-[11px] rounded-lg hover:bg-gray-700 transition-all text-center"
                                                        >
                                                            Buy Now
                                                        </Link>
                                                        <button
                                                            onClick={() => handleAddToCart(product)}
                                                            disabled={isCartDisabled(product)}
                                                            className={`w-full py-1.5 font-medium text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 ${getCartButtonStyle(product)}`}
                                                        >
                                                            {isAdding ? (
                                                                <><svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg><span>Adding…</span></>
                                                            ) : isSuccess ? (
                                                                <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span>Added!</span></>
                                                            ) : (
                                                                <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg><span>Add to Cart</span></>
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Desktop (sm+): side by side */}
                                                    <div className="hidden sm:flex gap-2">
                                                        <Link
                                                            href={`/products/${product.slug}`}
                                                            className="flex-1 py-2 bg-gray-800 text-white font-semibold text-xs rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center whitespace-nowrap"
                                                        >
                                                            Buy Now
                                                        </Link>
                                                        <button
                                                            onClick={() => handleAddToCart(product)}
                                                            disabled={isCartDisabled(product)}
                                                            className={`flex-1 py-2 font-medium text-xs rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${getCartButtonStyle(product)}`}
                                                        >
                                                            {isAdding ? (
                                                                <><svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg><span>Adding…</span></>
                                                            ) : isSuccess ? (
                                                                <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span>Added!</span></>
                                                            ) : (
                                                                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg><span>Cart</span></>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Next Button */}
                        {currentIndex + visibleCount < products.length && (
                            <button
                                onClick={() => { nextSlide(); startAutoPlay(); }}
                                className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 md:p-3 shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-gray-200"
                            >
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </div>
                    {/* No dots */}
                </div>
            </div>

            {/* ── Variant Modal ── */}
            {isVariantModalOpen && currentProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setIsVariantModalOpen(false)}>
                    <div className="bg-white rounded-xl p-4 sm:p-5 w-full max-w-md sm:max-w-2xl lg:max-w-3xl mx-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900">Select Package / Weight</h3>
                                {selectedVariant && (
                                    <p className="text-[10px] sm:text-xs text-green-600 mt-0.5">Selected: {selectedVariant.name} • {selectedVariant.weight}</p>
                                )}
                            </div>
                            <button onClick={() => setIsVariantModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto mb-4">
                            <div className="block md:hidden space-y-2">
                                {variants.filter(v => v.quantity > 0).map(v => (
                                    <button key={v._id} onClick={() => { setSelectedVariant(v); setVariantModalError(false); }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${selectedVariant?._id === v._id ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}>
                                        <div className="flex flex-col items-start gap-0.5">
                                            <span className={`text-sm font-medium ${selectedVariant?._id === v._id ? 'text-white' : 'text-gray-800'}`}>{v.name}</span>
                                            <span className={`text-[10px] ${selectedVariant?._id === v._id ? 'text-green-100' : 'text-gray-500'}`}>{v.weight}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-sm font-bold ${selectedVariant?._id === v._id ? 'text-white' : 'text-gray-900'}`}>৳{v.price.toLocaleString()}</span>
                                            <div className="text-[9px] text-gray-400 mt-0.5">{v.quantity} available</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="hidden md:flex flex-wrap items-center gap-2">
                                {variants.filter(v => v.quantity > 0).map(v => (
                                    <button key={v._id} onClick={() => { setSelectedVariant(v); setVariantModalError(false); }}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all whitespace-nowrap ${selectedVariant?._id === v._id ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}>
                                        <span className={`text-xs font-medium ${selectedVariant?._id === v._id ? 'text-white' : 'text-gray-800'}`}>{v.name}</span>
                                        <span className={`text-[10px] ${selectedVariant?._id === v._id ? 'text-green-200' : 'text-gray-500'}`}>{v.weight}</span>
                                        <span className={`text-[10px] ${selectedVariant?._id === v._id ? 'text-green-300' : 'text-gray-400'}`}>•</span>
                                        <span className={`text-xs font-bold ${selectedVariant?._id === v._id ? 'text-white' : 'text-gray-900'}`}>৳{v.price.toLocaleString()}</span>
                                        {v.quantity <= 5 && (
                                            <span className={`text-[9px] ml-0.5 ${selectedVariant?._id === v._id ? 'text-green-200' : 'text-orange-500'}`}>({v.quantity})</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {variantModalError && (
                            <p className="text-red-600 text-xs sm:text-sm mb-3 text-center bg-red-50 py-2 rounded-lg">Please select a package/weight</p>
                        )}
                        <button onClick={handleVariantModalAdd} disabled={addingCardId !== null || !selectedVariant}
                            className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${addingCardId !== null || !selectedVariant ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-900'}`}>
                            {addingCardId !== null ? (
                                <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg><span>Adding…</span></>
                            ) : (
                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    <span>{variantModalForBuyNow ? 'Buy Now' : 'Add to Cart'}</span>
                                    {selectedVariant && <span className="text-[10px] opacity-80 ml-0.5">(৳{selectedVariant.price.toLocaleString()})</span>}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Size Modal ── */}
            {isSizeModalOpen && currentProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setIsSizeModalOpen(false)}>
                    <div className="bg-white rounded-xl p-4 sm:p-5 w-full max-w-md sm:max-w-lg mx-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900">Select Size</h3>
                                {modalSelectedSize && <p className="text-[10px] sm:text-xs text-green-600 mt-0.5">Selected: {modalSelectedSize}</p>}
                            </div>
                            <button onClick={() => setIsSizeModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto mb-4">
                            <div className="block sm:hidden space-y-2">
                                {currentProduct.sizes?.filter(s => s.quantity > 0).map(s => (
                                    <button key={s.name} onClick={() => { setModalSelectedSize(s.name); setModalShowSizeError(false); }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${modalSelectedSize === s.name ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}>
                                        <span className={`text-sm font-medium ${modalSelectedSize === s.name ? 'text-white' : 'text-gray-800'}`}>{s.name}</span>
                                        <span className={`text-xs ${modalSelectedSize === s.name ? 'text-green-100' : 'text-gray-500'}`}>{s.quantity} available</span>
                                    </button>
                                ))}
                            </div>
                            <div className="hidden sm:flex flex-wrap gap-2">
                                {currentProduct.sizes?.filter(s => s.quantity > 0).map(s => (
                                    <button key={s.name} onClick={() => { setModalSelectedSize(s.name); setModalShowSizeError(false); }}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-all whitespace-nowrap ${modalSelectedSize === s.name ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}>
                                        <span className={`text-xs font-medium ${modalSelectedSize === s.name ? 'text-white' : 'text-gray-800'}`}>{s.name}</span>
                                        <span className={`text-[10px] ${modalSelectedSize === s.name ? 'text-green-300' : 'text-gray-400'}`}>•</span>
                                        <span className={`text-[10px] ${modalSelectedSize === s.name ? 'text-green-200' : 'text-gray-500'}`}>{s.quantity} left</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {modalShowSizeError && (
                            <p className="text-red-600 text-xs sm:text-sm mb-3 text-center bg-red-50 py-2 rounded-lg">Please select a size</p>
                        )}
                        <button onClick={handleSizeModalAdd} disabled={addingCardId !== null || !modalSelectedSize}
                            className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${addingCardId !== null || !modalSelectedSize ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-900'}`}>
                            {addingCardId !== null ? (
                                <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg><span>Adding…</span></>
                            ) : (
                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    <span>{sizeModalForBuyNow ? 'Buy Now' : 'Add to Cart'}</span>
                                    {modalSelectedSize && <span className="text-[10px] opacity-80 ml-0.5">({modalSelectedSize})</span>}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Cart Slider */}
            <CartSlider isOpen={isCartOpen} setIsOpen={setIsCartOpen} conversionRates={conversionRates} />
        </>
    );
}