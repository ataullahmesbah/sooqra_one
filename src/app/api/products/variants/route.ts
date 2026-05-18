// src/app/api/products/variants/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/src/lib/dbConnect';
import ProductVariant from '@/src/models/ProductVariant';
import Product from '@/src/models/Products';
import mongoose from 'mongoose';

// GET - Fetch variants for a product
export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        // Validate productId
        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Check if productId is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json(
                { error: 'Invalid Product ID format' },
                { status: 400 }
            );
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Fetch variants for this product
        const variants = await ProductVariant.find({ productId }).lean();

        return NextResponse.json(variants, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching variants:', error);
        return NextResponse.json(
            { error: `Failed to fetch variants: ${error.message}` },
            { status: 500 }
        );
    }
}

// POST - Create/Update variants for a product
export async function POST(request: Request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        await dbConnect();

        const body = await request.json();
        const { productId, variants } = body;

        // Validate productId
        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json(
                { error: 'Invalid Product ID format' },
                { status: 400 }
            );
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Validate variants array
        if (!variants || !Array.isArray(variants)) {
            return NextResponse.json(
                { error: 'Variants must be an array' },
                { status: 400 }
            );
        }

        // Validate each variant
        for (const variant of variants) {
            if (!variant.name || !variant.weight || !variant.price) {
                return NextResponse.json(
                    { error: 'Each variant must have name, weight, and price' },
                    { status: 400 }
                );
            }

            if (variant.price <= 0) {
                return NextResponse.json(
                    { error: 'Price must be greater than 0' },
                    { status: 400 }
                );
            }

            if (variant.quantity < 0) {
                return NextResponse.json(
                    { error: 'Quantity cannot be negative' },
                    { status: 400 }
                );
            }
        }

        // Check if at least one variant exists
        if (variants.length === 0) {
            return NextResponse.json(
                { error: 'At least one variant is required' },
                { status: 400 }
            );
        }

        // Check if exactly one variant is default
        const defaultVariants = variants.filter(v => v.isDefault === true);
        if (defaultVariants.length > 1) {
            return NextResponse.json(
                { error: 'Only one variant can be set as default' },
                { status: 400 }
            );
        }

        // If no default variant, set first as default
        if (defaultVariants.length === 0 && variants.length > 0) {
            variants[0].isDefault = true;
        }

        // Delete existing variants
        await ProductVariant.deleteMany({ productId });

        // Create new variants with unique SKU
        const newVariants = variants.map((variant: any, index: number) => ({
            productId,
            name: variant.name,
            weight: variant.weight,
            price: variant.price,
            comparePrice: variant.comparePrice || 0,
            sku: variant.sku || `${productId}-${Date.now()}-${index}`,
            quantity: variant.quantity || 0,
            isDefault: variant.isDefault || (index === 0 && variants.length > 0)
        }));

        // Insert all variants
        const createdVariants = await ProductVariant.insertMany(newVariants);

        // Update product hasVariants flag
        await Product.findByIdAndUpdate(productId, { hasVariants: true });

        return NextResponse.json({
            success: true,
            message: `Successfully saved ${createdVariants.length} variants`,
            variants: createdVariants
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error saving variants:', error);
        return NextResponse.json(
            { error: `Failed to save variants: ${error.message}` },
            { status: 500 }
        );
    }
}

// PUT - Update specific variant
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        await dbConnect();

        const body = await request.json();
        const { variantId, ...updateData } = body;

        if (!variantId) {
            return NextResponse.json(
                { error: 'Variant ID is required' },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(variantId)) {
            return NextResponse.json(
                { error: 'Invalid Variant ID format' },
                { status: 400 }
            );
        }

        const updatedVariant = await ProductVariant.findByIdAndUpdate(
            variantId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedVariant) {
            return NextResponse.json(
                { error: 'Variant not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Variant updated successfully',
            variant: updatedVariant
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating variant:', error);
        return NextResponse.json(
            { error: `Failed to update variant: ${error.message}` },
            { status: 500 }
        );
    }
}

// src/app/api/products/variants/route.ts - DELETE method যোগ করুন

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const variantId = searchParams.get('variantId');

        if (productId) {
            // Delete all variants for a product
            await ProductVariant.deleteMany({ productId });
            await Product.findByIdAndUpdate(productId, { hasVariants: false });
            return NextResponse.json({
                success: true,
                message: 'All variants deleted successfully'
            }, { status: 200 });
        }

        if (variantId) {
            // Delete single variant
            if (!mongoose.Types.ObjectId.isValid(variantId)) {
                return NextResponse.json(
                    { error: 'Invalid Variant ID format' },
                    { status: 400 }
                );
            }

            const deletedVariant = await ProductVariant.findByIdAndDelete(variantId);
            if (!deletedVariant) {
                return NextResponse.json(
                    { error: 'Variant not found' },
                    { status: 404 }
                );
            }

            // Check if product has any variants left
            const remainingVariants = await ProductVariant.countDocuments({
                productId: deletedVariant.productId
            });

            if (remainingVariants === 0) {
                await Product.findByIdAndUpdate(deletedVariant.productId, { hasVariants: false });
            }

            return NextResponse.json({
                success: true,
                message: 'Variant deleted successfully'
            }, { status: 200 });
        }

        return NextResponse.json(
            { error: 'Either productId or variantId is required' },
            { status: 400 }
        );
    } catch (error: any) {
        console.error('Error deleting variant(s):', error);
        return NextResponse.json(
            { error: `Failed to delete variant(s): ${error.message}` },
            { status: 500 }
        );
    }
}