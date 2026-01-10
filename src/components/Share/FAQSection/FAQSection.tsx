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
            q: 'কীভাবে অর্ডার করতে পারি?',
            a: `আপনি ৪টি পদ্ধতিতে অর্ডার করতে পারেন:
        <br>১. <strong>ওয়েবসাইটের মাধ্যমে:</strong> sooqraone.com ভিজিট করে পণ্য নির্বাচন করুন এবং চেকআউট করুন
        <br>২. <strong>ফেসবুক পেজের মাধ্যমে:</strong> আমাদের ফেসবুক পেজে মেসেজ দিয়ে অর্ডার করুন
        <br>৩. <strong>হেল্পলাইনে কল করে:</strong> +880 1571-083401 নম্বরে কল করুন
        <br>৪. <strong>হোয়াটসঅ্যাপের মাধ্যমে:</strong> প্রোডাক্ট লিঙ্ক বা নাম পাঠিয়ে অর্ডার কনফার্ম করুন`,
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
            q: 'আমি কি ঢাকার বাইরে অর্ডার করতে পারবো?',
            a: `হ্যাঁ, আমরা পুরো বাংলাদেশে ডেলিভারি প্রদান করি:
        <br>• <strong>ঢাকার ভিতরে:</strong> ২-৩ দিন
        <br>• <strong>ঢাকার বাইরে:</strong> ৩-৫ দিন
        <br>• <strong>রিমোট এরিয়া:</strong> ৫-৭ দিন
        <br>ডেলিভারি চার্জ আপনার লোকেশনের উপর নির্ভর করে`,
        },
        {
            q: 'Is my personal information secure?',
            a: 'Yes, we use industry-standard SSL encryption to protect your personal and payment information. Read our <a href="/privacy-policy" class="text-gray-600 hover:underline font-medium">Privacy Policy</a> for details.',
        },
    ];

    const rightQuestions: FAQItem[] = [
        {
            q: 'How do I create an account?',
            a: 'Click on "Sign Up" at the top right corner, enter your email and password, and verify your email address. You can also sign up with Google for faster registration.',
        },
        {
            q: 'অর্ডার বাতিল কিভাবে করবো?',
            a: `পণ্য অর্ডার করার ১ ঘন্টার মধ্যে আমাদের হেল্পলাইনে কল করে অর্ডার বাতিল করতে পারবেন:
        <br>• হেল্পলাইন: <a href="tel:+8801571083401" class="text-gray-600 hover:underline font-medium">+880 1571-083401</a>
        <br>• হোয়াটসঅ্যাপ: <a href="https://wa.me/8801571083401" class="text-gray-600 hover:underline font-medium">WhatsApp</a>
        <br>• ইমেইল: <a href="mailto:support@sooqraone.com" class="text-gray-600 hover:underline font-medium">support@sooqraone.com</a>
        <br><em>১ ঘন্টার পর অর্ডার প্রসেসিং শুরু হয়ে যায়, তাই দ্রুত যোগাযোগ করুন</em>`,
        },
        {
            q: 'Can I modify or cancel my order?',
            a: 'You can modify or cancel your order within 1 hour of placing it by contacting our support team at <a href="tel:+8801571083401" class="text-gray-600 hover:underline font-medium">+880 1571-083401</a> or via WhatsApp.',
        },
        {
            q: 'What should I do if I receive a damaged or wrong product?',
            a: 'Immediately contact our support team within 48 hours with photos/videos of the product. We will arrange a replacement or refund as per our return policy.',
        },
        {
            q: 'অর্ডার কনফার্মেশন কীভাবে পাবো?',
            a: `অর্ডার করার পর আপনি ৩টি ভাবে কনফার্মেশন পাবেন:
        <br>১. <strong>অটো কনফার্মেশন:</strong> অর্ডার সফল হলে একটি কনফার্মেশন মেসেজ পাবেন
        <br>২. <strong>কলের মাধ্যমে:</strong> আমাদের প্রতিনিধি আপনাকে কল করে ফাইনাল কনফার্ম করবেন
        <br>৩. <strong>ইমেইল/SMS:</strong> ডিটেইলস সহ কনফার্মেশন ইমেইল/SMS পাবেন
        <br><strong>কনফার্মেশন না পেলে:</strong> হেল্পলাইনে কল করুন বা WhatsApp এ মেসেজ দিন`,
        },
        {
            q: 'How do I apply a discount code?',
            a: 'Enter your discount code in the "Promo Code" field during checkout. The discount will be automatically applied to your order total.',
        },
        {
            q: 'বিকাশে পেমেন্টের খরচ কে দেবে?',
            a: `বিকাশে পেমেন্টের ক্ষেত্রে:
        <br>• <strong>সেন্ড মানি/পেমেন্টের খরচ:</strong> আপনাকে দিতে হবে না, আমরা বহন করবো
        <br>• <strong>ক্যাশ আউট খরচ:</strong> আপনাকে বহন করতে হবে (যদি আমরা টাকা সেন্ড করি এবং আপনাকে ক্যাশ আউট করতে হয়)
        <br>• <strong>সবচেয়ে ভালো উপায়:</strong> ডিরেক্ট পেমেন্ট করুন অথবা Cash on Delivery (COD) সিলেক্ট করুন
        <br><em>কোন সমস্যা হলে হেল্পলাইনে কল করুন</em>`,
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
            <section className="bg-gray-50 text-gray-800 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-gray-600 mb-4">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-8">
                            Find quick answers to common questions about shopping at Sooqra One
                        </p>

                        {/* Quick Help Icons */}
                        <div className="flex flex-wrap justify-center gap-6 mb-12">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                    <FiShoppingCart className="w-6 h-6 text-gray-600" />
                                </div>
                                <span className="text-sm text-gray-600">Ordering</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                                    <FiTruck className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="text-sm text-gray-600">Delivery</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                                    <FiCreditCard className="w-6 h-6 text-purple-600" />
                                </div>
                                <span className="text-sm text-gray-600">Payment</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                                    <FiRefreshCw className="w-6 h-6 text-yellow-600" />
                                </div>
                                <span className="text-sm text-gray-600">Returns</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mb-2">
                                    <FiHeadphones className="w-6 h-6 text-cyan-600" />
                                </div>
                                <span className="text-sm text-gray-600">Support</span>
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
                                        className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:border-gray-300 hover:shadow-lg"
                                    >
                                        <button
                                            onClick={() => toggleFAQ('left', index)}
                                            className={`w-full flex justify-between items-center p-5 text-left transition-all duration-300 ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
                                                }`}
                                            aria-expanded={isActive}
                                            aria-controls={`faq-answer-left-${index}`}
                                            aria-label={`Toggle ${item.q}`}
                                        >
                                            <span className="text-gray-800 font-semibold text-sm sm:text-base mr-4 text-left">
                                                {item.q}
                                            </span>
                                            <div className="flex-shrink-0 ml-2">
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-600'
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
                                                <div className="text-gray-600 text-sm sm:text-base leading-relaxed pt-4 border-t border-gray-200" dangerouslySetInnerHTML={{ __html: item.a }} />
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
                                        className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:border-gray-300 hover:shadow-lg"
                                    >
                                        <button
                                            onClick={() => toggleFAQ('right', index)}
                                            className={`w-full flex justify-between items-center p-5 text-left transition-all duration-300 ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
                                                }`}
                                            aria-expanded={isActive}
                                            aria-controls={`faq-answer-right-${index}`}
                                            aria-label={`Toggle ${item.q}`}
                                        >
                                            <span className="text-gray-800 font-semibold text-sm sm:text-base mr-4 text-left">
                                                {item.q}
                                            </span>
                                            <div className="flex-shrink-0 ml-2">
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-600'
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
                                                <div className="text-gray-600 text-sm sm:text-base leading-relaxed pt-4 border-t border-gray-200" dangerouslySetInnerHTML={{ __html: item.a }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Still Have Questions?</h3>
                            <p className="text-gray-600">Our customer support team is here to help you 24/7</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


                            <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-100 hover:border-green-200 transition-colors">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaWhatsapp className="w-6 h-6 text-green-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-2">WhatsApp</h4>
                                <p className="text-gray-600 text-sm mb-3">Fastest response time</p>
                                <a
                                    href="https://wa.me/8801571083401"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                                >
                                    Chat Now
                                </a>
                            </div>



                            <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-100 hover:border-blue-200 transition-colors">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaPhoneAlt className="w-6 h-6 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-2">Phone Support</h4>
                                <p className="text-gray-600 text-sm mb-3">10 AM - 10 PM (Daily)</p>
                                <a
                                    href="tel:+8801571083401"
                                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                                >
                                    Call Now
                                </a>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-100 hover:border-purple-200 transition-colors">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiHeadphones className="w-6 h-6 text-purple-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-2">Email Support</h4>
                                <p className="text-gray-600 text-sm mb-3">24/7 email support</p>
                                <a
                                    href="mailto:support@sooqraone.com"
                                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                                >
                                    Email Us
                                </a>
                            </div>
                        </div>

                        <div className="text-center mt-8 pt-6 border-t border-gray-200">
                            <p className="text-gray-600 text-sm">
                                <strong>Business Hours:</strong> Sunday to Thursday, 10:00 AM - 07:00 PM
                                <br />
                                <strong>Emergency Support:</strong> Available 24/7 via WhatsApp
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Schema Markup */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        </>
    );
}