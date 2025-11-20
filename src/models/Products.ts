// Updated Mongoose Model: models/Product.ts
import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
    currency: { type: String, required: true, enum: ['BDT', 'USD', 'EUR'] },
    amount: { type: Number, required: true },
    exchangeRate: { type: Number },
});

const faqSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
});

const specSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true },
});

const reviewSchema = new mongoose.Schema({
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    reviewer: { type: String },
});

const sizeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
});



const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    prices: [priceSchema],
    mainImage: { type: String, required: true },
    mainImageAlt: { type: String, required: true }, // Added for ALT text
    additionalImages: [{
        url: { type: String },
        alt: { type: String },
    }], // Updated to object with url and alt
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 160 }, // For AEO
    product_code: { type: String, required: true },
    descriptions: [{ type: String }],
    bulletPoints: [{ type: String }],
    productType: { type: String, required: true, enum: ['Own', 'Affiliate'] },
    affiliateLink: { type: String },
    owner: { type: String, required: true },
    brand: { type: String, required: true }, // For GEO
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    availability: { type: String, enum: ['InStock', 'OutOfStock', 'PreOrder'], default: 'InStock' }, // For SGE
    metaTitle: { type: String, required: true, maxlength: 60 }, // For SEO
    metaDescription: { type: String, required: true, maxlength: 160 }, // For SEO
    keywords: [{ type: String }], // For SEO
    faqs: [faqSchema], // For GEO and AEO
    reviews: [reviewSchema], // For SGE (can be empty initially)
    aggregateRating: {
        ratingValue: { type: Number, min: 1, max: 5 },
        reviewCount: { type: Number, default: 0 },
    }, // For SGE
    targetCountry: { type: String, default: 'Bangladesh' },
    targetCity: { type: String, default: 'Dhaka' },
    isGlobal: { type: Boolean, default: false },
    sizeRequirement: {
        type: String,
        enum: ['Optional', 'Mandatory'],
        default: 'Optional',
    },
    sizes: [sizeSchema],
    specifications: [specSchema], // For AEO
    schemaMarkup: { type: Object }, // For SEO and GEO (auto-generated in API)
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);