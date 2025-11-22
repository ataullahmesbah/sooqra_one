import mongoose from 'mongoose';

const shippingChargeSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Dhaka-Chattogram', 'Others'],
        unique: true
    },
    charge: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

export default mongoose.models.ShippingCharge || mongoose.model('ShippingCharge', shippingChargeSchema);