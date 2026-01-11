import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Validate environment variables
const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
    secure: true,
});


export interface UploadOptions {
    folder?: string;
    width?: number;
    height?: number;
    crop?: string;
    format?: string;
    quality?: string;
    transformation?: any[];
    [key: string]: any;
}

export interface UploadResult {
    success: boolean;
    secure_url?: string;
    public_id?: string;
    error?: string;
    responsive_breakpoints?: any[];
}

// BANNER SPECIFIC UPLOAD FUNCTION
export const uploadBannerToCloudinary = async (
    fileBuffer: Buffer,
    options: UploadOptions = {}
): Promise<UploadResult> => {
    try {
        // Default options for banners
        const bannerOptions: UploadOptions = {
            folder: 'sooqra/banners',
            format: 'webp',  // Best format for web
            quality: 'auto:best',
            crop: 'fill',
            gravity: 'auto',
            // Original size upload (no resize)
        };

        const uploadOptions = { ...bannerOptions, ...options };

        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result as UploadApiResponse);
                }
            );
            uploadStream.end(fileBuffer);
        });

        // Create responsive variants
        await createResponsiveVariants(result.public_id);

        return {
            success: true,
            secure_url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary banner upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Banner upload failed'
        };
    }
};

// CREATE RESPONSIVE VARIANTS
const createResponsiveVariants = async (publicId: string): Promise<void> => {
    const variants = [
        { width: 1920, height: 600, name: 'desktop' },
        { width: 1280, height: 400, name: 'laptop' },
        { width: 1024, height: 320, name: 'tablet' },
        { width: 768, height: 240, name: 'mobile_large' },
        { width: 375, height: 200, name: 'mobile' },
    ];

    try {
        for (const variant of variants) {
            const url = cloudinary.url(publicId, {
                transformation: [
                    { width: variant.width, height: variant.height, crop: 'fill' },
                    { quality: 'auto' },
                    { format: 'webp' }
                ]
            });
            // Just generate the URL, Cloudinary will create on-demand
            console.log(`Generated variant ${variant.name}: ${url}`);
        }
    } catch (error) {
        console.error('Error creating responsive variants:', error);
    }
};

// GENERAL UPLOAD FUNCTION (for other images)
export const uploadToCloudinary = async (
    fileBuffer: Buffer,
    options: UploadOptions = {}
): Promise<UploadResult> => {
    try {
        const defaultOptions: UploadOptions = {
            folder: 'sooqra/general',
            format: 'webp',
            quality: 'auto:good',
        };

        const uploadOptions = { ...defaultOptions, ...options };

        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result as UploadApiResponse);
                }
            );
            uploadStream.end(fileBuffer);
        });

        return {
            success: true,
            secure_url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed'
        };
    }
};

// DELETE FUNCTION
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return false;
    }
};

// GET RESPONSIVE IMAGE URL
export const getResponsiveBannerUrl = (publicId: string, options: {
    width?: number;
    height?: number;
    device?: 'desktop' | 'tablet' | 'mobile';
} = {}): string => {
    const { device } = options;

    let width = 1920;
    let height = 600;

    // Set dimensions based on device
    if (device === 'desktop') {
        width = 1920;
        height = 600;
    } else if (device === 'tablet') {
        width = 1024;
        height = 320;
    } else if (device === 'mobile') {
        width = 375;
        height = 200;
    } else {
        // Auto responsive (let browser decide)
        return cloudinary.url(publicId, {
            transformation: [
                { width: 1920, height: 600, crop: 'fill' },
                { quality: 'auto' },
                { format: 'webp' }
            ]
        });
    }

    return cloudinary.url(publicId, {
        transformation: [
            { width, height, crop: 'fill' },
            { quality: 'auto' },
            { format: 'webp' }
        ]
    });
};



// Helper function to extract public ID from URL
export const extractPublicId = (imageUrl: string): string | null => {
    try {
        // Extract public ID from Cloudinary URL
        // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');

        if (uploadIndex !== -1) {
            // Get everything after 'upload' excluding version
            const afterUpload = urlParts.slice(uploadIndex + 2).join('/');
            // Remove file extension
            return afterUpload.split('.')[0];
        }

        return null;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

export default cloudinary;