// src/app/(with-layout)/my-orders/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import Link from 'next/link';

// Interface Definitions
interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postcode: string;
    country: string;
    district?: string;
    thana?: string;
}

interface OrderProduct {
    productId: string;
    title: string;
    quantity: number;
    price: number;
    size?: string;
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

export default function MyOrders() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin?callbackUrl=/my-orders');
        }
    }, [status, router]);

    // Fetch user orders
    useEffect(() => {
        if (status === 'authenticated') {
            fetchOrders();
        }
    }, [status]);

    // Filter orders based on search
    useEffect(() => {
        if (searchTerm) {
            const filtered = orders.filter(order =>
                order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOrders(filtered);
        } else {
            setFilteredOrders(orders);
        }
    }, [searchTerm, orders]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/users/orders');
            setOrders(response.data);
            setFilteredOrders(response.data);
        } catch (error: any) {
            console.error('Error fetching orders:', error);
            if (error.response?.status === 401) {
                toast.error('Please login to view your orders');
                router.push('/auth/signin');
            } else {
                toast.error('Failed to load orders');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string, paymentMethod: string) => {
        let className = '';
        let text = '';

        if (status === 'accepted') {
            className = 'bg-green-100 text-green-800';
            text = 'Accepted';
        } else if (status === 'pending' || status === 'pending_payment') {
            className = 'bg-yellow-100 text-yellow-800';
            text = 'Pending';
        } else if (status === 'rejected') {
            className = 'bg-red-100 text-red-800';
            text = 'Rejected';
        } else if (status === 'completed') {
            className = 'bg-blue-100 text-blue-800';
            text = 'Completed';
        } else {
            className = 'bg-gray-100 text-gray-800';
            text = status;
        }

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
                {text}
            </span>
        );
    };

    const getPaymentBadge = (paymentMethod: string) => {
        switch (paymentMethod) {
            case 'cod':
                return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">COD</span>;
            case 'bkash':
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">bKash</span>;
            default:
                return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Paid</span>;
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                            <p className="text-gray-600 mt-2">
                                Track and manage all your orders in one place
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/shop"
                                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Search Box */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Order ID (e.g., ORDER_HCTOS5H8D)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
                                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {searchTerm ? 'No matching orders found' : 'No orders yet'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm
                                    ? 'Try a different order ID'
                                    : 'Start shopping to see your orders here'}
                            </p>
                            {!searchTerm && (
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Start Shopping
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-sm font-medium text-gray-900">
                                                    {order.orderId}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {order.customerInfo.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    ৳{order.total.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(order.createdAt)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatTime(order.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(order.status, order.paymentMethod)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getPaymentBadge(order.paymentMethod)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedOrder(null);
                    }}
                />
            )}
        </div>
    );
}

// Order Details Modal Component
interface OrderDetailsModalProps {
    order: Order;
    onClose: () => void;
}

function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
    const formatFullDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                        <p className="text-gray-600 text-sm">Order ID: {order.orderId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Customer Info */}
                        <div>
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                    Customer Information
                                </h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-500">Full Name</label>
                                            <p className="font-medium text-gray-900">{order.customerInfo.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Phone</label>
                                            <p className="font-medium text-gray-900">{order.customerInfo.phone}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Email</label>
                                        <p className="font-medium text-gray-900">{order.customerInfo.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Shipping Address</label>
                                        <p className="font-medium text-gray-900">
                                            {order.customerInfo.address}
                                            {order.customerInfo.city && `, ${order.customerInfo.city}`}
                                            {order.customerInfo.postcode && ` - ${order.customerInfo.postcode}`}
                                        </p>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {order.customerInfo.district && `${order.customerInfo.district}, `}
                                            {order.customerInfo.thana && `${order.customerInfo.thana}, `}
                                            {order.customerInfo.country}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Status Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                    Order Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Order Date:</span>
                                        <span className="font-medium text-gray-900">{formatFullDate(order.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.paymentMethod === 'cod' ? 'bg-orange-100 text-orange-800' :
                                                order.paymentMethod === 'bkash' ? 'bg-green-100 text-green-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' :
                                                order.paymentMethod === 'bkash' ? 'bKash Payment' : 'Online Payment'}
                                        </span>
                                    </div>
                                    {order.couponCode && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Coupon Used:</span>
                                            <span className="font-medium text-purple-600">{order.couponCode}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Order Summary */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                Order Summary
                            </h3>

                            {/* Products List */}
                            <div className="space-y-4 mb-6">
                                {order.products.map((product, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{product.title}</h4>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    <span>Quantity: {product.quantity}</span>
                                                    {product.size && <span className="ml-3">Size: {product.size}</span>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-gray-900">
                                                    ৳{(product.price * product.quantity).toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ৳{product.price.toLocaleString()} each
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Totals */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">
                                            ৳{order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}
                                        </span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>-৳{order.discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {order.shippingCharge > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Shipping</span>
                                            <span className="font-medium">৳{order.shippingCharge.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-2 border-t border-gray-200">
                                        <span className="font-bold text-gray-900 text-lg">Total</span>
                                        <span className="font-bold text-gray-900 text-lg">৳{order.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            // Print order functionality
                                            window.print();
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition-colors"
                                    >
                                        Print Order
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}