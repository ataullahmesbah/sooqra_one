import type { Metadata } from 'next';
import Link from 'next/link';
import {
    FiPhone,
    FiClock,
    FiMessageSquare,
    FiShoppingBag,
    FiTruck,
    FiShield,
    FiHelpCircle,
    FiMail
} from 'react-icons/fi';



export const metadata: Metadata = {
    title: 'Customer Care - Sooqra One | 24/7 Support & Help Center',
    description: '24/7 customer care support for Sooqra One. Get help with orders, delivery, returns, and account issues. Contact us at +8801571083401',
    keywords: 'customer care, Sooqra One support, help center, contact number, customer service, order help, delivery support',
    authors: [{ name: 'Sooqra One' }],
    robots: 'index, follow',
    alternates: {
        canonical: 'https://sooqraone.com/customer-care'
    },
    openGraph: {
        title: 'Customer Care - Sooqra One | 24/7 Support & Help Center',
        description: 'Get 24/7 customer care support for all your shopping needs. Contact us at +8801571083401 for immediate assistance.',
        url: 'https://sooqraone.com/customer-care',
        type: 'website',
        siteName: 'Sooqra One',
        images: [{
            url: 'https://sooqraone.com/images/customer-care-og.jpg',
            width: 1200,
            height: 630,
            alt: 'Sooqra One Customer Care Support'
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Customer Care - Sooqra One | 24/7 Support',
        description: '24/7 customer care support for Sooqra One. Contact: +8801571083401',
        images: ['https://sooqraone.com/images/customer-care-twitter.jpg'],
    },

};

export default function CustomerCarePage() {

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CustomerService",
        "name": "Sooqra One Customer Care",
        "description": "24/7 customer care support for Sooqra One e-commerce platform",
        "url": "https://sooqraone.com/customer-care",
        "telephone": "+8801571083401",
        "email": "support@sooqraone.com",
        "availableLanguage": ["Bengali", "English"],
        "hoursAvailable": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            "opens": "00:00",
            "closes": "23:59"
        },
        "serviceType": "Customer Service"
    };

    const faqStructuredData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "অর্ডার পেতে কত সময় লাগে?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "সাধারণত আমরা প্রি-অর্ডার ব্যাতীত ৩ থেকে ৫ দিনের মধ্যে পণ্য সরবরাহ করি। ঢাকার ভিতরে ডেলিভারি ১-২ দিন এবং ঢাকার বাইরে ৩-৫ দিনের মধ্যে সম্পন্ন হয়। কখনো কোনো অনাকাঙ্ক্ষিত পরিস্থিতি তৈরি হলে আমরা ফোনে গ্রাহকের সাথে যোগাযোগ করে ডেলিভারির সময় সম্পর্কে অবগত করি।"
                }
            },
            {
                "@type": "Question",
                "name": "গ্রাহক সেবা পাওয়ার উপায় কি?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "২৪ ঘন্টা একটি অভিযোগ টিম এবং গ্রাহক সেবা টিম কাজ করে এবং গ্রাহক সেবা প্রদান করে। মূলত গ্রাহক সঠিক অর্ডারের মাধ্যমে সঠিক পণ্যটি পেয়েছে কি না অথবা পণ্য / ডেলিভারি সম্পর্কে কোন অভিযোগ আছে কি না তা নিশ্চিত করা হয় এবং সে অনুযায়ী ব্যবস্থা গ্রহণ করা হয়। অভিযোগ/মন্তব্য পাওয়ার ১ ঘণ্টার মধ্যে একটি প্রাথমিক জবাব প্রদান করা হয় এবং ২৪ ঘণ্টার মধ্যে পূর্ণাঙ্গ সমাধান করতে আমরা প্রতিশ্রুতিবদ্ধ।"
                }
            }
        ]
    };

    return (
        <main className="bg-gray-50 min-h-screen">

            {/* Structured Data Scripts */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
            />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/20 z-0"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
                            <FiHelpCircle className="w-6 h-6" />
                            <span className="font-medium">24/7 Customer Support</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Customer <span className="text-gray-300">Care</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                            We're here to help you 24/7. Get instant support for all your shopping needs.
                        </p>

                        {/* Main Contact Number */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 inline-block">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                    <FiPhone className="w-8 h-8 text-gray-900" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-gray-300 text-sm mb-1">Primary Support Line</p>
                                    <a
                                        href="tel:+8801571083401"
                                        className="text-3xl md:text-4xl font-bold hover:text-gray-300 transition-colors"
                                    >
                                        +880 1571-083401
                                    </a>
                                    <p className="text-gray-300 mt-2">Available 24 hours, 7 days a week</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Links & Support Options */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Phone Support */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <FiPhone className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Phone Support</h3>
                            <a
                                href="tel:+8801571083401"
                                className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors block mb-3"
                            >
                                +880 1571-083401
                            </a>
                            <p className="text-gray-600 text-sm">Instant call support 24/7</p>
                        </div>

                        {/* Email Support */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <FiMail className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
                            <a
                                href="mailto:support@sooqraone.com"
                                className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors block mb-3"
                            >
                                support@sooqraone.com
                            </a>
                            <p className="text-gray-600 text-sm">Response within 2-4 hours</p>
                        </div>

                        {/* Live Chat */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <FiMessageSquare className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
                            <p className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</p>
                            <p className="text-gray-600 text-sm">Real-time chat support</p>
                        </div>
                    </div>

                    {/* Bengali FAQ Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <span className="text-lg font-bold text-amber-600">বাং</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">সাধারণ প্রশ্নাবলী</h2>
                        </div>

                        <div className="space-y-8">
                            {/* FAQ 1 */}
                            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="text-amber-600">১.</span> অর্ডার পেতে কত সময় লাগে?
                                </h3>
                                <div className="text-gray-700 leading-relaxed space-y-2">
                                    <p>
                                        সাধারণত আমরা প্রি-অর্ডার ব্যাতীত <span className="font-semibold">৩ থেকে ৫ দিনের</span> মধ্যে পণ্য সরবরাহ করি।
                                        ঢাকার ভিতরে ডেলিভারি ১-২ দিন এবং ঢাকার বাইরে ৩-৫ দিনের মধ্যে সম্পন্ন হয়।
                                    </p>
                                    <p>
                                        কখনো কোনো অনাকাঙ্ক্ষিত পরিস্থিতি তৈরি হলে আমরা ফোনে গ্রাহকের সাথে যোগাযোগ করে ডেলিভারির সময় সম্পর্কে অবগত করি।
                                    </p>
                                </div>
                            </div>

                            {/* FAQ 2 */}
                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="text-blue-600">২.</span> গ্রাহক সেবা পাওয়ার উপায় কি?
                                </h3>
                                <div className="text-gray-700 leading-relaxed space-y-2">
                                    <p>
                                        <span className="font-semibold">২৪ ঘন্টা</span> একটি অভিযোগ টিম এবং গ্রাহক সেবা টিম কাজ করে এবং গ্রাহক সেবা প্রদান করে।
                                    </p>
                                    <p>
                                        মূলত গ্রাহক সঠিক অর্ডারের মাধ্যমে সঠিক পণ্যটি পেয়েছে কি না অথবা পণ্য / ডেলিভারি সম্পর্কে কোন অভিযোগ আছে কি না তা নিশ্চিত করা হয়
                                        এবং সে অনুযায়ী ব্যবস্থা গ্রহণ করা হয়।
                                    </p>
                                    <p className="font-medium text-blue-700 mt-3">
                                        অভিযোগ/মন্তব্য পাওয়ার <span className="font-bold">১ ঘণ্টার</span> মধ্যে একটি প্রাথমিক জবাব প্রদান করা হয় এবং
                                        <span className="font-bold"> ২৪ ঘণ্টার</span> মধ্যে পূর্ণাঙ্গ সমাধান করতে আমরা প্রতিশ্রুতিবদ্ধ।
                                    </p>
                                </div>
                            </div>

                            {/* FAQ 3 */}
                            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="text-green-600">৩.</span> পেমেন্ট ও রিটার্ন পলিসি কি?
                                </h3>
                                <div className="text-gray-700 leading-relaxed space-y-2">
                                    <p>
                                        <span className="font-semibold">পেমেন্ট:</span> ক্যাশ অন ডেলিভারি (COD), বিকাশ, নগদ, রকেট, এবং ক্রেডিট/ডেবিট কার্ড গ্রহণ করা হয়।
                                        সকল অনলাইন পেমেন্ট SSL এনক্রিপশন এর মাধ্যমে সুরক্ষিত।
                                    </p>
                                    <p>
                                        <span className="font-semibold">রিটার্ন পলিসি:</span> ডেলিভারির ৪৮ ঘন্টার মধ্যে ভুল বা ত্রুটিপূর্ণ পণ্য রিটার্ন করতে পারবেন।
                                        পণ্য অপরিবর্তিত ও অপ্রয়োগীয় অবস্থায় থাকতে হবে।
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                  

                    {/* Emergency Contact Banner */}
                    <div className="mt-12 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white text-center">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-left">
                                <h3 className="text-2xl font-bold mb-2">🚨 জরুরী সহায়তা প্রয়োজন?</h3>
                                <p className="text-red-100">
                                    অর্ডার ক্যান্সেল বা জরুরী ইস্যুর জন্য সরাসরি কল করুন
                                </p>
                            </div>
                            <div>
                                <a
                                    href="tel:+8801571083401"
                                    className="bg-white text-red-600 hover:bg-red-50 font-bold px-8 py-4 rounded-xl text-lg transition-colors inline-flex items-center gap-3"
                                >
                                    <FiPhone className="w-6 h-6" />
                                    জরুরী কল: +880 1571-083401
                                </a>
                                <p className="text-red-200 text-sm mt-3">সকাল ১০টা - রাত ১০টা (প্রতিদিন)</p>
                            </div>
                        </div>
                    </div>

                    {/* Schema Structured Data (Hidden) */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "FAQPage",
                                "mainEntity": [
                                    {
                                        "@type": "Question",
                                        "name": "অর্ডার পেতে কত সময় লাগে?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "সাধারণত আমরা প্রি-অর্ডার ব্যাতীত ৩ থেকে ৫ দিনের মধ্যে পণ্য সরবরাহ করি। ঢাকার ভিতরে ডেলিভারি ১-২ দিন এবং ঢাকার বাইরে ৩-৫ দিনের মধ্যে সম্পন্ন হয়। কখনো কোনো অনাকাঙ্ক্ষিত পরিস্থিতি তৈরি হলে আমরা ফোনে গ্রাহকের সাথে যোগাযোগ করে ডেলিভারির সময় সম্পর্কে অবগত করি।"
                                        }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "গ্রাহক সেবা পাওয়ার উপায় কি?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "২৪ ঘন্টা একটি অভিযোগ টিম এবং গ্রাহক সেবা টিম কাজ করে এবং গ্রাহক সেবা প্রদান করে। মূলত গ্রাহক সঠিক অর্ডারের মাধ্যমে সঠিক পণ্যটি পেয়েছে কি না অথবা পণ্য / ডেলিভারি সম্পর্কে কোন অভিযোগ আছে কি না তা নিশ্চিত করা হয় এবং সে অনুযায়ী ব্যবস্থা গ্রহণ করা হয়। অভিযোগ/মন্তব্য পাওয়ার ১ ঘণ্টার মধ্যে একটি প্রাথমিক জবাব প্রদান করা হয় এবং ২৪ ঘণ্টার মধ্যে পূর্ণাঙ্গ সমাধান করতে আমরা প্রতিশ্রুতিবদ্ধ।"
                                        }
                                    }
                                ]
                            })
                        }}
                    />
                </div>
            </section>
        </main>
    );
}