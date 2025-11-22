// src/app/api/products/coupons/validate/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Coupon from '@/src/models/Coupon';
import Config from '@/src/models/Config';
import UsedCoupon from '@/src/models/UsedCoupon';
import mongoose from 'mongoose';

// Interface definitions
interface ValidateRequestBody {
    code: string;
    productIds: string[];
    userId?: string;
    cartTotal: number;
    email: string;
    phone: string;
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { code, productIds, userId, cartTotal, email, phone }: ValidateRequestBody = await request.json();

        if (!code || !productIds || !Array.isArray(productIds) || cartTotal == null || !email || !phone) {
            return NextResponse.json({ valid: false, message: 'Missing required fields' }, { status: 400 });
        }

        // Check product-specific coupon
        const coupon = await Coupon.findOne({ code, isActive: true }).populate('productId');
        if (coupon) {
            if (!coupon.productId || !productIds.includes(coupon.productId._id.toString())) {
                return NextResponse.json({ valid: false, message: 'Coupon not applicable to cart items' }, { status: 400 });
            }
            if (coupon.expiresAt && coupon.expiresAt < new Date()) {
                return NextResponse.json({ valid: false, message: 'Coupon has expired' }, { status: 400 });
            }
            if (coupon.useType === 'one-time') {
                const usedCoupon = await UsedCoupon.findOne({
                    couponCode: code,
                    $or: [{ email }, { phone }]
                });
                if (usedCoupon) {
                    return NextResponse.json({ valid: false, message: 'Coupon already used with this email or phone number' }, { status: 400 });
                }
            }
            return NextResponse.json({
                valid: true,
                type: 'product',
                discountPercentage: coupon.discountPercentage,
                productId: coupon.productId._id,
            }, { status: 200 });
        }

        // Check global coupon
        const globalCoupon = await Config.findOne({ key: 'globalCoupon', 'value.code': code });
        if (globalCoupon) {
            const { discountAmount, minCartTotal, expiresAt } = globalCoupon.value;
            if (cartTotal < minCartTotal) {
                return NextResponse.json({ valid: false, message: `Cart total must be at least ৳${minCartTotal}` }, { status: 400 });
            }
            if (expiresAt && new Date(expiresAt) < new Date()) {
                return NextResponse.json({ valid: false, message: 'Global coupon has expired' }, { status: 400 });
            }
            return NextResponse.json({
                valid: true,
                type: 'global',
                discountAmount,
            }, { status: 200 });
        }

        return NextResponse.json({ valid: false, message: 'Invalid coupon code' }, { status: 400 });
    } catch (error: any) {
        console.error('Coupon validation error:', error);
        return NextResponse.json({ valid: false, message: `Failed to validate coupon: ${error.message}` }, { status: 500 });
    }
}