"use client";

import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Left: Brand */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold text-blue-600">
                            SOOQRA ONE
                        </Link>
                    </div>

                    {/* Right: Links */}
                    <div className="hidden md:flex space-x-8">
                        <Link href="/" className="text-gray-700 hover:text-blue-600">
                            Home
                        </Link>
                        <Link href="/shop" className="text-gray-700 hover:text-blue-600">
                            Shop
                        </Link>
                        <Link href="/about" className="text-gray-700 hover:text-blue-600">
                            About
                        </Link>
                        <Link href="/contact" className="text-gray-700 hover:text-blue-600">
                            Contact
                        </Link>
                    </div>

                </div>
            </div>
        </nav>
    );
}
