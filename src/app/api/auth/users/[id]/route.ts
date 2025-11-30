import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/src/lib/dbConnect';
import User from '@/src/models/User';
import { authOptions } from '../../[...nextauth]/route';


interface Params {
    params: {
        id: string;
    };
}

// Update user (admin only)
export async function PATCH(request: Request, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { isActive, role } = await request.json();

        const user = await User.findById(params.id);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Prevent admin from modifying their own status
        if (user._id.toString() === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot modify your own account' },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (typeof isActive === 'boolean') updateData.isActive = isActive;
        if (role) updateData.role = role;

        const updatedUser = await User.findByIdAndUpdate(
            params.id,
            updateData,
            { new: true }
        ).select('-password');

        return NextResponse.json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error: any) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Delete user (admin only)
export async function DELETE(request: Request, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const user = await User.findById(params.id);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Prevent admin from deleting their own account
        if (user._id.toString() === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        await User.findByIdAndDelete(params.id);

        return NextResponse.json({
            message: 'User deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}