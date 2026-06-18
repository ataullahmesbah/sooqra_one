'use client';
// src/components/Banner/Banner.tsx

import { useEffect, useState, useCallback, useRef } from 'react';
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

// ── Skeleton ───────────────────────────────────────────────────────────────────
function BannerSkeleton() {
  return (
    <div
      className="banner-container relative w-full overflow-hidden bg-gray-200"
      style={{ aspectRatio: '1920/600' }}
    >
      {/* Shimmer sweep */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'banner-shimmer 1.4s ease-in-out infinite',
        }}
      />

      {/* Fake text + button — centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-12 md:pb-16 gap-2 sm:gap-3 px-4">
        <div className="h-3 sm:h-4 md:h-5 w-40 sm:w-56 md:w-72 bg-gray-300/70 rounded-full" />
        <div className="h-2.5 sm:h-3.5 md:h-4 w-56 sm:w-72 md:w-96 bg-gray-300/50 rounded-full" />
        <div className="h-7 sm:h-9 md:h-10 w-24 sm:w-28 md:w-32 bg-gray-300/60 rounded-lg mt-1" />
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

// ── Image placeholder while individual slide loads ─────────────────────────────
function ImageLoader() {
  return (
    <div className="absolute inset-0 bg-gray-300 animate-pulse" />
  );
}

// ── Main Banner Component ──────────────────────────────────────────────────────
export default function Banner() {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);          // ✅ initial fetch skeleton
  const [isPaused, setIsPaused] = useState(false);
  const [fade, setFade] = useState(true);

  // ✅ track which images have finished loading
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // ✅ no-store so we always get fresh data on page load,
        //    but Next.js edge cache handles repeat requests
        const response = await fetch('/api/banners', {
          cache: 'no-store',
        });

        if (!response.ok) throw new Error(`Banner fetch failed: ${response.status}`);

        const result = await response.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
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

  // ── Auto-slide ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const duration = (banners[currentIndex]?.duration || 5) * 1000;

    timerRef.current = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev === banners.length - 1 ? 0 : prev + 1));
        setFade(true);
      }, 300);
    }, duration);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [banners, currentIndex, isPaused]);

  const nextSlide = useCallback(() => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev === banners.length - 1 ? 0 : prev + 1));
      setFade(true);
    }, 300);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev === 0 ? banners.length - 1 : prev - 1));
      setFade(true);
    }, 300);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setFade(true);
    }, 300);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getPositionClass = (position = 'center-bottom') => {
    switch (position) {
      case 'center-bottom': return 'banner-content-center-bottom banner-text-center';
      case 'left-bottom': return 'banner-content-left-bottom banner-text-left';
      case 'right-bottom': return 'banner-content-right-bottom banner-text-right';
      default: return 'banner-content-center-bottom banner-text-center';
    }
  };

  const getButtonClass = (type: string) => {
    switch (type) {
      case 'gray': return 'banner-btn banner-btn-gray';
      case 'primary': return 'banner-btn banner-btn-primary';
      case 'outline': return 'banner-btn banner-btn-outline';
      default: return 'banner-btn';
    }
  };

  const getButtonsAlignment = (position = 'center-bottom') => {
    switch (position) {
      case 'center-bottom': return 'banner-buttons-center';
      case 'left-bottom': return 'banner-buttons-start';
      case 'right-bottom': return 'banner-buttons-end';
      default: return 'banner-buttons-center';
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  // ✅ Show skeleton while fetching
  if (loading) return <BannerSkeleton />;

  // No active banners
  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];
  const positionClass = getPositionClass(currentBanner.buttonPosition);
  const buttonsAlignment = getButtonsAlignment(currentBanner.buttonPosition);
  const isCurrentLoaded = loadedImages.has(currentBanner._id);

  return (
    <div
      className="banner-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Image ── */}
      <div className={`banner-image-wrapper ${!fade ? 'fade-out' : ''}`}>

        {/* ✅ Placeholder while this slide's image loads */}
        {!isCurrentLoaded && <ImageLoader />}

        <Image
          src={currentBanner.image}
          alt={currentBanner.title || 'Banner Image'}
          fill
          /*
           * ✅ Only first banner is priority (above the fold).
           *    The rest use lazy loading so they don't block initial paint.
           */
          priority={currentIndex === 0}
          loading={currentIndex === 0 ? 'eager' : 'lazy'}
          sizes="100vw"
          quality={80}
          className={`
                        object-cover object-center rounded-md
                        transition-opacity duration-500
                        ${isCurrentLoaded ? 'opacity-100' : 'opacity-0'}
                    `}
          onLoad={() =>
            setLoadedImages(prev => new Set(prev).add(currentBanner._id))
          }
        />

        <div className="banner-image-overlay" />
      </div>

      {/* ── Preload next slide image (hidden) ── */}
      {banners.length > 1 && (() => {
        const nextIdx = (currentIndex + 1) % banners.length;
        const nextBanner = banners[nextIdx];
        return !loadedImages.has(nextBanner._id) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={nextBanner.image}
            alt=""
            aria-hidden
            className="absolute w-0 h-0 opacity-0 pointer-events-none"
            onLoad={() =>
              setLoadedImages(prev => new Set(prev).add(nextBanner._id))
            }
          />
        ) : null;
      })()}

      {/* ── Content ── */}
      <div className={`banner-content ${positionClass}`}>
        <div className={`banner-content-wrapper ${fade ? 'animate-in' : 'animate-out'}`}>
          {currentBanner.title && (
            <h1 className="banner-title">{currentBanner.title}</h1>
          )}
          {currentBanner.subtitle && (
            <p className="banner-subtitle">{currentBanner.subtitle}</p>
          )}
          {currentBanner.buttons?.length > 0 && (
            <div className={`banner-buttons ${buttonsAlignment}`}>
              {currentBanner.buttons.map((btn, i) => (
                <Link key={i} href={btn.link} className={getButtonClass(btn.type)}>
                  {btn.text}
                  <ChevronRight className="banner-btn-icon" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="banner-nav-btn banner-nav-left"
            aria-label="Previous banner"
          >
            <svg className="banner-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="banner-nav-btn banner-nav-right"
            aria-label="Next banner"
          >
            <svg className="banner-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="banner-dots">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={
                  i === currentIndex
                    ? 'banner-dot banner-dot-active'
                    : 'banner-dot banner-dot-inactive'
                }
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}