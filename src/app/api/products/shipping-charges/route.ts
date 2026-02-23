// src/app/api/products/shipping-charges/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import ShippingCharge from '@/src/models/ShippingCharge';

// Interface definitions
interface ShippingChargeItem {
    type: string;
    charge: number;
}

interface ShippingChargeDocument {
    type: string;
    charge: number;
    updatedAt: Date;
}

export async function GET(): Promise<NextResponse> {
    try {
        await dbConnect();
        const charges: ShippingChargeDocument[] = await ShippingCharge.find({}).lean() as ShippingChargeDocument[];
      

        if (charges.length === 0) {
         
            await ShippingCharge.insertMany([
                { type: 'Dhaka', charge: 80 }, //  Dhaka
                { type: 'Other-Districts', charge: 120 } //  Others District
            ]);
            const defaultCharges: ShippingChargeDocument[] = await ShippingCharge.find({}).lean() as ShippingChargeDocument[];
         
            return NextResponse.json(defaultCharges, { status: 200 });
        }

        return NextResponse.json(charges, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching shipping charges:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shipping charges' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        await dbConnect();
        const charges: ShippingChargeItem[] = await request.json();

        // Validation
        if (!Array.isArray(charges) || charges.length !== 2) {
            return NextResponse.json(
                { error: 'Expected an array of two charges' },
                { status: 400 }
            );
        }

        for (const { type, charge } of charges) {
            // ✅ নতুন type validation
            if (!['Dhaka', 'Other-Districts'].includes(type)) {
                return NextResponse.json(
                    { error: `Invalid type: ${type}. Must be "Dhaka" or "Other-Districts"` },
                    { status: 400 }
                );
            }

            if (typeof charge !== 'number' || isNaN(charge) || charge < 0) {
                return NextResponse.json(
                    { error: `Invalid charge for ${type}. Must be a positive number` },
                    { status: 400 }
                );
            }

            // Update or create the shipping charge
            await ShippingCharge.findOneAndUpdate(
                { type },
                { charge, updatedAt: new Date() },
                { upsert: true, new: true, runValidators: true }
            );
        }

        return NextResponse.json(
            { message: 'Shipping charges updated successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error updating shipping charges:', error);
        return NextResponse.json(
            { error: `Failed to update shipping charges: ${error.message}` },
            { status: 500 }
        );
    }
}