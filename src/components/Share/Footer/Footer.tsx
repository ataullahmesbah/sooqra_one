'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300 pt-10 pb-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10">
                    {/* 1st Section: Brand & Description */}


                    <div className="space-y-4">
                        {/* Logo and brand name SVG */}
                        <div
                            className="h-10 md:h-12 lg:h-14 w-auto bg-no-repeat bg-contain"
                            style={{
                                backgroundImage: 'url("/path.png")',
                                backgroundSize: 'contain',
                                backgroundPosition: 'left',
                                width: '250px',
                                height: '58px',
                            }}
                            role="img"
                            aria-label="Sooqra One"
                        />

                        <p className="text-sm leading-relaxed">
                            Sooqra One is your trusted source for safe, organic, and premium quality food products.
                            We maintain the highest quality standards in delivery and product sourcing, offering a
                            diverse range of health-focused items including organic products, pure essentials,
                            and premium food items for a healthier lifestyle.
                        </p>
                    </div>

                    {/* 2nd Section: Company Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-4 pb-2 border-b border-gray-700">Company</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about-us" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/return-policy" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                                    Return & Refund Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/customer-care" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                                    Customer Care
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 3rd Section: Quick Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-4 pb-2 border-b border-gray-700">Quick Links</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/products" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                                    All Categories
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                                    Blogs
                                </Link>
                            </li>
                            <li>
                                <Link href="/track/orders" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                                    Track Order
                                </Link>
                            </li>
                            <li>
                                <Link href="/offers" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                                    Special Offers
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 4th Section: Contact & Social */}
                    <div className="space-y-6">
                        {/* Contact Info */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-4 pb-2 border-b border-gray-700">Contact Us</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Call Us</p>
                                        <a href="tel:+8801571083401" className="text-white hover:text-gray-300 transition-colors duration-300 text-sm font-medium">
                                            +880 1571-083401
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Email Us</p>
                                        <a href="mailto:contact@sooqraone.com" className="text-white hover:text-gray-300 transition-colors duration-300 text-sm font-medium">
                                            contact@sooqraone.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Business Hours</p>
                                        <p className="text-white text-sm">10:00 AM - 08:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-4 pb-2 border-b border-gray-700">Follow Us</h4>
                            <div className="flex gap-3">
                                <a
                                    href="https://facebook.com/sooqraone"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-300"
                                    aria-label="Facebook"
                                >
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                    </svg>
                                </a>

                                <a
                                    href="https://instagram.com/sooqraone"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-300"
                                    aria-label="Instagram"
                                >
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.097 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                    </svg>
                                </a>

                                <a
                                    href="https://wa.me/8801571083401"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors duration-300"
                                    aria-label="WhatsApp"
                                >
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12.008 2c-5.546 0-10.004 4.458-10.004 10.004 0 1.768.472 3.488 1.367 4.997L1.997 22l5.253-1.389c1.465.872 3.136 1.393 4.858 1.393 5.546 0 10.004-4.458 10.004-10.004S17.554 2 12.008 2zm6.732 13.843c-.212.597-1.227 1.092-1.697 1.141-.446.048-.964.073-2.945-.611-2.395-.832-3.962-2.865-4.082-2.997-.121-.132-.976-1.277-.976-2.438 0-1.161.59-1.722.788-1.946.198-.224.436-.28.59-.28.148 0 .297 0 .424.006.132.007.31-.046.481.345.173.396.587 1.362.64 1.461.053.099.087.224.026.346-.062.122-.091.224-.181.33-.091.105-.185.232-.264.31-.099.099-.198.209-.085.408.114.198.51.857 1.093 1.385.755.681 1.394.893 1.596.993.132.066.287.055.396-.066.109-.121.462-.541.585-.727.122-.185.244-.154.41-.092.165.062 1.055.497 1.237.588.181.091.307.137.354.215.047.077.047.445-.165 1.042z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 my-6"></div>

                {/* Copyright & Bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-sm text-gray-400">
                            © {currentYear} Sooqra One. All rights reserved.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Safe & Organic Food Products | Premium Quality Guaranteed
                        </p>
                    </div>

                    <div className="flex flex-col space-y-2 items-center">
                        {/* XML for Search Engines */}
                        <Link
                            href="/sitemap.xml"
                            className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors duration-300"
                        >
                            Sitemap
                        </Link>

                    </div>
                </div>


            </div>
        </footer>
    );
};

export default Footer;