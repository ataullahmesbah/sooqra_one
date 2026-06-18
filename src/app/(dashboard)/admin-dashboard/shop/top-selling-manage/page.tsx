'use client';

import dynamic from 'next/dynamic';

const TopSellingManager = dynamic(
    () => import('@/src/components/Dashboard/TopSellingManager/TopSellingManager'),
    { ssr: false }
);

export default function TopSellingManagePage() {
    return <TopSellingManager />;
}