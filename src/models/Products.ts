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
    mainImageAlt: { type: String, required: true },
    additionalImages: [{
        url: { type: String },
        alt: { type: String },
    }],
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 160 },
    product_code: { type: String, required: true },
    descriptions: [{ type: String }],
    bulletPoints: [{ type: String }],
    productType: { type: String, required: true, enum: ['Own', 'Affiliate'] },
    affiliateLink: { type: String },
    owner: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: false,
        default: null
    },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    availability: { type: String, enum: ['InStock', 'OutOfStock', 'PreOrder'], default: 'InStock' },
    metaTitle: { type: String, required: true, maxlength: 60 },
    metaDescription: { type: String, required: true, maxlength: 160 },
    keywords: [{ type: String }],
    faqs: [faqSchema],
    reviews: [reviewSchema],
    aggregateRating: {
        ratingValue: {
            type: Number,
            required: true,
            min: 0,
            max: 5
        },
        reviewCount: {
            type: Number,
            required: true,
            min: 0
        }
    },
    targetCountry: { type: String, default: 'Bangladesh' },
    targetCity: { type: String, default: 'Dhaka' },
    isGlobal: { type: Boolean, default: false },
    sizeRequirement: {
        type: String,
        enum: ['Optional', 'Mandatory'],
        default: 'Optional',
    },
    sizes: [sizeSchema],
    specifications: [specSchema],
    schemaMarkup: { type: Object },
}, { timestamps: true });


export default mongoose.models.Product || mongoose.model('Product', productSchema);