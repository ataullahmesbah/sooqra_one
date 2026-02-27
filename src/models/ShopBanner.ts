import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeature {
    icon?: string;
    text?: string;
}

export interface IShopBanner extends Document {
    title?: string;
    subtitle?: string;
    highlights?: string[];
    cta?: string;
    bg?: string;
    textColor?: string;
    badgeColor?: string;
    features?: IFeature[];
    image: string;
    link?: string;
    createdAt: Date;
    updatedAt: Date;
}

const FeatureSchema = new Schema<IFeature>({
    icon: {
        type: String,
        required: false,
        trim: true,
        default: ''
    },
    text: {
        type: String,
        required: false,
        trim: true,
        default: ''
    },
}, { _id: false });

// src/models/ShopBanner.ts  (এই ফাইলটা replace করো)

const ShopBannerSchema = new Schema<IShopBanner>({
    title: {
        type: String,
        required: false,
        trim: true

    },
    subtitle: {
        type: String,
        required: false,
        trim: true
    },
    highlights: {
        type: [String],
        required: false
    },
    cta: {
        type: String,
        required: false,
        trim: true
    },
    bg: { type: String, required: false, default: '...' },
    textColor: { type: String, required: false, default: 'text-white' },
    badgeColor: { type: String, required: false, default: 'from-purple-600 to-indigo-600' },
    features: {
        type: [FeatureSchema],
        required: false
    },
    image: {
        type: String,
        required: true,
        trim: true,
    },
    link: {
        type: String,
        required: false,
        default: '/shop'
    },
}, { timestamps: true });

const ShopBanner: Model<IShopBanner> = mongoose.models.ShopBanner || mongoose.model<IShopBanner>('ShopBanner', ShopBannerSchema);

export default ShopBanner;