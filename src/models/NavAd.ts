import mongoose from 'mongoose';

const navAdSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.models.NavAd || mongoose.model('NavAd', navAdSchema);