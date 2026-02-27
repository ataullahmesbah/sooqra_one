import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '@/src/utils/cloudinary';
import dbConnect from '@/src/lib/dbConnect';
import ShopBanner, { IShopBanner } from '@/src/models/ShopBanner';

// Response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface BannerFormData {
  title: string;
  subtitle: string;
  highlights: string[];
  cta: string;
  bg: string;
  textColor: string;
  badgeColor: string;
  features: Array<{ icon: string; text: string }>;
  link: string;
  image?: string;
  id?: string;
  folder?: string;
  width?: string;
  height?: string;
  crop?: string;
  format?: string;
  quality?: string;
}

// Helper type for safe assignment
type BannerFormField = keyof BannerFormData;
type StringFields = 'title' | 'subtitle' | 'cta' | 'bg' | 'textColor' | 'badgeColor' | 'link' | 'folder' | 'width' | 'height' | 'crop' | 'format' | 'quality' | 'id' | 'image';
type ArrayFields = 'highlights' | 'features';


export async function GET(): Promise<NextResponse<ApiResponse<IShopBanner[]>>> {
  try {
    await dbConnect();
    const banners = await ShopBanner.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: banners
    }, {
      status: 200
    });
  } catch (error) {
    console.error('GET error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch banners';

    return NextResponse.json({
      success: false,
      error: errorMessage
    }, {
      status: 500
    });
  }
}


export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const formData = await request.formData();

    const bannerData: Partial<IShopBanner> = {};

    // Helper: শুধু meaningful (non-empty) value add করো
    const addIfMeaningful = (key: keyof IShopBanner, value: any) => {
      if (value == null) return; // null/undefined skip

      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length > 0) {
          bannerData[key] = trimmed;
        }
        // খালি string ('') → skip
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          // array-এর ক্ষেত্রে valid item চেক (highlights/features-এর জন্য)
          if (key === 'highlights') {
            const valid = value.filter((item: string) => typeof item === 'string' && item.trim().length > 0);
            if (valid.length > 0) bannerData.highlights = valid.map(s => s.trim());
          } else if (key === 'features') {
            const valid = value.filter((f: any) =>
              (f?.icon?.trim?.()?.length > 0) || (f?.text?.trim?.()?.length > 0)
            );
            if (valid.length > 0) bannerData.features = valid;
          } else {
            bannerData[key] = value;
          }
        }
        // empty array [] → skip
      }
      // অন্য টাইপ skip বা handle করো যদি দরকার
    };

    // সব string field চেক
    addIfMeaningful('title', formData.get('title'));
    addIfMeaningful('subtitle', formData.get('subtitle'));
    addIfMeaningful('cta', formData.get('cta'));
    addIfMeaningful('link', formData.get('link'));
    addIfMeaningful('bg', formData.get('bg'));
    addIfMeaningful('textColor', formData.get('textColor'));
    addIfMeaningful('badgeColor', formData.get('badgeColor'));

    // Highlights (frontend থেকে JSON string আসে)
    const highlightsStr = formData.get('highlights');
    if (typeof highlightsStr === 'string' && highlightsStr.trim().length > 0) {
      try {
        const parsed = JSON.parse(highlightsStr);
        addIfMeaningful('highlights', parsed);
      } catch (e) {
        console.warn('Invalid highlights JSON:', e);
      }
    }

    // Features
    const featuresStr = formData.get('features');
    if (typeof featuresStr === 'string' && featuresStr.trim().length > 0) {
      try {
        const parsed = JSON.parse(featuresStr);
        addIfMeaningful('features', parsed);
      } catch (e) {
        console.warn('Invalid features JSON:', e);
      }
    }

    // Image – required
    const imageFile = formData.get('image') as File | null;
    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { success: false, error: 'Image is required' },
        { status: 400 }
      );
    }

    // Cloudinary upload
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadToCloudinary(buffer, {
      folder: 'shop_banners',
      // অন্য options যোগ করতে পারো
    });

    if (!uploadResult.success || !uploadResult.secure_url) {
      return NextResponse.json(
        { success: false, error: 'Image upload failed' },
        { status: 500 }
      );
    }

    bannerData.image = uploadResult.secure_url;

    // Create document – এখন শুধু যা দিয়েছে তাই থাকবে
    const banner = await ShopBanner.create(bannerData);

    return NextResponse.json({
      success: true,
      data: banner,
      message: 'Banner created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create banner'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse<IShopBanner>>> {
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

    // Check if banner exists
    const existingBanner = await ShopBanner.findById(id);
    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {};

    // String fields - only add if they exist and are not empty
    const title = formData.get('title');
    if (title !== null && title !== '') updateData.title = title;

    const subtitle = formData.get('subtitle');
    if (subtitle !== null && subtitle !== '') updateData.subtitle = subtitle;

    const cta = formData.get('cta');
    if (cta !== null && cta !== '') updateData.cta = cta;

    const link = formData.get('link');
    if (link !== null && link !== '') updateData.link = link;

    const bg = formData.get('bg');
    if (bg !== null && bg !== '') updateData.bg = bg;

    const textColor = formData.get('textColor');
    if (textColor !== null && textColor !== '') updateData.textColor = textColor;

    const badgeColor = formData.get('badgeColor');
    if (badgeColor !== null && badgeColor !== '') updateData.badgeColor = badgeColor;

    // JSON fields
    const highlights = formData.get('highlights');
    if (highlights && highlights !== '') {
      try {
        updateData.highlights = JSON.parse(highlights as string);
      } catch (error) {
        console.error('Error parsing highlights:', error);
      }
    }

    const features = formData.get('features');
    if (features && features !== '') {
      try {
        updateData.features = JSON.parse(features as string);
      } catch (error) {
        console.error('Error parsing features:', error);
      }
    }

    // Handle Cloudinary options for update
    const cloudinaryOptions: any = {};

    const folder = formData.get('folder') as string;
    const width = formData.get('width') as string;
    const height = formData.get('height') as string;
    const crop = formData.get('crop') as string;
    const format = formData.get('format') as string;
    const quality = formData.get('quality') as string;

    if (folder) cloudinaryOptions.folder = folder;
    if (width && !isNaN(parseInt(width))) cloudinaryOptions.width = parseInt(width);
    if (height && !isNaN(parseInt(height))) cloudinaryOptions.height = parseInt(height);
    if (crop) cloudinaryOptions.crop = crop;
    if (format) cloudinaryOptions.format = format;
    if (quality) cloudinaryOptions.quality = quality;

    // Handle image update if provided
    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      // Delete old image from Cloudinary
      const publicId = extractPublicId(existingBanner.image);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }

      // Upload new image with options
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await uploadToCloudinary(buffer, cloudinaryOptions);

      if (!uploadResult.success || !uploadResult.secure_url) {
        return NextResponse.json(
          { success: false, error: uploadResult.error || 'Image upload failed' },
          { status: 500 }
        );
      }

      updateData.image = uploadResult.secure_url;
    }

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        data: existingBanner,
        message: 'No fields to update'
      });
    }

    // Update banner
    const banner = await ShopBanner.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Failed to update banner' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: banner,
      message: 'Banner updated successfully'
    }, {
      status: 200
    });

  } catch (error) {
    console.error('PUT error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update banner';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await dbConnect();

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    // Find banner before deleting
    const banner = await ShopBanner.findById(id);
    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary
    const publicId = extractPublicId(banner.image);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    // Delete from database
    await ShopBanner.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully'
    }, {
      status: 200
    });

  } catch (error) {
    console.error('DELETE error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete banner';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper API for multiple upload types
export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const formData = await request.formData();

    const imageFile = formData.get('image') as File;
    const folder = formData.get('folder') as string || 'general';
    const width = formData.get('width') as string;
    const height = formData.get('height') as string;
    const crop = formData.get('crop') as string || 'fill';

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Cloudinary options
    const cloudinaryOptions: any = {
      folder,
      crop,
      format: 'webp',
      quality: 'auto'
    };

    if (width && !isNaN(parseInt(width))) cloudinaryOptions.width = parseInt(width);
    if (height && !isNaN(parseInt(height))) cloudinaryOptions.height = parseInt(height);

    // Upload to Cloudinary
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadToCloudinary(buffer, cloudinaryOptions);

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      }
    }, {
      status: 200
    });

  } catch (error) {
    console.error('PATCH error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}