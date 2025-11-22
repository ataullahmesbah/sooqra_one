// src/app/api/products/nav-ads/track/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import NavAd from '@/src/models/NavAd';

interface TrackRequestBody {
    adId: string;
    type: 'impression' | 'click';
}

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { adId, type }: TrackRequestBody = await request.json();

        const update = type === 'impression'
            ? { $inc: { impressions: 1 } }
            : { $inc: { clicks: 1 } };

        await NavAd.findByIdAndUpdate(adId, update);

        return NextResponse.json({
            success: true,
            message: `${type} tracked successfully`
        });
    } catch (error: any) {
        console.error('Error tracking nav ad:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to track'
        }, { status: 500 });
    }
}