// src/models/ShippingCharge.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for TypeScript
export interface IShippingCharge extends Document {
    type: 'Dhaka' | 'Other-Districts';
    charge: number;
    updatedAt: Date;
}

const ShippingChargeSchema: Schema = new Schema({
    type: {
        type: String,
        required: true,
        unique: true,
        enum: ['Dhaka', 'Other-Districts'],
    },
    charge: {
        type: Number,
        required: true,
        min: 0,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update timestamp before saving
ShippingChargeSchema.pre<IShippingCharge>('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const ShippingCharge: Model<IShippingCharge> =
    mongoose.models.ShippingCharge ||
    mongoose.model<IShippingCharge>('ShippingCharge', ShippingChargeSchema);

export default ShippingCharge;