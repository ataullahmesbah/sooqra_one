// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://sooqraone.com';

    return {
        rules: {
            userAgent: '*', // সব সার্চ ইঞ্জিনের জন্য
            allow: '/',     // সম্পূর্ণ সাইট ক্রল করার অনুমতি
            disallow: [     // এই অংশগুলো ক্রল করা থেকে নিষিদ্ধ
                '/admin-dashboard/',  // অ্যাডমিন এলাকা
                '/moderator-dashboard/',  // অ্যাডমিন এলাকা
                '/user-dashboard/',  // অ্যাডমিন এলাকা
                '/account/',  // অ্যাডমিন এলাকা
                '/api/',              // API রুট
                '/checkout/',         // চেকআউট পেজ
                '/cart/',             // কার্ট পেজ (যাতে ডুপ্লিকেট কন্টেন্ট এড়ানো যায়)
                '/track/orders/',     // অর্ডার ট্র্যাকিং
                '/private/',          // যদি কোনো প্রাইভেট ফোল্ডার থাকে
                '/*?*',               // ইউআরএল প্যারামিটার (ফিল্টার, সার্চ) ক্রল না করতে
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}