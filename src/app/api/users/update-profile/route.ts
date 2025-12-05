// src/app/api/users/update-profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/src/lib/dbConnect';
import User from '@/src/models/User';
import { authOptions } from '../../auth/[...nextauth]/route';




export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();
        const { name, phone } = body;

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Phone ke properly clean koro
        const cleanedPhone = phone ? phone.trim() : null;

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            {
                name: name.trim(),
                phone: cleanedPhone, // <-- Ei khane null dileo thik ache
            },
            { new: true, runValidators: true } // runValidators must!
        ).select('-password');

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: updatedUser }, { status: 200 });
    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 });
    }
}