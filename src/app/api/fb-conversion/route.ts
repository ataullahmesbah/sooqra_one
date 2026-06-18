// src/app/api/fb-conversion/route.ts


import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import dbConnect from '@/src/lib/dbConnect';
import TrackingSettings from '@/src/models/TrackingSettings';

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

// ── SHA-256 hash helper (Facebook requires this for PII) ─────────────────────
function sha256(value: string): string {
    return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export async function POST(request: NextRequest) {
    try {
        // ✅ Check DB — if CAPI is disabled, skip silently
        await dbConnect();
        const settings = await TrackingSettings.findOne({}).lean();
        if (settings && settings.capiEnabled === false) {
            return NextResponse.json({ success: true, skipped: true, reason: 'CAPI disabled' });
        }

        const body = await request.json();
        const { eventName, eventData, userData } = body;

        if (!FB_PIXEL_ID || !FB_ACCESS_TOKEN) {
            console.error('Missing Facebook Pixel/CAPI configuration');
            return NextResponse.json({ success: false, error: 'Missing configuration' }, { status: 500 });
        }

        // ── User signals ──────────────────────────────────────────────────────
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
            || request.headers.get('x-real-ip')
            || '';
        const userAgent = request.headers.get('user-agent') || '';
        const fbc = request.cookies.get('_fbc')?.value || '';
        const fbp = request.cookies.get('_fbp')?.value || '';
        const referer = request.headers.get('referer') || '';

        // ── Event deduplication ID ────────────────────────────────────────────
        const eventId = `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        // ── Payload ───────────────────────────────────────────────────────────
        const payload = {
            data: [{
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: eventId,           // dedup with browser pixel
                action_source: 'website',
                event_source_url: referer,
                user_data: {
                    client_ip_address: ip,
                    client_user_agent: userAgent,
                    ...(fbc && { fbc }),
                    ...(fbp && { fbp }),
                    // ✅ Properly SHA-256 hashed PII
                    ...(userData?.email && { em: [sha256(userData.email)] }),
                    ...(userData?.phone && { ph: [sha256(userData.phone.replace(/\D/g, ''))] }),
                    ...(userData?.firstName && { fn: [sha256(userData.firstName)] }),
                    ...(userData?.lastName && { ln: [sha256(userData.lastName)] }),
                },
                custom_data: {
                    ...eventData,
                    currency: eventData?.currency || 'BDT',
                },
            }],
            // test_event_code: 'TEST12345', // ← uncomment for Facebook Event Manager testing
        };

        // ── Send to Facebook Graph API ────────────────────────────────────────
        const fbRes = await fetch(
            `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }
        );

        const result = await fbRes.json();

        if (!fbRes.ok) {
            console.error('Facebook CAPI Error:', JSON.stringify(result));
            return NextResponse.json({ success: false, error: result }, { status: fbRes.status });
        }

        return NextResponse.json({ success: true, eventId, data: result });
    } catch (error) {
        console.error('CAPI route error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}