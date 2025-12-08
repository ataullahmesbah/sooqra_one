// src/models/SubCategory.ts 
import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Parent category
}, { timestamps: true });

export default mongoose.models.SubCategory || mongoose.model('SubCategory', subCategorySchema);