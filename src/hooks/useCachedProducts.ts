// src/hooks/useCachedProducts.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '@/src/types/index';
import { cacheService } from '../lib/cache';


interface UseCachedProductsResult {
    products: Product[];
    allProducts: Product[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    lastUpdated: Date | null;
}

const CACHE_KEY = 'all_products';
const CACHE_DURATION = 3600; // 1 hour in seconds

export const useCachedProducts = (limit: number = 35): UseCachedProductsResult => {
    const [products, setProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const isFetching = useRef<boolean>(false);

    const fetchProducts = useCallback(async (forceRefresh: boolean = false) => {
        // If already fetching, skip
        if (isFetching.current) return;

        // Check cache first (unless force refresh)
        if (!forceRefresh) {
            const cachedData = cacheService.get<{ allProducts: Product[]; lastUpdated: string }>(CACHE_KEY);

            if (cachedData) {
                const sortedProducts = [...cachedData.allProducts].sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                });

                setAllProducts(sortedProducts);
                setProducts(sortedProducts.slice(0, limit));
                setLastUpdated(new Date(cachedData.lastUpdated));
                setLoading(false);
                return;
            }
        }

        // Fetch fresh data
        isFetching.current = true;
        setLoading(true);
        setError(null);

        try {
            const { getProducts } = await import('@/src/lib/data');
            const fetchedProducts = await getProducts();

            const sortedProducts = [...fetchedProducts].sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });

            // Save to cache
            cacheService.set(CACHE_KEY, {
                allProducts: sortedProducts,
                lastUpdated: new Date().toISOString(),
            }, CACHE_DURATION);

            setAllProducts(sortedProducts);
            setProducts(sortedProducts.slice(0, limit));
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products');

            // Try to get stale cache if available
            const staleCache = cacheService.get<{ allProducts: Product[]; lastUpdated: string }>(CACHE_KEY);
            if (staleCache) {
                const sortedProducts = [...staleCache.allProducts].sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                });
                setAllProducts(sortedProducts);
                setProducts(sortedProducts.slice(0, limit));
                setLastUpdated(new Date(staleCache.lastUpdated));
            }
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, [limit]);

    // Initial fetch
    useEffect(() => {
        fetchProducts(false);
    }, [fetchProducts]);

    // Auto-refresh every hour in background
    useEffect(() => {
        const intervalId = setInterval(() => {
            // Refresh in background without showing loading
            const refreshInBackground = async () => {
                if (!isFetching.current) {
                    try {
                        const { getProducts } = await import('@/src/lib/data');
                        const fetchedProducts = await getProducts();

                        const sortedProducts = [...fetchedProducts].sort((a, b) => {
                            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                            return dateB - dateA;
                        });

                        cacheService.set(CACHE_KEY, {
                            allProducts: sortedProducts,
                            lastUpdated: new Date().toISOString(),
                        }, CACHE_DURATION);

                        // Update state without showing loading
                        setAllProducts(sortedProducts);
                        setProducts(sortedProducts.slice(0, limit));
                        setLastUpdated(new Date());
                    } catch (err) {
                        console.error('Background refresh failed:', err);
                    }
                }
            };

            refreshInBackground();
        }, CACHE_DURATION * 1000);

        return () => clearInterval(intervalId);
    }, [limit]);

    return {
        products,
        allProducts,
        loading,
        error,
        refetch: () => fetchProducts(true),
        lastUpdated,
    };
};