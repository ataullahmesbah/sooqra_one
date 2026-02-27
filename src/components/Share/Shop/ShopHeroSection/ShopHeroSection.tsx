'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from "next/image";

interface SlideFeature {
    icon: string;
    text: string;
}

interface Slide {
    title?: string;
    subtitle?: string;
    highlights?: string[];
    cta?: string;
    bg?: string;
    textColor?: string;
    badgeColor?: string;
    features?: SlideFeature[];
    image: string;
    link?: string;
}

interface BannerResponse {
    success: boolean;
    data: Slide[];
}

const ShopHeroSection = () => {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await fetch('/api/products/shop-banner', {
                    headers: { 'Cache-Control': 'max-age=3600, stale-while-revalidate' }
                });

                if (!response.ok) throw new Error('Failed to fetch banners');

                const data: BannerResponse = await response.json();

                if (data.success && data.data?.length > 0) {
                    const formatted = data.data.map(slide => ({
                        ...slide,
                        image: slide.image || "/default-banner.jpg",
                    }));
                    setSlides(formatted);
                } else {
                    setSlides([getMinimalFallback()]);
                }
            } catch (error) {
                console.error("Error fetching banners:", error);
                setSlides([getMinimalFallback()]);
            }
        };

        fetchSlides();
        const interval = setInterval(fetchSlides, 3600 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (slides.length <= 1 || isPaused) return;

        const timer = setTimeout(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentSlide(prev => (prev + 1) % slides.length);
                setFade(true);
            }, 300);
        }, 6000);

        return () => clearTimeout(timer);
    }, [slides.length, currentSlide, isPaused]);

    const nextSlide = useCallback(() => {
        setFade(false);
        setTimeout(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
            setFade(true);
        }, 300);
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        setFade(false);
        setTimeout(() => {
            setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
            setFade(true);
        }, 300);
    }, [slides.length]);

    // Dots remove করার কারণে goToSlide function-ও আর দরকার নেই, কিন্তু রাখলাম যদি পরে লাগে
    // const goToSlide = (index: number) => { ... }

    const getMinimalFallback = (): Slide => ({
        image: "/default-banner.jpg",
    });

    if (slides.length === 0) return null;

    const current = slides[currentSlide];

    const hasTitle = !!current.title?.trim();
    const hasSubtitle = !!current.subtitle?.trim();
    const hasHighlights = Array.isArray(current.highlights) && current.highlights.length > 0;
    const hasFeatures = Array.isArray(current.features) && current.features.some(f => f.icon?.trim() || f.text?.trim());
    const hasCta = !!current.cta?.trim();
    const finalLink = current.link || "/shop";

    return (
        <div
            className="relative w-full aspect-[8/4] xs:aspect-[16/9] sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-[21/9] xl:aspect-[24/9] overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="relative z-10 w-full h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: fade ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {/* Image & Overlay */}
                        <div className="absolute inset-0">
                            <div className="relative w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
                                <Image
                                    src={current.image}
                                    alt={current.title || "Shop Banner"}
                                    fill
                                    priority
                                    sizes="100vw"
                                    className="object-contain object-center xs:object-contain sm:object-cover brightness-[0.96] md:brightness-[0.92] transition-all duration-500"
                                    quality={92}
                                    onError={e => (e.target as HTMLImageElement).src = "/default-banner.jpg"}
                                />
                            </div>

                            <div className="absolute inset-0 hidden sm:block">
                                <div className={`absolute inset-0 ${current.bg || 'bg-gradient-to-br from-gray-900/35 via-purple-900/20 to-gray-900/35'} mix-blend-multiply`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                            </div>
                        </div>

                        {/* Content */}
                          <div className="absolute inset-0 flex items-center justify-center lg:justify-start p-2 sm:pb-10 md:pb-12 lg:pb-0">
                            <div className="relative z-30 w-full max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-6 md:py-8 lg:py-10">
                                <div className="flex flex-col items-center lg:items-start gap-3 sm:gap-4 md:gap-5 lg:gap-6 max-w-full">
                                    <div className="w-full lg:w-3/5 xl:w-1/2 space-y- sm:space-y-3 md:space-y-4 lg:space-y-5 text-center lg:text-left overflow-hidden">
                                        {/* Highlights */}
                                        {hasHighlights && (
                                            <motion.div
                                                initial={{ y: -15, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.25, duration: 0.4 }}
                                                className="flex flex-wrap justify-center lg:justify-start gap-1.5 xs:gap-2 sm:gap-2.5"
                                            >
                                                {current.highlights!.map((highlight, i) => (
                                                    <div
                                                        key={i}
                                                        className={`inline-flex items-center bg-gradient-to-r ${current.badgeColor || 'from-purple-500 to-pink-500'} text-white px-2 py-0.5 xs:px-2.5 xs:py-0.75 rounded-full text-[9px] xs:text-[10px] sm:text-xs md:text-xs lg:text-sm font-medium shadow-sm truncate max-w-[140px] xs:max-w-[180px] sm:max-w-[220px] md:max-w-none`}
                                                    >
                                                        {highlight}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}

                                        {/* Title */}
                                        {hasTitle && (
                                            <motion.h1
                                                initial={{ y: 25, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.35, duration: 0.7 }}
                                                className={`text-sm xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold ${current.textColor || 'text-white'} leading-tight drop-shadow-xl line-clamp-3 sm:line-clamp-2 md:line-clamp-none`}
                                            >
                                                {current.title}
                                            </motion.h1>
                                        )}

                                        {/* Subtitle */}
                                        {hasSubtitle && (
                                            <motion.p
                                                initial={{ y: 25, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.45, duration: 0.7 }}
                                                className={`text-[9px] xs:text-xs sm:text-sm md:text-base lg:text-lg ${current.textColor || 'text-white'}/90 leading-relaxed drop-shadow-md line-clamp-4 sm:line-clamp-3 md:line-clamp-none max-w-[92%] xs:max-w-[88%] sm:max-w-[80%] mx-auto lg:mx-0`}
                                            >
                                                {current.subtitle}
                                            </motion.p>
                                        )}

                                        {/* Features */}
                                        {hasFeatures && (
                                            <motion.div
                                                initial={{ y: 25, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.55, duration: 0.7 }}
                                                className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 md:gap-4 text-white/90"
                                            >
                                                {current.features!.map((f, i) => (
                                                    <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-[9px] xs:text-xs sm:text-sm md:text-base truncate max-w-[140px] xs:max-w-[180px]">
                                                        <span className="text-base sm:text-lg md:text-xl drop-shadow-md">{f.icon}</span>
                                                        <span className="font-medium drop-shadow-md truncate">{f.text}</span>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}

                                        {/* CTA Button */}
                                        {hasCta && (
                                            <motion.div
                                                initial={{ y: 25, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.75, duration: 0.7 }}
                                                className="pt-2 sm:pt-3 md:pt-4 lg:pt-6"
                                            >
                                                <Link href={finalLink} className="inline-block">
                                                    <button
                                                        className={`
                                    px-2 py-1 xs:px-5 xs:py-2 sm:px-6 sm:py-2.5 rounded-lg font-semibold 
                                    text-xs xs:text-sm sm:text-base md:text-lg
                                    bg-gradient-to-r from-black to-gray-900 text-white
                                    border border-purple-500/40 shadow-md hover:shadow-purple-500/50
                                    transform hover:scale-105 transition-all duration-300
                                    max-w-[160px] xs:max-w-[200px] sm:max-w-none truncate
                                `}
                                                    >
                                                        {current.cta}
                                                    </button>
                                                </Link>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Right side balance */}
                                    <div className="hidden lg:block lg:w-2/5 xl:w-1/2" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Dots + arrows – শুধু arrows রাখলাম (dots মুছে ফেললাম) */}
                {slides.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-2 xs:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-30 transition backdrop-blur-sm"
                            aria-label="Previous"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-2 xs:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-30 transition backdrop-blur-sm"
                            aria-label="Next"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        
                    </>
                )}
            </div>
        </div>
    );
};

export default ShopHeroSection;