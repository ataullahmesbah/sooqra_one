// src/app/categories/[categoryId]/page.tsx
import { notFound } from 'next/navigation';
import dbConnect from '@/src/lib/dbConnect';
import Category from '@/src/models/Category';
import Product from '@/src/models/Products';

interface PageProps {
    params: Promise<{ categoryId: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
    await dbConnect();
    const { categoryId } = await params;

    try {
        // Fix: Cast to any to avoid TypeScript errors
        const category = await Category.findById(categoryId).lean() as any;

        if (!category) {
            notFound();
        }

        // Fix: Cast products to any[]
        const products = await Product.find({ category: categoryId })
            .populate('category')
            .populate('subCategory')
            .sort({ createdAt: -1 })
            .lean() as any[];

        // Convert ObjectId to string for products
        const serializedProducts = products.map(product => ({
            ...product,
            _id: product._id?.toString(),
            category: product.category ? {
                ...product.category,
                _id: product.category._id?.toString()
            } : null,
            subCategory: product.subCategory ? {
                ...product.subCategory,
                _id: product.subCategory._id?.toString()
            } : null,
        }));

        return (
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {category.name || 'Category'}
                        </h1>
                        <p className="text-xl opacity-90">
                            {serializedProducts.length} products available
                        </p>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {serializedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {serializedProducts.map((product) => (
                                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    {/* Product Image */}
                                    <div className="h-48 bg-gray-200 relative">
                                        {product.mainImage ? (
                                            <img
                                                src={product.mainImage}
                                                alt={product.mainImageAlt || product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                                <span className="text-gray-600">No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-2 truncate">
                                            {product.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {product.shortDescription || product.description?.substring(0, 100)}
                                        </p>

                                        {/* Price */}
                                        {product.prices && product.prices.length > 0 && (
                                            <div className="mb-3">
                                                <span className="text-xl font-bold text-blue-600">
                                                    {product.prices[0].currency === 'BDT' ? '৳' : '$'}
                                                    {product.prices[0].amount}
                                                </span>
                                            </div>
                                        )}

                                        {/* View Button */}
                                        <a
                                            href={`/products/${product.slug || product._id}`}
                                            className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            View Details
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                                No products found in this category
                            </h3>
                            <p className="text-gray-500">
                                Check back later for new arrivals
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error loading category:', error);
        notFound();
    }
}

// Generate static params
export async function generateStaticParams() {
    await dbConnect();
    const categories = await Category.find({}).select('_id').lean() as any[];

    return categories.map((category) => ({
        categoryId: category._id.toString(),
    }));
}