// File: app/api/admin/banners/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/src/lib/dbConnect';
import Banner from '@/src/models/Banner';
import { uploadBannerToCloudinary, uploadToCloudinary } from '@/src/utils/cloudinary';

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
        const buttonPosition = formData.get('buttonPosition') as string || 'center-bottom';
        const imageFile = formData.get('image') as File;

        // VALIDATION
        if (!imageFile) {
            return NextResponse.json(
                { success: false, error: 'Banner image is required' },
                { status: 400 }
            );
        }

        // Validate image file type
        if (!imageFile.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Validate image size (max 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'Image size must be less than 5MB' },
                { status: 400 }
            );
        }

        // Upload image to Cloudinary with banner-specific function
        let imageResult;
        try {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            imageResult = await uploadBannerToCloudinary(buffer, {
                // You can override options here if needed
                // width: 1920, // Don't set width/height - upload original
                // height: 600,
            });

            if (!imageResult.success) {
                throw new Error(imageResult.error || 'Upload failed');
            }
        } catch (uploadError) {
            console.error('Error uploading banner image:', uploadError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to upload banner image',
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

        // Create banner
        const bannerData = {
            title: title ? title.trim() : '',
            subtitle: subtitle ? subtitle.trim() : '',
            image: imageResult.secure_url,
            imagePublicId: imageResult.public_id,
            buttons: parsedButtons,
            buttonPosition: buttonPosition,
            isActive: isActive === 'true',
            order: parseInt(order) || 0,
            duration: parseInt(duration) || 5,
            // Store original dimensions (optional)
            originalWidth: 1920, // Default assumption
            originalHeight: 600, // Default assumption
            aspectRatio: 3.2 // 1920/600
        };

        const banner = await Banner.create(bannerData);

        return NextResponse.json({
            success: true,
            message: 'Banner created successfully',
            data: banner,
            recommendations: {
                optimalSize: '1920×600px (16:5 aspect ratio)',
                maxSize: '5MB',
                formats: 'JPG, PNG, WebP',
                notes: 'Image will be automatically optimized for all devices'
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating banner:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to create banner',
                recommendation: 'Use 1920×600px images for best results'
            },
            { status: 500 }
        );
    }
}