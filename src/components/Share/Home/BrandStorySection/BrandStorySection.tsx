'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FaPhoneAlt, FaLeaf, FaShieldAlt, FaTruck,
    FaStar, FaCheckCircle, FaStore, FaSeedling
} from 'react-icons/fa';

interface BrandStoryProps {
    contactNumber?: string;
}

// ✅ সবচেয়ে সহজ সমাধান - ease বাদ দিয়ে শুধু duration রাখুন
const fadeLeft = {
    hidden: { opacity: 0, x: -20 },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.55
            // ✅ ease বাদ
        }
    },
};

const fadeRight = {
    hidden: { opacity: 0, x: 20 },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.55,
            delay: 0.15
            // ✅ ease বাদ
        }
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            delay: i * 0.07
            // ✅ ease বাদ
        },
    }),
};

const features = [
    { icon: FaLeaf, title: '১০০% অর্গানিক', desc: 'প্রাকৃতিক উপাদান, রাসায়নিক মুক্ত পণ্য' },
    { icon: FaShieldAlt, title: 'অথেন্টিক গ্যারান্টি', desc: 'প্রতিটি পণ্যের গুণগত মান নিশ্চিত' },
    { icon: FaTruck, title: 'দ্রুত ডেলিভারি', desc: 'দেশব্যাপী ৩–৫ কার্যদিবসে পৌঁছে দেই' },
    { icon: FaStore, title: 'ভেরিফাইড সেলার', desc: 'সরাসরি কৃষক ও উৎপাদক থেকে সংগ্রহ' },
];

export default function BrandStorySection({
    contactNumber = '+880 1571-083401',
}: BrandStoryProps) {
    const tel = `tel:${contactNumber.replace(/[\s\-]/g, '')}`;

    return (
        <section className="py-12 md:py-20 lg:py-24 bg-white overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-start">

                    {/* ── LEFT COLUMN ── */}
                    <motion.div
                        variants={fadeLeft}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="flex flex-col gap-5 md:gap-7 min-w-0"
                    >
                        {/* Logo + rating */}
                        <div className="flex flex-col items-center lg:items-start gap-2.5">
                            <div className="relative w-40 h-14 sm:w-48 sm:h-16 md:w-56 md:h-20">
                                <Image
                                    src="/sooqraone.png"
                                    alt="Sooqra One — Organic Lifestyle"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <p className="text-sm font-medium text-gray-500 text-center lg:text-left">
                                অর্গানিক পণ্যের বিশ্বস্ত Marketplace
                            </p>
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className="text-amber-400 text-xs" />
                                ))}
                                <span className="text-gray-400 text-xs ml-1.5">৪.৯/৫ রেটিং</span>
                            </div>
                        </div>

                        {/* Features grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {features.map(({ icon: Icon, title, desc }, i) => (
                                <motion.div
                                    key={title}
                                    custom={i}
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true }}
                                    className="group bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-3.5 md:p-4 hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex items-center gap-2.5 mb-1.5">
                                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0">
                                            <Icon className="text-gray-700 text-sm" />
                                        </div>
                                        <h3 className="font-semibold text-gray-800 text-sm leading-snug">
                                            {title}
                                        </h3>
                                    </div>
                                    <p className="text-gray-400 text-xs leading-relaxed">
                                        {desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Trust badge */}
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                            <div className="flex flex-row items-center justify-around gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
                                        <FaSeedling className="text-gray-600 text-sm" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-gray-800 font-semibold text-xs sm:text-sm leading-tight">১০০০+ খুশি গ্রাহক</p>
                                        <p className="text-gray-400 text-xs mt-0.5">সারাদেশে</p>
                                    </div>
                                </div>

                                <div className="w-px h-8 bg-gray-300 shrink-0" />

                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
                                        <FaCheckCircle className="text-gray-600 text-sm" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-gray-800 font-semibold text-xs sm:text-sm leading-tight">২৫০+ অর্গানিক পণ্য</p>
                                        <p className="text-gray-400 text-xs mt-0.5">বাছাইকৃত সংগ্রহ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── RIGHT COLUMN ── */}
                    <motion.div
                        variants={fadeRight}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="flex flex-col gap-5 md:gap-6 min-w-0"
                    >
                        {/* Heading */}
                        <div>
                            <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
                                <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                                    আমাদের গল্প
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight break-words">
                                SOOQRA ONE —{' '}
                                <span className="text-gray-600">
                                    অর্গানিক লাইফস্টাইলের নির্ভরযোগ্য ঠিকানা
                                </span>
                            </h2>
                            <div className="w-14 md:w-20 h-[3px] bg-gray-800 rounded-full mt-3" />
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-3">
                            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                                <strong className="text-gray-900">SOOQRA ONE</strong> বাংলাদেশের একটি প্রিমিয়াম
                                অর্গানিক পণ্যের মার্কেটপ্লেস, যেখানে আমরা প্রাকৃতিক, রাসায়নিক-মুক্ত এবং
                                পরিবেশবান্ধব পণ্যগুলো সরাসরি আপনার দোরগোড়ায় পৌঁছে দেই।
                            </p>
                            <p className="text-gray-400 leading-relaxed text-xs md:text-sm">
                                Our collection features organic food, natural products, eco-friendly home goods,
                                and all essentials for a healthy, sustainable lifestyle.
                            </p>
                        </div>

                        <div className="border-t border-gray-100" />

                        {/* CTA card */}
                        <div className="bg-gray-900 rounded-2xl p-4 md:p-6 overflow-hidden relative">
                            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full border border-white/5 pointer-events-none" />

                            <div className="relative z-10 flex flex-col gap-4">
                                <div>
                                    <h4 className="text-sm md:text-base font-bold text-white leading-snug mb-1">
                                        অর্ডার বা পরামর্শের জন্য কল করুন
                                    </h4>
                                    <p className="text-gray-400 text-xs">
                                        আমাদের এক্সপার্ট টিম সর্বদা আপনার পাশে আছে
                                    </p>
                                </div>

                                <a
                                    href={tel}
                                    className="
                                        flex items-center justify-center gap-2
                                        bg-white text-gray-900
                                        px-4 py-3 rounded-xl
                                        font-bold text-sm
                                        hover:bg-gray-100
                                        transition-all duration-200
                                        w-full
                                        group
                                    "
                                >
                                    <FaPhoneAlt className="text-gray-600 text-xs shrink-0 group-hover:scale-110 transition-transform" />
                                    <span className="break-all">{contactNumber}</span>
                                </a>
                            </div>

                            <div className="relative z-10 mt-4 pt-4 border-t border-white/10 text-center">
                                <p className="text-gray-500 text-xs">
                                    🌿 প্রকৃতির সেরা উপহার — আপনার সুস্থ জীবনের প্রতিশ্রুতি
                                </p>
                            </div>
                        </div>

                        {/* Quick links */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: 'সব পণ্য দেখুন', href: '/shop' },
                                { label: 'আমাদের সম্পর্কে', href: '/about' },
                                { label: 'যোগাযোগ', href: '/contact' },
                            ].map(({ label, href }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="
                                        px-3.5 py-1.5 rounded-full
                                        border border-gray-200 hover:border-gray-400
                                        text-gray-600 hover:text-gray-900
                                        text-xs font-medium
                                        transition-all duration-200
                                        whitespace-nowrap
                                    "
                                >
                                    {label} →
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}