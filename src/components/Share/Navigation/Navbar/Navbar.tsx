
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaShoppingBag, FaSearch, FaBars, FaTimes, FaStore,
    FaSignOutAlt, FaTachometerAlt, FaBox, FaUser,
} from 'react-icons/fa';
import { FiChevronDown, FiPhone, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
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

// ── Skeleton navbar shown on first load ────────────────────────────────────────
function NavbarSkeleton() {
    return (
        <div className="hidden lg:block">
            <div className="bg-gray-100/95 border-b border-gray-200/50 fixed top-16 left-0 right-0 w-full z-40 h-16">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        {[80, 64, 72, 56].map((w, i) => (
                            <div key={i} className="h-8 rounded-lg bg-gray-200 animate-pulse" style={{ width: w }} />
                        ))}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                </div>
            </div>
            {/* Mobile skeleton */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4">
                <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export default function Navbar({ contactNumber = '+880 1571-083401' }: { contactNumber?: string }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    const [navigation, setNavigation] = useState<NavigationItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [cartCount, setCartCount] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isNavbarVisible, setIsNavbarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const conversionRates = { USD: 0.0091, EUR: 0.0084, BDT: 1 };

    // ── Scroll hide/show ──────────────────────────────────────────────────────
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

    // ── Fetch navigation ──────────────────────────────────────────────────────
    useEffect(() => {
        fetch('/api/navigation')
            .then(r => r.json())
            .then(data => { if (data.success) setNavigation(data.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // ── Cart count ────────────────────────────────────────────────────────────
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

    // ── Close on route change ─────────────────────────────────────────────────
    useEffect(() => {
        setMobileMenuOpen(false);
        setShowMobileSearch(false);
        setSearchQuery('');
        setShowSearchResults(false);
        setActiveDropdown(null);
    }, [pathname]);

    // ── Click outside search ──────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node))
                setShowSearchResults(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Focus search on open ──────────────────────────────────────────────────
    useEffect(() => {
        if (showMobileSearch) setTimeout(() => searchInputRef.current?.focus(), 100);
    }, [showMobileSearch]);

    // ── Search ────────────────────────────────────────────────────────────────
    const searchProducts = useCallback(async (q: string) => {
        if (!q.trim()) { setSearchResults([]); setShowSearchResults(false); return; }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}&limit=6`);
            if (res.ok) {
                const json = await res.json();
                if (json.success) { setSearchResults(json.data); setShowSearchResults(true); }
            }
        } catch (e) { console.error(e); }
        finally { setIsSearching(false); }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => searchProducts(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery, searchProducts]);

    const handleSearchKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/shop/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery(''); setShowSearchResults(false); setShowMobileSearch(false);
        }
    };

    const handleResultClick = (slug: string) => {
        router.push(`/shop/${slug}`);
        setSearchQuery(''); setShowSearchResults(false);
        setShowMobileSearch(false); setMobileMenuOpen(false);
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        setMobileMenuOpen(false);
        router.push('/'); router.refresh();
    };

    const isItemActive = (item: NavigationItem) =>
        pathname === item.slug || (item.children?.some(c => pathname === c.slug) ?? false);

    const getDashboardLinks = () => {
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

    // ── Desktop nav item ──────────────────────────────────────────────────────
    const renderDesktopItem = (item: NavigationItem) => {
        if (!item.isActive) return null;
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = activeDropdown === item._id;
        const isActive = isItemActive(item);

        const baseCls = `relative flex items-center text-[13px] font-semibold px-3 py-2.5 rounded-lg transition-all duration-200 tracking-wide`;
        const activeCls = isActive || isOpen
            ? 'text-gray-900 bg-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-white/80';

        return (
            <div key={item._id} className="relative">
                {hasChildren ? (
                    <>
                        <button onClick={() => setActiveDropdown(isOpen ? null : item._id)}
                            className={`${baseCls} ${activeCls}`}>
                            <span className="relative">
                                {item.title}
                                {/* ✅ active underline */}
                                {isActive && (
                                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gray-800 rounded-full" />
                                )}
                            </span>
                            <FiChevronDown className={`ml-1.5 w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[100] overflow-hidden"
                                >
                                    {item.children!.map(child => (
                                        <Link key={child._id} href={child.slug}
                                            onClick={() => setActiveDropdown(null)}
                                            className={`flex items-center px-4 py-2.5 text-sm transition-colors ${pathname === child.slug ? 'text-gray-900 font-semibold bg-gray-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                                            {child.title}
                                            {pathname === child.slug && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gray-800" />}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <Link href={item.slug} className={`${baseCls} ${activeCls}`}>
                        <span className="relative">
                            {item.title}
                            {isActive && (
                                <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gray-800 rounded-full" />
                            )}
                        </span>
                    </Link>
                )}
            </div>
        );
    };

    // ── Mobile nav item ───────────────────────────────────────────────────────
    const renderMobileItem = (item: NavigationItem, level = 0) => {
        if (!item.isActive) return null;
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = activeDropdown === item._id;
        const isActive = pathname === item.slug;

        return (
            <div key={item._id}>
                <div className={`flex items-center justify-between rounded-xl transition-colors ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'} ${level > 0 ? 'ml-4' : ''}`}>
                    {hasChildren ? (
                        <button onClick={() => setActiveDropdown(isOpen ? null : item._id)}
                            className={`flex-1 text-left px-4 py-3 text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                            <span className="flex items-center gap-2">
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-gray-800 flex-shrink-0" />}
                                {item.title}
                            </span>
                        </button>
                    ) : (
                        <Link href={item.slug} onClick={() => setMobileMenuOpen(false)}
                            className={`flex-1 px-4 py-3 text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                            <span className="flex items-center gap-2">
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-gray-800 flex-shrink-0" />}
                                {item.title}
                            </span>
                        </Link>
                    )}
                    {hasChildren && (
                        <button onClick={() => setActiveDropdown(isOpen ? null : item._id)} className="px-3 py-3">
                            <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
                <AnimatePresence>
                    {hasChildren && isOpen && item.children && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="ml-4 pl-3 border-l-2 border-gray-100 my-1 space-y-0.5">
                                {item.children.map(child => renderMobileItem(child, level + 1))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    // ── Search results UI ─────────────────────────────────────────────────────
    const SearchResults = () => (
        <AnimatePresence>
            {showSearchResults && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-[99999]"
                >
                    {isSearching ? (
                        <div className="p-6 flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-500 font-medium">Searching…</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <>
                            <div className="divide-y divide-gray-50 max-h-[360px] overflow-y-auto">
                                {searchResults.map(p => (
                                    <div key={p._id} onClick={() => handleResultClick(p.slug)}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors group">
                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                                            <Image src={p.mainImage} alt={p.mainImageAlt} width={48} height={48} className="object-cover w-full h-full" />
                                            {p.availability !== 'InStock' && (
                                                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                                    <span className="text-[9px] font-bold text-red-600 bg-white/90 px-1 rounded">OUT</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-gray-700">{p.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{p.category.name}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <span className="text-sm font-bold text-gray-900">৳{p.bdtPrice.toLocaleString()}</span>
                                            <FiArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                        </>
                    ) : searchQuery.trim() ? (
                        <div className="p-6 text-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <FaSearch className="text-gray-400 text-sm" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">No results for {searchQuery}</p>
                            <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
                        </div>
                    ) : null}
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (loading) return <NavbarSkeleton />;

    return (
        <>
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* DESKTOP NAVBAR                                                  */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="hidden lg:block">
                <motion.nav
                    animate={{ top: isNavbarVisible ? 64 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gray-100/95 backdrop-blur-sm border-b border-gray-200/50 fixed left-0 right-0 w-full z-40 shadow-sm"
                >
                    <div className="max-w-7xl mx-auto px-4 lg:px-8">
                        <div className="flex items-center justify-between h-16 gap-4">

                            {/* Left: logo (only when scrolled up) + nav items */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {!isNavbarVisible && (
                                    <Link href="/" className="mr-4 flex-shrink-0">
                                        <Image src="/sooqraone.png" alt="Sooqra One" width={160} height={52}
                                            className="object-contain h-12 w-auto select-none pointer-events-none"
                                            priority draggable={false}
                                            onContextMenu={e => e.preventDefault()}
                                            onDragStart={e => e.preventDefault()} />
                                    </Link>
                                )}
                                {navigation.map(renderDesktopItem)}
                                {/* Shop link */}
                                <Link href="/shop"
                                    className={`relative flex items-center text-[13px] font-semibold px-3 py-2.5 rounded-lg transition-all tracking-wide ${pathname.startsWith('/shop') ? 'text-gray-900 bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'}`}>
                                    <FiShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                                    <span className="relative">
                                        Shop
                                        {pathname.startsWith('/shop') && (
                                            <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gray-800 rounded-full" />
                                        )}
                                    </span>
                                </Link>
                            </div>

                            {/* Right: search + cart / phone */}
                            <div className="flex items-center gap-3">
                                {!isNavbarVisible ? (
                                    <>
                                        {/* ✅ Search bar — desktop */}
                                        <div className="relative w-64 xl:w-80" ref={searchRef}>
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                onKeyDown={handleSearchKey}
                                                onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                                                placeholder="Search products…"
                                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all shadow-sm"
                                            />
                                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                            <SearchResults />
                                        </div>

                                        {/* Cart */}
                                        <button onClick={() => setIsCartOpen(true)}
                                            className="relative p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all group shadow-sm"
                                            aria-label="Cart">
                                            <FaShoppingBag className="w-4 h-4 text-white" />
                                            {cartCount > 0 && (
                                                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 flex items-center justify-center bg-amber-400 text-gray-900 text-[10px] font-extrabold rounded-full ring-2 ring-white">
                                                    {cartCount > 99 ? '99+' : cartCount}
                                                </span>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    /* Phone (when scrolled to top) */
                                    <a href={`tel:${contactNumber.replace(/\s+/g, '')}`} className="flex items-center gap-2.5 group">
                                        <div className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                                            <FiPhone className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="hidden xl:block">
                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Call Support</p>
                                            <p className="text-sm font-bold text-gray-800">{contactNumber}</p>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.nav>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MOBILE & TABLET NAVBAR                                          */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="lg:hidden">
                {/* Fixed top bar */}
                <nav className="bg-white border-b border-gray-100 fixed top-0 left-0 right-0 z-50 h-16 shadow-sm">
                    <div className="flex items-center justify-between h-full px-4">
                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0">
                            <Image src="/sooqraone.png" alt="Sooqra One" width={140} height={44}
                                className="h-10 w-auto select-none pointer-events-none"
                                priority draggable={false}
                                onContextMenu={e => e.preventDefault()}
                                onDragStart={e => e.preventDefault()} />
                        </Link>

                        {/* Right icons */}
                        <div className="flex items-center gap-2">
                            {/* Search icon */}
                            <button
                                onClick={() => { setShowMobileSearch(p => !p); setMobileMenuOpen(false); }}
                                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${showMobileSearch ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                aria-label="Search">
                                <FaSearch className="text-sm" />
                            </button>

                            {/* Cart */}
                            <button onClick={() => setIsCartOpen(true)}
                                className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
                                aria-label="Cart">
                                <FiShoppingBag className="w-4 h-4 text-white" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-amber-400 text-gray-900 text-[10px] font-extrabold rounded-full ring-2 ring-white">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Hamburger */}
                            <button
                                onClick={() => { setMobileMenuOpen(p => !p); setShowMobileSearch(false); }}
                                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${mobileMenuOpen ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                aria-label="Menu">
                                {mobileMenuOpen ? <FaTimes className="text-sm" /> : <FaBars className="text-sm" />}
                            </button>
                        </div>
                    </div>
                </nav>

                {/* ── Mobile search panel ──────────────────────────────────── */}
                <AnimatePresence>
                    {showMobileSearch && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-[200] overflow-hidden"
                        >
                            <div className="px-4 py-3" ref={searchRef}>
                                <div className="relative">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onKeyDown={handleSearchKey}
                                        placeholder="Search products…"
                                        className="w-full pl-10 pr-10 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                    />
                                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                    {searchQuery && (
                                        <button onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors">
                                            <FaTimes className="text-[10px]" />
                                        </button>
                                    )}
                                </div>

                                {/* Mobile search results */}
                                <AnimatePresence>
                                    {showSearchResults && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
                                        >
                                            {isSearching ? (
                                                <div className="py-6 flex flex-col items-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                                                    <p className="text-xs text-gray-400">Searching…</p>
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                <>
                                                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                                                        {searchResults.map(p => (
                                                            <div key={p._id} onClick={() => handleResultClick(p.slug)}
                                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer active:bg-gray-100 transition-colors">
                                                                <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                                                                    <Image src={p.mainImage} alt={p.mainImageAlt} width={44} height={44} className="object-cover w-full h-full" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                                                                    <p className="text-xs text-gray-400 mt-0.5">{p.category.name}</p>
                                                                </div>
                                                                <span className="text-sm font-bold text-gray-900 flex-shrink-0">৳{p.bdtPrice.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* <button onClick={() => { router.push(`/shop/search?q=${encodeURIComponent(searchQuery)}`); setShowSearchResults(false); setShowMobileSearch(false); }}
                                                        className="w-full py-3 text-xs font-semibold text-gray-500 hover:text-gray-800 border-t border-gray-50 flex items-center justify-center gap-1.5 transition-colors">
                                                        See all results <FiArrowRight className="w-3.5 h-3.5" />
                                                    </button> */}
                                                </>
                                            ) : searchQuery.trim() ? (
                                                <div className="py-6 text-center">
                                                    <p className="text-sm font-medium text-gray-600">No results found</p>
                                                    <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
                                                </div>
                                            ) : null}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Mobile menu drawer ───────────────────────────────────── */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[300] lg:hidden"
                            />

                            {/* Drawer */}
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                                className="fixed top-0 right-0 bottom-0 w-[82%] max-w-[340px] bg-white z-[400] flex flex-col shadow-2xl lg:hidden"
                            >
                                {/* Drawer header */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                    <span className="text-base font-bold text-gray-900">Menu</span>
                                    <button onClick={() => setMobileMenuOpen(false)}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                                        <FaTimes className="text-sm text-gray-600" />
                                    </button>
                                </div>

                                {/* Scrollable content */}
                                <div className="flex-1 overflow-y-auto">

                                    {/* ── User section ──────────────────────── */}
                                    <div className="px-4 py-4 border-b border-gray-50">
                                        {session?.user ? (
                                            <div className="space-y-3">
                                                {/* User info */}
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                        <FaUser className="text-gray-500 text-sm" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 text-sm truncate">
                                                            {session.user.name?.split(' ')[0] || 'User'}
                                                        </p>
                                                        <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg flex-shrink-0 ${session.user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                                            session.user.role === 'moderator' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {(session.user.role || 'user').toUpperCase()}
                                                    </span>
                                                </div>

                                                {/* Quick actions */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Link href="/account" onClick={() => setMobileMenuOpen(false)}
                                                        className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                        <FaUser className="text-gray-600 text-base" />
                                                        <span className="text-xs font-semibold text-gray-700">Profile</span>
                                                    </Link>
                                                    <button onClick={handleSignOut}
                                                        className="flex flex-col items-center gap-1.5 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                                                        <FaSignOutAlt className="text-red-500 text-base" />
                                                        <span className="text-xs font-semibold text-red-600">Sign Out</span>
                                                    </button>
                                                </div>

                                                {/* Dashboard links */}
                                                {getDashboardLinks().map(link => (
                                                    <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors">
                                                        <span className="text-sm">{link.icon}</span>
                                                        <span className="text-sm font-semibold">{link.name}</span>
                                                        <FiArrowRight className="ml-auto w-4 h-4 opacity-60" />
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            /* Not signed in */
                                            <div className="space-y-2">
                                                <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-gray-800 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors">
                                                    <FaUser className="text-sm" />
                                                    Sign In
                                                </Link>
                                                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-800 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors">
                                                    Register
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Navigation links ───────────────────── */}
                                    <div className="px-3 py-3 space-y-0.5">
                                        {navigation.map(item => renderMobileItem(item))}

                                        {/* Shop link */}
                                        <Link href="/shop" onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname.startsWith('/shop') ? 'bg-gray-50 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                                            <FiShoppingBag className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm font-medium flex-1">Shop</span>
                                            {pathname.startsWith('/shop') && <span className="w-1.5 h-1.5 rounded-full bg-gray-800" />}
                                        </Link>
                                    </div>

                                    {/* ── Contact ────────────────────────────── */}
                                    <div className="px-4 py-4 mt-2 border-t border-gray-50">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact</p>
                                        <a href={`tel:${contactNumber.replace(/\s+/g, '')}`}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                                                <FiPhone className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400">Call Support</p>
                                                <p className="text-sm font-bold text-gray-800">{contactNumber}</p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Spacer for fixed navbar */}
                <div className="h-16" />
            </div>

            {/* Cart Slider */}
            <div className="relative z-[9999]">
                <CartSlider isOpen={isCartOpen} setIsOpen={setIsCartOpen} conversionRates={conversionRates} />
            </div>
        </>
    );
}
