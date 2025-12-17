'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
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
    FaPhone,
    FaShoppingBag,
    FaHome,
    FaChevronDown,
    FaChevronUp
} from 'react-icons/fa';
import { signOut, useSession } from 'next-auth/react';

import { FiShoppingBag, FiUser, FiMenu, FiX, FiPhone } from 'react-icons/fi';
import CartSlider from '../../Shop/CartSlider/CartSlider';

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

interface NavigationItem {
    _id: string;
    title: string;
    slug: string;
    isActive: boolean;
    children?: NavigationItem[];
}

export default function Navbar({ contactNumber = '+880 1571-083401' }: { contactNumber?: string }) {
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
    const [navigation, setNavigation] = useState<NavigationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const searchRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Scroll hide/show functionality - Only for desktop
    useEffect(() => {
        const handleScroll = () => {
            // Only apply scroll hide on desktop
            if (window.innerWidth >= 768) {
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
            }
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

    // Fetch navigation data
    useEffect(() => {
        const fetchNavigation = async () => {
            try {
                const response = await fetch('/api/navigation');
                const data = await response.json();

                if (data.success) {
                    setNavigation(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch navigation:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNavigation();
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

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
    }, [pathname]);

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

            // Close navigation dropdowns
            if (!target.closest('.nav-dropdown') && !target.closest('.nav-dropdown-button')) {
                setActiveDropdown(null);
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

    // Toggle dropdown
    const toggleDropdown = (id: string) => {
        setActiveDropdown(activeDropdown === id ? null : id);
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
                { name: 'Manage Users', href: '/admin-dashboard/users/users-control', icon: <FaUserShield /> }
            );
        } else if (session.user.role === 'moderator') {
            links.push(
                { name: 'Moderator Panel', href: '/moderator-dashboard', icon: <FaTachometerAlt /> },
                { name: 'Manage Content', href: '/moderator/content', icon: <FaBox /> }
            );
        }

        return links;
    };

    // User profile links
    const userProfileLinks = [
        { name: 'My Profile', href: '/account', icon: <FaUser /> },
    ];

    // Check if item is active
    const isItemActive = (item: NavigationItem): boolean => {
        return pathname === item.slug ||
            (item.children && item.children.some(child => pathname === child.slug)) ||
            false;
    };

    // Render desktop navigation item
    const renderDesktopItem = (item: NavigationItem) => {
        if (!item.isActive) return null;

        const hasChildren = item.children && item.children.length > 0;
        const isDropdownOpen = activeDropdown === item._id;
        const isActive = isItemActive(item);

        return (
            <div key={item._id} className="relative nav-dropdown">
                {hasChildren ? (
                    <>
                        <button
                            onClick={() => toggleDropdown(item._id)}
                            className={`flex items-center text-[13px] font-medium px-3 py-2.5 rounded-lg transition-all duration-200 nav-dropdown-button group ${isActive || isDropdownOpen
                                ? 'text-gray-900 bg-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                                }`}
                        >
                            <span className="relative">
                                {item.title}
                                {isActive && (
                                    <motion.span
                                        layoutId="activeIndicator"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-800 to-gray-600 rounded-full"
                                    />
                                )}
                            </span>
                            <span className={`ml-1.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                <FaChevronDown className="w-3.5 h-3.5" />
                            </span>
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && hasChildren && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/80 py-2 z-[100] backdrop-blur-sm"
                                >
                                    <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-gray-200/80 transform rotate-45"></div>
                                    {item.children!.map((child) => (
                                        <Link
                                            key={child._id}
                                            href={child.slug}
                                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 transition-all duration-200 group/item"
                                            onClick={() => setActiveDropdown(null)}
                                        >
                                            <span className="relative">
                                                {child.title}
                                                {pathname === child.slug && (
                                                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gray-900 rounded-full opacity-50"></span>
                                                )}
                                            </span>
                                            <FaChevronDown className="w-3 h-3 ml-auto opacity-0 -rotate-90 group-hover/item:opacity-100 transition-all duration-200" />
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <Link
                        href={item.slug}
                        className={`relative text-[13px] font-medium px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                            ? 'text-gray-900 bg-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                            }`}
                    >
                        {item.title}
                        {isActive && (
                            <motion.span
                                layoutId="activeIndicator"
                                className="absolute -bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-gray-800 to-gray-600 rounded-full"
                            />
                        )}
                    </Link>
                )}
            </div>
        );
    };

    // Render mobile navigation item
    const renderMobileItem = (item: NavigationItem, level: number = 0) => {
        if (!item.isActive) return null;

        const hasChildren = item.children && item.children.length > 0;
        const isDropdownOpen = activeDropdown === item._id;
        const isActive = pathname === item.slug;

        return (
            <div key={item._id} className="space-y-0.5">
                <div className="flex items-center justify-between">
                    {hasChildren ? (
                        <button
                            onClick={() => toggleDropdown(item._id)}
                            className={`flex-1 py-3 text-left transition-all duration-200 ${level > 0 ? 'pl-6' : 'pl-0'
                                } ${isActive ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900'}`}
                        >
                            <div className="flex items-center">
                                <span className="relative">
                                    {item.title}
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gray-900 rounded-full"></span>
                                    )}
                                </span>
                            </div>
                        </button>
                    ) : (
                        <Link
                            href={item.slug}
                            className={`flex-1 py-3 transition-all duration-200 ${level > 0 ? 'pl-6' : 'pl-0'
                                } ${isActive ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900'}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <div className="flex items-center">
                                <span className="relative">
                                    {item.title}
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gray-900 rounded-full"></span>
                                    )}
                                </span>
                            </div>
                        </Link>
                    )}

                    {hasChildren && (
                        <button
                            onClick={() => toggleDropdown(item._id)}
                            className={`p-2 transition-all duration-200 ${isDropdownOpen ? 'text-gray-900 rotate-180' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FaChevronDown className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {hasChildren && isDropdownOpen && item.children && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="pl-6 space-y-0.5 border-l border-gray-200 ml-2">
                                {item.children.map((child) => renderMobileItem(child, level + 1))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <>
            {/* Desktop Top Navbar - Only for desktop */}
            <motion.nav
                initial={{ y: 0 }}
                animate={{ y: isNavbarVisible ? 0 : -100 }}
                transition={{ duration: 0.3 }}
                className="hidden lg:block bg-gradient-to-r from-gray-100 to-gray-50 shadow-sm border-b border-gray-200 sticky top-0 z-50 h-16"
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Brand Name - Left */}
                        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
                            <Link href="/" className="flex items-center space-x-2 md:space-x-3 group">
                                <div className="relative">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-md">
                                        <FaStore className="text-white text-base sm:text-lg md:text-xl" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full animate-pulse"></div>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 font-['Poppins'] tracking-tight leading-tight">
                                        SOOQRA ONE
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Search Bar - Middle */}
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

                            {/* Desktop Search Results Dropdown */}
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
                            {/* User Menu (Desktop) */}
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

                                        {/* User Dropdown Menu */}
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

                                                    {/* Dashboard Links */}
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
                                    className="relative group"
                                    aria-label="Shopping Cart"
                                >
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-300 flex items-center justify-center group-hover:from-gray-300 group-hover:to-gray-400 group-hover:border-gray-400 transition-all duration-300 shadow-sm">
                                        <FaShoppingCart className="text-lg md:text-xl text-gray-700 group-hover:text-gray-900" />
                                    </div>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Desktop Navbar Navigation - Only for desktop */}
            <motion.nav
                animate={{ top: isNavbarVisible ? 64 : 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="hidden md:block bg-gray-100/95 backdrop-blur-sm border-b border-gray-200/50 transition-all duration-300 sticky z-40 shadow-lg"
            >
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left: Navigation Items */}
                        <div className="flex items-center space-x-1">
                            {!isNavbarVisible && (
                                <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
                                    <Link href="/" className="flex items-center space-x-2 md:space-x-3 group">
                                        <div className="relative">
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-md">
                                                <FaStore className="text-white text-base sm:text-lg md:text-xl" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full animate-pulse"></div>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 font-['Poppins'] tracking-tight leading-tight">
                                                SOOQRA ONE
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            )}
                            {/* Navigation Items */}
                            {navigation.map(renderDesktopItem)}

                            {/* Shop Link */}
                            <Link
                                href="/shop"
                                className={`flex items-center text-[13px] font-medium px-3 py-2.5 rounded-lg transition-all duration-200 ${pathname.startsWith('/shop')
                                    ? 'text-gray-900 bg-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                                    }`}
                            >
                                <FaShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                                Shop
                                {pathname.startsWith('/shop') && (
                                    <motion.span
                                        layoutId="shopIndicator"
                                        className="absolute -bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-gray-800 to-gray-600 rounded-full"
                                    />
                                )}
                            </Link>
                        </div>

                        {/* Right: Contact or Cart */}
                        <div className="flex items-center gap-4">
                            {!isNavbarVisible ? (
                                // Cart Icon
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="group flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-all duration-200 relative"
                                >
                                    <div className="relative">
                                        <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-sm group-hover:shadow transition-all duration-300">
                                            <FaShoppingCart className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10"></div>
                                    </div>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </button>
                            ) : (
                                // Contact Number
                                <a
                                    href={`tel:${contactNumber.replace(/\s+/g, '')}`}
                                    className="group flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-all duration-200"
                                >
                                    <div className="relative">
                                        <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-sm group-hover:shadow transition-all duration-300">
                                            <FaPhone className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10"></div>
                                    </div>
                                    <div className="hidden lg:block">
                                        <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Call Support</div>
                                        <div className="text-sm font-semibold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                            {contactNumber}
                                        </div>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Navbar - Only for mobile/tablet */}
            <nav className="md:hidden bg-gradient-to-r from-gray-100 to-gray-50 shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Brand Name - Left */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <Link href="/" className="flex items-center space-x-2 group">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-md">
                                        <FaStore className="text-white text-lg" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full animate-pulse"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-extrabold text-gray-900 font-['Poppins'] tracking-tight">
                                        SOOQRA ONE
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex items-center space-x-4">
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

                {/* Mobile Search Bar (when search icon is clicked) */}
                <AnimatePresence>
                    {showMobileSearch && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-gray-200 bg-white shadow-lg"
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

                                {/* Mobile Search Results */}
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

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white border-t border-gray-200 overflow-hidden shadow-lg"
                            style={{ zIndex: 99999 }}
                        >
                            <div className="container mx-auto px-4 py-4 max-h-[calc(100vh-120px)] overflow-y-auto">
                                {/* User Info for Mobile (From TopNavbar) */}
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

                                {/* Navigation Items (From Navbar) */}
                                {navigation.map((item) => renderMobileItem(item))}

                                {/* Shop Link */}
                                <Link
                                    href="/shop"
                                    className={`flex items-center py-3 px-2 rounded-lg transition-all duration-200 ${pathname.startsWith('/shop')
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <FaShoppingBag className="w-4 h-4 mr-3" />
                                    Shop
                                </Link>

                                {/* Divider */}
                                <div className="my-4 border-t border-gray-200"></div>

                                {/* Account Link */}
                                <Link
                                    href="/account"
                                    className="flex items-center py-3 px-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <FiUser className="w-4 h-4 mr-3" />
                                    My Account
                                </Link>

                                {/* Contact Info */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                    <div className="text-xs font-medium text-gray-500 mb-1">Need Help?</div>
                                    <a
                                        href={`tel:${contactNumber.replace(/\s+/g, '')}`}
                                        className="text-sm font-bold text-gray-900 hover:text-gray-700 transition-colors"
                                    >
                                        {contactNumber}
                                    </a>
                                    <div className="text-xs text-gray-500 mt-2">24/7 Customer Support</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Cart Slider */}
            <div className="relative z-[9999]">
                <CartSlider
                    isOpen={isCartOpen}
                    setIsOpen={setIsCartOpen}
                    conversionRates={conversionRates}
                />
            </div>
        </>
    );
}