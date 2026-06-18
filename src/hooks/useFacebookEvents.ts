// src/hooks/useFacebookEvents.ts
'use client';

declare global {
    interface Window {
        fbq: any;
    }
}

// ── CAPI helper — sends server-side event ─────────────────────────────────────
async function sendCAPI(eventName: string, eventData: any, userData?: any) {
    try {
        await fetch('/api/fb-conversion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventName, eventData, userData }),
        });
    } catch (error) {
        // Silently fail — tracking should never break UX
        console.warn('CAPI send failed:', error);
    }
}

// ── Browser pixel helper — only fires if fbq is loaded ───────────────────────
function fireBrowserPixel(eventName: string, data: any, options?: { eventID?: string }) {
    if (typeof window === 'undefined' || !window.fbq) return;
    window.fbq('track', eventName, data, options ? { eventID: options.eventID } : undefined);
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useFacebookEvents = () => {

    // ✅ ViewContent
    const trackViewContent = (product: any, price: number) => {
        const data = {
            content_ids: [product._id],
            content_type: 'product',
            content_name: product.title,
            currency: 'BDT',
            value: price,
        };
        fireBrowserPixel('ViewContent', data);
        sendCAPI('ViewContent', data);
    };

    // ✅ AddToCart
    const trackAddToCart = (product: any, quantity: number, price: number) => {
        const data = {
            content_ids: [product._id],
            content_type: 'product',
            content_name: product.title,
            currency: 'BDT',
            value: price * quantity,
            contents: [{ id: product._id, quantity }],
        };
        fireBrowserPixel('AddToCart', data);
        sendCAPI('AddToCart', data);
    };

    // ✅ InitiateCheckout
    const trackInitiateCheckout = (cartItems: any[], totalValue: number) => {
        const data = {
            content_ids: cartItems.map(item => item._id),
            content_type: 'product',
            currency: 'BDT',
            value: totalValue,
            num_items: cartItems.length,
        };
        fireBrowserPixel('InitiateCheckout', data);
        sendCAPI('InitiateCheckout', data);
    };

    // ✅ Purchase — most important event, sends user PII hashed via CAPI
    const trackPurchase = (
        orderData: any,
        userInfo?: { email?: string; phone?: string; firstName?: string; lastName?: string }
    ) => {
        const data = {
            content_ids: orderData.items?.map((item: any) => item.productId) || [],
            content_type: 'product',
            currency: 'BDT',
            value: orderData.totalAmount,
            num_items: orderData.items?.length || 0,
        };
        fireBrowserPixel('Purchase', data);
        // ✅ Pass user info to CAPI so backend hashes it with SHA-256
        sendCAPI('Purchase', data, userInfo);
    };

    // ✅ Search
    const trackSearch = (searchString: string) => {
        const data = { search_string: searchString };
        fireBrowserPixel('Search', data);
        sendCAPI('Search', data);
    };

    // ✅ PageView — call manually where needed (layout handles it globally via fbq init)
    const trackPageView = () => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'PageView');
        }
    };

    return {
        trackViewContent,
        trackAddToCart,
        trackInitiateCheckout,
        trackPurchase,
        trackSearch,
        trackPageView,
    };
};