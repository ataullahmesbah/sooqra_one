// app/api/otp/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import OTP from '@/src/models/OTP';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { phone, otp } = await request.json();

    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 11 && formattedPhone.startsWith('01')) {
      formattedPhone = `880${formattedPhone.slice(1)}`;
    }

    const otpRecord = await OTP.findOne({
      phone: formattedPhone,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: 'OTP expired or not found' },
        { status: 400 }
      );
    }

    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Request new OTP.' },
        { status: 400 }
      );
    }

    if (otpRecord.otp === otp) {
      otpRecord.verified = true;
      await otpRecord.save();

      return NextResponse.json({
        success: true,
        message: 'Phone verified successfully'
      });
    }

    otpRecord.attempts += 1;
    await otpRecord.save();

    const remaining = 3 - otpRecord.attempts;
    return NextResponse.json(
      { success: false, message: `Invalid OTP. ${remaining} attempt${remaining > 1 ? 's' : ''} left.` },
      { status: 400 }
    );

  } catch (error) {
    console.error('OTP Verify Error:', error);
    return NextResponse.json(
      { success: false, message: 'Verification failed' },
      { status: 500 }
    );
  }
}