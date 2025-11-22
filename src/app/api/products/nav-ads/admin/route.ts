// src/app/api/products/nav-ads/admin/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import NavAd from '@/src/models/NavAd';

export async function GET() {
    await dbConnect();

    try {
        const navAds = await NavAd.find().sort({ createdAt: -1 });
        return NextResponse.json({
            success: true,
            data: navAds
        });
    } catch (error: any) {
        console.error('Error fetching nav ads:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch nav ads'
        }, { status: 500 });
    }
}