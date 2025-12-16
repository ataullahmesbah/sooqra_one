import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INavItem extends Document {
  title: string;
  slug?: string;
  type: 'link' | 'dropdown';
  order: number;
  isActive: boolean;
  parentId?: mongoose.Types.ObjectId;
  children?: INavItem[];
  createdAt: Date;
  updatedAt: Date;
}

const NavItemSchema = new Schema<INavItem>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  slug: {
    type: String,
    trim: true,
    default: '#'
  },
  type: {
    type: String,
    enum: ['link', 'dropdown'],
    default: 'link'
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'NavItem',
    default: null
  }
}, {
  timestamps: true
});

// Virtual for children
NavItemSchema.virtual('children', {
  ref: 'NavItem',
  localField: '_id',
  foreignField: 'parentId',
  justOne: false,
  match: { isActive: true }
});

// Indexes
NavItemSchema.index({ order: 1 });
NavItemSchema.index({ parentId: 1 });
NavItemSchema.index({ isActive: 1 });

export const NavItem: Model<INavItem> = mongoose.models.NavItem || mongoose.model<INavItem>('NavItem', NavItemSchema);