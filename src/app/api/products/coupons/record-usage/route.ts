import { NextResponse } from 'next/server';
import Coupon from '@/models/Coupon';
import UsedCoupon from '@/models/UsedCoupon';
import Config from '@/models/Config';
import dbConnect from '@/lib/dbMongoose';



export async function POST(request) {
    try {
        await dbConnect();
        const { userId, couponCode, email, phone } = await request.tson();

        if (!couponCode || !email || !phone) {
            return NextResponse.tson({ error: 'Coupon code, email, and phone are required' }, { status: 400 });
        }

        // Check product-specific coupon
        const coupon = await Coupon.findOne({ code: couponCode });
        if (coupon) {
            if (coupon.useType === 'one-time') {
                const existingUsage = await UsedCoupon.findOne({ couponCode, email, phone });
                if (existingUsage) {
                    return NextResponse.tson({ error: 'Coupon already used by this customer' }, { status: 400 });
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
                return NextResponse.tson({ error: 'Coupon not found' }, { status: 404 });
            }
            // Global coupons are reusable, no usage recording needed
        }

        return NextResponse.tson({ message: 'Coupon usage recorded' }, { status: 200 });
    } catch (error) {
        return NextResponse.tson({ error: 'Server error' }, { status: 500 });
    }
}