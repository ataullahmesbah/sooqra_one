'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaShoppingBag,
    FaSearch,
    FaBars,
    FaTimes,
    FaStore,
    FaSignOutAlt,
    FaTachometerAlt,
    FaBox,
    FaUser,
} from 'react-icons/fa';
import { FiChevronDown, FiPhone, FiShoppingBag } from 'react-icons/fi';
import { signOut, useSession } from 'next-auth/react';
import CartSlider from '../../Shop/CartSlider/CartSlider';

interface SearchResult {
    _id: string;
    title: string;
    slug: string;
    mainImage: string;
    mainImageAlt: string;
    bdtPrice: number;
    category: { _id: string; name: string; slug: string };
    brand: string;
    availability: string;
}

interface NavigationItem {
    _id: string;
    title: string;
    slug: string;
    isActive: boolean;
    children?: NavigationItem[];
}

export default function Navbar({ contactNumber = '+880 1571-083401' }: { contactNumber?: string }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    const [navigation, setNavigation] = useState<NavigationItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Mobile states
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Common states
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [cartCount, setCartCount] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isNavbarVisible, setIsNavbarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const searchRef = useRef<HTMLDivElement>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const conversionRates = { USD: 0.0091, EUR: 0.0084, BDT: 1 };

    // Scroll hide/show
    useEffect(() => {
        const handleScroll = () => {
            const current = window.scrollY;
            if (current > lastScrollY && current > 100) {
                setIsNavbarVisible(false);
                setShowMobileSearch(false);
                setShowSearchResults(false);
                setMobileMenuOpen(false);
            } else if (current < lastScrollY) {
                setIsNavbarVisible(true);
            }
            setLastScrollY(current);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Fetch navigation
    useEffect(() => {
        const fetchNavigation = async () => {
            try {
                const res = await fetch('/api/navigation');
                const data = await res.json();
                if (data.success) setNavigation(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNavigation();
    }, []);

    // Cart count
    useEffect(() => {
        const updateCart = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(cart.reduce((s: number, i: any) => s + i.quantity, 0));
        };
        updateCart();
        window.addEventListener('storage', updateCart);
        window.addEventListener('cartUpdated', updateCart);
        return () => {
            window.removeEventListener('storage', updateCart);
            window.removeEventListener('cartUpdated', updateCart);
        };
    }, []);

    // Close on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setShowMobileSearch(false);
        setSearchQuery('');
        setShowSearchResults(false);
        setActiveDropdown(null);
    }, [pathname]);

    // Toggle dropdown for desktop & mobile navigation
    const toggleDropdown = (id: string) => {
        setActiveDropdown(activeDropdown === id ? null : id);
    };

    const isItemActive = (item: NavigationItem): boolean => {
        if (pathname === item.slug) return true;
        return item.children?.some(child => pathname === child.slug) ?? false;
    };

    // Search logic
    const searchProducts = useCallback(async (q: string) => {
        if (!q.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}&limit=6`);
            if (res.ok) {
                const json = await res.json();
                if (json.success) {
                    setSearchResults(json.data);
                    setShowSearchResults(true);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => searchProducts(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery, searchProducts]);

    useEffect(() => {
        if (showMobileSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showMobileSearch]);

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleResultClick = (slug: string) => {
        router.push(`/shop/${slug}`);
        setSearchQuery('');
        setShowSearchResults(false);
        setShowMobileSearch(false);
        setMobileMenuOpen(false);
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        setMobileMenuOpen(false);
        router.push('/');
        router.refresh();
    };

    const getUserDisplayName = () => {
        if (!session?.user?.name) return 'User';
        return session.user.name.split(' ')[0];
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-600 text-white';
            case 'moderator': return 'bg-blue-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    };

    const getDashboardLinks = () => {
        if (!session?.user?.role) return [];
        const links = [];
        if (session.user.role === 'admin') {
            links.push({ name: 'Admin Dashboard', href: '/admin-dashboard', icon: <FaTachometerAlt /> });
            links.push({ name: 'Manage Products', href: '/admin-dashboard/shop/all-products', icon: <FaBox /> });
        } else if (session.user.role === 'moderator') {
            links.push({ name: 'Moderator Panel', href: '/moderator-dashboard', icon: <FaTachometerAlt /> });
        }
        return links;
    };

    // Desktop navigation render
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
                                <FiChevronDown className="w-3.5 h-3.5" />
                            </span>
                        </button>
                        <AnimatePresence>
                            {isDropdownOpen && hasChildren && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/80 py-2 z-[100]"
                                >
                                    <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-gray-200/80 transform rotate-45"></div>
                                    {item.children!.map((child) => (
                                        <Link
                                            key={child._id}
                                            href={child.slug}
                                            onClick={() => setActiveDropdown(null)}
                                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            {child.title}
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

    // Mobile navigation render
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
                            className={`flex-1 py-3 text-left ${level > 0 ? 'pl-6' : 'pl-0'} ${isActive ? 'text-gray-900 font-medium' : 'text-gray-700'}`}
                        >
                            {item.title}
                        </button>
                    ) : (
                        <Link
                            href={item.slug}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex-1 py-3 ${level > 0 ? 'pl-6' : 'pl-0'} ${isActive ? 'text-gray-900 font-medium' : 'text-gray-700'}`}
                        >
                            {item.title}
                        </Link>
                    )}
                    {hasChildren && (
                        <button onClick={() => toggleDropdown(item._id)} className="p-2">
                            <FiChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
                <AnimatePresence>
                    {hasChildren && isDropdownOpen && item.children && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pl-6 border-l border-gray-200 ml-2">
                                {item.children.map(child => renderMobileItem(child, level + 1))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    if (loading) {
        return <div className="h-16 bg-gray-100" />;
    }

    return (
        <>
            {/* Desktop Navbar */}
            <div className="hidden lg:block">
                <motion.nav
                    animate={{ top: isNavbarVisible ? 64 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gray-100/95 backdrop-blur-sm border-b border-gray-200/50 fixed left-0 right-0 w-full z-40 shadow-lg hidden lg:block"
                >
                    <div className="max-w-7xl mx-auto px-4 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-1">
                                {!isNavbarVisible && (
                                    <Link href="/" className="flex items-center mr-6 hover:opacity-90 transition-opacity">
                                        <div className="w-40 h-10 md:w-48 md:h-12 lg:w-56 lg:h-14 relative flex items-center">
                                            {/* পুরো Logo + Text একসাথে */}
                                            <Image
                                                src="/sooqraone.png"  // তোমার 250×100 SVG
                                                alt="Sooqra One"
                                                width={200}    // Original: 250px → 80% scale
                                                height={80}    // Original: 100px → 80% scale
                                                className="object-contain w-full h-full"
                                                priority
                                            />
                                        </div>
                                    </Link>
                                )}
                                {navigation.map(renderDesktopItem)}
                                <Link
                                    href="/shop"
                                    className={`flex items-center text-[13px] font-medium px-3 py-2.5 rounded-lg transition-all ${pathname.startsWith('/shop') ? 'text-gray-900 bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'}`}
                                >
                                    <FiShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                                    Shop
                                </Link>
                            </div>

                            {/* Search Shopping Badge and Number Condition */}


                            <div className="flex items-center gap-4">
                                {!isNavbarVisible ? (
                                    <>
                                        {/* Search Bar (Desktop only) - যোগ করেছি Shopping Icon এর আগে */}
                                        <div className="hidden lg:block flex-1 max-w-2xl relative" ref={searchRef}>
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
                                                    className="w-full px-4 pl-12 py-2.5 bg-white border-2 border-gray-300 rounded-full text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all duration-300 shadow-sm text-sm"
                                                />
                                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">
                                                    <FaSearch className="text-sm" />
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
                                                                        {/* Product Image */}
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

                                                                        {/* Product Details */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-gray-900 text-sm font-semibold truncate">{product.title}</p>
                                                                            <div className="flex items-center justify-between mt-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                                        {product.category.name}
                                                                                    </span>

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

                                        {/* Shopping Cart Button */}
                                        <button
                                            onClick={() => setIsCartOpen(true)}
                                            className="relative p-2 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                                            aria-label="Open Cart"
                                        >
                                            <FaShoppingBag className="w-4 h-4 text-white group-hover:text-yellow-300 transition-colors duration-300" />
                                            {cartCount > 0 && (
                                                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1.5 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-xs font-extrabold rounded-full shadow-lg ring-2 ring-white animate-bounce hover:animate-none">
                                                    {cartCount > 99 ? '99+' : cartCount}
                                                </span>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <a href={`tel:${contactNumber.replace(/\s+/g, '')}`} className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
                                            <FiPhone className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="hidden xl:block">
                                            <p className="text-xs text-gray-500">Call Support</p>
                                            <p className="font-bold text-gray-900">{contactNumber}</p>
                                        </div>
                                    </a>
                                )}
                            </div>



                        </div>
                    </div>
                </motion.nav>
            </div>

            {/* Mobile & Tablet Navbar */}
            <div className="lg:hidden">


                {/* Mobile & Tablet Navbar */}
                <div className="lg:hidden">
                    <nav className="bg-gradient-to-r from-gray-100 to-gray-50 shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16">
                        <div className="container mx-auto px-4 flex items-center justify-between h-16">


                            {/* Logo mobile and TabletF */}
                            <Link href="/" className="flex-shrink-0">
                                <Image
                                    src="/sooqraone.png"
                                    alt="SOOQRA ONE"
                                    width={250}
                                    height={58}
                                    className="h-14 w-auto md:h-16 lg:hidden"  /* Mobile: 56px, Tablet: 64px */
                                    priority
                                />
                            </Link>

                            {/* Icons - Right Side */}
                            <div className="flex items-center space-x-4">
                                <button onClick={() => { setShowMobileSearch(prev => !prev); setMobileMenuOpen(false); }}>
                                    <FaSearch className="text-xl text-gray-700" />
                                </button>
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="relative p-2 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group"
                                    aria-label="Open Cart"
                                >
                                    <FaShoppingBag className="w-3 h-3 text-white group-hover:text-yellow-300 transition-colors duration-300" />

                                    {cartCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-xs font-extrabold rounded-full shadow-md ring-3 ring-white animate-bounce hover:animate-none [animation-duration:1s]">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </button>
                                <button onClick={() => { setMobileMenuOpen(prev => !prev); setShowMobileSearch(false); }}>
                                    {mobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
                                </button>
                            </div>
                        </div>
                    </nav>

                    {/* ... Rest of your mobile code ... */}
                </div>

                {/* Mobile Search */}
                <AnimatePresence>
                    {showMobileSearch && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="fixed top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[99999]"
                        >
                            <div className="container mx-auto px-4 py-3">
                                <div className="relative">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && router.push(`/shop/search?q=${encodeURIComponent(searchQuery)}`)}
                                        placeholder="Search Sooqra One..."
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-full focus:outline-none focus:border-gray-800"
                                    />
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                </div>
                                <AnimatePresence>
                                    {showSearchResults && (
                                        <motion.div className="mt-3 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
                                            {isSearching ? (
                                                <div className="p-6 text-center">Searching...</div>
                                            ) : searchResults.length > 0 ? (
                                                searchResults.map((p) => (
                                                    <div key={p._id} onClick={() => handleResultClick(p.slug)} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0">
                                                        <div className="w-12 h-12 rounded overflow-hidden mr-3 border">
                                                            <Image src={p.mainImage} alt={p.mainImageAlt} width={48} height={48} className="object-cover" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm truncate">{p.title}</p>
                                                            <p className="text-xs text-gray-600">{p.category.name} • {p.brand}</p>
                                                            <p className="font-bold text-sm mt-1">৳{p.bdtPrice.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-6 text-center text-gray-500">No products found</div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <>
                            {/* Backdrop Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998] lg:hidden"
                            />

                            {/* Menu Panel */}
                            <motion.div
                                initial={{ opacity: 0, x: '100%' }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: '100%' }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl z-[99999] lg:hidden"
                            >
                                {/* Menu Header */}
                                <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                                                <FaStore className="text-white" />
                                            </div>
                                            <span className="text-lg font-bold text-gray-900">Menu</span>
                                        </div>
                                        <button
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        >
                                            <FaTimes className="text-xl text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Menu Content */}
                                <div className="h-[calc(100vh-64px)] overflow-y-auto pb-24">
                                    {/* User Profile Section */}
                                    <div className="p-4 border-b border-gray-100">
                                        {session?.user ? (
                                            <>
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <div className="relative">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                            <FaUser className="text-xl text-gray-700" />
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900 text-lg">{getUserDisplayName()}</p>
                                                        <p className="text-xs text-gray-600 truncate">{session.user.email}</p>
                                                        <span className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-lg ${getRoleBadgeColor(session.user.role || 'user')}`}>
                                                            {session.user.role?.toUpperCase() || 'USER'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Quick Actions */}
                                                <div className="grid grid-cols-2 gap-2 mb-4">
                                                    <Link
                                                        href="/account"
                                                        onClick={() => setMobileMenuOpen(false)}
                                                        className="flex flex-col items-center justify-center p-3 bg-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                                                    >
                                                        <FaUser className="text-gray-700 mb-1" />
                                                        <span className="text-xs font-medium">Profile</span>
                                                    </Link>
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                                                    >
                                                        <FaSignOutAlt className="text-red-600 mb-1" />
                                                        <span className="text-xs font-medium text-red-600">Sign Out</span>
                                                    </button>
                                                </div>

                                                {/* Dashboard Links */}
                                                {getDashboardLinks().length > 0 && (
                                                    <div className="space-y-2">
                                                        {getDashboardLinks().map((link) => (
                                                            <Link
                                                                key={link.name}
                                                                href={link.href}
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:shadow-lg transition-shadow"
                                                            >
                                                                {link.icon}
                                                                <span className="font-medium">{link.name}</span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <Link
                                                href="/auth/signin"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
                                            >
                                                <FaUser className="text-lg" />
                                                <span>Sign In / Register</span>
                                            </Link>
                                        )}
                                    </div>

                                    {/* Navigation Items */}
                                    <div className="p-4">
                                        <div className="space-y-1">
                                            {navigation.map((item) => renderMobileItem(item))}

                                            <Link
                                                href="/shop"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                                    <FiShoppingBag className="text-white" />
                                                </div>
                                                <span className="font-medium text-gray-900">Shop</span>
                                                <span className="ml-auto text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                    New
                                                </span>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Contact Section */}
                                    <div className="p-4 mt-2
                  ">
                                        <a
                                            href={`tel:${contactNumber.replace(/\s+/g, '')}`}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
                                                <FiPhone className="w-5 h-5 text-white" />
                                            </div>

                                            <div className="block lg:hidden">
                                                <p className="text-xs text-gray-500">Call</p>
                                                <p className="font-bold text-gray-900 text-sm">{contactNumber}</p>
                                            </div>

                                            <div className="hidden lg:block">
                                                <p className="text-xs text-gray-500">Call Support</p>
                                                <p className="font-bold text-gray-900">{contactNumber}</p>
                                            </div>
                                        </a>
                                    </div>


                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Padding for fixed navbar */}
            <div className="h-16 lg:hidden" />

            {/* Cart Slider */}
            <div className="relative z-[9999]">
                <CartSlider isOpen={isCartOpen} setIsOpen={setIsCartOpen} conversionRates={conversionRates} />
            </div>
        </>
    );
}