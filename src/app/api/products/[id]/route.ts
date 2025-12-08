

//app/api/products/[id]/route.ts


import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import cloudinary from '@/src/utils/cloudinary';
import Category from '@/src/models/Category';
import Product from '@/src/models/Products';
import dbConnect from '@/src/lib/dbConnect';
import { authOptions } from '../../auth/[...nextauth]/route';
import SubCategory from '@/src/models/SubCategory'; // 


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

interface Params {
    id: string;
}

// Sort function for additional images by lastModified date
const ascendingSort = (a: File, b: File): number => {
    return b.lastModified - a.lastModified;
};



export async function GET(request: Request, { params }: { params: Promise<Params> }) {
    await dbConnect();
    try {
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return Response.json({ error: 'Invalid product ID' }, { status: 400 });
        }

        const product = await Product.findById(id)
            .populate('category')
            .populate('subCategory') // ✅ subCategory populate করো
            .lean();

        if (!product) {
            return Response.json({ error: 'Product not found' }, { status: 404 });
        }

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

export async function PUT(request: Request, { params }: { params: Promise<Params> }) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.name) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id: productId } = await params;

        console.log('Updating product ID:', productId);

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return Response.json({ error: 'Invalid product ID' }, { status: 400 });
        }

        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return Response.json({ error: 'Product not found' }, { status: 404 });
        }

        const formData = await request.formData();
        console.log('FormData keys:', [...formData.keys()]);


        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, typeof value, value);
        }


        // Extract ALL fields
        const title = formData.get('title') as string;
        const bdtPrice = formData.get('bdtPrice') as string;
        const usdPrice = formData.get('usdPrice') as string;
        const eurPrice = formData.get('eurPrice') as string;
        const usdExchangeRate = formData.get('usdExchangeRate') as string;
        const eurExchangeRate = formData.get('eurExchangeRate') as string;
        const description = formData.get('description') as string;
        const shortDescription = formData.get('shortDescription') as string;
        const product_code = formData.get('product_code') as string;
        const descriptions = (formData.get('descriptions') as string)?.split('|||')?.filter(Boolean) || [];
        const bulletPoints = (formData.get('bulletPoints') as string) || '';
        const productType = formData.get('productType') as string;
        const affiliateLink = productType === 'Affiliate' ? (formData.get('affiliateLink') as string) : '';
        const categoryId = formData.get('category') as string;
        const newCategory = formData.get('newCategory') as string;
        const subCategoryId = formData.get('subCategory') as string; // ✅ subCategory
        const mainImage = formData.get('mainImage') as File;
        const mainImageAlt = formData.get('mainImageAlt') as string;
        const existingMainImage = formData.get('existingMainImage') as string;

        // Additional images handling
        const additionalImages = formData.getAll('additionalImages')
            .filter((img): img is File => img instanceof File && img.size > 0);

        const additionalAlts = formData.getAll('additionalAlts') as string[];

        const existingAdditionalImagesInput = formData.get('existingAdditionalImages') as string;
        let existingAdditionalImages: AdditionalImage[] = [];
        if (existingAdditionalImagesInput) {
            try {
                existingAdditionalImages = JSON.parse(existingAdditionalImagesInput);
            } catch (error) {
                console.error('Error parsing existingAdditionalImages:', error);
            }
        }

        const brand = formData.get('brand') as string;
        const availability = formData.get('availability') as string;
        const metaTitle = formData.get('metaTitle') as string;
        const metaDescription = formData.get('metaDescription') as string;
        const keywords = (formData.get('keywords') as string)?.split(',')?.map(k => k.trim()).filter(Boolean) || [];
        const isGlobal = formData.get('isGlobal') === 'true';
        const targetCountry = (formData.get('targetCountry') as string) || '';
        const targetCity = (formData.get('targetCity') as string) || '';
        const quantity = parseInt(formData.get('quantity') as string || '0', 10);
        const sizeRequirement = (formData.get('sizeRequirement') as string) || 'Optional';

        // Handle aggregateRating correctly
        const aggregateRating: AggregateRating = {
            ratingValue: parseFloat(formData.get('aggregateRating.ratingValue') as string || '0'),
            reviewCount: parseInt(formData.get('aggregateRating.reviewCount') as string || '0', 10)
        };

        console.log('Aggregate Rating from form:', aggregateRating);

        // Handle sizes
        let sizes: Size[] = [];
        const sizesInput = formData.get('sizes') as string;
        if (sizesInput && sizesInput.trim()) {
            try {
                sizes = JSON.parse(sizesInput);
            } catch (error) {
                console.error('Error parsing sizes:', error);
            }
        }

        // Handle FAQs
        let faqs: FAQ[] = [];
        const faqsInput = formData.get('faqs') as string;
        if (faqsInput && faqsInput.trim()) {
            try {
                faqs = JSON.parse(faqsInput);
            } catch (error) {
                console.error('Error parsing FAQs:', error);
            }
        }

        // Handle specifications
        let specifications: Specification[] = [];
        const specificationsInput = formData.get('specifications') as string;
        if (specificationsInput && specificationsInput.trim()) {
            try {
                specifications = JSON.parse(specificationsInput);
            } catch (error) {
                console.error('Error parsing specifications:', error);
            }
        }

        // Validate required fields
        const errors: Record<string, string> = {};

        if (!title?.trim()) errors.title = 'Title is required';
        if (!bdtPrice || isNaN(parseFloat(bdtPrice)) || parseFloat(bdtPrice) <= 0) {
            errors.bdtPrice = 'BDT price must be a positive number';
        }
        if (!description?.trim()) errors.description = 'Description is required';
        if (!product_code?.trim()) errors.product_code = 'Product code is required';
        if (!brand?.trim()) errors.brand = 'Brand is required';
        if (!metaTitle?.trim()) errors.metaTitle = 'Meta title is required';
        if (!metaDescription?.trim()) errors.metaDescription = 'Meta description is required';
        if (!mainImageAlt?.trim()) errors.mainImageAlt = 'Main image ALT text is required';
        if (isNaN(quantity) || quantity < 0) errors.quantity = 'Quantity must be non-negative';
        if (productType === 'Affiliate' && !affiliateLink?.trim()) {
            errors.affiliateLink = 'Affiliate link is required for affiliate products';
        }
        if (!categoryId && !newCategory?.trim()) {
            errors.category = 'Category or new category name is required';
        }
        if (!mainImage && !existingMainImage) {
            errors.mainImage = 'Main image is required';
        }
        if (!isGlobal && !targetCountry?.trim()) errors.targetCountry = 'Target country is required';
        if (!isGlobal && !targetCity?.trim()) errors.targetCity = 'Target city is required';

        // Size validation
        if (sizeRequirement === 'Mandatory') {
            if (sizes.length === 0) {
                errors.sizes = 'At least one size is required when size requirement is mandatory';
            } else {
                const totalSizeQuantity = sizes.reduce((sum, size) => sum + (size.quantity || 0), 0);
                if (totalSizeQuantity !== quantity) {
                    errors.sizes = `Sum of size quantities (${totalSizeQuantity}) must equal total quantity (${quantity})`;
                }
            }
        }

        if (Object.keys(errors).length > 0) {
            console.log('Validation errors:', errors);
            return Response.json({
                error: 'Validation failed',
                details: errors
            }, { status: 400 });
        }

        // Handle category
        let category;
        if (newCategory && newCategory.trim()) {
            const slug = newCategory
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            let existingCat = await Category.findOne({ slug });
            if (!existingCat) {
                existingCat = new Category({
                    name: newCategory.trim(),
                    slug,
                });
                await existingCat.save();
            }
            category = existingCat;
        } else if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
            category = await Category.findById(categoryId);
            if (!category) {
                return Response.json({ error: 'Category not found' }, { status: 400 });
            }
        }

        if (!category) {
            return Response.json({ error: 'Category is required' }, { status: 400 });
        }

        // ✅ Handle subcategory
        let subCategory = null;
        if (subCategoryId && subCategoryId.trim() && mongoose.Types.ObjectId.isValid(subCategoryId)) {
            subCategory = await SubCategory.findOne({
                _id: subCategoryId,
                category: category._id // Ensure subcategory belongs to selected category
            });
            // Note: subCategory optional, so no error if not found
        }

        // Handle main image
        let mainImageUrl = existingMainImage;
        if (mainImage && mainImage.size > 0) {
            try {
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

                // Delete old image if exists
                if (existingProduct.mainImage && existingProduct.mainImage !== existingMainImage) {
                    const publicId = existingProduct.mainImage.split('/').pop()?.split('.')[0];
                    if (publicId) {
                        try {
                            await cloudinary.uploader.destroy(`products/${publicId}`);
                        } catch (error) {
                            console.error('Error deleting old main image:', error);
                        }
                    }
                }
            } catch (error: any) {
                return Response.json({ error: `Failed to upload main image: ${error.message}` }, { status: 400 });
            }
        }

        // Handle additional images
        const additionalImageUrls: AdditionalImage[] = [...existingAdditionalImages];

        // Upload new additional images
        for (const [index, image] of additionalImages.entries()) {
            try {
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
                    alt: additionalAlts[index] || `Additional image for ${title}`,
                });
            } catch (error: any) {
                return Response.json({ error: `Failed to upload additional image: ${error.message}` }, { status: 400 });
            }
        }

        // Prepare prices
        const prices: Price[] = [
            { currency: 'BDT', amount: parseFloat(bdtPrice) }
        ];

        if (usdPrice && !isNaN(parseFloat(usdPrice)) && parseFloat(usdPrice) > 0) {
            prices.push({
                currency: 'USD',
                amount: parseFloat(usdPrice),
                exchangeRate: usdExchangeRate && !isNaN(parseFloat(usdExchangeRate))
                    ? parseFloat(usdExchangeRate)
                    : undefined
            });
        }

        if (eurPrice && !isNaN(parseFloat(eurPrice)) && parseFloat(eurPrice) > 0) {
            prices.push({
                currency: 'EUR',
                amount: parseFloat(eurPrice),
                exchangeRate: eurExchangeRate && !isNaN(parseFloat(eurExchangeRate))
                    ? parseFloat(eurExchangeRate)
                    : undefined
            });
        }

        // Generate slug
        let slug = title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check for duplicate slug
        const existingSlugProduct = await Product.findOne({
            slug,
            _id: { $ne: productId }
        });
        if (existingSlugProduct) {
            let counter = 1;
            let newSlug = `${slug}-${counter}`;
            while (await Product.findOne({ slug: newSlug, _id: { $ne: productId } })) {
                counter++;
                newSlug = `${slug}-${counter}`;
            }
            slug = newSlug;
        }

        // Update product
        const updateData: any = {
            title: title.trim(),
            slug,
            prices,
            mainImage: mainImageUrl,
            mainImageAlt: mainImageAlt.trim(),
            additionalImages: additionalImageUrls,
            description: description.trim(),
            shortDescription: shortDescription?.trim() || '',
            product_code: product_code.trim(),
            descriptions,
            bulletPoints: bulletPoints.split(',').map(p => p.trim()).filter(Boolean),
            productType,
            affiliateLink: productType === 'Affiliate' ? affiliateLink : undefined,
            brand: brand.trim(),
            category: category._id,
            subCategory: subCategory?._id || null, // ✅ subCategory যোগ করলাম
            quantity,
            availability,
            metaTitle: metaTitle.trim(),
            metaDescription: metaDescription.trim(),
            keywords,
            faqs,
            specifications,
            aggregateRating,
            sizeRequirement,
            sizes: sizeRequirement === 'Mandatory' ? sizes : [],
            isGlobal,
            targetCountry: isGlobal ? '' : targetCountry.trim(),
            targetCity: isGlobal ? '' : targetCity.trim(),
            updatedAt: new Date()
        };

        console.log('Updating product with data:', JSON.stringify(updateData, null, 2));

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        ).populate('category')
            .populate('subCategory'); // ✅ subCategory populate করো

        if (!updatedProduct) {
            return Response.json({ error: 'Failed to update product' }, { status: 500 });
        }

        return Response.json({
            message: 'Product updated successfully',
            product: updatedProduct
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating product:', error);
        return Response.json({
            error: 'Internal server error',
            details: error.message
        }, { status: 500 });
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

