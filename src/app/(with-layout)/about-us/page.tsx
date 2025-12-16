import type { Metadata } from 'next';
import { FiShoppingBag, FiTruck, FiShield, FiHeart, FiUsers, FiTarget } from 'react-icons/fi';
import { MdOutlineLocalGroceryStore, MdOutlinePayment } from 'react-icons/md';
import { BsChatQuote } from 'react-icons/bs';

export const metadata: Metadata = {
    title: 'About Us - Sooqra One | Premium E-commerce Platform',
    description: 'Learn about Sooqra One - Your trusted e-commerce partner in Bangladesh. We bring quality products, fast delivery, and exceptional customer service.',
    keywords: 'about us, Sooqra One, e-commerce Bangladesh, online shopping, about our company, our story, our mission',
    openGraph: {
        title: 'About Us - Sooqra One | Premium E-commerce Platform',
        description: 'Discover the story behind Sooqra One and our commitment to providing the best online shopping experience in Bangladesh.',
        url: 'https://sooqraone.com/about-us',
        type: 'website',
        siteName: 'Sooqra One',
        images: [{ url: 'https://sooqraone.com/images/og-about-us.jpg' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About Us - Sooqra One',
        description: 'Learn about our journey and commitment to excellence in e-commerce.',
        images: ['https://sooqraone.com/images/og-about-us.jpg'],
    },
};

export default function AboutUsPage() {
    return (
        <main className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/20 z-0"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Our Story at <span className="text-gray-300">Sooqra One</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-8">
                            Redefining online shopping in Bangladesh with quality, convenience, and customer-first approach.
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">Since 2023</span>
                            <span className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">10,000+ Happy Customers</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Mission */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <FiTarget className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                To make online shopping accessible, reliable, and enjoyable for every Bangladeshi. We strive to bridge the gap between quality products and customers through a seamless e-commerce experience.
                            </p>
                            <ul className="mt-6 space-y-3">
                                <li className="flex items-center gap-2 text-gray-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Provide authentic products with transparent pricing
                                </li>
                                <li className="flex items-center gap-2 text-gray-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Ensure fast and reliable delivery across Bangladesh
                                </li>
                                <li className="flex items-center gap-2 text-gray-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Deliver exceptional customer service at every step
                                </li>
                            </ul>
                        </div>

                        {/* Vision */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <FiTarget className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                To become Bangladesh&apos;s most trusted and loved e-commerce platform, setting new standards in online shopping through innovation, quality, and customer satisfaction.
                            </p>
                            <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">By 2025, we aim to:</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white p-3 rounded-lg">
                                        <div className="font-bold text-blue-600">50K+</div>
                                        <div className="text-gray-600">Products</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg">
                                        <div className="font-bold text-blue-600">100K+</div>
                                        <div className="text-gray-600">Customers</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg">
                                        <div className="font-bold text-blue-600">64</div>
                                        <div className="text-gray-600">Districts Coverage</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg">
                                        <div className="font-bold text-blue-600">99%</div>
                                        <div className="text-gray-600">Satisfaction Rate</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            These principles guide everything we do at Sooqra One
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[
                            {
                                icon: <FiShield className="w-8 h-8" />,
                                title: "Trust & Transparency",
                                description: "We believe in honest pricing, genuine products, and clear communication with our customers.",
                                color: "bg-purple-100 text-purple-600"
                            },
                            {
                                icon: <FiTruck className="w-8 h-8" />,
                                title: "Reliability",
                                description: "From order placement to delivery, we ensure a consistent and dependable shopping experience.",
                                color: "bg-blue-100 text-blue-600"
                            },
                            {
                                icon: <FiHeart className="w-8 h-8" />,
                                title: "Customer First",
                                description: "Your satisfaction is our priority. We listen, we care, and we go the extra mile.",
                                color: "bg-red-100 text-red-600"
                            },
                            {
                                icon: <FiShoppingBag className="w-8 h-8" />,
                                title: "Quality Assurance",
                                description: "Every product undergoes strict quality checks before reaching your doorstep.",
                                color: "bg-green-100 text-green-600"
                            },
                            {
                                icon: <FiUsers className="w-8 h-8" />,
                                title: "Community Focus",
                                description: "We support local sellers and contribute to Bangladesh's digital economy growth.",
                                color: "bg-yellow-100 text-yellow-600"
                            },
                            {
                                icon: <MdOutlinePayment className="w-8 h-8" />,
                                title: "Secure Transactions",
                                description: "Your payments and personal data are protected with enterprise-grade security.",
                                color: "bg-cyan-100 text-cyan-600"
                            }
                        ].map((value, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${value.color}`}>
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Shop With Sooqra One?</h2>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Experience the difference that sets us apart in the e-commerce landscape
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                            <div className="text-5xl mb-6">🚚</div>
                            <h3 className="text-xl font-bold mb-4">Nationwide Delivery</h3>
                            <p className="text-gray-300">
                                Fast and reliable delivery to all 64 districts. Track your order in real-time from dispatch to delivery.
                            </p>
                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <div className="text-sm text-gray-400">Average delivery time</div>
                                <div className="text-2xl font-bold">2-5 Days</div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                            <div className="text-5xl mb-6">🛡️</div>
                            <h3 className="text-xl font-bold mb-4">Quality Guaranteed</h3>
                            <p className="text-gray-300">
                                Every product is quality-checked. 48-hour return policy for defective or incorrect items.
                            </p>
                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <div className="text-sm text-gray-400">Quality checkpoints</div>
                                <div className="text-2xl font-bold">3-Step Process</div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                            <div className="text-5xl mb-6">💳</div>
                            <h3 className="text-xl font-bold mb-4">Flexible Payments</h3>
                            <p className="text-gray-300">
                                Multiple payment options including Cash on Delivery, bKash, Nagad, and bank cards.
                            </p>
                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <div className="text-sm text-gray-400">Payment success rate</div>
                                <div className="text-2xl font-bold">99.8%</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold">10K+</div>
                                <div className="text-gray-400 text-sm">Products</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">50K+</div>
                                <div className="text-gray-400 text-sm">Orders Delivered</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">64</div>
                                <div className="text-gray-400 text-sm">Districts Covered</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">98%</div>
                                <div className="text-gray-400 text-sm">Happy Customers</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team/Founder Message */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center text-white text-3xl">
                                SO
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Sooqra One Team</h3>
                                <p className="text-gray-600">Your Trusted E-commerce Partner</p>
                            </div>
                        </div>

                        <div className="relative">
                            <BsChatQuote className="w-12 h-12 text-gray-200 absolute -top-4 -left-2" />
                            <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed pl-8 italic">
                                &quot;At Sooqra One, we&apos;re not just selling products; we&apos;re building relationships. Every order is a promise - a promise of quality, timely delivery, and exceptional service. We&apos;re here to make your online shopping experience simple, secure, and satisfying.&quot;
                            </blockquote>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3">
                                    <MdOutlineLocalGroceryStore className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-600">Wide Product Selection</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiTruck className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-600">Fast Nationwide Delivery</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiShield className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-600">Secure Shopping</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Experience Better Shopping?
                    </h2>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied customers who trust Sooqra One for their online shopping needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/shop"
                            className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl transition-colors duration-300 inline-flex items-center justify-center gap-2"
                        >
                            <FiShoppingBag className="w-5 h-5" />
                            Start Shopping Now
                        </a>
                        <a
                            href="/contact"
                            className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl transition-colors duration-300"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}