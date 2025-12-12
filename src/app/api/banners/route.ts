//api/banners/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Banner from '@/src/models/Banner';

// Types for frontend
export interface PublicBanner {
    _id: string;
    title: string;
    subtitle?: string;
    image: string;
    buttons: Array<{
        text: string;
        link: string;
        type: string;
    }>;
    duration: number;
    order: number;
    isActive: boolean;
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get only active banners for frontend
        const banners = await Banner.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 })
            .select('-imagePublicId -createdAt -updatedAt -__v')
            .lean();

        // Type assertion with proper type
        const publicBanners: PublicBanner[] = banners.map(banner => ({
            _id: banner._id.toString(),
            title: banner.title,
            subtitle: banner.subtitle,
            image: banner.image,
            buttons: banner.buttons.map(btn => ({
                text: btn.text,
                link: btn.link,
                type: btn.type
            })),
            duration: banner.duration || 5,
            order: banner.order,
            isActive: banner.isActive
        }));

        return NextResponse.json({
            success: true,
            data: publicBanners
        });

    } catch (error: any) {
        console.error('Error fetching banners:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch banners' },
            { status: 500 }
        );
    }
}