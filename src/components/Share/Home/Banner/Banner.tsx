'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BannerButton {
  text: string;
  link: string;
  type: string;
}

interface BannerData {
  _id: string;
  title?: string;
  subtitle?: string;
  image: string;
  buttons: BannerButton[];
  duration: number;
  buttonPosition?: string;
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
          console.log('Banners loaded:', result.data.length);
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

  // Auto-slide (একই রাখা)
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

  // UPDATED: বাটন সাইজ মোবাইল + ট্যাবলেটে আরও ছোট
  const getButtonClasses = (type: string) => {
    const baseClasses =
      "min-w-[90px] xs:min-w-[100px] sm:min-w-[110px] " +     // মোবাইলে খুব ছোট min-width
      "px-3.5 xs:px-4 sm:px-5 md:px-6 " +                     // মোবাইলে px-3.5 (ছোট)
      "py-1.5 xs:py-2 sm:py-2.5 md:py-3 " +                   // height মোবাইলে py-1.5 (আরও ছোট)
      "text-xs xs:text-xs sm:text-sm md:text-base " +         // text মোবাইলে text-xs
      "rounded-md sm:rounded-lg font-medium " +
      "transition-all duration-300 hover:scale-105 active:scale-95 " +
      "inline-flex items-center justify-center shadow-md sm:shadow-lg";

    switch (type) {
      case 'gray':
        return `${baseClasses} bg-gradient-to-r from-gray-800 to-gray-900 text-white border border-gray-700/30 hover:from-gray-900 hover:to-gray-950 hover:shadow-xl`;
      case 'primary':
        return `${baseClasses} bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 hover:shadow-xl`;
      case 'outline':
        return `${baseClasses} bg-white/10 border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 backdrop-blur-sm hover:shadow-xl`;
      default:
        return baseClasses;
    }
  };

  const getPositionClasses = (position = 'center-bottom') => {
    switch (position) {
      case 'center-bottom':
        return {
          container: 'justify-center items-end pb-10 xs:pb-12 sm:pb-14 md:pb-16 lg:pb-20 xl:pb-24',
          content: 'text-center',
          buttons: 'justify-center'
        };
      case 'left-bottom':
        return {
          container: 'justify-start items-end pb-10 xs:pb-12 sm:pb-14 md:pb-16 pl-4 sm:pl-8 md:pl-12',
          content: 'text-left',
          buttons: 'justify-start'
        };
      case 'right-bottom':
        return {
          container: 'justify-end items-end pb-10 xs:pb-12 sm:pb-14 md:pb-16 pr-4 sm:pr-8 md:pr-12',
          content: 'text-right',
          buttons: 'justify-end'
        };
      default:
        return {
          container: 'justify-center items-end pb-10 xs:pb-12 sm:pb-14 md:pb-16 lg:pb-20 xl:pb-24',
          content: 'text-center',
          buttons: 'justify-center'
        };
    }
  };

  if (loading) {
    return (
      <div className="w-full aspect-[16/5] bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const position = getPositionClasses(currentBanner.buttonPosition);

  const imageUrl = currentBanner.image;

  return (
    <div
      className="relative w-full overflow-hidden aspect-[16/5] md:aspect-[3/1] lg:aspect-[16/5]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Image */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        <Image
          src={imageUrl}
          alt={currentBanner.title || 'Banner Image'}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={75}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/20 pointer-events-none" />
      </div>

      {/* Content */}
      <div className={`absolute inset-0 flex ${position.container} px-4 xs:px-6 sm:px-8 lg:px-16`}>
        <div className={`max-w-7xl w-full mx-auto transition-all duration-700 transform ${fade ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'} flex flex-col ${position.content}`}>
          {currentBanner.title && (
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-6 drop-shadow-2xl leading-tight">
              {currentBanner.title}
            </h1>
          )}

          {currentBanner.subtitle && (
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-white mb-5 sm:mb-6 md:mb-8 max-w-3xl drop-shadow-lg">
              {currentBanner.subtitle}
            </p>
          )}

          {/* Buttons - চূড়ান্ত ছোট সংস্করণ */}
          {currentBanner.buttons && currentBanner.buttons.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 w-full ${position.buttons}`}>
              {currentBanner.buttons.map((button, index) => (
                <Link
                  key={index}
                  href={button.link}
                  className={getButtonClasses(button.type)}
                >
                  {button.text}
                  <ChevronRight className="ml-1 xs:ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition"
            aria-label="Previous banner"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition"
            aria-label="Next banner"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${index === currentIndex
                  ? 'bg-white w-6 sm:w-8 h-2 sm:h-3'
                  : 'bg-white/50 hover:bg-white/80 w-2 sm:w-3 h-2 sm:h-3'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}