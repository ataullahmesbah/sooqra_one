'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from "next/image";

// Interface definitions
interface SlideFeature {
    icon: string;
    text: string;
}

interface Slide {
    title: string;
    subtitle: string;
    highlights: string[];
    cta: string;
    bg: string;
    textColor: string;
    badgeColor: string;
    features: SlideFeature[];
    image: string;
    link: string;
}

interface BannerResponse {
    success: boolean;
    data: Slide[];
}

const ShopHeroSection = () => {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [windowWidth, setWindowWidth] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Set initial width
        setWindowWidth(typeof window !== 'undefined' ? window.innerWidth : 0);

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await fetch('/api/products/shop-banner', {
                    headers: {
                        'Cache-Control': 'max-age=3600, stale-while-revalidate'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch banners');
                }

                const data: BannerResponse = await response.json();

                if (data.success && data.data) {
                    const formattedSlides: Slide[] = data.data.map(slide => ({
                        title: slide.title || "Welcome to Our Shop",
                        subtitle: slide.subtitle || "Discover amazing products at great prices",
                        highlights: Array.isArray(slide.highlights) && slide.highlights.length > 0
                            ? slide.highlights
                            : ["Best Quality", "Fast Delivery", "24/7 Support"],
                        cta: slide.cta || "Shop Now",
                        bg: slide.bg || "bg-gradient-to-br from-gray-900 via-purple-900/70 to-gray-900",
                        textColor: slide.textColor || "text-white",
                        badgeColor: slide.badgeColor || "from-purple-600 to-indigo-600",
                        features: Array.isArray(slide.features) && slide.features.length > 0
                            ? slide.features.filter(f => f?.icon && f?.text)
                            : [{ icon: "🌟", text: "Premium" }, { icon: "🚀", text: "Fast" }],
                        image: slide.image || "/default-banner.jpg",
                        link: slide.link || "/shop"
                    }));
                    setSlides(formattedSlides);
                } else {
                    // Fallback if no data
                    setSlides([getFallbackSlide()]);
                }
            } catch (error) {
                console.error("Error fetching banners:", error);
                // Fallback slides if API fails
                setSlides([getFallbackSlide()]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSlides();

        // Cache refresh every 3600 seconds (1 hour)
        const cacheRefreshInterval = setInterval(fetchSlides, 3600 * 1000);

        return () => clearInterval(cacheRefreshInterval);
    }, []);

    useEffect(() => {
        if (slides.length > 1) {
            const interval = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % slides.length);
            }, 6000);
            return () => clearInterval(interval);
        }
    }, [slides]);

    const getFallbackSlide = (): Slide => ({
        title: "Welcome to Our Shop",
        subtitle: "Discover amazing products at great prices",
        highlights: ["Best Quality", "Fast Delivery", "24/7 Support"],
        cta: "Shop Now",
        bg: "bg-gradient-to-br from-gray-900 via-purple-900/70 to-gray-900",
        textColor: "text-white",
        badgeColor: "from-purple-600 to-indigo-600",
        features: [{ icon: "🌟", text: "Premium" }, { icon: "🚀", text: "Fast" }],
        image: "/default-banner.jpg",
        link: "/shop"
    });

    // Responsive breakpoints
    const isSmallTablet = windowWidth >= 640 && windowWidth < 768;
    const isLargeTablet = windowWidth >= 768 && windowWidth < 1024;

    // Loading state
    if (isLoading) {
        return (
            <div className="relative w-full h-[500px] sm:h-[550px] md:h-[600px] lg:h-[700px] overflow-hidden bg-gray-800 animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white">Loading...</div>
                </div>
            </div>
        );
    }

    // Return null if no slides
    if (slides.length === 0) return null;

    const currentSlideData = slides[currentSlide];

    return (
        <div className="relative w-full h-[500px] sm:h-[550px] md:h-[600px] lg:h-[700px] overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-5" style={{
                backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                backgroundSize: '40px 40px',
            }}></div>

            {/* Slides */}
            <div className="relative z-20 w-full h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 flex items-center"
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]">
                                <Image
                                    src={currentSlideData.image}
                                    alt={currentSlideData.title}
                                    fill
                                    priority
                                    sizes="(max-width: 640px) 100vw,
                                           (max-width: 1024px) 100vw,
                                           100vw"
                                    className="object-cover object-center"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/default-banner.jpg";
                                    }}
                                />
                            </div>

                            <div className={`absolute inset-0 ${currentSlideData.bg} mix-blend-multiply`}></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                        </div>

                        {/* Content Container */}
                        <div className={`relative z-30 w-full max-w-7xl mx-auto px-4 
                            ${isSmallTablet ? 'px-6' : 'sm:px-6'} 
                            ${isLargeTablet ? 'px-8' : 'lg:px-8'} 
                            flex flex-col lg:flex-row items-center gap-4 sm:gap-6 lg:gap-12`}>

                            {/* Text Content - Left Side */}
                            <div className="w-full lg:w-1/2 space-y-3 sm:space-y-4 md:space-y-6 text-center lg:text-left">
                                {/* Promo Badges */}
                                {!isSmallTablet && (
                                    <motion.div
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                        className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3"
                                    >
                                        {currentSlideData.highlights.slice(0, isLargeTablet ? 2 : 3).map((highlight, i) => (
                                            <div
                                                key={i}
                                                className={`inline-flex items-center bg-gradient-to-r ${currentSlideData.badgeColor} text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full font-medium shadow-lg transition-all duration-300 text-xs sm:text-sm border border-white/20`}
                                            >
                                                {isLargeTablet ?
                                                    highlight.split(' ')[0] + (highlight.includes(' ') ? '...' : '') :
                                                    highlight}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Main Heading */}
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.7 }}
                                    className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold ${currentSlideData.textColor} leading-tight`}
                                >
                                    {isSmallTablet
                                        ? currentSlideData.title.split(' ').slice(0, 3).join(' ') +
                                        (currentSlideData.title.split(' ').length > 3 ? '...' : '')
                                        : currentSlideData.title}
                                </motion.h1>

                                {/* Subheading */}
                                {!isSmallTablet && (
                                    <motion.p
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4, duration: 0.7 }}
                                        className={`text-sm sm:text-base md:text-lg ${currentSlideData.textColor}/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed`}
                                    >
                                        {isLargeTablet
                                            ? currentSlideData.subtitle.split(' ').slice(0, 8).join(' ') + '...'
                                            : currentSlideData.subtitle}
                                    </motion.p>
                                )}

                                {/* Features List */}
                                {!isSmallTablet && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6, duration: 0.7 }}
                                        className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 md:gap-4"
                                    >
                                        {currentSlideData.features.slice(0, isLargeTablet ? 2 : 3).map((feature, i) => (
                                            <div key={i} className="flex items-center gap-2 text-white/90">
                                                <span className="text-base sm:text-lg md:text-xl">{feature.icon}</span>
                                                <span className="text-xs sm:text-sm md:text-base">
                                                    {isLargeTablet ? feature.text.split(' ')[0] : feature.text}
                                                </span>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* CTA Button */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.7 }}
                                    className="pt-1 sm:pt-2 md:pt-4"
                                >
                                    <Link href={currentSlideData.link} className="inline-block">
                                        <div className="relative group">
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                                            <button className={`relative px-7 py-4 rounded-lg leading-none flex items-center justify-center text-center font-semibold transition-all duration-300 ${currentSlideData.textColor === 'text-white' ? 'bg-black text-white' : 'bg-gray-900 text-white'}`}>
                                                {isSmallTablet
                                                    ? currentSlideData.cta.split(' ')[0]
                                                    : currentSlideData.cta} &rarr;
                                            </button>
                                        </div>
                                    </Link>
                                </motion.div>
                            </div>

                            {/* Right Side - Empty for layout balance */}
                            <div className="w-full lg:w-1/2"></div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Slide Indicators */}
                {slides.length > 1 && (
                    <div className={`absolute ${isSmallTablet ? 'bottom-4' : 'bottom-6'} sm:bottom-8 left-0 right-0 z-30 flex justify-center gap-2`}>
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white w-4 sm:w-6' : 'bg-white/40'}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopHeroSection;