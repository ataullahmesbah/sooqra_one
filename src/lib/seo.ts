// src/lib/seo.ts
export const generateProductSEO = (
    categoryName: string | null,
    productsCount: number
) => {
    const title = categoryName
        ? `${categoryName} Products - Buy Online | Best Prices & Quality`
        : `Products Collection - Shop Premium Items Online`;

    const description = categoryName
        ? `Shop premium ${categoryName.toLowerCase()} products online. ${productsCount}+ items available with best prices, fast delivery, and excellent customer service.`
        : `Browse our collection of premium products. ${productsCount}+ items across multiple categories with secure payment and fast delivery.`;

    const keywords = categoryName
        ? [
            `${categoryName} products`,
            `buy ${categoryName.toLowerCase()} online`,
            `${categoryName.toLowerCase()} collection`,
            'online shopping',
            'ecommerce',
            'best prices',
        ]
        : [
            'online shopping',
            'ecommerce',
            'products',
            'buy online',
            'shopping',
            'best deals',
        ];

    return { title, description, keywords };
};

export const generateCanonicalUrl = (
    baseUrl: string,
    categorySlug: string | null
) => {
    return categorySlug
        ? `${baseUrl}/products?category=${categorySlug}`
        : `${baseUrl}/products`;
};