'use client';
// src/components/Share/TopNavbar/TopNavbar.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaShoppingBag, FaSearch, FaUser, FaBars, FaTimes,
    FaSignOutAlt, FaCaretDown, FaTachometerAlt, FaBox,
} from 'react-icons/fa';
import { signOut, useSession } from 'next-auth/react';
import CartSlider from '../Share/Shop/CartSlider/CartSlider';

// ── Types ──────────────────────────────────────────────────────────────────────
interface SearchResult {
    _id: string; title: string; slug: string;
    mainImage: string; mainImageAlt: string;
    bdtPrice: number;
    category: { _id: string; name: string; slug: string };
    brand: string; availability: string;
}
interface ConversionRates { USD: number; EUR: number; BDT: number;[k: string]: number; }
interface Category { _id: string; name: string; slug: string; }

// ── ✨ Enhanced Skeleton with Shimmer Effect ──────────────────────────────────
function TopNavSkeleton() {
    return (
        <nav className="bg-gradient-to-r from-gray-100 to-gray-50 shadow-sm border-b border-gray-200 fixed top-0 left-0 w-full z-50 h-16">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                
                {/* Logo Skeleton */}
                <div className="flex-shrink-0">
                    <div className="relative w-40 h-10 md:w-48 md:h-11">
                        <div className="w-full h-full rounded-lg skeleton-shimmer" />
                    </div>
                </div>

                {/* Search Bar Skeleton */}
                <div className="flex-1 max-w-2xl">
                    <div className="relative">
                        <div className="w-full h-11 rounded-full skeleton-shimmer" />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-300/50" />
                    </div>
                </div>

                {/* Right Actions Skeleton */}
                <div className="flex items-center gap-3">
                    {/* User Menu Skeleton */}
                    <div className="flex items-center gap-2.5 px-3 py-2">
                        <div className="relative">
                            <div className="w-9 h-9 rounded-full skeleton-shimmer" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full skeleton-shimmer" />
                        </div>
                        <div className="hidden xl:flex flex-col items-start gap-1">
                            <div className="w-16 h-4 rounded skeleton-shimmer" />
                            <div className="w-12 h-3 rounded skeleton-shimmer" />
                        </div>
                        <div className="w-3 h-3 rounded skeleton-shimmer" />
                    </div>

                    {/* Cart Skeleton */}
                    <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900">
                        <div className="w-4 h-4 rounded skeleton-shimmer" />
                    </div>

                    {/* Mobile Menu Skeleton */}
                    <div className="xl:hidden p-2">
                        <div className="w-6 h-6 rounded skeleton-shimmer" />
                    </div>
                </div>
            </div>
        </nav>
    );
}

// ── Search dropdown ────────────────────────────────────────────────────────────
function SearchDropdown({
    loading, results, query, onResultClick,
}: {
    loading: boolean; results: SearchResult[]; query: string; onResultClick: (slug: string) => void;
}) {
    if (!query.trim()) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-[99999] max-h-[420px] overflow-y-auto"
        >
            {loading ? (
                <div className="flex flex-col items-center py-6 gap-2">
                    <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-500 font-medium">Searching…</p>
                </div>
            ) : results.length > 0 ? (
                <div>
                    <p className="px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        {results.length} result{results.length !== 1 ? 's' : ''} found
                    </p>
                    {results.map(p => (
                        <div key={p._id} onClick={() => onResultClick(p.slug)} className="nav-search-result">
                            <div className="nav-search-result-img relative">
                                <Image src={p.mainImage} alt={p.mainImageAlt || p.title} fill className="object-cover" sizes="44px" />
                                {p.availability !== 'InStock' && (
                                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                        <span className="text-[9px] font-bold text-red-600 bg-white/90 px-1 rounded">OUT</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="nav-search-result-title">{p.title}</p>
                                <div className="nav-search-result-meta mt-1">
                                    <span className="nav-search-result-category">{p.category.name}</span>
                                    <span className="nav-search-result-price">৳{p.bdtPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center py-8 gap-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <FaSearch className="text-gray-400 text-sm" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">No products found</p>
                    <p className="text-xs text-gray-400">Try different keywords</p>
                </div>
            )}
        </motion.div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function TopNavbar() {
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [isNavbarVisible, setIsNavbarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const [conversionRates] = useState<ConversionRates>({ USD: 0.0091, EUR: 0.0084, BDT: 1 });
    const searchRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // ✅ mounted check — avoid hydration mismatch for skeleton
    useEffect(() => { setMounted(true); }, []);

    // Scroll behaviour
    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            if (y > lastScrollY && y > 100) {
                setIsNavbarVisible(false);
                setShowSearchResults(false);
                setShowUserMenu(false);
            } else if (y < lastScrollY) {
                setIsNavbarVisible(true);
            }
            setLastScrollY(y);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [lastScrollY]);

    // Cart count
    useEffect(() => {
        const update = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(cart.reduce((s: number, i: any) => s + i.quantity, 0));
        };
        update();
        window.addEventListener('storage', update);
        window.addEventListener('cartUpdated', update);
        return () => { window.removeEventListener('storage', update); window.removeEventListener('cartUpdated', update); };
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const t = e.target as HTMLElement;
            if (searchRef.current && !searchRef.current.contains(t)) setShowSearchResults(false);
            if (userMenuRef.current && !userMenuRef.current.contains(t)) setShowUserMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Auto-focus mobile search
    useEffect(() => {
        if (showMobileSearch) setTimeout(() => searchInputRef.current?.focus(), 80);
    }, [showMobileSearch]);

    // ✅ Debounced search — 350ms
    const searchProducts = useCallback(async (q: string) => {
        if (!q.trim()) { setSearchResults([]); setShowSearchResults(false); return; }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}&limit=6&sort=relevance`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) { setSearchResults(data.data); setShowSearchResults(true); }
            }
        } catch { setSearchResults([]); }
        finally { setIsSearching(false); }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => searchProducts(searchQuery), 350);
        return () => clearTimeout(t);
    }, [searchQuery, searchProducts]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        router.push(`/shop/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchQuery(''); setShowSearchResults(false); setShowMobileSearch(false);
    };

    const handleResultClick = (slug: string) => {
        router.push(`/shop/${slug}`);
        setSearchQuery(''); setShowSearchResults(false);
        setShowMobileSearch(false); setIsMobileMenuOpen(false);
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        setShowUserMenu(false); setIsMobileMenuOpen(false);
        router.push('/'); router.refresh();
    };

    const getUserName = () => {
        if (!session?.user?.name) return session?.user?.email?.split('@')[0] || 'User';
        return session.user.name.split(' ')[0];
    };

    const getRoleBg = (role: string) => {
        if (role === 'admin') return 'bg-red-600 text-white';
        if (role === 'moderator') return 'bg-blue-600 text-white';
        return 'bg-gray-600 text-white';
    };

    const dashboardLinks = () => {
        if (!session?.user?.role) return [];
        if (session.user.role === 'admin') return [
            { name: 'Admin Dashboard', href: '/admin-dashboard', icon: <FaTachometerAlt /> },
            { name: 'Manage Products', href: '/admin-dashboard/shop/all-products', icon: <FaBox /> },
        ];
        if (session.user.role === 'moderator') return [
            { name: 'Moderator Panel', href: '/moderator-dashboard', icon: <FaTachometerAlt /> },
        ];
        return [];
    };

    // ── Show skeleton while loading ────────────────────────────────────────────
    if (!mounted || status === 'loading') return <TopNavSkeleton />;

    // ── Cart badge ─────────────────────────────────────────────────────────────
    const CartBadge = () => cartCount > 0 ? (
        <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1.5 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-[10px] font-extrabold rounded-full shadow-lg ring-2 ring-white">
            {cartCount > 99 ? '99+' : cartCount}
        </span>
    ) : null;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <>
            <motion.nav
                animate={{ y: isNavbarVisible ? 0 : -64 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="bg-gradient-to-r from-gray-100 to-gray-50 shadow-sm border-b border-gray-200 fixed top-0 left-0 w-full z-50 h-16"
            >
                <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 hover:opacity-90 transition-opacity">
                        <div className="relative w-40 h-10 md:w-48 md:h-11">
                            <Image src="/sooqraone.png" alt="Sooqra One" fill className="object-contain select-none pointer-events-none" priority draggable={false} />
                        </div>
                    </Link>

                    {/* Search — desktop */}
                    <div className="flex-1 max-w-2xl relative" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit}>
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                                    placeholder="পণ্য খুঁজুন…"
                                    className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 focus:border-gray-800 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800/20 transition-all text-sm font-medium shadow-sm"
                                />
                            </div>
                        </form>
                        <AnimatePresence>
                            {showSearchResults && (
                                <SearchDropdown
                                    loading={isSearching}
                                    results={searchResults}
                                    query={searchQuery}
                                    onResultClick={handleResultClick}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-3">

                        {/* User menu */}
                        <div className="relative" ref={userMenuRef}>
                            {session?.user ? (
                                <>
                                    <button
                                        onClick={() => setShowUserMenu(v => !v)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/80 transition-all group"
                                    >
                                        <div className="relative">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-300 flex items-center justify-center group-hover:border-gray-400 transition-all">
                                                <FaUser className="text-gray-700 text-sm" />
                                            </div>
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${getRoleBg(session.user.role)} rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold`}>
                                                {session.user.role?.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="hidden xl:flex flex-col items-start leading-none">
                                            <span className="text-[13px] font-semibold text-gray-900">{getUserName()}</span>
                                            <span className="text-[11px] text-gray-500 capitalize mt-0.5">{session.user.role}</span>
                                        </div>
                                        <FaCaretDown className={`text-gray-500 text-xs transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {showUserMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                                transition={{ duration: 0.15 }}
                                                className="user-menu"
                                            >
                                                {/* Header */}
                                                <div className="user-menu-header">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                                                            <FaUser className="text-gray-700 text-base" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[13px] font-semibold text-gray-900 truncate">{session.user.name}</p>
                                                            <p className="text-[11px] text-gray-500 truncate">{session.user.email}</p>
                                                            <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold ${getRoleBg(session.user.role)}`}>
                                                                {session.user.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Dashboard links */}
                                                {dashboardLinks().length > 0 && (
                                                    <div className="py-1.5 border-b border-gray-100">
                                                        <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dashboard</p>
                                                        {dashboardLinks().map(l => (
                                                            <Link key={l.name} href={l.href} onClick={() => setShowUserMenu(false)} className="user-menu-link">
                                                                <span className="text-gray-500 text-xs">{l.icon}</span>
                                                                <span className="text-[13px]">{l.name}</span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Profile */}
                                                <div className="py-1.5 border-b border-gray-100">
                                                    <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">My Account</p>
                                                    <Link href="/account" onClick={() => setShowUserMenu(false)} className="user-menu-link">
                                                        <FaUser className="text-gray-500 text-xs" />
                                                        <span className="text-[13px]">My Profile</span>
                                                    </Link>
                                                </div>

                                                {/* Sign out */}
                                                <div className="p-3">
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="w-full flex items-center justify-center gap-2 py-2 bg-gray-900 text-white rounded-xl text-[13px] font-semibold hover:bg-gray-800 transition-colors"
                                                    >
                                                        <FaSignOutAlt className="text-xs" />
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            ) : (
                                <Link href="/auth/signin" className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-[13px] font-semibold hover:bg-gray-800 transition-colors shadow-sm">
                                    <FaUser className="text-xs" />
                                    Sign In
                                </Link>
                            )}
                        </div>

                        {/* Cart */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow hover:shadow-md hover:scale-105 transition-all group"
                            aria-label="Cart"
                        >
                            <FaShoppingBag className="w-4 h-4 text-white group-hover:text-yellow-300 transition-colors" />
                            <CartBadge />
                        </button>

                        {/* Mobile menu toggle */}
                        <button onClick={() => setIsMobileMenuOpen(v => !v)} className="xl:hidden p-2 text-gray-700 hover:text-gray-900">
                            {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
                        </button>
                    </div>
                </div>

                {/* Mobile search bar */}
                <AnimatePresence>
                    {showMobileSearch && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mob-search-overlay"
                        >
                            <form onSubmit={handleSearchSubmit}>
                                <div className="relative">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="পণ্য খুঁজুন…"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-full focus:outline-none focus:border-gray-800 text-sm"
                                    />
                                </div>
                            </form>
                            <AnimatePresence>
                                {showSearchResults && (
                                    <div className="mt-2">
                                        <SearchDropdown loading={isSearching} results={searchResults} query={searchQuery} onResultClick={handleResultClick} />
                                    </div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] xl:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 h-full overflow-y-auto">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                                    <button onClick={() => setIsMobileMenuOpen(false)}>
                                        <FaTimes className="text-2xl text-gray-600" />
                                    </button>
                                </div>

                                {/* Mobile Search Toggle */}
                                <button
                                    onClick={() => setShowMobileSearch(!showMobileSearch)}
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl mb-4"
                                >
                                    <FaSearch className="text-gray-600" />
                                    <span className="text-gray-700 font-medium">Search Products</span>
                                </button>

                                {/* Mobile Navigation Links */}
                                <div className="space-y-2">
                                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors">
                                        Home
                                    </Link>
                                    <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors">
                                        Shop
                                    </Link>
                                    {session?.user && (
                                        <>
                                            <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors">
                                                My Account
                                            </Link>
                                            {dashboardLinks().map(l => (
                                                <Link key={l.name} href={l.href} onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors">
                                                    {l.name}
                                                </Link>
                                            ))}
                                        </>
                                    )}
                                </div>

                                {/* Sign Out Button */}
                                {session?.user && (
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                                    >
                                        <FaSignOutAlt />
                                        Sign Out
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CartSlider */}
            <div className="z-[9999] relative">
                <CartSlider isOpen={isCartOpen} setIsOpen={setIsCartOpen} conversionRates={conversionRates} />
            </div>
        </>
    );
}