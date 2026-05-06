// src/app/api/promotional/route.ts
import { getPromotionalData, updatePromotionalData } from '@/src/lib/promotional-data';
import { NextResponse } from 'next/server';


export async function GET() {
    try {
        // This will fetch from your database or file
        const promotionalData = await getPromotionalData();

        return NextResponse.json({
            success: true,
            data: promotionalData
        });
    } catch (error) {
        console.error('Error fetching promotional data:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch promotional data' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { isActive, text, emoji, backgroundColor, textColor } = body;

        // Save to database (implement your database logic)
        const updatedData = await updatePromotionalData({
            isActive,
            text,
            emoji,
            backgroundColor,
            textColor
        });

        return NextResponse.json({
            success: true,
            data: updatedData
        });
    } catch (error) {
        console.error('Error updating promotional data:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update promotional data' },
            { status: 500 }
        );
    }
}