// src/app/api/products/nav-ads/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import NavAd from '@/src/models/NavAd';

interface Params {
    id: string;
}

export async function DELETE(request: Request, { params }: { params: Params }) {
    await dbConnect();
    const { id } = params;

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
        console.error('Error deleting nav ad:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete nav ad' },
            { status: 500 }
        );
    }
}