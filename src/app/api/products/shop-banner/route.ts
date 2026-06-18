// src/app/api/products/shop-banner/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '@/src/utils/cloudinary';
import dbConnect from '@/src/lib/dbConnect';
import ShopBanner, { IShopBanner } from '@/src/models/ShopBanner';

// ─── GET — frontend + admin both use this ────────────────────────────────────
export async function GET(): Promise<NextResponse> {
  try {
    await dbConnect();
    const banners = await ShopBanner.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: banners }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// ─── POST — create new banner ─────────────────────────────────────────────────
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const formData = await request.formData();

    // Image required
    const imageFile = formData.get('image') as File | null;
    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { success: false, error: 'Image is required' },
        { status: 400 }
      );
    }

    // Cloudinary upload — 1920×600
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: 'shop_banners',
      width: 1920,
      height: 600,
      crop: 'limit',   // resize only, no crop — keeps full image
      format: 'webp',
      quality: 'auto',
    });

    if (!uploadResult.success || !uploadResult.secure_url) {
      return NextResponse.json(
        { success: false, error: 'Image upload failed' },
        { status: 500 }
      );
    }

    // Build banner data — all text fields optional
    const getString = (key: string) => {
      const val = formData.get(key);
      return typeof val === 'string' && val.trim() ? val.trim() : undefined;
    };

    const bannerData: Partial<IShopBanner> = {
      image: uploadResult.secure_url,
      isActive: formData.get('isActive') !== 'false',
      textPosition: (formData.get('textPosition') as 'left' | 'center') || 'left',
    };

    const title = getString('title');
    const subtitle = getString('subtitle');
    const offer = getString('offer');
    const ctaText = getString('ctaText');
    const ctaLink = getString('ctaLink');

    if (title) bannerData.title = title;
    if (subtitle) bannerData.subtitle = subtitle;
    if (offer) bannerData.offer = offer;
    if (ctaText) bannerData.ctaText = ctaText;
    if (ctaLink) bannerData.ctaLink = ctaLink;

    const banner = await ShopBanner.create(bannerData);
    return NextResponse.json(
      { success: true, data: banner, message: 'Banner created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create banner' },
      { status: 500 }
    );
  }
}

// ─── PUT — update existing banner ────────────────────────────────────────────
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const formData = await request.formData();

    const id = formData.get('id') as string;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const existing = await ShopBanner.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    const updateData: Partial<IShopBanner> = {};

    const getString = (key: string) => {
      const val = formData.get(key);
      return typeof val === 'string' ? val.trim() : null;
    };

    // Text fields — empty string clears the field
    const title = getString('title');
    const subtitle = getString('subtitle');
    const offer = getString('offer');
    const ctaText = getString('ctaText');
    const ctaLink = getString('ctaLink');
    const textPosition = getString('textPosition');
    const isActiveStr = formData.get('isActive');

    if (title !== null) updateData.title = title;
    if (subtitle !== null) updateData.subtitle = subtitle;
    if (offer !== null) updateData.offer = offer;
    if (ctaText !== null) updateData.ctaText = ctaText;
    if (ctaLink !== null) updateData.ctaLink = ctaLink;
    if (textPosition === 'left' || textPosition === 'center')
      updateData.textPosition = textPosition;
    if (isActiveStr !== null)
      updateData.isActive = isActiveStr !== 'false';

    // Image update (optional)
    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      // Delete old image
      const publicId = extractPublicId(existing.image);
      if (publicId) await deleteFromCloudinary(publicId);

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadResult = await uploadToCloudinary(buffer, {
        folder: 'shop_banners',
        width: 1920,
        height: 600,
        crop: 'limit',
        format: 'webp',
        quality: 'auto',
      });

      if (!uploadResult.success || !uploadResult.secure_url) {
        return NextResponse.json(
          { success: false, error: 'Image upload failed' },
          { status: 500 }
        );
      }
      updateData.image = uploadResult.secure_url;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: true, data: existing, message: 'No changes to update' }
      );
    }

    const updated = await ShopBanner.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { success: true, data: updated, message: 'Banner updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const banner = await ShopBanner.findById(id);
    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    const publicId = extractPublicId(banner.image);
    if (publicId) await deleteFromCloudinary(publicId);

    await ShopBanner.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'Banner deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete banner' },
      { status: 500 }
    );
  }
}