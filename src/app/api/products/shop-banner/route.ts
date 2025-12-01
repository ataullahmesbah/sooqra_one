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
  image?: File;
  id?: string;
  // New fields for Cloudinary options
  folder?: string;
  width?: string;
  height?: string;
  crop?: string;
  format?: string;
  quality?: string;
}

// Helper type for safe assignment
type BannerFormField = keyof BannerFormData;
type StringFields = 'title' | 'subtitle' | 'cta' | 'bg' | 'textColor' | 'badgeColor' | 'link' | 'folder' | 'width' | 'height' | 'crop' | 'format' | 'quality' | 'id';
type ArrayFields = 'highlights' | 'features';
type FileFields = 'image';

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

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<IShopBanner>>> {
  try {
    await dbConnect();
    const formData = await request.formData();

    // Validate required fields
    const requiredFields: BannerFormField[] = [
      'title', 'subtitle', 'highlights', 'cta', 'bg',
      'textColor', 'badgeColor', 'features', 'link'
    ];

    const formDataObj: Partial<BannerFormData> = {};

    for (const field of requiredFields) {
      const value = formData.get(field);
      if (!value) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }

      if (field === 'highlights' || field === 'features') {
        try {
          if (field === 'highlights') {
            formDataObj.highlights = JSON.parse(value as string);
          } else if (field === 'features') {
            formDataObj.features = JSON.parse(value as string);
          }
        } catch {
          return NextResponse.json(
            { success: false, error: `Invalid JSON format for ${field}` },
            { status: 400 }
          );
        }
      } else {
        // Type-safe assignment for string fields
        const stringField = field as StringFields;
        formDataObj[stringField] = value as string;
      }
    }

    // Handle Cloudinary options
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

    // Default folder if not provided
    if (!cloudinaryOptions.folder) {
      cloudinaryOptions.folder = 'shop_banners';
    }

    // Handle image upload
    const imageFile = formData.get('image') as File | null;
    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { success: false, error: 'Image is required' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary with dynamic options
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadToCloudinary(buffer, cloudinaryOptions);

    if (!uploadResult.success || !uploadResult.secure_url) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Image upload failed' },
        { status: 500 }
      );
    }

    // Type-safe banner data creation
    const bannerData: Omit<BannerFormData, 'image' | 'id' | 'folder' | 'width' | 'height' | 'crop' | 'format' | 'quality'> = {
      title: formDataObj.title!,
      subtitle: formDataObj.subtitle!,
      highlights: formDataObj.highlights!,
      cta: formDataObj.cta!,
      bg: formDataObj.bg!,
      textColor: formDataObj.textColor!,
      badgeColor: formDataObj.badgeColor!,
      features: formDataObj.features!,
      link: formDataObj.link!,
    };

    const banner = await ShopBanner.create({
      ...bannerData,
      image: uploadResult.secure_url
    });

    return NextResponse.json({
      success: true,
      data: banner,
      message: 'Banner created successfully'
    }, {
      status: 201
    });

  } catch (error) {
    console.error('POST error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create banner';

    return NextResponse.json(
      { success: false, error: errorMessage },
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

    // Prepare update data
    const updateData: Partial<BannerFormData> = {};

    const fields: BannerFormField[] = [
      'title', 'subtitle', 'highlights', 'cta', 'bg',
      'textColor', 'badgeColor', 'features', 'link'
    ];

    for (const field of fields) {
      const value = formData.get(field);
      if (value !== null && value !== undefined && value !== '') {
        if (field === 'highlights' || field === 'features') {
          try {
            if (field === 'highlights') {
              updateData.highlights = JSON.parse(value as string);
            } else if (field === 'features') {
              updateData.features = JSON.parse(value as string);
            }
          } catch {
            return NextResponse.json(
              { success: false, error: `Invalid JSON format for ${field}` },
              { status: 400 }
            );
          }
        } else {
          // Type-safe assignment for string fields
          const stringField = field as StringFields;
          updateData[stringField] = value as string;
        }
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

    // Remove undefined values before update
    const cleanUpdateData: Record<string, any> = {};
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanUpdateData[key] = value;
      }
    });

    // Update banner
    const banner = await ShopBanner.findByIdAndUpdate(
      id,
      cleanUpdateData,
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