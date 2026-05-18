// src/models/ProductVariant.ts - নিশ্চিত করুন export সঠিক আছে

import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    weight: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    comparePrice: {
        type: Number,
        default: 0
    },
    sku: {
        type: String,
        unique: true
    },
    quantity: {
        type: Number,
        default: 0
    },
    isDefault: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });


const ProductVariant = mongoose.models.ProductVariant || mongoose.model('ProductVariant', productVariantSchema);
export default ProductVariant;