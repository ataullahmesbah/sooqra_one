// src/components/common/PromotionalBanner.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Marquee from 'react-fast-marquee';
import { X } from 'lucide-react';

interface PromotionalData {
    isActive: boolean;
    text: string;
    emoji: string;
    backgroundColor: string;
    textColor: string;
}

interface PromotionalBannerProps {
    onClose?: () => void;
    showCloseButton?: boolean;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
    onClose,
    showCloseButton = true
}) => {
    const [promoData, setPromoData] = useState<PromotionalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        fetchPromotionalData();
    }, []);

    const fetchPromotionalData = async () => {
        try {
            const response = await fetch('/api/promotional');
            const result = await response.json();

            if (result.success && result.data) {
                setPromoData(result.data);
            }
        } catch (error) {
            console.error('Error fetching promotional banner:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('promotionalBannerClosed', 'true');
        localStorage.setItem('promotionalBannerClosedAt', new Date().toISOString());

        if (onClose) {
            onClose();
        }
    };

    const shouldShowBanner = () => {
        const isClosed = localStorage.getItem('promotionalBannerClosed');
        const closedAt = localStorage.getItem('promotionalBannerClosedAt');

        if (!isClosed) return true;

        if (closedAt) {
            const closedDate = new Date(closedAt);
            const now = new Date();
            const hoursDiff = (now.getTime() - closedDate.getTime()) / (1000 * 60 * 60);

            if (hoursDiff > 24) {
                localStorage.removeItem('promotionalBannerClosed');
                localStorage.removeItem('promotionalBannerClosedAt');
                return true;
            }
        }

        return false;
    };

    if (loading) {
        return <div className="h-12 bg-gray-100 animate-pulse"></div>;
    }

    if (!promoData || !promoData.isActive || !isVisible || !shouldShowBanner()) {
        return null;
    }

    // Create duplicate text for seamless loop (no gap)
    const duplicateText = `${promoData.text} • ${promoData.text} • ${promoData.text} • ${promoData.text}`;

    return (
        <div
            className="relative w-full overflow-hidden shadow-md"
            style={{
                backgroundColor: promoData.backgroundColor,
                color: promoData.textColor,
                minHeight: '48px'
            }}
        >
            <Marquee
                speed={70}
                delay={0}
                pauseOnHover={true}
                gradient={false}
                loop={0}
                className="py-3 sm:py-3.5 md:py-4"
                play={true}
            >
                <div className="flex items-center gap-4 mx-2 sm:mx-3 md:mx-4 whitespace-nowrap">
                    {/* Emoji - Larger */}
                    <span className="text-xl sm:text-2xl md:text-3xl flex-shrink-0">
                        {promoData.emoji}
                    </span>

                    {/* Text - Larger with bold */}
                    <span className="text-base sm:text-lg md:text-xl font-bold tracking-wide whitespace-nowrap">
                        {duplicateText}
                    </span>

                    {/* Emoji again - Larger */}
                    <span className="text-xl sm:text-2xl md:text-3xl flex-shrink-0">
                        {promoData.emoji}
                    </span>
                </div>
            </Marquee>

            {/* Close Button */}
            {showCloseButton && (
                <button
                    onClick={handleClose}
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 hover:opacity-80 transition-opacity rounded-full z-10 bg-black/10 hover:bg-black/20"
                    style={{ color: promoData.textColor }}
                    aria-label="Close promotion"
                >
                    <X size={18} className="sm:w-[20px] sm:h-[20px]" />
                </button>
            )}
        </div>
    );
};

export default PromotionalBanner;