// File: app/api/admin/banners/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/src/lib/dbConnect';
import Banner from '@/src/models/Banner';
import { uploadToCloudinary } from '@/src/utils/cloudinary';

interface BannerButton {
    text: string;
    link: string;
    type: string;
}

// GET all banners (admin)
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const banners = await Banner.find()
            .sort({ order: 1, createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: banners
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching banners:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch banners'
            },
            { status: 500 }
        );
    }
}


export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const formData = await request.formData();

        const title = formData.get('title') as string;
        const subtitle = formData.get('subtitle') as string;
        const duration = formData.get('duration') as string || '5';
        const order = formData.get('order') as string || '0';
        const isActive = formData.get('isActive') as string || 'true';
        const buttons = formData.get('buttons') as string;
        const imageFile = formData.get('image') as File;

        // NEW: Add button position
        const buttonPosition = formData.get('buttonPosition') as string || 'center-bottom';

        // Validate required fields - Title is now optional
        if (!imageFile) {
            return NextResponse.json(
                { success: false, error: 'Image is required' },
                { status: 400 }
            );
        }

        // Upload image to Cloudinary
        let imageResult;
        try {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            imageResult = await uploadToCloudinary(buffer, {
                folder: 'sooqra/banners',
                width: 1920,
                height: 600,
                crop: 'fill',
                format: 'webp',
                quality: 'auto:good',
            });
        } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to upload image',
                    details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
                },
                { status: 500 }
            );
        }

        // Parse buttons (optional)
        let parsedButtons: BannerButton[] = [];
        if (buttons && buttons.trim()) {
            try {
                parsedButtons = JSON.parse(buttons);
            } catch (e) {
                console.error('Error parsing buttons:', e);
                parsedButtons = [];
            }
        }

        // Create banner with optional title/subtitle
        const bannerData = {
            title: title ? title.trim() : '', // Optional
            subtitle: subtitle ? subtitle.trim() : '', // Optional
            image: imageResult.secure_url,
            imagePublicId: imageResult.public_id,
            buttons: parsedButtons,
            buttonPosition: buttonPosition, // NEW: Store button position
            isActive: isActive === 'true',
            order: parseInt(order) || 0,
            duration: parseInt(duration) || 5
        };

        const banner = await Banner.create(bannerData);

        return NextResponse.json({
            success: true,
            message: 'Banner created successfully',
            data: banner
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating banner:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to create banner'
            },
            { status: 500 }
        );
    }
}