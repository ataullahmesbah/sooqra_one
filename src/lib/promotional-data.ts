// src/lib/promotional-data.ts

export interface PromotionalData {
    isActive: boolean;
    text: string;
    emoji: string;
    backgroundColor: string;
    textColor: string;
    lastUpdated: string;
}

// Default data
const defaultPromotionalData: PromotionalData = {
    isActive: false,
    text: "Special Offer! Get 20% off on all products",
    emoji: "🎉",
    backgroundColor: "#f59e0b",
    textColor: "#ffffff",
    lastUpdated: new Date().toISOString()
};

// In-memory cache (replace with your database)
let cachedData: PromotionalData = defaultPromotionalData;

export async function getPromotionalData(): Promise<PromotionalData> {
    // TODO: Replace with your database query
    // Example: const data = await db.promotional.findFirst();

    // For now, return cached data
    return cachedData;
}

export async function updatePromotionalData(data: Partial<PromotionalData>): Promise<PromotionalData> {
    // TODO: Update in your database
    // Example: const updated = await db.promotional.update({ where: { id: 1 }, data });

    cachedData = {
        ...cachedData,
        ...data,
        lastUpdated: new Date().toISOString()
    };

    return cachedData;
}

// Admin function to toggle promotional banner
export async function togglePromotionalBanner(isActive: boolean): Promise<PromotionalData> {
    cachedData = {
        ...cachedData,
        isActive,
        lastUpdated: new Date().toISOString()
    };

    return cachedData;
}