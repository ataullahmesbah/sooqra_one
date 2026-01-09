'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/src/types/index';
import ProductCard from '@/src/components/products/ProductCard/ProductCard';
import Image from 'next/image';
import Link from 'next/link';

const SpecialOffersPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [featuredOffers, setFeaturedOffers] = useState([
        {
            id: 1,
            title: 'Flash Sale',
            description: 'Limited time deals ending soon',
            discount: 'Up to 70% OFF',
            color: 'bg-red-500',
            icon: '⚡',
            timeLeft: 'Ends in 2:15:30'
        },
        {
            id: 2,
            title: 'Weekend Special',
            description: 'Weekend exclusive discounts',
            discount: '50% OFF',
            color: 'bg-blue-500',
            icon: '🎉',
            timeLeft: 'Ends Sunday'
        },
        {
            id: 3,
            title: 'Clearance Sale',
            description: 'Last chance to buy',
            discount: 'Min 60% OFF',
            color: 'bg-purple-500',
            icon: '🔥',
            timeLeft: 'Limited Stock'
        }
    ]);

    // Filter options
    const filters = [
        { id: 'all', label: 'All Offers', count: 35 },
        { id: 'flash-sale', label: 'Flash Sale', count: 12 },
        { id: 'discount', label: 'Best Discounts', count: 18 },
        { id: 'clearance', label: 'Clearance', count: 8 },
        { id: 'bundle', label: 'Bundle Offers', count: 5 },
        { id: 'seasonal', label: 'Seasonal', count: 7 }
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Simulate API call
                const { getProducts } = await import('@/src/lib/data');
                const allProducts = await getProducts();
                
                // Filter products with discounts (simulated)
                const discountedProducts = allProducts.slice(0, 35).map(product => ({
                    ...product,
                    // Add discount property for demo
                    discountPercentage: Math.floor(Math.random() * 70) + 10
                }));
                
                setProducts(discountedProducts);
            } catch (error) {
                console.error('Error fetching offers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Timer for flash sale
    const [timeLeft, setTimeLeft] = useState({
        hours: 2,
        minutes: 15,
        seconds: 30
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else {
                    clearInterval(timer);
                    return prev;
                }
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="animate-pulse space-y-8">
                        {/* Header skeleton */}
                        <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
                        
                        {/* Filters skeleton */}
                        <div className="flex gap-4 mb-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
                            ))}
                        </div>
                        
                        {/* Products skeleton */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-64 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-white max-w-2xl">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                                Special Offers & Discounts
                            </h1>
                            <p className="text-lg md:text-xl mb-6 opacity-90">
                                Exclusive deals, flash sales, and limited-time offers. Save big on premium products!
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                    <div className="text-sm opacity-80">Flash Sale Ends In</div>
                                    <div className="text-2xl font-bold">
                                        {String(timeLeft.hours).padStart(2, '0')}:
                                        {String(timeLeft.minutes).padStart(2, '0')}:
                                        {String(timeLeft.seconds).padStart(2, '0')}
                                    </div>
                                </div>
                                <div className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold text-lg shadow-lg">
                                    Up to 70% OFF
                                </div>
                            </div>
                        </div>
                        <div className="relative w-full md:w-1/3">
                            <div className="relative h-64 md:h-80">
                                <Image
                                    src="/offers-banner.svg"
                                    alt="Special Offers"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Featured Offers */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Offers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {featuredOffers.map((offer) => (
                            <div
                                key={offer.id}
                                className={`${offer.color} rounded-2xl p-6 text-white shadow-lg transform transition-transform duration-300 hover:scale-[1.02]`}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-3xl">{offer.icon}</div>
                                    <div>
                                        <h3 className="text-xl font-bold">{offer.title}</h3>
                                        <p className="text-sm opacity-90">{offer.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold">{offer.discount}</div>
                                    <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                                        {offer.timeLeft}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2 md:gap-4">
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${activeFilter === filter.id
                                        ? 'bg-gray-900 text-white shadow-lg'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="font-medium">{filter.label}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${activeFilter === filter.id
                                        ? 'bg-white/20'
                                        : 'bg-gray-100'
                                    }`}>
                                    {filter.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Offer Categories */}
                <div className="mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Category 1 */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">🛒</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Buy More, Save More</h3>
                                    <p className="text-sm text-gray-600">Extra discount on bulk orders</p>
                                </div>
                            </div>
                            <Link
                                href="/offers/bulk"
                                className="inline-flex items-center text-green-700 font-medium hover:text-green-800"
                            >
                                Shop Now →
                            </Link>
                        </div>

                        {/* Category 2 */}
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6 border border-blue-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">🎁</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Free Gifts</h3>
                                    <p className="text-sm text-gray-600">Free products with purchase</p>
                                </div>
                            </div>
                            <Link
                                href="/offers/free-gifts"
                                className="inline-flex items-center text-blue-700 font-medium hover:text-blue-800"
                            >
                                View Gifts →
                            </Link>
                        </div>

                        {/* Category 3 */}
                        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">📦</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Bundle Deals</h3>
                                    <p className="text-sm text-gray-600">Perfect product combinations</p>
                                </div>
                            </div>
                            <Link
                                href="/offers/bundles"
                                className="inline-flex items-center text-purple-700 font-medium hover:text-purple-800"
                            >
                                Explore Bundles →
                            </Link>
                        </div>

                        {/* Category 4 */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-6 border border-orange-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">🏷️</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Limited Stock</h3>
                                    <p className="text-sm text-gray-600">Last few items at lowest prices</p>
                                </div>
                            </div>
                            <Link
                                href="/offers/clearance"
                                className="inline-flex items-center text-orange-700 font-medium hover:text-orange-800"
                            >
                                Grab Deals →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Discounted Products
                            <span className="text-red-600 ml-2">({products.length} items)</span>
                        </h2>
                        <div className="flex items-center gap-4">
                            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
                                <option>Sort by: Discount %</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Popularity</option>
                            </select>
                        </div>
                    </div>

                    {/* Products Grid - Responsive */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="relative">
                                {/* Super Discount Badge */}
                                <div className="absolute top-2 left-2 z-10">
                                    <div className="px-3 py-1 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                                        {Math.floor(Math.random() * 70) + 10}% OFF
                                    </div>
                                </div>
                                <ProductCard
                                    product={product}
                                    viewMode="grid"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="mt-16 mb-8">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-center text-white">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">
                            Get Exclusive Offers Directly
                        </h3>
                        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                            Subscribe to our newsletter and be the first to know about flash sales, 
                            special discounts, and new product launches.
                        </p>
                        <div className="max-w-md mx-auto">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                                />
                                <button className="px-6 py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors">
                                    Subscribe
                                </button>
                            </div>
                            <p className="text-sm text-gray-400 mt-3">
                                By subscribing, you agree to our Privacy Policy
                            </p>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Offer FAQs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h4 className="font-bold text-lg text-gray-900 mb-2">
                                How long do the offers last?
                            </h4>
                            <p className="text-gray-600">
                                Flash sales typically last 24-72 hours. Regular discounts may vary. 
                                Always check the product page for exact end dates.
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h4 className="font-bold text-lg text-gray-900 mb-2">
                                Can I combine multiple offers?
                            </h4>
                            <p className="text-gray-600">
                                Yes! You can combine seasonal offers with coupon codes. 
                                Maximum discount will be automatically applied at checkout.
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h4 className="font-bold text-lg text-gray-900 mb-2">
                                Are there any hidden charges?
                            </h4>
                            <p className="text-gray-600">
                                No hidden charges. All prices shown are final with discounts applied. 
                                Shipping charges may apply based on location.
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h4 className="font-bold text-lg text-gray-900 mb-2">
                                How often are new offers added?
                            </h4>
                            <p className="text-gray-600">
                                New offers are added weekly. Follow us on social media or subscribe 
                                to our newsletter for instant updates.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecialOffersPage;