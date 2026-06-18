'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeroData {
    image: {
        url: string;
        alt: string;
    };
    link: {
        url: string;
        isActive: boolean;
    };
    isActive: boolean;
}

export default function ProductPromotion() {
    const [hero, setHero] = useState<HeroData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProductPromotion();
    }, []);

    const fetchProductPromotion = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/product-promotion');
            const data = await response.json();

            if (data.success && data.data) {
                setHero(data.data);
            }
        } catch (error) {
            console.error('Error fetching hero section:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className=" w-full h-[400px] animate-pulse flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    if (!hero || !hero.isActive) {
        return null;
    }

      const HeroContent = () => (
    <div className="px-2.5 sm:px-4 md:px-5">
        <div className="relative w-full aspect-[1920/600] rounded-lg sm:rounded-xl overflow-hidden">
            <Image
                src={hero.image.url}
                alt={hero.image.alt}
                fill
                className="object-cover"
                priority
                sizes="100vw"
                quality={90}
            />
        </div>
    </div>
);

    if (hero.link.isActive && hero.link.url) {
        return (
            <Link href={hero.link.url} className="block">
                <HeroContent />
            </Link>
        );
    }

    return <HeroContent />;
}