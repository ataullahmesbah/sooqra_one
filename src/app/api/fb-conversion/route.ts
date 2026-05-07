// src/app/api/fb-conversion/route.ts
import { NextRequest, NextResponse } from 'next/server';

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventName, eventData, userData } = body;

        if (!FB_PIXEL_ID || !FB_ACCESS_TOKEN) {
            console.error('Missing Facebook Pixel configuration');
            return NextResponse.json({ success: false, error: 'Missing configuration' }, { status: 500 });
        }

        // Get user IP and user agent
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
        const userAgent = request.headers.get('user-agent') || '';

        // Get cookies
        const fbc = request.cookies.get('_fbc')?.value || '';
        const fbp = request.cookies.get('_fbp')?.value || '';

        // Prepare payload
        const payload = {
            data: [{
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                action_source: 'website',
                event_source_url: request.headers.get('referer') || '',
                user_data: {
                    client_ip_address: ip,
                    client_user_agent: userAgent,
                    fbc: fbc,
                    fbp: fbp,
                    ...(userData?.email && { em: [Buffer.from(userData.email.toLowerCase()).toString('hex')] }),
                    ...(userData?.phone && { ph: [Buffer.from(userData.phone).toString('hex')] }),
                },
                custom_data: {
                    ...eventData,
                    currency: eventData?.currency || 'BDT',
                },
            }]
        };

        // Send to Facebook
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error('Facebook API Error:', result);
            return NextResponse.json({ success: false, error: result }, { status: response.status });
        }

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Conversion API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}