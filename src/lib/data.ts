import { Category, Product } from '@/src/types/index';

// Fetch all categories
export async function getCategories(): Promise<Category[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// Fetch products by category (optional)
export async function getProducts(categoryId?: string): Promise<Product[]> {
    try {
        const url = categoryId
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/products?categoryId=${categoryId}`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/products`;

        const response = await fetch(url, {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// src/lib/data.ts - Add this function
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
        // Clean the slug (remove any query parameters if present)
        const cleanSlug = slug.split('?')[0];

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${cleanSlug}`,
            {
                cache: 'no-store',
                next: {
                    tags: [`category-${cleanSlug}`],
                },
            }
        );

        if (!response.ok) {
            // Try to get category from categories list if direct fetch fails
            const allCategories = await getCategories();
            const category = allCategories.find(cat => cat.slug === cleanSlug);
            return category || null;
        }

        const data = await response.json();
        return data.category || null;
    } catch (error) {
        console.error('Error fetching category by slug:', error);

        // Fallback: try to find in cached categories
        try {
            const allCategories = await getCategories();
            const category = allCategories.find(cat => cat.slug === slug);
            return category || null;
        } catch {
            return null;
        }
    }
}
