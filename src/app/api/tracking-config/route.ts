// src/app/api/tracking-config/route.ts
// Public endpoint — client components fetch this to know what's enabled.
// Cache-Control: 60s so it's fast but updates within a minute.


import dbConnect from '@/src/lib/dbConnect';
import TrackingSettings from '@/src/models/TrackingSettings';
import { NextResponse } from 'next/server';


export async function GET() {
    try {
        await dbConnect();
        const settings = await TrackingSettings.findOne({}).lean();

        const config = {
            pixelEnabled: settings?.pixelEnabled ?? true,
            capiEnabled: settings?.capiEnabled ?? true,
            gtmEnabled: settings?.gtmEnabled ?? true,
        };

        return NextResponse.json(config, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            },
        });
    } catch {
        // On error, default to all enabled (fail open)
        return NextResponse.json(
            { pixelEnabled: true, capiEnabled: true, gtmEnabled: true },
            { status: 200 }
        );
    }
}