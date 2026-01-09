'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
    _id: string;
    title: string;
    slug: string;
    mainImage: string;
    mainImageAlt?: string;
    prices: Array<{
        currency: string;
        amount: number;
    }>;
    quantity: number;
    createdAt: string;
    tags?: string[];
    category?: string;
}

interface NewArrivalProps {
    products?: Product[];
}

export default function NewArrival({ products: initialProducts }: NewArrivalProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts || []);
    const [isLoading, setIsLoading] = useState(!initialProducts);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);

    const slideInterval = useRef<NodeJS.Timeout | null>(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // responsive visible
    useEffect(() => {
        const updateVisibleCount = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setVisibleCount(2); // Mobile: 2 cards
            } else if (width < 1024) {
                setVisibleCount(3); // Tablet: 3 cards
            } else {
                setVisibleCount(5); // Desktop: 5 cards
            }
        };

        updateVisibleCount(); // Initial call
        window.addEventListener('resize', updateVisibleCount);

        return () => window.removeEventListener('resize', updateVisibleCount);
    }, []);

    // API product fetch
    useEffect(() => {
        if (initialProducts) {
            const sortedProducts = [...initialProducts]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 20);
            setProducts(sortedProducts);
            return;
        }

        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/products?limit=20&sort=-createdAt');
                if (!response.ok) throw new Error('Failed to fetch products');

                const data = await response.json();
                const latestProducts = data
                    .sort((a: Product, b: Product) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 20);
                setProducts(latestProducts);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load products');
                console.error('Error fetching products:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [initialProducts]);

    
    useEffect(() => {
        if (isHovering || isTransitioning || products.length === 0) {
            if (slideInterval.current) {
                clearInterval(slideInterval.current);
            }
            return;
        }

        slideInterval.current = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => {
            if (slideInterval.current) {
                clearInterval(slideInterval.current);
            }
        };
    }, [isHovering, isTransitioning, products.length]);

    
    const totalSlides = Math.ceil(products.length / visibleCount);

  
    const getSlideProducts = useCallback(() => {
        const start = currentIndex * visibleCount;
        const end = start + visibleCount;

        const slideProducts = products.slice(start, end);

       
        if (slideProducts.length < visibleCount) {
            const remaining = visibleCount - slideProducts.length;
            const extraProducts = products.slice(0, remaining);
            return [...slideProducts, ...extraProducts];
        }

        return slideProducts;
    }, [currentIndex, visibleCount, products]);

    const nextSlide = useCallback(() => {
        if (isTransitioning) return;

        setIsTransitioning(true);

        if (currentIndex === totalSlides - 1) {
            setTimeout(() => {
                setCurrentIndex(0);
                setIsTransitioning(false);
            }, 300);
        } else {
            setCurrentIndex(prev => {
                const nextIndex = prev + 1;
                setTimeout(() => {
                    setIsTransitioning(false);
                }, 300);
                return nextIndex >= totalSlides ? 0 : nextIndex;
            });
        }
    }, [currentIndex, totalSlides, isTransitioning]);

    const prevSlide = useCallback(() => {
        if (isTransitioning) return;

        setIsTransitioning(true);

        if (currentIndex === 0) {
            setTimeout(() => {
                setCurrentIndex(totalSlides - 1);
                setIsTransitioning(false);
            }, 300);
        } else {
            setCurrentIndex(prev => {
                const nextIndex = prev - 1;
                setTimeout(() => {
                    setIsTransitioning(false);
                }, 300);
                return nextIndex < 0 ? totalSlides - 1 : nextIndex;
            });
        }
    }, [currentIndex, totalSlides, isTransitioning]);

    const goToSlide = (index: number) => {
        if (isTransitioning || index === currentIndex) return;

        setIsTransitioning(true);
        setCurrentIndex(index);

        setTimeout(() => {
            setIsTransitioning(false);
        }, 300);
    };


    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;

        if (distance > minSwipeDistance) {
            nextSlide();
        } else if (distance < -minSwipeDistance) {
            prevSlide();
        }

        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    const formatPrice = (price: number) => {
        return `৳${price.toLocaleString('en-BD')}`;
    };

    const getProductPrice = (product: Product) => {
        const bdtPrice = product.prices.find(p => p.currency === 'BDT');
        return bdtPrice?.amount || product.prices[0]?.amount || 0;
    };

    // Grid columns class based on visible count
    const getGridColsClass = () => {
        switch (visibleCount) {
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-2 sm:grid-cols-3';
            case 5: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
            default: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
        }
    };

    if (error) {
        return (
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-gray-600">Unable to load new arrivals. Please try again later.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`grid ${getGridColsClass()} gap-4`}>
                        {[...Array(visibleCount)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse">
                                <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                                <div className="p-3 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-gray-600">No new arrivals yet. Check back soon!</p>
                    </div>
                </div>
            </div>
        );
    }

    const slideProducts = getSlideProducts();

    return (
        <section className="bg-gray-50 py-12">
            <div className="container mx-auto px-2 sm:px-4  md:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
                    {/* Title */}
                    <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                            New Arrivals
                        </h2>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={prevSlide}
                            disabled={isTransitioning}
                            className={`p-2 sm:p-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}`}
                            aria-label="Previous slide"
                        >
                            <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                        </button>
                        <button
                            onClick={nextSlide}
                            disabled={isTransitioning}
                            className={`p-2 sm:p-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}`}
                            aria-label="Next slide"
                        >
                            <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                        </button>
                    </div>
                </div>

                {/* Product Carousel */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{
                                    duration: 0.4,
                                    ease: "easeInOut"
                                }}
                                className={`grid ${getGridColsClass()} gap-3 sm:gap-4 md:gap-6`}
                            >
                                {slideProducts.map((product) => (
                                    <motion.div
                                        key={`${product._id}-${currentIndex}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        whileHover={{
                                            y: -5,
                                            transition: { duration: 0.2 }
                                        }}
                                        className="group"
                                    >
                                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden h-full flex flex-col">
                                            {/* Product Image */}
                                            <div className="relative aspect-square overflow-hidden bg-gray-100 flex-shrink-0">
                                                <Image
                                                    src={product.mainImage || '/placeholder-product.jpg'}
                                                    alt={product.mainImageAlt || product.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                                />

                                                {/* New Badge */}
                                                <div className="absolute top-2 left-2">
                                                    <span className="text-[10px] xs:text-xs font-semibold bg-gray-900 text-white px-2 py-1 rounded-full shadow-md">
                                                        NEW
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Product Info - Flexible Content */}
                                            <div className="p-3 sm:p-4 flex-grow flex flex-col">
                                                {/* Category */}
                                                {product.tags?.[0] && (
                                                    <div className="mb-1 sm:mb-2">
                                                        <span className="text-[10px] xs:text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                                                            {product.tags[0]}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Title - Optimized for Mobile */}
                                                <h3 className="font-medium text-gray-900 
    text-[10px] leading-tight
    xs:text-[11px]
    sm:text-xs sm:leading-snug
    md:text-sm md:leading-normal
    line-clamp-2 
    overflow-hidden
    mb-1.5 sm:mb-2
    min-h-[1.8rem] xs:min-h-[2rem] sm:min-h-[2.25rem] md:min-h-[2.5rem]
    group-hover:text-gray-700 
    flex-grow
    break-all sm:break-words">
                                                    {product.title}
                                                </h3>

                                                {/* Price & Order Button - Compact Layout */}
                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="space-y-0.5 sm:space-y-1">
                                                        <div className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-tight">
                                                            {formatPrice(getProductPrice(product))}
                                                        </div>
                                                        {product.quantity <= 10 && product.quantity > 0 && (
                                                            <div className="text-[10px] xs:text-xs text-amber-600 leading-none">
                                                                Only {product.quantity} left
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Order Button - Responsive Sizes */}
                                                    <Link
                                                        href={`/products/${product.slug}`}
                                                        className="flex items-center gap-1 xs:gap-2 bg-gray-900 hover:bg-black text-white font-medium px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md flex-shrink-0"
                                                    >
                                                        <FiShoppingCart className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                                                        {/* <span className="text-[10px] xs:text-xs sm:text-sm">Order</span> */}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Gradient Overlays - Hide on mobile */}
                    <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
                    <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
                </div>

                {/* Slide Indicators */}
                <div className="flex flex-col items-center mt-8 sm:mt-10 gap-3 sm:gap-4">
                    {/* Dots Indicator */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {Array.from({ length: totalSlides }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                disabled={isTransitioning}
                                className={`relative ${isTransitioning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                aria-label={`Go to slide ${index + 1}`}
                            >
                                <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-200 ${currentIndex === index
                                    ? 'bg-gray-900 scale-125'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                    }`} />
                            </button>
                        ))}
                    </div>


                </div>


            </div>
        </section>
    );
}