// src/app/api/products/route.ts
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import cloudinary from '@/src/utils/cloudinary';
import { authOptions } from '../auth/[...nextauth]/route';
import Category from '@/src/models/Category';
import Product from '@/src/models/Products';
import dbConnect from '@/src/lib/dbConnect';
import SubCategory from '@/src/models/SubCategory';

// Interface definitions
interface Price {
    currency: string;
    amount: number;
    exchangeRate?: number;
}

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

export async function GET(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const sort = searchParams.get('sort');
    const order = searchParams.get('order');
    const limit = parseInt(searchParams.get('limit') || '0');
    const categoryId = searchParams.get('categoryId');

    // ক্যাটেগরিগুলো ফেচ করার জন্য
    if (type === 'categories') {
        try {
            const categories = await Category.find({}).lean();
            return Response.json(categories, { status: 200 });
        } catch (error: any) {
            return Response.json({ error: `Failed to fetch categories: ${error.message}` }, { status: 500 });
        }
    }


    if (type === 'subcategories' && categoryId) {
        try {


            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return Response.json({ error: 'Invalid category ID' }, { status: 400 });
            }

            const subCategories = await SubCategory.find({ category: categoryId }).lean();


            return Response.json(subCategories, { status: 200 });
        } catch (error: any) {
            console.error('Subcategory fetch error:', error);
            return Response.json({ error: `Failed to fetch subcategories: ${error.message}` }, { status: 500 });
        }
    }





    try {
        let query = Product.find({})
            .populate('category')
            .populate('subCategory') // subCategory পপুলেট করো
            .lean();

        if (sort && order) {
            query = query.sort({ [sort]: order === 'desc' ? -1 : 1 });
        }
        if (limit > 0) {
            query = query.limit(limit);
        }
        const products = await query;
        return Response.json(products, { status: 200 });
    } catch (error: any) {
        return Response.json({ error: `Failed to fetch products: ${error.message}` }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.name) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();


        // Validate isGlobal fields
        if (formData.get('isGlobal') !== 'true') {
            const targetCountry = formData.get('targetCountry')?.toString().trim();
            const targetCity = formData.get('targetCity')?.toString().trim();

            if (!targetCountry) {
                return Response.json({ error: 'Target country is required when not global' }, { status: 400 });
            }
            if (!targetCity) {
                return Response.json({ error: 'Target city is required when not global' }, { status: 400 });
            }
        }

        // Validate required fields
        const requiredFields = [
            'title', 'bdtPrice', 'description', 'mainImage', 'productType',
            'quantity', 'product_code', 'brand', 'metaTitle', 'metaDescription', 'mainImageAlt'
        ];

        // Only require targetCountry and targetCity if isGlobal is false
        if (formData.get('isGlobal') !== 'true') {
            requiredFields.push('targetCountry', 'targetCity');
        }

        const missingFields = requiredFields.filter((field) => {
            const value = formData.get(field);
            return !value || value.toString().trim() === '';
        });

        if (missingFields.length > 0) {
            return Response.json({ error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
        }

        const targetCountry = formData.get('targetCountry')?.toString().trim().replace(/[^a-zA-Z\s]/g, '') || '';
        const targetCity = formData.get('targetCity')?.toString().trim().replace(/[^a-zA-Z\s]/g, '') || '';

        if (formData.get('isGlobal') !== 'true' && (!targetCountry || !targetCity)) {
            return Response.json({ error: 'Invalid target country or city format' }, { status: 400 });
        }

        // Validate productType
        const productType = formData.get('productType')?.toString();
        if (!productType || !['Own', 'Affiliate'].includes(productType)) {
            return Response.json({ error: 'Invalid product type' }, { status: 400 });
        }

        // Validate affiliateLink for Affiliate products
        if (productType === 'Affiliate') {
            const affiliateLink = formData.get('affiliateLink')?.toString().trim();
            if (!affiliateLink) {
                return Response.json({ error: 'Affiliate link is required for affiliate products' }, { status: 400 });
            }
        }

        // Validate prices
        const bdtPrice = parseFloat(formData.get('bdtPrice')?.toString() || '0');
        if (isNaN(bdtPrice) || bdtPrice <= 0) {
            return Response.json({ error: 'BDT price must be a positive number' }, { status: 400 });
        }

        // Validate quantity
        const quantityRaw = formData.get('quantity')?.toString() || '0';
        const quantity = parseInt(quantityRaw, 10);
        if (isNaN(quantity) || quantity < 0) {
            return Response.json(
                { error: `Quantity must be a non-negative integer, received: ${quantityRaw}` },
                { status: 400 }
            );
        }

        // Size Processing
        const sizeRequirement = formData.get('sizeRequirement')?.toString() || 'Optional';
        let sizes: Size[] = [];

        const sizesInput = formData.get('sizes')?.toString();
        if (sizesInput) {
            try {
                const parsedSizes = JSON.parse(sizesInput) as Size[];
                sizes = parsedSizes.filter((size) => size.name.trim() && size.quantity >= 0);

                if (sizeRequirement === 'Mandatory' && sizes.length === 0) {
                    return Response.json({ error: 'At least one size with quantity is required when size is Mandatory' }, { status: 400 });
                }

                // Validate that sum of size quantities equals total quantity
                const totalSizeQuantity = sizes.reduce((sum, size) => sum + size.quantity, 0);
                const totalQuantity = parseInt(formData.get('quantity')?.toString() || '0', 10);

                if (sizeRequirement === 'Mandatory' && totalSizeQuantity !== totalQuantity) {
                    return Response.json({ error: 'Sum of size quantities must equal total quantity' }, { status: 400 });
                }
            } catch {
                return Response.json({ error: 'Invalid sizes format' }, { status: 400 });
            }
        }

        // Process prices
        const prices: Price[] = [{ currency: 'BDT', amount: bdtPrice }];

        const usdPriceInput = formData.get('usdPrice')?.toString();
        if (usdPriceInput) {
            const usdPrice = parseFloat(usdPriceInput);
            if (isNaN(usdPrice) || usdPrice <= 0) {
                return Response.json({ error: 'USD price must be a positive number' }, { status: 400 });
            }
            prices.push({
                currency: 'USD',
                amount: usdPrice,
                exchangeRate: parseFloat(formData.get('usdExchangeRate')?.toString() || '0') || undefined,
            });
        }

        const eurPriceInput = formData.get('eurPrice')?.toString();
        if (eurPriceInput) {
            const eurPrice = parseFloat(eurPriceInput);
            if (isNaN(eurPrice) || eurPrice <= 0) {
                return Response.json({ error: 'EUR price must be a positive number' }, { status: 400 });
            }
            prices.push({
                currency: 'EUR',
                amount: eurPrice,
                exchangeRate: parseFloat(formData.get('eurExchangeRate')?.toString() || '0') || undefined,
            });
        }

        // Handle category
        let categoryId: mongoose.Types.ObjectId;
        const categoryInput = formData.get('category')?.toString();
        const newCategoryName = formData.get('newCategory')?.toString();

        if (!categoryInput && !newCategoryName) {
            return Response.json({ error: 'Category or new category name is required' }, { status: 400 });
        }

        if (newCategoryName && newCategoryName.trim()) {
            const slug = newCategoryName
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            let category = await Category.findOne({ slug });
            if (!category) {
                category = new Category({
                    name: newCategoryName.trim(),
                    slug,
                });
                await category.save();
            }
            categoryId = category._id;
        } else if (categoryInput && mongoose.Types.ObjectId.isValid(categoryInput)) {
            const category = await Category.findById(categoryInput);
            if (!category) {
                return Response.json({ error: 'Invalid category' }, { status: 400 });
            }
            categoryId = category._id;
        } else {
            return Response.json({ error: 'Invalid category selection' }, { status: 400 });
        }

        // Handle subcategory (ঐচ্ছিক)
        let subCategoryId: mongoose.Types.ObjectId | undefined;
        const subCategoryInput = formData.get('subCategory')?.toString();
        const newSubCategoryName = formData.get('newSubCategory')?.toString();

        if (newSubCategoryName && newSubCategoryName.trim()) {
            const slug = newSubCategoryName
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            let subCategory = await SubCategory.findOne({ slug, category: categoryId });
            if (!subCategory) {
                subCategory = new SubCategory({
                    name: newSubCategoryName.trim(),
                    slug,
                    category: categoryId,
                });
                await subCategory.save();
            }
            subCategoryId = subCategory._id;
        } else if (subCategoryInput && subCategoryInput.trim() && mongoose.Types.ObjectId.isValid(subCategoryInput)) {
            const subCategory = await SubCategory.findOne({
                _id: subCategoryInput,
                category: categoryId
            });
            if (!subCategory) {
                return Response.json({ error: 'Invalid subcategory for selected category' }, { status: 400 });
            }
            subCategoryId = subCategory._id;
        }
        // Note: subCategory is optional, so no error if not provided

        // Upload main image
        const mainImageFile = formData.get('mainImage') as File;
        if (!mainImageFile || mainImageFile.size === 0) {
            return Response.json({ error: 'Main image is required and must be a valid file' }, { status: 400 });
        }

        if (!mainImageFile.type.startsWith('image/')) {
            return Response.json({ error: 'Main image must be an image file' }, { status: 400 });
        }

        if (mainImageFile.size > 5 * 1024 * 1024) {
            return Response.json({ error: 'Main image size must be less than 5MB' }, { status: 400 });
        }

        const mainImageArrayBuffer = await mainImageFile.arrayBuffer();
        const mainImageBuffer = Buffer.from(mainImageArrayBuffer);

        const mainImageResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'products',
                    format: 'webp',
                    width: 800,
                    height: 800,
                    crop: 'fill',
                    quality: 'auto'
                },
                (error, result) => (error ? reject(error) : resolve(result))
            ).end(mainImageBuffer);
        });

        // Upload additional images (max 5) and pair with ALT texts
        const additionalImagesFiles = formData.getAll('additionalImages')
            .filter((file): file is File => file instanceof File && file.size > 0)
            .slice(0, 5);

        const additionalAlts = formData.getAll('additionalAlts') as string[];



        const additionalImages: AdditionalImage[] = await Promise.all(
            additionalImagesFiles.map(async (file, index) => {
                if (!file.type.startsWith('image/')) {
                    throw new Error(`Additional image ${file.name} must be an image file`);
                }
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`Additional image ${file.name} size must be less than 5MB`);
                }

                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const result = await new Promise<any>((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: 'products/additional',
                            format: 'webp',
                            width: 800,
                            height: 800,
                            crop: 'fill',
                            quality: 'auto'
                        },
                        (error, result) => (error ? reject(error) : resolve(result))
                    ).end(buffer);
                });

                return {
                    url: result.secure_url,
                    alt: additionalAlts[index] || `Additional image ${index + 1} for ${formData.get('title')}`,
                };
            })
        );



        // Process bullet points
        const bulletPointsInput = formData.get('bulletPoints')?.toString() || '';
        const bulletPoints = bulletPointsInput
            .split(',')
            .map((point) => point.trim())
            .filter((point) => point.length > 0);

        // Process additional descriptions
        const descriptionsInput = formData.get('descriptions')?.toString() || '';
        const descriptions = descriptionsInput
            .split('|||')
            .map((desc) => desc.trim())
            .filter((desc) => desc.length > 0);

        // Process keywords
        const keywordsInput = formData.get('keywords')?.toString() || '';
        const keywords = keywordsInput
            .split(',')
            .map((kw) => kw.trim())
            .filter((kw) => kw.length > 0);

        // Process FAQs
        let faqs: FAQ[] = [];
        const faqsInput = formData.get('faqs')?.toString();
        if (faqsInput) {
            try {
                faqs = JSON.parse(faqsInput) as FAQ[];
            } catch {
                return Response.json({ error: 'Invalid FAQs format' }, { status: 400 });
            }
        }

        // Process specifications
        let specifications: Specification[] = [];
        const specificationsInput = formData.get('specifications')?.toString();
        if (specificationsInput) {
            try {
                specifications = JSON.parse(specificationsInput) as Specification[];
            } catch {
                return Response.json({ error: 'Invalid specifications format' }, { status: 400 });
            }
        }

        // Generate slug from title
        const title = formData.get('title')?.toString() || '';
        let slug = title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        let slugCount = 0;
        let uniqueSlug = slug;

        while (await Product.findOne({ slug: uniqueSlug })) {
            slugCount++;
            uniqueSlug = `${slug}-${slugCount}`;
        }

        // Auto-generate schemaMarkup
        const schemaMarkup = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: title,
            image: mainImageResult.secure_url,
            description: formData.get('description')?.toString(),
            brand: {
                '@type': 'Brand',
                name: formData.get('brand')?.toString(),
            },
            offers: {
                '@type': 'Offer',
                priceCurrency: 'BDT',
                price: bdtPrice,
                availability: formData.get('availability')?.toString() || 'https://schema.org/InStock',
                url: `${process.env.NEXTAUTH_URL}/shop/${uniqueSlug}`,
                itemOffered: {
                    '@type': 'Product',
                    areaServed: formData.get('isGlobal') === 'true' ? 'Worldwide' : formData.get('targetCountry')?.toString(),
                },
            },
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: parseFloat(formData.get('aggregateRating.ratingValue')?.toString() || '0'),
                reviewCount: parseInt(formData.get('aggregateRating.reviewCount')?.toString() || '0'),
            },
        };

        // Create product object
        const productData = {
            title: title,
            slug: uniqueSlug,
            prices,
            mainImage: mainImageResult.secure_url,
            mainImageAlt: formData.get('mainImageAlt')?.toString(),
            additionalImages,
            description: formData.get('description')?.toString(),
            shortDescription: formData.get('shortDescription')?.toString(),
            product_code: formData.get('product_code')?.toString(),
            descriptions,
            bulletPoints,
            productType: productType,
            affiliateLink: productType === 'Affiliate' ? formData.get('affiliateLink')?.toString() : undefined,
            owner: session.user.name,
            brand: formData.get('brand')?.toString(),
            category: categoryId,
            subCategory: subCategoryId, // subCategory যোগ করলাম
            quantity,
            availability: formData.get('availability')?.toString() || 'InStock',
            metaTitle: formData.get('metaTitle')?.toString(),
            metaDescription: formData.get('metaDescription')?.toString(),
            keywords,
            faqs,
            reviews: [],
            aggregateRating: {
                ratingValue: parseFloat(formData.get('aggregateRating.ratingValue')?.toString() || '1'),
                reviewCount: parseInt(formData.get('aggregateRating.reviewCount')?.toString() || '0'),
            },
            specifications,
            sizeRequirement,
            sizes,
            schemaMarkup,
            targetCountry: formData.get('targetCountry')?.toString(),
            targetCity: formData.get('targetCity')?.toString(),
            isGlobal: formData.get('isGlobal') === 'true',
        };



        const product = new Product(productData);
        await product.save();

        return Response.json(product, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/products:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => err.message);
            return Response.json({ error: `Validation failed: ${errors.join(', ')}` }, { status: 400 });
        }

        if (error.message.includes('image')) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json({ error: `Failed to create product: ${error.message}` }, { status: 500 });
    }
}