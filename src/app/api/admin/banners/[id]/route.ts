// File: app/api/admin/banners/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/src/lib/dbConnect';
import Banner from '@/src/models/Banner';
import { deleteFromCloudinary, uploadToCloudinary } from '@/src/utils/cloudinary';

interface BannerButton {
    text: string;
    link: string;
    type: string;
}

// GET single banner
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // Await the params Promise
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid banner ID' },
                { status: 400 }
            );
        }

        const banner = await Banner.findById(id);

        if (!banner) {
            return NextResponse.json(
                { success: false, error: 'Banner not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: banner
        });
    } catch (error: any) {
        console.error('Error fetching banner:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch banner',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// UPDATE banner
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // Await the params Promise
        const { id } = await params;



        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid banner ID',
                    receivedId: id
                },
                { status: 400 }
            );
        }

        const formData = await request.formData();

        // Find current banner
        const currentBanner = await Banner.findById(id);
        if (!currentBanner) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Banner not found',
                    bannerId: id
                },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: any = {
            title: formData.get('title') as string || currentBanner.title,
            subtitle: formData.get('subtitle') as string || currentBanner.subtitle || '',
            isActive: formData.get('isActive') ?
                formData.get('isActive') === 'true' : currentBanner.isActive,
        };

        // Handle numeric fields
        const duration = formData.get('duration');
        const order = formData.get('order');

        if (duration) {
            updateData.duration = parseInt(duration as string);
        } else {
            updateData.duration = currentBanner.duration;
        }

        if (order) {
            updateData.order = parseInt(order as string);
        } else {
            updateData.order = currentBanner.order;
        }

        // Parse buttons if provided
        const buttons = formData.get('buttons') as string;
        if (buttons && buttons.trim()) {
            try {
                updateData.buttons = JSON.parse(buttons);
            } catch (e) {
                console.error('Error parsing buttons:', e);
                // Keep existing buttons if parsing fails
            }
        } else {
            updateData.buttons = currentBanner.buttons;
        }

        // Handle new image upload
        const imageFile = formData.get('image') as File;
        if (imageFile && imageFile.size > 0) {
            try {
                // Delete old image from Cloudinary
                if (currentBanner.imagePublicId) {
                    await deleteFromCloudinary(currentBanner.imagePublicId);
                }

                // Upload new image
                const bytes = await imageFile.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const imageResult = await uploadToCloudinary(buffer, {
                    folder: 'sooqra/banners',
                    width: 1920,
                    height: 600,
                    crop: 'fill',
                    format: 'webp',
                    quality: 'auto:good',
                });

                updateData.image = imageResult.secure_url;
                updateData.imagePublicId = imageResult.public_id;
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
        }



        // Update banner
        const updatedBanner = await Banner.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedBanner) {
            return NextResponse.json(
                { success: false, error: 'Failed to update banner' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Banner updated successfully',
            data: updatedBanner
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating banner:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to update banner',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

// DELETE banner
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // Await the params Promise
        const { id } = await params;



        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid banner ID' },
                { status: 400 }
            );
        }

        const banner = await Banner.findById(id);
        if (!banner) {
            return NextResponse.json(
                { success: false, error: 'Banner not found' },
                { status: 404 }
            );
        }

        // Delete image from Cloudinary
        if (banner.imagePublicId) {
            try {
                await deleteFromCloudinary(banner.imagePublicId);
            } catch (deleteError) {
                console.error('Error deleting from Cloudinary:', deleteError);
                // Continue with database deletion even if Cloudinary fails
            }
        }

        // Delete from database
        await Banner.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Banner deleted successfully'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error deleting banner:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete banner' },
            { status: 500 }
        );
    }
}