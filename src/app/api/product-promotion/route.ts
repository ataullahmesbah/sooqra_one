import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import ProductPromotion from '@/src/models/ProductPromotion';


// GET - Fetch hero section for frontend
export async function GET() {
    try {
        await dbConnect();

        const hero = await ProductPromotion.findOne({ isActive: true });

        if (!hero) {
            return NextResponse.json({
                success: true,
                data: null,
                message: 'No active hero section found'
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                image: hero.image,
                link: hero.link,
                isActive: hero.isActive
            }
        });

    } catch (error: any) {
        console.error('Error fetching hero section:', error);
        return NextResponse.json(
            { error: `Failed to fetch hero section: ${error.message}` },
            { status: 500 }
        );
    }
}