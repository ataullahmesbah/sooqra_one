'use client';

import { useState, useEffect } from 'react';
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
            q: 'কীভাবে অর্ডার করতে পারি?',
            a: `আপনি ৪টি পদ্ধতিতে অর্ডার করতে পারেন:
            <br>১. <strong>ওয়েবসাইটের মাধ্যমে:</strong> sooqraone.com ভিজিট করে পণ্য নির্বাচন করুন এবং চেকআউট করুন
            <br>২. <strong>ফেসবুক পেজের মাধ্যমে:</strong> আমাদের ফেসবুক পেজে মেসেজ দিয়ে অর্ডার করুন
            <br>৩. <strong>হেল্পলাইনে কল করে:</strong> <a href="tel:+8801571083401" class="text-gray-600 hover:text-gray-800 underline">+880 1571-083401</a> নম্বরে কল করুন
            <br>৪. <strong>হোয়াটসঅ্যাপের মাধ্যমে:</strong> প্রোডাক্ট লিঙ্ক বা নাম পাঠিয়ে অর্ডার কনফার্ম করুন`
        },
        {
            q: 'কি কি পেমেন্ট পদ্ধতি আছে?',
            a: `আমরা নিম্নলিখিত পেমেন্ট পদ্ধতি গ্রহণ করি:
            <br>• <strong>ক্যাশ অন ডেলিভারি (COD)</strong> - পণ্য হাতে পেয়ে টাকা দিন
            <br>• <strong>বিকাশ / নগদ / রকেট</strong> - মোবাইল ব্যাংকিং
            <br>• <strong>ক্রেডিট/ডেবিট কার্ড</strong> - ভিসা, মাস্টারকার্ড
            <br>• <strong>ব্যাংক ট্রান্সফার</strong> - সরাসরি ব্যাংকে পেমেন্ট
            <br><br>সব অনলাইন পেমেন্ট SSL এনক্রিপশনের মাধ্যমে সুরক্ষিত।`
        },
        {
            q: 'ডেলিভারি কতদিন সময় লাগে?',
            a: `আমরা সারা বাংলাদেশে ডেলিভারি দেই:
            <br>• <strong>ঢাকার ভিতরে:</strong> ২-৩ কর্মদিবস
            <br>• <strong>ঢাকার বাইরে (বড় শহর):</strong> ৩-৫ কর্মদিবস
            <br>• <strong>রিমোট এরিয়া:</strong> ৫-৭ কর্মদিবস
            <br><br>অর্ডার কনফার্মেশনের পর ট্র্যাকিং নম্বর SMS/ইমেইলে পাঠানো হবে।`
        },
        {
            q: 'ডেলিভারি চার্জ কত?',
            a: `ডেলিভারি চার্জ আপনার লোকেশনের উপর নির্ভর করে:
            <br>• <strong>ঢাকা সিটি কর্পোরেশন এলাকা:</strong> ৬০ টাকা
            <br>• <strong>ঢাকার আশেপাশে (সাভার, গাজীপুর):</strong> ৮০ টাকা
            <br>• <strong>ঢাকার বাইরে (বিভাগীয় শহর):</strong> ১২০ টাকা
            <br>• <strong>জেলা ও থানা সদর:</strong> ১৫০ টাকা
            <br><br><strong>ফ্রি ডেলিভারি:</strong> ২০০০ টাকার উপরে অর্ডার করলে ডেলিভারি চার্জ ফ্রি!`
        },
        {
            q: 'কিভাবে অর্ডার ট্র্যাক করবো?',
            a: `অর্ডার ট্র্যাক করার ৩টি উপায়:
            <br>১. <strong>ওয়েবসাইটে লগইন করুন:</strong> "My Orders" সেকশন থেকে ট্র্যাক করুন
            <br>২. <strong>SMS/ইমেইল চেক করুন:</strong> অর্ডার ডিসপ্যাচের সময় ট্র্যাকিং লিংক পাঠানো হয়
            <br>৩. <strong>হেল্পলাইনে কল করুন:</strong> <a href="tel:+8801571083401" class="text-gray-600 hover:text-gray-800 underline">+880 1571-083401</a>
            <br><br>কুরিয়ার কোম্পানির ট্র্যাকিং নম্বর দিয়ে সরাসরি ট্র্যাক করতে পারবেন।`
        },
        {
            q: 'পণ্য ফেরত বা প্রতিস্থাপন নীতি কী?',
            a: `আমাদের "৭ দিনের রিটার্ন পলিসি" আছে:
            <br>• <strong>ভুল পণ্য পাঠানো হলে:</strong> সম্পূর্ণ টাকা ফেরত অথবা রিপ্লেসমেন্ট
            <br>• <strong>পণ্য নষ্ট বা ক্ষতিগ্রস্ত হলে:</strong> ডেলিভারির ৪৮ ঘন্টার মধ্যে জানাতে হবে
            <br>• <strong>পণ্যের মানে সন্তুষ্ট না হলে:</strong> ৭ দিনের মধ্যে ফেরত দিতে পারবেন
            <br><br><strong>শর্ত:</strong> পণ্য অবশ্যই অমূলক অবস্থায় থাকতে হবে এবং প্যাকেট খোলা থাকলে চলবে না।`
        },
    ];

    const rightQuestions: FAQItem[] = [
        {
            q: 'অর্ডার বাতিল কিভাবে করবো?',
            a: `পণ্য অর্ডার করার ১ ঘন্টার মধ্যে আমাদের হেল্পলাইনে কল করে অর্ডার বাতিল করতে পারবেন:
            <br>• <strong>হেল্পলাইন:</strong> <a href="tel:+8801571083401" class="text-gray-600 hover:text-gray-800 underline">+880 1571-083401</a>
            <br>• <strong>হোয়াটসঅ্যাপ:</strong> <a href="https://wa.me/8801571083401" class="text-gray-600 hover:text-gray-800 underline">+880 1571-083401</a>
            <br>• <strong>ইমেইল:</strong> <a href="mailto:contact@sooqraone.com" class="text-gray-600 hover:text-gray-800 underline">contact@sooqraone.com</a>
            <br><br><em>১ ঘন্টার পর অর্ডার প্রসেসিং শুরু হয়ে যায়, তাই দ্রুত যোগাযোগ করুন।</em>
            <br><br>অর্ডার ডিসপ্যাচ হয়ে গেলে বাতিল করা সম্ভব নয়।`
        },
        {
            q: 'কিভাবে অ্যাকাউন্ট তৈরি করবো?',
            a: `অ্যাকাউন্ট তৈরি করা খুবই সহজ:
            <br>১. <strong>সাইন আপ করুন:</strong> ওয়েবসাইটের উপরের ডান দিকের "Sign Up" বাটনে ক্লিক করুন
            <br>২. <strong>ইনফর্মেশন দিন:</strong> নাম, ইমেইল, ফোন নম্বর এবং পাসওয়ার্ড দিন
            <br>৩. <strong>ভেরিফাই করুন:</strong> ইমেইলে পাঠানো লিংকে ক্লিক করে অ্যাকাউন্ট ভেরিফাই করুন
            <br><br>আপনি <strong>Google অথবা Facebook</strong> দিয়েও লগইন করতে পারবেন।`
        },
        {
            q: 'বিকাশে পেমেন্টের নিয়ম কী?',
            a: `বিকাশে পেমেন্ট করার নিয়ম:
            <br>• <strong>"Send Money" খরচ:</strong> আপনাকে দিতে হবে না, আমরা বহন করবো
            <br>• <strong>ক্যাশ আউট খরচ:</strong> যদি আমরা টাকা সেন্ড করি এবং আপনাকে ক্যাশ আউট করতে হয়, সেক্ষেত্রে আপনাকে খরচ বহন করতে হবে
            <br>• <strong>সবচেয়ে ভালো উপায়:</strong> ডিরেক্ট পেমেন্ট করুন অথবা Cash on Delivery (COD) সিলেক্ট করুন
            <br><br><strong>বিকাশ নম্বর:</strong> ০১৭XXXXXXXX (অর্ডার কনফার্মেশনের সময় নম্বর দেওয়া হবে)`
        },
        {
            q: 'কিভাবে ডিসকাউন্ট কোড ব্যবহার করবো?',
            a: `ডিসকাউন্ট কোড ব্যবহার করার নিয়ম:
            <br>১. চেকআউট পেজে "Promo Code" ফিল্ডটি খুঁজুন
            <br>২. আপনার ডিসকাউন্ট কোডটি লিখুন
            <br>৩. "Apply" বাটনে ক্লিক করুন
            <br>৪. ডিসকাউন্ট স্বয়ংক্রিয়ভাবে total থেকে কেটে নেওয়া হবে
            <br><br><strong>নোট:</strong> একটি অর্ডারে শুধুমাত্র একটি কোড ব্যবহার করা যাবে।`
        },
        {
            q: 'পাইকারি মূল্যে পণ্য কেনার সুযোগ আছে কি?',
            a: `হ্যাঁ, আমরা পাইকারি ক্রেতাদের জন্য বিশেষ মূল্য অফার করি:
            <br>• <strong>ন্যূনতম অর্ডার:</strong> ৫০০০ টাকা বা নির্দিষ্ট পণ্যের ক্ষেত্রে ১০ পিস
            <br>• <strong>ডিসকাউন্ট:</strong> পাইকারি অর্ডারে ১০%-৩০% পর্যন্ত ডিসকাউন্ট
            <br>• <strong>ডেলিভারি:</strong> বড় অর্ডারে ফ্রি ডেলিভারি
            <br><br><strong>যোগাযোগ করুন:</strong> পাইকারি অর্ডারের জন্য আমাদের সেলস টিমে যোগাযোগ করুন <a href="tel:+8801571083401" class="text-gray-600 hover:text-gray-800 underline">+880 1571-083401</a>`
        },
        {
            q: 'কিভাবে যোগাযোগ করবো?',
            a: `আমরা ২৪/৭ আপনার জন্য উন্মুক্ত:
            <br>• <strong>হটলাইন:</strong> <a href="tel:+8801571083401" class="text-gray-600 hover:text-gray-800 underline">+880 1571-083401</a>
            <br>• <strong>হোয়াটসঅ্যাপ:</strong> <a href="https://wa.me/8801571083401" class="text-gray-600 hover:text-gray-800 underline">+880 1571-083401</a>
            <br>• <strong>ইমেইল:</strong> <a href="mailto:contact@sooqraone.com" class="text-gray-600 hover:text-gray-800 underline">contact@sooqraone.com</a>
            <br>• <strong>ফেসবুক:</strong> <a href="https://facebook.com/sooqraone" class="text-gray-600 hover:text-gray-800 underline" target="_blank">facebook.com/sooqraone</a>
            <br><br><strong>অফিস সময়:</strong> রবিবার থেকে বৃহস্পতিবার, সকাল ১০টা - সন্ধ্যা ৭টা`
        },
    ];

    // ✅ Schema তৈরি করুন (ক্লায়েন্ট সাইডে রেন্ডার হবে না)
    const getFaqSchema = () => ({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [...leftQuestions, ...rightQuestions].map((item) => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.a.replace(/<[^>]+>/g, '')
            }
        }))
    });

    const getBreadcrumbSchema = () => ({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sooqraone.com/' },
            { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://sooqraone.com/faq' },
        ],
    });

    const getOrganizationSchema = () => ({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Sooqra One',
        url: 'https://sooqraone.com',
        logo: 'https://sooqraone.com/logo.png',
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+8801571083401',
            contactType: 'customer service',
            availableLanguage: ['Bengali', 'English'],
            areaServed: 'BD',
        },
        sameAs: ['https://facebook.com/sooqraone', 'https://instagram.com/sooqraone'],
    });

    return (
        <>
            <section className="bg-gray-50 py-12 md:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-2 bg-gray-100 px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-4">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-600 rounded-full"></div>
                            <span className="text-gray-600 text-xs md:text-sm font-medium uppercase tracking-wide">
                                জেনে নিন
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                            সাধারণ জিজ্ঞাসা
                        </h1>

                        <div className="w-20 md:w-24 h-1 bg-gray-600 mx-auto rounded-full"></div>

                        <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto mt-4 md:mt-6">
                            অর্ডার, ডেলিভারি, পেমেন্ট এবং আরও অনেক কিছু সম্পর্কে জানুন
                        </p>

                        {/* Quick Help Icons */}
                        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8 md:mt-12">
                            {[
                                { icon: FiShoppingCart, label: 'অর্ডার করা' },
                                { icon: FiTruck, label: 'ডেলিভারি' },
                                { icon: FiCreditCard, label: 'পেমেন্ট' },
                                { icon: FiRefreshCw, label: 'রিটার্ন' },
                                { icon: FiHeadphones, label: 'সাপোর্ট' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center group cursor-pointer">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-all">
                                        <item.icon className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                                    </div>
                                    <span className="text-xs md:text-sm text-gray-600">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Grid - 2 Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {/* Left Column */}
                        <div className="space-y-3 md:space-y-4">
                            {leftQuestions.map((item, index) => {
                                const isActive = leftActiveIndex === index;
                                return (
                                    <div
                                        key={`faq-left-${index}`}
                                        className="bg-white rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md"
                                    >
                                        <button
                                            onClick={() => toggleFAQ('left', index)}
                                            className={`w-full flex justify-between items-center p-4 md:p-5 text-left transition-all duration-300 ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
                                                }`}
                                            aria-expanded={isActive}
                                            aria-label={`Toggle ${item.q}`}
                                        >
                                            <span className="text-gray-800 font-semibold text-sm md:text-base leading-relaxed pr-3 md:pr-4">
                                                {item.q}
                                            </span>
                                            <div className="flex-shrink-0">
                                                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {isActive ? (
                                                        <FiMinus className="w-4 h-4 md:w-5 md:h-5" />
                                                    ) : (
                                                        <FiPlus className="w-4 h-4 md:w-5 md:h-5" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>

                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isActive ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                                            }`}>
                                            <div className="p-4 md:p-5 pt-0">
                                                <div className="text-gray-600 text-sm md:text-base leading-relaxed pt-4 border-t border-gray-100"
                                                    dangerouslySetInnerHTML={{ __html: item.a }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3 md:space-y-4">
                            {rightQuestions.map((item, index) => {
                                const isActive = rightActiveIndex === index;
                                return (
                                    <div
                                        key={`faq-right-${index}`}
                                        className="bg-white rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md"
                                    >
                                        <button
                                            onClick={() => toggleFAQ('right', index)}
                                            className={`w-full flex justify-between items-center p-4 md:p-5 text-left transition-all duration-300 ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
                                                }`}
                                            aria-expanded={isActive}
                                            aria-label={`Toggle ${item.q}`}
                                        >
                                            <span className="text-gray-800 font-semibold text-sm md:text-base leading-relaxed pr-3 md:pr-4">
                                                {item.q}
                                            </span>
                                            <div className="flex-shrink-0">
                                                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {isActive ? (
                                                        <FiMinus className="w-4 h-4 md:w-5 md:h-5" />
                                                    ) : (
                                                        <FiPlus className="w-4 h-4 md:w-5 md:h-5" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>

                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isActive ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                                            }`}>
                                            <div className="p-4 md:p-5 pt-0">
                                                <div className="text-gray-600 text-sm md:text-base leading-relaxed pt-4 border-t border-gray-100"
                                                    dangerouslySetInnerHTML={{ __html: item.a }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="mt-12 md:mt-16 bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
                        <div className="text-center mb-6 md:mb-8">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                                এখনও প্রশ্ন থেকে গেছে?
                            </h3>
                            <p className="text-gray-500 text-sm md:text-base">
                                আমাদের কাস্টমার সাপোর্ট টিম ২৪/৭ আপনাকে সাহায্য করতে প্রস্তুত
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <div className="bg-gray-50 p-4 md:p-6 rounded-xl text-center border border-gray-200 hover:border-green-300 transition-all hover:shadow-md">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                    <FaWhatsapp className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                                </div>
                                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-1">হোয়াটসঅ্যাপ</h4>
                                <p className="text-gray-500 text-xs md:text-sm mb-3">সবচেয়ে দ্রুত সাড়া</p>
                                <a href="https://wa.me/8801571083401" target="_blank" rel="noopener noreferrer" className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-medium text-sm md:text-base py-2 px-4 md:px-6 rounded-lg transition-colors">চ্যাট করুন</a>
                            </div>

                            <div className="bg-gray-50 p-4 md:p-6 rounded-xl text-center border border-gray-200 hover:border-blue-300 transition-all hover:shadow-md">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                    <FaPhoneAlt className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                                </div>
                                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-1">ফোন সাপোর্ট</h4>
                                <p className="text-gray-500 text-xs md:text-sm mb-3">সকাল ১০টা - রাত ১০টা</p>
                                <a href="tel:+8801571083401" className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-medium text-sm md:text-base py-2 px-4 md:px-6 rounded-lg transition-colors">কল করুন</a>
                            </div>

                            <div className="bg-gray-50 p-4 md:p-6 rounded-xl text-center border border-gray-200 hover:border-purple-300 transition-all hover:shadow-md">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                    <FiHeadphones className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                                </div>
                                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-1">ইমেইল সাপোর্ট</h4>
                                <p className="text-gray-500 text-xs md:text-sm mb-3">২৪/৭ ইমেইল সাপোর্ট</p>
                                <a href="mailto:contact@sooqraone.com" className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-medium text-sm md:text-base py-2 px-4 md:px-6 rounded-lg transition-colors">ইমেইল করুন</a>
                            </div>
                        </div>

                        <div className="text-center mt-6 md:mt-8 pt-6 border-t border-gray-100">
                            <p className="text-gray-500 text-xs md:text-sm">
                                <strong>অফিস সময়:</strong> রবিবার থেকে বৃহস্পতিবার, সকাল ১০:০০টা - সন্ধ্যা ০৭:০০টা
                                <br />
                                <strong>জরুরি সাপোর্ট:</strong> হোয়াটসঅ্যাপে ২৪/৭ যোগাযোগ করুন
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ✅ Schema Scripts - useEffect ছাড়া সরাসরি রেন্ডার করা হয়েছে (কোনো error হবে না) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(getFaqSchema()) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbSchema()) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationSchema()) }}
            />
        </>
    );
}