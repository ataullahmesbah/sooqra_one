
//app/api/products/route.ts


import cloudinary from '@/utils/cloudinary';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/dbMongoose';
import { getServerSession } from 'next-auth';
import Product from '@/models/Products';
import Category from '@/models/Category';
import mongoose from 'mongoose';


// Sort function for additional images by lastModified date
const ascendingSort = (a, b) => {
    if (a instanceof File && b instanceof File) {
        return b.lastModified - a.lastModified;
    }
    return 0;
};



export async function GET(request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const sort = searchParams.get('sort');
    const order = searchParams.get('order');
    const limit = parseInt(searchParams.get('limit')) || 0;

    if (type === 'categories') {
        try {
            const categories = await Category.find({}).lean();
            return Response.tson(categories, { status: 200 });
        } catch (error) {
            return Response.tson({ error: `Failed to fetch categories: ${error.message}` }, { status: 500 });
        }
    }

    try {
        let query = Product.find({}).populate('category').lean();
        if (sort && order) {
            query = query.sort({ [sort]: order === 'desc' ? -1 : 1 });
        }
        if (limit > 0) {
            query = query.limit(limit);
        }
        const products = await query;
        return Response.tson(products, { status: 200 });
    } catch (error) {
        return Response.tson({ error: `Failed to fetch products: ${error.message}` }, { status: 500 });
    }
}



export async function POST(request) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.name) {
        return Response.tson({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        console.log('Received formData keys:', [...formData.keys()]); // ইতিমধ্যে আছে
        if (formData.get('isGlobal') !== 'true') {
            if (!formData.get('targetCountry')?.trim()) {
                return Response.tson({ error: 'Target country is required when not global' }, { status: 400 });
            }
            if (!formData.get('targetCity')?.trim()) {
                return Response.tson({ error: 'Target city is required when not global' }, { status: 400 });
            }
        }

        // Validate required fields
        const requiredFields = ['title', 'bdtPrice', 'description', 'mainImage', 'productType', 'quantity', 'product_code', 'brand', 'metaTitle', 'metaDescription', 'mainImageAlt'];
        // Only require targetCountry and targetCity if isGlobal is false
        if (formData.get('isGlobal') !== 'true') {
            requiredFields.push('targetCountry', 'targetCity');
        }
        const missingFields = requiredFields.filter((field) => !formData.get(field) && formData.get(field) !== '');
        if (missingFields.length > 0) {
            return Response.tson({ error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
        }

        const targetCountry = formData.get('targetCountry')?.trim().replace(/[^a-zA-Z\s]/g, '') || '';
        const targetCity = formData.get('targetCity')?.trim().replace(/[^a-zA-Z\s]/g, '') || '';
        if (formData.get('isGlobal') !== 'true' && (!targetCountry || !targetCity)) {
            return Response.tson({ error: 'Invalid target country or city format' }, { status: 400 });
        }


        // Validate productType
        if (!['Own', 'Affiliate'].includes(formData.get('productType'))) {
            return Response.tson({ error: 'Invalid product type' }, { status: 400 });
        }

        // Validate affiliateLink for Affiliate products
        if (formData.get('productType') === 'Affiliate' && !formData.get('affiliateLink')) {
            return Response.tson({ error: 'Affiliate link is required for affiliate products' }, { status: 400 });
        }

        // Validate prices
        const bdtPrice = parseFloat(formData.get('bdtPrice'));
        if (isNaN(bdtPrice) || bdtPrice <= 0) {
            return Response.tson({ error: 'BDT price must be a positive number' }, { status: 400 });
        }

        // Validate quantity
        const quantityRaw = formData.get('quantity');
        const quantity = parseInt(quantityRaw, 10);
        if (isNaN(quantity) || quantity < 0) {
            return Response.tson(
                { error: `Quantity must be a non-negative integer, received: ${quantityRaw}` },
                { status: 400 }
            );
        }

        // Size Processing

          const sizeRequirement = formData.get('sizeRequirement') || 'Optional';
  let sizes = [];
  if (formData.get('sizes')) {
    try {
      sizes = JSON.parse(formData.get('sizes')).filter((size) => size.name.trim() && size.quantity >= 0);
      if (sizeRequirement === 'Mandatory' && sizes.length === 0) {
        return Response.tson({ error: 'At least one size with quantity is required when size is Mandatory' }, { status: 400 });
      }
      // Validate that sum of size quantities equals total quantity
      const totalSizeQuantity = sizes.reduce((sum, size) => sum + size.quantity, 0);
      const totalQuantity = parseInt(formData.get('quantity'), 10);
      if (sizeRequirement === 'Mandatory' && totalSizeQuantity !== totalQuantity) {
        return Response.tson({ error: 'Sum of size quantities must equal total quantity' }, { status: 400 });
      }
    } catch {
      return Response.tson({ error: 'Invalid sizes format' }, { status: 400 });
    }
  }

        // Process prices
        const prices = [{ currency: 'BDT', amount: bdtPrice }];
        if (formData.get('usdPrice')) {
            const usdPrice = parseFloat(formData.get('usdPrice'));
            if (isNaN(usdPrice) || usdPrice <= 0) {
                return Response.tson({ error: 'USD price must be a positive number' }, { status: 400 });
            }
            prices.push({
                currency: 'USD',
                amount: usdPrice,
                exchangeRate: parseFloat(formData.get('usdExchangeRate')) || undefined,
            });
        }
        if (formData.get('eurPrice')) {
            const eurPrice = parseFloat(formData.get('eurPrice'));
            if (isNaN(eurPrice) || eurPrice <= 0) {
                return Response.tson({ error: 'EUR price must be a positive number' }, { status: 400 });
            }
            prices.push({
                currency: 'EUR',
                amount: eurPrice,
                exchangeRate: parseFloat(formData.get('eurExchangeRate')) || undefined,
            });
        }

        // Handle category
        let categoryId;
        const categoryInput = formData.get('category');
        const newCategoryName = formData.get('newCategory');

        if (!categoryInput && !newCategoryName) {
            return Response.tson({ error: 'Category or new category name is required' }, { status: 400 });
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
                return Response.tson({ error: 'Invalid category' }, { status: 400 });
            }
            categoryId = category._id;
        } else {
            return Response.tson({ error: 'Invalid category selection' }, { status: 400 });
        }

        // Upload main image
        const mainImageFile = formData.get('mainImage');
        if (!(mainImageFile instanceof File) || mainImageFile.size === 0) {
            return Response.tson({ error: 'Main image is required and must be a valid file' }, { status: 400 });
        }
        if (!mainImageFile.type.startsWith('image/')) {
            return Response.tson({ error: 'Main image must be an image file' }, { status: 400 });
        }
        if (mainImageFile.size > 5 * 1024 * 1024) {
            return Response.tson({ error: 'Main image size must be less than 5MB' }, { status: 400 });
        }
        const mainImageArrayBuffer = await mainImageFile.arrayBuffer();
        const mainImageBuffer = Buffer.from(mainImageArrayBuffer);
        const mainImageResult = await new Promise((resolve, reject) => {
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
        let additionalImagesFiles = formData.getAll('additionalImages').filter((file) => file instanceof File && file.size > 0);
        const additionalAlts = formData.getAll('additionalAlts') || [];
        console.log('additionalImagesFiles:', additionalImagesFiles.map(f => f.name)); // Debug log
        console.log('additionalAlts:', additionalAlts); // Debug log

        const additionalImages = await Promise.all(
            additionalImagesFiles.slice(0, 5).map(async (file, index) => {
                if (!file.type.startsWith('image/')) {
                    throw new Error(`Additional image ${file.name} must be an image file`);
                }
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`Additional image ${file.name} size must be less than 5MB`);
                }
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const result = await new Promise((resolve, reject) => {
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
        console.log('Processed additionalImages:', additionalImages); // Debug log

        // Process bullet points
        const bulletPoints = formData.get('bulletPoints')
            ? formData.get('bulletPoints')
                .split(',')
                .map((point) => point.trim())
                .filter((point) => point.length > 0)
            : [];

        // Process additional descriptions
        const descriptions = formData.get('descriptions')
            ? formData.get('descriptions')
                .split('|||')
                .map((desc) => desc.trim())
                .filter((desc) => desc.length > 0)
            : [];

        // Process keywords
        const keywords = formData.get('keywords')
            ? formData.get('keywords')
                .split(',')
                .map((kw) => kw.trim())
                .filter((kw) => kw.length > 0)
            : [];

        // Process FAQs
        let faqs = [];
        if (formData.get('faqs')) {
            try {
                faqs = JSON.parse(formData.get('faqs'));
            } catch {
                return Response.tson({ error: 'Invalid FAQs format' }, { status: 400 });
            }
        }

        // Process specifications
        let specifications = [];
        if (formData.get('specifications')) {
            try {
                specifications = JSON.parse(formData.get('specifications'));
            } catch {
                return Response.tson({ error: 'Invalid specifications format' }, { status: 400 });
            }
        }

        // Generate slug from title
        let slug = formData.get('title')
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
            name: formData.get('title'),
            image: mainImageResult.secure_url,
            description: formData.get('description'),
            brand: {
                '@type': 'Brand',
                name: formData.get('brand'),
            },
            offers: {
                '@type': 'Offer',
                priceCurrency: 'BDT',
                price: bdtPrice,
                availability: formData.get('availability') || 'https://schema.org/InStock',
                url: `${process.env.NEXTAUTH_URL}/shop/${uniqueSlug}`,
                itemOffered: {
                    '@type': 'Product',
                    areaServed: formData.get('isGlobal') === 'true' ? 'Worldwide' : formData.get('targetCountry'),
                },
            },
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: parseFloat(formData.get('aggregateRating.ratingValue')) || 0,
                reviewCount: parseInt(formData.get('aggregateRating.reviewCount')) || 0,
            },
        };


        const product = new Product({
            title: formData.get('title'),
            slug: uniqueSlug,
            prices,
            mainImage: mainImageResult.secure_url,
            mainImageAlt: formData.get('mainImageAlt'),
            additionalImages,
            description: formData.get('description'),
            shortDescription: formData.get('shortDescription'),
            product_code: formData.get('product_code'),
            descriptions,
            bulletPoints,
            productType: formData.get('productType'),
            affiliateLink: formData.get('productType') === 'Affiliate' ? formData.get('affiliateLink') : undefined,
            owner: session.user.name,
            brand: formData.get('brand'),
            category: categoryId,
            quantity,
            availability: formData.get('availability') || 'InStock',
            metaTitle: formData.get('metaTitle'),
            metaDescription: formData.get('metaDescription'),
            keywords,
            faqs,
            reviews: [],
            aggregateRating: {
                ratingValue: parseFloat(formData.get('aggregateRating.ratingValue')) || 0,
                reviewCount: parseInt(formData.get('aggregateRating.reviewCount')) || 0,
            },
            specifications,
            sizeRequirement,
            sizes,
            schemaMarkup,
            targetCountry: formData.get('targetCountry'),
            targetCity: formData.get('targetCity'),
            isGlobal: formData.get('isGlobal') === 'true',
        });

        console.log('Product to save:', JSON.stringify(product, null, 2)); // Debug log
        await product.save();
        return Response.tson(product, { status: 201 });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            return Response.tson({ error: `Validation failed: ${errors.join(', ')}` }, { status: 400 });
        }
        if (error.message.includes('image')) {
            return Response.tson({ error: error.message }, { status: 400 });
        }
        return Response.tson({ error: `Failed to create product: ${error.message}` }, { status: 500 });
    }
}