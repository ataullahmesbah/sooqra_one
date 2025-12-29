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

        // Format phone number
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length === 11 && formattedPhone.startsWith('01')) {
            formattedPhone = `880${formattedPhone.slice(1)}`;
        } else if (!formattedPhone.startsWith('880')) {
            return NextResponse.json(
                { success: false, message: 'Invalid phone number' },
                { status: 400 }
            );
        }

        // Check if OTP already exists and not expired
        const existingOTP = await OTP.findOne({
            phone: formattedPhone,
            expiresAt: { $gt: new Date() }
        });

        let otpCode: string;

        if (existingOTP) {
            // Use existing OTP if not expired
            otpCode = existingOTP.otp;
        } else {
            // Generate new 5-digit OTP
            otpCode = generateOTP(5);

            // Delete any existing OTPs for this phone
            await OTP.deleteMany({ phone: formattedPhone });

            // Create new OTP with 2 minutes expiry
            const expiryTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

            await OTP.create({
                phone: formattedPhone,
                otp: otpCode,
                expiresAt: expiryTime,
                verified: false,
                attempts: 0
            });
        }

        // Prepare SMS content
        const message = `Your OTP is: ${otpCode}. Valid for 2 minutes. - SOOQRA`;

        // Send SMS via Bulk SMS BD
        const apiKey = process.env.NEXT_PUBLIC_BULK_SMS_BD_API_KEY;
        const senderId = process.env.NEXT_PUBLIC_BULK_SMS_BD_SENDER_ID;

        if (!apiKey || !senderId) {
            return NextResponse.json(
                { success: false, message: 'SMS service not configured' },
                { status: 500 }
            );
        }

        // Send SMS
        const smsResponse = await axios.post(
            'https://bulksmsbd.net/api/smsapi',
            null,
            {
                params: {
                    api_key: apiKey,
                    senderid: senderId,
                    number: formattedPhone,
                    message: message,
                },
            }
        );

        if (smsResponse.data.response_code === 202) {
            console.log(`OTP sent to ${formattedPhone}: ${otpCode}`);
            return NextResponse.json({
                success: true,
                message: 'OTP sent successfully',
                // Development এর জন্য OTP না দেখানো better
            });
        } else {
            throw new Error(smsResponse.data.error_message || 'Failed to send SMS');
        }
    } catch (error: any) {
        console.error('Error sending OTP:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.response?.data?.error_message || error.message || 'Failed to send OTP',
            },
            { status: 500 }
        );
    }
}