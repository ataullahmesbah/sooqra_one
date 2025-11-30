import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/src/lib/dbConnect';
import User from '@/src/models/User';
import PasswordReset from '@/src/models/PasswordReset';
import { validatePassword } from '@/src/lib/auth';
import { authOptions } from '../[...nextauth]/route';


export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { currentPassword, newPassword, token } = await request.json();

        let user;

        if (token) {
            // Password reset flow
            const resetRecord = await PasswordReset.findOne({
                token,
                used: false,
                expiresAt: { $gt: new Date() }
            });

            if (!resetRecord) {
                return NextResponse.json(
                    { error: 'Invalid or expired reset token' },
                    { status: 400 }
                );
            }

            user = await User.findOne({ email: resetRecord.email });
            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            // Mark token as used
            resetRecord.used = true;
            await resetRecord.save();
        } else {
            // Change password flow (requires current password)
            if (!currentPassword) {
                return NextResponse.json(
                    { error: 'Current password is required' },
                    { status: 400 }
                );
            }

            user = await User.findById(session.user.id);
            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 400 }
                );
            }
        }

        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { error: passwordValidation.message },
                { status: 400 }
            );
        }

        // Update password
        user.password = newPassword;
        await user.save();

        return NextResponse.json(
            { message: 'Password updated successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}