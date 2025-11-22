// src/app/api/products/coupons/route.ts
import dbConnect from '@/src/lib/dbConnect';
import Coupon from '@/src/models/Coupon';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Interface definitions
interface CouponRequestBody {
    code: string;
    productId: string;
    discountPercentage: number;
    useType: 'one-time' | 'multiple';
    expiresAt: string;
}

interface DeleteRequestBody {
    code: string;
}

export async function GET() {
    try {
        await dbConnect();
        const coupons = await Coupon.find({ isActive: true }).populate('productId', 'title');
        return NextResponse.json(coupons, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching coupons:', error);
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { code, productId, discountPercentage, useType, expiresAt }: CouponRequestBody = await request.json();

        if (!code || !productId || discountPercentage == null || !useType || !expiresAt) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        if (discountPercentage < 0 || discountPercentage > 100) {
            return NextResponse.json({ error: 'Discount percentage must be between 0 and 100' }, { status: 400 });
        }
        if (!['one-time', 'multiple'].includes(useType)) {
            return NextResponse.json({ error: 'Invalid use type' }, { status: 400 });
        }
        const expiresAtDate = new Date(expiresAt);
        if (isNaN(expiresAtDate.getTime())) {
            return NextResponse.json({ error: 'Invalid expiry date' }, { status: 400 });
        }
        if (expiresAtDate < new Date()) {
            return NextResponse.json({ error: 'Expiry date must be in the future' }, { status: 400 });
        }

        // Convert productId to ObjectId
        const productObjectId = new mongoose.Types.ObjectId(productId);

        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            existingCoupon.productId = productObjectId;
            existingCoupon.discountPercentage = discountPercentage;
            existingCoupon.useType = useType;
            existingCoupon.expiresAt = expiresAtDate;
            existingCoupon.updatedAt = new Date();
            await existingCoupon.save();
        } else {
            await Coupon.create({
                code,
                productId: productObjectId,
                discountPercentage,
                useType,
                expiresAt: expiresAtDate
            });
        }
        return NextResponse.json({ message: 'Coupon updated' }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating coupon:', error);
        return NextResponse.json({ error: 'Failed to update coupon: ' + error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await dbConnect();
        const { code }: DeleteRequestBody = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
        }

        await Coupon.deleteOne({ code });
        return NextResponse.json({ message: 'Coupon deleted' }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting coupon:', error);
        return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
    }
}