import { NextResponse } from 'next/server';

import dbConnect from '@/src/lib/dbConnect';
import User from '@/src/models/User';
import PasswordReset from '@/src/models/PasswordReset';
import { generateToken } from '@/src/lib/auth';
// import { sendEmail } from '@/lib/email'; // Comment out for now

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal if user exists or not
            return NextResponse.json(
                { message: 'If the email exists, a reset link will be sent' },
                { status: 200 }
            );
        }

        // Generate reset token
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save reset token
        await PasswordReset.create({
            email: user.email,
            token,
            expiresAt,
        });

        // For development, log the token instead of sending email
        console.log('Password reset token for development:', token);
        console.log(`Reset URL: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`);

        // Uncomment when email is configured
        // await sendEmail({
        //   to: user.email,
        //   subject: 'Password Reset Request',
        //   html: `Click <a href="${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}">here</a> to reset your password. This link expires in 1 hour.`
        // });

        return NextResponse.json(
            { message: 'If the email exists, a reset link will be sent' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}