// src/app/api/users/change-password/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/src/lib/dbConnect';
import User from '@/src/models/User';
import { authOptions } from '../../auth/[...nextauth]/route';

// Password validation function
const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one special character (@, #, $, etc.)' };
    }
    return { isValid: true };
};

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { oldPassword, newPassword } = await request.json();

        if (!oldPassword || !newPassword) {
            return NextResponse.json({ error: 'Old and new password are required' }, { status: 400 });
        }

        // ✅ Validate new password with all rules
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return NextResponse.json({ error: passwordValidation.message }, { status: 400 });
        }

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify old password
        const isValid = await user.comparePassword(oldPassword);
        if (!isValid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        }

        // Check if new password is same as old password
        const isSamePassword = await user.comparePassword(newPassword);
        if (isSamePassword) {
            return NextResponse.json({ error: 'New password must be different from current password' }, { status: 400 });
        }

        // Update password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        return NextResponse.json({ message: 'Password changed successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}