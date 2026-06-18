// src/components/products/ProductCard/ProductCard.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/src/types/index';
import axios from 'axios';
import CartSlider from '../../Share/Shop/CartSlider/CartSlider';
import { useFacebookEvents } from '@/src/hooks/useFacebookEvents';

interface ProductCardProps {
    product: Product;
    viewMode?: 'grid' | 'list';
    // ✅ basePath: '/products' for AllProductsList (homepage), '/shop' for shop pages
    basePath?: '/products' | '/shop';
}

interface CartItem {
    _id: string; title: string; quantity: number; price: number;
    mainImage: string; mainImageAlt?: string; currency: string;
    size?: string; variantId?: string; variantName?: string; variantWeight?: string;
}

interface Variant {
    _id: string; name: string; weight: string; price: number;
    comparePrice: number; quantity: number; isDefault: boolean;
}

interface ConversionRates { USD: number; EUR: number; BDT: number; [k: string]: number; }

function ImageSkeleton() {
    return (
        <div className="absolute inset-0 bg-gray-100">
            <div className="absolute inset-0" style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
                backgroundSize: '200% 100%', animation: 'pc-shimmer 1.4s ease-in-out infinite',
            }}/>
        </div>
    );
}

const CartIcon = ({ md }: { md?: boolean }) => (
    <svg className={md ? 'w-4 h-4' : 'w-3 h-3'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>
);
const CheckIcon = ({ md }: { md?: boolean }) => (
    <svg className={md ? 'w-4 h-4' : 'w-3 h-3'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
    </svg>
);
const SpinIcon = ({ md }: { md?: boolean }) => (
    <svg className={`${md ? 'h-4 w-4' : 'h-3 w-3'} animate-spin`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid', basePath = '/products' }) => {
    const mainPrice = product.prices?.find(p => p.currency === 'BDT') || product.prices?.[0];
    const hasDiscount = product.prices?.some(p => p.exchangeRate && p.exchangeRate < 1);
    const discountPercentage = hasDiscount ? 15 : 0;
    const productUrl = `${basePath}/${product.slug || product._id}`;

    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [conversionRates] = useState<ConversionRates>({ USD: 123, EUR: 135, BDT: 1 });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [modalSelectedSize, setModalSelectedSize] = useState<string | null>(null);
    const [modalShowSizeError, setModalShowSizeError] = useState(false);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [variantModalError, setVariantModalError] = useState(false);

    const { trackViewContent, trackAddToCart } = useFacebookEvents();
    const hasTrackedView = useRef(false);

    // ✅ ViewContent — once per product._id, ref prevents re-fires
    useEffect(() => {
        if (product && mainPrice && !hasTrackedView.current) {
            hasTrackedView.current = true;
            trackViewContent(product, mainPrice.amount);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product._id]);

    // ✅ CSS inject — empty deps, no isClient state, no cascade
    useEffect(() => {
        if (document.getElementById('pc-global-css')) return;
        const s = document.createElement('style');
        s.id = 'pc-global-css';
        s.textContent = `
            @keyframes pc-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            .pc-toast { position:fixed; top:24px; right:24px; background:#fff; color:#1f2937; padding:14px 18px; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.1); border-left:4px solid #374151; opacity:0; transform:translateY(16px); transition:all 0.3s cubic-bezier(0.4,0,0.2,1); z-index:2000; max-width:320px; }
            .pc-toast.show { opacity:1; transform:translateY(0); }
            .pc-toast.s { border-left-color:#10b981; }
            .pc-toast.e { border-left-color:#ef4444; }
            .pc-toast-row { display:flex; align-items:center; gap:10px; }
            .pc-toast-icon { width:18px; height:18px; flex-shrink:0; }
            .pc-toast.s .pc-toast-icon { color:#10b981; }
            .pc-toast.e .pc-toast-icon { color:#ef4444; }
            .pc-toast-msg { flex:1; font-size:13px; line-height:1.4; }
            .pc-toast-x { background:none; border:none; color:#9ca3af; cursor:pointer; font-size:16px; padding:2px 4px; border-radius:3px; }
        `;
        document.head.appendChild(s);
    }, []);

    // ✅ Variants fetch — async callback, not sync setState in effect
    useEffect(() => {
        if (!product.hasVariants || !product._id) return;
        fetch(`/api/products/variants?productId=${product._id}`)
            .then(r => r.json())
            .then(data => { if (Array.isArray(data) && data.length > 0) setVariants(data); })
            .catch(err => console.error('Variants error:', err));
    }, [product._id, product.hasVariants]);

    const showToast = useCallback((msg: string, type: 'success' | 'error') => {
        document.querySelector('.pc-toast')?.remove();
        const el = document.createElement('div');
        el.className = `pc-toast ${type === 'success' ? 's' : 'e'}`;
        const path = type === 'success'
            ? 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
            : 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z';
        el.innerHTML = `<div class="pc-toast-row"><svg class="pc-toast-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="${path}" clip-rule="evenodd"/></svg><span class="pc-toast-msg">${msg}</span><button class="pc-toast-x" onclick="this.closest('.pc-toast').remove()">&#x2715;</button></div>`;
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('show'));
        setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 4000);
    }, []);

    const actualAvailability = (() => {
        if (product.productType === 'Affiliate') return 'Affiliate';
        if (product.availability !== 'InStock') return product.availability;
        const hasStock = (product.sizeRequirement === 'Mandatory' && product.sizes)
            ? product.sizes.some((s: any) => s.quantity > 0)
            : (product.quantity ?? 0) > 0;
        return hasStock ? 'InStock' : 'OutOfStock';
    })();

    const cartDisabled = product.productType === 'Affiliate' || actualAvailability !== 'InStock' || isAddingToCart;

    const cartBtnCls = (() => {
        if (product.productType === 'Affiliate' || actualAvailability !== 'InStock') return 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100';
        if (showSuccess) return 'bg-green-500 text-white border border-green-500';
        if (isAddingToCart) return 'bg-gray-600 text-white border border-gray-600 cursor-wait';
        return 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50';
    })();

    const addToCart = useCallback(async (size: string | null, variant?: Variant | null): Promise<boolean> => {
        setIsAddingToCart(true);
        try {
            const { data: validation } = await axios.post('/api/products/cart/validate', {
                productId: product._id, quantity: 1, size: size || null, variantId: variant?._id || null,
            });
            if (!validation.valid) { showToast(validation.message, 'error'); return false; }

            const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
            const existing = cart.find(i =>
                i._id === product._id &&
                (i.size || null) === (size || null) &&
                (i.variantId || null) === (variant?._id || null)
            );

            if (existing) {
                const nq = existing.quantity + 1;
                if (nq > 3) { showToast('Cannot add more than 3 units', 'error'); return false; }
                if (size && product.sizes) {
                    const sd = product.sizes.find((s: any) => s.name === size);
                    if (sd && nq > sd.quantity) { showToast(`Only ${sd.quantity} units available for size ${size}`, 'error'); return false; }
                }
                cart.splice(cart.indexOf(existing), 1);
                cart.push({ ...existing, quantity: nq, size: size || undefined });
                showToast(`Cart updated: ${nq} × ${product.title}`, 'success');
            } else {
                const priceInBDT = variant ? variant.price : (() => {
                    const p = product.prices.find((p: any) => p.currency === 'BDT') || product.prices[0];
                    return p.currency === 'BDT' ? p.amount : p.amount * (conversionRates[p.currency] || 1);
                })();
                cart.push({
                    _id: product._id, title: product.title, quantity: 1,
                    price: priceInBDT, mainImage: product.mainImage,
                    mainImageAlt: product.mainImageAlt, currency: 'BDT',
                    size: size || undefined, variantId: variant?._id,
                    variantName: variant?.name, variantWeight: variant?.weight,
                });
                showToast(`Added: ${product.title}`, 'success');
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            // ✅ FB AddToCart — browser pixel + CAPI
            trackAddToCart(product, 1, mainPrice?.amount || 0);
            window.dispatchEvent(new Event('cartUpdated'));
            setShowSuccess(true);
            setIsCartOpen(true);
            setTimeout(() => setShowSuccess(false), 2000);
            return true;
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Error checking availability', 'error');
            return false;
        } finally {
            setIsAddingToCart(false);
        }
    }, [product, mainPrice, conversionRates, showToast, trackAddToCart]);

    const handleAddToCart = useCallback(() => {
        if (product.availability !== 'InStock' || product.productType === 'Affiliate') {
            showToast('This product cannot be added to cart', 'error'); return;
        }
        if (product.hasVariants && variants.length > 0) {
            setSelectedVariant(null); setVariantModalError(false); setIsVariantModalOpen(true); return;
        }
        if (product.productType === 'Own' && product.sizeRequirement === 'Mandatory' && product.sizes) {
            if (!product.sizes.some((s: any) => s.quantity > 0)) { showToast('No sizes available', 'error'); return; }
            setModalSelectedSize(null); setModalShowSizeError(false); setIsSizeModalOpen(true); return;
        }
        if ((product.quantity ?? 0) <= 0) { showToast('This product is out of stock', 'error'); return; }
        addToCart(null);
    }, [product, variants, addToCart, showToast]);

    const handleVariantAdd = useCallback(async () => {
        if (!selectedVariant) { setVariantModalError(true); return; }
        const ok = await addToCart(null, selectedVariant);
        if (ok) { setIsVariantModalOpen(false); setSelectedVariant(null); }
    }, [selectedVariant, addToCart]);

    const handleSizeAdd = useCallback(async () => {
        if (!modalSelectedSize) { setModalShowSizeError(true); return; }
        const ok = await addToCart(modalSelectedSize);
        if (ok) setIsSizeModalOpen(false);
    }, [modalSelectedSize, addToCart]);

    const ProductImage = () => (
        <div className="relative w-full h-full">
            {!imageLoaded && !imageError && <ImageSkeleton/>}
            {product.mainImage && !imageError ? (
                <Image src={product.mainImage} alt={product.mainImageAlt || product.title} fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className={`object-cover object-center group-hover:scale-105 transition-transform duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                    loading="lazy" onLoad={() => setImageLoaded(true)}
                    onError={() => { setImageError(true); setImageLoaded(true); }}/>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                </div>
            )}
        </div>
    );

    const AvailBadge = () => (
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-sm ${
            product.productType === 'Affiliate' ? 'bg-purple-500 text-white' :
            actualAvailability === 'InStock'    ? 'bg-green-600 text-white' :
            actualAvailability === 'PreOrder'   ? 'bg-yellow-500 text-white' :
            'bg-red-600 text-white'
        }`}>
            {product.productType === 'Affiliate' ? 'Affiliate' :
             actualAvailability === 'OutOfStock' ? 'Out of Stock' :
             actualAvailability === 'InStock'    ? 'In Stock' : actualAvailability}
        </span>
    );

    return (
        <>
            {viewMode === 'list' ? (
                /* ── List view ─────────────────────────────────────────────── */
                <div className="group bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        <div className="lg:w-2/5 relative">
                            <Link href={productUrl}>
                                <div className="relative h-64 lg:h-full overflow-hidden bg-gray-100">
                                    <ProductImage/>
                                    <div className="absolute top-4 left-4"><AvailBadge/></div>
                                </div>
                            </Link>
                        </div>
                        <div className="lg:w-3/5 p-6 lg:p-8 flex flex-col justify-between">
                            <div>
                                <Link href={productUrl}>
                                    <h2 className="text-2xl font-bold text-gray-800 hover:text-gray-700 transition-colors line-clamp-2 mb-3">{product.title}</h2>
                                </Link>
                                {product.aggregateRating?.ratingValue && (
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                                        <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                        <span className="text-sm font-bold text-gray-900">{product.aggregateRating.ratingValue.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="pt-5 border-t border-gray-100">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {mainPrice && (
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                                                {mainPrice.currency === 'BDT' ? '৳' : '$'}{mainPrice.amount.toLocaleString()}
                                            </span>
                                            {hasDiscount && <>
                                                <span className="text-xl text-gray-400 line-through">{mainPrice.currency === 'BDT' ? '৳' : '$'}{(mainPrice.amount * 1.15).toLocaleString()}</span>
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">-{discountPercentage}%</span>
                                            </>}
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <Link href={productUrl} className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition flex items-center gap-2 min-w-[130px] justify-center">View Details</Link>
                                        <button onClick={handleAddToCart} disabled={cartDisabled}
                                            className={`px-8 py-3.5 font-semibold rounded-xl transition flex items-center gap-2 min-w-[130px] justify-center ${cartBtnCls}`}>
                                            {isAddingToCart ? <><SpinIcon md/><span>Adding…</span></> : showSuccess ? <><CheckIcon md/><span>Added!</span></> : <><CartIcon md/><span>Add to Cart</span></>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ── Grid view ─────────────────────────────────────────────── */
                <div className="group bg-white rounded-lg sm:rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                    <Link href={productUrl}>
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                            <ProductImage/>
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                <AvailBadge/>
                                {hasDiscount && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-600 text-white rounded-sm">-{discountPercentage}%</span>}
                            </div>
                        </div>
                    </Link>

                    <div className="flex-1 p-2 sm:p-3 flex flex-col">
                        <Link href={productUrl} className="flex-1 mb-2">
                            <h3 className="text-[11px] sm:text-xs font-medium text-gray-800 hover:text-gray-600 transition-colors leading-snug line-clamp-2 min-h-[32px]">
                                {product.title}
                            </h3>
                        </Link>

                        <div className="mb-2">
                            {mainPrice && (
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm sm:text-[15px] font-bold text-gray-900">
                                        {product.hasVariants && variants.length > 0
                                            ? `৳${Math.min(...variants.map(v => v.price)).toLocaleString()} – ৳${Math.max(...variants.map(v => v.price)).toLocaleString()}`
                                            : `${mainPrice.currency === 'BDT' ? '৳' : '$'}${mainPrice.amount.toLocaleString()}`
                                        }
                                    </span>
                                    {hasDiscount && <span className="text-[10px] text-gray-400 line-through">{mainPrice.currency === 'BDT' ? '৳' : '$'}{(mainPrice.amount * 1.15).toLocaleString()}</span>}
                                </div>
                            )}
                        </div>

                        <div className="mt-auto">
                            {/* Mobile */}
                            <div className="flex flex-col gap-1 sm:hidden">
                                <Link href={productUrl} className="w-full py-1.5 bg-gray-800 text-white font-medium text-[10px] rounded hover:bg-gray-700 transition text-center">Buy Now</Link>
                                {product.productType === 'Affiliate' ? (
                                    <button disabled className="w-full py-1.5 bg-gray-100 text-gray-400 text-[10px] rounded cursor-not-allowed text-center">Affiliate</button>
                                ) : (
                                    <button onClick={handleAddToCart} disabled={cartDisabled} className={`w-full py-1.5 text-[10px] rounded transition flex items-center justify-center gap-1 ${cartBtnCls}`}>
                                        {isAddingToCart ? <><SpinIcon/><span>Adding…</span></> : showSuccess ? <><CheckIcon/><span>Added!</span></> : <><CartIcon/><span>Add to Cart</span></>}
                                    </button>
                                )}
                            </div>
                            {/* Desktop */}
                            <div className="hidden sm:flex gap-1.5">
                                <Link href={productUrl} className="flex-1 py-2 bg-gray-800 text-white font-semibold text-xs rounded-lg hover:bg-gray-700 transition flex items-center justify-center whitespace-nowrap">Buy Now</Link>
                                {product.productType === 'Affiliate' ? (
                                    <button disabled className="flex-1 py-2 bg-gray-100 text-gray-400 text-xs rounded-lg cursor-not-allowed flex items-center justify-center">Affiliate</button>
                                ) : (
                                    <button onClick={handleAddToCart} disabled={cartDisabled} className={`flex-1 py-2 text-xs rounded-lg transition flex items-center justify-center gap-1 whitespace-nowrap ${cartBtnCls}`}>
                                        {isAddingToCart ? <><SpinIcon/><span>Adding…</span></> : showSuccess ? <><CheckIcon/><span>Added!</span></> : <><CartIcon/><span>Cart</span></>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Variant Modal */}
            {isVariantModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setIsVariantModalOpen(false)}>
                    <div className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-200 rounded-full"/></div>
                        <div className="px-4 sm:px-5 pt-3 pb-5">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Select Package / Weight</h3>
                                    {selectedVariant && <p className="text-[10px] text-green-600 mt-0.5">Selected: {selectedVariant.name} · {selectedVariant.weight}</p>}
                                </div>
                                <button onClick={() => setIsVariantModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>
                            <div className="max-h-[45vh] overflow-y-auto mb-4 space-y-2">
                                {variants.filter(v => v.quantity > 0).map(v => (
                                    <button key={v._id} onClick={() => { setSelectedVariant(v); setVariantModalError(false); }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${selectedVariant?._id === v._id ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200 hover:border-gray-400'}`}>
                                        <div className="text-left">
                                            <p className={`text-sm font-semibold ${selectedVariant?._id === v._id ? 'text-white' : 'text-gray-800'}`}>{v.name}</p>
                                            <p className={`text-xs ${selectedVariant?._id === v._id ? 'text-green-100' : 'text-gray-500'}`}>{v.weight}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${selectedVariant?._id === v._id ? 'text-white' : 'text-gray-900'}`}>৳{v.price.toLocaleString()}</p>
                                            <p className={`text-[10px] ${selectedVariant?._id === v._id ? 'text-green-200' : 'text-gray-400'}`}>{v.quantity <= 5 ? `Only ${v.quantity} left` : `${v.quantity} in stock`}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {variantModalError && <p className="text-red-500 text-xs mb-3 text-center bg-red-50 py-2 rounded-lg">Please select a package/weight</p>}
                            <button onClick={handleVariantAdd} disabled={isAddingToCart || !selectedVariant}
                                className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${isAddingToCart || !selectedVariant ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                                {isAddingToCart ? <><SpinIcon md/><span>Adding…</span></> : <><CartIcon md/><span>Add to Cart</span>{selectedVariant && <span className="text-[10px] opacity-75">(৳{selectedVariant.price.toLocaleString()})</span>}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Size Modal */}
            {isSizeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setIsSizeModalOpen(false)}>
                    <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-200 rounded-full"/></div>
                        <div className="px-4 sm:px-5 pt-3 pb-5">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Select Size</h3>
                                    {modalSelectedSize && <p className="text-[10px] text-green-600 mt-0.5">Selected: {modalSelectedSize}</p>}
                                </div>
                                <button onClick={() => setIsSizeModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>
                            <div className="max-h-[40vh] overflow-y-auto mb-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {product.sizes?.filter((s: any) => s.quantity > 0).map((s: any) => (
                                        <button key={s.name} onClick={() => { setModalSelectedSize(s.name); setModalShowSizeError(false); }}
                                            className={`flex flex-col items-center py-3 rounded-xl border transition-all ${modalSelectedSize === s.name ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200 hover:border-gray-400'}`}>
                                            <span className={`text-sm font-semibold ${modalSelectedSize === s.name ? 'text-white' : 'text-gray-800'}`}>{s.name}</span>
                                            <span className={`text-[10px] mt-0.5 ${modalSelectedSize === s.name ? 'text-green-100' : 'text-gray-400'}`}>{s.quantity <= 5 ? `${s.quantity} left` : 'Available'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {modalShowSizeError && <p className="text-red-500 text-xs mb-3 text-center bg-red-50 py-2 rounded-lg">Please select a size</p>}
                            <button onClick={handleSizeAdd} disabled={isAddingToCart || !modalSelectedSize}
                                className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${isAddingToCart || !modalSelectedSize ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                                {isAddingToCart ? <><SpinIcon md/><span>Adding…</span></> : <><CartIcon md/><span>Add to Cart</span>{modalSelectedSize && <span className="text-[10px] opacity-75">({modalSelectedSize})</span>}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CartSlider isOpen={isCartOpen} setIsOpen={setIsCartOpen} conversionRates={conversionRates}/>
        </>
    );
};

export default ProductCard;