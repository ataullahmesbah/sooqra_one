import FAQSection from '@/src/components/Share/FAQSection/FAQSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    // ✅ বাংলা টাইটেল (গুগল বুঝবে)
    title: "FAQ | Sooqra One - অর্গানিক পণ্য সম্পর্কে সাধারণ জিজ্ঞাসা",

    // ✅ বাংলা ডেসক্রিপশন (গুগল রেজাল্টে দেখাবে)
    description: "অর্ডার, ডেলিভারি, পেমেন্ট পদ্ধতি, পণ্য ফেরত নীতি এবং অন্যান্য বিষয়ে বিস্তারিত জানুন। Sooqra One - আপনার বিশ্বস্ত অর্গানিক পণ্যের অনলাইন শপ।",

    // ✅ কীওয়ার্ডস (বাংলা + ইংরেজি মিক্স)
    keywords: [
        'FAQ Sooqra One',
        'সাধারণ জিজ্ঞাসা',
        'অর্গানিক পণ্য',
        'কিভাবে অর্ডার করবো',
        'ডেলিভারি চার্জ বাংলাদেশ',
        'পেমেন্ট পদ্ধতি বিকাশ নগদ',
        'পণ্য ফেরত নীতি',
        'Sooqra One help',
        'organic products Bangladesh',
        'অর্গানিক ফুড অনলাইন'
    ],

    authors: [{ name: 'Sooqra One' }],
    robots: {
        index: true,      // গুগল ইন্ডেক্স করবে
        follow: true,     // লিংক ফলো করবে
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },

    // ✅ Open Graph (সোশ্যাল মিডিয়ার জন্য)
    openGraph: {
        title: "সাধারণ জিজ্ঞাসা - Sooqra One | অর্গানিক পণ্যের দোকান",
        description: "অর্ডার, ডেলিভারি, পেমেন্ট পদ্ধতি সম্পর্কে বিস্তারিত জানুন। ১০০% অর্গানিক পণ্য দেশব্যাপী ডেলিভারি।",
        url: "https://sooqraone.com/faq",
        siteName: "Sooqra One",
        type: "website",
        locale: "bn_BD",
        alternateLocale: "en_US",
        images: [
            {
                url: 'https://sooqraone.com/images/og-faq.jpg',
                width: 1200,
                height: 630,
                alt: 'Sooqra One FAQ - অর্গানিক পণ্য সম্পর্কে জিজ্ঞাসা',
                type: 'image/jpeg',
            }
        ],
    },

    // ✅ টুইটার কার্ড
    twitter: {
        card: "summary_large_image",
        title: "FAQ | Sooqra One - অর্গানিক পণ্য সম্পর্কে জিজ্ঞাসা",
        description: "অর্ডার, ডেলিভারি, পেমেন্ট পদ্ধতি সম্পর্কে বিস্তারিত জানুন।",
        images: ['https://sooqraone.com/images/og-faq.jpg'],
        creator: '@sooqraone',
        site: '@sooqraone',
    },

    // ✅ ক্যানোনিকাল URL (ডুপ্লিকেট কন্টেন্ট এড়াতে)
    alternates: {
        canonical: 'https://sooqraone.com/faq',
    },

    // ✅ অন্যান্য ভাষা ভার্সন (যদি থাকে)
    // alternates: {
    //     languages: {
    //         'bn': 'https://sooqraone.com/bn/faq',
    //         'en': 'https://sooqraone.com/en/faq',
    //     },
    // },

    // ✅ ভিউপোর্ট (মোবাইল ফ্রেন্ডলি)
    viewport: 'width=device-width, initial-scale=1',

    // ✅ ভারিফিকেশন (গুগল সার্চ কনসোল)
    verification: {
        google: 'your-google-verification-code', // আপনার কোড দিন
    },

    // ✅ ক্যাটাগরি
    category: 'ecommerce',
};

export default function FAQPage() {
    return (
        <main>
            <FAQSection />
        </main>
    );
}