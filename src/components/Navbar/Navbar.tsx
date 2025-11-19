"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Left: Brand & Mobile Menu Button */}
                    <div className="flex items-center">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>

                        {/* Brand Logo */}
                        <Link href="/" className="flex items-center space-x-2 ml-2 md:ml-0">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">S1</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 hidden sm:block">
                                SOOQRA <span className="text-blue-600">ONE</span>
                            </span>
                        </Link>
                    </div>

                    {/* Center: Navigation Links - Desktop */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                            Home
                        </Link>

                        {/* Shop Dropdown */}
                        <div className="relative group">
                            <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center">
                                Shop
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="py-2">
                                    <Link href="/shop/all" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                                        All Products
                                    </Link>
                                    <Link href="/shop/electronics" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                                        Electronics
                                    </Link>
                                    <Link href="/shop/fashion" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                                        Fashion
                                    </Link>
                                    <Link href="/shop/home" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                                        Home & Garden
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link href="/deals" className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200 flex items-center">
                            <span className="bg-red-100 px-2 py-1 rounded-md text-sm">Hot Deals</span>
                        </Link>

                        <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                            About
                        </Link>

                        <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                            Contact
                        </Link>
                    </div>

                    {/* Right: Search, Cart, User */}
                    <div className="flex items-center space-x-4">

                        {/* Search Bar - Desktop */}
                        <div className="hidden lg:block relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Search Button - Mobile */}
                        <button className="lg:hidden p-2 text-gray-700 hover:text-blue-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Cart */}
                        <div className="relative">
                            <Link href="/cart" className="p-2 text-gray-700 hover:text-blue-600 relative">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    3
                                </span>
                            </Link>
                        </div>

                        {/* User Account */}
                        <div className="relative group">
                            <button className="p-2 text-gray-700 hover:text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="py-2">
                                    <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                                        My Account
                                    </Link>
                                    <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                                        My Orders
                                    </Link>
                                    <Link href="/wishlist" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                                        Wishlist
                                    </Link>
                                    <div className="border-t border-gray-200 mt-2 pt-2">
                                        <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="lg:hidden pb-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 py-4">
                        <div className="space-y-2">
                            <Link
                                href="/"
                                className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>

                            <div className="px-4 py-3">
                                <div className="text-gray-700 font-medium mb-2">Shop Categories</div>
                                <div className="space-y-1 ml-4">
                                    <Link href="/shop/all" className="block py-2 text-gray-600 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                                        All Products
                                    </Link>
                                    <Link href="/shop/electronics" className="block py-2 text-gray-600 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                                        Electronics
                                    </Link>
                                    <Link href="/shop/fashion" className="block py-2 text-gray-600 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                                        Fashion
                                    </Link>
                                    <Link href="/shop/home" className="block py-2 text-gray-600 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                                        Home & Garden
                                    </Link>
                                </div>
                            </div>

                            <Link
                                href="/deals"
                                className="block px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                🔥 Hot Deals
                            </Link>

                            <Link
                                href="/about"
                                className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                About
                            </Link>

                            <Link
                                href="/contact"
                                className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Contact
                            </Link>

                            {/* Mobile User Menu */}
                            <div className="border-t border-gray-200 mt-4 pt-4">
                                <Link href="/profile" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                    My Account
                                </Link>
                                <Link href="/orders" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                    My Orders
                                </Link>
                                <Link href="/wishlist" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                    Wishlist
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}