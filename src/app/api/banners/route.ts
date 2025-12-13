// File: api/banners/route.ts - SIMPLER VERSION
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Banner from '@/src/models/Banner';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get only active banners for frontend
        const banners = await Banner.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 })
            .select('title subtitle image buttons duration order buttonPosition isActive')
            .lean();

        // Type assertion to handle Mongoose lean result
        const typedBanners = banners as unknown as Array<{
            _id: mongoose.Types.ObjectId;
            title?: string;
            subtitle?: string;
            image: string;
            buttons: Array<{
                text: string;
                link: string;
                type: string;
            }>;
            buttonPosition?: string;
            duration?: number;
            order?: number;
            isActive?: boolean;
        }>;

        const publicBanners = typedBanners.map(banner => ({
            _id: banner._id.toString(),
            title: banner.title || '',
            subtitle: banner.subtitle || undefined,
            image: banner.image,
            buttons: banner.buttons.map(btn => ({
                text: btn.text,
                link: btn.link,
                type: btn.type || 'gray'
            })),
            buttonPosition: banner.buttonPosition || 'center-bottom',
            duration: banner.duration || 5,
            order: banner.order || 0,
            isActive: banner.isActive !== undefined ? banner.isActive : true
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