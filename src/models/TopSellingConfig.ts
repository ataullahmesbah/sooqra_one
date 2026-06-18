import mongoose from 'mongoose';

const PinnedProductSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true
    },
    order: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const TopSellingConfigSchema = new mongoose.Schema({
    mode: {
        type: String,
        enum: ['manual', 'auto'],
        default: 'auto'
    },
    pinnedProducts: {
        type: [PinnedProductSchema],
        default: []
    }
}, {
    timestamps: true
});

// Check if model exists before creating
const TopSellingConfig = mongoose.models.TopSellingConfig || mongoose.model('TopSellingConfig', TopSellingConfigSchema);

export default TopSellingConfig;