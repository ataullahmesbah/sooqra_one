// src/app/api/products/config/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Config from '@/src/models/Config';

// Interface definitions
interface ConfigValue {
    code: string;
    discountAmount: number;
    minCartTotal: number;
    expiresAt: string | Date;
}

interface RequestBody {
    code: string;
    discountAmount: number;
    minCartTotal: number;
    expiresAt: string;
}

export async function GET() {
    try {
        // console.log('Attempting to connect to MongoDB for GET /api/products/config');
        await dbConnect();
        // console.log('Connected to MongoDB, querying Config');
        const config = await Config.findOne({ key: 'globalCoupon' });
        // console.log('Config query result:', config);

        if (!config) {
            // console.log('No global coupon found, returning empty object');
            return NextResponse.json({}, { status: 200 });
        }

        if (!config.value.discountAmount) {
            console.warn('Warning: discountAmount missing in config.value:', config.value);
        }

        return NextResponse.json(config.value, { status: 200 });
    } catch (error: any) {
        console.error('Error in GET /api/products/config:', error.message, error.stack);
        return NextResponse.json({ error: `Failed to fetch global coupon: ${error.message}` }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // console.log('Attempting to connect to MongoDB for POST /api/products/config');
        await dbConnect();
        // console.log('Connected to MongoDB, processing POST data');

        const { code, discountAmount, minCartTotal, expiresAt }: RequestBody = await request.json();
        // console.log('Received POST data:', { code, discountAmount, minCartTotal, expiresAt });

        if (!code || discountAmount == null || minCartTotal == null || !expiresAt) {
            // console.log('Validation failed: Missing required fields');
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        if (discountAmount < 0) {
            // console.log('Validation failed: Negative discount amount');
            return NextResponse.json({ error: 'Discount amount cannot be negative' }, { status: 400 });
        }

        if (minCartTotal < 0) {
            // console.log('Validation failed: Negative minCartTotal');
            return NextResponse.json({ error: 'Minimum cart total cannot be negative' }, { status: 400 });
        }

        const expiresAtDate = new Date(expiresAt);
        if (isNaN(expiresAtDate.getTime()) || expiresAtDate < new Date()) {
            // console.log('Validation failed: Invalid or past expiry date');
            return NextResponse.json({ error: 'Invalid or past expiry date' }, { status: 400 });
        }

        // console.log('Updating Config with data:', { code, discountAmount, minCartTotal, expiresAt });
        const updateResult = await Config.updateOne(
            { key: 'globalCoupon' },
            {
                $set: {
                    value: {
                        code,
                        discountAmount: Number(discountAmount),
                        minCartTotal: Number(minCartTotal),
                        expiresAt: expiresAtDate
                    }
                }
            },
            { upsert: true }
        );
        // console.log('Config update result:', updateResult);

        return NextResponse.json({ message: 'Global coupon updated' }, { status: 200 });
    } catch (error: any) {
        console.error('Error in POST /api/products/config:', error.message, error.stack);
        return NextResponse.json({ error: `Failed to update global coupon: ${error.message}` }, { status: 500 });
    }
}