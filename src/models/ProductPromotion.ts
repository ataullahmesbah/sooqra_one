import mongoose from 'mongoose';

interface IProductPromotion {
    image: {
        url: string;
        publicId: string;
        alt: string;
    };
    link?: {
        url: string;
        isActive: boolean;
    };
    isActive: boolean;
    updatedAt: Date;
    updatedBy?: string;
}

const ProductPromotionSchema = new mongoose.Schema({
    image: {
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: 'Hero Banner - Sooqra One'
        }
    },
    link: {
        url: {
            type: String,
            default: ''
        },
        isActive: {
            type: Boolean,
            default: false
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    updatedBy: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

export default mongoose.models.ProductPromotion || mongoose.model<IProductPromotion>('ProductPromotion', ProductPromotionSchema);