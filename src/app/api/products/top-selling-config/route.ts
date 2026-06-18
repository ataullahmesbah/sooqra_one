import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import TopSellingConfig from '@/src/models/TopSellingConfig';
import mongoose from 'mongoose';

// GET - Fetch current configuration
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        console.log('Fetching top selling config...');

        let config = await TopSellingConfig.findOne();

        if (!config) {
            console.log('No config found, creating default...');
            config = await TopSellingConfig.create({
                mode: 'auto',
                pinnedProducts: []
            });
        }

        console.log('Config found:', { mode: config.mode, pinnedCount: config.pinnedProducts?.length });

        return NextResponse.json({
            success: true,
            config: {
                mode: config.mode,
                pinnedProducts: config.pinnedProducts || []
            }
        });

    } catch (error: any) {
        console.error('Error in GET top-selling-config:', error);
        return NextResponse.json(
            { error: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}

// POST - Update configuration
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

        if (token?.role !== 'admin' && token?.role !== 'moderator') {
            return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 401 });
        }

        const body = await request.json();
        const { mode, pinnedProducts } = body;

        console.log('Updating config:', { mode, pinnedProductsCount: pinnedProducts?.length });

        if (!mode || !['manual', 'auto'].includes(mode)) {
            return NextResponse.json({ error: 'Invalid mode. Must be "manual" or "auto"' }, { status: 400 });
        }

        // Find and update, or create if doesn't exist
        let config = await TopSellingConfig.findOne();

        if (config) {
            config.mode = mode;
            if (mode === 'manual' && pinnedProducts) {
                config.pinnedProducts = pinnedProducts;
            } else {
                config.pinnedProducts = [];
            }
            await config.save();
            console.log('Config updated successfully');
        } else {
            config = await TopSellingConfig.create({
                mode,
                pinnedProducts: mode === 'manual' ? (pinnedProducts || []) : []
            });
            console.log('Config created successfully');
        }

        // Verify save
        const verifyConfig = await TopSellingConfig.findOne();
        console.log('Verified config after save:', {
            mode: verifyConfig?.mode,
            pinnedCount: verifyConfig?.pinnedProducts?.length
        });

        return NextResponse.json({
            success: true,
            config: {
                mode: config.mode,
                pinnedProducts: config.pinnedProducts || []
            }
        });

    } catch (error: any) {
        console.error('Error in POST top-selling-config:', error);
        return NextResponse.json(
            { error: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}