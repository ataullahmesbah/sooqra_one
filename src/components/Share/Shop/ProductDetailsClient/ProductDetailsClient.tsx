// src/components/Share/Shop/ProductDetailsClient/ProductDetailsClient.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CartSlider from '../CartSlider/CartSlider';
import axios from 'axios';
import { CiDeliveryTruck } from "react-icons/ci";
import { useState, useEffect, useRef } from 'react';
import { TbCategoryFilled } from "react-icons/tb";

// Define proper interfaces
interface ProductPrice {
    currency: string;
    amount: number;
}

interface ProductSize {
    name: string;
    quantity: number;
}

interface ProductImage {
    url: string;
    alt: string;
}

interface ProductFAQ {
    question: string;
    answer: string;
}

interface ProductSpecification {
    name: string;
    value: string;
}

interface ProductAggregateRating {
    ratingValue: number;
    reviewCount: number;
}

interface ProductCategory {
    name: string;
}

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
    specifications?: ProductSpecification[];
    aggregateRating?: ProductAggregateRating;
    brand?: string;
    product_code?: string;
    isGlobal?: boolean;
    targetCity?: string;
    targetCountry?: string;
    affiliateLink?: string;
}

interface Tab {
    id: string;
    label: string;
    content: React.ReactNode;
}

interface ProductDetailsClientProps {
    product: Product;
    latestProducts: Product[];
}

interface ConversionRates {
    USD: number;
    EUR: number;
    BDT: number;
    [key: string]: number;
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
}

export default function ProductDetailsClient({ product, latestProducts }: ProductDetailsClientProps) {
    const [selectedImage, setSelectedImage] = useState<string>(product.mainImage);
    const [selectedImageAlt, setSelectedImageAlt] = useState<string>(product.mainImageAlt || product.title);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currency, setCurrency] = useState<string>('BDT');
    const [quantity, setQuantity] = useState<number>(1);
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [conversionRates, setConversionRates] = useState<ConversionRates>({ USD: 123, EUR: 135, BDT: 1 });
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const router = useRouter();
    const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
    const [showSizeError, setShowSizeError] = useState<boolean>(false);
    const [isClient, setIsClient] = useState(false);


    useEffect(() => {
        setIsClient(true);
    }, []);

    // Custom Toast Function
    const showCustomToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
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

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        axios
            .get('/api/products/conversion-rates')
            .then((response) => {
                setConversionRates(response.data);
            })
            .catch((err) => {
                console.error('Error fetching conversion rates:', err);
                showCustomToast('Failed to load currency conversion rates', 'error');
            });
    }, []);

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        image: [product.mainImage, ...(product.additionalImages?.map((img) => img.url) || [])],
        description: product.description,
        brand: { '@type': 'Brand', name: product.brand || 'Sooqra One' },
        sku: product.product_code || product._id,
        offers: {
            '@type': 'Offer',
            priceCurrency: 'BDT',
            price: product.prices.find((p) => p.currency === 'BDT')?.amount || 0,
            availability: `https://schema.org/${product.availability || 'InStock'}`,
            url: `${process.env.NEXTAUTH_URL}/shop/${product.slug || product._id}`,
            areaServed: product.isGlobal ? 'Worldwide' : {
                '@type': 'Place',
                name: product.targetCity,
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: product.targetCity,
                    addressCountry: product.targetCountry,
                },
            },
        },
        aggregateRating: product.aggregateRating?.ratingValue
            ? {
                '@type': 'AggregateRating',
                ratingValue: product.aggregateRating.ratingValue,
                reviewCount: product.aggregateRating.reviewCount || 0,
            }
            : undefined,
        additionalProperty: product.specifications?.map((spec) => ({
            '@type': 'PropertyValue',
            name: spec.name,
            value: spec.value,
        })),
    };

    const faqStructuredData = (product.faqs && product.faqs.length > 0)
        ? {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: product.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer,
                },
            })),
        }
        : null;

    const handleAddToCart = async () => {
        if (product.productType === 'Own' && product.sizeRequirement === 'Mandatory' && product.sizes && product.sizes.length > 0 && !selectedSize) {
            setShowSizeError(true);
            showCustomToast('Please select a size before adding to cart', 'error');
            return;
        }

        if (product.availability !== 'InStock' || product.quantity <= 0 || product.productType === 'Affiliate') {
            showCustomToast('This product cannot be added to cart', 'error');
            return;
        }

        try {
            const response = await axios.post('/api/products/cart/validate', {
                productId: product._id,
                quantity,
                size: selectedSize ? selectedSize.name : null,
            });
            const validation = response.data;

            if (!validation.valid) {
                showCustomToast(validation.message, 'error');
                return;
            }

            const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItem = cart.find((item) =>
                item._id === product._id &&
                (item.size || null) === (selectedSize?.name || null)
            );
            let newQuantity = quantity;

            if (existingItem) {
                newQuantity = existingItem.quantity + quantity;
                if (newQuantity > 3) {
                    showCustomToast('Cannot add more than 3 units of this product', 'error');
                    return;
                }
                if (selectedSize && newQuantity > selectedSize.quantity) {
                    showCustomToast(`Only ${selectedSize.quantity} units available for size ${selectedSize.name}`, 'error');
                    return;
                }
                cart.splice(cart.indexOf(existingItem), 1);
                cart.push({
                    ...existingItem,
                    quantity: newQuantity,
                    size: selectedSize?.name
                });
                showCustomToast(`Cart updated with ${newQuantity} units of ${product.title}`, 'success');
            } else {
                const priceObj = product.prices.find((p) => p.currency === 'BDT') || product.prices[0];
                const priceInBDT = priceObj.currency === 'BDT'
                    ? priceObj.amount
                    : priceObj.amount * (conversionRates[priceObj.currency] || 1);
                cart.push({
                    _id: product._id,
                    title: product.title,
                    quantity,
                    price: priceInBDT,
                    mainImage: product.mainImage,
                    mainImageAlt: product.mainImageAlt,
                    currency: 'BDT',
                    size: selectedSize?.name,
                });
                showCustomToast(`Added ${quantity} units of ${product.title} to cart`, 'success');
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));
            setIsCartOpen(true);
        } catch (error: any) {
            console.error('Error validating product stock:', error);
            showCustomToast(error.response?.data?.message || 'Error checking product availability', 'error');
        }
    };

    const handleBuyNow = async () => {
        if (product.productType === 'Own' && product.sizeRequirement === 'Mandatory' && product.sizes && product.sizes.length > 0 && !selectedSize) {
            setShowSizeError(true);
            showCustomToast('Please select a size before buying', 'error');
            return;
        }

        if (product.availability !== 'InStock' || product.quantity <= 0) {
            showCustomToast('This product is out of stock', 'error');
            return;
        }

        if (product.productType === 'Affiliate') {
            window.open(product.affiliateLink || '#', '_blank', 'noopener,noreferrer');
            showCustomToast('Redirecting to affiliate site', 'success');
            return;
        }

        try {
            const response = await axios.post('/api/products/cart/validate', {
                productId: product._id,
                quantity,
                size: selectedSize ? selectedSize.name : null,
            });
            const validation = response.data;

            if (!validation.valid) {
                showCustomToast(validation.message, 'error');
                return;
            }

            const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
            const filteredCart = cart.filter((item) =>
                item._id !== product._id ||
                (item.size && item.size !== selectedSize?.name)
            );
            const priceObj = product.prices.find((p) => p.currency === 'BDT') || product.prices[0];
            const priceInBDT = priceObj.currency === 'BDT'
                ? priceObj.amount
                : priceObj.amount * (conversionRates[priceObj.currency] || 1);

            const updatedCart = [
                ...filteredCart,
                {
                    _id: product._id,
                    title: product.title,
                    quantity,
                    price: priceInBDT,
                    mainImage: product.mainImage,
                    mainImageAlt: product.mainImageAlt,
                    currency: 'BDT',
                    size: selectedSize?.name,
                },
            ];

            localStorage.setItem('cart', JSON.stringify(updatedCart));
            window.dispatchEvent(new Event('cartUpdated'));
            showCustomToast(`Proceeding to cart with ${quantity} units of ${product.title}`, 'success');
            router.push('/cart');
        } catch (error: any) {
            console.error('Error validating product stock:', error);
            showCustomToast(error.response?.data?.message || 'Error checking product availability', 'error');
        }
    };

    const getPriceInBDT = (price: number, curr: string) => {
        return price * (conversionRates[curr] || 1);
    };

    const getPriceDisplay = () => {
        const priceObj = product.prices.find((p) => p.currency === currency) || product.prices[0];
        const priceInBDT = priceObj.currency === 'BDT'
            ? priceObj.amount
            : priceObj.amount * (conversionRates[priceObj.currency] || 1);
        const total = priceInBDT * quantity;
        const symbol = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : '€';
        return `${symbol}${new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(currency === 'BDT' ? total : total / (conversionRates[currency] || 1))}`;
    };

    const tabs: Tab[] = [
        {
            id: 'product-details',
            label: 'Product Details',
            content: (
                <div className="space-y-6">
                    {product.shortDescription && (
                        <div>
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Quick Overview</h4>
                            <p className="text-gray-600 text-sm">{product.shortDescription}</p>
                        </div>
                    )}
                    {product.description && (
                        <div>
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Description</h4>
                            <p className="text-gray-600 text-sm">{product.description}</p>
                        </div>
                    )}
                    {product.descriptions && product.descriptions.length > 0 && (
                        <div>
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Additional Information</h4>
                            {product.descriptions.map((desc, index) => (
                                <p key={index} className="text-gray-600 text-sm mb-2">{desc}</p>
                            ))}
                        </div>
                    )}
                    {product.bulletPoints && product.bulletPoints.length > 0 && (
                        <div>
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Key Features</h4>
                            <ul className="space-y-2 text-gray-600 text-sm">
                                {product.bulletPoints.map((point, index) => (
                                    <li key={index} className="flex items-start">
                                        <svg className="w-4 h-4 text-gray-700 mr-2 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" fillRule="evenodd" />
                                        </svg>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ),
        },
        ...(product.specifications && product.specifications.length > 0 ? [{
            id: 'specifications',
            label: 'Product Specifications',
            content: (
                <table className="w-full text-sm text-gray-600">
                    <tbody>
                        {product.specifications.map((spec, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-2 pr-4 font-medium text-gray-800">{spec.name}</td>
                                <td className="py-2">{spec.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ),
        } as Tab] : []),
        ...(product.faqs && product.faqs.length > 0 ? [{
            id: 'faqs',
            label: 'FAQs',
            content: (
                <div className="space-y-4">
                    {product.faqs.map((faq, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                            <h4 className="text-sm font-medium text-gray-800 mb-2">{faq.question}</h4>
                            <p className="text-gray-600 text-sm">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            ),
        } as Tab] : [])
    ];

    const activeTabData = tabs.find((tab) => tab.id === activeTab);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {isClient && (
                    <>
                        <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{
                                __html: JSON.stringify(structuredData)
                            }}
                        />
                        {faqStructuredData && (
                            <script
                                type="application/ld+json"
                                dangerouslySetInnerHTML={{
                                    __html: JSON.stringify(faqStructuredData)
                                }}
                            />
                        )}
                    </>
                )}

                {/* Breadcrumb Navigation */}
                <nav className="mb-8">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li>
                            <Link href="/" className="text-gray-600 hover:text-gray-800 transition-colors">
                                Home
                            </Link>
                        </li>
                        <li className="text-gray-400">/</li>
                        <li>
                            <Link href="/products" className="text-gray-600 hover:text-gray-800 transition-colors">
                                Product
                            </Link>
                        </li>
                        <li className="text-gray-400">/</li>
                        <li className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-md" title={product.title}>
                            {product.title}
                        </li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div
                            className="relative w-full max-w-lg mx-auto rounded-lg overflow-hidden bg-white shadow-sm cursor-zoom-in"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <div className="aspect-square relative">
                                <Image
                                    src={selectedImage}
                                    alt={selectedImageAlt}
                                    fill
                                    className="object-contain p-4"
                                    priority
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

                        {(product.additionalImages.length > 0 || product.mainImage) && (
                            <div className="w-full max-w-lg mx-auto">
                                <div className="grid grid-cols-5 gap-3">
                                    {[
                                        { url: product.mainImage, alt: product.mainImageAlt || product.title },
                                        ...product.additionalImages
                                    ].map(
                                        (img, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSelectedImage(img.url);
                                                    setSelectedImageAlt(img.alt);
                                                }}
                                                className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${selectedImage === img.url
                                                    ? 'ring-2 ring-gray-800'
                                                    : 'hover:ring-2 hover:ring-gray-300 hover:scale-105'
                                                    }`}
                                            >
                                                <Image
                                                    src={img.url}
                                                    alt={img.alt || `${product.title} thumbnail ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                                {product.title}
                            </h1>
                            {product.category && (

                                <div className="flex gap-2 items-center mt-2">

                                <span className=''>
                                    <TbCategoryFilled />
                                </span>
                                <span className="inline-block py-1 font-semibold bg-gray-100 text-gray-700 rounded-full text-sm">
                                    {product.category.name}
                                </span>
                                </div>
                            )}
                            {product.brand && (
                                <p className="text-sm font-semibold text-gray-600 mt-2">Brand: {product.brand}</p>
                            )}
                            {product.aggregateRating?.ratingValue && (
                                <div className="mt-3 flex items-center">
                                    <div className="flex text-yellow-400">
                                        {'★'.repeat(Math.round(product.aggregateRating.ratingValue))}
                                        <span className="text-gray-400">
                                            {'★'.repeat(5 - Math.round(product.aggregateRating.ratingValue))}
                                        </span>
                                    </div>
                                    <span className="ml-2 text-sm text-gray-600">
                                        ({product.aggregateRating.ratingValue.toFixed(1)} · {product.aggregateRating.reviewCount || 0} reviews)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <div className="text-2xl font-bold text-gray-800">
                                        {getPriceDisplay()}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Price in {currency}
                                    </p>
                                </div>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                                >
                                    {product.prices.map((price) => (
                                        <option key={price.currency} value={price.currency}>
                                            {price.currency}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Size Selection */}
                        {product.productType === 'Own' && product.sizeRequirement === 'Mandatory' && product.sizes && product.sizes.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-800">Select Size</label>
                                    {selectedSize && (
                                        <span className="text-xs text-gray-600">
                                            {selectedSize.quantity} available
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {product.sizes
                                        .filter((size) => size.quantity > 0)
                                        .map((size, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSelectedSize(size);
                                                    setShowSizeError(false);
                                                }}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${selectedSize?.name === size.name
                                                    ? 'bg-gray-800 text-white border-gray-800'
                                                    : 'border-gray-300 text-gray-700 hover:border-gray-800 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {size.name}
                                            </button>
                                        ))}
                                </div>
                                {showSizeError && (
                                    <p className="text-sm text-red-600 mt-2">
                                        Please select a size before adding to cart
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-800">Quantity</label>
                            <div className="flex items-center gap-4">
                                <select
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    disabled={product.availability !== 'InStock' || product.productType === 'Affiliate'}
                                    className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 disabled:opacity-50"
                                >
                                    {[...Array(Math.min(product.quantity || 3, 3))].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-sm text-gray-600">
                                    max {Math.min(product.quantity || 3, 3)} per order
                                </span>
                            </div>
                        </div>

                        {/* Stock Status */}
                        {product.availability !== 'InStock' && product.productType !== 'Affiliate' ? (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                                <p className="font-medium">
                                    {product.availability === 'OutOfStock' ? 'Currently Out of Stock' : 'Available for Pre-Order'}
                                </p>
                            </div>
                        ) : null}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            {product.productType !== 'Affiliate' && (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.availability !== 'InStock'}
                                    className="flex-1 px-6 py-3.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Add to Cart
                                </button>
                            )}
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 px-6 py-3.5 bg-white border border-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {product.productType === 'Affiliate' ? 'Buy on External Site' : 'Buy Now'}
                            </button>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-3 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-3 font-semibold text-sm text-gray-600">
                                <CiDeliveryTruck className="w-5 h-5" />
                                <span>Delivery: 3-7 business days</span>
                            </div>
                            {product.product_code && (
                                <p className="text-sm text-gray-600">
                                    Product Code: {product.product_code}
                                </p>
                            )}
                            <p className="text-sm text-gray-600">
                                Availability: {product.availability === 'InStock'
                                    ? `In Stock (${product.quantity} available)`
                                    : product.availability}
                            </p>
                            <p className="text-sm text-gray-600">
                                Ships to: {product.isGlobal
                                    ? 'Worldwide'
                                    : `${product.targetCity}, ${product.targetCountry}`}
                            </p>
                        </div>

                        {/* Tabs */}
                        {tabs.length > 0 && (
                            <div className="pt-6 border-t border-gray-200">
                                <div className="flex flex-col gap-3">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className="flex justify-between items-center px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                                            aria-controls={`drawer-${tab.id}`}
                                            aria-expanded={activeTab === tab.id}
                                        >
                                            {tab.label}
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Content Drawer */}


                {/* Tab Content Drawer */}
                {activeTab && activeTabData && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                        onClick={() => setActiveTab(null)}
                    >
                        {/* Mobile Drawer (Bottom) */}
                        <div
                            className={`fixed bottom-0 left-0 right-0 bg-white p-6 rounded-t-2xl max-h-[80vh] overflow-y-auto transform transition-transform duration-300 ease-in-out ${activeTab ? 'translate-y-0' : 'translate-y-full'
                                } md:hidden`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {activeTabData.label}
                                </h3>
                                <button
                                    onClick={() => setActiveTab(null)}
                                    className="text-gray-500 hover:text-gray-800"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="prose prose-sm max-w-none">
                                {activeTabData.content}
                            </div>
                        </div>

                        {/* Desktop Drawer (Left Side) */}
                        <div
                            className={`hidden md:block fixed left-0 top-0 h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${activeTab ? 'translate-x-0' : '-translate-x-full'
                                } w-full max-w-lg`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="h-full flex flex-col">
                                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {activeTabData.label}
                                    </h3>
                                    <button
                                        onClick={() => setActiveTab(null)}
                                        className="text-gray-500 hover:text-gray-800"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="prose prose-base max-w-none">
                                        {activeTabData.content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Related Products */}
                {latestProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8">You May Also Like</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                            {latestProducts.slice(0, 5).map((item) => (
                                <Link
                                    key={item._id}
                                    href={`/shop/${item.slug}`}
                                    className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md"
                                >
                                    <div className="relative aspect-square">
                                        <Image
                                            src={item.mainImage}
                                            alt={item.mainImageAlt || item.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                        />
                                        {item.availability !== 'InStock' && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <span className="bg-red-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                                                    {item.availability === 'OutOfStock' ? 'Out of Stock' : 'Pre-Order'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-lg font-bold text-gray-800">
                                            ৳{(item.prices.find((p) => p.currency === 'BDT')?.amount || item.prices[0].amount).toLocaleString()}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Image Modal */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                            aria-label="Close modal"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="relative w-full max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                            <div className="relative aspect-square">
                                <Image
                                    src={selectedImage}
                                    alt={selectedImageAlt}
                                    fill
                                    className="object-contain"
                                    sizes="100vw"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <CartSlider isOpen={isCartOpen} setIsOpen={setIsCartOpen} conversionRates={conversionRates} />

                {/* Toast Styles */}
                <style jsx global>{`
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
                `}</style>
            </div>
        </div>
    );
}