'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    FiFacebook,
    FiInstagram,
    FiTwitter,
    FiYoutube,
    FiLinkedin,
    FiMail,
    FiPhone,
    FiMapPin,
    FiClock,
    FiChevronRight,
    FiShoppingBag,
    FiShield,
    FiTruck,
    FiCreditCard,
    FiHelpCircle
} from 'react-icons/fi';
import { FaWhatsapp, FaTiktok } from 'react-icons/fa';

interface FooterLink {
    title: string;
    slug: string;
    isActive: boolean;
    order: number;
}

export default function Footer() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    // Footer links data
    const footerLinks = {
        shop: [
            { title: 'All Products', slug: '/shop' },
            { title: 'New Arrivals', slug: '/shop?filter=new' },
            { title: 'Best Sellers', slug: '/shop?filter=bestsellers' },
            { title: 'Trending Now', slug: '/shop?filter=trending' },
            { title: 'Special Offers', slug: '/shop?filter=offers' },
            { title: 'Gift Cards', slug: '/gift-cards' }
        ],
        categories: [
            { title: 'Electronics', slug: '/shop?category=electronics' },
            { title: 'Fashion', slug: '/shop?category=fashion' },
            { title: 'Home & Living', slug: '/shop?category=home' },
            { title: 'Beauty & Health', slug: '/shop?category=beauty' },
            { title: 'Sports & Outdoors', slug: '/shop?category=sports' },
            { title: 'Books & Stationery', slug: '/shop?category=books' }
        ],
        company: [
            { title: 'About Us', slug: '/about-us' },
            { title: 'Our Story', slug: '/about-us#story' },
            { title: 'Careers', slug: '/careers' },
            { title: 'Press & Media', slug: '/press' },
            { title: 'Affiliate Program', slug: '/affiliate' },
            { title: 'Sell on Sooqra One', slug: '/sell-with-us' }
        ],
        help: [
            { title: 'Customer Care', slug: '/customer-care' },
            { title: 'FAQs', slug: '/faq' },
            { title: 'Order Tracking', slug: '/track-order' },
            { title: 'Size Guide', slug: '/size-guide' },
            { title: 'Contact Us', slug: '/contact' },
            { title: 'Site Map', slug: '/sitemap' }
        ],
        policies: [
            { title: 'Privacy Policy', slug: '/privacy-policy' },
            { title: 'Terms & Conditions', slug: '/terms-and-policy' },
            { title: 'Return Policy', slug: '/return-policy' },
            { title: 'Shipping Policy', slug: '/shipping-policy' },
            { title: 'Cookie Policy', slug: '/cookie-policy' },
            { title: 'Accessibility', slug: '/accessibility' }
        ]
    };

    const socialLinks = [
        { icon: <FiFacebook />, label: 'Facebook', url: 'https://facebook.com/sooqraone' },
        { icon: <FiInstagram />, label: 'Instagram', url: 'https://instagram.com/sooqraone' },
        { icon: <FaTiktok />, label: 'TikTok', url: 'https://tiktok.com/@sooqraone' },
        { icon: <FiTwitter />, label: 'Twitter', url: 'https://twitter.com/sooqraone' },
        { icon: <FiYoutube />, label: 'YouTube', url: 'https://youtube.com/@sooqraone' },
        { icon: <FiLinkedin />, label: 'LinkedIn', url: 'https://linkedin.com/company/sooqraone' },
        { icon: <FaWhatsapp />, label: 'WhatsApp', url: 'https://wa.me/8801571083401' }
    ];

    const features = [
        {
            icon: <FiTruck className="w-5 h-5" />,
            title: 'Free Shipping',
            description: 'On orders over ৳2000'
        },
        {
            icon: <FiCreditCard className="w-5 h-5" />,
            title: 'Secure Payment',
            description: '100% secure payment'
        },
        {
            icon: <FiShield className="w-5 h-5" />,
            title: 'Quality Guarantee',
            description: 'Best quality products'
        },
        {
            icon: <FiHelpCircle className="w-5 h-5" />,
            title: '24/7 Support',
            description: 'Dedicated support'
        }
    ];

    const paymentMethods = [
        { name: 'Visa', logo: '💳' },
        { name: 'MasterCard', logo: '💳' },
        { name: 'bKash', logo: '📱' },
        { name: 'Nagad', logo: '📱' },
        { name: 'Rocket', logo: '🚀' },
        { name: 'COD', logo: '💰' }
    ];

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setSubscribed(true);
            setEmail('');
            setLoading(false);
            alert('Thank you for subscribing to our newsletter!');
        }, 1000);
    };

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Top Features */}
            <div className="border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                                    <div className="text-gray-300">
                                        {feature.icon}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white text-sm">{feature.title}</h4>
                                    <p className="text-xs text-gray-400">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Brand & Newsletter */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <Link href="/" className="inline-flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">SO</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Sooqra One</h2>
                                    <p className="text-sm text-gray-400">Your Trusted Shopping Partner</p>
                                </div>
                            </Link>
                        </div>

                        <p className="text-gray-400 mb-6 max-w-md">
                            Bangladesh's leading e-commerce platform offering quality products with fast delivery and excellent customer service.
                        </p>

                        {/* Newsletter Subscription */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-white mb-4">Subscribe to Newsletter</h3>
                            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent text-white placeholder-gray-500"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-70"
                                >
                                    {loading ? 'Subscribing...' : 'Subscribe'}
                                </button>
                            </form>
                            <p className="text-xs text-gray-500 mt-2">
                                Get updates on new products and exclusive offers
                            </p>
                        </div>

                        {/* Social Links */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
                            <div className="flex flex-wrap gap-3">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                                        aria-label={social.label}
                                    >
                                        <span className="text-gray-300 hover:text-white">
                                            {social.icon}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <FiShoppingBag className="w-5 h-5" />
                            Shop
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.shop.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.slug}
                                        className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                                    >
                                        <FiChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">Categories</h3>
                        <ul className="space-y-3">
                            {footerLinks.categories.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.slug}
                                        className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                                    >
                                        <FiChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company & Help Links */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-6">Company</h3>
                            <ul className="space-y-3">
                                {footerLinks.company.map((link, index) => (
                                    <li key={index}>
                                        <Link
                                            href={link.slug}
                                            className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                                        >
                                            <FiChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-6">Help & Support</h3>
                            <ul className="space-y-3">
                                {footerLinks.help.map((link, index) => (
                                    <li key={index}>
                                        <Link
                                            href={link.slug}
                                            className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                                        >
                                            <FiChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FiPhone className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Phone Support</h4>
                                <a href="tel:+8801571083401" className="text-gray-300 hover:text-white transition-colors">
                                    +880 1571-083401
                                </a>
                                <p className="text-sm text-gray-500 mt-1">10 AM - 8 PM (Daily)</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FiMail className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Email Support</h4>
                                <a href="mailto:support@sooqraone.com" className="text-gray-300 hover:text-white transition-colors">
                                    support@sooqraone.com
                                </a>
                                <p className="text-sm text-gray-500 mt-1">Response within 2-4 hours</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FiMapPin className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Office Address</h4>
                                <address className="text-gray-300 not-italic">
                                    Dhaka, Bangladesh
                                </address>
                                <p className="text-sm text-gray-500 mt-1">Registered Office</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* Copyright */}
                        <div className="text-center md:text-left">
                            <p className="text-gray-400 text-sm">
                                © {currentYear} Sooqra One. All rights reserved.
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                                Made with ❤️ in Bangladesh
                            </p>
                        </div>

                        {/* Payment Methods */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">We Accept:</span>
                            <div className="flex items-center gap-2">
                                {paymentMethods.map((method, index) => (
                                    <div
                                        key={index}
                                        className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-sm"
                                        title={method.name}
                                    >
                                        {method.logo}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Policy Links */}
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            {footerLinks.policies.map((policy, index) => (
                                <Link
                                    key={index}
                                    href={policy.slug}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {policy.title}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <div className="flex flex-wrap justify-center items-center gap-8">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">10K+</div>
                                <div className="text-xs text-gray-400">Happy Customers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">64</div>
                                <div className="text-xs text-gray-400">Districts Covered</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">99%</div>
                                <div className="text-xs text-gray-400">Positive Reviews</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">24/7</div>
                                <div className="text-xs text-gray-400">Support Available</div>
                            </div>
                        </div>
                    </div>

                    {/* Back to Top */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            <FiChevronRight className="w-4 h-4 rotate-270" />
                            Back to Top
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}