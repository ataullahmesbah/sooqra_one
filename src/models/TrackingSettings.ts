// src/lib/models/TrackingSettings.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrackingSettings extends Document {
    pixelEnabled: boolean;       // Meta Pixel (browser)
    capiEnabled: boolean;        // Meta Conversions API (server)
    gtmEnabled: boolean;         // Google Tag Manager (loads GA4 + Clarity inside)
    updatedAt: Date;
    updatedBy?: string;
}

const TrackingSettingsSchema = new Schema<ITrackingSettings>(
    {
        pixelEnabled: { type: Boolean, default: true },
        capiEnabled: { type: Boolean, default: true },
        gtmEnabled: { type: Boolean, default: true },
        updatedBy: { type: String, default: 'admin' },
    },
    {
        timestamps: true,
        collection: 'trackingSettings',
    }
);

// Singleton document — always one row
const TrackingSettings: Model<ITrackingSettings> =
    mongoose.models.TrackingSettings ||
    mongoose.model<ITrackingSettings>('TrackingSettings', TrackingSettingsSchema);

export default TrackingSettings;