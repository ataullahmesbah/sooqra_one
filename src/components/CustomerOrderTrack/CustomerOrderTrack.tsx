"use client";
import { useState, useCallback, useRef } from "react";
import { 
  FaSearch, 
  FaDownload, 
  FaShoppingBag, 
  FaUser, 
  FaMapMarkerAlt, 
  FaCreditCard, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock 
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

// Type definitions
interface Product {
  title: string;
  price: number;
  quantity: number;
  size?: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  district?: string;
  thana?: string;
  postcode?: string;
  country?: string;
  bkashNumber?: string;
  transactionId?: string;
}

interface Order {
  orderId: string;
  status: string;
  createdAt: string;
  total: number;
  paymentMethod: 'cod' | 'bkash' | 'pay_first' | string;
  customerInfo: CustomerInfo;
  products: Product[];
  discount: number;
  shippingCharge: number;
}

interface StatusInfo {
  color: string;
  bg: string;
  border: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  label: string;
}

interface PaymentMethodDisplay {
  text: string;
  color: string;
  icon: string;
}

const CustomerOrderTrack = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Debounced search function
    const handleSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                toast.error("Please enter an order ID");
                setOrder(null);
                return;
            }

            setLoading(true);
            try {
                const queryParam = `orderId=${encodeURIComponent(query)}`;
                const response = await fetch(`/api/products/orders?${queryParam}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch order");
                }

                if (data.length === 0) {
                    setOrder(null);
                    toast.error("Order not found!");
                    return;
                }

                setOrder(data[0]);
                toast.success("Order found successfully!");
            } catch (error: unknown) {
                console.error("Error fetching order:", error);
                toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Debounce search input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            handleSearch(query);
        }, 500);
    };

    // Format Bkash number for security
    const formatBkashNumber = (number: string | undefined): string => {
        if (!number || number.length !== 11) return number || '';
        return `${number.slice(0, 4)}***${number.slice(7)}`;
    };

    // Get status color and icon with monochrome theme
    const getStatusInfo = (status: string | undefined): StatusInfo => {
        const statusLower = status?.toLowerCase();
        
        switch (statusLower) {
            case 'accepted':
                return {
                    color: 'text-green-700',
                    bg: 'bg-green-100',
                    border: 'border-green-300',
                    icon: FaCheckCircle,
                    gradient: 'from-green-600 to-green-700',
                    label: 'Order Accepted'
                };
            case 'rejected':
                return {
                    color: 'text-red-700',
                    bg: 'bg-red-100',
                    border: 'border-red-300',
                    icon: FaTimesCircle,
                    gradient: 'from-red-600 to-red-700',
                    label: 'Order Rejected'
                };
            case 'pending':
            default:
                return {
                    color: 'text-yellow-700',
                    bg: 'bg-yellow-100',
                    border: 'border-yellow-300',
                    icon: FaClock,
                    gradient: 'from-yellow-600 to-yellow-700',
                    label: 'Pending Review'
                };
        }
    };

    // Get payment method display - monochrome version
    const getPaymentMethodDisplay = (method: string): PaymentMethodDisplay => {
        switch (method) {
            case 'cod':
                return { text: 'Cash on Delivery', color: 'text-gray-800', icon: '💵' };
            case 'bkash':
                return { text: 'bKash Payment', color: 'text-gray-800', icon: '📱' };
            case 'pay_first':
                return { text: 'Online Payment', color: 'text-gray-800', icon: '💳' };
            default:
                return { text: method, color: 'text-gray-800', icon: '💳' };
        }
    };

    const statusInfo = order ? getStatusInfo(order.status) : null;
    const paymentInfo = order ? getPaymentMethodDisplay(order.paymentMethod) : null;
    const StatusIcon = statusInfo?.icon;

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:py-8 sm:px-6 lg:px-8 font-sans">
            <ToastContainer
                position="top-center"
                autoClose={3000}
                theme="light"
                toastClassName="bg-white text-gray-800 border border-gray-300 shadow-lg"
                progressClassName="bg-gray-800"
            />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    {/* Brand Logo */}
                    <div className="flex justify-center items-center gap-3 mb-4 sm:mb-6">
                        {/* <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                            <Image 
                                src="/sooqra.svg" 
                                alt="Sooqra" 
                                fill
                                className="object-contain"
                                priority
                            />
                        </div> */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Sooqra<span className="text-gray-600">.one</span>
                        </h1>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                        Order Tracking
                    </h2>
                    <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
                        Track your order status with real-time updates and delivery information
                    </p>
                </div>

                {/* Search Section */}
                <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
                    <div className="relative">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    placeholder="Enter Order ID (e.g., ORDER_ABC123)"
                                    className="w-full px-4 py-3 sm:py-4 pl-12 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all placeholder-gray-500 shadow-sm"
                                />
                                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <button
                                onClick={() => handleSearch(searchQuery)}
                                className="px-6 py-3 sm:py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 text-sm sm:text-base font-medium shadow-sm hover:shadow"
                            >
                                Track Order
                            </button>
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm mt-2 text-center sm:text-left">
                            Enter your order ID to track status, delivery, and details
                        </p>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12 sm:py-16">
                        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 border-3 border-gray-900 border-t-transparent rounded-full animate-spin mb-4 sm:mb-6"></div>
                        <p className="text-gray-700 text-base sm:text-lg font-medium">Searching for your order...</p>
                        <p className="text-gray-500 text-sm sm:text-base mt-2">Please wait a moment</p>
                    </div>
                )}

                {/* Order Display */}
                {order && !loading && (
                    <div className="space-y-6 sm:space-y-8">
                        {/* Order Overview Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                                {/* Left Section - Order Info */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        {StatusIcon && (
                                            <div className={`p-2 sm:p-3 rounded-lg ${statusInfo?.bg} ${statusInfo?.border} border`}>
                                                <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${statusInfo?.color}`} />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-all">
                                                Order #{order.orderId}
                                            </h2>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                                                <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${statusInfo?.bg} ${statusInfo?.color} ${statusInfo?.border} border w-fit`}>
                                                    {statusInfo?.label}
                                                </span>
                                                <span className="text-gray-600 text-xs sm:text-sm flex items-center gap-2">
                                                    <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section - Amount */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 lg:gap-6">
                                    <div className="text-center sm:text-right">
                                        <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Amount</p>
                                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                                            ৳{order.total.toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        disabled
                                        className="px-4 py-2.5 sm:px-5 sm:py-3 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-sm sm:text-base font-medium cursor-not-allowed opacity-70"
                                        title="Invoice system is currently unavailable"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <FaDownload className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Invoice
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                            {/* Left Column - Customer & Payment Info */}
                            <div className="space-y-6 sm:space-y-8">
                                {/* Customer Information */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4 sm:mb-5">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Customer Information</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Full Name</p>
                                            <p className="text-gray-900 font-medium">{order.customerInfo.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Email Address</p>
                                            <p className="text-gray-900">{order.customerInfo.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Phone Number</p>
                                            <p className="text-gray-900 font-medium">{order.customerInfo.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4 sm:mb-5">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <FaCreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payment Details</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Payment Method</p>
                                            <p className={`font-medium ${paymentInfo?.color} flex items-center gap-2 text-base`}>
                                                <span>{paymentInfo?.icon}</span>
                                                {paymentInfo?.text}
                                            </p>
                                        </div>
                                        {order.paymentMethod === 'bkash' && order.customerInfo.bkashNumber && (
                                            <>
                                                <div className="pt-2 border-t border-gray-100">
                                                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">bKash Number</p>
                                                    <p className="text-gray-900 font-mono text-sm">
                                                        {formatBkashNumber(order.customerInfo.bkashNumber)}
                                                    </p>
                                                </div>
                                                {order.customerInfo.transactionId && (
                                                    <div>
                                                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Transaction ID</p>
                                                        <p className="text-gray-900 font-mono text-sm">{order.customerInfo.transactionId}</p>
                                                    </div>
                                                )}
                                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mt-2">
                                                    <p className="text-gray-600 text-xs text-center">
                                                        🔒 For security, bKash number is partially hidden
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Middle Column - Order Items */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm h-full">
                                    <div className="flex items-center gap-3 mb-5 sm:mb-6">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <FaShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Order Items</h3>
                                    </div>

                                    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                                        {order.products.map((product, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                                <div className="flex-1">
                                                    <p className="text-gray-900 font-medium text-sm sm:text-base">{product.title}</p>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        {product.size && (
                                                            <span className="text-gray-600 text-xs sm:text-sm">Size: {product.size}</span>
                                                        )}
                                                        <span className="text-gray-600 text-xs sm:text-sm">Qty: {product.quantity}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-gray-900 text-sm sm:text-base">৳{product.price.toLocaleString()}</p>
                                                    <p className="text-gray-700 font-semibold text-sm sm:text-base">
                                                        ৳{(product.price * product.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="border-t border-gray-200 pt-5 sm:pt-6">
                                        <h4 className="text-gray-900 font-semibold text-sm sm:text-base mb-4">Order Summary</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm sm:text-base">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="text-gray-900 font-medium">৳{order.products.reduce((sum, p) => sum + p.quantity * p.price, 0).toLocaleString()}</span>
                                            </div>
                                            {order.discount > 0 && (
                                                <div className="flex justify-between text-sm sm:text-base">
                                                    <span className="text-gray-600">Discount</span>
                                                    <span className="text-red-600 font-medium">-৳{order.discount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {order.shippingCharge > 0 && (
                                                <div className="flex justify-between text-sm sm:text-base">
                                                    <span className="text-gray-600">Shipping</span>
                                                    <span className="text-gray-900 font-medium">৳{order.shippingCharge.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-base sm:text-lg font-bold pt-3 border-t border-gray-300">
                                                <span className="text-gray-900">Total Amount</span>
                                                <span className="text-gray-900">৳{order.total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4 sm:mb-5">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <FaMapMarkerAlt className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Shipping Address</h3>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                <p className="text-gray-900 font-medium text-sm sm:text-base">{order.customerInfo.name}</p>
                                <p className="text-gray-700 text-sm sm:text-base">{order.customerInfo.address}</p>
                                <p className="text-gray-700 text-sm sm:text-base">
                                    {[
                                        order.customerInfo.city,
                                        order.customerInfo.district,
                                        order.customerInfo.thana,
                                    ]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                                <p className="text-gray-700 text-sm sm:text-base">
                                    {order.customerInfo.postcode && `${order.customerInfo.postcode}, `}
                                    {order.customerInfo.country}
                                </p>
                                <div className="pt-3 border-t border-gray-100">
                                    <p className="text-gray-900 font-medium text-sm sm:text-base flex items-center gap-2">
                                        <span className="text-gray-600">📞</span>
                                        {order.customerInfo.phone}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* No Results */}
                {searchQuery && !order && !loading && (
                    <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-gray-400">
                            <FaSearch className="w-full h-full" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Order Not Found</h3>
                        <p className="text-gray-600 max-w-md mx-auto px-4 text-sm sm:text-base">
                            No order found with ID: <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{searchQuery}</span>
                        </p>
                        <p className="text-gray-500 text-sm sm:text-base mt-3 sm:mt-4">
                            Please check your order ID and try again
                        </p>
                    </div>
                )}

                {/* Empty State - Initial */}
                {!searchQuery && !order && !loading && (
                    <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-center mb-4 sm:mb-6">
                            <div className="p-4 bg-gray-100 rounded-full">
                                <FaSearch className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
                            </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Track Your Order</h3>
                        <p className="text-gray-600 max-w-md mx-auto px-4 text-sm sm:text-base">
                            Enter your order ID in the search bar above to view order status, details, and delivery information
                        </p>
                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs sm:text-sm text-gray-500">
                            <span className="bg-gray-100 px-3 py-1 rounded">Order Status</span>
                            <span className="hidden sm:block">•</span>
                            <span className="bg-gray-100 px-3 py-1 rounded">Payment Details</span>
                            <span className="hidden sm:block">•</span>
                            <span className="bg-gray-100 px-3 py-1 rounded">Shipping Info</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Note */}
            <div className="mt-8 sm:mt-12 text-center">
                <p className="text-gray-500 text-sm">
                    Need help? Contact our support team at{" "}
                    <a href="mailto:support@sooqra.one" className="text-gray-700 font-medium hover:text-gray-900">
                        support@sooqra.one
                    </a>
                </p>
                <p className="text-gray-400 text-xs mt-2">
                    © {new Date().getFullYear()} Sooqra.one. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default CustomerOrderTrack;