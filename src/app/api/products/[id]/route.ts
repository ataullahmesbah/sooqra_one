

//app/api/products/[id]/route.ts

import Product from '@/models/Products';
import { getServerSession } from 'next-auth/next';
import Category from '@/models/Category';
import slugify from 'slugify';
import { authOptions } from '../../auth/[...nextauth]/route';
import mongoose from 'mongoose';
import cloudinary from '@/utils/cloudinary';
import dbConnect from '@/lib/dbMongoose';



// Sort function for additional images by lastModified date
// Sort function for additional images by lastModified date
const ascendingSort = (a, b) => {
    if (a instanceof File && b instanceof File) {
        return b.lastModified - a.lastModified;
    }
    return 0;
};


export async function GET(request, { params }) {
    await dbConnect();
    try {
        const productId = params.id;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return Response.tson({ error: 'Invalid product ID' }, { status: 400 });
        }
        const product = await Product.findById(productId).populate('category').lean();
        if (!product) {
            return Response.tson({ error: 'Product not found' }, { status: 404 });
        }
        if (product.sizeRequirement === 'Mandatory' && product.sizes?.length > 0) {
            product.sizes = product.sizes.filter((size) => size.quantity > 0);
        }
        return Response.tson(product, { status: 200 });
    } catch (error) {
        console.error('Error fetching product:', error);
        return Response.tson({ error: `Failed to fetch product: ${error.message}` }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.tson({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const productId = params.id;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return Response.tson({ error: 'Invalid product ID' }, { status: 400 });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return Response.tson({ error: 'Product not found' }, { status: 404 });
        }

        // Delete images from Cloudinary
        if (product.mainImage) {
            const publicId = product.mainImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`products/${publicId}`);
        }
        for (const img of product.additionalImages) {
            const publicId = img.url.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`products/additional/${publicId}`);
        }

        await Product.findByIdAndDelete(productId);
        return Response.tson({ message: 'Product deleted' }, { status: 200 });
    } catch (error) {
        return Response.tson({ error: `Failed to delete product: ${error.message}` }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.name) {
        return Response.tson({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const productId = params.id;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return Response.tson({ error: 'Invalid product ID' }, { status: 400 });
        }

        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return Response.tson({ error: 'Product not found' }, { status: 404 });
        }

        const formData = await request.formData();
        console.log('Received formData keys:', [...formData.keys()]);

        // Extract form data
        const title = formData.get('title');
        const bdtPrice = parseFloat(formData.get('bdtPrice'));
        const usdPrice = formData.get('usdPrice') ? parseFloat(formData.get('usdPrice')) : null;
        const eurPrice = formData.get('eurPrice') ? parseFloat(formData.get('eurPrice')) : null;
        const usdExchangeRate = formData.get('usdExchangeRate') ? parseFloat(formData.get('usdExchangeRate')) : null;
        const eurExchangeRate = formData.get('eurExchangeRate') ? parseFloat(formData.get('eurExchangeRate')) : null;
        const description = formData.get('description');
        const shortDescription = formData.get('shortDescription');
        const product_code = formData.get('product_code');
        const descriptions = formData.get('descriptions')?.split('|||')?.filter((desc) => desc.trim()) || [];
        const bulletPoints = formData.get('bulletPoints')?.split(',').map((point) => point.trim()).filter(Boolean) || [];
        const productType = formData.get('productType');
        const affiliateLink = formData.get('productType') === 'Affiliate' ? formData.get('affiliateLink') || null : null;
        const categoryId = formData.get('category');
        const newCategory = formData.get('newCategory');
        const mainImage = formData.get('mainImage');
        const mainImageAlt = formData.get('mainImageAlt');
        const existingMainImage = formData.get('existingMainImage');
        const additionalImages = formData.getAll('additionalImages').filter((img) => img instanceof File && img.size > 0);
        additionalImages.sort(ascendingSort);
        const additionalAlts = formData.getAll('additionalAlts') || [];
        const existingAdditionalImages = formData.get('existingAdditionalImages')
            ? JSON.parse(formData.get('existingAdditionalImages'))
            : [];
        const brand = formData.get('brand');
        const availability = formData.get('availability');
        const metaTitle = formData.get('metaTitle');
        const metaDescription = formData.get('metaDescription');
        const keywords = formData.get('keywords')?.split(',').map((kw) => kw.trim()).filter(Boolean) || [];
        const isGlobal = formData.get('isGlobal') === 'true';
        const targetCountry = formData.get('targetCountry')?.trim().replace(/[^a-zA-Z\s-]/g, '') || '';
        const targetCity = formData.get('targetCity')?.trim().replace(/[^a-zA-Z\s-]/g, '') || '';
        const quantityRaw = formData.get('quantity');
        const quantity = parseInt(quantityRaw, 10);
        const sizeRequirement = formData.get('sizeRequirement') || 'Optional';
        let sizes = [];
        if (formData.get('sizes')) {
            try {
                sizes = JSON.parse(formData.get('sizes')).filter((size) => size.name.trim() && size.quantity >= 0);
            } catch {
                return Response.tson({ error: 'Invalid sizes format' }, { status: 400 });
            }
        }
        let faqs = [];
        if (formData.get('faqs')) {
            try {
                faqs = JSON.parse(formData.get('faqs'));
            } catch {
                return Response.tson({ error: 'Invalid FAQs format' }, { status: 400 });
            }
        }
        let specifications = [];
        if (formData.get('specifications')) {
            try {
                specifications = JSON.parse(formData.get('specifications'));
            } catch {
                return Response.tson({ error: 'Invalid specifications format' }, { status: 400 });
            }
        }
        const aggregateRating = {
            ratingValue: parseFloat(formData.get('aggregateRating.ratingValue')) || 0,
            reviewCount: parseInt(formData.get('aggregateRating.reviewCount')) || 0,
        };

        // Validate required fields
        const requiredFields = ['title', 'bdtPrice', 'description', 'product_code', 'brand', 'metaTitle', 'metaDescription', 'mainImageAlt'];
        if (!isGlobal) {
            requiredFields.push('targetCountry', 'targetCity');
        }
        const missingFields = requiredFields.filter((field) => !formData.get(field) && formData.get(field) !== '');
        const errors = {};
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
        if (metaTitle.length > 60) {
            errors.metaTitle = 'Meta Title must be 60 characters or less';
        }
        if (metaDescription.length > 160) {
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
            return Response.tson({ error: errors }, { status: 400 });
        }

        // Handle category
        let category;
        if (newCategory && newCategory.trim()) {
            const slug = newCategory
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            category = await Category.findOneAndUpdate(
                { slug },
                { name: newCategory.trim(), slug },
                { upsert: true, new: true }
            );
        } else {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return Response.tson({ error: 'Invalid category ID' }, { status: 400 });
            }
            category = await Category.findById(categoryId);
            if (!category) {
                return Response.tson({ error: 'Category not found' }, { status: 404 });
            }
        }

        // Handle main image
        let mainImageUrl = existingMainImage;
        if (mainImage && mainImage.size > 0) {
            if (!mainImage.type.startsWith('image/')) {
                return Response.tson({ error: 'Main image must be an image file' }, { status: 400 });
            }
            if (mainImage.size > 5 * 1024 * 1024) {
                return Response.tson({ error: 'Main image size must be less than 5MB' }, { status: 400 });
            }
            const mainImageBuffer = Buffer.from(await mainImage.arrayBuffer());
            const mainImageResult = await new Promise((resolve, reject) => {
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
                const publicId = existingProduct.mainImage.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`products/${publicId}`);
            }
        }

        // Handle additional images
        let additionalImageUrls = [...existingAdditionalImages];
        const deletedImages = existingProduct.additionalImages.filter(
            (img) => !existingAdditionalImages.some((existing) => existing.url === img.url)
        );
        for (const img of deletedImages) {
            const publicId = img.url.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`products/additional/${publicId}`);
        }

        for (const [index, image] of additionalImages.entries()) {
            if (!image.type.startsWith('image/')) {
                return Response.tson({ error: `Additional image ${image.name} must be an image file` }, { status: 400 });
            }
            if (image.size > 5 * 1024 * 1024) {
                return Response.tson({ error: `Additional image ${image.name} size must be less than 5MB` }, { status: 400 });
            }
            const buffer = Buffer.from(await image.arrayBuffer());
            const uploadResult = await new Promise((resolve, reject) => {
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
        const prices = [{ currency: 'BDT', amount: bdtPrice }];
        if (usdPrice) {
            prices.push({ currency: 'USD', amount: usdPrice, exchangeRate: usdExchangeRate });
        }
        if (eurPrice) {
            prices.push({ currency: 'EUR', amount: eurPrice, exchangeRate: eurExchangeRate });
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
        const product = await Product.findByIdAndUpdate(
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

        if (!product) {
            return Response.tson({ error: 'Product not found' }, { status: 404 });
        }

        console.log('Updated product:', JSON.stringify(product, null, 2));
        return Response.tson({ message: 'Product updated', product }, { status: 200 });
    } catch (error) {
        console.error('Error updating product:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            return Response.tson({ error: `Validation failed: ${errors.join(', ')}` }, { status: 400 });
        }
        if (error.message.includes('image')) {
            return Response.tson({ error: error.message }, { status: 400 });
        }
        return Response.tson({ error: `Failed to update product: ${error.message}` }, { status: 500 });
    }
}