import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { generateOTP } from '@/src/lib/otp-utils';
import dbConnect from '@/src/lib/dbConnect';
import OTP from '@/src/models/OTP';


export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { phone } = await request.json();

        // Validate phone number
        if (!phone || !/^(?:\+88|88)?(01[3-9]\d{8})$/.test(phone)) {
            return NextResponse.json(
                { success: false, message: 'Invalid Bangladeshi phone number format' },
                { status: 400 }
            );
        }

        // Format phone number for SendMySMS (880XXXXXXXXXX)
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length === 11 && formattedPhone.startsWith('01')) {
            formattedPhone = `880${formattedPhone.slice(1)}`;
        } else if (!formattedPhone.startsWith('880')) {
            return NextResponse.json(
                { success: false, message: 'Invalid phone number' },
                { status: 400 }
            );
        }

        // Generate 5-digit OTP
        const otpCode = generateOTP(5);
        const expiryTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

        // Delete existing OTPs and create new one
        await OTP.deleteMany({ phone: formattedPhone });
        await OTP.create({
            phone: formattedPhone,
            otp: otpCode,
            expiresAt: expiryTime,
            verified: false,
            attempts: 0
        });

        // Development mode check
        const isProduction = process.env.NODE_ENV === 'production';
        const disableSMS = process.env.DISABLE_SMS_SENDING === 'true';

        if (!isProduction || disableSMS) {
            // Development/Test mode - just log
            console.log(`[DEV SMS] OTP for ${formattedPhone}: ${otpCode}`);
            return NextResponse.json({
                success: true,
                message: 'OTP generated (dev mode)',
                devOtp: process.env.NODE_ENV === 'development' ? otpCode : undefined
            });
        }

        // Production - Send actual SMS via SendMySMS
        const apiKey = process.env.NEXT_PUBLIC_SENDMYSMS_API_KEY;
        const senderId = process.env.NEXT_PUBLIC_SENDMYSMS_SENDER_ID || 'SOOQRA';
        const apiUrl = process.env.NEXT_PUBLIC_SENDMYSMS_API_URL || 'https://sendmysms.net/api';

        if (!apiKey || !senderId) {
            return NextResponse.json(
                { success: false, message: 'SMS service not configured' },
                { status: 500 }
            );
        }

        // SendMySMS API request
        const message = `Your OTP is: ${otpCode}. Valid for 2 minutes. - ${senderId}`;

        try {
            // SendMySMS API call
            // Note: Check SendMySMS documentation for exact API format
            const smsResponse = await axios.post(apiUrl, {
                api_key: apiKey,
                sender_id: senderId,
                message: message,
                to: formattedPhone,
                // Add other required parameters as per SendMySMS docs
            });

            // Check SendMySMS response format
            if (smsResponse.data.success || smsResponse.data.status === 'success') {
                console.log(`OTP sent via SendMySMS to ${formattedPhone}`);
                return NextResponse.json({
                    success: true,
                    message: 'OTP sent successfully'
                });
            } else {
                throw new Error(smsResponse.data.message || 'Failed to send SMS');
            }
        } catch (smsError: any) {
            console.error('SendMySMS API error:', smsError.response?.data || smsError.message);
            throw new Error(smsError.response?.data?.message || 'Failed to send SMS via SendMySMS');
        }

    } catch (error: any) {
        console.error('Error sending OTP:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Failed to send OTP',
            },
            { status: 500 }
        );
    }
}