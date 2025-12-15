'use client';

import { useState } from 'react';
import { FiPlus, FiMinus, FiShoppingCart, FiTruck, FiCreditCard, FiPackage, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';

interface FAQItem {
    q: string;
    a: string;
}

export default function FAQSection() {
    const [leftActiveIndex, setLeftActiveIndex] = useState<number | null>(null);
    const [rightActiveIndex, setRightActiveIndex] = useState<number | null>(null);

    const toggleFAQ = (side: 'left' | 'right', index: number) => {
        if (side === 'left') {
            setLeftActiveIndex(leftActiveIndex === index ? null : index);
        } else {
            setRightActiveIndex(rightActiveIndex === index ? null : index);
        }
    };

    const leftQuestions: FAQItem[] = [
        {
            q: 'How do I place an order on Sooqra One?',
            a: 'You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. Create an account for faster checkout and order tracking.',
        },
        {
            q: 'What payment methods do you accept?',
            a: 'We accept Cash on Delivery (COD), Credit/Debit Cards, bKash, Nagad, and bank transfers. All online payments are secured with SSL encryption.',
        },
        {
            q: 'How long does delivery take?',
            a: 'Delivery typically takes 2-7 business days within Dhaka and 5-10 business days outside Dhaka, depending on your location and product availability.',
        },
        {
            q: 'Do you deliver outside Dhaka?',
            a: 'Yes, we deliver nationwide across Bangladesh through reliable courier services like Sundarban, SA Paribahan, and Pathao.',
        },
        {
            q: 'How can I track my order?',
            a: 'Once your order is shipped, you will receive a tracking number via SMS and email. You can also track your order from your account dashboard.',
        },
        {
            q: 'What is your return policy?',
            a: 'We offer 48-hour returns for defective or incorrect items. Items must be unused with original packaging. For details, visit our <a href="/return-policy" class="text-green-500 hover:underline font-medium">Return Policy</a> page.',
        },
    ];

    const rightQuestions: FAQItem[] = [
        {
            q: 'How do I create an account?',
            a: 'Click on "Sign Up" at the top right corner, enter your email and password, and verify your email address. You can also sign up with Google for faster registration.',
        },
        {
            q: 'Can I modify or cancel my order?',
            a: 'You can modify or cancel your order within 1 hour of placing it by contacting our support team at <a href="tel:+8801571083401" class="text-green-500 hover:underline font-medium">+880 1571-083401</a> or via WhatsApp.',
        },
        {
            q: 'Do you offer wholesale/bulk discounts?',
            a: 'Yes, we offer special discounts for bulk orders. Please contact our sales team at <a href="mailto:sales@sooqraone.com" class="text-green-500 hover:underline font-medium">sales@sooqraone.com</a> for wholesale inquiries.',
        },
        {
            q: 'What should I do if I receive a damaged or wrong product?',
            a: 'Immediately contact our support team within 48 hours with photos/videos of the product. We will arrange a replacement or refund as per our return policy.',
        },
        {
            q: 'How do I apply a discount code?',
            a: 'Enter your discount code in the "Promo Code" field during checkout. The discount will be automatically applied to your order total.',
        },
        {
            q: 'Is my personal information secure?',
            a: 'Yes, we use industry-standard SSL encryption to protect your personal and payment information. Read our <a href="/privacy-policy" class="text-green-500 hover:underline font-medium">Privacy Policy</a> for details.',
        },
    ];

    // Schema Markup for FAQ
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [...leftQuestions, ...rightQuestions].map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.a.replace(/<[^>]+>/g, ''),
            },
        })),
    };

    return (
        <>
            <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 mb-4">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-8">
                            Find quick answers to common questions about shopping at Sooqra One
                        </p>

                        {/* Quick Help Icons */}
                        <div className="flex flex-wrap justify-center gap-6 mb-12">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                                    <FiShoppingCart className="w-6 h-6 text-green-400" />
                                </div>
                                <span className="text-sm text-gray-300">Ordering</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                                    <FiTruck className="w-6 h-6 text-blue-400" />
                                </div>
                                <span className="text-sm text-gray-300">Delivery</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
                                    <FiCreditCard className="w-6 h-6 text-purple-400" />
                                </div>
                                <span className="text-sm text-gray-300">Payment</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-yellow-900/30 rounded-full flex items-center justify-center mb-2">
                                    <FiRefreshCw className="w-6 h-6 text-yellow-400" />
                                </div>
                                <span className="text-sm text-gray-300">Returns</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-cyan-900/30 rounded-full flex items-center justify-center mb-2">
                                    <FiHeadphones className="w-6 h-6 text-cyan-400" />
                                </div>
                                <span className="text-sm text-gray-300">Support</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {leftQuestions.map((item, index) => {
                                const isActive = leftActiveIndex === index;
                                return (
                                    <div
                                        key={`faq-left-${index}`}
                                        className="bg-gray-800/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 transition-all duration-300 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10"
                                    >
                                        <button
                                            onClick={() => toggleFAQ('left', index)}
                                            className={`w-full flex justify-between items-center p-5 text-left transition-all duration-300 ${isActive ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'
                                                }`}
                                            aria-expanded={isActive}
                                            aria-controls={`faq-answer-left-${index}`}
                                            aria-label={`Toggle ${item.q}`}
                                        >
                                            <span className="text-white font-semibold text-sm sm:text-base mr-4 text-left">
                                                {item.q}
                                            </span>
                                            <div className="flex-shrink-0 ml-2">
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
                                                        }`}
                                                >
                                                    {isActive ? (
                                                        <FiMinus className="w-4 h-4" />
                                                    ) : (
                                                        <FiPlus className="w-4 h-4" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                        <div
                                            id={`faq-answer-left-${index}`}
                                            className={`overflow-hidden transition-all duration-300 ${isActive ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                                }`}
                                            role="region"
                                            aria-labelledby={`faq-left-${index}`}
                                        >
                                            <div className="p-5 pt-0">
                                                <div className="text-gray-300 text-sm sm:text-base leading-relaxed pt-4 border-t border-gray-700/50" dangerouslySetInnerHTML={{ __html: item.a }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {rightQuestions.map((item, index) => {
                                const isActive = rightActiveIndex === index;
                                return (
                                    <div
                                        key={`faq-right-${index}`}
                                        className="bg-gray-800/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
                                    >
                                        <button
                                            onClick={() => toggleFAQ('right', index)}
                                            className={`w-full flex justify-between items-center p-5 text-left transition-all duration-300 ${isActive ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'
                                                }`}
                                            aria-expanded={isActive}
                                            aria-controls={`faq-answer-right-${index}`}
                                            aria-label={`Toggle ${item.q}`}
                                        >
                                            <span className="text-white font-semibold text-sm sm:text-base mr-4 text-left">
                                                {item.q}
                                            </span>
                                            <div className="flex-shrink-0 ml-2">
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300'
                                                        }`}
                                                >
                                                    {isActive ? (
                                                        <FiMinus className="w-4 h-4" />
                                                    ) : (
                                                        <FiPlus className="w-4 h-4" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                        <div
                                            id={`faq-answer-right-${index}`}
                                            className={`overflow-hidden transition-all duration-300 ${isActive ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                                }`}
                                            role="region"
                                            aria-labelledby={`faq-right-${index}`}
                                        >
                                            <div className="p-5 pt-0">
                                                <div className="text-gray-300 text-sm sm:text-base leading-relaxed pt-4 border-t border-gray-700/50" dangerouslySetInnerHTML={{ __html: item.a }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="mt-16 bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">Still Have Questions?</h3>
                            <p className="text-gray-300">Our customer support team is here to help you 24/7</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-900/50 p-6 rounded-xl text-center">
                                <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaWhatsapp className="w-6 h-6 text-green-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-white mb-2">WhatsApp</h4>
                                <p className="text-gray-300 text-sm mb-3">Fastest response time</p>
                                <a
                                    href="https://wa.me/8801571083401"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                                >
                                    Chat Now
                                </a>
                            </div>

                            <div className="bg-gray-900/50 p-6 rounded-xl text-center">
                                <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaPhoneAlt className="w-6 h-6 text-blue-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-white mb-2">Phone Support</h4>
                                <p className="text-gray-300 text-sm mb-3">10 AM - 8 PM (Daily)</p>
                                <a
                                    href="tel:+8801571083401"
                                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                                >
                                    Call Now
                                </a>
                            </div>

                            <div className="bg-gray-900/50 p-6 rounded-xl text-center">
                                <div className="w-12 h-12 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiHeadphones className="w-6 h-6 text-purple-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-white mb-2">Email Support</h4>
                                <p className="text-gray-300 text-sm mb-3">24/7 email support</p>
                                <a
                                    href="mailto:support@sooqraone.com"
                                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                                >
                                    Email Us
                                </a>
                            </div>
                        </div>

                        <div className="text-center mt-8 text-sm text-gray-400">
                            <p>Average response time: <span className="text-green-400">15 minutes</span> for WhatsApp, <span className="text-blue-400">30 minutes</span> for phone, <span className="text-purple-400">2 hours</span> for email</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Schema Markup */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        </>
    );
}