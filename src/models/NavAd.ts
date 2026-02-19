// src/models/NavAd.ts
import mongoose from 'mongoose';

const navAdSchema = new mongoose.Schema({
    shopName: { 
        type: String, 
        required: true, 
        default: 'SOOQRA ONE' 
    },
    adText: { 
        type: String, 
        required: true,
        maxlength: 100 
    },
    couponCode: { 
        type: String, 
        maxlength: 20 
    },
    buttonText: { 
        type: String, 
        default: 'Shop Now' 
    },
    buttonLink: { 
        type: String 
    },
    backgroundColor: { 
        type: String, 
        default: 'bg-gradient-to-r from-purple-900 to-indigo-900' 
    },
    textColor: { 
        type: String, 
        default: 'text-white' 
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    impressions: { 
        type: Number, 
        default: 0 
    },
    clicks: { 
        type: Number, 
        default: 0 
    }
}, {
    timestamps: true
});

// Delete the old model if it exists to prevent schema conflicts
if (mongoose.models.NavAd) {
    delete mongoose.models.NavAd;
}

export default mongoose.model('NavAd', navAdSchema);