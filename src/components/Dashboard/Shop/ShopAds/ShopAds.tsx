// src/components/ShopAds.tsx
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface NavAd {
    _id: string;
    shopName: string;
    adText: string;
    couponCode?: string;
    buttonText: string;
    buttonLink?: string;
    backgroundColor: string;
    textColor: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    impressions: number;
    clicks: number;
}

interface ApiResponse {
    success: boolean;
    data: NavAd[];
}

export default function ShopAds() {
    const [navAds, setNavAds] = useState<NavAd[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchNavAds();

        // Cleanup on unmount
        return () => {
            if (autoSlideRef.current) {
                clearInterval(autoSlideRef.current);
            }
        };
    }, []);

    const fetchNavAds = async (): Promise<void> => {
        try {
            const res = await fetch('/api/products/nav-ads');
            const responseData: ApiResponse = await res.json();

            if (responseData.data && responseData.data.length > 0) {
                setNavAds(responseData.data);
                setIsVisible(true);
                trackImpression(responseData.data[0]._id);

                // Start auto slide if multiple ads
                if (responseData.data.length > 1) {
                    startAutoSlide();
                }
            }
        } catch (error) {
            console.error('Error fetching nav ads:', error);
        }
    };

    const startAutoSlide = (): void => {
        // Clear existing interval if any
        if (autoSlideRef.current) {
            clearInterval(autoSlideRef.current);
        }

        // Change ad every 10 seconds
        autoSlideRef.current = setInterval(() => {
            nextSlide();
        }, 10000);
    };

    const nextSlide = useCallback((): void => {
        if (navAds.length === 0) return;

        const nextIndex = (currentIndex + 1) % navAds.length;
        setCurrentIndex(nextIndex);
        trackImpression(navAds[nextIndex]._id);
    }, [navAds, currentIndex]);

    const prevSlide = useCallback((): void => {
        if (navAds.length === 0) return;

        const prevIndex = (currentIndex - 1 + navAds.length) % navAds.length;
        setCurrentIndex(prevIndex);
        trackImpression(navAds[prevIndex]._id);
    }, [navAds, currentIndex]);

    const trackImpression = async (adId: string): Promise<void> => {
        try {
            await fetch('/api/products/nav-ads/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adId, type: 'impression' }),
            });
        } catch (error) {
            console.error('Error tracking impression:', error);
        }
    };

    const trackClick = async (adId: string): Promise<void> => {
        try {
            await fetch('/api/products/nav-ads/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adId, type: 'click' }),
            });
        } catch (error) {
            console.error('Error tracking click:', error);
        }
    };

    const copyCouponCode = async (): Promise<void> => {
        const currentAd = navAds[currentIndex];
        if (currentAd?.couponCode) {
            try {
                await navigator.clipboard.writeText(currentAd.couponCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error('Failed to copy:', error);
            }
        }
    };

    const closeAd = (): void => {
        setIsVisible(false);
        if (autoSlideRef.current) {
            clearInterval(autoSlideRef.current);
        }
        setTimeout(() => {
            setNavAds([]);
            setCurrentIndex(0);
        }, 300);
    };

    if (!navAds.length) return null;

    const currentAd = navAds[currentIndex];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`w-full ${currentAd.backgroundColor} ${currentAd.textColor} shadow-2xl border-b border-purple-700/50`}
                >
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-2 sm:py-3">
                            {/* Left Side - Shop Name */}
                            <div className="hidden sm:flex items-center flex-shrink-0">
                                <motion.span
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className="text-sm md:text-lg Poppins-regular font-bold px-4 py-2 md:px-5 bg-gradient-to-r from-purple-900/80 to-purple-700/80 rounded-xl shadow-xl text-white backdrop-blur-md border border-white/10 hover:bg-purple-800/90 transition-all duration-300"
                                >
                                    {currentAd.shopName}
                                </motion.span>
                            </div>

                            {/* Middle - Ad Text & Coupon Code */}
                            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-3 md:space-x-4 mx-2 sm:mx-4 md:mx-8 min-h-[40px] sm:min-h-0">
                                {/* Ad Text */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xs sm:text-sm font-medium text-center line-clamp-2 sm:line-clamp-1"
                                >
                                    {currentAd.adText}
                                </motion.p>

                                {/* Coupon Code with Copy Functionality */}
                                {currentAd.couponCode && (
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-center space-x-1 sm:space-x-2 bg-yellow-500 text-black px-2 py-1 rounded-full cursor-pointer hover:bg-yellow-400 transition-colors flex-shrink-0"
                                        onClick={copyCouponCode}
                                    >
                                        <span className="text-xs font-bold whitespace-nowrap">{currentAd.couponCode}</span>
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            {copied ? (
                                                <span className="text-xs text-green-600 whitespace-nowrap">✓ Copied!</span>
                                            ) : (
                                                <Copy size={12} className="sm:w-3 sm:h-3" />
                                            )}
                                        </motion.div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Right Side - Button, Navigation & Close */}
                            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
                                {/* Navigation for Multiple Ads */}
                                {navAds.length > 1 && (
                                    <div className="hidden sm:flex items-center space-x-1">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={prevSlide}
                                            className="p-1 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
                                            aria-label="Previous ad"
                                        >
                                            <ChevronLeft size={14} className="sm:w-3 sm:h-3" />
                                        </motion.button>

                                        <span className="text-xs text-white/70 px-1">
                                            {currentIndex + 1}/{navAds.length}
                                        </span>

                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={nextSlide}
                                            className="p-1 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
                                            aria-label="Next ad"
                                        >
                                            <ChevronRight size={14} className="sm:w-3 sm:h-3" />
                                        </motion.button>
                                    </div>
                                )}

                                {/* Button - Show only if buttonLink exists */}
                                {currentAd.buttonLink && currentAd.buttonLink.trim() !== '' && (
                                    <motion.a
                                        href={currentAd.buttonLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackClick(currentAd._id)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center space-x-1 bg-white text-purple-900 px-2 sm:px-3 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-100 transition-colors shadow-lg whitespace-nowrap"
                                    >
                                        <span>{currentAd.buttonText || 'Shop Now'}</span>
                                        <ExternalLink size={12} className="sm:w-3 sm:h-3" />
                                    </motion.a>
                                )}

                                {/* Close Button */}
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={closeAd}
                                    className="p-1 sm:p-1.5 bg-white/10 hover:bg-red-500/90 rounded-full transition-all duration-200 flex-shrink-0"
                                    aria-label="Close ad"
                                >
                                    <X size={14} className="sm:w-4 sm:h-4 text-white" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Mobile Navigation Dots */}
                        {navAds.length > 1 && (
                            <div className="sm:hidden flex justify-center space-x-1 pb-2">
                                {navAds.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setCurrentIndex(index);
                                            trackImpression(navAds[index]._id);
                                        }}
                                        className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentIndex ? 'bg-white' : 'bg-white/30'
                                            }`}
                                        aria-label={`Go to ad ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Auto Slide Progress Bar */}
                    {navAds.length > 1 && (
                        <div className="w-full h-0.5 bg-gray-600/50">
                            <motion.div
                                key={currentIndex}
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{
                                    duration: 10,
                                    ease: "linear"
                                }}
                                onAnimationComplete={() => {
                                    if (navAds.length > 1) {
                                        nextSlide();
                                    }
                                }}
                            />
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}