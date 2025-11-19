// models/Test.ts
import { Schema, model, models, Document } from 'mongoose';

export interface ITest extends Document {
    name: string;
    description: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

const testSchema = new Schema<ITest>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: 200
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true // createdAt and updatedAt automatically
});

export default models.Test || model<ITest>('Test', testSchema);