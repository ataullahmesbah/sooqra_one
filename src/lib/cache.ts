// src/lib/cache.ts
interface CacheData<T> {
    data: T;
    timestamp: number;
    expiry: number;
}

class CacheService {
    private static instance: CacheService;
    private cache: Map<string, CacheData<any>> = new Map();

    private constructor() { }

    static getInstance(): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    set<T>(key: string, data: T, expirySeconds: number = 3600): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiry: expirySeconds * 1000,
        });
    }

    get<T>(key: string): T | null {
        const cached = this.cache.get(key);

        if (!cached) {
            return null;
        }

        const isExpired = Date.now() - cached.timestamp > cached.expiry;

        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return cached.data as T;
    }

    clear(key?: string): void {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    isExpired(key: string): boolean {
        const cached = this.cache.get(key);
        if (!cached) return true;
        return Date.now() - cached.timestamp > cached.expiry;
    }
}

export const cacheService = CacheService.getInstance();