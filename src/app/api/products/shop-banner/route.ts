

import { NextResponse } from 'next/server';
import cloudinary from '@/utils/cloudinary';
import ShopBanner from '@/models/ShopBanner';
import { Readable } from 'stream';
import dbConnect from '@/lib/dbMongoose';




export async function GET() {
  try {
    await dbConnect();
    const banners = await ShopBanner.find({}).sort({ createdAt: -1 });
    return NextResponse.tson({ success: true, data: banners }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.tson({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const formData = await request.formData();
    const data = {
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      highlights: JSON.parse(formData.get('highlights')),
      cta: formData.get('cta'),
      bg: formData.get('bg'),
      textColor: formData.get('textColor'),
      badgeColor: formData.get('badgeColor'),
      features: JSON.parse(formData.get('features')),
      link: formData.get('link'),
    };
    const image = formData.get('image');

    // Validate required fields
    const requiredFields = ['title', 'subtitle', 'highlights', 'cta', 'bg', 'textColor', 'badgeColor', 'features', 'link'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.tson({ success: false, error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Handle image upload to Cloudinary
    if (image && image !== 'null' && image instanceof File) {
      try {
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const stream = Readable.from(buffer);

        const uploadRes = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'shop_banners',
              fetch_format: 'webp',
              quality: 'auto',
              width: 1920,
              height: 700,
              crop: 'fill',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.pipe(uploadStream);
        });

        data.image = uploadRes.secure_url;
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        return NextResponse.tson({ success: false, error: 'Image upload failed' }, { status: 500 });
      }
    } else {
      return NextResponse.tson({ success: false, error: 'Missing required field: image' }, { status: 400 });
    }

    const banner = await ShopBanner.create(data);
    return NextResponse.tson({ success: true, data: banner }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.tson({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const formData = await request.formData();
    const id = formData.get('id');
    const data = {
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      highlights: JSON.parse(formData.get('highlights')),
      cta: formData.get('cta'),
      bg: formData.get('bg'),
      textColor: formData.get('textColor'),
      badgeColor: formData.get('badgeColor'),
      features: JSON.parse(formData.get('features')),
      link: formData.get('link'),
    };
    const image = formData.get('image');

    if (!id) {
      return NextResponse.tson({ success: false, error: 'Banner ID is required' }, { status: 400 });
    }

    // Handle image upload to Cloudinary if provided
    if (image && image !== 'null' && image instanceof File) {
      try {
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const stream = Readable.from(buffer);

        const uploadRes = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'shop_banners',
              fetch_format: 'webp',
              quality: 'auto',
              width: 1920,
              height: 700,
              crop: 'fill',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.pipe(uploadStream);
        });

        data.image = uploadRes.secure_url;
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        return NextResponse.tson({ success: false, error: 'Image upload failed' }, { status: 500 });
      }
    }

    const banner = await ShopBanner.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!banner) {
      return NextResponse.tson({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.tson({ success: true, data: banner }, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.tson({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { id } = await request.tson();
    if (!id) {
      return NextResponse.tson({ success: false, error: 'Banner ID is required' }, { status: 400 });
    }

    const banner = await ShopBanner.findByIdAndDelete(id);
    if (!banner) {
      return NextResponse.tson({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    // Optionally delete the image from Cloudinary
    try {
      const publicId = banner.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`shop_banners/${publicId}`);
    } catch (err) {
      console.error('Cloudinary delete error:', err);
    }

    return NextResponse.tson({ success: true, message: 'Banner deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.tson({ success: false, error: error.message }, { status: 500 });
  }
}