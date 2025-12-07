// models/Order.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for Product in Order
interface IOrderProduct {
    productId: string;
    title: string;
    quantity: number;
    price: number;
    mainImage: string;
    size?: string;
}

// Interface for Customer Information
interface ICustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postcode: string;
    country: string;
    district: string;
    thana: string;
    bkashNumber?: string;
    transactionId?: string;
}

// Main Order Interface
export interface IOrder extends Document {
    orderId: string;
    userId?: string; // Add this - optional for guests
    userEmail?: string; // Add this
    userPhone?: string; // Add this
    products: IOrderProduct[];
    customerInfo: ICustomerInfo;
    paymentMethod: 'cod' | 'pay_first' | 'bkash';
    status: string;
    total: number;
    discount: number;
    shippingCharge: number;
    couponCode?: string; // Add this
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    userId: { // Add this field
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null // Allow null for guest orders
    },
    userEmail: { // Add this field
        type: String,
        required: false
    },
    userPhone: { // Add this field
        type: String,
        required: false
    },
    products: [{
        productId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        mainImage: {
            type: String,
            required: true
        },
        size: {
            type: String,
            required: false
        }
    }],
    customerInfo: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        postcode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        thana: {
            type: String,
            required: true
        },
        bkashNumber: {
            type: String,
            required: false
        },
        transactionId: {
            type: String,
            required: false
        }
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'pay_first', 'bkash'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'pending_payment', 'accepted', 'rejected', 'completed', 'cancelled'], // Add 'accepted' here
        default: 'pending'
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    shippingCharge: {
        type: Number,
        default: 0,
        min: 0
    },
    couponCode: { // Add this field
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update updatedAt before saving
OrderSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Index for better query performance
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ 'customerInfo.email': 1 });
OrderSchema.index({ userId: 1 }); // Add this index
OrderSchema.index({ userEmail: 1 }); // Add this index
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1 });

// Export the model
const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;