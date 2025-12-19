'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaLeaf, FaShieldAlt, FaTruck, FaStar } from 'react-icons/fa';

interface BrandStoryProps {
    contactNumber?: string;
}

export default function BrandStorySection({
    contactNumber = '+৮৮০ ১৫৭১-০৮৩৪০১'
}: BrandStoryProps) {
    return (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* Left Side - Brand Identity */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-center lg:text-left"
                    >
                        {/* Logo Display */}
                        <div className="mb-8">
                            <div className="relative w-full max-w-xs mx-auto lg:mx-0 h-20">
                                <Image
                                    src="/sooqra.svg"
                                    alt="Sooqra One - অর্গানিক লাইফস্টাইল"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <p className="mt-4 text-lg font-medium text-gray-700">
                                অর্গানিক পণ্যের বিশ্বস্ত Marketplace
                            </p>
                        </div>

                        {/* Key Highlights */}
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <FaLeaf className="text-green-600 text-lg" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">১০০% অর্গানিক</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        প্রাকৃতিক উপাদান, রাসায়নিক মুক্ত, পরিবেশবান্ধব পণ্য
                                    </p>
                                </div>

                                <div className="flex-1 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <FaShieldAlt className="text-blue-600 text-lg" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">অথেন্টিক গ্যারান্টি</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        প্রতিটি পণ্যের গুণগত মান নিশ্চিতকরণ
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                        <FaTruck className="text-amber-600 text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">দেশব্যাপী ডেলিভারি</h3>
                                        <p className="text-sm text-gray-700">যেকোনো প্রান্তে ৩-৫ কার্যদিবস</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side - Brand Story */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        {/* Section Header */}
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                                SOOQRA ONE -
                                <span className="text-green-600"> অর্গানিক লাইফস্টাইলের নির্ভরযোগ্য ঠিকানা</span>
                            </h2>
                            <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-amber-500 rounded-full mt-3"></div>
                        </div>

                        {/* Main Description */}
                        <div className="prose prose-lg max-w-none">
                            <p className="text-gray-700 leading-relaxed">
                                <strong className="text-gray-900">SOOQRA ONE</strong> বাংলাদেশের একটি প্রিমিয়াম অর্গানিক পণ্যের মার্কেটপ্লেস,
                                যেখানে আমরা প্রাকৃতিক, রাসায়নিক-মুক্ত এবং পরিবেশবান্ধব পণ্যগুলো সরাসরি আপনার দোরগোড়ায় পৌঁছে দেই।
                            </p>

                            <p className="text-gray-700 leading-relaxed">
                                আমাদের সংগ্রহে রয়েছে অর্গানিক ফুড, ন্যাচারাল প্রোডাক্ট,
                                ইকো-ফ্রেন্ডলি হোম গুডস এবং স্বাস্থ্যসম্মত জীবনযাপনের সকল প্রয়োজনীয় পণ্য।
                            </p>
                        </div>

                        {/* Why Choose Us */}
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                <FaStar className="text-amber-500" />
                                কেন SOOQRA ONE বেছে নেবেন?
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                    </div>
                                    <span className="text-gray-700">সরাসরি ফার্মার্স এবং প্রোডিউসারদের কাছ থেকে পণ্য</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                    </div>
                                    <span className="text-gray-700">প্রতিটি পণ্যের অথেন্টিসিটি ভেরিফিকেশন</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                    </div>
                                    <span className="text-gray-700">কম্পিটিটিভ প্রাইসিং এবং বিশেষ অফার</span>
                                </li>
                            </ul>
                        </div>

                        {/* Call to Action */}
                        <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl p-6 text-white">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="text-center sm:text-left">
                                    <h4 className="text-xl font-bold mb-2">অর্ডার বা পরামর্শের জন্য কল করুন</h4>
                                    <p className="text-green-100">
                                        আমাদের এক্সপার্ট টিম আপনাকে সাহায্য করতে প্রস্তুত
                                    </p>
                                </div>

                                <a
                                    href={`tel:${contactNumber.replace(/\s+/g, '')}`}
                                    className="inline-flex items-center gap-3 bg-white text-green-700 
                           px-6 py-3 rounded-lg font-bold hover:bg-green-50 
                           hover:shadow-lg transition-all duration-300 whitespace-nowrap 
                           min-w-[200px] justify-center"
                                >
                                    <FaPhoneAlt className="text-green-600" />
                                    <span className="text-lg">{contactNumber}</span>
                                </a>
                            </div>

                            <p className="text-center mt-4 text-green-100 text-sm">
                                🌿 "প্রকৃতির সেরা উপহার, আপনার সুস্থ জীবনের প্রতিশ্রুতি"
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}