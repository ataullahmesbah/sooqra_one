'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import { Toaster, toast } from 'react-hot-toast';
import ShippingLabel from '../ShippingLabel/ShippingLabel';


// ─── Interface Definitions ──────────────────────────────────────────────────

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
    notes?: string;
}

interface OrderProduct {
    productId: string;
    title: string;
    quantity: number;
    price: number;
    mainImage?: string;
    size?: string;
    variantId?: string;       // ✅ variant support
    variantName?: string;     // ✅ variant name
    variantWeight?: string;   // ✅ variant weight
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
    returned: number;
    monthly: number;
}

interface GroupedProduct {
    productId: string;
    title: string;
    price: number;
    mainImage?: string;
    size: string | null;
    quantity: number;
    variantName?: string;
    variantWeight?: string;
}

interface CustomerHistory {
    delivered: number;
    cancelled: number;
    fraud: number;
    allOrders: Order[];
}

type TabType = 'pending' | 'accepted' | 'rejected' | 'returned';

// ─── Component ───────────────────────────────────────────────────────────────

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showCustomerInfo, setShowCustomerInfo] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState<OrderStats>({ pending: 0, accepted: 0, rejected: 0, returned: 0, monthly: 0 });
    const [loading, setLoading] = useState(false);
    const [validatingOrder, setValidatingOrder] = useState<string | null>(null);
    const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [customerHistory, setCustomerHistory] = useState<CustomerHistory | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [showShippingLabel, setShowShippingLabel] = useState(false);
    const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);
    const ordersPerPage = 10;
    const router = useRouter();
    const modalRef = useRef<HTMLDivElement>(null);
    const historyModalRef = useRef<HTMLDivElement>(null);

    useEffect(() => { fetchOrders(); }, []);

    useEffect(() => {
        filterOrders(orders, activeTab, searchTerm, selectedDate);
    }, [activeTab, searchTerm, selectedDate, orders]);

    // Close modals on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (showCustomerInfo && modalRef.current && !modalRef.current.contains(e.target as Node))
                setShowCustomerInfo(false);
            if (showHistoryModal && historyModalRef.current && !historyModalRef.current.contains(e.target as Node))
                setShowHistoryModal(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showCustomerInfo, showHistoryModal]);

    // ── Data Fetching ──────────────────────────────────────────────────────────

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/products/orders');
            const sorted = response.data.sort((a: Order, b: Order) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(sorted);
            updateStats(sorted);
        } catch {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (list: Order[]) => {
        const now = new Date();
        setStats({
            pending: list.filter(o => o.status === 'pending' || o.status === 'pending_payment').length,
            accepted: list.filter(o => o.status === 'accepted').length,
            rejected: list.filter(o => o.status === 'rejected').length,
            returned: list.filter(o => o.status === 'returned').length,
            monthly: list.filter(o => {
                const d = new Date(o.createdAt);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length,
        });
    };

    const filterOrders = (list: Order[], tab: string, search: string, date: Date | null) => {
        let filtered = [...list];

        // Tab filter
        if (tab === 'pending') filtered = filtered.filter(o => o.status === 'pending' || o.status === 'pending_payment');
        else if (tab === 'accepted') filtered = filtered.filter(o => o.status === 'accepted');
        else if (tab === 'rejected') filtered = filtered.filter(o => o.status === 'rejected');
        else if (tab === 'returned') filtered = filtered.filter(o => o.status === 'returned');

        // Search — checks orderId, name, phone, email across ALL orders for history badge
        if (search.trim()) {
            const q = search.toLowerCase().trim();
            filtered = filtered.filter(o =>
                o.orderId.toLowerCase().includes(q) ||
                o.customerInfo.name.toLowerCase().includes(q) ||
                o.customerInfo.phone.includes(q) ||
                o.customerInfo.email.toLowerCase().includes(q)
            );
        }

        // Date filter — fixed: compare date parts only
        if (date) {
            filtered = filtered.filter(o => {
                const d = new Date(o.createdAt);
                return (
                    d.getFullYear() === date.getFullYear() &&
                    d.getMonth() === date.getMonth() &&
                    d.getDate() === date.getDate()
                );
            });
        }

        setFilteredOrders(filtered);
        setCurrentPage(1);
    };

    // ── Customer History ───────────────────────────────────────────────────────

    const loadCustomerHistory = useCallback(async (phone: string) => {
        if (!phone.trim()) return;
        setHistoryLoading(true);
        try {
            const res = await axios.get('/api/products/orders');
            const all: Order[] = res.data;
            const customerOrders = all.filter(o =>
                o.customerInfo.phone === phone ||
                o.customerInfo.email.toLowerCase() === phone.toLowerCase()
            );
            const delivered = customerOrders.filter(o => o.status === 'accepted').length;
            const cancelled = customerOrders.filter(o => o.status === 'rejected').length;
            const fraud = customerOrders.filter(o => o.status === 'returned').length;
            setCustomerHistory({ delivered, cancelled, fraud, allOrders: customerOrders });
            setShowHistoryModal(true);
        } catch {
            toast.error('Failed to load customer history');
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    // Calculate history badge for search results
    const getSearchCustomerHistory = useCallback((searchQ: string): CustomerHistory | null => {
        if (!searchQ.trim()) return null;
        const q = searchQ.toLowerCase().trim();
        const customerOrders = orders.filter(o =>
            o.customerInfo.phone.includes(q) ||
            o.customerInfo.email.toLowerCase().includes(q)
        );
        if (customerOrders.length === 0) return null;
        return {
            delivered: customerOrders.filter(o => o.status === 'accepted').length,
            cancelled: customerOrders.filter(o => o.status === 'rejected').length,
            fraud: customerOrders.filter(o => o.status === 'returned').length,
            allOrders: customerOrders,
        };
    }, [orders]);

    const searchHistory = searchTerm.trim().length > 3 ? getSearchCustomerHistory(searchTerm) : null;

    // ── Order Actions ──────────────────────────────────────────────────────────

    const handleAction = async (orderId: string, action: 'accept' | 'reject' | 'return') => {
        try {
            const order = orders.find(o => o.orderId === orderId);
            if (!order) { toast.error('Order not found'); return; }

            if (action === 'accept') {
                for (const product of order.products) {
                    try {
                        const { data: productData } = await axios.get(`/api/products/${product.productId}`);
                        if (productData.availability !== 'InStock') {
                            toast.error(`"${productData.title}" is out of stock`); return;
                        }
                        if (product.size && productData.sizeRequirement === 'Mandatory') {
                            const sizeData = productData.sizes.find((s: any) => s.name === product.size);
                            if (!sizeData) { toast.error(`Size "${product.size}" not available for "${productData.title}"`); return; }
                            if (sizeData.quantity < product.quantity) {
                                toast.error(`Only ${sizeData.quantity} units available for "${productData.title}" (${product.size})`); return;
                            }
                        } else if (!product.variantId && productData.quantity < product.quantity) {
                            toast.error(`Only ${productData.quantity} units available for "${productData.title}"`); return;
                        }
                    } catch {
                        toast.error(`Failed to check "${product.title}"`); return;
                    }
                }
            }

            setValidatingOrder(orderId);
            const response = await axios.post('/api/products/orders/action', { orderId, action });

            if (response.data.success) {
                const newStatus = action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'returned';
                setOrders(prev => prev.map(o =>
                    o.orderId === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
                ));
                toast.success(`Order ${action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'marked as returned'} successfully!`);
                if (showCustomerInfo) setShowCustomerInfo(false);
                setTimeout(fetchOrders, 1000);
            }
        } catch (error: any) {
            const msg = error.response?.data?.error || `Failed to ${action} order`;
            toast.error(msg);
        } finally {
            setValidatingOrder(null);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm(`Delete order ${orderId}? This cannot be undone.`)) return;
        try {
            setDeletingOrder(orderId);
            await axios.delete(`/api/products/orders/${orderId}`);
            setOrders(prev => prev.filter(o => o.orderId !== orderId));
            toast.success('Order deleted successfully');
            if (showCustomerInfo) setShowCustomerInfo(false);
        } catch {
            toast.error('Failed to delete order');
        } finally {
            setDeletingOrder(null);
        }
    };

    // ── Helpers ────────────────────────────────────────────────────────────────

    const groupProductsByVariantAndSize = (products: OrderProduct[]): GroupedProduct[] => {
        const grouped: Record<string, GroupedProduct> = {};
        products.forEach(p => {
            const key = `${p.productId}-${p.variantId || 'no-variant'}-${p.size || 'no-size'}`;
            if (!grouped[key]) {
                grouped[key] = {
                    productId: p.productId, title: p.title, price: p.price,
                    mainImage: p.mainImage, size: p.size || null,
                    variantName: p.variantName, variantWeight: p.variantWeight,
                    quantity: 0,
                };
            }
            grouped[key].quantity += p.quantity;
        });
        return Object.values(grouped);
    };

    const formatDate = (ds: string) =>
        new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': case 'pending_payment': return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'accepted': return 'bg-green-100 text-green-700 border border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border border-red-200';
            case 'returned': return 'bg-orange-100 text-orange-700 border border-orange-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPaymentMethodColor = (m: string) => {
        switch (m) {
            case 'cod': return 'bg-yellow-100 text-yellow-700';
            case 'bkash': return 'bg-green-100 text-green-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    const exportOrdersToCSV = async () => {
        try {
            setExporting(true);
            const list = filteredOrders.length > 0 ? filteredOrders : orders;
            const headers = ['Order ID', 'Customer Name', 'Email', 'Phone', 'Address', 'Payment', 'Total', 'Discount', 'Shipping', 'Status', 'Date', 'Items'];
            const rows = list.map(o => [
                o.orderId, o.customerInfo.name, o.customerInfo.email, o.customerInfo.phone,
                o.customerInfo.address,
                o.paymentMethod === 'cod' ? 'COD' : o.paymentMethod === 'bkash' ? 'bKash' : 'Online',
                o.total, o.discount, o.shippingCharge, o.status, formatDate(o.createdAt),
                o.products.reduce((s, p) => s + p.quantity, 0),
            ]);
            const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            toast.success('Exported successfully!');
        } catch { toast.error('Export failed'); }
        finally { setExporting(false); }
    };

    const toggleSelectOrder = (id: string) => {
        const next = new Set(selectedOrders);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedOrders(next);
    };

    const toggleSelectAll = () => {
        if (selectedOrders.size === paginatedOrders.length) setSelectedOrders(new Set());
        else setSelectedOrders(new Set(paginatedOrders.map(o => o.orderId)));
    };

    const handleBulkAction = async (action: 'accept' | 'reject') => {
        if (selectedOrders.size === 0) { toast.error('Select at least one order'); return; }
        try {
            await Promise.all(Array.from(selectedOrders).map(id =>
                axios.post('/api/products/orders/action', { orderId: id, action })
            ));
            const newStatus = action === 'accept' ? 'accepted' : 'rejected';
            setOrders(prev => prev.map(o => selectedOrders.has(o.orderId) ? { ...o, status: newStatus } : o));
            setSelectedOrders(new Set());
            toast.success(`${selectedOrders.size} orders ${action}ed!`);
        } catch { toast.error('Bulk action failed'); }
    };

    const paginatedOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto">

                {/* ── Header ── */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                        <p className="text-gray-500 mt-1 text-sm">Manage and track all customer orders</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={exportOrdersToCSV} disabled={exporting || orders.length === 0}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm">
                            {exporting ? 'Exporting...' : '⬇ Export CSV'}
                        </button>
                        <button onClick={fetchOrders} disabled={loading}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 text-sm">
                            {loading ? 'Refreshing...' : '↺ Refresh'}
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'Pending', value: stats.pending, color: 'blue' },
                        { label: 'Accepted', value: stats.accepted, color: 'green' },
                        { label: 'Rejected', value: stats.rejected, color: 'red' },
                        { label: 'Returned', value: stats.returned, color: 'orange' },
                        { label: 'This Month', value: stats.monthly, color: 'purple' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <p className="text-gray-500 text-xs font-medium">{label}</p>
                            <p className={`text-2xl font-bold mt-1 text-${color}-600`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Tabs + Filters ── */}
                <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-200">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        {([
                            { key: 'pending', label: 'Pending', count: stats.pending, color: 'blue' },
                            { key: 'accepted', label: 'Accepted', count: stats.accepted, color: 'green' },
                            { key: 'rejected', label: 'Rejected', count: stats.rejected, color: 'red' },
                            { key: 'returned', label: 'Return', count: stats.returned, color: 'orange' },
                        ] as const).map(({ key, label, count, color }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === key
                                    ? `bg-${color}-600 text-white`
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {label} ({count})
                            </button>
                        ))}
                    </div>

                    {/* Search + Date + History Badge */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by Order ID, name, phone, or email…"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            {/* Customer History Badge */}
                            {searchHistory && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-gray-500 font-medium">Customer history:</span>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                        ✅ Delivery-{searchHistory.delivered}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                                        ⚠ Cancelled-{searchHistory.cancelled}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                                        🚩 Fraud Report-{searchHistory.fraud}
                                    </span>
                                    <button
                                        onClick={() => { setCustomerHistory(searchHistory); setShowHistoryModal(true); }}
                                        className="px-3 py-0.5 bg-gray-800 text-white rounded-full text-xs font-medium hover:bg-gray-900 transition-colors"
                                    >
                                        Show Full History
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Date Picker — Fixed */}
                        <div className="md:w-52">
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date: Date | null) => setSelectedDate(date)}
                                placeholderText="Filter by date"
                                dateFormat="dd MMM yyyy"
                                isClearable
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        {/* Bulk Actions */}
                        {selectedOrders.size > 0 && (
                            <div className="flex gap-2">
                                <button onClick={() => handleBulkAction('accept')}
                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                                    Accept ({selectedOrders.size})
                                </button>
                                <button onClick={() => handleBulkAction('reject')}
                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                                    Reject ({selectedOrders.size})
                                </button>
                                <button onClick={() => setSelectedOrders(new Set())}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Orders Table ── */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="w-10 px-4 py-3">
                                                <input type="checkbox" checked={paginatedOrders.length > 0 && selectedOrders.size === paginatedOrders.length} onChange={toggleSelectAll} className="rounded border-gray-300" />
                                            </th>
                                            {['Order ID', 'Customer', 'Products', 'Total', 'Payment', 'Date', 'Status', 'Actions'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="py-16 text-center text-gray-400">
                                                    <p className="text-lg font-medium">No orders found</p>
                                                    <p className="text-sm mt-1">Try adjusting your filters</p>
                                                </td>
                                            </tr>
                                        ) : paginatedOrders.map(order => {
                                            const grouped = groupProductsByVariantAndSize(order.products);
                                            return (
                                                <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <input type="checkbox" checked={selectedOrders.has(order.orderId)} onChange={() => toggleSelectOrder(order.orderId)} className="rounded border-gray-300" />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="font-mono text-xs font-semibold text-gray-800">{order.orderId}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-gray-900 text-sm">{order.customerInfo.name}</p>
                                                        <p className="text-xs text-gray-500">{order.customerInfo.phone}</p>
                                                    </td>
                                                    <td className="px-4 py-3 max-w-[220px]">
                                                        {grouped.slice(0, 2).map((p, i) => (
                                                            <div key={i} className="mb-1.5 last:mb-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    Qty: {p.quantity} × ৳{p.price.toLocaleString()}
                                                                    {p.variantName && <span className="ml-1 text-blue-600">• {p.variantName}</span>}
                                                                    {p.variantWeight && <span className="ml-1">({p.variantWeight})</span>}
                                                                    {p.size && !p.variantName && <span className="ml-1">• Size: {p.size}</span>}
                                                                </p>
                                                            </div>
                                                        ))}
                                                        {grouped.length > 2 && <span className="text-xs text-blue-600">+{grouped.length - 2} more</span>}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-gray-900 text-sm whitespace-nowrap">৳{order.total.toLocaleString()}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(order.paymentMethod)}`}>
                                                            {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'bkash' ? 'bKash' : 'Online'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                            {order.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            {/* View */}
                                                            <button onClick={() => { setSelectedOrder(order); setShowCustomerInfo(true); }}
                                                                className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-medium">View</button>

                                                            {/* Accept / Reject for pending */}
                                                            {(order.status === 'pending' || order.status === 'pending_payment') && (
                                                                <>
                                                                    <button onClick={() => handleAction(order.orderId, 'accept')} disabled={validatingOrder === order.orderId}
                                                                        className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs font-medium disabled:opacity-50">
                                                                        {validatingOrder === order.orderId ? '…' : 'Accept'}
                                                                    </button>
                                                                    <button onClick={() => handleAction(order.orderId, 'reject')}
                                                                        className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-xs font-medium">Reject</button>
                                                                </>
                                                            )}

                                                            {/* Return button for accepted */}
                                                            {order.status === 'accepted' && (
                                                                <>
                                                                    <button onClick={() => handleAction(order.orderId, 'return')}
                                                                        className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-xs font-medium">Return</button>
                                                                    <button onClick={() => { setSelectedOrderForLabel(order); setShowShippingLabel(true); }}
                                                                        className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-xs font-medium">Print</button>
                                                                </>
                                                            )}

                                                            {/* ✅ Delete for rejected */}
                                                            {order.status === 'rejected' && (
                                                                <button onClick={() => handleDeleteOrder(order.orderId)} disabled={deletingOrder === order.orderId}
                                                                    className="px-2.5 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium disabled:opacity-50">
                                                                    {deletingOrder === order.orderId ? '…' : 'Delete'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <p className="text-sm text-gray-600">
                                        Showing <strong>{(currentPage - 1) * ordersPerPage + 1}</strong>–<strong>{Math.min(currentPage * ordersPerPage, filteredOrders.length)}</strong> of <strong>{filteredOrders.length}</strong>
                                    </p>
                                    <div className="flex gap-1">
                                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-40">← Prev</button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let n = i + 1;
                                            if (totalPages > 5) {
                                                if (currentPage <= 3) n = i + 1;
                                                else if (currentPage >= totalPages - 2) n = totalPages - 4 + i;
                                                else n = currentPage - 2 + i;
                                            }
                                            return (
                                                <button key={n} onClick={() => setCurrentPage(n)}
                                                    className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === n ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>
                                                    {n}
                                                </button>
                                            );
                                        })}
                                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-40">Next →</button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Order Details Modal ── */}
            {showCustomerInfo && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-6">
                    <div ref={modalRef} className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl">

                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex justify-between items-center z-10 rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="font-mono text-sm text-gray-500">{selectedOrder.orderId}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                                        {selectedOrder.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setShowCustomerInfo(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Left: Customer Info */}
                            <div className="space-y-5">
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <span>👤</span> Customer Information
                                    </h3>
                                    <div className="space-y-2.5">
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium">Full Name</p>
                                            <p className="font-semibold text-gray-900">{selectedOrder.customerInfo.name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium">Phone</p>
                                                <p className="font-medium text-gray-800 text-sm">{selectedOrder.customerInfo.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium">Email</p>
                                                <p className="font-medium text-gray-800 text-sm break-all">{selectedOrder.customerInfo.email}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium">Address</p>
                                            <p className="text-gray-800 text-sm">{selectedOrder.customerInfo.address}</p>
                                            <p className="text-gray-600 text-xs mt-0.5">
                                                {[selectedOrder.customerInfo.thana, selectedOrder.customerInfo.district, selectedOrder.customerInfo.city].filter(Boolean).join(', ')}
                                                {selectedOrder.customerInfo.postcode && ` - ${selectedOrder.customerInfo.postcode}`}
                                            </p>
                                            <p className="text-gray-500 text-xs">{selectedOrder.customerInfo.country}</p>
                                        </div>
                                        {selectedOrder.customerInfo.notes && (
                                            <div className="pt-2 border-t border-gray-200">
                                                <p className="text-xs text-gray-400 font-medium mb-1">Notes</p>
                                                <p className="text-gray-700 text-sm bg-white rounded-lg p-2 border border-gray-200">{selectedOrder.customerInfo.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Payment */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <span>💳</span> Payment & Status
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Method</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(selectedOrder.paymentMethod)}`}>
                                                {selectedOrder.paymentMethod === 'cod' ? '💵 COD' : selectedOrder.paymentMethod === 'bkash' ? '📱 bKash' : '💳 Online'}
                                            </span>
                                        </div>
                                        {selectedOrder.paymentMethod === 'bkash' && selectedOrder.customerInfo.bkashNumber && (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">bKash No.</span>
                                                    <span className="font-mono text-sm">{selectedOrder.customerInfo.bkashNumber.slice(0, 4)}***{selectedOrder.customerInfo.bkashNumber.slice(7)}</span>
                                                </div>
                                                {selectedOrder.customerInfo.transactionId && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">Txn ID</span>
                                                        <span className="font-mono text-sm">{selectedOrder.customerInfo.transactionId}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {selectedOrder.couponCode && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Coupon</span>
                                                <span className="text-purple-600 font-medium text-sm">{selectedOrder.couponCode}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Date</span>
                                            <span className="text-sm text-gray-700">{formatDate(selectedOrder.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Order Items + Summary */}
                            <div>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <span>🛍</span> Order Items
                                    </h3>
                                    <div className="space-y-3 mb-4">
                                        {groupProductsByVariantAndSize(selectedOrder.products).map((p, i) => (
                                            <div key={i} className="bg-white rounded-lg p-3 border border-gray-200">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900 text-sm">{p.title}</p>
                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                            {p.variantName && (
                                                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-medium">
                                                                    {p.variantName}
                                                                </span>
                                                            )}
                                                            {p.variantWeight && (
                                                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                                    {p.variantWeight}
                                                                </span>
                                                            )}
                                                            {p.size && !p.variantName && (
                                                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                                    Size: {p.size}
                                                                </span>
                                                            )}
                                                            <span className="text-xs text-gray-500">Qty: {p.quantity}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-bold text-gray-900 text-sm">৳{(p.price * p.quantity).toLocaleString()}</p>
                                                        <p className="text-xs text-gray-400">৳{p.price.toLocaleString()} each</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Totals */}
                                    <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span>৳{selectedOrder.products.reduce((s, p) => s + p.price * p.quantity, 0).toLocaleString()}</span>
                                        </div>
                                        {selectedOrder.discount > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Discount</span>
                                                <span>-৳{selectedOrder.discount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {selectedOrder.shippingCharge > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Shipping</span>
                                                <span>৳{selectedOrder.shippingCharge.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                                            <span>Total</span>
                                            <span>৳{selectedOrder.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {(selectedOrder.status === 'pending' || selectedOrder.status === 'pending_payment') && (
                                        <>
                                            <button onClick={() => handleAction(selectedOrder.orderId, 'accept')} disabled={validatingOrder === selectedOrder.orderId}
                                                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-50">
                                                {validatingOrder === selectedOrder.orderId ? 'Checking...' : '✓ Accept Order'}
                                            </button>
                                            <button onClick={() => handleAction(selectedOrder.orderId, 'reject')}
                                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
                                                ✕ Reject Order
                                            </button>
                                        </>
                                    )}
                                    {selectedOrder.status === 'accepted' && (
                                        <>
                                            <button onClick={() => handleAction(selectedOrder.orderId, 'return')}
                                                className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm">
                                                ↩ Mark as Return
                                            </button>
                                            <button onClick={() => { setSelectedOrderForLabel(selectedOrder); setShowShippingLabel(true); setShowCustomerInfo(false); }}
                                                className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm">
                                                🖨 Print Label
                                            </button>
                                        </>
                                    )}
                                    {selectedOrder.status === 'rejected' && (
                                        <button onClick={() => handleDeleteOrder(selectedOrder.orderId)} disabled={deletingOrder === selectedOrder.orderId}
                                            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50">
                                            🗑 Delete Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Customer Full History Modal ── */}
            {showHistoryModal && customerHistory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div ref={historyModalRef} className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex justify-between items-center rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Customer Full History</h2>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                        ✅ Delivery: {customerHistory.delivered}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                                        ⚠ Cancelled: {customerHistory.cancelled}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                                        🚩 Fraud Report: {customerHistory.fraud}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="p-2 rounded-full hover:bg-gray-100">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-5 space-y-3">
                            {customerHistory.allOrders.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">No orders found</p>
                            ) : customerHistory.allOrders.map(o => (
                                <div key={o.orderId} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                        <div>
                                            <p className="font-mono text-sm font-semibold text-gray-800">{o.orderId}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{formatDate(o.createdAt)}</p>
                                            <div className="mt-2 space-y-1">
                                                {o.products.slice(0, 2).map((p, i) => (
                                                    <p key={i} className="text-xs text-gray-600">
                                                        • {p.title}
                                                        {p.variantName && <span className="text-blue-600 ml-1">({p.variantName})</span>}
                                                        {p.variantWeight && <span className="text-gray-500 ml-1">[{p.variantWeight}]</span>}
                                                        {p.size && !p.variantName && <span className="text-gray-500 ml-1">[{p.size}]</span>}
                                                        <span className="ml-1">× {p.quantity}</span>
                                                    </p>
                                                ))}
                                                {o.products.length > 2 && <p className="text-xs text-blue-500">+{o.products.length - 2} more</p>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(o.status)}`}>
                                                {o.status.replace('_', ' ')}
                                            </span>
                                            <p className="font-bold text-gray-900 text-sm mt-1">৳{o.total.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Shipping Label ── */}
            {showShippingLabel && selectedOrderForLabel && (
                <ShippingLabel
                    order={selectedOrderForLabel}
                    onClose={() => { setShowShippingLabel(false); setSelectedOrderForLabel(null); }}
                />
            )}
        </div>
    );
}