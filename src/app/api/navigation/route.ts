import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { NavItem } from '@/src/models/Navigation';
import dbConnect from '@/src/lib/dbConnect';

// GET - Get all active navigation items
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const navigation = await NavItem.find({
            isActive: true,
            parentId: null
        })
            .sort({ order: 1 })
            .populate({
                path: 'children',
                options: { sort: { order: 1 } }
            })
            .lean();

        return NextResponse.json({
            success: true,
            data: navigation
        });

    } catch (error) {
        console.error('Navigation fetch error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch navigation',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// POST - Create new navigation item
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        const { title, slug = '#', type = 'link', order = 0, parentId = null } = body;

        if (!title || title.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Title is required' },
                { status: 400 }
            );
        }

        // Validate parentId if provided
        if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid parent ID' },
                { status: 400 }
            );
        }

        const newItem = new NavItem({
            title: title.trim(),
            slug: slug.trim(),
            type,
            order: Number(order) || 0,
            parentId: parentId || null,
            isActive: true
        });

        await newItem.save();

        // If it's a child item, populate parent info
        if (parentId) {
            await newItem.populate('parentId');
        }

        return NextResponse.json({
            success: true,
            data: newItem
        }, { status: 201 });

    } catch (error) {
        console.error('Navigation creation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create navigation item',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// PUT - Update navigation item
export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'Valid ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();

        // Find the item first
        const existingItem = await NavItem.findById(id);
        if (!existingItem) {
            return NextResponse.json(
                { success: false, error: 'Navigation item not found' },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: any = {};
        if (body.title !== undefined) updateData.title = body.title.trim();
        if (body.slug !== undefined) updateData.slug = body.slug.trim();
        if (body.type !== undefined) updateData.type = body.type;
        if (body.order !== undefined) updateData.order = Number(body.order) || 0;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;
        if (body.parentId !== undefined) {
            updateData.parentId = body.parentId || null;
        }

        const updatedItem = await NavItem.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return NextResponse.json({
            success: true,
            data: updatedItem
        });

    } catch (error) {
        console.error('Navigation update error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update navigation item',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// DELETE - Delete navigation item
export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'Valid ID is required' },
                { status: 400 }
            );
        }

        // Check if item has children
        const childCount = await NavItem.countDocuments({ parentId: id, isActive: true });
        if (childCount > 0) {
            // Option 1: Delete children first
            await NavItem.deleteMany({ parentId: id });
            // Option 2: Or update children to have null parentId
            // await NavItem.updateMany({ parentId: id }, { $set: { parentId: null } });
        }

        const deletedItem = await NavItem.findByIdAndDelete(id);

        if (!deletedItem) {
            return NextResponse.json(
                { success: false, error: 'Navigation item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Navigation item deleted successfully'
        });

    } catch (error) {
        console.error('Navigation delete error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete navigation item',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}