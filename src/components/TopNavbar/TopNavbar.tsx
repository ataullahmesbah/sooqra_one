'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaSearch, FaUser, FaBars, FaTimes, FaStore } from 'react-icons/fa';
import CartSlider from '../Share/Shop/CartSlider/CartSlider';


// Interface definitions
interface SearchResult {
    _id: string;
    title: string;
    slug: string;
    mainImage: string;
    mainImageAlt: string;
    bdtPrice: number;
    category: {
        name: string;
    };
}

interface ConversionRates {
    USD: number;
    EUR: number;
    BDT: number;
    [key: string]: number;
}

export default function TopNavbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [conversionRates] = useState<ConversionRates>({
        USD: 0.0091,
        EUR: 0.0084,
        BDT: 1
    });

    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Update cart count from localStorage
    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
            setCartCount(totalItems);
        };

        updateCartCount();
        window.addEventListener('storage', updateCartCount);
        window.addEventListener('cartUpdated', updateCartCount);

        return () => {
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search function
    const searchProducts = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=8`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
                setShowSearchResults(true);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounce effect for search
    useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, searchProducts]);

    // handleSearchSubmit function update করুন:
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setShowSearchResults(false);
        }
    };



    const handleResultClick = (slug: string) => {
        router.push(`/shop/${slug}`);
        setSearchQuery('');
        setShowSearchResults(false);
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Navigation links
    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Shop', href: '/shop' },
        { name: 'Categories', href: '/categories' },
        { name: 'Deals', href: '/deals' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <>
            {/* Main Navbar */}
            <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Brand Name - Left */}
                        <div className="flex items-center space-x-3">
                            <Link href="/" className="flex items-center space-x-3 group">
                                {/* E-commerce Icon */}
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                                        <FaStore className="text-white text-xl" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                                </div>

                                {/* Brand Name with Stylish Font */}
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-['Poppins'] tracking-tight">
                                        SOOQRA ONE
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-[-4px]">
                                        Premium Marketplace
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Search Bar - Middle (Desktop only) */}
                        <div className="hidden lg:block flex-1 max-w-2xl mx-8">
                            <div className="relative" ref={searchRef}>
                                <form onSubmit={handleSearchSubmit}>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search for products like attar 2025, honeynuts, sports shirt..."
                                            className="w-full px-4 pl-12 py-3 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                        />
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <FaSearch />
                                        </div>
                                        <button
                                            type="submit"
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:from-purple-700 hover:to-blue-600 transition-all duration-300"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </form>

                                {/* Search Results Dropdown */}
                                <AnimatePresence>
                                    {showSearchResults && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50"
                                        >
                                            {isSearching ? (
                                                <div className="p-4 text-center">
                                                    <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <p className="text-gray-400 mt-2 text-sm">Searching...</p>
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                <>
                                                    <div className="max-h-96 overflow-y-auto">
                                                        {searchResults.map((product) => (
                                                            <div
                                                                key={product._id}
                                                                onClick={() => handleResultClick(product.slug)}
                                                                className="flex items-center p-3 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0"
                                                            >
                                                                <div className="w-12 h-12 relative flex-shrink-0 mr-3">
                                                                    <Image
                                                                        src={product.mainImage}
                                                                        alt={product.mainImageAlt}
                                                                        width={48}
                                                                        height={48}
                                                                        className="object-cover rounded-md"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-white text-sm font-medium truncate">{product.title}</p>
                                                                    <div className="flex items-center justify-between mt-1">
                                                                        <span className="text-xs text-gray-400">{product.category.name}</span>
                                                                        <span className="text-sm font-bold text-purple-300">
                                                                            ৳{product.bdtPrice.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="p-3 border-t border-gray-700 bg-gray-900">
                           // Search results dropdown এ "View all results" button 
                                                        <button
                                                            onClick={() => {
                                                                router.push(`/shop/search?q=${encodeURIComponent(searchQuery)}`);
                                                                setShowSearchResults(false);
                                                            }}
                                                            className="w-full text-center text-purple-400 hover:text-purple-300 text-sm font-medium py-2"
                                                        >
                                                            View all results →
                                                        </button>
                                                    </div>
                                                </>
                                            ) : searchQuery.trim() ? (
                                                <div className="p-4 text-center">
                                                    <p className="text-gray-400">No products found</p>
                                                    <p className="text-gray-500 text-sm mt-1">Try different keywords</p>
                                                </div>
                                            ) : null}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-6">
                            {/* Sign In / Account (Desktop) */}
                            <div className="hidden lg:block">
                                <Link
                                    href="/signin"
                                    className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors group"
                                >
                                    <div className="relative">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center group-hover:from-purple-900 group-hover:to-purple-800 transition-all duration-300">
                                            <FaUser className="text-lg" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">Sign In</span>
                                        <span className="text-xs text-gray-400">Your Account</span>
                                    </div>
                                </Link>
                            </div>

                            {/* Cart Icon (Desktop) */}
                            <div className="hidden lg:block">
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="relative group"
                                    aria-label="Shopping Cart"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center group-hover:from-purple-900 group-hover:to-purple-800 transition-all duration-300">
                                        <FaShoppingCart className="text-xl" />
                                    </div>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-bounce">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Mobile Menu and Cart */}
                            <div className="lg:hidden flex items-center space-x-4">
                                {/* Search Icon for Mobile */}
                                <button
                                    onClick={() => router.push('/search')}
                                    className="text-white hover:text-purple-300"
                                    aria-label="Search"
                                >
                                    <FaSearch className="text-xl" />
                                </button>

                                {/* Cart Icon for Mobile */}
                                {cartCount > 0 && (
                                    <button
                                        onClick={() => setIsCartOpen(true)}
                                        className="relative"
                                        aria-label="Shopping Cart"
                                    >
                                        <FaShoppingCart className="text-2xl text-white" />
                                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                                            {cartCount}
                                        </span>
                                    </button>
                                )}

                                {/* Mobile Menu Toggle */}
                                <button
                                    onClick={toggleMobileMenu}
                                    className="text-white focus:outline-none"
                                    aria-label="Toggle Menu"
                                >
                                    {isMobileMenuOpen ? (
                                        <FaTimes className="text-2xl" />
                                    ) : (
                                        <FaBars className="text-2xl" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar (when menu is open) */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-700 px-4 py-3 bg-gray-800">
                        <div className="relative">
                            <form onSubmit={handleSearchSubmit}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search products..."
                                        className="w-full px-4 pl-12 py-3 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <FaSearch />
                                    </div>
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-medium"
                                    >
                                        Go
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden bg-gradient-to-b from-gray-800 to-gray-900 border-t border-gray-700 overflow-hidden"
                        >
                            <div className="container mx-auto px-4 py-4">
                                {/* Navigation Links */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="px-4 py-3 text-white hover:bg-gray-700 rounded-lg text-center transition-colors font-medium"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>

                                {/* Account Section */}
                                <div className="mb-6">
                                    <Link
                                        href="/signin"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center space-x-3 px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                                            <FaUser className="text-lg text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">Sign In</p>
                                            <p className="text-gray-400 text-sm">Access your account</p>
                                        </div>
                                    </Link>
                                </div>

                                {/* Quick Categories */}
                                <div className="mb-6">
                                    <h3 className="text-gray-400 text-sm font-medium mb-3 px-1">Popular Categories</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports', 'Books'].map((cat) => (
                                            <span
                                                key={cat}
                                                className="px-3 py-2 bg-gray-700 text-gray-300 text-sm rounded-full hover:bg-gray-600 cursor-pointer transition-colors"
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="pt-4 border-t border-gray-700">
                                    <div className="text-center text-gray-400 text-sm">
                                        <p>Need help? Call us: <span className="text-purple-400 font-medium">+880 1234 567890</span></p>
                                        <p className="mt-1">24/7 Customer Support</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Cart Slider */}
            <CartSlider
                isOpen={isCartOpen}
                setIsOpen={setIsCartOpen}
                conversionRates={conversionRates}
            />

            {/* Search API Route Example (create this file) */}
            {/* 
        // app/api/products/search/route.ts
        export async function GET(request: Request) {
          const { searchParams } = new URL(request.url);
          const query = searchParams.get('q');
          const limit = parseInt(searchParams.get('limit') || '8');

          if (!query) {
            return Response.json([], { status: 200 });
          }

          try {
            const products = await Product.find({
              $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { keywords: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
              ]
            })
            .limit(limit)
            .populate('category', 'name')
            .select('title slug mainImage mainImageAlt prices category')
            .lean();

            // Add bdtPrice field
            const results = products.map(product => ({
              ...product,
              bdtPrice: product.prices.find((p: any) => p.currency === 'BDT')?.amount || 0
            }));

            return Response.json(results, { status: 200 });
          } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 });
          }
        }
      */}

            {/* Global Styles for Toast (add to global.css) */}
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        
        /* Toast Styles */
        .custom-toast-slider {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          transform: translateX(100%);
          transition: transform 0.3s ease-in-out;
        }
        
        .custom-toast-slider.show {
          transform: translateX(0);
        }
        
        .custom-toast-success {
          background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .custom-toast-error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        .custom-toast-info {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }
        
        .toast-content {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 12px;
          color: white;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          min-width: 300px;
          max-width: 400px;
        }
        
        .toast-icon {
          width: 20px;
          height: 20px;
          margin-right: 12px;
          flex-shrink: 0;
        }
        
        .toast-message {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
        }
        
        .toast-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          padding: 4px;
          margin-left: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .toast-close:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
        </>
    );
}