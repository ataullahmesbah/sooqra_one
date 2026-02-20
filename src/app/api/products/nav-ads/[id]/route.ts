// src/app/api/products/nav-ads/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import NavAd from '@/src/models/NavAd';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();

    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { success: false, error: 'No ID provided' },
            { status: 400 }
        );
    }

    try {
        const navAd = await NavAd.findByIdAndDelete(id);

        if (!navAd) {
            return NextResponse.json(
                { success: false, error: 'Nav ad not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Nav ad deleted successfully'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete nav ad' },
            { status: 500 }
        );
    }
}