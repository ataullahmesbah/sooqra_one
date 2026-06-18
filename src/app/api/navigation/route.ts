// src/app/api/navigation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { NavItem } from '@/src/models/Navigation';
import dbConnect from '@/src/lib/dbConnect';

// ✅ GET - active nav items with ISR cache
export async function GET(_request: NextRequest) {
    try {
        await dbConnect();

        const navigation = await NavItem.find({ isActive: true, parentId: null })
            .sort({ order: 1 })
            .populate({ path: 'children', options: { sort: { order: 1 } } })
            .lean();

        return NextResponse.json(
            { success: true, data: navigation },
            {
                status: 200,
                headers: {
                    // ✅ Edge cache 5 min, stale-while-revalidate 10 min
                    // Navigation almost never changes — safe to cache aggressively
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                },
            }
        );
    } catch (error) {
        console.error('Navigation fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch navigation' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { title, slug = '#', type = 'link', order = 0, parentId = null } = body;

        if (!title?.trim()) {
            return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
        }
        if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
            return NextResponse.json({ success: false, error: 'Invalid parent ID' }, { status: 400 });
        }

        const newItem = new NavItem({
            title: title.trim(), slug: slug.trim(), type,
            order: Number(order) || 0, parentId: parentId || null, isActive: true,
        });
        await newItem.save();

        return NextResponse.json({ success: true, data: newItem }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'Valid ID required' }, { status: 400 });
        }

        const body = await request.json();
        const updateData: any = {};
        if (body.title !== undefined) updateData.title = body.title.trim();
        if (body.slug !== undefined) updateData.slug = body.slug.trim();
        if (body.type !== undefined) updateData.type = body.type;
        if (body.order !== undefined) updateData.order = Number(body.order) || 0;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;
        if (body.parentId !== undefined) updateData.parentId = body.parentId || null;

        const updated = await NavItem.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
        if (!updated) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'Valid ID required' }, { status: 400 });
        }

        await NavItem.deleteMany({ parentId: id });
        const deleted = await NavItem.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
    }
}