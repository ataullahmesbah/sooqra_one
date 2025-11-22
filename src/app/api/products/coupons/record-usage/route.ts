// src/app/api/products/coupons/record-usage/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Coupon from '@/src/models/Coupon';
import Config from '@/src/models/Config';
import UsedCoupon from '@/src/models/UsedCoupon';

// Interface definitions
interface RecordUsageRequestBody {
    userId?: string;
    couponCode: string;
    email: string;
    phone: string;
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { userId, couponCode, email, phone }: RecordUsageRequestBody = await request.json();

        if (!couponCode || !email || !phone) {
            return NextResponse.json({ error: 'Coupon code, email, and phone are required' }, { status: 400 });
        }

        // Check product-specific coupon
        const coupon = await Coupon.findOne({ code: couponCode });
        if (coupon) {
            if (coupon.useType === 'one-time') {
                const existingUsage = await UsedCoupon.findOne({ couponCode, email, phone });
                if (existingUsage) {
                    return NextResponse.json({ error: 'Coupon already used by this customer' }, { status: 400 });
                }

                await UsedCoupon.create({
                    userId: userId || null,
                    couponCode,
                    email,
                    phone,
                });
            }
        } else {
            // Check global coupon
            const globalCoupon = await Config.findOne({
                key: 'globalCoupon',
                'value.code': { $regex: `^${couponCode}$`, $options: 'i' }
            });
            if (!globalCoupon) {
                return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
            }
            // Global coupons are reusable, no usage recording needed
        }

        return NextResponse.json({ message: 'Coupon usage recorded' }, { status: 200 });
    } catch (error: any) {
        console.error('Error recording coupon usage:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}