// models/Coupon.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    productId: mongoose.Types.ObjectId;
    discountPercentage: number;
    useType: 'one-time' | 'multiple';
    expiresAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CouponSchema: Schema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    useType: {
        type: String,
        enum: ['one-time', 'multiple'],
        default: 'one-time',
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true // createdAt and updatedAt automatically
});

// Index for better performance
CouponSchema.index({ code: 1 });
CouponSchema.index({ expiresAt: 1 });
CouponSchema.index({ isActive: 1 });

const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);

export default Coupon;