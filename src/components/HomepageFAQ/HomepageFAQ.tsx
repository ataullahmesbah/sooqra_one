'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiMinus } from 'react-icons/fi';

interface FAQItem {
    q: string;
    a: string;
}

const leftFAQs: FAQItem[] = [
    {
        q: 'কীভাবে অর্ডার করতে পারি?',
        a: 'আপনি ৪টি পদ্ধতিতে অর্ডার করতে পারেন: ওয়েবসাইট থেকে সরাসরি অর্ডার, ফেসবুক পেজে মেসেজ দিয়ে, হটলাইনে কল করে অথবা হোয়াটসঅ্যাপের মাধ্যমে। অর্ডার করতে আমাদের হেল্পলাইনে যোগাযোগ করুন।'
    },
    {
        q: 'ডেলিভারি কতদিন সময় লাগে?',
        a: 'ঢাকার ভিতরে ২-৩ কর্মদিবসে এবং ঢাকার বাইরে ৩-৫ কর্মদিবসে ডেলিভারি করা হয়। রিমোট এলাকায় ৫-৭ কর্মদিবস সময় লাগতে পারে। অর্ডার কনফার্মেশনের পর ট্র্যাকিং নম্বর SMS/ইমেইলে পাঠানো হবে।'
    },
    {
        q: 'কি কি পেমেন্ট পদ্ধতি আছে?',
        a: 'আমরা ক্যাশ অন ডেলিভারি (COD), বিকাশ, নগদ, রকেট, ক্রেডিট/ডেবিট কার্ড এবং ব্যাংক ট্রান্সফারের মাধ্যমে পেমেন্ট গ্রহণ করি। সব অনলাইন পেমেন্ট SSL এনক্রিপশনের মাধ্যমে সুরক্ষিত।'
    },
    {
        q: 'পণ্য ফেরত নীতি কী?',
        a: 'আমাদের "৭ দিনের রিটার্ন পলিসি" আছে। ভুল বা নষ্ট পণ্য পাঠানো হলে ডেলিভারির ৪৮ ঘন্টার মধ্যে জানিয়ে দিলে আমরা রিপ্লেসমেন্ট বা রিফান্ড দিয়ে থাকি। পণ্য অবশ্যই অমূলক অবস্থায় থাকতে হবে।'
    },
];

const rightFAQs: FAQItem[] = [
    {
        q: 'অর্ডার বাতিল কিভাবে করবো?',
        a: 'অর্ডার করার ১ ঘন্টার মধ্যে আমাদের হেল্পলাইনে কল করে অর্ডার বাতিল করতে পারবেন। ১ ঘন্টার পর অর্ডার প্রসেসিং শুরু হয়ে যায়। অর্ডার ডিসপ্যাচ হয়ে গেলে বাতিল করা সম্ভব নয়।'
    },
    {
        q: 'ডেলিভারি চার্জ কত?',
        a: 'ঢাকা সিটি কর্পোরেশন এলাকায় ৬০ টাকা, ঢাকার আশেপাশে ৮০ টাকা, ঢাকার বাইরে ১২০ টাকা। ২০০০ টাকার উপরে অর্ডার করলে ডেলিভারি চার্জ ফ্রি!'
    },
    {
        q: 'কিভাবে অ্যাকাউন্ট তৈরি করবো?',
        a: 'ওয়েবসাইটের উপরের ডান দিকের "Sign Up" বাটনে ক্লিক করুন। নাম, ইমেইল, ফোন নম্বর এবং পাসওয়ার্ড দিন। ইমেইলে পাঠানো লিংকে ক্লিক করে অ্যাকাউন্ট ভেরিফাই করুন।'
    },
    {
        q: 'কিভাবে যোগাযোগ করবো?',
        a: 'আমরা ২৪/৭ আপনার জন্য উন্মুক্ত। হটলাইন: +880 1571-083401, হোয়াটসঅ্যাপ: +880 1571-083401, ইমেইল: contact@sooqraone.com, ফেসবুক: facebook.com/sooqraone'
    },
];

export default function HomepageFAQ() {
    const [leftActiveIndex, setLeftActiveIndex] = useState<number | null>(null);
    const [rightActiveIndex, setRightActiveIndex] = useState<number | null>(null);

    const toggleLeftFAQ = (index: number) => {
        setLeftActiveIndex(leftActiveIndex === index ? null : index);
    };

    const toggleRightFAQ = (index: number) => {
        setRightActiveIndex(rightActiveIndex === index ? null : index);
    };

    return (
        <section className="py-12 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-10 md:mb-14">
                    <div className="inline-flex items-center gap-2 bg-gray-100 px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-3 md:mb-4">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-600 rounded-full"></div>
                        <span className="text-gray-600 text-xs md:text-sm font-medium uppercase tracking-wide">
                            জেনে নিন
                        </span>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                        সাধারণ জিজ্ঞাসা
                    </h2>
                    
                    <div className="w-20 h-1 bg-gray-600 mx-auto mt-3 rounded-full"></div>
                    
                    <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto mt-3 md:mt-4">
                        অর্ডার, ডেলিভারি ও পেমেন্ট সম্পর্কিত সাধারণ প্রশ্নের উত্তর
                    </p>
                </div>

                {/* FAQ Grid - 2 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-7">
                    {/* Left Column */}
                    <div className="space-y-3 md:space-y-4">
                        {leftFAQs.map((item, index) => {
                            const isActive = leftActiveIndex === index;
                            return (
                                <div
                                    key={`home-faq-left-${index}`}
                                    className="bg-white rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md"
                                >
                                    <button
                                        onClick={() => toggleLeftFAQ(index)}
                                        className={`w-full flex justify-between items-center p-4 md:p-5 text-left transition-all duration-300 ${
                                            isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
                                        }`}
                                        aria-expanded={isActive}
                                    >
                                        <span className="text-gray-800 font-semibold text-sm md:text-base leading-relaxed pr-3 md:pr-4">
                                            {item.q}
                                        </span>
                                        <div className="flex-shrink-0">
                                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                isActive ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {isActive ? (
                                                    <FiMinus className="w-4 h-4 md:w-5 md:h-5" />
                                                ) : (
                                                    <FiPlus className="w-4 h-4 md:w-5 md:h-5" />
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        isActive ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                        <div className="p-4 md:p-5 pt-0">
                                            <div className="text-gray-600 text-sm md:text-base leading-relaxed pt-4 border-t border-gray-100">
                                                {item.a}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3 md:space-y-4">
                        {rightFAQs.map((item, index) => {
                            const isActive = rightActiveIndex === index;
                            return (
                                <div
                                    key={`home-faq-right-${index}`}
                                    className="bg-white rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md"
                                >
                                    <button
                                        onClick={() => toggleRightFAQ(index)}
                                        className={`w-full flex justify-between items-center p-4 md:p-5 text-left transition-all duration-300 ${
                                            isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
                                        }`}
                                        aria-expanded={isActive}
                                    >
                                        <span className="text-gray-800 font-semibold text-sm md:text-base leading-relaxed pr-3 md:pr-4">
                                            {item.q}
                                        </span>
                                        <div className="flex-shrink-0">
                                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                isActive ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {isActive ? (
                                                    <FiMinus className="w-4 h-4 md:w-5 md:h-5" />
                                                ) : (
                                                    <FiPlus className="w-4 h-4 md:w-5 md:h-5" />
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        isActive ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                        <div className="p-4 md:p-5 pt-0">
                                            <div className="text-gray-600 text-sm md:text-base leading-relaxed pt-4 border-t border-gray-100">
                                                {item.a}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* View All Button */}
                <div className="text-center mt-10 md:mt-14">
                    <Link
                        href="/faq"
                        className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-medium text-sm md:text-base px-6 md:px-8 py-2.5 md:py-3 rounded-lg transition-all duration-300"
                    >
                        সকল প্রশ্ন দেখুন
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}