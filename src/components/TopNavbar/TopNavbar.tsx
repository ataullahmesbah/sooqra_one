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
    FaTachometerAlt,
    FaUserShield,
    FaBox,
    FaShoppingBag,
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
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [conversionRates] = useState<ConversionRates>({
        USD: 0.0091,
        EUR: 0.0084,
        BDT: 1
    });
    const [isNavbarVisible, setIsNavbarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const searchRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    // Scroll hide/show functionality
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                setIsNavbarVisible(false);
                setShowSearchResults(false);
                setShowUserMenu(false);
            } else if (currentScrollY < lastScrollY) {
                // Scrolling up
                setIsNavbarVisible(true);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);
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
            const target = event.target as HTMLElement;
            // Close search results if clicked outside
            if (searchRef.current && !searchRef.current.contains(target)) {
                setShowSearchResults(false);
            }
            // Close user menu if clicked outside
            if (userMenuRef.current && !userMenuRef.current.contains(target)) {
                setShowUserMenu(false);
            }
            // Close mobile search if clicked outside
            if (showMobileSearch && mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
                // Check if clicked on mobile search icon
                if (!target.closest('.mobile-search-icon')) {
                    setShowMobileSearch(false);
                    setShowSearchResults(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMobileSearch]);
    // Focus search input when mobile search opens
    useEffect(() => {
        if (showMobileSearch && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [showMobileSearch]);
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
            setShowMobileSearch(false);
        }
    };
    // Handle Enter key press in search
    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchQuery.trim()) {
                router.push(`/shop/search?q=${encodeURIComponent(searchQuery)}`);
                setSearchQuery('');
                setShowSearchResults(false);
                setShowMobileSearch(false);
            }
        }
    };
    const handleResultClick = (slug: string) => {
        router.push(`/shop/${slug}`);
        setSearchQuery('');
        setShowSearchResults(false);
        setShowMobileSearch(false);
        setIsMobileMenuOpen(false);
    };
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (!isMobileMenuOpen) {
            setShowMobileSearch(false);
            setShowSearchResults(false);
        }
    };
    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };
    const toggleMobileSearch = () => {
        setShowMobileSearch(!showMobileSearch);
        if (showMobileSearch) {
            setSearchQuery('');
            setShowSearchResults(false);
        }
        if (!showMobileSearch) {
            setIsMobileMenuOpen(false);
        }
    };
    const handleSignOut = async () => {
        await signOut({ redirect: false });
        setShowUserMenu(false);
        setIsMobileMenuOpen(false);
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
    // Dashboard links based on user role
    const getDashboardLinks = () => {
        if (!session?.user?.role) return [];
        const links = [];
        if (session.user.role === 'admin') {
            links.push(
                { name: 'Admin Dashboard', href: '/admin-dashboard', icon: <FaTachometerAlt /> },
                { name: 'Manage Products', href: '/admin-dashboard/shop/all-products', icon: <FaBox /> },

            );
        } else if (session.user.role === 'moderator') {
            links.push(
                { name: 'Moderator Panel', href: '/moderator-dashboard', icon: <FaTachometerAlt /> },
                { name: 'Manage Products', href: '/moderator-dashboard/products/all-products', icon: <FaBox /> }
            );
        }
        return links;
    };
    // User profile links
    const userProfileLinks = [
        { name: 'My Profile', href: '/account', icon: <FaUser /> },
    ];
    return (

        <div className="hidden lg:block">
            {/* Main Navbar with scroll hide/show */}
            <motion.nav
                initial={{ y: 0 }}
                animate={{ y: isNavbarVisible ? 0 : -64 }}
                transition={{ duration: 0.2 }}
                className="bg-gradient-to-r from-gray-100 to-gray-50
             shadow-sm border-b border-gray-200
             fixed top-0 left-0 w-full z-50 h-16"
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Brand Name - Left */}


                        {/* Logo and Brand Name  */}
                        <Link href="/" className="flex items-center mr-6 hover:opacity-90 transition-opacity">
                            <div className="w-40 h-10 md:w-48 md:h-12 lg:w-56 lg:h-14 relative bg-no-repeat">
                                <Image
                                    src="/sooqraone.png"
                                    alt="Sooqra One"
                                    width={250}
                                    height={100}
                                    className="object-contain w-full h-full select-none pointer-events-none"
                                    priority
                                    draggable={false}
                                    onContextMenu={(e) => e.preventDefault()}
                                    onDragStart={(e) => e.preventDefault()}
                                />
                            </div>
                        </Link>

                        {/* Search Bar - Middle (Desktop only) */}
                        <div className="hidden lg:block flex-1 max-w-2xl mx-6 xl:mx-8 relative" ref={searchRef}>
                            <div className="relative">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleSearchKeyPress}
                                    onFocus={() => {
                                        if (searchQuery.trim()) {
                                            setShowSearchResults(true);
                                        }
                                    }}
                                    placeholder="Search Sooqra One"
                                    className="w-full px-4 pl-12 py-3 bg-white border-2 border-gray-300 rounded-full text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all duration-300 shadow-sm text-sm md:text-base"
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">
                                    <FaSearch className="text-sm md:text-base" />
                                </div>
                            </div>
                            {/* Desktop Search Results Dropdown - Fixed HIGH z-index */}
                            <AnimatePresence>
                                {showSearchResults && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-[99999] max-h-[400px] overflow-y-auto"
                                    >
                                        {isSearching ? (
                                            <div className="p-4 text-center">
                                                <div className="inline-block w-6 h-6 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-gray-600 mt-2 text-sm font-medium">Searching...</p>
                                            </div>
                                        ) : searchResults.length > 0 ? (
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
                                        ) : searchQuery.trim() ? (
                                            <div className="p-4 text-center">
                                                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <FaSearch className="text-gray-500" />
                                                </div>
                                                <p className="text-gray-800 font-medium mb-1">No products found</p>
                                                <p className="text-gray-600 text-sm">Try different keywords</p>
                                            </div>
                                        ) : null}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-4 md:space-x-6">
                            {/* User Menu (Desktop) - Fixed with HIGH z-index */}
                            <div className="hidden lg:block relative" ref={userMenuRef}>
                                {session?.user ? (
                                    <div className="relative">
                                        <button
                                            onClick={toggleUserMenu}
                                            className="flex items-center space-x-2 text-gray-800 hover:text-gray-900 transition-colors group"
                                        >
                                            <div className="relative">
                                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-300 flex items-center justify-center group-hover:from-gray-300 group-hover:to-gray-400 group-hover:border-gray-400 transition-all duration-300 shadow-sm">
                                                    <FaUser className="text-base md:text-lg text-gray-700" />
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 ${getRoleBadgeColor(session.user.role)} rounded-full border-2 border-white text-[8px] md:text-[10px] font-bold flex items-center justify-center`}>
                                                    {session.user.role.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</span>
                                                <span className="text-xs text-gray-600 capitalize">{session.user.role}</span>
                                            </div>
                                            <FaCaretDown className={`text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                                        </button>
                                        {/* User Dropdown Menu - Fixed HIGH z-index */}
                                        <AnimatePresence>
                                            {showUserMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-[99999] overflow-hidden"
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
                                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-300 flex items-center justify-center group-hover:from-gray-300 group-hover:to-gray-400 group-hover:border-gray-400 transition-all duration-300 shadow-sm">
                                                <FaUser className="text-base md:text-lg text-gray-700" />
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
                            <div className="hidden lg:block relative">
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="relative p-2 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                                    aria-label="Open Cart"
                                >
                                    {/* Cart Icon */}
                                    <FaShoppingBag className="w-4 h-4 text-white group-hover:text-yellow-300 transition-colors duration-300" />

                                    {/* Animated Badge */}
                                    {cartCount > 0 && (
                                        <span className="
                                            absolute -top-2 -right-2 
                                            min-w-5 h-5 px-1.5 
                                            flex items-center justify-center 
                                            bg-gradient-to-r from-yellow-400 to-amber-500 
                                            text-gray-900 text-xs font-extrabold 
                                            rounded-full 
                                            shadow-lg 
                                            ring-2 ring-white
                                            animate-bounce 
                                            hover:animate-none   
                                        ">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                            {/* Mobile Menu and Cart */}
                            <div className="lg:hidden flex items-center space-x-4">
                                {/* Search Icon for Mobile */}
                                <button
                                    onClick={toggleMobileSearch}
                                    className="text-gray-700 hover:text-gray-900 mobile-search-icon"
                                    aria-label="Search"
                                >
                                    <FaSearch className="text-xl" />
                                </button>
                                {/* Cart Icon for Mobile */}
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="relative p-2 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                                    aria-label="Open Cart"
                                >
                                    {/* Cart Icon */}
                                    <FaShoppingBag className="w-4 h-4 text-white group-hover:text-yellow-300 transition-colors duration-300" />

                                    {/* Animated Badge */}
                                    {cartCount > 0 && (
                                        <span className="
            absolute -top-2 -right-2 
            min-w-5 h-5 px-1.5 
            flex items-center justify-center 
            bg-gradient-to-r from-yellow-400 to-amber-500 
            text-gray-900 text-xs font-extrabold 
            rounded-full 
            shadow-lg 
            ring-2 ring-white
            animate-bounce 
            hover:animate-none   
        ">
                                            {cartCount > 99 ? '99+' : cartCount}
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
                {/* Mobile Search Bar (when search icon is clicked) - FIXED POSITION */}
                <AnimatePresence>
                    {showMobileSearch && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden border-t border-gray-200 bg-white absolute top-16 left-0 right-0 shadow-lg"
                            ref={mobileSearchRef}
                            style={{ zIndex: 99999 }}
                        >
                            <div className="container mx-auto px-4 py-3">
                                <div className="relative">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={handleSearchKeyPress}
                                        placeholder="Search Sooqra One"
                                        className="w-full px-4 pl-12 py-3 bg-gray-50 border-2 border-gray-300 rounded-full text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
                                        autoFocus
                                    />
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">
                                        <FaSearch />
                                    </div>
                                </div>
                                {/* Mobile Search Results - Fixed HIGH z-index */}
                                <AnimatePresence>
                                    {showSearchResults && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto"
                                            style={{ zIndex: 99999, position: 'relative' }}
                                        >
                                            {isSearching ? (
                                                <div className="p-4 text-center">
                                                    <div className="inline-block w-6 h-6 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                                                    <p className="text-gray-600 mt-2 text-sm font-medium">Searching...</p>
                                                </div>
                                            ) : searchResults.length > 0 ? (
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
                                            ) : searchQuery.trim() ? (
                                                <div className="p-4 text-center">
                                                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <FaSearch className="text-gray-500" />
                                                    </div>
                                                    <p className="text-gray-800 font-medium mb-1">No products found</p>
                                                    <p className="text-gray-600 text-sm">Try different keywords</p>
                                                </div>
                                            ) : null}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Mobile Menu - FIXED POSITION with HIGH z-index */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden bg-white border-t border-gray-200 overflow-hidden absolute top-16 left-0 right-0 shadow-lg"
                            style={{ zIndex: 99999 }}
                        >
                            <div className="container mx-auto px-4 py-4">
                                {/* User Info for Mobile */}
                                {session?.user ? (
                                    <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-300 flex items-center justify-center">
                                                    <FaUser className="text-lg text-gray-700" />
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getRoleBadgeColor(session.user.role)} rounded-full border-2 border-white text-[10px] font-bold flex items-center justify-center`}>
                                                    {session.user.role.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 text-sm truncate">{getUserDisplayName()}</p>
                                                <p className="text-xs text-gray-600 truncate">{session.user.email}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs ${getRoleBadgeColor(session.user.role)} px-2 py-0.5 rounded-full`}>
                                                        {session.user.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Quick Dashboard Links */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link
                                                href="/account"
                                                onClick={() => {
                                                    setIsMobileMenuOpen(false);
                                                    setShowUserMenu(false);
                                                }}
                                                className="px-3 py-2 bg-white text-xs text-gray-700 rounded-lg border border-gray-200 hover:border-gray-300 hover:text-gray-900 transition-colors text-center font-medium"
                                            >
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                        {/* Dashboard links for admin/moderator */}
                                        {getDashboardLinks().slice(0, 2).map((link) => (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="block w-full mt-2 px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs rounded-lg hover:from-gray-900 hover:to-black transition-all duration-300 text-center font-medium"
                                            >
                                                {link.name}
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mb-4">
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
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
            {/* Cart Slider with high z-index */}
            <div className="relative z-[9999]">
                <CartSlider
                    isOpen={isCartOpen}
                    setIsOpen={setIsCartOpen}
                    conversionRates={conversionRates}
                />
            </div>
        </div>
    );
}