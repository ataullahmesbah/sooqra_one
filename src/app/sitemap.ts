import { MetadataRoute } from "next";
import Product from "@/src/models/Products";
import Category from "@/src/models/Category";
import dbConnect from "@/src/lib/dbConnect";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://sooqraone.com";

    try {
        await dbConnect();

        // 🔹 Fetch Products - শুধু active products যেগুলোর slug আছে
        const products = await Product.find({
            availability: { $in: ['InStock', 'PreOrder'] }
        })
            .select("slug updatedAt title availability")
            .sort({ updatedAt: -1 })
            .lean();

        // 🔹 Fetch Categories - শুধু active categories
        const categories = await Category.find({
            isActive: true
        })
            .select("slug updatedAt name")
            .lean();

        // 🔹 শুধু সেই categories নিন যেগুলোর অন্তত ১টা product আছে
        const categoriesWithProducts = await Category.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $lookup: {
                    from: "products", // আপনার products collection নাম
                    localField: "_id",
                    foreignField: "category",
                    as: "categoryProducts"
                }
            },
            {
                $match: {
                    "categoryProducts.0": { $exists: true } // অন্তত ১টা product আছে
                }
            },
            {
                $project: {
                    slug: 1,
                    updatedAt: 1,
                    name: 1,
                    productCount: { $size: "$categoryProducts" }
                }
            }
        ]);

        // 🔹 Static Pages
        const staticPages = [
            { url: "", priority: 1.0, changeFrequency: "daily" },
            { url: "/products", priority: 0.9, changeFrequency: "daily" },
            { url: "/categories", priority: 0.8, changeFrequency: "weekly" },
            { url: "/about-us", priority: 0.7, changeFrequency: "monthly" },
            { url: "/contact", priority: 0.7, changeFrequency: "monthly" },
            { url: "/faq", priority: 0.7, changeFrequency: "monthly" },
            { url: "/customer-care", priority: 0.6, changeFrequency: "monthly" },
            { url: "/return-policy", priority: 0.6, changeFrequency: "monthly" },
            { url: "/privacy-policy", priority: 0.5, changeFrequency: "yearly" },
            { url: "/terms-of-service", priority: 0.5, changeFrequency: "yearly" },
            { url: "/cart", priority: 0.8, changeFrequency: "weekly" },
            { url: "/checkout", priority: 0.8, changeFrequency: "weekly" },
            { url: "/shop", priority: 0.7, changeFrequency: "weekly" },
            { url: "/track/orders", priority: 0.7, changeFrequency: "weekly" },
            { url: "/blogs", priority: 0.8, changeFrequency: "weekly" },
        ];

        // 🔹 Static Sitemap
        const staticSitemap = staticPages.map((page) => ({
            url: `${baseUrl}${page.url}`,
            lastModified: new Date(),
            changeFrequency: page.changeFrequency as "daily" | "weekly" | "monthly" | "yearly",
            priority: page.priority,
        }));

        // 🔹 Dynamic Product Pages
        const productPages = products
            .filter(product => {
                // Check if slug exists and is valid
                return product.slug && 
                       typeof product.slug === 'string' && 
                       product.slug.trim() !== '' &&
                       product.slug !== 'undefined' &&
                       product.slug !== 'null';
            })
            .map((product) => ({
                url: `${baseUrl}/products/${product.slug}`,
                lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
                changeFrequency: "weekly" as const,
                priority: product.availability === 'InStock' ? 0.9 : 0.7,
            }));

        // 🔹 Dynamic Category Pages - শুধু যেগুলোর product আছে
        const categoryPages = categoriesWithProducts
            .filter(category => {
                return category.slug && 
                       typeof category.slug === 'string' && 
                       category.slug.trim() !== '';
            })
            .map((category) => ({
                url: `${baseUrl}/categories/${category.slug}`,
                lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
                changeFrequency: "weekly" as const,
                priority: 0.8,
            }));

        // ✅ Combine all URLs
        const allUrls = [
            ...staticSitemap,
            ...productPages,
            ...categoryPages,
        ];

        // Remove duplicates
        const uniqueUrls = Array.from(
            new Map(allUrls.map(item => [item.url, item])).values()
        );

        return uniqueUrls;

    } catch (error) {
        // Fallback - return only essential pages
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: "daily" as const,
                priority: 1.0,
            },
            {
                url: `${baseUrl}/products`,
                lastModified: new Date(),
                changeFrequency: "daily" as const,
                priority: 0.9,
            },
            {
                url: `${baseUrl}/categories`,
                lastModified: new Date(),
                changeFrequency: "weekly" as const,
                priority: 0.8,
            },
        ];
    }
}

export const revalidate = 86400; // 24 hours