// src/app/api/products/shipping-charges/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import ShippingCharge from '@/src/models/ShippingCharge';

// Interface definitions
interface ShippingChargeItem {
    type: string;
    charge: number;
}

export async function GET() {
    try {
        await dbConnect();
        const charges = await ShippingCharge.find({}).lean();
        console.log('Fetched Shipping Charges:', charges);

        if (charges.length === 0) {
            await ShippingCharge.insertMany([
                { type: 'Dhaka-Chattogram', charge: 100 },
                { type: 'Others', charge: 150 }
            ]);
            const defaultCharges = await ShippingCharge.find({}).lean();
            console.log('Initialized Default Shipping Charges:', defaultCharges);
            return NextResponse.json(defaultCharges, { status: 200 });
        }

        return NextResponse.json(charges, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching shipping charges:', error);
        return NextResponse.json({ error: 'Failed to fetch shipping charges' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const charges: ShippingChargeItem[] = await request.json();

        if (!Array.isArray(charges) || charges.length !== 2) {
            return NextResponse.json({ error: 'Expected an array of two charges' }, { status: 400 });
        }

        for (const { type, charge } of charges) {
            if (!['Dhaka-Chattogram', 'Others'].includes(type)) {
                return NextResponse.json({ error: `Invalid type: ${type}` }, { status: 400 });
            }
            if (typeof charge !== 'number' || charge < 0) {
                return NextResponse.json({ error: `Invalid charge for ${type}` }, { status: 400 });
            }

            await ShippingCharge.findOneAndUpdate(
                { type },
                { charge, updatedAt: new Date() },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json({ message: 'Shipping charges updated' }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating shipping charges:', error);
        return NextResponse.json({ error: 'Failed to update shipping charges: ' + error.message }, { status: 500 });
    }
}