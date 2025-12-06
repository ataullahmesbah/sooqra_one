// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/src/lib/dbConnect';
import User from '@/src/models/User';
import { authOptions } from '../../auth/[...nextauth]/route';



export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { id } = await params;

    if (!id || id.length < 12) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    if (id === session.user.id) {
        return NextResponse.json({ error: "You can't modify your own role" }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const { role, isActive } = body;

    const updateData: any = {};
    if (role && ['admin', 'moderator', 'user'].includes(role)) {
        updateData.role = role;
    }
    if (typeof isActive === 'boolean') {
        updateData.isActive = isActive;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    }).select('-password');

    if (!updatedUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; 

    if (id === session.user.id) {
        return NextResponse.json({ error: "You can't delete yourself" }, { status: 403 });
    }

    await dbConnect();
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
}