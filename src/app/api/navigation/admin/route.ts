import dbConnect from '@/src/lib/dbConnect';
import { NavItem } from '@/src/models/Navigation';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get all items including inactive ones for admin
        const navigation = await NavItem.find()
            .sort({ order: 1, parentId: 1 })
            .populate('children')
            .lean();

        return NextResponse.json({
            success: true,
            data: navigation
        });

    } catch (error) {
        console.error('Admin navigation fetch error:', error);
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