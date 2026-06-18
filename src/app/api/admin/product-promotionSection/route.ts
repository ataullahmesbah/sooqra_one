import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import ProductPromotion from '@/src/models/ProductPromotion';
import cloudinary from '@/src/utils/cloudinary';

// GET - Fetch hero section for admin
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (token?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const hero = await ProductPromotion.findOne();

        return NextResponse.json({
            success: true,
            data: hero || null
        });

    } catch (error: any) {
        console.error('Error fetching hero section:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// POST - Create or update hero section
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (token?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 401 });
        }

        const formData = await request.formData();
        const imageFile = formData.get('image') as File | null;
        const existingImageUrl = formData.get('existingImageUrl') as string | null;
        const existingPublicId = formData.get('existingPublicId') as string | null;
        const linkUrl = formData.get('linkUrl') as string || '';
        const linkActive = formData.get('linkActive') === 'true';
        const imageAlt = formData.get('imageAlt') as string || 'Hero Banner - Sooqra One';
        const isActive = formData.get('isActive') === 'true';

        let imageUrl = existingImageUrl || '';
        let publicId = existingPublicId || '';

        // Upload new image if provided
        if (imageFile && imageFile.size > 0) {
            // Delete old image from cloudinary if exists
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }

            // Convert file to buffer
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Upload to cloudinary with specific dimensions

            const uploadResult = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'hero-section',
                        // ✅ crop 'fill' বাদ দাও — aspect ratio নষ্ট করে
                        // শুধু max width দাও, height auto হবে
                        width: 1920,
                        crop: 'limit',        // ✅ fill নয়, limit — শুধু resize, crop নয়
                        quality: 'auto',
                        format: 'webp',
                        fetch_format: 'auto',
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });

            imageUrl = uploadResult.secure_url;
            publicId = uploadResult.public_id;
        }

        // Validate image exists
        if (!imageUrl) {
            return NextResponse.json(
                { error: 'Image is required' },
                { status: 400 }
            );
        }

        // Update or create hero section
        const heroData = {
            image: {
                url: imageUrl,
                publicId: publicId,
                alt: imageAlt
            },
            link: {
                url: linkUrl,
                isActive: linkActive
            },
            isActive: isActive,
            updatedBy: token.email || token.name
        };

        const existingHero = await ProductPromotion.findOne();

        let hero;
        if (existingHero) {
            hero = await ProductPromotion.findByIdAndUpdate(
                existingHero._id,
                heroData,
                { new: true }
            );
        } else {
            hero = await ProductPromotion.create(heroData);
        }

        return NextResponse.json({
            success: true,
            message: 'Hero section saved successfully',
            data: hero
        });

    } catch (error: any) {
        console.error('Error saving hero section:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Delete hero section
export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();

        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (token?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 401 });
        }

        const hero = await ProductPromotion.findOne();

        if (hero && hero.image.publicId) {
            // Delete image from cloudinary
            await cloudinary.uploader.destroy(hero.image.publicId);
        }

        await ProductPromotion.deleteOne();

        return NextResponse.json({
            success: true,
            message: 'Hero section deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting hero section:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}