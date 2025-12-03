'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaShoppingCart,
    FaSearch,
    FaUser,
    FaBars,
    FaTimes,
    FaStore,
    FaSignOutAlt,
    FaCaretDown,
    FaHome,
    FaShoppingBag,
    FaTags,
    FaFire,
    FaInfoCircle,
    FaPhone,
    FaTachometerAlt,
    FaUserShield,
    FaUserCheck,
    FaBox,
    FaHeart,
    FaCog
} from 'react-icons/fa';
import { signOut, useSession } from 'next-auth/react';
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
        _id: string;
        name: string;
        slug: string;
    };
    brand: string;
    availability: string;
}

interface ConversionRates {
    USD: number;
    EUR: number;
    BDT: number;
    [key: string]: number;
}

interface Category {
    _id: string;
    name: string;
    slug: string;
}

export default function TopNavbar() {
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [conversionRates] = useState<ConversionRates>({
        USD: 0.0091,
        EUR: 0.0084,
        BDT: 1
    });

    const searchRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/products?type=categories');
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

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

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Enhanced search function
    const searchProducts = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=6`);

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSearchResults(data.data);
                    setShowSearchResults(true);
                }
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

    // Handle search submit
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

    const handleCategoryClick = (categorySlug: string) => {
        router.push(`/categories/${categorySlug}`);
        setSearchQuery('');
        setShowSearchResults(false);
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        setShowUserMenu(false);
        router.push('/');
        router.refresh();
    };

    // Get user display name (first name only)
    const getUserDisplayName = () => {
        if (!session?.user) return '';

        if (session.user.name) {
            const names = session.user.name.split(' ');
            return names[0];
        }

        return session.user.email?.split('@')[0] || 'User';
    };

    // Get user role badge color
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-600 text-white';
            case 'moderator': return 'bg-blue-600 text-white';
            case 'user': return 'bg-gray-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    };

    // Navigation links
    const navLinks = [
        { name: 'Home', href: '/', icon: <FaHome /> },
        { name: 'Shop', href: '/shop', icon: <FaShoppingBag /> },
        { name: 'Categories', href: '/categories', icon: <FaTags /> },
        { name: 'Deals', href: '/deals', icon: <FaFire /> },
        { name: 'About', href: '/about', icon: <FaInfoCircle /> },
        { name: 'Contact', href: '/contact', icon: <FaPhone /> },
    ];

    // Dashboard links based on user role
    const getDashboardLinks = () => {
        if (!session?.user?.role) return [];

        const links = [];

        if (session.user.role === 'admin') {
            links.push(
                { name: 'Admin Dashboard', href: '/admin-dashboard', icon: <FaTachometerAlt /> },
                { name: 'Manage Products', href: '/admin-dashboard/shop/all-products', icon: <FaBox /> },
                { name: 'Manage Users', href: '/admin-dashboard/users', icon: <FaUserShield /> }
            );
        } else if (session.user.role === 'moderator') {
            links.push(
                { name: 'Moderator Panel', href: '/moderator', icon: <FaTachometerAlt /> },
                { name: 'Manage Content', href: '/moderator/content', icon: <FaBox /> }
            );
        }

        return links;
    };

    // User profile links
    const userProfileLinks = [
        { name: 'My Profile', href: '/account', icon: <FaUser /> },
        { name: 'My Orders', href: '/account/orders', icon: <FaShoppingBag /> },
        { name: 'Wishlist', href: '/account/wishlist', icon: <FaHeart /> },
        { name: 'Settings', href: '/account/settings', icon: <FaCog /> },
    ];

    return (
        <>
            {/* Main Navbar - bg-gray-100 background */}
            <nav className="bg-gradient-to-r from-gray-100 to-gray-50 shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Brand Name - Left */}
                        <div className="flex items-center space-x-3">
                            <Link href="/" className="flex items-center space-x-3 group">
                                {/* Store Icon */}
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-md">
                                        <FaStore className="text-white text-xl" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full animate-pulse"></div>
                                </div>

                                {/* Brand Name */}
                                <div className="flex flex-col">
                                    <span className="text-2xl font-extrabold text-gray-900 font-['Poppins'] tracking-tight">
                                        SOOQRA ONE
                                    </span>
                                    <span className="text-[10px] text-gray-600 font-medium tracking-wider uppercase mt-[-4px]">
                                        Premium E-Commerce
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
                                            placeholder="Search products, brands, categories..."
                                            className="w-full px-4 pl-12 py-3 bg-white border-2 border-gray-300 rounded-full text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all duration-300 shadow-sm"
                                        />
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">
                                            <FaSearch />
                                        </div>
                                        <button
                                            type="submit"
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:from-gray-900 hover:to-black transition-all duration-300 shadow-md hover:shadow-lg"
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
                                            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
                                        >
                                            {isSearching ? (
                                                <div className="p-4 text-center">
                                                    <div className="inline-block w-6 h-6 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                                                    <p className="text-gray-600 mt-2 text-sm font-medium">Searching...</p>
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                <>
                                                    <div className="divide-y divide-gray-100">
                                                        {searchResults.map((product) => (
                                                            <div
                                                                key={product._id}
                                                                onClick={() => handleResultClick(product.slug)}
                                                                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                                            >
                                                                <div className="w-12 h-12 relative flex-shrink-0 mr-3 rounded-md overflow-hidden border border-gray-200">
                                                                    <Image
                                                                        src={product.mainImage}
                                                                        alt={product.mainImageAlt}
                                                                        width={48}
                                                                        height={48}
                                                                        className="object-cover"
                                                                    />
                                                                    {product.availability !== 'InStock' && (
                                                                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                                                            <span className="text-[10px] font-bold text-red-600 bg-white/90 px-1 rounded">OUT</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-gray-900 text-sm font-semibold truncate">{product.title}</p>
                                                                    <div className="flex items-center justify-between mt-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                                {product.category.name}
                                                                            </span>
                                                                            <span className="text-xs text-gray-500">{product.brand}</span>
                                                                        </div>
                                                                        <span className="text-sm font-bold text-gray-900">
                                                                            ৳{product.bdtPrice.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                                                        <button
                                                            onClick={() => {
                                                                router.push(`/shop/search?q=${encodeURIComponent(searchQuery)}`);
                                                                setShowSearchResults(false);
                                                            }}
                                                            className="w-full text-center text-gray-800 hover:text-gray-900 text-sm font-semibold py-2 flex items-center justify-center gap-2"
                                                        >
                                                            View all results
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </>
                                            ) : searchQuery.trim() ? (
                                                <div className="p-4 text-center">
                                                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <FaSearch className="text-gray-500" />
                                                    </div>
                                                    <p className="text-gray-800 font-medium mb-1">No results found</p>
                                                    <p className="text-gray-600 text-sm">Try different keywords or check spelling</p>
                                                </div>
                                            ) : null}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-6">
                            {/* User Menu (Desktop) */}
                            <div className="hidden lg:block relative" ref={userMenuRef}>
                                {session?.user ? (
                                    <div className="relative">
                                        <button
                                            onClick={toggleUserMenu}
                                            className="flex items-center space-x-2 text-gray-800 hover:text-gray-900 transition-colors group"
                                        >
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-300 flex items-center justify-center group-hover:from-gray-300 group-hover:to-gray-400 group-hover:border-gray-400 transition-all duration-300 shadow-sm">
                                                    <FaUser className="text-lg text-gray-700" />
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getRoleBadgeColor(session.user.role)} rounded-full border-2 border-white text-[10px] font-bold flex items-center justify-center`}>
                                                    {session.user.role.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</span>
                                                <span className="text-xs text-gray-600 capitalize">{session.user.role}</span>
                                            </div>
                                            <FaCaretDown className={`text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* User Dropdown Menu */}
                                        <AnimatePresence>
                                            {showUserMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                                >
                                                    {/* User Info */}
                                                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-300 flex items-center justify-center">
                                                                <FaUser className="text-xl text-gray-700" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 truncate">{session.user.name}</p>
                                                                <p className="text-xs text-gray-600 truncate">{session.user.email}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={`text-xs ${getRoleBadgeColor(session.user.role)} px-2 py-0.5 rounded-full`}>
                                                                        {session.user.role}
                                                                    </span>
                                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${session.user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                        }`}>
                                                                        {session.user.isActive ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Dashboard Links (Admin/Moderator only) */}
                                                    {getDashboardLinks().length > 0 && (
                                                        <div className="py-2 border-b border-gray-100">
                                                            <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                                Dashboard
                                                            </h4>
                                                            {getDashboardLinks().map((link) => (
                                                                <Link
                                                                    key={link.name}
                                                                    href={link.href}
                                                                    onClick={() => setShowUserMenu(false)}
                                                                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                                                >
                                                                    <span className="text-gray-600">{link.icon}</span>
                                                                    <span>{link.name}</span>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Profile Links */}
                                                    <div className="py-2">
                                                        <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                            My Account
                                                        </h4>
                                                        {userProfileLinks.map((link) => (
                                                            <Link
                                                                key={link.name}
                                                                href={link.href}
                                                                onClick={() => setShowUserMenu(false)}
                                                                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                                            >
                                                                <span className="text-gray-600">{link.icon}</span>
                                                                <span>{link.name}</span>
                                                            </Link>
                                                        ))}
                                                    </div>

                                                    {/* Sign Out */}
                                                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                                                        <button
                                                            onClick={handleSignOut}
                                                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg text-sm font-semibold hover:from-gray-900 hover:to-black transition-all duration-300 shadow-sm"
                                                        >
                                                            <FaSignOutAlt />
                                                            <span>Sign Out</span>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <Link
                                        href="/auth/signin"
                                        className="flex items-center space-x-2 text-gray-800 hover:text-gray-900 transition-colors group"
                                    >
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-300 flex items-center justify-center group-hover:from-gray-300 group-hover:to-gray-400 group-hover:border-gray-400 transition-all duration-300 shadow-sm">
                                                <FaUser className="text-lg text-gray-700" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">Sign In</span>
                                            <span className="text-xs text-gray-600">Your Account</span>
                                        </div>
                                    </Link>
                                )}
                            </div>

                            {/* Cart Icon (Desktop) */}
                            <div className="hidden lg:block">
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="relative group"
                                    aria-label="Shopping Cart"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-300 flex items-center justify-center group-hover:from-gray-300 group-hover:to-gray-400 group-hover:border-gray-400 transition-all duration-300 shadow-sm">
                                        <FaShoppingCart className="text-xl text-gray-700 group-hover:text-gray-900" />
                                    </div>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Mobile Menu and Cart */}
                            <div className="lg:hidden flex items-center space-x-4">
                                {/* Search Icon for Mobile */}
                                <button
                                    onClick={() => router.push('/shop/search')}
                                    className="text-gray-700 hover:text-gray-900"
                                    aria-label="Search"
                                >
                                    <FaSearch className="text-xl" />
                                </button>

                                {/* Cart Icon for Mobile */}
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="relative"
                                    aria-label="Shopping Cart"
                                >
                                    <FaShoppingCart className="text-xl text-gray-700" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border border-white">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>

                                {/* Mobile Menu Toggle */}
                                <button
                                    onClick={toggleMobileMenu}
                                    className="text-gray-700 hover:text-gray-900 focus:outline-none"
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
                    <div className="lg:hidden border-t border-gray-200 px-4 py-3 bg-white">
                        <div className="relative">
                            <form onSubmit={handleSearchSubmit}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search products..."
                                        className="w-full px-4 pl-12 py-3 bg-gray-50 border-2 border-gray-300 rounded-full text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                                    />
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">
                                        <FaSearch />
                                    </div>
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-semibold"
                                    >
                                        Go
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Mobile Menu */}
                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden bg-white border-t border-gray-200 overflow-hidden"
                        >
                            <div className="container mx-auto px-4 py-4">
                                {/* User Info for Mobile */}
                                {session?.user ? (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-300 flex items-center justify-center">
                                                    <FaUser className="text-xl text-gray-700" />
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getRoleBadgeColor(session.user.role)} rounded-full border-2 border-white text-[10px] font-bold flex items-center justify-center`}>
                                                    {session.user.role.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900">{session.user.name}</p>
                                                <p className="text-sm text-gray-600">{session.user.email}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs ${getRoleBadgeColor(session.user.role)} px-2 py-0.5 rounded-full`}>
                                                        {session.user.role}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${session.user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {session.user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ✅ এখানে আপনার Quick Dashboard Links কোড যোগ করুন */}
                                        {/* Quick Dashboard Links */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link
                                                href="/account"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="px-3 py-2 bg-white text-sm text-gray-700 rounded-lg border border-gray-200 hover:border-gray-300 hover:text-gray-900 transition-colors text-center font-medium"
                                            >
                                                My Profile
                                            </Link>
                                            <Link
                                                href="/account/orders"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="px-3 py-2 bg-white text-sm text-gray-700 rounded-lg border border-gray-200 hover:border-gray-300 hover:text-gray-900 transition-colors text-center font-medium"
                                            >
                                                My Orders
                                            </Link>
                                            {getDashboardLinks().slice(0, 2).map((link) => (
                                                <Link
                                                    key={link.name}
                                                    href={link.href}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm rounded-lg hover:from-gray-900 hover:to-black transition-all duration-300 text-center font-medium"
                                                >
                                                    {link.name}
                                                </Link>
                                            ))}
                                        </div>
                                        {/* ✅ কোড এখান পর্যন্ত */}

                                        {/* Sign Out Button */}
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full mt-3 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FaSignOutAlt />
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <Link
                                            href="/auth/signin"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300 hover:border-gray-400 transition-colors"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-300 flex items-center justify-center">
                                                <FaUser className="text-lg text-gray-700" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900">Sign In</p>
                                                <p className="text-sm text-gray-600">Access your account</p>
                                            </div>
                                        </Link>
                                    </div>
                                )}

                                {/* Navigation Links */}
                                <div className="grid grid-cols-2 gap-2 mb-6">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center space-x-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                        >
                                            <span className="text-gray-600">{link.icon}</span>
                                            <span className="font-medium">{link.name}</span>
                                        </Link>
                                    ))}
                                </div>

                                {/* Categories for Mobile */}
                                {categories.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-gray-600 text-sm font-semibold mb-3 px-1">Categories</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.slice(0, 6).map((category) => (
                                                <button
                                                    key={category._id}
                                                    onClick={() => handleCategoryClick(category.slug)}
                                                    className="px-3 py-2 bg-white text-gray-600 text-sm rounded-lg border border-gray-200 hover:border-gray-300 hover:text-gray-900 transition-colors"
                                                >
                                                    {category.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Contact Info */}
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="text-center">
                                        <p className="text-gray-800 font-medium mb-1">Need help?</p>
                                        <p className="text-gray-900 font-bold text-lg">+880 1234 567890</p>
                                        <p className="text-gray-500 text-xs mt-1">24/7 Customer Support</p>
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
        </>
    );
}