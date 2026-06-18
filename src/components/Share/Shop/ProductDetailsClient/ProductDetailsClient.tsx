// src/components/Share/Shop/ProductDetailsClient/ProductDetailsClient.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CartSlider from '../CartSlider/CartSlider';
import axios from 'axios';
import { CiDeliveryTruck } from 'react-icons/ci';
import { useState, useEffect, useRef, useCallback } from 'react';
import { TbCategoryFilled } from 'react-icons/tb';
import { useFacebookEvents } from '@/src/hooks/useFacebookEvents';
import ProductVariantSelector from '../ProductVariantSelector/ProductVariantSelector';
import TopSellingCarousel from '@/src/components/Top-Selling/Top-Selling';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface ProductPrice { currency: string; amount: number; }
interface ProductSize { name: string; quantity: number; }
interface ProductImage { url: string; alt: string; }
interface ProductFAQ { question: string; answer: string; }
interface ProductSpec { name: string; value: string; }
interface ProductRating { ratingValue: number; reviewCount: number; }
interface ProductCategory { name: string; }

interface Product {
    _id: string;
    title: string;
    slug?: string;
    mainImage: string;
    mainImageAlt?: string;
    additionalImages: ProductImage[];
    prices: ProductPrice[];
    description: string;
    shortDescription?: string;
    descriptions?: string[];
    bulletPoints?: string[];
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
    category?: ProductCategory;
    availability: string;
    quantity: number;
    productType: string;
    sizeRequirement?: string;
    sizes?: ProductSize[];
    faqs?: ProductFAQ[];
    specifications?: ProductSpec[];
    aggregateRating?: ProductRating;
    brand?: string;
    product_code?: string;
    isGlobal?: boolean;
    targetCity?: string;
    targetCountry?: string;
    affiliateLink?: string;
    hasVariants?: boolean;
}

interface Tab { id: string; label: string; content: React.ReactNode; }

interface ConversionRates { USD: number; EUR: number; BDT: number;[k: string]: number; }

interface Variant {
    _id: string; name: string; weight: string;
    price: number; comparePrice: number; sku: string;
    quantity: number; isDefault: boolean;
}

interface CartItem {
    _id: string; title: string; quantity: number; price: number;
    mainImage: string; mainImageAlt?: string; currency: string;
    size?: string; variantId?: string; variantName?: string; variantWeight?: string;
}

interface ProductDetailsClientProps {
    product: Product;
    latestProducts: Product[];
    // ✅ basePath determines breadcrumb + canonical links
    basePath?: '/products' | '/shop';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductDetailsClient({
    product,
    latestProducts,
    basePath = '/shop',
}: ProductDetailsClientProps) {
    const [selectedImage, setSelectedImage] = useState(product.mainImage);
    const [selectedImageAlt, setSelectedImageAlt] = useState(product.mainImageAlt || product.title);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currency, setCurrency] = useState('BDT');
    const [quantity, setQuantity] = useState(1);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [conversionRates, setConversionRates] = useState<ConversionRates>({ USD: 123, EUR: 135, BDT: 1 });
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
    const [showSizeError, setShowSizeError] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [hasVariants, setHasVariants] = useState(product.hasVariants || false);

    const router = useRouter();
    const { trackViewContent, trackAddToCart } = useFacebookEvents();

    // ✅ ViewContent — fires once per product
    const hasTrackedView = useRef(false);
    useEffect(() => {
        if (product && !hasTrackedView.current) {
            hasTrackedView.current = true;
            const priceObj = product.prices.find(p => p.currency === 'BDT') || product.prices[0];
            trackViewContent(product, priceObj.amount);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product._id]);

    useEffect(() => { setIsClient(true); }, []);

    useEffect(() => {
        const check = () => { }; // isMobile not used in render, removed to clean up
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        axios.get('/api/products/conversion-rates')
            .then(r => setConversionRates(r.data))
            .catch(() => { }); // fail silently, defaults are fine
    }, []);

    // ✅ product URL uses basePath
    const productUrl = `${basePath}/${product.slug || product._id}`;

    // ── Toast ─────────────────────────────────────────────────────────────────
    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const existing = document.querySelector('.pdc-toast');
        if (existing) existing.remove();

        const el = document.createElement('div');
        el.className = `pdc-toast pdc-toast-${type}`;

        const iconPaths: Record<string, string> = {
            success: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
            error: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z',
            info: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z',
        };

        el.innerHTML = `
            <div class="pdc-toast-row">
                <svg class="pdc-toast-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="${iconPaths[type]}" clip-rule="evenodd"/>
                </svg>
                <span class="pdc-toast-msg">${message}</span>
                <button class="pdc-toast-x" onclick="this.closest('.pdc-toast').remove()">&#x2715;</button>
            </div>`;

        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('show'));
        setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 4000);
    }, []);

    // ✅ Inject toast CSS once
    useEffect(() => {
        if (!isClient || document.getElementById('pdc-toast-css')) return;
        const s = document.createElement('style');
        s.id = 'pdc-toast-css';
        s.textContent = `
            .pdc-toast { position:fixed; top:24px; right:24px; background:#fff; color:#1f2937; padding:14px 18px; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,.1); border-left:4px solid #374151; opacity:0; transform:translateY(16px); transition:all .3s cubic-bezier(.4,0,.2,1); z-index:2000; max-width:320px; }
            .pdc-toast.show { opacity:1; transform:translateY(0); }
            .pdc-toast-success { border-left-color:#10b981; }
            .pdc-toast-error   { border-left-color:#ef4444; }
            .pdc-toast-row  { display:flex; align-items:center; gap:10px; }
            .pdc-toast-icon { width:18px; height:18px; flex-shrink:0; color:#374151; }
            .pdc-toast-success .pdc-toast-icon { color:#10b981; }
            .pdc-toast-error   .pdc-toast-icon { color:#ef4444; }
            .pdc-toast-msg  { flex:1; font-size:13px; line-height:1.4; }
            .pdc-toast-x    { background:none; border:none; color:#9ca3af; cursor:pointer; font-size:15px; padding:2px 4px; border-radius:3px; }
        `;
        document.head.appendChild(s);
    }, [isClient]);

    // ── Price helpers ─────────────────────────────────────────────────────────
    const getCurrentPrice = () => {
        if (hasVariants && selectedVariant) return selectedVariant.price;
        const p = product.prices.find(p => p.currency === currency) || product.prices[0];
        return p.amount;
    };

    const getPriceDisplay = () => {
        const total = getCurrentPrice() * quantity;
        const symbol = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : '€';

        if (hasVariants && selectedVariant?.comparePrice) {
            const compareTotal = selectedVariant.comparePrice * quantity;
            return (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl font-bold text-gray-800">{symbol}{total.toLocaleString()}</span>
                    <span className="text-sm text-gray-400 line-through">{symbol}{compareTotal.toLocaleString()}</span>
                    <span className="text-xs text-green-600 font-medium">Save {symbol}{(compareTotal - total).toLocaleString()}</span>
                </div>
            );
        }
        return `${symbol}${total.toLocaleString()}`;
    };

    // ── Structured data ───────────────────────────────────────────────────────
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        image: [product.mainImage, ...(product.additionalImages?.map(i => i.url) || [])],
        description: product.description,
        brand: { '@type': 'Brand', name: product.brand || 'Sooqra One' },
        sku: product.product_code || product._id,
        offers: {
            '@type': 'Offer',
            priceCurrency: 'BDT',
            price: product.prices.find(p => p.currency === 'BDT')?.amount || 0,
            availability: `https://schema.org/${product.availability || 'InStock'}`,
            url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}${productUrl}`,
        },
        ...(product.aggregateRating?.ratingValue && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.aggregateRating.ratingValue,
                reviewCount: product.aggregateRating.reviewCount || 0,
            },
        }),
        ...(product.specifications?.length && {
            additionalProperty: product.specifications.map(s => ({
                '@type': 'PropertyValue', name: s.name, value: s.value,
            })),
        }),
    };

    const faqStructuredData = product.faqs?.length ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: product.faqs.map(f => ({
            '@type': 'Question', name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
    } : null;

    // ── Add to Cart ───────────────────────────────────────────────────────────
    const handleAddToCart = async () => {
        if (product.productType === 'Own' && product.sizeRequirement === 'Mandatory'
            && product.sizes?.length && !selectedSize) {
            setShowSizeError(true);
            showToast('Please select a size before adding to cart', 'error');
            return;
        }
        if (product.availability !== 'InStock' || product.productType === 'Affiliate') {
            showToast('This product cannot be added to cart', 'error'); return;
        }
        if (hasVariants && selectedVariant && selectedVariant.quantity <= 0) {
            showToast(`${selectedVariant.name} is out of stock`, 'error'); return;
        }
        if (!hasVariants && product.quantity <= 0) {
            showToast('This product is out of stock', 'error'); return;
        }

        try {
            const { data: validation } = await axios.post('/api/products/cart/validate', {
                productId: product._id, quantity,
                size: selectedSize?.name || null,
                variantId: selectedVariant?._id,
            });
            if (!validation.valid) { showToast(validation.message, 'error'); return; }

            let priceInBDT: number;
            let productTitle: string;

            if (hasVariants && selectedVariant) {
                priceInBDT = selectedVariant.price;
                productTitle = `${product.title} (${selectedVariant.name})`;
            } else {
                const p = product.prices.find(p => p.currency === 'BDT') || product.prices[0];
                priceInBDT = p.currency === 'BDT' ? p.amount : p.amount * (conversionRates[p.currency] || 1);
                productTitle = product.title;
            }

            const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
            const existing = cart.find(item =>
                hasVariants && selectedVariant
                    ? item._id === product._id && item.variantId === selectedVariant._id && (item.size || null) === (selectedSize?.name || null)
                    : item._id === product._id && (item.size || null) === (selectedSize?.name || null)
            );

            let newQuantity = quantity;
            if (existing) {
                newQuantity = existing.quantity + quantity;
                if (newQuantity > 3) { showToast('Cannot add more than 3 units', 'error'); return; }
                if (hasVariants && selectedVariant && newQuantity > selectedVariant.quantity) {
                    showToast(`Only ${selectedVariant.quantity} units available`, 'error'); return;
                }
                if (selectedSize && newQuantity > selectedSize.quantity) {
                    showToast(`Only ${selectedSize.quantity} units available for size ${selectedSize.name}`, 'error'); return;
                }
                cart.splice(cart.indexOf(existing), 1);
                cart.push({
                    ...existing, quantity: newQuantity,
                    ...(hasVariants && selectedVariant ? {
                        variantId: selectedVariant._id,
                        variantName: selectedVariant.name,
                        variantWeight: selectedVariant.weight,
                        price: selectedVariant.price,
                    } : {}),
                });
                showToast(`Cart updated: ${newQuantity} × ${productTitle}`, 'success');
            } else {
                const newItem: CartItem = {
                    _id: product._id, title: product.title, quantity,
                    price: priceInBDT, mainImage: product.mainImage,
                    mainImageAlt: product.mainImageAlt, currency: 'BDT',
                    size: selectedSize?.name,
                };
                if (hasVariants && selectedVariant) {
                    newItem.variantId = selectedVariant._id;
                    newItem.variantName = selectedVariant.name;
                    newItem.variantWeight = selectedVariant.weight;
                }
                cart.push(newItem);
                showToast(`Added ${quantity} × ${productTitle} to cart`, 'success');
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));
            setIsCartOpen(true);
            trackAddToCart(product, quantity, priceInBDT);
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Error checking product availability', 'error');
        }
    };

    // ── Buy Now ───────────────────────────────────────────────────────────────
    const handleBuyNow = async () => {
        if (product.productType === 'Own' && product.sizeRequirement === 'Mandatory'
            && product.sizes?.length && !selectedSize) {
            setShowSizeError(true);
            showToast('Please select a size before buying', 'error'); return;
        }
        if (product.availability !== 'InStock') {
            showToast('This product is out of stock', 'error'); return;
        }
        if (hasVariants && selectedVariant && selectedVariant.quantity <= 0) {
            showToast(`${selectedVariant.name} is out of stock`, 'error'); return;
        }
        if (!hasVariants && product.quantity <= 0) {
            showToast('This product is out of stock', 'error'); return;
        }
        if (product.productType === 'Affiliate') {
            window.open(product.affiliateLink || '#', '_blank', 'noopener,noreferrer');
            showToast('Redirecting to affiliate site', 'success'); return;
        }

        try {
            const { data: validation } = await axios.post('/api/products/cart/validate', {
                productId: product._id, quantity,
                size: selectedSize?.name || null,
                variantId: selectedVariant?._id,
            });
            if (!validation.valid) { showToast(validation.message, 'error'); return; }

            let priceInBDT: number;
            let productTitle: string;

            if (hasVariants && selectedVariant) {
                priceInBDT = selectedVariant.price;
                productTitle = `${product.title} (${selectedVariant.name})`;
            } else {
                const p = product.prices.find(p => p.currency === 'BDT') || product.prices[0];
                priceInBDT = p.currency === 'BDT' ? p.amount : p.amount * (conversionRates[p.currency] || 1);
                productTitle = product.title;
            }

            let cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');

            // Remove existing same product/variant
            cart = cart.filter(item =>
                hasVariants && selectedVariant
                    ? !(item._id === product._id && item.variantId === selectedVariant._id)
                    : !(item._id === product._id && (item.size || null) === (selectedSize?.name || null))
            );

            const newItem: CartItem = {
                _id: product._id, title: product.title, quantity,
                price: priceInBDT, mainImage: product.mainImage,
                mainImageAlt: product.mainImageAlt, currency: 'BDT',
                size: selectedSize?.name,
            };
            if (hasVariants && selectedVariant) {
                newItem.variantId = selectedVariant._id;
                newItem.variantName = selectedVariant.name;
                newItem.variantWeight = selectedVariant.weight;
            }
            cart.push(newItem);
            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));
            showToast(`Proceeding with ${quantity} × ${productTitle}`, 'success');
            router.push('/cart');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Error checking product availability', 'error');
        }
    };

    // ── Tabs ──────────────────────────────────────────────────────────────────
    const tabs: Tab[] = [
        {
            id: 'product-details', label: 'Product Details',
            content: (
                <div className="space-y-5">
                    {product.shortDescription && (
                        <div><h4 className="text-sm font-semibold text-gray-800 mb-1.5">Quick Overview</h4>
                            <p className="text-gray-600 text-sm">{product.shortDescription}</p></div>
                    )}
                    {product.description && (
                        <div><h4 className="text-sm font-semibold text-gray-800 mb-1.5">Description</h4>
                            <p className="text-gray-600 text-sm">{product.description}</p></div>
                    )}
                    {product.descriptions?.map((desc, i) => (
                        <p key={i} className="text-gray-600 text-sm">{desc}</p>
                    ))}
                    {product.bulletPoints?.length ? (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-1.5">Key Features</h4>
                            <ul className="space-y-1.5">
                                {product.bulletPoints.map((pt, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                                        <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" fillRule="evenodd" />
                                        </svg>
                                        {pt}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            ),
        },
        ...(product.specifications?.length ? [{
            id: 'specifications', label: 'Specifications',
            content: (
                <table className="w-full text-sm">
                    <tbody>
                        {product.specifications!.map((s, i) => (
                            <tr key={i} className="border-b border-gray-100">
                                <td className="py-2 pr-4 font-medium text-gray-700 w-2/5">{s.name}</td>
                                <td className="py-2 text-gray-600">{s.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ),
        } as Tab] : []),
        ...(product.faqs?.length ? [{
            id: 'faqs', label: 'FAQs',
            content: (
                <div className="space-y-4">
                    {product.faqs!.map((f, i) => (
                        <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                            <h4 className="text-sm font-medium text-gray-800 mb-1.5">{f.question}</h4>
                            <p className="text-gray-600 text-sm">{f.answer}</p>
                        </div>
                    ))}
                </div>
            ),
        } as Tab] : []),
    ];

    const activeTabData = tabs.find(t => t.id === activeTab);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Structured data */}
                {isClient && (
                    <>
                        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
                        {faqStructuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />}
                    </>
                )}

                {/* ✅ Breadcrumb — uses basePath */}
                <nav className="mb-8">
                    <ol className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm">
                        <li><Link href="/" className="text-gray-500 hover:text-gray-800 transition-colors">Home</Link></li>
                        <li className="text-gray-300">/</li>
                        <li>
                            <Link href={basePath} className="text-gray-500 hover:text-gray-800 transition-colors">
                                {basePath === '/shop' ? 'Shop' : 'Products'}
                            </Link>
                        </li>
                        <li className="text-gray-300">/</li>
                        <li className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-md" title={product.title}>
                            {product.title}
                        </li>
                    </ol>
                </nav>

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

                    {/* ── Images ─────────────────────────────────────────────── */}
                    <div className="space-y-4">
                        <div
                            className="relative w-full max-w-lg mx-auto rounded-xl overflow-hidden bg-white shadow-sm cursor-zoom-in"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <div className="aspect-square relative">
                                <Image
                                    src={selectedImage}
                                    alt={selectedImageAlt}
                                    fill priority
                                    className="object-contain p-4"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                                {product.availability !== 'InStock' && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold">
                                            {product.availability === 'OutOfStock' ? 'Out of Stock' : 'Pre-Order'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {(product.additionalImages?.length > 0 || product.mainImage) && (
                            <div className="w-full max-w-lg mx-auto grid grid-cols-5 gap-2">
                                {[
                                    { url: product.mainImage, alt: product.mainImageAlt || product.title },
                                    ...(product.additionalImages || []),
                                ].map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setSelectedImage(img.url); setSelectedImageAlt(img.alt); }}
                                        className={`relative aspect-square rounded-lg overflow-hidden transition-all ${selectedImage === img.url
                                                ? 'ring-2 ring-gray-800'
                                                : 'hover:ring-2 hover:ring-gray-300 hover:scale-105'
                                            }`}
                                    >
                                        <Image src={img.url} alt={img.alt || `Thumbnail ${i + 1}`} fill className="object-cover" sizes="80px" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Details ────────────────────────────────────────────── */}
                    <div className="space-y-5">
                        {/* Title + meta */}
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">{product.title}</h1>
                            {product.category && (
                                <div className="flex gap-1.5 items-center mt-1.5">
                                    <TbCategoryFilled className="text-gray-500 w-4 h-4" />
                                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {product.category.name}
                                    </span>
                                </div>
                            )}
                            {product.brand && (
                                <p className="text-sm text-gray-500 mt-1.5">Brand: <span className="font-semibold text-gray-700">{product.brand}</span></p>
                            )}
                            {product.aggregateRating?.ratingValue && (
                                <div className="mt-2 flex items-center gap-1.5">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className={`w-4 h-4 ${i < Math.round(product.aggregateRating!.ratingValue) ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500">({product.aggregateRating.ratingValue.toFixed(1)} · {product.aggregateRating.reviewCount || 0} reviews)</span>
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        {!hasVariants && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <div className="text-2xl font-bold text-gray-800">{getPriceDisplay()}</div>
                                        <p className="text-xs text-gray-500 mt-1">Price in {currency}</p>
                                    </div>
                                    <select
                                        value={currency}
                                        onChange={e => setCurrency(e.target.value)}
                                        className="bg-white border border-gray-300 text-gray-800 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-gray-500"
                                    >
                                        {product.prices.map(p => <option key={p.currency} value={p.currency}>{p.currency}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Variant selector */}
                        {hasVariants && (
                            <ProductVariantSelector
                                productId={product._id}
                                onVariantChange={(v: Variant | null) => {
                                    if (v) { setHasVariants(true); setSelectedVariant(v); }
                                }}
                                selectedVariantId={selectedVariant?._id}
                            />
                        )}

                        {/* Size selection */}
                        {product.productType === 'Own' && product.sizeRequirement === 'Mandatory' && product.sizes?.length ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-800">Select Size</label>
                                    {selectedSize && <span className="text-xs text-gray-500">{selectedSize.quantity} available</span>}
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {product.sizes.filter(s => s.quantity > 0).map((s, i) => (
                                        <button key={i}
                                            onClick={() => { setSelectedSize(s); setShowSizeError(false); }}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${selectedSize?.name === s.name
                                                    ? 'bg-gray-800 text-white border-gray-800'
                                                    : 'border-gray-300 text-gray-700 hover:border-gray-800 hover:bg-gray-50'
                                                }`}
                                        >{s.name}</button>
                                    ))}
                                </div>
                                {showSizeError && <p className="text-sm text-red-600">Please select a size before adding to cart</p>}
                            </div>
                        ) : null}

                        {/* Quantity */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-800">Quantity</label>
                            <div className="flex items-center gap-4">
                                <select
                                    value={quantity}
                                    onChange={e => setQuantity(Number(e.target.value))}
                                    disabled={product.availability !== 'InStock' || product.productType === 'Affiliate'}
                                    className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-gray-500 disabled:opacity-50"
                                >
                                    {[...Array(Math.min(product.quantity || 3, 3))].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                                <span className="text-sm text-gray-500">max {Math.min(product.quantity || 3, 3)} per order</span>
                            </div>
                        </div>

                        {/* Out of stock banner */}
                        {product.availability !== 'InStock' && product.productType !== 'Affiliate' && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
                                <p className="font-medium text-sm">
                                    {product.availability === 'OutOfStock' ? 'Currently Out of Stock' : 'Available for Pre-Order'}
                                </p>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            {product.productType !== 'Affiliate' && (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.availability !== 'InStock'}
                                    className="flex-1 px-6 py-3.5 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Add to Cart
                                </button>
                            )}
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 px-6 py-3.5 bg-white border border-gray-300 text-gray-800 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {product.productType === 'Affiliate' ? 'Buy on External Site' : 'Buy Now'}
                            </button>
                        </div>

                        {/* Product info */}
                        <div className="space-y-2 pt-5 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CiDeliveryTruck className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">Delivery: 3–7 business days</span>
                            </div>
                            {product.product_code && (
                                <p className="text-sm text-gray-500">Product Code: <span className="font-medium text-gray-700">{product.product_code}</span></p>
                            )}
                            <p className="text-sm text-gray-500">
                                Availability: <span className="font-medium text-gray-700">
                                    {product.availability === 'InStock' ? `In Stock (${product.quantity} available)` : product.availability}
                                </span>
                            </p>
                            <p className="text-sm text-gray-500">
                                Ships to: <span className="font-medium text-gray-700">
                                    {product.isGlobal ? 'Worldwide' : `${product.targetCity}, ${product.targetCountry}`}
                                </span>
                            </p>
                        </div>

                        {/* Tab buttons */}
                        {tabs.length > 0 && (
                            <div className="pt-5 border-t border-gray-200 space-y-2">
                                {tabs.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className="w-full flex justify-between items-center px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors">
                                        {tab.label}
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Tab Drawer ─────────────────────────────────────────────── */}
                {activeTab && activeTabData && (
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setActiveTab(null)}>
                        {/* Mobile: bottom sheet */}
                        <div
                            className="fixed bottom-0 left-0 right-0 bg-white p-6 rounded-t-2xl max-h-[80vh] overflow-y-auto md:hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-base font-bold text-gray-800">{activeTabData.label}</h3>
                                <button onClick={() => setActiveTab(null)} className="text-gray-400 hover:text-gray-700">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="prose prose-sm max-w-none">{activeTabData.content}</div>
                        </div>
                        {/* Desktop: left side panel */}
                        <div
                            className="hidden md:flex fixed left-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800">{activeTabData.label}</h3>
                                <button onClick={() => setActiveTab(null)} className="text-gray-400 hover:text-gray-700">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 prose prose-sm max-w-none">{activeTabData.content}</div>
                        </div>
                    </div>
                )}

                {/* Related products */}
                <div className="mt-12">
                    <TopSellingCarousel />
                </div>

                {/* Image modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="relative w-full max-w-3xl aspect-square" onClick={e => e.stopPropagation()}>
                            <Image src={selectedImage} alt={selectedImageAlt} fill className="object-contain" sizes="100vw" />
                        </div>
                    </div>
                )}

                <CartSlider isOpen={isCartOpen} setIsOpen={setIsCartOpen} conversionRates={conversionRates} />
            </div>
        </div>
    );
}