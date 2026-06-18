// src/models/ShopBanner.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShopBanner extends Document {
    image: string;
    title?: string;
    subtitle?: string;
    offer?: string;          // e.g. "৳500 ছাড়" or "Free Delivery"
    ctaText?: string;        // button text e.g. "Shop Now"
    ctaLink?: string;        // button link e.g. "/shop"
    textPosition?: 'left' | 'center'; // text alignment
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ShopBannerSchema = new Schema<IShopBanner>(
    {
        image: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            trim: true,
            default: '',
        },
        subtitle: {
            type: String,
            trim: true,
            default: '',
        },
        offer: {
            type: String,
            trim: true,
            default: '',
        },
        ctaText: {
            type: String,
            trim: true,
            default: '',
        },
        ctaLink: {
            type: String,
            trim: true,
            default: '/shop',
        },
        textPosition: {
            type: String,
            enum: ['left', 'center'],
            default: 'left',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const ShopBanner: Model<IShopBanner> =
    mongoose.models.ShopBanner ||
    mongoose.model<IShopBanner>('ShopBanner', ShopBannerSchema);

export default ShopBanner;