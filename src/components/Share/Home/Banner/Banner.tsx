// File: components/Banner.tsx - FIXED URL PARSING
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

  // Track window width
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
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

  // Auto-slide
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

  // 🔥 FIXED: Get Responsive Image URL for ALL Devices
  const getResponsiveImageUrl = (originalUrl: string): string => {
    if (!originalUrl) return '';

    // If not Cloudinary URL, return as is
    if (!originalUrl.includes('cloudinary.com')) {
      return originalUrl;
    }

    // Extract public ID from URL - FIXED METHOD
    const getPublicId = (url: string): string | null => {
      try {
        // Cloudinary URL format: https://res.cloudinary.com/cloudname/image/upload/v1234567890/folder/filename.jpg
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');

        // Find 'upload' index
        const uploadIndex = pathParts.indexOf('upload');
        if (uploadIndex === -1) return null;

        // Get everything after upload (skip version if exists)
        const afterUpload = pathParts.slice(uploadIndex + 1);

        // Remove version (v1234567890) if present
        const versionIndex = afterUpload.findIndex(part => part.startsWith('v'));
        const finalParts = versionIndex !== -1
          ? afterUpload.slice(versionIndex + 1)
          : afterUpload;

        // Join and remove file extension
        const fullPath = finalParts.join('/');
        return fullPath.split('.')[0];
      } catch (error) {
        console.error('Error parsing Cloudinary URL:', error);
        return null;
      }
    };

    const publicId = getPublicId(originalUrl);

    // If can't parse public ID, return original URL
    if (!publicId) {
      console.warn('Could not parse public ID from URL:', originalUrl);
      return originalUrl;
    }

    // 🔥 CRITICAL FIX: Different sizes for different devices
    let width, height;

    // Mobile First Approach
    if (windowWidth < 375) { // Very small mobile
      width = 375;
      height = 200;
    } else if (windowWidth < 640) { // Mobile
      width = 640;
      height = 250;
    } else if (windowWidth < 768) { // Small tablet
      width = 768;
      height = 300;
    } else if (windowWidth < 1024) { // Tablet
      width = 1024;
      height = 350;
    } else if (windowWidth < 1280) { // Small laptop
      width = 1280;
      height = 400;
    } else if (windowWidth < 1440) { // Laptop
      width = 1440;
      height = 450;
    } else if (windowWidth < 1536) { // Desktop
      width = 1536;
      height = 480;
    } else if (windowWidth < 1920) { // Large desktop
      width = 1920;
      height = 550;
    } else { // 4K and above
      width = 1920;
      height = 600;
    }

    // Extract cloud name from URL - FIXED
    let cloudName = '';
    try {
      const urlObj = new URL(originalUrl);
      // URL format: https://res.cloudinary.com/cloudname/image/upload/...
      const hostnameParts = urlObj.hostname.split('.');
      if (hostnameParts[0] === 'res') {
        cloudName = hostnameParts[1]; // res.cloudinary.com -> cloudinary
      }
    } catch (error) {
      console.error('Error extracting cloud name:', error);
      // Default fallback
      cloudName = 'demo'; // Replace with your actual cloud name
    }

    // Construct Cloudinary URL with transformations
    const transformation = `c_fill,w_${width},h_${height},q_auto,f_webp`;

    // Return optimized URL
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
  };

  // ALTERNATIVE SIMPLER SOLUTION: Use Next.js Image with sizes prop
  const getSimpleResponsiveUrl = (originalUrl: string): string => {
    // Just return original URL, Next.js will handle optimization
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

  // Get position classes
  const getPositionClasses = (position = 'center-bottom') => {
    const padding = windowWidth < 768 ? '6' : '10';

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
      <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[450px] xl:h-[550px] bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse"></div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const position = getPositionClasses(currentBanner.buttonPosition);

  // 🔥 SIMPLER APPROACH: Use original URL with Next.js optimization
  const imageUrl = currentBanner.image; // Use original URL

  console.log('Banner Debug:', {
    windowWidth,
    originalUrl: currentBanner.image,
    hasTitle: !!currentBanner.title,
    hasButtons: currentBanner.buttons?.length || 0
  });

  // Responsive height calculation
  const getBannerHeight = () => {
    if (windowWidth < 375) return '180px';   // Very small mobile
    if (windowWidth < 640) return '220px';   // Mobile
    if (windowWidth < 768) return '260px';   // Small tablet
    if (windowWidth < 1024) return '320px';  // Tablet
    if (windowWidth < 1280) return '380px';  // Small laptop
    if (windowWidth < 1440) return '450px';  // Laptop
    if (windowWidth < 1536) return '500px';  // Desktop
    return '550px';                          // Large desktop
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: getBannerHeight() }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Image - SIMPLIFIED VERSION */}
      <div className={`relative w-full h-full transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-95'}`}>
        <Image
          src={imageUrl}
          alt={currentBanner.title || 'Banner Image'}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, (max-width: 1440px) 100vw, (max-width: 1536px) 100vw, 1920px"
          quality={windowWidth < 768 ? 75 : 90}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-black/5 to-black/15"></div>
      </div>

      {/* Content Container */}
      <div className={`absolute inset-0 flex ${position.container}`}>
        <div className={`max-w-4xl w-full transition-all duration-500 transform ${fade ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} flex flex-col ${position.content === 'text-center' ? 'items-center' : position.content === 'text-right' ? 'items-end' : 'items-start'}`}>

          {/* Title */}
          {currentBanner.title && (
            <h1 className={`font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight drop-shadow-lg ${position.content}
              ${windowWidth < 640 ? 'text-xl sm:text-2xl' :
                windowWidth < 768 ? 'text-2xl' :
                  windowWidth < 1024 ? 'text-3xl' :
                    windowWidth < 1280 ? 'text-4xl' :
                      'text-5xl'}`}>
              {currentBanner.title}
            </h1>
          )}

          {/* Subtitle */}
          {currentBanner.subtitle && (
            <p className={`text-white mb-3 sm:mb-4 md:mb-6 lg:mb-8 leading-relaxed max-w-2xl drop-shadow-md ${position.content}
              ${windowWidth < 640 ? 'text-sm' :
                windowWidth < 768 ? 'text-base' :
                  windowWidth < 1024 ? 'text-lg' :
                    windowWidth < 1280 ? 'text-xl' :
                      'text-2xl'}`}>
              {currentBanner.subtitle}
            </p>
          )}

          {/* Buttons */}
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

      {/* Navigation Controls */}
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

          {/* Slide Indicators */}
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