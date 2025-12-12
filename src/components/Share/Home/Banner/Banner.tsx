// File: components/Banner.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface BannerButton {
    text: string;
    link: string;
    type: string;
}

interface BannerData {
    _id: string;
    title: string;
    subtitle?: string;
    image: string;
    buttons: BannerButton[];
    duration: number;
}

export default function Banner() {
    const [banners, setBanners] = useState<BannerData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch('/api/banners');
                const result = await response.json();
                if (result.success && result.data.length > 0) {
                    setBanners(result.data);
                }
            } catch (error) {
                console.error('Error fetching banners:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    // Auto-slide with fade effect
    useEffect(() => {
        if (banners.length <= 1 || isPaused) return;

        const currentBanner = banners[currentIndex];
        const slideDuration = (currentBanner?.duration || 5) * 1000;

        const timer = setTimeout(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentIndex((prevIndex) =>
                    prevIndex === banners.length - 1 ? 0 : prevIndex + 1
                );
                setFade(true);
            }, 300);
        }, slideDuration);

        return () => clearTimeout(timer);
    }, [banners, currentIndex, isPaused]);

    const nextSlide = useCallback(() => {
        setFade(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === banners.length - 1 ? 0 : prevIndex + 1
            );
            setFade(true);
        }, 300);
    }, [banners.length]);

    const prevSlide = useCallback(() => {
        setFade(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === 0 ? banners.length - 1 : prevIndex - 1
            );
            setFade(true);
        }, 300);
    }, [banners.length]);

    const goToSlide = (index: number) => {
        if (index !== currentIndex) {
            setFade(false);
            setTimeout(() => {
                setCurrentIndex(index);
                setFade(true);
            }, 300);
        }
    };

    const getButtonClasses = (type: string) => {
        const baseClasses = "px-6 py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 inline-flex items-center justify-center";

        switch (type) {
            case 'gray':
                return `${baseClasses} bg-gray-800 hover:bg-gray-900 text-white border border-gray-700 shadow-lg`;
            case 'primary':
                return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white shadow-lg`;
            case 'secondary':
                return `${baseClasses} bg-gray-600 hover:bg-gray-700 text-white shadow-lg`;
            case 'outline':
                return `${baseClasses} bg-transparent border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white`;
            default:
                return `${baseClasses} bg-gray-800 hover:bg-gray-900 text-white border border-gray-700 shadow-lg`;
        }
    };

    if (loading) {
        return (
            <div className="h-[300px] md:h-[400px] lg:h-[500px] bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-xl"></div>
        );
    }

    if (banners.length === 0) {
        return null; // Return nothing if no banners
    }

    const currentBanner = banners[currentIndex];

    return (
        <div
            className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-xl md:rounded-2xl shadow-lg"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Banner Image with Fade Effect */}
            <div className={`relative w-full h-full transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-30'}`}>
                <Image
                    src={currentBanner.image}
                    alt={currentBanner.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                    quality={90}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/20"></div>
            </div>

            {/* Content - Centered and Responsive */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 md:px-8 lg:px-12">
                <div className={`max-w-4xl mx-auto transition-all duration-500 transform ${fade ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    {/* Title with stylish font */}
                    <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight tracking-tight">
                        {currentBanner.title}
                    </h1>

                    {/* Subtitle with paragraph styling */}
                    {currentBanner.subtitle && (
                        <p className="text-base md:text-lg lg:text-xl text-gray-100 mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto font-light">
                            {currentBanner.subtitle}
                        </p>
                    )}

                    {/* Buttons - Centered */}
                    {currentBanner.buttons && currentBanner.buttons.length > 0 && (
                        <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
                            {currentBanner.buttons.map((button, index) => (
                                <Link
                                    key={index}
                                    href={button.link}
                                    className={getButtonClasses(button.type)}
                                >
                                    {button.text}
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Controls - Only show if multiple banners */}
            {banners.length > 1 && (
                <>
                    {/* Previous/Next Buttons */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 hidden md:block"
                        aria-label="Previous banner"
                    >
                        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 hidden md:block"
                        aria-label="Next banner"
                    >
                        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                    </button>

                    {/* Mobile Navigation Arrows */}
                    <div className="absolute bottom-20 left-0 right-0 flex justify-between px-4 md:hidden">
                        <button
                            onClick={prevSlide}
                            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                            aria-label="Previous banner"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                            aria-label="Next banner"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Play/Pause Button */}
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                        aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
                    >
                        {isPaused ? (
                            <Play className="h-4 w-4" />
                        ) : (
                            <Pause className="h-4 w-4" />
                        )}
                    </button>

                    {/* Slide Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'bg-white w-8'
                                    : 'bg-white/50 hover:bg-white/80'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Slide Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full hidden md:block">
                        {currentIndex + 1} / {banners.length}
                    </div>
                </>
            )}
        </div>
    );
}