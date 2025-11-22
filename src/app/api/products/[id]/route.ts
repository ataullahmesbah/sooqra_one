

//app/api/products/[id]/route.ts


import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import cloudinary from '@/src/utils/cloudinary';
import Category from '@/src/models/Category';
import Product from '@/src/models/Products';
import dbConnect from '@/src/lib/dbConnect';
import { authOptions } from '../../auth/[...nextauth]/route';


// Interface definitions
interface Size {
    name: string;
    quantity: number;
}

interface AdditionalImage {
    url: string;
    alt: string;
}

interface FAQ {
    question: string;
    answer: string;
}

interface Specification {
    name: string;
    value: string;
}

interface AggregateRating {
    ratingValue: number;
    reviewCount: number;
}

interface Price {
    currency: string;
    amount: number;
    exchangeRate?: number;
}

// Sort function for additional images by lastModified date
const ascendingSort = (a: File, b: File): number => {
    return b.lastModified - a.lastModified;
};

interface Params {
    id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
    await dbConnect();
    try {
        const productId = params.id;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return Response.json({ error: 'Invalid product ID' }, { status: 400 });
        }

        const product = await Product.findById(productId).populate('category').lean();
        if (!product) {
            return Response.json({ error: 'Product not found' }, { status: 404 });
        }

        // Type assertion for the product object
        const productData = product as any;

        if (productData.sizeRequirement === 'Mandatory' && productData.sizes?.length > 0) {
            productData.sizes = productData.sizes.filter((size: Size) => size.quantity > 0);
        }

        return Response.json(productData, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching product:', error);
        return Response.json({ error: `Failed to fetch product: ${error.message}` }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const productId = params.id;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return Response.json({ error: 'Invalid product ID' }, { status: 400 });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return Response.json({ error: 'Product not found' }, { status: 404 });
        }

        // Delete images from Cloudinary
        if (product.mainImage) {
            const publicId = product.mainImage.split('/').pop()?.split('.')[0];
            if (publicId) {
                await cloudinary.uploader.destroy(`products/${publicId}`);
            }
        }

        for (const img of product.additionalImages) {
            const publicId = img.url.split('/').pop()?.split('.')[0];
            if (publicId) {
                await cloudinary.uploader.destroy(`products/additional/${publicId}`);
            }
        }

        await Product.findByIdAndDelete(productId);
        return Response.json({ message: 'Product deleted' }, { status: 200 });
    } catch (error: any) {
        return Response.json({ error: `Failed to delete product: ${error.message}` }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Params }) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.name) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const productId = params.id;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return Response.json({ error: 'Invalid product ID' }, { status: 400 });
        }

        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return Response.json({ error: 'Product not found' }, { status: 404 });
        }

        const formData = await request.formData();
        console.log('Received formData keys:', [...formData.keys()]);

        // Extract form data with proper type handling
        const title = formData.get('title') as string;
        const bdtPrice = parseFloat(formData.get('bdtPrice') as string);
        const usdPrice = formData.get('usdPrice') ? parseFloat(formData.get('usdPrice') as string) : null;
        const eurPrice = formData.get('eurPrice') ? parseFloat(formData.get('eurPrice') as string) : null;
        const usdExchangeRate = formData.get('usdExchangeRate') ? parseFloat(formData.get('usdExchangeRate') as string) : null;
        const eurExchangeRate = formData.get('eurExchangeRate') ? parseFloat(formData.get('eurExchangeRate') as string) : null;
        const description = formData.get('description') as string;
        const shortDescription = formData.get('shortDescription') as string;
        const product_code = formData.get('product_code') as string;
        const descriptions = (formData.get('descriptions') as string)?.split('|||')?.filter((desc: string) => desc.trim()) || [];
        const bulletPoints = (formData.get('bulletPoints') as string)?.split(',').map((point: string) => point.trim()).filter(Boolean) || [];
        const productType = formData.get('productType') as string;
        const affiliateLink = productType === 'Affiliate' ? (formData.get('affiliateLink') as string) || null : null;
        const categoryId = formData.get('category') as string;
        const newCategory = formData.get('newCategory') as string;
        const mainImage = formData.get('mainImage') as File;
        const mainImageAlt = formData.get('mainImageAlt') as string;
        const existingMainImage = formData.get('existingMainImage') as string;
        const additionalImages = formData.getAll('additionalImages').filter((img) => img instanceof File && img.size > 0) as File[];
        const additionalAlts = formData.getAll('additionalAlts') as string[] || [];
        const existingAdditionalImages = formData.get('existingAdditionalImages')
            ? JSON.parse(formData.get('existingAdditionalImages') as string) as AdditionalImage[]
            : [];
        const brand = formData.get('brand') as string;
        const availability = formData.get('availability') as string;
        const metaTitle = formData.get('metaTitle') as string;
        const metaDescription = formData.get('metaDescription') as string;
        const keywords = (formData.get('keywords') as string)?.split(',').map((kw: string) => kw.trim()).filter(Boolean) || [];
        const isGlobal = formData.get('isGlobal') === 'true';
        const targetCountry = (formData.get('targetCountry') as string)?.trim().replace(/[^a-zA-Z\s-]/g, '') || '';
        const targetCity = (formData.get('targetCity') as string)?.trim().replace(/[^a-zA-Z\s-]/g, '') || '';
        const quantityRaw = formData.get('quantity') as string;
        const quantity = parseInt(quantityRaw, 10);
        const sizeRequirement = (formData.get('sizeRequirement') as string) || 'Optional';

        let sizes: Size[] = [];
        const sizesInput = formData.get('sizes') as string;
        if (sizesInput) {
            try {
                sizes = JSON.parse(sizesInput).filter((size: Size) => size.name.trim() && size.quantity >= 0);
            } catch {
                return Response.json({ error: 'Invalid sizes format' }, { status: 400 });
            }
        }

        let faqs: FAQ[] = [];
        const faqsInput = formData.get('faqs') as string;
        if (faqsInput) {
            try {
                faqs = JSON.parse(faqsInput);
            } catch {
                return Response.json({ error: 'Invalid FAQs format' }, { status: 400 });
            }
        }

        let specifications: Specification[] = [];
        const specificationsInput = formData.get('specifications') as string;
        if (specificationsInput) {
            try {
                specifications = JSON.parse(specificationsInput);
            } catch {
                return Response.json({ error: 'Invalid specifications format' }, { status: 400 });
            }
        }

        const aggregateRating: AggregateRating = {
            ratingValue: parseFloat(formData.get('aggregateRating.ratingValue') as string) || 0,
            reviewCount: parseInt(formData.get('aggregateRating.reviewCount') as string) || 0,
        };

        // Validate required fields
        const requiredFields = ['title', 'bdtPrice', 'description', 'product_code', 'brand', 'metaTitle', 'metaDescription', 'mainImageAlt'];
        if (!isGlobal) {
            requiredFields.push('targetCountry', 'targetCity');
        }

        const missingFields = requiredFields.filter((field) => {
            const value = formData.get(field);
            return !value || value.toString().trim() === '';
        });

        const errors: Record<string, string> = {};

        if (missingFields.length > 0) {
            errors.missingFields = `Missing required fields: ${missingFields.join(', ')}`;
        }
        if (isNaN(bdtPrice) || bdtPrice <= 0) {
            errors.bdtPrice = 'BDT price must be a positive number';
        }
        if (usdPrice && (isNaN(usdPrice) || usdPrice <= 0)) {
            errors.usdPrice = 'USD price must be a positive number';
        }
        if (eurPrice && (isNaN(eurPrice) || eurPrice <= 0)) {
            errors.eurPrice = 'EUR price must be a positive number';
        }
        if (usdPrice && usdExchangeRate && (isNaN(usdExchangeRate) || usdExchangeRate <= 0)) {
            errors.usdExchangeRate = 'USD exchange rate must be a positive number';
        }
        if (eurPrice && eurExchangeRate && (isNaN(eurExchangeRate) || eurExchangeRate <= 0)) {
            errors.eurExchangeRate = 'EUR exchange rate must be a positive number';
        }
        if (!categoryId && !newCategory) {
            errors.category = 'Category or new category name is required';
        }
        if (!mainImage && !existingMainImage) {
            errors.mainImage = 'Main image is required';
        }
        if (isNaN(quantity) || quantity < 0) {
            errors.quantity = 'Quantity must be a non-negative integer';
        }
        if (productType === 'Affiliate' && !affiliateLink) {
            errors.affiliateLink = 'Affiliate link is required for affiliate products';
        }
        if (metaTitle && metaTitle.length > 60) {
            errors.metaTitle = 'Meta Title must be 60 characters or less';
        }
        if (metaDescription && metaDescription.length > 160) {
            errors.metaDescription = 'Meta Description must be 160 characters or less';
        }
        if (!isGlobal && !targetCountry.trim()) {
            errors.targetCountry = 'Target country is required when not global';
        }
        if (!isGlobal && !targetCity.trim()) {
            errors.targetCity = 'Target city is required when not global';
        }
        if (sizeRequirement === 'Mandatory' && sizes.length === 0) {
            errors.sizes = 'At least one size with quantity is required when size is Mandatory';
        }
        if (sizeRequirement === 'Mandatory' && sizes.reduce((sum, size) => sum + size.quantity, 0) !== quantity) {
            errors.sizes = 'Sum of size quantities must equal total quantity';
        }

        sizes.forEach((size, index) => {
            if (!size.name.trim()) {
                errors[`sizeName${index}`] = `Size name at index ${index} is required`;
            }
            if (isNaN(size.quantity) || size.quantity < 0) {
                errors[`sizeQuantity${index}`] = `Quantity for size ${size.name} must be a non-negative integer`;
            }
        });

        if (Object.keys(errors).length > 0) {
            return Response.json({ error: errors }, { status: 400 });
        }

        // Handle category
        let category;
        if (newCategory && newCategory.trim()) {
            const slug = newCategory
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            category = await Category.findOne({ slug });
            if (!category) {
                category = new Category({
                    name: newCategory.trim(),
                    slug,
                });
                await category.save();
            }
        } else {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return Response.json({ error: 'Invalid category ID' }, { status: 400 });
            }
            category = await Category.findById(categoryId);
            if (!category) {
                return Response.json({ error: 'Category not found' }, { status: 404 });
            }
        }

        // Handle main image
        let mainImageUrl = existingMainImage;
        if (mainImage && mainImage.size > 0) {
            if (!mainImage.type.startsWith('image/')) {
                return Response.json({ error: 'Main image must be an image file' }, { status: 400 });
            }
            if (mainImage.size > 5 * 1024 * 1024) {
                return Response.json({ error: 'Main image size must be less than 5MB' }, { status: 400 });
            }

            const mainImageArrayBuffer = await mainImage.arrayBuffer();
            const mainImageBuffer = Buffer.from(mainImageArrayBuffer);

            const mainImageResult = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'products',
                        format: 'webp',
                        width: 800,
                        height: 800,
                        crop: 'fill',
                        quality: 'auto',
                    },
                    (error, result) => (error ? reject(error) : resolve(result))
                ).end(mainImageBuffer);
            });

            mainImageUrl = mainImageResult.secure_url;

            // Delete old main image from Cloudinary if it exists
            if (existingProduct.mainImage) {
                const publicId = existingProduct.mainImage.split('/').pop()?.split('.')[0];
                if (publicId) {
                    await cloudinary.uploader.destroy(`products/${publicId}`);
                }
            }
        }

        // Handle additional images
        let additionalImageUrls: AdditionalImage[] = [...existingAdditionalImages];

        // Delete removed images from Cloudinary
        const deletedImages = existingProduct.additionalImages.filter(
            (img: AdditionalImage) => !existingAdditionalImages.some((existing: AdditionalImage) => existing.url === img.url)
        );

        for (const img of deletedImages) {
            const publicId = img.url.split('/').pop()?.split('.')[0];
            if (publicId) {
                await cloudinary.uploader.destroy(`products/additional/${publicId}`);
            }
        }

        // Upload new additional images
        for (const [index, image] of additionalImages.entries()) {
            if (!image.type.startsWith('image/')) {
                return Response.json({ error: `Additional image ${image.name} must be an image file` }, { status: 400 });
            }
            if (image.size > 5 * 1024 * 1024) {
                return Response.json({ error: `Additional image ${image.name} size must be less than 5MB` }, { status: 400 });
            }

            const arrayBuffer = await image.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResult = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'products/additional',
                        format: 'webp',
                        width: 800,
                        height: 800,
                        crop: 'fill',
                        quality: 'auto',
                    },
                    (error, result) => (error ? reject(error) : resolve(result))
                ).end(buffer);
            });

            additionalImageUrls.push({
                url: uploadResult.secure_url,
                alt: additionalAlts[index] || `Additional image ${index + 1} for ${title}`,
            });
        }

        // Prepare prices
        const prices: Price[] = [{ currency: 'BDT', amount: bdtPrice }];
        if (usdPrice) {
            prices.push({ currency: 'USD', amount: usdPrice, exchangeRate: usdExchangeRate || undefined });
        }
        if (eurPrice) {
            prices.push({ currency: 'EUR', amount: eurPrice, exchangeRate: eurExchangeRate || undefined });
        }

        // Generate slug
        let slug = title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        let slugCount = 0;
        let uniqueSlug = slug;

        const existingProductWithSlug = await Product.findOne({ slug, _id: { $ne: productId } });
        if (existingProductWithSlug) {
            slugCount++;
            uniqueSlug = `${slug}-${slugCount}`;
        }

        // Auto-generate schemaMarkup
        const schemaMarkup = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: title,
            image: mainImageUrl,
            description: description,
            brand: {
                '@type': 'Brand',
                name: brand,
            },
            offers: {
                '@type': 'Offer',
                priceCurrency: 'BDT',
                price: bdtPrice,
                availability: availability || 'https://schema.org/InStock',
                url: `${process.env.NEXTAUTH_URL}/shop/${uniqueSlug}`,
                itemOffered: {
                    '@type': 'Product',
                    areaServed: isGlobal ? 'Worldwide' : targetCountry,
                },
            },
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: aggregateRating.ratingValue,
                reviewCount: aggregateRating.reviewCount,
            },
        };

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                title,
                slug: uniqueSlug,
                prices,
                mainImage: mainImageUrl,
                mainImageAlt,
                additionalImages: additionalImageUrls,
                description,
                shortDescription,
                product_code,
                descriptions,
                bulletPoints,
                productType,
                affiliateLink,
                owner: session.user.name,
                brand,
                category: category._id,
                availability,
                metaTitle,
                metaDescription,
                keywords,
                faqs,
                specifications,
                aggregateRating,
                schemaMarkup,
                isGlobal,
                quantity,
                sizeRequirement,
                sizes: sizes.length > 0 ? sizes : existingProduct.sizes || [],
                targetCountry,
                targetCity,
            },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return Response.json({ error: 'Product not found' }, { status: 404 });
        }

        console.log('Updated product:', JSON.stringify(updatedProduct, null, 2));
        return Response.json({ message: 'Product updated', product: updatedProduct }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating product:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => err.message);
            return Response.json({ error: `Validation failed: ${errors.join(', ')}` }, { status: 400 });
        }
        if (error.message.includes('image')) {
            return Response.json({ error: error.message }, { status: 400 });
        }
        return Response.json({ error: `Failed to update product: ${error.message}` }, { status: 500 });
    }
}