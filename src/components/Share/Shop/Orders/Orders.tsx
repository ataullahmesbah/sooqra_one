'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Toaster, toast } from 'react-hot-toast';
import ShippingLabel from '../ShippingLabel/ShippingLabel';


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
    bkashNumber?: string;
    transactionId?: string;
}

interface OrderProduct {
    productId: string;
    title: string;
    quantity: number;
    price: number;
    mainImage?: string;
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
    updatedAt?: string;
    status: string;
    paymentDetails?: any;
}

interface OrderStats {
    pending: number;
    accepted: number;
    rejected: number;
    monthly: number;
}

interface GroupedProduct {
    productId: string;
    title: string;
    price: number;
    mainImage?: string;
    size: string | null;
    quantity: number;
}

interface ValidationResult {
    isValid: boolean;
    issues: string[];
    orderId?: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showCustomerInfo, setShowCustomerInfo] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [stats, setStats] = useState<OrderStats>({ pending: 0, accepted: 0, rejected: 0, monthly: 0 });
    const [loading, setLoading] = useState<boolean>(false);
    const [validatingOrder, setValidatingOrder] = useState<string | null>(null);
    const ordersPerPage = 10;
    const router = useRouter();
    const [showShippingLabel, setShowShippingLabel] = useState<boolean>(false);
    const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);
    const [exporting, setExporting] = useState<boolean>(false);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const modalRef = useRef<HTMLDivElement>(null);

    // Fetch orders on component mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter orders when dependencies change
    useEffect(() => {
        filterOrders(orders, activeTab, searchTerm, selectedDate);
    }, [activeTab, searchTerm, selectedDate, orders]);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setShowCustomerInfo(false);
            }
        };

        if (showCustomerInfo) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCustomerInfo]);

    const fetchOrders = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await axios.get('/api/products/orders');
            const sortedOrders = response.data.sort((a: Order, b: Order) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(sortedOrders);
            updateStats(sortedOrders);
            filterOrders(sortedOrders, activeTab, searchTerm, selectedDate);
        } catch (error: any) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (orders: Order[]): void => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const stats: OrderStats = {
            pending: orders.filter(o => o.status === 'pending' || o.status === 'pending_payment').length,
            accepted: orders.filter(o => o.status === 'accepted').length,
            rejected: orders.filter(o => o.status === 'rejected').length,
            monthly: orders.filter(o => {
                const orderDate = new Date(o.createdAt);
                return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
            }).length,
        };
        setStats(stats);
    };

    const filterOrders = (
        orders: Order[],
        tab: string,
        search: string,
        date: Date | null
    ): void => {
        let filtered = [...orders];

        // Filter by status tab
        if (tab === 'pending') {
            filtered = filtered.filter(o => o.status === 'pending' || o.status === 'pending_payment');
        } else if (tab === 'accepted') {
            filtered = filtered.filter(o => o.status === 'accepted');
        } else if (tab === 'rejected') {
            filtered = filtered.filter(o => o.status === 'rejected');
        }

        // Filter by search term
        if (search) {
            filtered = filtered.filter(o =>
                o.orderId.toLowerCase().includes(search.toLowerCase()) ||
                o.customerInfo.name.toLowerCase().includes(search.toLowerCase()) ||
                o.customerInfo.phone.includes(search) ||
                o.customerInfo.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Filter by date
        if (date) {
            filtered = filtered.filter(o => {
                const orderDate = new Date(o.createdAt);
                return (
                    orderDate.getDate() === date.getDate() &&
                    orderDate.getMonth() === date.getMonth() &&
                    orderDate.getFullYear() === date.getFullYear()
                );
            });
        }

        setFilteredOrders(filtered);
        setCurrentPage(1);
    };

    const validateOrderProducts = async (order: Order): Promise<ValidationResult> => {
        try {
            setValidatingOrder(order.orderId);
            const response = await axios.post('/api/products/orders/validate-products', {
                orderId: order.orderId,
                products: order.products
            });
            return response.data;
        } catch (error: any) {
            console.error('Error validating order products:', error);
            if (error.response?.data?.error) {
                toast.error(error.response.data.error, {
                    duration: 5000,
                    style: {
                        background: '#ef4444',
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                });
                return { isValid: false, issues: [error.response.data.error] };
            } else {
                toast.error('Failed to validate products. Please try again.', {
                    duration: 3000,
                    style: {
                        background: '#ef4444',
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                });
                return { isValid: false, issues: ['Validation error. Please try again.'] };
            }
        } finally {
            setValidatingOrder(null);
        }
    };

    // Order Management Page - handleAction ফাংশন আপডেট
    const handleAction = async (orderId: string, action: 'accept' | 'reject'): Promise<void> => {
        try {
            console.log(`Attempting ${action} for order: ${orderId}`);

            const order = orders.find(o => o.orderId === orderId);
            if (!order) {
                toast.error('Order not found');
                return;
            }

            // Additional validation before accept
            if (action === 'accept') {
                console.log('Validating before accept...');

                // Check if all products are available
                for (const product of order.products) {
                    try {
                        const productResponse = await axios.get(`/api/products/${product.productId}`);
                        const productData = productResponse.data;

                        console.log(`Product: ${productData.title}, Available: ${productData.quantity}, Required: ${product.quantity}`);

                        if (productData.availability !== 'InStock') {
                            toast.error(`Product "${productData.title}" is out of stock`);
                            return;
                        }

                        if (product.size && productData.sizeRequirement === 'Mandatory') {
                            const sizeData = productData.sizes.find((s: any) => s.name === product.size);
                            if (!sizeData) {
                                toast.error(`Size "${product.size}" not available for "${productData.title}"`);
                                return;
                            }
                            if (sizeData.quantity < product.quantity) {
                                toast.error(`Only ${sizeData.quantity} units available for "${productData.title}" (Size: ${product.size})`);
                                return;
                            }
                        } else if (productData.quantity < product.quantity) {
                            toast.error(`Only ${productData.quantity} units available for "${productData.title}"`);
                            return;
                        }
                    } catch (error) {
                        console.error(`Error checking product ${product.productId}:`, error);
                        toast.error(`Failed to check availability for "${product.title}"`);
                        return;
                    }
                }
            }

            // Perform the action
            setValidatingOrder(orderId);

            // TEMPORARY: Try direct update if regular API fails
            const performAction = async () => {
                try {
                    const response = await axios.post('/api/products/orders/action', {
                        orderId,
                        action
                    });
                    return response;
                } catch (error: any) {
                    console.log('Regular API failed, trying direct update...');

                    // Fallback to direct update
                    const status = action === 'accept' ? 'accepted' : 'rejected';
                    const directResponse = await axios.post('/api/products/orders/direct-update', {
                        orderId,
                        status
                    });
                    return directResponse;
                }
            };

            const response = await performAction();

            console.log('Action response:', response.data);

            if (response.data.success) {
                // Update local state
                setOrders((prev) =>
                    prev.map((o) =>
                        o.orderId === orderId
                            ? {
                                ...o,
                                status: action === 'accept' ? 'accepted' : 'rejected',
                                updatedAt: new Date().toISOString()
                            }
                            : o
                    )
                );

                // Update stats
                updateStats(orders);

                // Refresh filtered orders
                filterOrders(orders, activeTab, searchTerm, selectedDate);

                // Show success message
                toast.success(`Order ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`, {
                    duration: 3000,
                    style: {
                        background: action === 'accept' ? '#10b981' : '#ef4444',
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                });

                // Force refresh orders from server
                setTimeout(() => {
                    fetchOrders();
                }, 1000);

                // If we're in modal, close it
                if (showCustomerInfo) {
                    setShowCustomerInfo(false);
                }
            } else {
                throw new Error(response.data.error || `Failed to ${action} order`);
            }
        } catch (error: any) {
            console.error(`Error performing ${action} on order ${orderId}:`, error);

            let errorMessage = `Failed to ${action} order. Please try again.`;

            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.details) {
                // Show all validation errors
                if (Array.isArray(error.response.data.details)) {
                    error.response.data.details.forEach((detail: string) => {
                        toast.error(detail, {
                            duration: 5000,
                            style: {
                                background: '#ef4444',
                                color: '#fff',
                                fontWeight: 'bold'
                            }
                        });
                    });
                    return;
                }
            }

            toast.error(errorMessage, {
                duration: 5000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });
        } finally {
            setValidatingOrder(null);
        }
    };

    const groupProductsBySize = (products: OrderProduct[]): GroupedProduct[] => {
        const grouped: { [key: string]: GroupedProduct } = {};
        products.forEach(product => {
            const key = `${product.productId}-${product.size || 'no-size'}`;
            if (!grouped[key]) {
                grouped[key] = {
                    productId: product.productId,
                    title: product.title,
                    price: product.price,
                    mainImage: product.mainImage,
                    size: product.size || null,
                    quantity: 0
                };
            }
            grouped[key].quantity += product.quantity;
        });
        return Object.values(grouped);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatSize = (size?: string): string => {
        if (!size || typeof size !== 'string' || size.trim() === '') {
            return 'N/A';
        }
        return size.charAt(0).toUpperCase() + size.slice(1).toLowerCase();
    };

    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ordersPerPage,
        currentPage * ordersPerPage
    );

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const handlePrintLabel = (order: Order): void => {
        setSelectedOrderForLabel(order);
        setShowShippingLabel(true);
    };

    const exportOrdersToCSV = async (): Promise<void> => {
        try {
            setExporting(true);
            const ordersToExport = filteredOrders.length > 0 ? filteredOrders : orders;

            const headers = [
                'Order ID',
                'Customer Name',
                'Email',
                'Phone',
                'Address',
                'Payment Method',
                'Total Amount',
                'Discount',
                'Shipping Charge',
                'Status',
                'Order Date',
                'Products Count'
            ];

            const rows = ordersToExport.map(order => [
                order.orderId,
                order.customerInfo.name,
                order.customerInfo.email,
                order.customerInfo.phone,
                order.customerInfo.address,
                order.paymentMethod === 'cod' ? 'Cash on Delivery' :
                    order.paymentMethod === 'bkash' ? 'bKash' : 'Online',
                order.total.toString(),
                order.discount.toString(),
                order.shippingCharge.toString(),
                order.status,
                formatDate(order.createdAt),
                order.products.reduce((sum, p) => sum + p.quantity, 0).toString()
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Orders exported successfully!', {
                duration: 3000,
                style: { background: '#10b981', color: '#fff' }
            });
        } catch (error) {
            console.error('Error exporting orders:', error);
            toast.error('Failed to export orders');
        } finally {
            setExporting(false);
        }
    };

    const toggleSelectOrder = (orderId: string): void => {
        const newSelected = new Set(selectedOrders);
        if (newSelected.has(orderId)) {
            newSelected.delete(orderId);
        } else {
            newSelected.add(orderId);
        }
        setSelectedOrders(newSelected);
    };

    const toggleSelectAll = (): void => {
        if (selectedOrders.size === paginatedOrders.length) {
            setSelectedOrders(new Set());
        } else {
            const allIds = paginatedOrders.map(order => order.orderId);
            setSelectedOrders(new Set(allIds));
        }
    };

    const handleBulkAction = async (action: 'accept' | 'reject'): Promise<void> => {
        if (selectedOrders.size === 0) {
            toast.error('Please select at least one order');
            return;
        }

        if (action === 'accept') {
            // Validate all selected orders first
            const invalidOrders: string[] = [];

            for (const orderId of selectedOrders) {
                const order = orders.find(o => o.orderId === orderId);
                if (order) {
                    const validation = await validateOrderProducts(order);
                    if (!validation.isValid) {
                        invalidOrders.push(order.orderId);
                    }
                }
            }

            if (invalidOrders.length > 0) {
                toast.error(`Cannot accept orders: ${invalidOrders.join(', ')}. Please check stock.`);
                return;
            }
        }

        try {
            const promises = Array.from(selectedOrders).map(orderId =>
                axios.post('/api/products/orders/action', { orderId, action })
            );

            await Promise.all(promises);

            // Update local state
            setOrders(prev => prev.map(order =>
                selectedOrders.has(order.orderId)
                    ? { ...order, status: action === 'accept' ? 'accepted' : 'rejected' }
                    : order
            ));

            updateStats(orders);
            filterOrders(orders, activeTab, searchTerm, selectedDate);
            setSelectedOrders(new Set());

            toast.success(`${selectedOrders.size} orders ${action}ed successfully!`, {
                duration: 3000,
                style: {
                    background: action === 'accept' ? '#10b981' : '#ef4444',
                    color: '#fff'
                }
            });
        } catch (error) {
            console.error('Error in bulk action:', error);
            toast.error('Failed to process bulk action');
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'pending':
            case 'pending_payment':
                return 'bg-blue-500/20 text-blue-400';
            case 'accepted':
                return 'bg-green-500/20 text-green-400';
            case 'rejected':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getPaymentMethodColor = (method: string): string => {
        switch (method) {
            case 'cod':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'bkash':
                return 'bg-green-500/20 text-green-400';
            default:
                return 'bg-blue-500/20 text-blue-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'linear-gradient(135deg, #363636, #4b4b4b)',
                        color: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                        padding: '12px 16px',
                        fontWeight: 500,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: '1px solid rgba(16, 185, 129, 0.5)',
                        },
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        ),
                    },
                    error: {
                        duration: 5000,
                        style: {
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                        },
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ),
                    },
                }}
            />

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                        <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={exportOrdersToCSV}
                            disabled={exporting || orders.length === 0}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {exporting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export CSV
                                </>
                            )}
                        </button>

                        <button
                            onClick={fetchOrders}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Pending Orders</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Accepted Orders</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.accepted}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Rejected Orders</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.rejected}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">This Month</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.monthly}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs and Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'pending'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            Pending ({stats.pending})
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'accepted'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            onClick={() => setActiveTab('accepted')}
                        >
                            Accepted ({stats.accepted})
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'rejected'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            onClick={() => setActiveTab('rejected')}
                        >
                            Rejected ({stats.rejected})
                        </button>
                    </div>

                    {/* Search and Filter Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                placeholderText="Filter by date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                isClearable
                            />
                        </div>

                        {selectedOrders.size > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleBulkAction('accept')}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                    Accept Selected ({selectedOrders.size})
                                </button>
                                <button
                                    onClick={() => handleBulkAction('reject')}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                >
                                    Reject Selected ({selectedOrders.size})
                                </button>
                                <button
                                    onClick={() => setSelectedOrders(new Set())}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-gray-600 mt-4">Loading orders...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="w-12 px-6 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={paginatedOrders.length > 0 && selectedOrders.size === paginatedOrders.length}
                                                    onChange={toggleSelectAll}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="px-6 py-12 text-center">
                                                    <div className="text-gray-400">
                                                        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        <p className="text-lg font-medium">No orders found</p>
                                                        <p className="text-sm mt-1">Try changing your search or filter criteria</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedOrders.map((order) => {
                                                const groupedProducts = groupProductsBySize(order.products);
                                                return (
                                                    <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedOrders.has(order.orderId)}
                                                                onChange={() => toggleSelectOrder(order.orderId)}
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-mono text-sm font-medium text-gray-900">{order.orderId}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <div className="font-medium text-gray-900">{order.customerInfo.name}</div>
                                                                <div className="text-sm text-gray-500">{order.customerInfo.phone}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="max-w-xs">
                                                                {groupedProducts.slice(0, 2).map((product, index) => (
                                                                    <div key={index} className="mb-2 last:mb-0">
                                                                        <div className="font-medium text-sm text-gray-900">{product.title}</div>
                                                                        <div className="text-xs text-gray-500">
                                                                            Qty: {product.quantity} × ৳{product.price.toLocaleString()}
                                                                            {product.size && ` • Size: ${formatSize(product.size)}`}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {groupedProducts.length > 2 && (
                                                                    <div className="text-xs text-blue-600 font-medium">
                                                                        +{groupedProducts.length - 2} more items
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-gray-900">৳{order.total.toLocaleString()}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(order.paymentMethod)}`}>
                                                                {order.paymentMethod === 'cod' ? 'COD' :
                                                                    order.paymentMethod === 'bkash' ? 'bKash' : 'Online'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                                {order.status.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedOrder(order);
                                                                        setShowCustomerInfo(true);
                                                                    }}
                                                                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-medium transition-colors"
                                                                >
                                                                    View
                                                                </button>

                                                                {(order.status === 'pending' || order.status === 'pending_payment') && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleAction(order.orderId, 'accept')}
                                                                            disabled={validatingOrder === order.orderId}
                                                                            className="px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs font-medium transition-colors disabled:opacity-50"
                                                                        >
                                                                            {validatingOrder === order.orderId ? 'Checking...' : 'Accept'}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleAction(order.orderId, 'reject')}
                                                                            className="px-3 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-xs font-medium transition-colors"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {order.status === 'accepted' && (
                                                                    <button
                                                                        onClick={() => handlePrintLabel(order)}
                                                                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-xs font-medium transition-colors flex items-center gap-1"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                                        </svg>
                                                                        Print
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{(currentPage - 1) * ordersPerPage + 1}</span> to{' '}
                                            <span className="font-medium">{Math.min(currentPage * ordersPerPage, filteredOrders.length)}</span> of{' '}
                                            <span className="font-medium">{filteredOrders.length}</span> results
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>

                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum: number;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`px-3 py-1 rounded-lg text-sm ${currentPage === pageNum
                                                            ? 'bg-blue-600 text-white'
                                                            : 'border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {showCustomerInfo && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                                <p className="text-gray-600 text-sm">Order ID: {selectedOrder.orderId}</p>
                            </div>
                            <button
                                onClick={() => setShowCustomerInfo(false)}
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
                                            <div>
                                                <label className="text-sm text-gray-500">Full Name</label>
                                                <p className="font-medium text-gray-900">{selectedOrder.customerInfo.name}</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm text-gray-500">Email</label>
                                                    <p className="font-medium text-gray-900">{selectedOrder.customerInfo.email}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-gray-500">Phone</label>
                                                    <p className="font-medium text-gray-900">{selectedOrder.customerInfo.phone}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-500">Shipping Address</label>
                                                <p className="font-medium text-gray-900">
                                                    {selectedOrder.customerInfo.address}
                                                    {selectedOrder.customerInfo.city && `, ${selectedOrder.customerInfo.city}`}
                                                    {selectedOrder.customerInfo.postcode && ` - ${selectedOrder.customerInfo.postcode}`}
                                                </p>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {selectedOrder.customerInfo.district && `${selectedOrder.customerInfo.district}, `}
                                                    {selectedOrder.customerInfo.thana && `${selectedOrder.customerInfo.thana}, `}
                                                    {selectedOrder.customerInfo.country}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Status Section */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                            Order Status
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Current Status:</span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                                    {selectedOrder.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Payment Method:</span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentMethodColor(selectedOrder.paymentMethod)}`}>
                                                    {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' :
                                                        selectedOrder.paymentMethod === 'bkash' ? 'bKash Payment' : 'Online Payment'}
                                                </span>
                                            </div>
                                            {selectedOrder.couponCode && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Coupon Used:</span>
                                                    <span className="font-medium text-purple-600">{selectedOrder.couponCode}</span>
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

                                    <div className="space-y-4 mb-6">
                                        {groupProductsBySize(selectedOrder.products).map((product, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{product.title}</h4>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            <span>Quantity: {product.quantity}</span>
                                                            {product.size && <span className="ml-3">Size: {formatSize(product.size)}</span>}
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
                                                    ৳{selectedOrder.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}
                                                </span>
                                            </div>
                                            {selectedOrder.discount > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Discount</span>
                                                    <span>-৳{selectedOrder.discount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {selectedOrder.shippingCharge > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Shipping</span>
                                                    <span className="font-medium">৳{selectedOrder.shippingCharge.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between pt-2 border-t border-gray-200">
                                                <span className="font-bold text-gray-900">Total</span>
                                                <span className="font-bold text-gray-900">৳{selectedOrder.total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <div className="flex gap-3">
                                            {selectedOrder.status === 'accepted' && (
                                                <button
                                                    onClick={() => {
                                                        handlePrintLabel(selectedOrder);
                                                        setShowCustomerInfo(false);
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                                                >
                                                    Print Shipping Label
                                                </button>
                                            )}
                                            {(selectedOrder.status === 'pending' || selectedOrder.status === 'pending_payment') && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(selectedOrder.orderId, 'accept')}
                                                        disabled={validatingOrder === selectedOrder.orderId}
                                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        {validatingOrder === selectedOrder.orderId ? 'Checking Stock...' : 'Accept Order'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(selectedOrder.orderId, 'reject')}
                                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                                                    >
                                                        Reject Order
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shipping Label Modal */}
            {showShippingLabel && selectedOrderForLabel && (
                <ShippingLabel
                    order={selectedOrderForLabel}
                    onClose={() => {
                        setShowShippingLabel(false);
                        setSelectedOrderForLabel(null);
                    }}
                />
            )}
        </div>
    );
}