import mongoose from 'mongoose';

export interface IPasswordReset extends mongoose.Document {
    email: string;
    token: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
}

const passwordResetSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '1h' } // Auto delete after 1 hour
    },
    used: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.models.PasswordReset || mongoose.model<IPasswordReset>('PasswordReset', passwordResetSchema);