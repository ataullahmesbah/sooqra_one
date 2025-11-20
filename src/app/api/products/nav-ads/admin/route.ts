// api/products/nav-ads/admin/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbMongoose';
import NavAd from '@/models/NavAd';

export async function GET() {
    await dbConnect();

    try {
        const navAds = await NavAd.find().sort({ createdAt: -1 });
        return NextResponse.tson({
            success: true,
            data: navAds
        });
    } catch (error) {
        console.error('Error fetching nav ads:', error);
        return NextResponse.tson({
            success: false,
            error: 'Failed to fetch nav ads'
        }, { status: 500 });
    }
}