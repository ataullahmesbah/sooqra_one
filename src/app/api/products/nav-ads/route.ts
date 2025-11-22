// src/app/api/products/nav-ads/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import NavAd from '@/src/models/NavAd';

interface CreateNavAdRequestBody {
    title: string;
    image: string;
    link: string;
    isActive: boolean;
    startDate: Date;
    endDate: Date;
    // Add other fields as per your NavAd model
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
            createdAt: -1 // Show newest first
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

        const navAd = new NavAd(body);
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