'use client';
// src/components/Share/Shop/ShopHeroSection/ShopHeroSection.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Slide {
    _id: string;
    image: string;
    title?: string;
    subtitle?: string;
    offer?: string;
    ctaText?: string;
    ctaLink?: string;
    textPosition?: 'left' | 'center';
    isActive?: boolean;
}

const SLIDE_DURATION = 6000;

// ── Skeleton ───────────────────────────────────────────────────────────────────
function BannerSkeleton() {
    return (
        <div className="relative w-full" style={{ aspectRatio: '1920/800' }}>
            <div className="absolute inset-0 bg-gray-200 overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'banner-shimmer 1.4s ease-in-out infinite',
                    }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="h-3 sm:h-5 w-28 sm:w-48 bg-gray-300/70 rounded-full" />
                    <div className="h-2.5 sm:h-4 w-40 sm:w-64 bg-gray-300/50 rounded-full" />
                    <div className="h-7 sm:h-9 w-20 sm:w-28 bg-gray-300/60 rounded-lg mt-1" />
                </div>
            </div>
            <style>{`
                @keyframes banner-shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
            `}</style>
        </div>
    );
}

// ── Main ───────────────────────────────────────────────────────────────────────
const ShopHeroSection = () => {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const res = await fetch('/api/products/shop-banner');
                const data = await res.json();
                if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                    const active = data.data.filter((s: Slide) => s.isActive !== false);
                    setSlides(active.length > 0 ? active : data.data);
                }
            } catch (err) {
                console.error('Failed to fetch banners:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSlides();
    }, []);

    const goNext = useCallback(() => {
        setDirection(1);
        setCurrentIndex(prev => (prev + 1) % slides.length);
    }, [slides.length]);

    const goPrev = useCallback(() => {
        setDirection(-1);
        setCurrentIndex(prev => (prev === 0 ? slides.length - 1 : prev - 1));
    }, [slides.length]);

    const goTo = useCallback((i: number) => {
        setDirection(i > currentIndex ? 1 : -1);
        setCurrentIndex(i);
    }, [currentIndex]);

    useEffect(() => {
        if (slides.length <= 1 || isPaused) return;
        timerRef.current = setTimeout(goNext, SLIDE_DURATION);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [slides.length, currentIndex, isPaused, goNext]);

    if (loading) return <BannerSkeleton />;
    if (slides.length === 0) return null;

    const slide = slides[currentIndex];
    const hasText = !!(slide.title || slide.subtitle || slide.offer || slide.ctaText);
    const isCenter = slide.textPosition === 'center';
    const isImgLoaded = loadedImages.has(slide._id);

    const slideVariants = {
        enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
        center: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
        exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40, transition: { duration: 0.3 } }),
    };

    const textChild = {
        hidden: { opacity: 0, y: 12 },
        show: (i: number) => ({
            opacity: 1, y: 0,
            transition: { delay: 0.15 + i * 0.08, duration: 0.45, ease: 'easeOut' },
        }),
    };

    return (
        /*
         * ✅ aspect-ratio: 1920/600 সব screen-এ fix।
         * container সবসময় এই ratio-তে থাকবে।
         * Mobile-এ 360px wide হলে height = 360*(600/1920) = 112px।
         * Image fill + object-contain → পুরো 1920×600 image দেখা যাবে, crop হবে না।
         * Text absolute + overflow-hidden → container-এর বাইরে যাবে না।
         * Text mobile-এ শুধু offer badge + title দেখাবে (subtitle hidden)।
         */
        <div
            className="relative w-full overflow-hidden bg-gray-900"
            style={{
                /*
                 * ✅ 320–374px  → 1920/850  → height ~95px  — too short for text
                 * Solution: CSS clamp দিয়ে minimum height enforce করি
                 * aspect-ratio রেখে min-height দিলে image aspect maintain হয়
                 * object-contain আছে তাই image কোনো দিকেই crop হবে না
                 *
                 * 320px → natural h = 100px → clamp to 140px
                 * 375px → natural h = 117px → clamp to 140px
                 * 425px → natural h = 133px → fine, text fits
                 * 768px+ → natural h = 240px+ → perfect
                 */
                aspectRatio: '1920 / 600',
                minHeight: 'clamp(140px, 31.25vw, 9999px)',
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={slide._id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0"
                >
                    {/* Image placeholder while loading */}
                    {!isImgLoaded && (
                        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
                    )}

                    {/*
                     * ✅ object-contain — পুরো image দেখাবে, crop নেই।
                     * aspect ratio container match করায় image perfectly fit হবে।
                     * bg-gray-900 দেওয়া আছে যাতে letterbox দেখালে gray থাকে।
                     */}
                    <Image
                        src={slide.image}
                        alt={slide.title || 'Shop Banner'}
                        fill
                        priority={currentIndex === 0}
                        loading={currentIndex === 0 ? 'eager' : 'lazy'}
                        sizes="100vw"
                        quality={90}
                        className={`
                            object-contain object-center
                            transition-opacity duration-500
                            ${isImgLoaded ? 'opacity-100' : 'opacity-0'}
                        `}
                        onLoad={() =>
                            setLoadedImages(prev => new Set(prev).add(slide._id))
                        }
                    />

                    {/* Overlay — শুধু text থাকলে */}
                    {hasText && (
                        <div
                            className={`
                                absolute inset-0
                                ${isCenter
                                    ? 'bg-black/30'
                                    : 'bg-gradient-to-r from-black/55 via-black/25 to-transparent'
                                }
                            `}
                        />
                    )}

                    {/* ── Text block ─────────────────────────────────────────── */}
                    {hasText && (
                        <div className="absolute inset-0 flex items-center overflow-hidden">
                            <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 xl:px-14">
                                <div
                                    className={`
                                        flex flex-col
                                        ${isCenter ? 'items-center text-center' : 'items-start text-left'}
                                        gap-0.5 sm:gap-2 md:gap-3 lg:gap-4
                                        max-w-[80%] sm:max-w-xs md:max-w-sm lg:max-w-lg xl:max-w-xl
                                    `}
                                >
                                    {/* Offer badge */}
                                    {slide.offer && (
                                        <motion.div
                                            custom={0}
                                            variants={textChild}
                                            initial="hidden"
                                            animate="show"
                                        >
                                            <span className="
                                                inline-flex items-center bg-red-500 text-white
                                                font-semibold rounded-full shadow
                                                text-[7px] px-1 py-0.5
                                                xs:text-[8px] xs:px-1.5
                                                sm:text-[10px] sm:px-2 sm:py-0.5
                                                md:text-xs md:px-2.5 md:py-1
                                                lg:text-sm lg:px-3 lg:py-1.5
                                            ">
                                                🔥 {slide.offer}
                                            </span>
                                        </motion.div>
                                    )}

                                    {/* Title */}
                                    {slide.title && (
                                        <motion.h2
                                            custom={1}
                                            variants={textChild}
                                            initial="hidden"
                                            animate="show"
                                            className="
                                                text-white font-extrabold leading-tight
                                                drop-shadow-lg line-clamp-2
                                                text-[10px]
                                                xs:text-[12px]
                                                sm:text-base
                                                md:text-xl
                                                lg:text-3xl
                                                xl:text-4xl
                                            "
                                        >
                                            {slide.title}
                                        </motion.h2>
                                    )}

                                    {/* Subtitle — sm+ only */}
                                    {slide.subtitle && (
                                        <motion.p
                                            custom={2}
                                            variants={textChild}
                                            initial="hidden"
                                            animate="show"
                                            className="
                                                text-white/85 leading-relaxed drop-shadow
                                                line-clamp-2
                                                hidden
                                                sm:block sm:text-[10px]
                                                md:text-xs
                                                lg:text-sm
                                                xl:text-base
                                            "
                                        >
                                            {slide.subtitle}
                                        </motion.p>
                                    )}

                                    {/* CTA Button — with entrance animation */}
                                    {slide.ctaText && (
                                        <motion.div
                                            custom={3}
                                            variants={textChild}
                                            initial="hidden"
                                            animate="show"
                                        >
                                            <Link href={slide.ctaLink || '/shop'}>
                                                <motion.span
                                                    className="
                                                        inline-flex items-center gap-0.5 sm:gap-1.5
                                                        bg-white text-gray-900 font-bold
                                                        shadow-lg
                                                        transition-colors duration-200
                                                        text-[8px] px-1.5 py-0.5 rounded
                                                        xs:text-[9px] xs:px-2 xs:py-1 xs:rounded-md
                                                        sm:text-xs sm:px-3 sm:py-1.5 sm:rounded-lg
                                                        md:text-sm md:px-4 md:py-2
                                                        lg:text-base lg:px-5 lg:py-2.5 lg:rounded-xl
                                                        hover:bg-gray-100
                                                    "
                                                    // ✅ button hover animation
                                                    whileHover={{ scale: 1.06, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}
                                                    whileTap={{ scale: 0.96 }}
                                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                                >
                                                    {slide.ctaText}
                                                    <motion.svg
                                                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5"
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                        // ✅ arrow moves right on hover
                                                        whileHover={{ x: 3 }}
                                                        transition={{ type: 'spring', stiffness: 400 }}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </motion.svg>
                                                </motion.span>
                                            </Link>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* ── Arrows ─────────────────────────────────────────────────────── */}
            {slides.length > 1 && (
                <>
                    <motion.button
                        onClick={goPrev}
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.65)' }}
                        whileTap={{ scale: 0.92 }}
                        className="
                            absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 z-20
                            bg-black/40 text-white rounded-full
                            p-1 sm:p-1.5 md:p-2
                            backdrop-blur-sm transition-colors
                        "
                        aria-label="Previous"
                    >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </motion.button>

                    <motion.button
                        onClick={goNext}
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.65)' }}
                        whileTap={{ scale: 0.92 }}
                        className="
                            absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 z-20
                            bg-black/40 text-white rounded-full
                            p-1 sm:p-1.5 md:p-2
                            backdrop-blur-sm transition-colors
                        "
                        aria-label="Next"
                    >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </motion.button>

                    {/* Dots */}
                    <div className="absolute bottom-1 sm:bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1">
                        {slides.map((_, i) => (
                            <motion.button
                                key={i}
                                onClick={() => goTo(i)}
                                animate={{
                                    width: i === currentIndex ? 16 : 6,
                                    opacity: i === currentIndex ? 1 : 0.5,
                                }}
                                transition={{ duration: 0.3 }}
                                className={`h-1 sm:h-1.5 rounded-full bg-white`}
                                aria-label={`Slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ShopHeroSection;