// models/UsedCoupon.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUsedCoupon extends Document {
    userId?: string; // optional because required: false
    couponCode: string;
    email: string;
    phone: string;
    usedAt: Date;
}

const UsedCouponSchema: Schema = new Schema({
    userId: {
        type: String,
        required: false, // optional field
    },
    couponCode: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    usedAt: {
        type: Date,
        default: Date.now,
    },
});

// Create and export the model
const UsedCoupon: Model<IUsedCoupon> = mongoose.models.UsedCoupon || mongoose.model<IUsedCoupon>('UsedCoupon', UsedCouponSchema);

export default UsedCoupon;