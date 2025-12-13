// File: models/Banner.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title?: string; // Changed to optional
  subtitle?: string;
  image: string;
  imagePublicId: string;
  buttons: Array<{
    text: string;
    link: string;
    type: string;
  }>;
  buttonPosition: string; // NEW: Store button position
  isActive: boolean;
  order: number;
  duration: number;
}

const ButtonSchema = new Schema({
  text: { type: String, required: true },
  link: { type: String, required: true },
  type: {
    type: String,
    default: 'gray'
  }
});

const BannerSchema = new Schema({
  title: { type: String },
  subtitle: { type: String },
  image: { type: String, required: true },
  imagePublicId: { type: String, required: true },
  buttons: [ButtonSchema],
  buttonPosition: {
    type: String,
    enum: ['left-top', 'left-center', 'left-bottom', 
           'center-top', 'center-center', 'center-bottom',
           'right-top', 'right-center', 'right-bottom'],
    default: 'center-bottom'
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  duration: { type: Number, default: 5 }
}, {
  timestamps: true
});

BannerSchema.index({ order: 1, isActive: 1 });

export default mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);