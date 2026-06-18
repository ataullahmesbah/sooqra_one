// src/components/analytics/DynamicGTM.tsx
// ✅ Server Component — reads tracking settings at request time.
// GTM loads GA4 and Microsoft Clarity inside it (no separate tags needed).
import dbConnect from '@/src/lib/dbConnect';
import TrackingSettings from '@/src/models/TrackingSettings';
import { GoogleTagManager } from '@next/third-parties/google';


const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

async function getGtmEnabled(): Promise<boolean> {
    try {
        await dbConnect();
        const settings = await TrackingSettings.findOne({}).lean();
        return settings?.gtmEnabled ?? true;
    } catch {
        return true; // fail open
    }
}

export default async function DynamicGTM() {
    if (!GTM_ID) return null;

    const enabled = await getGtmEnabled();
    if (!enabled) return null;

    return <GoogleTagManager gtmId={GTM_ID} />;
}