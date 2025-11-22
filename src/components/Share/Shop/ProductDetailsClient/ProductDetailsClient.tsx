'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { CiDeliveryTruck } from "react-icons/ci";
import CartSlider from '../CartSlider/CartSlider';

// Interface definitions
interface Product {
    _id: string;
    title: string;
    slug: string;
    mainImage: string;
    mainImageAlt?: string;
    additionalImages: Array<{
        url: string;
        alt?: string;
    }>;
    prices: Array<{
        currency: string;
        amount: number;
    }>;
    quantity: number;
    availability: string;
    productType: 'Own' | 'Affiliate';
    sizeRequirement?: 'Optional' | 'Mandatory';
    sizes?: Array<{
        name: string;
        quantity: number;
    }>;
    brand?: string;
    category?: {
        name: string;
    };
    product_code?: string;
    isGlobal?: boolean;
    targetCity?: string;
    targetCountry?: string;
    aggregateRating?: {
        ratingValue: number;
        reviewCount: number;
    };
    shortDescription?: string;
    description: string;
    descriptions?: string[];
    bulletPoints?: string[];
    specifications?: Array<{
        name: string;
        value: string;
    }>;
    faqs?: Array<{
        question: string;
        answer: string;
    }>;
    affiliateLink?: string;
}

interface ConversionRates {
    USD: number;
    EUR: number;
    BDT: number;
    [key: string]: number;
}

interface ProductDetailsClientProps {
    product: Product;
    latestProducts: Product[];
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
    const [selectedImage, setSelectedImage] = useState(product.mainImage);
    const [selectedImageAlt, setSelectedImageAlt] = useState(product.mainImageAlt || product.title);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currency, setCurrency] = useState('BDT');
    const [quantity, setQuantity] = useState(1);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [conversionRates, setConversionRates] = useState<ConversionRates>({ USD: 123, EUR: 135, BDT: 1 });
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();
    const [selectedSize, setSelectedSize] = useState<{ name: string; quantity: number } | null>(null);
    const [showSizeError, setShowSizeError] = useState(false);

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
        image: [product.mainImage, ...product.additionalImages.map((img) => img.url)],
        description: product.description,
        brand: { '@type': 'Brand', name: product.brand || 'Ataullah Mesbah' },
        sku: product.product_code,
        offers: {
            '@type': 'Offer',
            priceCurrency: 'BDT',
            price: product.prices.find((p) => p.currency === 'BDT')?.amount || 0,
            availability: `https://schema.org/${product.availability || 'InStock'}`,
            url: `${process.env.NEXTAUTH_URL}/shop/${product.slug}`,
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

    const faqStructuredData = product.faqs && product.faqs.length > 0
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
            const existingItem = cart.find((item) => item._id === product._id && (!item.size || item.size === selectedSize?.name));
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
                cart.push({ ...existingItem, quantity: newQuantity, size: selectedSize?.name });
                showCustomToast(`Cart updated with ${newQuantity} units of ${product.title}`, 'success');
            } else {
                const priceObj = product.prices.find((p) => p.currency === 'BDT') || product.prices[0];
                const priceInBDT = priceObj.currency === 'BDT' ? priceObj.amount : priceObj.amount * (conversionRates[priceObj.currency] || 1);
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
            window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
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
            const filteredCart = cart.filter((item) => item._id !== product._id || (item.size && item.size !== selectedSize?.name));
            const priceObj = product.prices.find((p) => p.currency === 'BDT') || product.prices[0];
            const priceInBDT = priceObj.currency === 'BDT' ? priceObj.amount : priceObj.amount * (conversionRates[priceObj.currency] || 1);

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
        const priceInBDT = priceObj.currency === 'BDT' ? priceObj.amount : priceObj.amount * (conversionRates[priceObj.currency] || 1);
        const total = priceInBDT * quantity;
        const symbol = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : '€';
        return `${symbol}${new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(currency === 'BDT' ? total : total / (conversionRates[currency] || 1))}`;
    };

    interface Tab {
        id: string;
        label: string;
        content: React.ReactNode;
    }

    const tabs: Tab[] = [
        {
            id: 'product-details',
            label: 'Product Details',
            content: (
                <div className="space-y-6">
                    {product.shortDescription && (
                        <div>
                            <h4 className="text-md amsfonts text-white mb-2">Quick Overview</h4>
                            <p className="text-gray-300 text-sm">{product.shortDescription}</p>
                        </div>
                    )}
                    {product.description && (
                        <div>
                            <h4 className="text-md amsfonts text-white mb-2">Description</h4>
                            <p className="text-gray-300 text-sm">{product.description}</p>
                        </div>
                    )}
                    {product.descriptions && product.descriptions.length > 0 && (
                        <div>
                            <h4 className="text-md amsfonts text-white mb-2">Additional Information</h4>
                            {product.descriptions.map((desc, index) => (
                                <p key={index} className="text-gray-300 text-sm mb-2">{desc}</p>
                            ))}
                        </div>
                    )}
                    {product.bulletPoints && product.bulletPoints.length > 0 && (
                        <div>
                            <h4 className="text-md amsfonts text-white mb-2">Key Features</h4>
                            <ul className="space-y-2 text-gray-300 text-sm">
                                {product.bulletPoints.map((point, index) => (
                                    <li key={index} className="flex items-start">
                                        <svg className="w-4 h-4 text-purple-400 mr-2 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                <table className="w-full text-sm text-gray-300">
                    <tbody>
                        {product.specifications.map((spec, index) => (
                            <tr key={index} className="border-b border-gray-700">
                                <td className="py-2 pr-4 font-medium">{spec.name}</td>
                                <td className="py-2">{spec.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ),
        }] : []),
        ...(product.faqs && product.faqs.length > 0 ? [{
            id: 'faqs',
            label: 'FAQs',
            content: (
                <div className="space-y-4">
                    {product.faqs.map((faq, index) => (
                        <div key={index}>
                            <h4 className="text-sm font-medium text-purple-300 bg-gray-700 p-2 rounded-md">{faq.question}</h4>
                            <p className="text-gray-300 text-sm mt-1">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            ),
        }] : [])
    ];

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            {faqStructuredData && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
            )}

            <nav className="flex mb-6" aria-label="Breadcrumb">
                {/* Mobile View - Two Lines with proper responsive handling */}
                <div className="block md:hidden w-full">
                    {/* First Line - SOOQRA ONE > HOME > SHOP */}
                    <div className="flex items-center space-x-1 mb-2 flex-wrap">
                        <div className="flex items-center">
                            <h2 className="text-sm font-medium text-gray-200 whitespace-nowrap">SOOQRA ONE</h2>
                        </div>
                        <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <Link href="/" className="text-sm font-medium text-gray-400 hover:text-white whitespace-nowrap">
                            Home
                        </Link>
                        <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <Link href="/shop" className="text-sm font-medium text-gray-400 hover:text-white whitespace-nowrap">
                            Shop
                        </Link>
                    </div>

                    {/* Second Line - Product Title with responsive text handling */}
                    <div className="flex items-center min-w-0">
                        <svg className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span
                            className="text-sm font-medium text-white truncate block min-w-0"
                            title={product.title}
                        >
                            {product.title}
                        </span>
                    </div>
                </div>

                {/* Desktop View - Original Single Line */}
                <div className="hidden md:block">
                    <ol className="inline-flex items-center space-x-1 md:space-x-2 flex-wrap">
                        <li className="flex items-center">
                            <div className="flex items-center">
                                <h2 className="ml-1 text-sm font-medium text-gray-200 hover:text-white whitespace-nowrap">
                                    SOOQRA ONE
                                </h2>
                            </div>
                        </li>

                        <li className="inline-flex items-center">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white whitespace-nowrap">
                                Home
                            </Link>
                        </li>
                        <li className="flex items-center">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                <Link href="/shop" className="ml-1 text-sm font-medium text-gray-400 hover:text-white whitespace-nowrap">
                                    Shop
                                </Link>
                            </div>
                        </li>
                        <li aria-current="page" className="flex items-center min-w-0">
                            <div className="flex items-center min-w-0">
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-1 text-sm font-medium text-white truncate max-w-xs lg:max-w-md xl:max-w-lg" title={product.title}>
                                    {product.title}
                                </span>
                            </div>
                        </li>
                    </ol>
                </div>
            </nav>

            <div className="">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
                    <div className="space-y-3">
                        <div
                            className="relative w-full max-w-md mx-auto rounded-md overflow-hidden bg-gray-800 shadow-sm cursor-zoom-in"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Image
                                src={selectedImage}
                                alt={selectedImageAlt}
                                width={448}
                                height={448}
                                className="object-contain bg-gray-800"
                                priority
                                sizes="(max-width: 640px) 100vw, 448px"
                            />
                            {product.availability !== 'InStock' && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold">
                                        {product.availability === 'OutOfStock' ? 'Out of Stock' : 'Pre-Order'}
                                    </span>
                                </div>
                            )}
                        </div>
                        {(product.additionalImages.length > 0 || product.mainImage) && (
                            <div className="w-full max-w-md mx-auto">
                                <div className="grid grid-cols-5 gap-2">
                                    {[{ url: product.mainImage, alt: product.mainImageAlt || product.title }, ...product.additionalImages].map(
                                        (img, index) => (
                                            <div
                                                key={index}
                                                className={`relative aspect-square rounded-md overflow-hidden cursor-pointer transition-transform duration-200 ${selectedImage === img.url ? 'ring-2 ring-purple-500' : 'hover:ring-2 hover:ring-purple-300 hover:scale-105'
                                                    }`}
                                                onClick={() => {
                                                    setSelectedImage(img.url);
                                                    setSelectedImageAlt(img.alt || '');
                                                }}
                                            >
                                                <Image
                                                    src={img.url}
                                                    alt={img.alt || `${product.title} thumbnail ${index + 1}`}
                                                    width={80}
                                                    height={80}
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {product.title} - {product.category?.name || ''}
                            </h1>
                            {product.brand && <p className="text-sm text-gray-400 mt-1">Brand: {product.brand}</p>}
                            {product.category && (
                                <span className="inline-block mt-2 px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs">
                                    {product.category.name}
                                </span>
                            )}
                            {product.aggregateRating?.ratingValue && (
                                <div className="mt-2 flex items-center">
                                    <span className="text-yellow-400">{'★'.repeat(Math.round(product.aggregateRating.ratingValue))}</span>
                                    <span className="ml-2 text-sm text-gray-400">
                                        ({product.aggregateRating.ratingValue} from {product.aggregateRating.reviewCount || 0} reviews)
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="bg-purple-900/20 p-4 rounded-lg w-full">
                            <div className="flex flex-wrap items-center gap-4">
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
                                >
                                    {product.prices.map((price) => (
                                        <option key={price.currency} value={price.currency}>
                                            {price.currency}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-2xl font-bold text-white">{getPriceDisplay()}</span>
                            </div>
                        </div>

                        {product.productType === 'Own' && product.sizeRequirement === 'Mandatory' && product.sizes && product.sizes.length > 0 && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-300">Size:</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {product.sizes
                                        .filter((size) => size.quantity > 0)
                                        .map((size, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSelectedSize(size);
                                                    setShowSizeError(false);
                                                }}
                                                className={`px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200 border ${selectedSize?.name === size.name
                                                    ? 'bg-purple-600 text-white border-purple-600'
                                                    : 'border-gray-500 text-gray-300 hover:bg-purple-500/10 hover:border-purple-500'
                                                    }`}
                                            >
                                                {size.name}
                                            </button>
                                        ))}
                                </div>
                                {showSizeError && <p className="text-sm text-red-400">Please select a size before adding to cart</p>}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-300">Quantity:</label>
                            <select
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                disabled={product.availability !== 'InStock' || product.productType === 'Affiliate'}
                                className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm"
                            >
                                {[...Array(Math.min(product.quantity || 3, 3))].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {product.availability !== 'InStock' && product.productType !== 'Affiliate' ? (
                            <div className="p-3 bg-red-900/20 text-red-300 rounded-md text-sm">
                                {product.availability === 'OutOfStock' ? 'Currently Out of Stock' : 'Available for Pre-Order'}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-4">
                                {product.productType !== 'Affiliate' && (
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.availability !== 'InStock'}
                                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-md font-medium text-white transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                        Add to Cart
                                    </button>
                                )}
                                <button
                                    onClick={handleBuyNow}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-800 hover:to-purple-900 rounded-md font-medium text-white transition-all flex items-center gap-2"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    {product.productType === 'Affiliate' ? 'Buy on Affiliate Site' : 'Buy Now'}
                                </button>
                            </div>
                        )}

                        <div>
                            <div className="text-xs flex items-center gap-2 text-gray-200">
                                <p className="text-lg text-gray-100">
                                    <CiDeliveryTruck />
                                </p>
                                <p>Delivery time: 3 - 7 business days</p>
                            </div>
                            <p className="text-xs text-gray-200">Product Code: {product.product_code || 'N/A'}</p>
                            <p className="text-xs text-gray-200">
                                Availability: {product.availability === 'InStock' ? `In Stock (${product.quantity} available)` : product.availability}
                            </p>
                            <div className="text-xs text-gray-200">
                                <p>Available in: {product.isGlobal ? 'Worldwide' : `${product.targetCity}, ${product.targetCountry}`}</p>
                            </div>
                        </div>

                        {tabs.length > 0 && (
                            <div className="pt-4 border-t border-gray-700">
                                <div className="flex flex-col gap-2">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex justify-between items-center px-4 py-2 rounded-md text-sm font-medium transition-colors bg-gray-700 text-gray-300 hover:bg-purple-500 hover:text-white`}
                                            aria-controls={`drawer-${tab.id}`}
                                            aria-expanded={activeTab === tab.id}
                                        >
                                            {tab.label}
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {activeTab && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:bg-transparent md:right-0 md:top-0 md:bottom-0 md:w-1/3 md:min-w-[300px] md:max-w-[400px]"
                    onClick={() => (!isMobile ? setActiveTab(null) : null)}
                >
                    <div
                        className={`fixed bottom-0 left-0 right-0 bg-gray-800 p-6 rounded-t-xl md:rounded-none md:right-0 md:top-0 md:bottom-0 md:w-1/3 md:min-w-[300px] md:max-w-[400px] transform transition-transform duration-300 ease-in-out ${activeTab ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-labelledby={`drawer-title-${activeTab}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 id={`drawer-title-${activeTab}`} className="text-lg amsfonts uppercase text-white">
                                {tabs.find((tab) => tab.id === activeTab)?.label}
                            </h3>
                            <button
                                onClick={() => setActiveTab(null)}
                                className="text-gray-400 hover:text-white focus:outline-none"
                                aria-label="Close drawer"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="max-h-[90vh] overflow-y-auto">{tabs.find((tab) => tab.id === activeTab)?.content}</div>
                    </div>
                </div>
            )}

            {latestProducts.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-xl font-semibold text-white mb-6">You May Also Like</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {latestProducts.slice(0, 5).map((item) => (
                            <Link
                                key={item._id}
                                href={`/shop/${item.slug}`}
                                className="group bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-colors flex flex-col h-full"
                            >
                                <div className="relative aspect-square flex-1">
                                    <Image
                                        src={item.mainImage}
                                        alt={item.mainImageAlt || item.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                                    />
                                    {item.availability !== 'InStock' && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="bg-red-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                                                {item.availability === 'OutOfStock' ? 'Out of Stock' : 'Pre-Order'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 mt-auto">
                                    <h3 className="text-sm font-medium text-white line-clamp-2">{item.title}</h3>
                                    <p className="text-purple-400 font-semibold mt-1 text-sm">
                                        ৳{getPriceInBDT(item.prices.find((p) => p.currency === 'BDT')?.amount || item.prices[0].amount, item.prices[0].currency).toLocaleString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
                    <div className="relative max-w-4xl w-full">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 focus:outline-none"
                            aria-label="Close modal"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="relative aspect-square w-full">
                            <Image src={selectedImage} alt={selectedImageAlt} fill className="object-contain" sizes="100vw" />
                        </div>
                    </div>
                </div>
            )}

            <CartSlider isOpen={isCartOpen} setIsOpen={setIsCartOpen} conversionRates={conversionRates} />

            <style jsx global>{`
                .custom-toast-slider {
                    position: fixed;
                    top: 24px;
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
        </div>
    );
}