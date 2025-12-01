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
    [key: string]: any;
}

export interface UploadResult {
    success: boolean;
    secure_url?: string;
    public_id?: string;
    error?: string;
}

export const uploadToCloudinary = async (
    fileBuffer: Buffer,
    options: UploadOptions = {}
): Promise<UploadResult> => {
    try {
        // Default options
        const defaultOptions: UploadOptions = {
            folder: 'general',
            format: 'webp',
            quality: 'auto',
            crop: 'fill',
            // No default width/height - let API decide
        };

        const uploadOptions = { ...defaultOptions, ...options };

        // If width or height is 0 or undefined, don't include them
        if (uploadOptions.width === 0 || uploadOptions.width === undefined) {
            delete uploadOptions.width;
        }
        if (uploadOptions.height === 0 || uploadOptions.height === undefined) {
            delete uploadOptions.height;
        }

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

export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return false;
    }
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