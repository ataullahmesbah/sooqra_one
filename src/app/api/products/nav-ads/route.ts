// src/app/api/products/nav-ads/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import NavAd from '@/src/models/NavAd';

interface CreateNavAdRequestBody {
    shopName: string;
    adText: string;
    couponCode?: string;
    buttonText: string;
    buttonLink?: string;
    backgroundColor: string;
    textColor: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export async function GET() {
    await dbConnect();

    try {
        const now = new Date();

        // Get all active ads within date range
        const activeAds = await NavAd.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).sort({
            createdAt: -1
        });

        return NextResponse.json({
            success: true,
            data: activeAds
        });
    } catch (error: any) {
        console.error('Error fetching nav ads:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch nav ads'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body: CreateNavAdRequestBody = await request.json();

        // Validate required fields
        if (!body.shopName || !body.adText || !body.startDate || !body.endDate) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Shop name, ad text, start date, and end date are required' 
                },
                { status: 400 }
            );
        }

        // Convert date strings to Date objects
        const navAdData = {
            ...body,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate)
        };

        const navAd = new NavAd(navAdData);
        await navAd.save();

        return NextResponse.json({
            success: true,
            message: 'Nav ad created successfully',
            data: navAd
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating nav ad:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json(
                { success: false, error: errors.join(', ') },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}