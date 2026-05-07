// src/hooks/useFacebookEvents.ts
'use client';

declare global {
    interface Window {
        fbq: any;
    }
}

export const useFacebookEvents = () => {
    const sendToConversionAPI = async (eventName: string, eventData: any, userData?: any) => {
        try {
            await fetch('/api/fb-conversion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventName, eventData, userData }),
            });
        } catch (error) {
            console.error('Conversion API Error:', error);
        }
    };

    const trackViewContent = (product: any, price: number) => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'ViewContent', {
                content_ids: [product._id],
                content_type: 'product',
                content_name: product.title,
                currency: 'BDT',
                value: price,
            });
        }

        sendToConversionAPI('ViewContent', {
            content_ids: [product._id],
            content_type: 'product',
            content_name: product.title,
            currency: 'BDT',
            value: price,
        });
    };

    const trackAddToCart = (product: any, quantity: number, price: number) => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'AddToCart', {
                content_ids: [product._id],
                content_type: 'product',
                content_name: product.title,
                currency: 'BDT',
                value: price * quantity,
                contents: [{ id: product._id, quantity }],
            });
        }

        sendToConversionAPI('AddToCart', {
            content_ids: [product._id],
            content_type: 'product',
            content_name: product.title,
            currency: 'BDT',
            value: price * quantity,
            contents: [{ id: product._id, quantity }],
        });
    };

    const trackInitiateCheckout = (cartItems: any[], totalValue: number) => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
                content_ids: cartItems.map(item => item._id),
                content_type: 'product',
                currency: 'BDT',
                value: totalValue,
                num_items: cartItems.length,
            });
        }

        sendToConversionAPI('InitiateCheckout', {
            content_ids: cartItems.map(item => item._id),
            content_type: 'product',
            currency: 'BDT',
            value: totalValue,
            num_items: cartItems.length,
        });
    };

    const trackPurchase = (orderData: any, userInfo?: { email?: string; phone?: string }) => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'Purchase', {
                content_ids: orderData.items?.map((item: any) => item.productId) || [],
                content_type: 'product',
                currency: 'BDT',
                value: orderData.totalAmount,
                num_items: orderData.items?.length || 0,
            });
        }

        sendToConversionAPI('Purchase', {
            content_ids: orderData.items?.map((item: any) => item.productId) || [],
            content_type: 'product',
            currency: 'BDT',
            value: orderData.totalAmount,
            num_items: orderData.items?.length || 0,
        }, userInfo);
    };

    return {
        trackViewContent,
        trackAddToCart,
        trackInitiateCheckout,
        trackPurchase,
    };
};