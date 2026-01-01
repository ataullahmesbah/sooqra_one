// app/api/otp/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import OTP from '@/src/models/OTP';
import { generateOTP } from '@/src/lib/otp-utils';
import { sendOTPSMS, isValidBangladeshiPhone, formatPhoneForSMS } from '@/src/lib/sms-utils';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { phone } = await request.json();

    if (!phone || !isValidBangladeshiPhone(phone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Bangladeshi phone number' },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneForSMS(phone);

    // Check existing unexpired OTP
    const existingOTP = await OTP.findOne({ 
      phone: formattedPhone,
      expiresAt: { $gt: new Date() }
    });

    let otpCode: string;

    if (existingOTP) {
      otpCode = existingOTP.otp;
    } else {
      otpCode = generateOTP(5);
      
      await OTP.deleteMany({ phone: formattedPhone });
      
      await OTP.create({
        phone: formattedPhone,
        otp: otpCode,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
        verified: false,
        attempts: 0
      });
    }

    const smsResult = await sendOTPSMS(phone, otpCode);

    if (smsResult.success) {
      // Production-এ OTP code log করব না
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
      });
    }

    return NextResponse.json(
      { success: false, message: smsResult.message || 'Failed to send OTP' },
      { status: 500 }
    );

  } catch (error) {
    console.error('OTP Send Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}