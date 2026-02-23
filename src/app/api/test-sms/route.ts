import { NextRequest, NextResponse } from 'next/server';
import { sendOTPSMS, formatPhoneForSMS } from '@/src/lib/sms-utils';

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Phone number required' },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneForSMS(phone);
   

    // Test with custom message or default OTP
    const testMessage = message || `Test SMS from SOOQRA - ${new Date().toLocaleString()}`;
    const testOTP = '12345';
    
    const smsResult = await sendOTPSMS(phone, testOTP);

    return NextResponse.json({
      success: smsResult.success,
      message: smsResult.message,
      error: smsResult.error,
      formattedPhone,
      timestamp: new Date().toISOString(),
      gatewayResponse: smsResult
    });

  } catch (error: any) {
    console.error('SMS Test Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Test failed', 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}