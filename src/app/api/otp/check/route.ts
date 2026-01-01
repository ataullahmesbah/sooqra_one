//app/api/otp/check/route.ts

import dbConnect from '@/src/lib/dbConnect';
import OTP from '@/src/models/OTP';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { phone } = await request.json();

        // Format phone number
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length === 11 && formattedPhone.startsWith('01')) {
            formattedPhone = `880${formattedPhone.slice(1)}`;
        }

        // Check if phone is verified
        const verifiedOTP = await OTP.findOne({
            phone: formattedPhone,
            verified: true,
            expiresAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within 24 hours
        });

        return NextResponse.json({
            success: true,
            verified: !!verifiedOTP,
            verifiedAt: verifiedOTP?.expiresAt || null
        });
    } catch (error) {
        console.error('Error checking OTP:', error);
        return NextResponse.json(
            { success: false, verified: false },
            { status: 500 }
        );
    }
}