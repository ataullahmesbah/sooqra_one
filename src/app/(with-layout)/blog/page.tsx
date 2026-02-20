// app/blog/page.tsx  (or app/(with-layout)/blog/page.tsx)
import { Calendar, User, Clock } from 'lucide-react';

const categories = [
    { id: 1, name: 'Organic Living', count: 12 },
    { id: 2, name: 'Islamic Lifestyle', count: 8 },
    { id: 3, name: 'Healthy Recipes', count: 15 },
    { id: 4, name: 'Sunnah Products', count: 6 },
    { id: 5, name: 'Wellness Tips', count: 10 },
];

const blogPosts = [
    {
        id: 1,
        title: "10 Organic Foods That Boost Your Immunity Naturally",
        metaDescription: "Discover the power of organic foods in strengthening your immune system naturally. Learn about the best organic ingredients for your daily diet.",
        category: "Organic Living",
        author: "Dr. Fatima Khan",
        date: "March 15, 2024",
        readTime: "5 min read",
    },
    {
        id: 2,
        title: "The Beauty of Islamic Home Decor: Simple & Elegant",
        metaDescription: "Transform your living space with elegant Islamic home decor ideas. From calligraphy to geometric patterns, create a peaceful environment.",
        category: "Islamic Lifestyle",
        author: "Aisha Rahman",
        date: "March 12, 2024",
        readTime: "4 min read",
    },
    {
        id: 3,
        title: "Healthy Ramadan Recipes: Nutritious Iftar Ideas",
        metaDescription: "Make your Ramadan special with these healthy and delicious iftar recipes. Easy to prepare and packed with nutrients for energy.",
        category: "Healthy Recipes",
        author: "Chef Yusuf Ahmed",
        date: "March 10, 2024",
        readTime: "6 min read",
    },
    {
        id: 4,
        title: "Benefits of Using Miswak: A Complete Sunnah Guide",
        metaDescription: "Learn about the numerous health benefits of using Miswak, a traditional Sunnah practice. Natural oral care with scientific backing.",
        category: "Sunnah Products",
        author: "Imran Hossain",
        date: "March 8, 2024",
        readTime: "3 min read",
    },
    {
        id: 5,
        title: "Morning Rituals for a Productive Day: Islamic Perspective",
        metaDescription: "Start your day with blessings and productivity. Learn about morning rituals from Islamic teachings that set you up for success.",
        category: "Wellness Tips",
        author: "Fatima Khan",
        date: "March 5, 2024",
        readTime: "4 min read",
    },
];

const popularPosts = [
    { id: 1, title: "Natural Remedies for Common Ailments", views: 15420 },
    { id: 2, title: "Understanding Halal Certification", views: 12350 },
    { id: 3, title: "Benefits of Dates in Islamic Tradition", views: 10890 },
    { id: 4, title: "Organic Skincare Routine for Beginners", views: 9870 },
];

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300 py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-gray-900">
                        Sooqra One Blog
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                        Organic living • Islamic lifestyle • Healthy recipes • Sunnah-inspired wellness
                    </p>
                </div>
            </div>

            {/* Main Content: 3-column layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left: Categories Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-4 lg:top-24">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <span className="w-1 h-6 bg-emerald-500 rounded-full mr-3"></span>
                                Categories
                            </h2>
                            <div className="space-y-2">
                                {categories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <span className="text-gray-700 font-medium">{cat.name}</span>
                                        <span className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium">
                                            {cat.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Middle: Main Blog Posts Grid */}
                    <main className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blogPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow"
                                >
                                    <div className="mb-4">
                                        <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200">
                                            {post.category}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                        {post.title}
                                    </h2>

                                    <p className="text-gray-600 mb-6 line-clamp-4 flex-grow">
                                        {post.metaDescription}
                                    </p>

                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mt-auto pt-4 border-t border-gray-200">
                                        <span className="flex items-center gap-1.5">
                                            <User size={14} /> {post.author}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} /> {post.date}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={14} /> {post.readTime}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>

                    {/* Right: Popular Posts Sidebar */}
                    <aside className="lg:w-80 flex-shrink-0">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-4 lg:top-24">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="text-emerald-500">★</span> Popular Posts
                            </h3>
                            <div className="space-y-5">
                                {popularPosts.map((p) => (
                                    <div key={p.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                                        <h4 className="text-gray-800 font-medium line-clamp-2 mb-2 hover:text-emerald-700 transition-colors">
                                            {p.title}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            {p.views.toLocaleString()} views
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}