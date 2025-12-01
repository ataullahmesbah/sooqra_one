import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeature {
    icon: string;
    text: string;
}

export interface IShopBanner extends Document {
    title: string;
    subtitle: string;
    highlights: string[];
    cta: string;
    bg: string;
    textColor: string;
    badgeColor: string;
    features: IFeature[];
    image: string;
    link: string;
    createdAt: Date;
    updatedAt: Date;
}

const FeatureSchema = new Schema<IFeature>({
    icon: {
        type: String,
        required: true,
        trim: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
});

const ShopBannerSchema = new Schema<IShopBanner>({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    subtitle: {
        type: String,
        required: true,
        trim: true,
    },
    highlights: {
        type: [String],
        required: true,
        validate: {
            validator: (arr: string[]) => arr.length > 0,
            message: 'At least one highlight is required',
        },
    },
    cta: {
        type: String,
        required: true,
        trim: true,
    },
    bg: {
        type: String,
        required: true,
        trim: true,
    },
    textColor: {
        type: String,
        required: true,
        trim: true,
    },
    badgeColor: {
        type: String,
        required: true,
        trim: true,
    },
    features: {
        type: [FeatureSchema],
        required: true,
        validate: {
            validator: (arr: IFeature[]) => arr.length > 0,
            message: 'At least one feature is required',
        },
    },
    image: {
        type: String,
        required: true,
        trim: true,
    },
    link: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});

const ShopBanner: Model<IShopBanner> = mongoose.models.ShopBanner || mongoose.model<IShopBanner>('ShopBanner', ShopBannerSchema);

export default ShopBanner;