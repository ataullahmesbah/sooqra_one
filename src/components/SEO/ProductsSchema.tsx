// src/components/seo/ProductsSchema.tsx
import React from 'react';
import { Category, Product } from '@/src/types/index';

interface ProductsSchemaProps {
    currentCategory: Category | null;
    categories: Category[];
    products: Product[];
    categorySlug: string;
    siteUrl: string;
    siteName: string;
    siteLogo: string;
}

const ProductsSchema: React.FC<ProductsSchemaProps> = ({
    currentCategory,
    categories,
    products,
    categorySlug,
    siteUrl,
    siteName,
    siteLogo,
}) => {
    // Breadcrumb Schema
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${siteUrl}`,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Products',
                item: `${siteUrl}/products`,
            },
            ...(currentCategory
                ? [
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: currentCategory.name,
                        item: `${siteUrl}/products?category=${categorySlug}`,
                    },
                ]
                : []),
        ],
    };

    // Website Schema
    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/products?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    };

    // Collection Page Schema
    const collectionPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: currentCategory ? `${currentCategory.name} Products` : 'All Products',
        description: currentCategory
            ? `Browse our collection of ${currentCategory.name} products`
            : 'Browse our complete collection of premium products',
        url: `${siteUrl}/products${categorySlug ? `?category=${categorySlug}` : ''}`,
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: products.length,
            itemListElement: products.slice(0, 10).map((product, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Product',
                    name: product.title,
                    url: `${siteUrl}/product/${product.slug}`,
                    image: product.mainImage,
                    description: product.shortDescription || product.description,
                    brand: {
                        '@type': 'Brand',
                        name: product.brand,
                    },
                    ...(product.aggregateRating?.ratingValue && {
                        aggregateRating: {
                            '@type': 'AggregateRating',
                            ratingValue: product.aggregateRating.ratingValue,
                            reviewCount: product.aggregateRating.reviewCount || 0,
                        },
                    }),
                    offers: product.prices.map((price) => ({
                        '@type': 'Offer',
                        priceCurrency: price.currency,
                        price: price.amount,
                        availability: product.availability === 'InStock'
                            ? 'https://schema.org/InStock'
                            : 'https://schema.org/OutOfStock',
                        url: `${siteUrl}/product/${product.slug}`,
                    }))[0], // Take first price as main offer
                },
            })),
        },
    };

    // FAQ Schema (if categories have descriptions)
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: categories.slice(0, 5).map((category) => ({
            '@type': 'Question',
            name: `What products are available in ${category.name} category?`,
            acceptedAnswer: {
                '@type': 'Answer',
                text: category.description || `Browse our collection of ${category.name} products including various types and brands.`,
            },
        })),
    };

    // Organization Schema
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
        logo: siteLogo,
        sameAs: [
            'https://www.facebook.com/yourpage',
            'https://twitter.com/yourprofile',
            'https://www.instagram.com/yourprofile',
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify([
                    breadcrumbSchema,
                    websiteSchema,
                    collectionPageSchema,
                    faqSchema,
                    organizationSchema,
                ]),
            }}
        />
    );
};

export default ProductsSchema;