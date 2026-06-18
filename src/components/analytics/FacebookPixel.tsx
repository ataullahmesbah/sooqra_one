// src/components/analytics/FacebookPixel.tsx


'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default function FacebookPixel() {
    const pathname = usePathname();
    const [pixelEnabled, setPixelEnabled] = useState<boolean | null>(null); // null = loading

    // ✅ Fetch from DB once on mount
    useEffect(() => {
        fetch('/api/tracking-config')
            .then(r => r.json())
            .then(data => setPixelEnabled(data.pixelEnabled ?? true))
            .catch(() => setPixelEnabled(true)); // fail open
    }, []);

    // Track PageView on route change (only if pixel loaded)
    useEffect(() => {
        if (pixelEnabled && typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'PageView');
        }
    }, [pathname, pixelEnabled]);

    // Not ready yet or disabled
    if (!FB_PIXEL_ID || pixelEnabled === false) return null;
    if (pixelEnabled === null) return null; // still loading — don't inject yet

    return (
        <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
                __html: `
                    !function(f,b,e,v,n,t,s){
                        if(f.fbq)return;
                        n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;
                        n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)
                    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${FB_PIXEL_ID}');
                    fbq('track', 'PageView');
                `,
            }}
        />
    );
}