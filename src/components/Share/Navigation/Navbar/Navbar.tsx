'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    FiChevronDown,
    FiChevronUp,
    FiPhone,
    FiMenu,
    FiX,
    FiShoppingBag,
    FiHome,
    FiUser
} from 'react-icons/fi';
import { NavigationItem } from '@/src/types/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
    contactNumber?: string;
}

export default function Navbar({ contactNumber = '+880 1571-083401' }: NavbarProps) {
    const [navigation, setNavigation] = useState<NavigationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
    }, [pathname]);

    // Toggle dropdown
    const toggleDropdown = (id: string) => {
        setActiveDropdown(activeDropdown === id ? null : id);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.nav-dropdown') && !target.closest('.nav-dropdown-button')) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    if (loading) {
        return (
            <nav className={`bg-gray-100 border-b border-gray-200/50 backdrop-blur-sm transition-all duration-300 sticky top-0 z-50 ${isScrolled ? 'shadow-md' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-3.5 bg-gray-300/50 rounded-full w-20 animate-pulse"></div>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-4 bg-gray-300/50 rounded-full w-32 animate-pulse"></div>
                            <div className="h-8 w-8 bg-gray-300/50 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

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
                                <FiChevronDown className="w-3.5 h-3.5" />
                            </span>
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && hasChildren && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/80 py-2 z-50 backdrop-blur-sm"
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
                                            <FiChevronDown className="w-3 h-3 ml-auto opacity-0 -rotate-90 group-hover/item:opacity-100 transition-all duration-200" />
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
                            onClick={() => setMobileMenuOpen(false)}
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
                            <FiChevronDown className="w-4 h-4" />
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
            {/* Desktop Navbar */}
            <nav className={`bg-gray-100/95 backdrop-blur-sm border-b border-gray-200/50 transition-all duration-300 sticky top-0 z-50 ${isScrolled ? 'shadow-lg' : ''
                } hidden md:block`}>
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left: Navigation Items */}
                        <div className="flex items-center space-x-1">
                            {/* Home Link */}
                            {/* <Link
                                href="/"
                                className={`flex items-center text-[13px] font-medium px-3 py-2.5 rounded-lg transition-all duration-200 ${pathname === '/'
                                    ? 'text-gray-900 bg-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                                    }`}
                            >
                                <FiHome className="w-3.5 h-3.5 mr-1.5" />
                                Home
                                {pathname === '/' && (
                                    <motion.span
                                        layoutId="homeIndicator"
                                        className="absolute -bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-gray-800 to-gray-600 rounded-full"
                                    />
                                )}
                            </Link> */}

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
                                <FiShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                                Shop
                                {pathname.startsWith('/shop') && (
                                    <motion.span
                                        layoutId="shopIndicator"
                                        className="absolute -bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-gray-800 to-gray-600 rounded-full"
                                    />
                                )}
                            </Link>
                        </div>

                        {/* Right: Contact Number & Account */}
                        <div className="flex items-center gap-4">
                            {/* Contact Number */}
                            <a
                                href={`tel:${contactNumber.replace(/\s+/g, '')}`}
                                className="group flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-all duration-200"
                            >
                                <div className="relative">
                                    <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-sm group-hover:shadow transition-all duration-300">
                                        <FiPhone className="w-4 h-4 text-white" />
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

                           
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navbar */}
            <nav className={`bg-gray-100/95 backdrop-blur-sm border-b border-gray-200/50 transition-all duration-300 sticky top-0 z-50 ${isScrolled ? 'shadow-lg' : ''
                } md:hidden`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        {/* Logo / Brand */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center shadow-sm">
                                    <span className="text-white font-bold text-sm">SO</span>
                                </div>
                                <span className="text-gray-900 font-bold text-sm">Sooqra One</span>
                            </Link>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-3">
                            {/* Contact Button */}
                            <a
                                href={`tel:${contactNumber.replace(/\s+/g, '')}`}
                                className="flex items-center gap-1.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-sm"
                            >
                                <FiPhone className="w-3 h-3" />
                                <span className="hidden xs:inline">Call</span>
                            </a>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="w-8 h-8 rounded-full border border-gray-300 bg-white/50 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-white hover:border-gray-400 transition-all duration-200"
                            >
                                {mobileMenuOpen ? (
                                    <FiX className="w-4 h-4" />
                                ) : (
                                    <FiMenu className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/50 shadow-xl overflow-hidden"
                        >
                            <div className="p-4 max-h-[calc(100vh-56px)] overflow-y-auto">
                                {/* Home Link */}
                                {/* <Link
                                    href="/"
                                    className={`flex items-center py-3 px-2 rounded-lg transition-all duration-200 ${pathname === '/'
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <FiHome className="w-4 h-4 mr-3" />
                                    Home
                                </Link> */}

                                {/* Navigation Items */}
                                {navigation.map((item) => renderMobileItem(item))}

                                {/* Shop Link */}
                                <Link
                                    href="/shop"
                                    className={`flex items-center py-3 px-2 rounded-lg transition-all duration-200 ${pathname.startsWith('/shop')
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <FiShoppingBag className="w-4 h-4 mr-3" />
                                    Shop
                                </Link>

                                {/* Divider */}
                                <div className="my-4 border-t border-gray-200"></div>

                                {/* Account Link */}
                                <Link
                                    href="/account"
                                    className="flex items-center py-3 px-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                                    onClick={() => setMobileMenuOpen(false)}
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
        </>
    );
}