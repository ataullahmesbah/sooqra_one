// src/app/checkout/cod-success/page.tsx 
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FaCircleCheck } from "react-icons/fa6";
import Link from 'next/link';

interface OrderProduct {
    title: string;
    quantity: number;
    price: number;
    size?: string;
}

interface CustomerInfo {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    postcode: string;
    country: string;
    district?: string;
    thana?: string;
    bkashNumber?: string;
    transactionId?: string;
}

interface Order {
    _id: string;
    orderId: string;
    customerInfo: CustomerInfo;
    products: OrderProduct[];
    total: number;
    shippingCharge: number;
    discount: number;
    couponCode?: string;
    paymentMethod: string;
    createdAt: string;
    status: string;
}

export default function OrderSuccess() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('orderId');
    const paymentMethod = searchParams.get('payment');

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [retryCount, setRetryCount] = useState<number>(0);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                if (!orderId) {
                    setError('No order ID provided.');
                    setLoading(false);
                    return;
                }

                console.log('Fetching order:', orderId);

                const response = await axios.get(`/api/products/orders?orderId=${orderId}`);

                console.log('Order API Response:', response.data);

                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    const orderData = response.data[0];

                    // Validate order data structure
                    if (!orderData.orderId || !orderData.customerInfo || !orderData.products) {
                        console.error('Invalid order data structure:', orderData);
                        throw new Error('Invalid order data received');
                    }

                    setOrder(orderData);

                    // Show success toast
                    toast.success('Order confirmed! Thank you for your purchase.', {
                        duration: 5000,
                        style: { background: '#1f2937', color: '#fff' },
                    });

                    // Auto-retry if status is not complete (optional)
                    if (orderData.status !== 'completed' && retryCount < 3) {
                        setTimeout(() => {
                            setRetryCount(prev => prev + 1);
                        }, 3000);
                    }
                } else if (Array.isArray(response.data) && response.data.length === 0) {
                    // Order not found yet, retry after delay
                    if (retryCount < 5) {
                        console.log(`Order not found, retrying... (${retryCount + 1}/5)`);
                        setTimeout(() => {
                            setRetryCount(prev => prev + 1);
                        }, 2000);
                    } else {
                        setError('Order not found. It may still be processing. Please check your email for confirmation.');
                    }
                } else {
                    setError('Invalid response from server.');
                }
            } catch (err: any) {
                console.error('Failed to fetch order:', err);

                if (retryCount < 3) {
                    // Retry on error
                    console.log(`Retrying after error... (${retryCount + 1}/3)`);
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                    }, 3000);
                } else {
                    setError(
                        err.response?.data?.error ||
                        err.response?.data?.message ||
                        'Failed to fetch order details. Please check your order confirmation email.'
                    );
                }
            } finally {
                if (retryCount >= 3 || order) {
                    setLoading(false);
                }
            }
        };

        fetchOrder();
    }, [orderId, retryCount]);

    const formatOrderDate = (dateString: string): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'N/A';
        }
    };

    // Format phone number
    const formatPhoneNumber = (phone: string): string => {
        if (!phone) return 'N/A';
        // If phone starts with 880, format as +880
        if (phone.startsWith('880')) {
            return `+${phone}`;
        }
        // If phone starts with 01 and is 11 digits, format as +880
        if (phone.startsWith('01') && phone.length === 11) {
            return `+880${phone.substring(1)}`;
        }
        return phone;
    };

    // Calculate subtotal
    const calculateSubtotal = (): number => {
        if (!order?.products) return 0;
        return order.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
                <Toaster position="top-right" />
                <div className="text-center max-w-md">
                    <div className="h-12 w-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 mt-4">
                        {retryCount > 0 ?
                            `Loading your order... (Retry ${retryCount})` :
                            'Loading your order...'
                        }
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Order ID: <span className="font-mono">{orderId}</span>
                    </p>
                    <div className="mt-4 text-xs text-gray-400">
                        If this takes too long, please check your email for confirmation.
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
                <Toaster position="top-right" />
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
                    <p className="text-gray-600 text-sm mb-6">
                        Order ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{orderId}</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                        >
                            Try Again
                        </button>
                        <Link
                            href="/"
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-right" />
            <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xl">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCircleCheck className="text-green-600 text-4xl" />
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Order Confirmed!
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Thank you for your purchase, {order.customerInfo.name}!
                    </p>

                    {/* Order ID */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-sm text-gray-600">Order ID:</span>
                        <div
                            className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5 group hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                            onClick={() => {
                                navigator.clipboard.writeText(order.orderId);
                                toast.success('Order ID copied!', {
                                    duration: 2000,
                                    style: { background: '#10b981', color: '#fff' },
                                });
                            }}
                        >
                            <span className="text-gray-800 font-mono text-sm font-bold">{order.orderId}</span>
                            <svg className="w-4 h-4 text-gray-600 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500">
                        <span>Date: {formatOrderDate(order.createdAt)}</span>
                        <span>Status: <span className="font-medium text-green-600">{order.status}</span></span>
                        <span>Payment: <span className="font-medium capitalize">{order.paymentMethod}</span></span>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                    <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Order Summary
                    </h3>

                    <div className="space-y-3">
                        {order.products.map((item, index) => (
                            <div key={index} className="flex justify-between items-start pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                                        <span>Qty: {item.quantity}</span>
                                        {item.size && <span>Size: {item.size}</span>}
                                        <span>৳{item.price.toLocaleString()} each</span>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                                    ৳{(item.price * item.quantity).toLocaleString()}
                                </span>
                            </div>
                        ))}

                        {/* Order Totals */}
                        <div className="pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-800">৳{calculateSubtotal().toLocaleString()}</span>
                            </div>

                            {order.shippingCharge > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-gray-800">৳{order.shippingCharge.toLocaleString()}</span>
                                </div>
                            )}

                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Discount {order.couponCode && `(${order.couponCode})`}</span>
                                    <span className="text-green-600">-৳{order.discount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-300 mt-2">
                                <span className="text-gray-900">Total Amount</span>
                                <span className="text-gray-900">৳{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                    <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Customer Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                        <div>
                            <p className="font-medium text-gray-900 mb-1">Contact Details</p>
                            <p>{order.customerInfo.name}</p>
                            <p>{order.customerInfo.email}</p>
                            <p>{formatPhoneNumber(order.customerInfo.phone)}</p>
                        </div>

                        <div>
                            <p className="font-medium text-gray-900 mb-1">Shipping Address</p>
                            <p>{order.customerInfo.address}</p>
                            {order.customerInfo.city && <p>{order.customerInfo.city}</p>}
                            {order.customerInfo.postcode && <p>Postcode: {order.customerInfo.postcode}</p>}
                            {order.customerInfo.district && <p>{order.customerInfo.district}, {order.customerInfo.thana}</p>}
                            <p>{order.customerInfo.country}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                    <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Payment Information
                    </h3>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Method:</span>
                            <span className="font-medium capitalize">
                                {order.paymentMethod === 'cod' ? 'Cash on Delivery' :
                                    order.paymentMethod === 'bkash' ? 'bKash Payment' :
                                        order.paymentMethod}
                            </span>
                        </div>

                        {order.paymentMethod === 'bkash' && order.customerInfo.bkashNumber && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">bKash Number:</span>
                                    <span className="font-medium">{order.customerInfo.bkashNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Transaction ID:</span>
                                    <span className="font-medium font-mono">{order.customerInfo.transactionId}</span>
                                </div>
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-700 text-sm">
                                        ✅ Payment verification in progress. We will notify you once confirmed.
                                    </p>
                                </div>
                            </>
                        )}

                        {order.paymentMethod === 'cod' && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-700 text-sm">
                                    💰 Please keep exact change ready for the delivery person.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Next Steps & Buttons */}
                <div className="text-center">
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-700 text-sm">
                            📧 A confirmation email has been sent to {order.customerInfo.email}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/products"
                            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                        >
                            Continue Shopping
                        </Link>
                        <button
                            onClick={() => router.push('/track/orders')}
                            className="px-6 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            View My Orders
                        </button>

                    </div>

                    <p className="text-gray-500 text-xs mt-6">
                        Need help? Contact our support at support@sooqra.com
                    </p>
                </div>
            </div>
        </div>
    );
}