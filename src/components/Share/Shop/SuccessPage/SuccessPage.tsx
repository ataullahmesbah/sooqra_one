'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FaCircleCheck } from 'react-icons/fa6';
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
}

interface PaymentDetails {
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
    paymentDetails?: PaymentDetails;
    createdAt: string;
    status: string;
}

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const clearCart = searchParams.get('clearCart');

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [cartCleared, setCartCleared] = useState<boolean>(false);

    // কার্ট ক্লিয়ার (একবারই)
    useEffect(() => {
        if (clearCart === 'true' && orderId) {
            const key = `cart_cleared_${orderId}`;
            const alreadyCleared = sessionStorage.getItem(key);

            if (!alreadyCleared && !cartCleared) {
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('cartUpdated'));
                setCartCleared(true);
                sessionStorage.setItem(key, 'true');
            }
        }
    }, [clearCart, orderId, cartCleared]);

    // অর্ডার ফেচ করো
    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                setError('No order ID provided.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/api/products/orders?orderId=${orderId}`);
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    setOrder(response.data[0]);
                    toast.success('Payment successful! Your order is confirmed.', {
                        duration: 5000,
                        style: { background: '#1f2937', color: '#fff' },
                    });
                } else {
                    setError('Order not found.');
                }
            } catch (err) {
                console.error('Failed to fetch order:', err);
                setError('Failed to load order details.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const formatOrderDate = (dateString: string): string => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // Loading
    if (loading || !orderId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
                <Toaster position="top-right" />
                <div className="text-center animate-pulse">
                    <div className="h-10 w-10 bg-gray-200 rounded-full mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading your order...</p>
                </div>
            </div>
        );
    }

    // Error
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
                    <Link href="/" className="mt-6 inline-block px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!order) return null;

    // Success UI
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-right" />
            <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xl">

                {/* Brand Header */}
                <div className="flex justify-center mb-8">
                    <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3">
                        <h4 className="text-gray-800 text-lg font-bold flex items-center justify-center gap-2">
                            <span className="bg-gradient-to-r from-gray-600/20 to-transparent px-3 py-1 rounded-md">SOOQRA</span>
                            <span className="bg-gradient-to-r from-gray-600/20 to-transparent text-gray-800 px-3 py-1 rounded-sm transform -rotate-2">
                                One
                            </span>
                        </h4>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCircleCheck className="text-green-600 text-3xl" />
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Thank you, {order.customerInfo.name}!
                    </h1>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Order is Confirmed</h2>

                    {/* Order ID with Copy */}
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <p className="text-sm text-gray-600">Order ID:</p>
                        <div
                            className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5 group hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                            onClick={() => {
                                navigator.clipboard.writeText(orderId);
                                toast.success('Order ID copied!', {
                                    duration: 2000,
                                    style: { background: '#10b981', color: '#fff' },
                                });
                            }}
                        >
                            <span className="text-gray-800 font-mono text-sm">{orderId}</span>
                            <svg className="w-4 h-4 text-gray-600 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500">Placed on: {formatOrderDate(order.createdAt)}</p>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                    <h3 className="text-gray-900 font-bold text-lg mb-4">Payment Information</h3>
                    <div className="text-sm text-gray-700 space-y-2">
                        <p className="flex items-start">
                            <span className="font-medium w-32">Payment Method:</span>
                            <span className="text-gray-800 ml-2">Online Payment (SSLCommerz)</span>
                        </p>
                        {order.paymentDetails?.transactionId && (
                            <p className="flex items-start">
                                <span className="font-medium w-32">Transaction ID:</span>
                                <span className="text-gray-800 ml-2">{order.paymentDetails.transactionId}</span>
                            </p>
                        )}
                        <p className="flex items-start">
                            <span className="font-medium w-32">Amount Paid:</span>
                            <span className="text-gray-800 ml-2 font-semibold">৳{order.total.toLocaleString()}</span>
                        </p>
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 text-sm flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Your payment has been successfully processed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                    <h3 className="text-gray-900 font-bold text-lg mb-4">Order Summary</h3>
                    <div className="space-y-3">
                        {order.products.map((item, index) => (
                            <div key={index} className="flex justify-between items-start pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                                        {item.size && (
                                            <span className="text-xs text-gray-600">Size: {item.size}</span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                                    ৳{(item.price * item.quantity).toLocaleString()}
                                </span>
                            </div>
                        ))}

                        <div className="pt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-800">৳{(order.products.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-gray-800">৳{order.shippingCharge.toLocaleString()}</span>
                            </div>

                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Discount {order.couponCode && `(${order.couponCode})`}</span>
                                    <span className="text-red-600">-৳{order.discount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-300">
                                <span className="text-gray-900">Total</span>
                                <span className="text-gray-900">৳{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                    <h3 className="text-gray-900 font-bold text-lg mb-4">Shipping Details</h3>
                    <div className="text-sm text-gray-700 space-y-2">
                        <p className="flex items-start">
                            <span className="font-medium w-20">Name:</span>
                            <span className="ml-2">{order.customerInfo.name}</span>
                        </p>
                        <p className="flex items-start">
                            <span className="font-medium w-20">Phone:</span>
                            <span className="ml-2">{order.customerInfo.phone}</span>
                        </p>
                        <p className="flex items-start">
                            <span className="font-medium w-20">Email:</span>
                            <span className="ml-2">{order.customerInfo.email}</span>
                        </p>
                        <p className="flex items-start">
                            <span className="font-medium w-20">Address:</span>
                            <span className="ml-2">
                                {order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.postcode}, {order.customerInfo.country}
                            </span>
                        </p>
                        {order.customerInfo.district && (
                            <p className="flex items-start">
                                <span className="font-medium w-20">District:</span>
                                <span className="ml-2">{order.customerInfo.district}</span>
                            </p>
                        )}
                        {order.customerInfo.thana && (
                            <p className="flex items-start">
                                <span className="font-medium w-20">Thana:</span>
                                <span className="ml-2">{order.customerInfo.thana}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Cart Cleared Message */}
                {cartCleared && (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-sm flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Your cart has been cleared
                        </p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link
                        href="/shop"
                        className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium text-center"
                    >
                        Continue Shopping
                    </Link>
                    <Link
                        href="/shop/track/orders"
                        className="px-6 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-center"
                    >
                        View My Orders
                    </Link>
                </div>
            </div>
        </div>
    );
}