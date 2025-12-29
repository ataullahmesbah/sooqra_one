import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    attempts: {
        type: Number,
        default: 0,
        max: 3
    }
});

export default mongoose.models.OTP || mongoose.model('OTP', OTPSchema);