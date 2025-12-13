// File: components/Banner.tsx - COMPLETE FIXED VERSION
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
          console.log('Banners loaded:', result.data);
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

  // Get button classes with gradient and hover effects
  const getButtonClasses = (type: string) => {
    const baseClasses = "px-6 py-3.5 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 inline-flex items-center justify-center shadow-lg";
    
    switch (type) {
      case 'gray':
        return `${baseClasses} bg-gradient-to-r from-gray-800 to-gray-900 text-white border border-gray-700/30 hover:from-gray-900 hover:to-gray-950 hover:shadow-xl`;
      case 'primary':
        return `${baseClasses} bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 hover:shadow-xl`;
      case 'secondary':
        return `${baseClasses} bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:from-gray-700 hover:to-gray-900 hover:shadow-xl`;
      case 'outline':
        return `${baseClasses} bg-white/10 border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 backdrop-blur-sm`;
      case 'success':
        return `${baseClasses} bg-gradient-to-r from-emerald-600 to-emerald-800 text-white hover:from-emerald-700 hover:to-emerald-900 hover:shadow-xl`;
      case 'warning':
        return `${baseClasses} bg-gradient-to-r from-orange-600 to-orange-800 text-white hover:from-orange-700 hover:to-orange-900 hover:shadow-xl`;
      default:
        return `${baseClasses} bg-gradient-to-r from-gray-800 to-gray-900 text-white border border-gray-700/30 hover:from-gray-900 hover:to-gray-950 hover:shadow-xl`;
    }
  };

  // Get position classes based on admin selection - UPDATED FOR BETTER ALIGNMENT
  const getPositionClasses = (position = 'center-bottom') => {
    console.log('Getting position classes for:', position);
    
    switch (position) {
      case 'left-top': 
        return {
          container: 'justify-start items-start pt-10 pl-10',
          content: 'text-left items-start',
          buttons: 'justify-start'
        };
      case 'left-center': 
        return {
          container: 'justify-start items-center pl-10',
          content: 'text-left',
          buttons: 'justify-start'
        };
      case 'left-bottom': 
        return {
          container: 'justify-start items-end pb-10 pl-10',
          content: 'text-left',
          buttons: 'justify-start'
        };
      case 'center-top': 
        return {
          container: 'justify-center items-start pt-10',
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
          container: 'justify-center items-end pb-10',
          content: 'text-center',
          buttons: 'justify-center'
        };
      case 'right-top': 
        return {
          container: 'justify-end items-start pt-10 pr-10',
          content: 'text-right',
          buttons: 'justify-end'
        };
      case 'right-center': 
        return {
          container: 'justify-end items-center pr-10',
          content: 'text-right',
          buttons: 'justify-end'
        };
      case 'right-bottom': 
        return {
          container: 'justify-end items-end pb-10 pr-10',
          content: 'text-right',
          buttons: 'justify-end'
        };
      default: 
        return {
          container: 'justify-center items-end pb-10',
          content: 'text-center',
          buttons: 'justify-center'
        };
    }
  };

  if (loading) {
    return (
      <div className="h-[300px] md:h-[400px] lg:h-[500px] bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-xl"></div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const position = getPositionClasses(currentBanner.buttonPosition);
  
  // Debug log
  console.log('Current banner position:', {
    buttonPosition: currentBanner.buttonPosition,
    positionClasses: position,
    hasTitle: !!currentBanner.title,
    hasSubtitle: !!currentBanner.subtitle,
    buttons: currentBanner.buttons
  });

  return (
    <div
      className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden shadow-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Image with Fade Effect */}
      <div className={`relative w-full h-full transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-95'}`}>
        <Image
          src={currentBanner.image}
          alt={currentBanner.title || 'Banner Image'}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={90}
        />

        {/* Light Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20"></div>

        {/* Optional: Very subtle vignette effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent"></div>
      </div>

      {/* Content Container with Admin-defined Position - FIXED */}
      <div className={`absolute inset-0 flex ${position.container}`}>
        <div className={`max-w-4xl w-full transition-all duration-500 transform ${fade ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} flex flex-col ${position.content === 'text-center' ? 'items-center' : position.content === 'text-right' ? 'items-end' : 'items-start'}`}>
          
          {/* Title - Only show if exists */}
          {currentBanner.title && (
            <h1 className={`text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight tracking-wide font-['Poppins',sans-serif] drop-shadow-lg ${position.content}`}>
              {currentBanner.title}
            </h1>
          )}
          
          {/* Subtitle - Only show if exists (as paragraph) */}
          {currentBanner.subtitle && (
            <p className={`text-base md:text-lg lg:text-xl text-white mb-6 md:mb-8 leading-relaxed max-w-2xl drop-shadow-md ${position.content}`}>
              {currentBanner.subtitle}
            </p>
          )}
          
          {/* Buttons - Only show if exists */}
          {currentBanner.buttons && currentBanner.buttons.length > 0 && (
            <div className={`flex flex-wrap gap-3 md:gap-4 w-full ${position.buttons}`}>
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

      {/* Navigation Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all duration-300"
            aria-label="Previous banner"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all duration-300"
            aria-label="Next banner"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/80'
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