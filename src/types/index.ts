export interface Price {
    currency: string;
    amount: number;
    exchangeRate?: number;
}

export interface Category {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    description?: string;
    productCount?: number;
    latestProduct?: {
        mainImage: string;
        mainImageAlt: string;
        title: string;
        slug: string;
        _id: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface Product {
    _id: string;
    title: string;
    slug: string;
    prices: Price[];
    mainImage: string;
    mainImageAlt: string;
    additionalImages?: Array<{
        url: string;
        alt: string;
    }>;
    description: string;
    shortDescription?: string;
    product_code: string;
    productType: 'Own' | 'Affiliate';
    affiliateLink?: string;
    brand: string;
    category: Category | string;
    subCategory?: any;
    quantity: number;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
    metaTitle: string;
    metaDescription: string;
    keywords?: string[];
    faqs?: Array<{
        question: string;
        answer: string;
    }>;
    reviews?: Array<{
        rating: number;
        comment: string;
        reviewer: string;
    }>;
    aggregateRating?: {
        ratingValue: number;
        reviewCount: number;
    };
    targetCountry: string;
    targetCity: string;
    isGlobal: boolean;
    sizeRequirement: 'Optional' | 'Mandatory';
    sizes?: Array<{
        name: string;
        quantity: number;
    }>;
    specifications?: Array<{
        name: string;
        value: string;
    }>;
    bulletPoints?: string[];
    descriptions?: string[];
    createdAt?: string;
    updatedAt?: string;
}