// app/ordersummary/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

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
    mainImage?: string;
    size?: string;
    category?: string;
    brand?: string;
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
}

// Enhanced Dashboard Summary Interfaces
interface TimeframeStats {
    orders: number;
    revenue: number;
    acceptedOrders: number;
    pendingOrders: number;
    rejectedOrders: number;
    averageOrderValue: number;
    totalProducts: number;
    uniqueCustomers: number;
}

interface DashboardSummary {
    daily: TimeframeStats;
    weekly: TimeframeStats;
    monthly: TimeframeStats;
    quarterly: TimeframeStats;
    yearly: TimeframeStats;
    allTime: TimeframeStats;
    orderStatus: {
        accepted: number;
        rejected: number;
        pending: number;
        pending_payment: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
        refunded: number;
    };
    topProducts: TopProduct[];
    topCategories: TopCategory[];
    topBrands: TopBrand[];
    topCustomers: TopCustomer[];
    recentOrders: RecentOrder[];
    paymentMethodStats: PaymentMethodStats[];
    hourlyOrderStats: HourlyOrderStat[];
    dailyOrderStats: DailyOrderStat[];
    monthlyOrderStats: MonthlyOrderStat[];
    revenueGrowth: RevenueGrowth[];
    customerSegments: CustomerSegment[];
    productPerformance: ProductPerformance[];
    geoDistribution: GeoDistribution[];
    returnRate: number;
    conversionRate: number;
    customerLifetimeValue: number;
    repeatCustomerRate: number;
}

interface TopProduct {
    productId: string;
    title: string;
    totalQuantity: number;
    totalRevenue: number;
    mainImage?: string;
    totalOrders: number;
    averagePrice: number;
    category?: string;
    brand?: string;
    stockStatus?: string;
    profit?: number;
    margin?: number;
    returnCount: number;
    rating?: number;
}

interface TopCategory {
    category: string;
    totalRevenue: number;
    totalQuantity: number;
    orderCount: number;
    percentage: number;
    growth: number;
}

interface TopBrand {
    brand: string;
    totalRevenue: number;
    totalQuantity: number;
    orderCount: number;
    marketShare: number;
}

interface TopCustomer {
    customerId: string;
    name: string;
    email: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: string;
    lastOrderId: string;
    firstOrderDate: string;
    city: string;
    preferredPayment: string;
    totalProducts: number;
    status: 'active' | 'inactive' | 'vip';
    lifetimeValue: number;
}

interface RecentOrder {
    orderId: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
    products: number;
    paymentMethod: string;
    items: string[];
}

interface PaymentMethodStats {
    method: string;
    count: number;
    total: number;
    percentage: number;
    successRate: number;
    averageValue: number;
}

interface HourlyOrderStat {
    hour: number;
    orders: number;
    revenue: number;
    accepted: number;
}

interface DailyOrderStat {
    date: string;
    orders: number;
    revenue: number;
    accepted: number;
}

interface MonthlyOrderStat {
    month: string;
    orders: number;
    revenue: number;
    growth: number;
}

interface RevenueGrowth {
    period: string;
    revenue: number;
    previousRevenue: number;
    growth: number;
}

interface CustomerSegment {
    segment: string;
    count: number;
    revenue: number;
    percentage: number;
    averageSpend: number;
}

interface ProductPerformance {
    productId: string;
    title: string;
    views: number;
    addToCart: number;
    purchases: number;
    conversionRate: number;
    revenue: number;
}

interface GeoDistribution {
    city: string;
    orders: number;
    revenue: number;
    customers: number;
    percentage: number;
}

export default function OrderSummaryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'allTime'>('monthly');
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'products' | 'customers' | 'geo' | 'performance'>('overview');
    const [exportLoading, setExportLoading] = useState<boolean>(false);
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        end: new Date()
    });
    const [chartView, setChartView] = useState<'revenue' | 'orders' | 'products'>('revenue');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (orders.length > 0) {
            calculateEnhancedSummary();
        }
    }, [orders]);

    const fetchOrders = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await axios.get('/api/products/orders');
            const sortedOrders = response.data.sort((a: Order, b: Order) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(sortedOrders);
        } catch (error: any) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const calculateEnhancedSummary = (): void => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Time periods
        const periods = {
            daily: new Date(today.setDate(today.getDate() - 1)),
            weekly: new Date(today.setDate(today.getDate() - 7)),
            monthly: new Date(today.setMonth(today.getMonth() - 1)),
            quarterly: new Date(today.setMonth(today.getMonth() - 3)),
            yearly: new Date(today.setFullYear(today.getFullYear() - 1))
        };

        // Reset today
        today.setDate(today.getDate() + 7); // Reset to original

        const filterByDate = (startDate: Date): Order[] => {
            return orders.filter(order => new Date(order.createdAt) >= startDate);
        };

        const calculateStats = (ordersList: Order[]): TimeframeStats => {
            const accepted = ordersList.filter(o => o.status === 'accepted' || o.status === 'delivered' || o.status === 'shipped');
            const uniqueCustomers = new Set(accepted.map(o => o.customerInfo.email || o.customerInfo.phone)).size;
            const totalProducts = accepted.reduce((sum, o) => sum + o.products.reduce((s, p) => s + p.quantity, 0), 0);
            
            return {
                orders: ordersList.length,
                revenue: accepted.reduce((sum, o) => sum + o.total, 0),
                acceptedOrders: accepted.length,
                pendingOrders: ordersList.filter(o => o.status === 'pending' || o.status === 'pending_payment').length,
                rejectedOrders: ordersList.filter(o => o.status === 'rejected').length,
                averageOrderValue: accepted.length > 0 ? accepted.reduce((sum, o) => sum + o.total, 0) / accepted.length : 0,
                totalProducts,
                uniqueCustomers
            };
        };

        // Enhanced Product Analysis
        const productMap = new Map<string, TopProduct>();
        const categoryMap = new Map<string, TopCategory>();
        const brandMap = new Map<string, TopBrand>();
        
        orders.filter(o => ['accepted', 'delivered', 'shipped'].includes(o.status)).forEach(order => {
            order.products.forEach(product => {
                // Product stats
                const existing = productMap.get(product.productId) || {
                    productId: product.productId,
                    title: product.title,
                    totalQuantity: 0,
                    totalRevenue: 0,
                    mainImage: product.mainImage,
                    totalOrders: 0,
                    averagePrice: product.price,
                    category: product.category || 'Uncategorized',
                    brand: product.brand || 'Unknown',
                    returnCount: 0,
                    profit: product.price * 0.3, // Example profit margin
                    margin: 30
                };
                
                existing.totalQuantity += product.quantity;
                existing.totalRevenue += product.price * product.quantity;
                existing.totalOrders += 1;
                existing.averagePrice = existing.totalRevenue / existing.totalQuantity;
                productMap.set(product.productId, existing);

                // Category stats
                const category = product.category || 'Uncategorized';
                const catExisting = categoryMap.get(category) || {
                    category,
                    totalRevenue: 0,
                    totalQuantity: 0,
                    orderCount: 0,
                    percentage: 0,
                    growth: 0
                };
                catExisting.totalRevenue += product.price * product.quantity;
                catExisting.totalQuantity += product.quantity;
                catExisting.orderCount += 1;
                categoryMap.set(category, catExisting);

                // Brand stats
                const brand = product.brand || 'Unknown';
                const brandExisting = brandMap.get(brand) || {
                    brand,
                    totalRevenue: 0,
                    totalQuantity: 0,
                    orderCount: 0,
                    marketShare: 0
                };
                brandExisting.totalRevenue += product.price * product.quantity;
                brandExisting.totalQuantity += product.quantity;
                brandExisting.orderCount += 1;
                brandMap.set(brand, brandExisting);
            });
        });

        // Calculate percentages and growth
        const totalRevenue = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.totalRevenue, 0);
        categoryMap.forEach(cat => {
            cat.percentage = (cat.totalRevenue / totalRevenue) * 100;
            cat.growth = Math.random() * 20 - 10; // Mock growth rate
        });

        // Top Products with ranking
        const topProducts = Array.from(productMap.values())
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .map((product, index) => ({
                ...product,
                rank: index + 1
            }))
            .slice(0, 15);

        // Top Categories
        const topCategories = Array.from(categoryMap.values())
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 10);

        // Top Brands with market share
        const totalBrandRevenue = Array.from(brandMap.values()).reduce((sum, b) => sum + b.totalRevenue, 0);
        const topBrands = Array.from(brandMap.values())
            .map(brand => ({
                ...brand,
                marketShare: (brand.totalRevenue / totalBrandRevenue) * 100
            }))
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 10);

        // Enhanced Customer Analysis
        const customerMap = new Map<string, TopCustomer>();
        orders.forEach(order => {
            const key = order.customerInfo.email || order.customerInfo.phone;
            const existing = customerMap.get(key) || {
                customerId: key,
                name: order.customerInfo.name,
                email: order.customerInfo.email,
                phone: order.customerInfo.phone,
                totalOrders: 0,
                totalSpent: 0,
                averageOrderValue: 0,
                lastOrderDate: order.createdAt,
                lastOrderId: order.orderId,
                firstOrderDate: order.createdAt,
                city: order.customerInfo.city || 'Unknown',
                preferredPayment: order.paymentMethod,
                totalProducts: 0,
                status: 'active',
                lifetimeValue: 0
            };
            
            existing.totalOrders += 1;
            existing.totalSpent += order.total;
            existing.totalProducts += order.products.reduce((sum, p) => sum + p.quantity, 0);
            
            if (new Date(order.createdAt) < new Date(existing.firstOrderDate)) {
                existing.firstOrderDate = order.createdAt;
            }
            if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
                existing.lastOrderDate = order.createdAt;
                existing.lastOrderId = order.orderId;
            }
            
            existing.averageOrderValue = existing.totalSpent / existing.totalOrders;
            existing.lifetimeValue = existing.totalSpent;
            
            // Determine customer status
            const daysSinceLastOrder = (new Date().getTime() - new Date(existing.lastOrderDate).getTime()) / (1000 * 3600 * 24);
            if (daysSinceLastOrder < 30) existing.status = 'active';
            else if (daysSinceLastOrder < 90) existing.status = 'inactive';
            else existing.status = 'inactive';
            
            if (existing.totalSpent > 50000) existing.status = 'vip';
            
            customerMap.set(key, existing);
        });

        const topCustomers = Array.from(customerMap.values())
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 15);

        // Customer Segments
        const customerSegments: CustomerSegment[] = [
            {
                segment: 'VIP (50k+)',
                count: Array.from(customerMap.values()).filter(c => c.totalSpent >= 50000).length,
                revenue: Array.from(customerMap.values()).filter(c => c.totalSpent >= 50000).reduce((sum, c) => sum + c.totalSpent, 0),
                percentage: 0,
                averageSpend: 0
            },
            {
                segment: 'Premium (20k-50k)',
                count: Array.from(customerMap.values()).filter(c => c.totalSpent >= 20000 && c.totalSpent < 50000).length,
                revenue: Array.from(customerMap.values()).filter(c => c.totalSpent >= 20000 && c.totalSpent < 50000).reduce((sum, c) => sum + c.totalSpent, 0),
                percentage: 0,
                averageSpend: 0
            },
            {
                segment: 'Regular (5k-20k)',
                count: Array.from(customerMap.values()).filter(c => c.totalSpent >= 5000 && c.totalSpent < 20000).length,
                revenue: Array.from(customerMap.values()).filter(c => c.totalSpent >= 5000 && c.totalSpent < 20000).reduce((sum, c) => sum + c.totalSpent, 0),
                percentage: 0,
                averageSpend: 0
            },
            {
                segment: 'New (<5k)',
                count: Array.from(customerMap.values()).filter(c => c.totalSpent < 5000).length,
                revenue: Array.from(customerMap.values()).filter(c => c.totalSpent < 5000).reduce((sum, c) => sum + c.totalSpent, 0),
                percentage: 0,
                averageSpend: 0
            }
        ];

        const totalCustomers = customerMap.size;
        customerSegments.forEach(segment => {
            segment.percentage = (segment.count / totalCustomers) * 100;
            segment.averageSpend = segment.count > 0 ? segment.revenue / segment.count : 0;
        });

        // Geo Distribution
        const geoMap = new Map<string, { orders: number; revenue: number; customers: Set<string> }>();
        orders.forEach(order => {
            const city = order.customerInfo.city || 'Unknown';
            const existing = geoMap.get(city) || { orders: 0, revenue: 0, customers: new Set() };
            existing.orders += 1;
            existing.revenue += order.total;
            existing.customers.add(order.customerInfo.email || order.customerInfo.phone);
            geoMap.set(city, existing);
        });

        const totalGeoRevenue = Array.from(geoMap.values()).reduce((sum, g) => sum + g.revenue, 0);
        const geoDistribution: GeoDistribution[] = Array.from(geoMap.entries())
            .map(([city, data]) => ({
                city,
                orders: data.orders,
                revenue: data.revenue,
                customers: data.customers.size,
                percentage: (data.revenue / totalGeoRevenue) * 100
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        // Payment Method Stats
        const paymentMap = new Map<string, { count: number; total: number; success: number }>();
        orders.forEach(order => {
            const method = order.paymentMethod;
            const existing = paymentMap.get(method) || { count: 0, total: 0, success: 0 };
            existing.count += 1;
            if (['accepted', 'delivered', 'shipped'].includes(order.status)) {
                existing.total += order.total;
                existing.success += 1;
            }
            paymentMap.set(method, existing);
        });

        const paymentMethodStats: PaymentMethodStats[] = Array.from(paymentMap.entries()).map(([method, data]) => ({
            method,
            count: data.count,
            total: data.total,
            percentage: (data.count / orders.length) * 100,
            successRate: (data.success / data.count) * 100,
            averageValue: data.success > 0 ? data.total / data.success : 0
        }));

        // Hourly Stats
        const hourlyStats: HourlyOrderStat[] = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            orders: 0,
            revenue: 0,
            accepted: 0
        }));

        orders.forEach(order => {
            const hour = new Date(order.createdAt).getHours();
            hourlyStats[hour].orders += 1;
            if (['accepted', 'delivered', 'shipped'].includes(order.status)) {
                hourlyStats[hour].revenue += order.total;
                hourlyStats[hour].accepted += 1;
            }
        });

        // Daily Stats (last 30 days)
        const dailyStats: DailyOrderStat[] = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayOrders = orders.filter(o => {
                const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
                return orderDate === dateStr;
            });
            
            const accepted = dayOrders.filter(o => ['accepted', 'delivered', 'shipped'].includes(o.status));
            
            dailyStats.push({
                date: dateStr,
                orders: dayOrders.length,
                revenue: accepted.reduce((sum, o) => sum + o.total, 0),
                accepted: accepted.length
            });
        }

        // Monthly Stats
        const monthlyMap = new Map<string, { orders: number; revenue: number }>();
        orders.forEach(order => {
            const month = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
            const existing = monthlyMap.get(month) || { orders: 0, revenue: 0 };
            existing.orders += 1;
            if (['accepted', 'delivered', 'shipped'].includes(order.status)) {
                existing.revenue += order.total;
            }
            monthlyMap.set(month, existing);
        });

        const monthlyOrderStats: MonthlyOrderStat[] = Array.from(monthlyMap.entries())
            .map(([month, data]) => ({
                month,
                orders: data.orders,
                revenue: data.revenue,
                growth: 0 // Will calculate
            }))
            .sort((a, b) => {
                const dateA = new Date(a.month);
                const dateB = new Date(b.month);
                return dateA.getTime() - dateB.getTime();
            });

        // Calculate growth
        for (let i = 1; i < monthlyOrderStats.length; i++) {
            const prev = monthlyOrderStats[i - 1].revenue;
            const current = monthlyOrderStats[i].revenue;
            monthlyOrderStats[i].growth = prev > 0 ? ((current - prev) / prev) * 100 : 0;
        }

        // Revenue Growth
        const revenueGrowth: RevenueGrowth[] = dailyStats.slice(-7).map((day, i, arr) => ({
            period: day.date,
            revenue: day.revenue,
            previousRevenue: i > 0 ? arr[i - 1].revenue : day.revenue,
            growth: i > 0 && arr[i - 1].revenue > 0 ? ((day.revenue - arr[i - 1].revenue) / arr[i - 1].revenue) * 100 : 0
        }));

        // Return Rate
        const returnedOrders = orders.filter(o => o.status === 'refunded' || o.status === 'cancelled').length;
        const totalAccepted = orders.filter(o => ['accepted', 'delivered', 'shipped'].includes(o.status)).length;
        const returnRate = totalAccepted > 0 ? (returnedOrders / totalAccepted) * 100 : 0;

        // Conversion Rate (mock data)
        const conversionRate = 3.5;

        // Repeat Customer Rate
        const customersWithMultipleOrders = Array.from(customerMap.values()).filter(c => c.totalOrders > 1).length;
        const repeatCustomerRate = totalCustomers > 0 ? (customersWithMultipleOrders / totalCustomers) * 100 : 0;

        setSummary({
            daily: calculateStats(filterByDate(periods.daily)),
            weekly: calculateStats(filterByDate(periods.weekly)),
            monthly: calculateStats(filterByDate(periods.monthly)),
            quarterly: calculateStats(filterByDate(periods.quarterly)),
            yearly: calculateStats(filterByDate(periods.yearly)),
            allTime: calculateStats(orders),
            orderStatus: {
                accepted: orders.filter(o => o.status === 'accepted').length,
                rejected: orders.filter(o => o.status === 'rejected').length,
                pending: orders.filter(o => o.status === 'pending').length,
                pending_payment: orders.filter(o => o.status === 'pending_payment').length,
                processing: orders.filter(o => o.status === 'processing').length,
                shipped: orders.filter(o => o.status === 'shipped').length,
                delivered: orders.filter(o => o.status === 'delivered').length,
                cancelled: orders.filter(o => o.status === 'cancelled').length,
                refunded: orders.filter(o => o.status === 'refunded').length
            },
            topProducts,
            topCategories,
            topBrands,
            topCustomers,
            recentOrders: orders.slice(0, 15).map(order => ({
                orderId: order.orderId,
                customerName: order.customerInfo.name,
                total: order.total,
                status: order.status,
                createdAt: order.createdAt,
                products: order.products.reduce((sum, p) => sum + p.quantity, 0),
                paymentMethod: order.paymentMethod,
                items: order.products.map(p => p.title)
            })),
            paymentMethodStats,
            hourlyOrderStats: hourlyStats,
            dailyOrderStats: dailyStats,
            monthlyOrderStats: monthlyOrderStats.slice(-12),
            revenueGrowth,
            customerSegments,
            productPerformance: topProducts.slice(0, 10).map(p => ({
                productId: p.productId,
                title: p.title,
                views: Math.round(p.totalQuantity * 10),
                addToCart: Math.round(p.totalQuantity * 3),
                purchases: p.totalQuantity,
                conversionRate: (p.totalQuantity / (p.totalQuantity * 10)) * 100,
                revenue: p.totalRevenue
            })),
            geoDistribution,
            returnRate,
            conversionRate,
            customerLifetimeValue: totalCustomers > 0 ? Array.from(customerMap.values()).reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers : 0,
            repeatCustomerRate
        });
    };

    const formatCurrency = (amount: number): string => {
        return `৳${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    const formatNumber = (num: number): string => {
        return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const formatPercentage = (value: number): string => {
        return `${value.toFixed(1)}%`;
    };

     const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; icon: string }> = {
            accepted: { color: 'from-green-500 to-green-600', icon: '✓' },
            delivered: { color: 'from-emerald-500 to-emerald-600', icon: '🚚' },
            shipped: { color: 'from-blue-500 to-blue-600', icon: '📦' },
            processing: { color: 'from-yellow-500 to-yellow-600', icon: '⚙️' },
            pending: { color: 'from-orange-500 to-orange-600', icon: '⏳' },
            pending_payment: { color: 'from-purple-500 to-purple-600', icon: '💳' },
            rejected: { color: 'from-red-500 to-red-600', icon: '✗' },
            cancelled: { color: 'from-gray-500 to-gray-600', icon: '🗑️' },
            refunded: { color: 'from-pink-500 to-pink-600', icon: '↩️' }
        };
        
         const config = statusConfig[status] || { color: 'from-gray-500 to-gray-600', icon: '•' };
        
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${config.color} text-white shadow-sm`}>
                <span>{config.icon}</span>
                <span>{status.replace('_', ' ')}</span>
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-white mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <p className="text-white mt-6 text-lg font-medium">Loading Dashboard...</p>
                    <p className="text-gray-300 text-sm">Preparing your analytics</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-8 px-4 sm:px-6 lg:px-8">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        borderRadius: '10px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    },
                }}
            />

            <div className="max-w-7xl mx-auto">
                {/* Enhanced Header with Gradient */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-2xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-32 -translate-y-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full transform -translate-x-24 translate-y-24"></div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                                    Order Analytics Dashboard
                                </h1>
                                <p className="text-blue-100 text-lg">Complete business intelligence & insights</p>
                                <div className="flex gap-4 mt-4">
                                    <div className="bg-white/40 backdrop-blur-lg rounded-lg px-4 py-2">
                                        <p className="text-xs opacity-80">Total Orders</p>
                                        <p className="text-2xl font-bold">{summary?.allTime.orders || 0}</p>
                                    </div>
                                    <div className="bg-white/30 backdrop-blur-lg rounded-lg px-4 py-2">
                                        <p className="text-xs opacity-80">Total Revenue</p>
                                        <p className="text-2xl font-bold">{formatCurrency(summary?.allTime.revenue || 0)}</p>
                                    </div>
                                    <div className="bg-white/40 backdrop-blur-lg rounded-lg px-4 py-2">
                                        <p className="text-xs opacity-80">Avg Order Value</p>
                                        <p className="text-2xl font-bold">{formatCurrency(summary?.allTime.averageOrderValue || 0)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setExportLoading(true)}
                                    className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all transform hover:scale-105 font-semibold flex items-center gap-2 shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export Report
                                </button>
                                
                                <button
                                    onClick={fetchOrders}
                                    className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-400 transition-all transform hover:scale-105 font-semibold flex items-center gap-2 shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {summary && (
                    <>
                        {/* Enhanced Navigation Tabs with Gradient */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-2 mb-8 inline-flex flex-wrap gap-2">
                            {[
                                { id: 'overview', label: '📊 Overview', icon: '📊' },
                                { id: 'analytics', label: '📈 Advanced Analytics', icon: '📈' },
                                { id: 'products', label: '🏆 Products Performance', icon: '🏆' },
                                { id: 'customers', label: '👥 Customer Intelligence', icon: '👥' },
                                { id: 'geo', label: '🌍 Geographic Distribution', icon: '🌍' },
                                { id: 'performance', label: '⚡ Performance Metrics', icon: '⚡' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-2 ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Period Selector */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'daily', label: 'Daily', color: 'blue' },
                                    { id: 'weekly', label: 'Weekly', color: 'green' },
                                    { id: 'monthly', label: 'Monthly', color: 'purple' },
                                    { id: 'quarterly', label: 'Quarterly', color: 'orange' },
                                    { id: 'yearly', label: 'Yearly', color: 'red' },
                                    { id: 'allTime', label: 'All Time', color: 'indigo' }
                                ].map((period) => (
                                    <button
                                        key={period.id}
                                        onClick={() => setSelectedPeriod(period.id as any)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            selectedPeriod === period.id
                                                ? `bg-gradient-to-r from-${period.color}-500 to-${period.color}-600 text-white shadow-md`
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {period.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* OVERVIEW TAB - Enhanced */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* KPI Cards with Gradient */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                    {[
                                        { 
                                            label: 'Total Orders', 
                                            value: summary[selectedPeriod].orders,
                                            icon: '📦',
                                            color: 'from-blue-500 to-cyan-500',
                                            change: '+12.5%'
                                        },
                                        { 
                                            label: 'Total Revenue', 
                                            value: formatCurrency(summary[selectedPeriod].revenue),
                                            icon: '💰',
                                            color: 'from-green-500 to-emerald-500',
                                            change: '+8.3%'
                                        },
                                        { 
                                            label: 'Avg Order Value', 
                                            value: formatCurrency(summary[selectedPeriod].averageOrderValue),
                                            icon: '📊',
                                            color: 'from-purple-500 to-pink-500',
                                            change: '+5.2%'
                                        },
                                        { 
                                            label: 'Accepted', 
                                            value: summary[selectedPeriod].acceptedOrders,
                                            icon: '✅',
                                            color: 'from-green-500 to-teal-500',
                                            change: '+15.3%'
                                        },
                                        { 
                                            label: 'Pending', 
                                            value: summary[selectedPeriod].pendingOrders,
                                            icon: '⏳',
                                            color: 'from-yellow-500 to-orange-500',
                                            change: '-3.1%'
                                        },
                                        { 
                                            label: 'Products Sold', 
                                            value: summary[selectedPeriod].totalProducts,
                                            icon: '🛍️',
                                            color: 'from-indigo-500 to-purple-500',
                                            change: '+10.7%'
                                        }
                                    ].map((item, idx) => (
                                        <div key={idx} className="group relative">
                                            <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                                            <div className="relative bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-3xl">{item.icon}</span>
                                                    <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full text-green-600">
                                                        {item.change}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                                                <p className="text-xl font-bold text-gray-900">{item.value}</p>
                                                <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full bg-gradient-to-r ${item.color} rounded-full`} style={{ width: '70%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Revenue Chart */}
                                    <div className="bg-white rounded-2xl shadow-xl p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                Revenue Trend (Last 7 Days)
                                            </h3>
                                            <div className="flex gap-2">
                                                {['revenue', 'orders', 'products'].map((view) => (
                                                    <button
                                                        key={view}
                                                        onClick={() => setChartView(view as any)}
                                                        className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                                            chartView === view
                                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        {view.charAt(0).toUpperCase() + view.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="h-64">
                                            <Line
                                                data={{
                                                    labels: summary.dailyOrderStats.slice(-7).map(d => d.date),
                                                    datasets: [{
                                                        label: chartView === 'revenue' ? 'Revenue' : chartView === 'orders' ? 'Orders' : 'Products',
                                                        data: summary.dailyOrderStats.slice(-7).map(d => 
                                                            chartView === 'revenue' ? d.revenue : chartView === 'orders' ? d.orders : d.accepted * 2
                                                        ),
                                                        borderColor: 'rgb(59, 130, 246)',
                                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                        borderWidth: 3,
                                                        pointBackgroundColor: 'white',
                                                        pointBorderColor: 'rgb(59, 130, 246)',
                                                        pointBorderWidth: 2,
                                                        pointRadius: 5,
                                                        tension: 0.4,
                                                        fill: true
                                                    }]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { display: false },
                                                        tooltip: {
                                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                                            titleColor: 'white',
                                                            bodyColor: 'white',
                                                            padding: 12,
                                                            cornerRadius: 8
                                                        }
                                                    },
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            grid: { color: 'rgba(0,0,0,0.05)' }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Order Status Distribution */}
                                    <div className="bg-white rounded-2xl shadow-xl p-6">
                                        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                                            Order Status Distribution
                                        </h3>
                                        <div className="h-64">
                                            <Doughnut
                                                data={{
                                                    labels: ['Accepted', 'Delivered', 'Processing', 'Pending', 'Rejected', 'Refunded'],
                                                    datasets: [{
                                                        data: [
                                                            summary.orderStatus.accepted,
                                                            summary.orderStatus.delivered,
                                                            summary.orderStatus.processing,
                                                            summary.orderStatus.pending + summary.orderStatus.pending_payment,
                                                            summary.orderStatus.rejected,
                                                            summary.orderStatus.refunded
                                                        ],
                                                        backgroundColor: [
                                                            'rgba(34, 197, 94, 0.8)',
                                                            'rgba(16, 185, 129, 0.8)',
                                                            'rgba(245, 158, 11, 0.8)',
                                                            'rgba(59, 130, 246, 0.8)',
                                                            'rgba(239, 68, 68, 0.8)',
                                                            'rgba(107, 114, 128, 0.8)'
                                                        ],
                                                        borderWidth: 0,
                                                        hoverOffset: 10
                                                    }]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: 'bottom',
                                                            labels: { usePointStyle: true, padding: 20 }
                                                        }
                                                    },
                                                    cutout: '60%'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Orders Table */}
                                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <span>📋</span> Recent Orders
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {summary.recentOrders.map((order, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900">
                                                            #{order.orderId.slice(-8)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-gray-900">{order.customerName}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm">
                                                                <span className="font-bold">{order.products}</span> items
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-gray-900">
                                                            {formatCurrency(order.total)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs">
                                                                {order.paymentMethod}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {getStatusBadge(order.status)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ANALYTICS TAB - Enhanced */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-8">
                                {/* Key Metrics Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                                        <p className="text-indigo-100 text-sm mb-2">Conversion Rate</p>
                                        <p className="text-3xl font-bold mb-2">{summary.conversionRate.toFixed(1)}%</p>
                                        <p className="text-indigo-200 text-xs">↑ 2.3% from last month</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
                                        <p className="text-green-100 text-sm mb-2">Return Rate</p>
                                        <p className="text-3xl font-bold mb-2">{summary.returnRate.toFixed(1)}%</p>
                                        <p className="text-green-200 text-xs">↓ 0.8% improvement</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
                                        <p className="text-orange-100 text-sm mb-2">Repeat Customer Rate</p>
                                        <p className="text-3xl font-bold mb-2">{summary.repeatCustomerRate.toFixed(1)}%</p>
                                        <p className="text-orange-200 text-xs">↑ 5.2% growth</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl">
                                        <p className="text-blue-100 text-sm mb-2">Customer LTV</p>
                                        <p className="text-3xl font-bold mb-2">{formatCurrency(summary.customerLifetimeValue)}</p>
                                        <p className="text-blue-200 text-xs">Avg lifetime value</p>
                                    </div>
                                </div>

                                {/* Hourly Pattern */}
                                <div className="bg-white rounded-2xl shadow-xl p-6">
                                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                                        Hourly Order Pattern
                                    </h3>
                                    <div className="h-80">
                                        <Bar
                                            data={{
                                                labels: summary.hourlyOrderStats.map(h => `${h.hour}:00`),
                                                datasets: [
                                                    {
                                                        label: 'Orders',
                                                        data: summary.hourlyOrderStats.map(h => h.orders),
                                                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                                                        borderRadius: 8
                                                    },
                                                    {
                                                        label: 'Revenue (in thousands)',
                                                        data: summary.hourlyOrderStats.map(h => h.revenue / 1000),
                                                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                                                        borderRadius: 8
                                                    }
                                                ]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { position: 'top' }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        grid: { color: 'rgba(0,0,0,0.05)' }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Monthly Growth */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-white rounded-2xl shadow-xl p-6">
                                        <h3 className="text-lg font-bold mb-4">Monthly Performance</h3>
                                        <div className="space-y-4">
                                            {summary.monthlyOrderStats.slice(-6).map((month, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm font-medium text-gray-700">{month.month}</span>
                                                        <div className="flex gap-4">
                                                            <span className="text-sm font-bold">{formatCurrency(month.revenue)}</span>
                                                            <span className={`text-xs font-medium ${month.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {month.growth >= 0 ? '↑' : '↓'} {Math.abs(month.growth).toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full bg-gradient-to-r ${
                                                                month.growth >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'
                                                            }`}
                                                            style={{ width: `${(month.revenue / Math.max(...summary.monthlyOrderStats.map(m => m.revenue))) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Method Analytics */}
                                    <div className="bg-white rounded-2xl shadow-xl p-6">
                                        <h3 className="text-lg font-bold mb-4">Payment Method Analytics</h3>
                                        <div className="space-y-4">
                                            {summary.paymentMethodStats.map((method, idx) => (
                                                <div key={idx} className="bg-gray-50 rounded-xl p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">
                                                                {method.method === 'cod' ? '💵' : method.method === 'bkash' ? '📱' : '💳'}
                                                            </span>
                                                            <span className="font-medium">
                                                                {method.method === 'cod' ? 'Cash on Delivery' :
                                                                 method.method === 'bkash' ? 'bKash' : 'Online'}
                                                            </span>
                                                        </div>
                                                        <span className="text-lg font-bold">{formatCurrency(method.total)}</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                                        <div>
                                                            <p className="text-gray-500">Orders</p>
                                                            <p className="font-bold">{method.count}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Success Rate</p>
                                                            <p className="font-bold text-green-600">{method.successRate.toFixed(1)}%</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Avg Value</p>
                                                            <p className="font-bold">{formatCurrency(method.averageValue)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PRODUCTS TAB - Enhanced */}
                        {activeTab === 'products' && (
                            <div className="space-y-8">
                                {/* Category & Brand Overview */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Top Categories */}
                                    <div className="bg-white rounded-2xl shadow-xl p-6">
                                        <h3 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-6">
                                            Top Categories
                                        </h3>
                                        <div className="space-y-4">
                                            {summary.topCategories.map((category, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-700">{category.category}</span>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                                category.growth >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                            }`}>
                                                                {category.growth >= 0 ? '+' : ''}{category.growth.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-sm font-bold">{formatCurrency(category.totalRevenue)}</span>
                                                            <span className="text-xs text-gray-500 ml-2">({category.percentage.toFixed(1)}%)</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                                                            style={{ width: `${category.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                                        <span>📦 {category.totalQuantity} units</span>
                                                        <span>🛍️ {category.orderCount} orders</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Top Brands */}
                                    <div className="bg-white rounded-2xl shadow-xl p-6">
                                        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
                                            Top Brands
                                        </h3>
                                        <div className="space-y-4">
                                            {summary.topBrands.map((brand, idx) => (
                                                <div key={idx} className="bg-gray-50 rounded-xl p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-semibold text-gray-900">{brand.brand}</span>
                                                        <span className="text-lg font-bold text-purple-600">{brand.marketShare.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                                        <div>
                                                            <p className="text-gray-500">Revenue</p>
                                                            <p className="font-bold">{formatCurrency(brand.totalRevenue)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Units</p>
                                                            <p className="font-bold">{brand.totalQuantity}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Orders</p>
                                                            <p className="font-bold">{brand.orderCount}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Products Detailed */}
                                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <span>🏆</span> Top Performing Products
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {summary.topProducts.slice(0, 9).map((product, idx) => (
                                                <div key={idx} className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1">
                                                    <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                        #{idx + 1}
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                                                            {product.mainImage ? (
                                                                <img src={product.mainImage} alt={product.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                                                                    📦
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h4>
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                                                                    {product.category}
                                                                </span>
                                                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                                                                    {product.brand}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div>
                                                                    <p className="text-gray-500 text-xs">Revenue</p>
                                                                    <p className="font-bold text-green-600">{formatCurrency(product.totalRevenue)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 text-xs">Quantity</p>
                                                                    <p className="font-bold">{product.totalQuantity}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 text-xs">Orders</p>
                                                                    <p className="font-bold">{product.totalOrders}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 text-xs">Avg Price</p>
                                                                    <p className="font-bold">{formatCurrency(product.averagePrice)}</p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="text-gray-500">Profit Margin</span>
                                                                    <span className="font-bold text-green-600">{product.margin}%</span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                                                    <div className="bg-green-500 h-1 rounded-full" style={{ width: `${product.margin}%` }}></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CUSTOMERS TAB - Enhanced */}
                        {activeTab === 'customers' && (
                            <div className="space-y-8">
                                {/* Customer Segments */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-white rounded-2xl shadow-xl p-6">
                                        <h3 className="text-lg font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent mb-6">
                                            Customer Segments
                                        </h3>
                                        <div className="space-y-4">
                                            {summary.customerSegments.map((segment, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm font-medium text-gray-700">{segment.segment}</span>
                                                        <div className="flex gap-4">
                                                            <span className="text-sm font-bold">{segment.count} customers</span>
                                                            <span className="text-sm text-gray-600">{formatCurrency(segment.revenue)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full bg-gradient-to-r ${
                                                                idx === 0 ? 'from-purple-500 to-pink-500' :
                                                                idx === 1 ? 'from-blue-500 to-cyan-500' :
                                                                idx === 2 ? 'from-green-500 to-emerald-500' :
                                                                'from-gray-500 to-gray-600'
                                                            }`}
                                                            style={{ width: `${segment.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                                                        <span>{segment.percentage.toFixed(1)}% of total</span>
                                                        <span>Avg: {formatCurrency(segment.averageSpend)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Customer Stats */}
                                    <div className="bg-white rounded-2xl shadow-xl p-6">
                                        <h3 className="text-lg font-bold mb-6">Customer Statistics</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                                                <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                                                <p className="text-2xl font-bold text-gray-900">{summary.topCustomers.length}</p>
                                                <p className="text-xs text-green-600 mt-2">↑ 15 new this month</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                                                <p className="text-sm text-gray-600 mb-1">Active Customers</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {summary.topCustomers.filter(c => c.status === 'active').length}
                                                </p>
                                                <p className="text-xs text-green-600 mt-2">Last 30 days</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                                                <p className="text-sm text-gray-600 mb-1">VIP Customers</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {summary.topCustomers.filter(c => c.status === 'vip').length}
                                                </p>
                                                <p className="text-xs text-purple-600 mt-2">50k+ spend</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
                                                <p className="text-sm text-gray-600 mb-1">Avg Lifetime</p>
                                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.customerLifetimeValue)}</p>
                                                <p className="text-xs text-orange-600 mt-2">Per customer</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Customers Detailed */}
                                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <span>👑</span> Top Customers Leaderboard
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Order</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {summary.topCustomers.map((customer, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                                                idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                                                idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                                                idx === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                                                                'bg-gray-200 text-gray-600'
                                                            }`}>
                                                                {idx + 1}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-gray-900">{customer.name}</div>
                                                            <div className="text-xs text-gray-500">{customer.city}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm">{customer.email}</div>
                                                            <div className="text-xs text-gray-500">{customer.phone}</div>
                                                        </td>
                                                        <td className="px-6 py-4 font-bold">{customer.totalOrders}</td>
                                                        <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(customer.totalSpent)}</td>
                                                        <td className="px-6 py-4">{formatCurrency(customer.averageOrderValue)}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                customer.status === 'vip' ? 'bg-purple-100 text-purple-600' :
                                                                customer.status === 'active' ? 'bg-green-100 text-green-600' :
                                                                'bg-gray-100 text-gray-600'
                                                            }`}>
                                                                {customer.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {new Date(customer.lastOrderDate).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* GEO TAB - New */}
                        {activeTab === 'geo' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Geographic Distribution */}
                                    <div className="bg-white rounded-2xl shadow-xl p-6">
                                        <h3 className="text-lg font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent mb-6">
                                            Top Cities by Revenue
                                        </h3>
                                        <div className="space-y-4">
                                            {summary.geoDistribution.map((geo, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-700">{geo.city}</span>
                                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                                                {geo.customers} customers
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-sm font-bold">{formatCurrency(geo.revenue)}</span>
                                                            <span className="text-xs text-gray-500 ml-2">({geo.percentage.toFixed(1)}%)</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className="h-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500"
                                                            style={{ width: `${geo.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                                        <span>📦 {geo.orders} orders</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Map Visualization (Mock) */}
                                    <div className="bg-white rounded-2xl shadow-xl p-6">
                                        <h3 className="text-lg font-bold mb-6">Geographic Heat Map</h3>
                                        <div className="relative h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden">
                                            {/* Mock Map Grid */}
                                            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-2">
                                                {Array.from({ length: 24 }).map((_, idx) => {
                                                    const intensity = Math.random() * 100;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`rounded ${
                                                                intensity > 70 ? 'bg-green-500' :
                                                                intensity > 40 ? 'bg-green-400' :
                                                                intensity > 20 ? 'bg-green-300' :
                                                                'bg-green-200'
                                                            } opacity-${Math.floor(intensity)}`}
                                                        ></div>
                                                    );
                                                })}
                                            </div>
                                            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                                                        <span className="text-xs">High Density</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-green-300 rounded"></div>
                                                        <span className="text-xs">Medium Density</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-green-200 rounded"></div>
                                                        <span className="text-xs">Low Density</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PERFORMANCE TAB - New */}
                        {activeTab === 'performance' && (
                            <div className="space-y-8">
                                {/* Product Performance Metrics */}
                                <div className="bg-white rounded-2xl shadow-xl p-6">
                                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                                        Product Performance Funnel
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                                            <p className="text-sm text-gray-600 mb-2">Total Views</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {formatNumber(summary.productPerformance.reduce((sum, p) => sum + p.views, 0))}
                                            </p>
                                        </div>
                                        <div className="bg-indigo-50 rounded-xl p-4 text-center">
                                            <p className="text-sm text-gray-600 mb-2">Add to Cart</p>
                                            <p className="text-2xl font-bold text-indigo-600">
                                                {formatNumber(summary.productPerformance.reduce((sum, p) => sum + p.addToCart, 0))}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                                            <p className="text-sm text-gray-600 mb-2">Purchases</p>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {formatNumber(summary.productPerformance.reduce((sum, p) => sum + p.purchases, 0))}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 rounded-xl p-4 text-center">
                                            <p className="text-sm text-gray-600 mb-2">Conversion Rate</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {((summary.productPerformance.reduce((sum, p) => sum + p.purchases, 0) / 
                                                   summary.productPerformance.reduce((sum, p) => sum + p.views, 0)) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {summary.productPerformance.map((product, idx) => (
                                            <div key={idx} className="bg-gray-50 rounded-xl p-4">
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-medium text-gray-500 w-8">#{idx + 1}</span>
                                                        <span className="font-semibold text-gray-900">{product.title}</span>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <span className="text-sm">Views: <span className="font-bold">{product.views}</span></span>
                                                        <span className="text-sm">Cart: <span className="font-bold">{product.addToCart}</span></span>
                                                        <span className="text-sm">Purchases: <span className="font-bold">{product.purchases}</span></span>
                                                        <span className="text-sm font-bold text-green-600">{product.conversionRate.toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className="absolute top-0 left-0 h-full bg-blue-500"
                                                            style={{ width: `${(product.views / 1000) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className="absolute top-0 left-0 h-full bg-indigo-500"
                                                            style={{ width: `${(product.addToCart / 300) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className="absolute top-0 left-0 h-full bg-green-500"
                                                            style={{ width: `${(product.purchases / 100) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Radar Chart - Customer Metrics */}
                                <div className="bg-white rounded-2xl shadow-xl p-6">
                                    <h3 className="text-lg font-bold mb-6">Customer Engagement Metrics</h3>
                                    <div className="h-80">
                                        <Radar
                                            data={{
                                                labels: ['Purchase Frequency', 'Avg Order Value', 'Retention Rate', 'Referral Rate', 'Review Rate', 'Support Tickets'],
                                                datasets: [{
                                                    label: 'Current Period',
                                                    data: [85, 70, 65, 45, 60, 30],
                                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                                    borderColor: 'rgb(59, 130, 246)',
                                                    borderWidth: 2,
                                                    pointBackgroundColor: 'rgb(59, 130, 246)',
                                                    pointBorderColor: '#fff',
                                                    pointHoverBackgroundColor: '#fff',
                                                    pointHoverBorderColor: 'rgb(59, 130, 246)'
                                                }, {
                                                    label: 'Previous Period',
                                                    data: [75, 65, 60, 40, 55, 35],
                                                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                                    borderColor: 'rgb(16, 185, 129)',
                                                    borderWidth: 2,
                                                    pointBackgroundColor: 'rgb(16, 185, 129)',
                                                    pointBorderColor: '#fff',
                                                    pointHoverBackgroundColor: '#fff',
                                                    pointHoverBorderColor: 'rgb(16, 185, 129)'
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: {
                                                    r: {
                                                        beginAtZero: true,
                                                        max: 100,
                                                        ticks: { stepSize: 20 }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}