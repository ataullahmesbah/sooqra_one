// src/app/api/admin/tracking-settings/route.ts


import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import TrackingSettings from '@/src/models/TrackingSettings';

// ── GET — fetch current settings ─────────────────────────────────────────────
export async function GET() {
    try {
        await dbConnect();

        // findOne or create default
        let settings = await TrackingSettings.findOne({});
        if (!settings) {
            settings = await TrackingSettings.create({
                pixelEnabled: true,
                capiEnabled: true,
                gtmEnabled: true,
            });
        }

        return NextResponse.json({
            pixelEnabled: settings.pixelEnabled,
            capiEnabled: settings.capiEnabled,
            gtmEnabled: settings.gtmEnabled,
            updatedAt: settings.updatedAt,
        });
    } catch (error) {
        console.error('GET tracking settings error:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// ── PATCH — update one or more toggles ───────────────────────────────────────
export async function PATCH(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const allowedFields = ['pixelEnabled', 'capiEnabled', 'gtmEnabled'];

        // Only allow known fields
        const update: Record<string, boolean> = {};
        for (const field of allowedFields) {
            if (typeof body[field] === 'boolean') {
                update[field] = body[field];
            }
        }

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
        }

        const settings = await TrackingSettings.findOneAndUpdate(
            {},
            { $set: update },
            { new: true, upsert: true }
        );

        return NextResponse.json({
            success: true,
            pixelEnabled: settings.pixelEnabled,
            capiEnabled: settings.capiEnabled,
            gtmEnabled: settings.gtmEnabled,
            updatedAt: settings.updatedAt,
        });
    } catch (error) {
        console.error('PATCH tracking settings error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}