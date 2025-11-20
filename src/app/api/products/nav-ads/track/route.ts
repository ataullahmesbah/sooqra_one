// app/api/products/nav-ads/track/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbMongoose';
import NavAd from '@/models/NavAd';

export async function POST(req) {
    await dbConnect();

    try {
        const { adId, type } = await req.tson();

        const update = type === 'impression'
            ? { $inc: { impressions: 1 } }
            : { $inc: { clicks: 1 } };

        await NavAd.findByIdAndUpdate(adId, update);

        return NextResponse.tson({
            success: true,
            message: `${type} tracked successfully`
        });
    } catch (error) {
        console.error('Error tracking nav ad:', error);
        return NextResponse.tson({
            success: false,
            error: 'Failed to track'
        }, { status: 500 });
    }
}
