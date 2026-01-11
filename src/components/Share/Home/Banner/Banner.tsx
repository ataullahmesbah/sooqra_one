// File: components/Banner.tsx - FIXED RESPONSIVE VERSION
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
  const [windowWidth, setWindowWidth] = useState(0);

  // Track window width for responsive image
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Get optimized image URL based on screen size
  const getOptimizedImageUrl = (originalUrl: string): string => {
    if (!originalUrl) return '';

    // If it's already a Cloudinary URL with responsive parameters
    if (originalUrl.includes('cloudinary.com') && originalUrl.includes('upload')) {
      let transformation = '';

      // Add responsive transformations based on screen size
      if (windowWidth >= 1024) { // Desktop
        transformation = 'c_fill,w_1920,h_600,q_auto,f_webp/';
      } else if (windowWidth >= 768) { // Tablet
        transformation = 'c_fill,w_1024,h_320,q_auto,f_webp/';
      } else { // Mobile
        transformation = 'c_fill,w_768,h_240,q_auto,f_webp/';
      }

      // Insert transformation into Cloudinary URL
      return originalUrl.replace('/upload/', `/upload/${transformation}`);
    }

    return originalUrl;
  };

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

  // Get button classes
  const getButtonClasses = (type: string) => {
    const baseClasses = "px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 inline-flex items-center justify-center shadow-lg";

    switch (type) {
      case 'gray':
        return `${baseClasses} bg-gradient-to-r from-gray-800 to-gray-900 text-white border border-gray-700/30 hover:from-gray-900 hover:to-gray-950 hover:shadow-xl`;
      case 'primary':
        return `${baseClasses} bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 hover:shadow-xl`;
      case 'outline':
        return `${baseClasses} bg-white/10 border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 backdrop-blur-sm`;
      default:
        return `${baseClasses} bg-gradient-to-r from-gray-800 to-gray-900 text-white border border-gray-700/30 hover:from-gray-900 hover:to-gray-950 hover:shadow-xl`;
    }
  };

  // Get position classes - RESPONSIVE VERSION
  const getPositionClasses = (position = 'center-bottom') => {
    // Adjust padding based on screen size
    const padding = windowWidth < 768 ? '4' : '10';

    switch (position) {
      case 'left-top':
        return {
          container: `justify-start items-start pt-${padding} pl-${padding}`,
          content: 'text-left items-start',
          buttons: 'justify-start'
        };
      case 'left-center':
        return {
          container: `justify-start items-center pl-${padding}`,
          content: 'text-left',
          buttons: 'justify-start'
        };
      case 'left-bottom':
        return {
          container: `justify-start items-end pb-${padding} pl-${padding}`,
          content: 'text-left',
          buttons: 'justify-start'
        };
      case 'center-top':
        return {
          container: `justify-center items-start pt-${padding}`,
          content: 'text-center',
          buttons: 'justify-center'
        };
      case 'center-center':
        return {
          container: 'justify-center items-center',
          content: 'text-center',
          buttons: 'justify-center'
        };
      case 'center-bottom':
        return {
          container: `justify-center items-end pb-${padding}`,
          content: 'text-center',
          buttons: 'justify-center'
        };
      case 'right-top':
        return {
          container: `justify-end items-start pt-${padding} pr-${padding}`,
          content: 'text-right',
          buttons: 'justify-end'
        };
      case 'right-center':
        return {
          container: `justify-end items-center pr-${padding}`,
          content: 'text-right',
          buttons: 'justify-end'
        };
      case 'right-bottom':
        return {
          container: `justify-end items-end pb-${padding} pr-${padding}`,
          content: 'text-right',
          buttons: 'justify-end'
        };
      default:
        return {
          container: `justify-center items-end pb-${padding}`,
          content: 'text-center',
          buttons: 'justify-center'
        };
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[450px] xl:h-[500px] bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-lg"></div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const position = getPositionClasses(currentBanner.buttonPosition);
  const optimizedImageUrl = getOptimizedImageUrl(currentBanner.image);

  // Responsive height calculation
  const getBannerHeight = () => {
    if (windowWidth < 640) return '250px'; // Mobile
    if (windowWidth < 768) return '300px'; // Small tablet
    if (windowWidth < 1024) return '350px'; // Tablet
    if (windowWidth < 1280) return '450px'; // Laptop
    return '500px'; // Desktop
  };

  return (
    <div
      className="relative w-full overflow-hidden shadow-lg rounded-lg"
      style={{ height: getBannerHeight() }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Image with Fade Effect */}
      <div className={`relative w-full h-full transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-95'}`}>
        {/* Use optimized image URL */}
        <Image
          src={optimizedImageUrl}
          alt={currentBanner.title || 'Banner Image'}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, 1920px"
          quality={windowWidth < 768 ? 75 : 90}
        />

        {/* Responsive gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/5 to-black/10 sm:from-black/20 sm:via-black/10 sm:to-black/20"></div>
      </div>

      {/* Content Container - Responsive */}
      <div className={`absolute inset-0 flex ${position.container}`}>
        <div className={`max-w-4xl w-full transition-all duration-500 transform ${fade ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} flex flex-col ${position.content === 'text-center' ? 'items-center' : position.content === 'text-right' ? 'items-end' : 'items-start'}`}>

          {/* Title - Responsive font sizes */}
          {currentBanner.title && (
            <h1 className={`font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight tracking-wide drop-shadow-lg ${position.content}
              ${windowWidth < 640 ? 'text-xl sm:text-2xl' :
                windowWidth < 768 ? 'text-2xl md:text-3xl' :
                  windowWidth < 1024 ? 'text-3xl lg:text-4xl' :
                    'text-4xl xl:text-5xl'}`}>
              {currentBanner.title}
            </h1>
          )}

          {/* Subtitle - Responsive */}
          {currentBanner.subtitle && (
            <p className={`text-white mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-relaxed max-w-2xl drop-shadow-md ${position.content}
              ${windowWidth < 640 ? 'text-sm' :
                windowWidth < 768 ? 'text-base' :
                  windowWidth < 1024 ? 'text-lg' :
                    'text-xl'}`}>
              {currentBanner.subtitle}
            </p>
          )}

          {/* Buttons - Responsive spacing and size */}
          {currentBanner.buttons && currentBanner.buttons.length > 0 && (
            <div className={`flex flex-wrap gap-2 sm:gap-3 md:gap-4 w-full ${position.buttons}`}>
              {currentBanner.buttons.map((button, index) => (
                <Link
                  key={index}
                  href={button.link}
                  className={getButtonClasses(button.type)}
                >
                  {button.text}
                  <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls - Responsive */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 sm:p-2.5 rounded-full transition-all duration-300"
            aria-label="Previous banner"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 sm:p-2.5 rounded-full transition-all duration-300"
            aria-label="Next banner"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Indicators - Responsive */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${index === currentIndex
                    ? 'bg-white h-1.5 sm:h-2 w-4 sm:w-8'
                    : 'bg-white/50 hover:bg-white/80 h-1.5 sm:h-2 w-1.5 sm:w-2'
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