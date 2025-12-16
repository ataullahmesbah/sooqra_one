import type { Metadata } from 'next';

import {
    FiMail,
    FiPhone,
    FiMapPin,
    FiClock,
    FiMessageSquare,
    FiHeadphones,
    FiTruck,
    FiShield
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaInstagram } from 'react-icons/fa';
import ContactForm from '@/src/components/Share/ContactForm/ContactForm';

export const metadata: Metadata = {
    title: 'Contact Us - Sooqra One | Customer Support & Help',
    description: 'Get in touch with Sooqra One customer support. Contact us for order inquiries, returns, technical support, or business partnerships.',
    keywords: 'contact us, customer support, help center, Sooqra One support, e-commerce contact, order help',
    openGraph: {
        title: 'Contact Us - Sooqra One | Customer Support & Help',
        description: 'Reach out to Sooqra One for any queries, support, or partnership opportunities. We\'re here to help!',
        url: 'https://sooqraone.com/contact',
        type: 'website',
        siteName: 'Sooqra One',
        images: [{ url: 'https://sooqraone.com/images/og-contact.jpg' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Contact Us - Sooqra One',
        description: 'Get in touch with our customer support team for any assistance.',
        images: ['https://sooqraone.com/images/og-contact.jpg'],
    },
};

export default function ContactPage() {
    return (
        <main className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/20 z-0"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Get in <span className="text-gray-300">Touch</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-8">
                            We're here to help! Whether you have questions about orders, need support, or want to partner with us.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                <FiHeadphones className="w-4 h-4" />
                                <span className="text-sm">24/7 Support</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                <FiClock className="w-4 h-4" />
                                <span className="text-sm">Quick Response</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                <FiShield className="w-4 h-4" />
                                <span className="text-sm">Secure & Safe</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Content */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Contact Information */}
                        <div className="lg:col-span-1 space-y-8">
                            {/* Contact Info Cards */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <FiPhone className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Phone Support</h3>
                                            <p className="text-gray-600 mt-1">Call us for immediate assistance</p>
                                            <a
                                                href="tel:+8801571083401"
                                                className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors block mt-2"
                                            >
                                                +880 1571-083401
                                            </a>
                                            <p className="text-sm text-gray-500 mt-1">10 AM - 8 PM (Daily)</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <FiMail className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Email Support</h3>
                                            <p className="text-gray-600 mt-1">Email us for detailed inquiries</p>
                                            <a
                                                href="mailto:support@sooqraone.com"
                                                className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors block mt-2"
                                            >
                                                support@sooqraone.com
                                            </a>
                                            <p className="text-sm text-gray-500 mt-1">Response within 2-4 hours</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <FiMapPin className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Office Address</h3>
                                            <p className="text-gray-600 mt-1">Visit our headquarters</p>
                                            <address className="text-lg font-bold text-gray-900 not-italic mt-2">
                                                Dhaka, Bangladesh
                                            </address>
                                            <p className="text-sm text-gray-500 mt-1">By appointment only</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Media Links */}
                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
                                    <div className="flex gap-3">
                                        <a
                                            href="https://facebook.com/sooqraone"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors"
                                            aria-label="Facebook"
                                        >
                                            <FaFacebook className="w-6 h-6 text-blue-600" />
                                        </a>
                                        <a
                                            href="https://instagram.com/sooqraone"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 bg-pink-100 hover:bg-pink-200 rounded-xl flex items-center justify-center transition-colors"
                                            aria-label="Instagram"
                                        >
                                            <FaInstagram className="w-6 h-6 text-pink-600" />
                                        </a>
                                        <a
                                            href="https://wa.me/8801571083401"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors"
                                            aria-label="WhatsApp"
                                        >
                                            <FaWhatsapp className="w-6 h-6 text-green-600" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Support Options */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Support</h2>
                                <div className="space-y-4">
                                    <a
                                        href="/faq"
                                        className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                                    >
                                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                                            <FiMessageSquare className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">FAQs</h3>
                                            <p className="text-sm text-gray-600">Find quick answers</p>
                                        </div>
                                    </a>
                                    <a
                                        href="/return-policy"
                                        className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                                    >
                                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                                            <FiTruck className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">Returns & Refunds</h3>
                                            <p className="text-sm text-gray-600">Check our policies</p>
                                        </div>
                                    </a>
                                    <a
                                        href="/order-tracking"
                                        className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                                    >
                                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                                            <FiShield className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">Track Order</h3>
                                            <p className="text-sm text-gray-600">Live order tracking</p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Send us a Message</h2>
                                    <p className="text-gray-600">
                                        Fill out the form below and our team will get back to you as soon as possible.
                                    </p>
                                </div>

                                {/* Contact Form */}
                                <ContactForm />

                                {/* Response Time Info */}
                                <div className="mt-12 pt-8 border-t border-gray-200">
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-green-600 mb-1">15 min</div>
                                            <div className="text-sm text-gray-600">WhatsApp Response</div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-blue-600 mb-1">30 min</div>
                                            <div className="text-sm text-gray-600">Phone Response</div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-purple-600 mb-1">2 hours</div>
                                            <div className="text-sm text-gray-600">Email Response</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Privacy Notice */}
                                <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                                    <h3 className="font-semibold text-gray-900 mb-2">Your Privacy Matters</h3>
                                    <p className="text-sm text-gray-600">
                                        We respect your privacy and protect your personal information. Your data is secure with us and will only be used to respond to your inquiry.
                                    </p>
                                    <a href="/privacy-policy" className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-block mt-3">
                                        Read our Privacy Policy →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Preview */}
            <section className="py-16 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Common Questions</h2>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Quick answers to frequently asked questions
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                            <h3 className="text-xl font-bold mb-4">How do I track my order?</h3>
                            <p className="text-gray-300">
                                Once your order is shipped, you'll receive a tracking number via SMS and email. You can also track from your account dashboard.
                            </p>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                            <h3 className="text-xl font-bold mb-4">What is your return policy?</h3>
                            <p className="text-gray-300">
                                We offer 48-hour returns for defective or incorrect items. Items must be unused with original packaging.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <a
                            href="/faq"
                            className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-3.5 rounded-xl transition-all duration-300"
                        >
                            View All FAQs
                            <FiMessageSquare className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Business Hours */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Business Hours</h2>
                                <p className="text-gray-600 mb-6">
                                    Our customer support team is available to assist you during these hours.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                        <span className="font-medium text-gray-900">Monday - Thursday</span>
                                        <span className="font-bold text-gray-900">9:00 AM - 8:00 PM</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                        <span className="font-medium text-gray-900">Sunday</span>
                                        <span className="font-bold text-gray-900">10:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                        <span className="font-medium text-gray-900">Friday</span>
                                        <span className="font-bold text-gray-900">Close</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-8xl mb-6">⏰</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Emergency Support</h3>
                                <p className="text-gray-600 mb-6">
                                    For urgent order-related issues outside business hours, contact our WhatsApp support.
                                </p>
                                <a
                                    href="https://wa.me/8801571083401"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                                >
                                    <FaWhatsapp className="w-5 h-5" />
                                    WhatsApp Support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}