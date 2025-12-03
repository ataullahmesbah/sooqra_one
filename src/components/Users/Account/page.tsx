'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    FaUser,
    FaShoppingBag,
    FaLock,
    FaSignOutAlt,
    FaHome,
    FaTachometerAlt,
    FaUserShield,
    FaUserCheck,
    FaEdit,
    FaCheck,
    FaTimes
} from 'react-icons/fa';
import { signOut } from 'next-auth/react';

// Interfaces
interface UserData {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Order {
    _id: string;
    orderNumber: string;
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    items: Array<{
        product: {
            title: string;
            mainImage: string;
        };
        quantity: number;
        price: number;
    }>;
}

export default function AccountPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [activeSection, setActiveSection] = useState<'profile' | 'orders' | 'password' | 'dashboard'>('profile');
    const [userData, setUserData] = useState<UserData | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        phone: ''
    });
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            if (!session) return;

            setIsLoading(true);
            try {
                const [userRes, ordersRes] = await Promise.all([
                    fetch('/api/users/me'),
                    fetch('/api/orders/my-orders')
                ]);

                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUserData(userData);
                    setEditForm({
                        name: userData.name,
                        phone: userData.phone || ''
                    });
                }

                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    setOrders(ordersData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (session) {
            fetchUserData();
        }
    }, [session]);

    // Dashboard links based on role
    const getDashboardLinks = () => {
        if (!session?.user?.role) return [];

        if (session.user.role === 'admin') {
            return [
                { name: 'Admin Dashboard', href: '/admin-dashboard', icon: <FaTachometerAlt /> },
                { name: 'Manage Products', href: '/admin-dashboard/shop/all-products', icon: <FaShoppingBag /> },
                { name: 'Manage Users', href: '/admin-dashboard/users', icon: <FaUserShield /> },
                { name: 'Manage Orders', href: '/admin-dashboard/orders', icon: <FaShoppingBag /> }
            ];
        } else if (session.user.role === 'moderator') {
            return [
                { name: 'Moderator Dashboard', href: '/moderator', icon: <FaTachometerAlt /> },
                { name: 'Manage Content', href: '/moderator/content', icon: <FaEdit /> }
            ];
        }

        return [];
    };

    const handleEditSave = async () => {
        if (!userData) return;

        try {
            const response = await fetch('/api/users/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedData = await response.json();
            setUserData(updatedData.user);
            setIsEditing(false);
            setMessage('Profile updated successfully!');

            // Update session
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: updatedData.user.name
                }
            });

            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            const response = await fetch('/api/users/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oldPassword: passwordForm.oldPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to change password');
            }

            setMessage('Password changed successfully!');
            setPasswordForm({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setError('');

            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/');
        router.refresh();
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block w-16 h-16 border-4 border-gray-800 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading your account...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const dashboardLinks = getDashboardLinks();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-3xl font-bold mb-2">My Account</h1>
                        <p className="text-gray-300">Manage your profile, orders, and settings</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Sidebar */}
                        <div className="lg:w-1/4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {/* User Info Card */}
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                            <FaUser className="text-2xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">{userData?.name || session.user?.name}</h3>
                                            <p className="text-sm text-gray-600">{session.user?.email}</p>
                                            <p className="text-xs text-gray-500 capitalize mt-1">{session.user?.role}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation Menu */}
                                <nav className="p-4">
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => setActiveSection('profile')}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === 'profile'
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <FaUser className="text-gray-600" />
                                            <span className="font-medium">Profile</span>
                                        </button>

                                        <button
                                            onClick={() => setActiveSection('orders')}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === 'orders'
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <FaShoppingBag className="text-gray-600" />
                                            <span className="font-medium">My Orders</span>
                                            {orders.length > 0 && (
                                                <span className="ml-auto bg-gray-800 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                    {orders.length}
                                                </span>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setActiveSection('password')}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === 'password'
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <FaLock className="text-gray-600" />
                                            <span className="font-medium">Change Password</span>
                                        </button>

                                        {/* Dashboard Links (Admin/Moderator only) */}
                                        {dashboardLinks.length > 0 && (
                                            <div className="pt-4 border-t border-gray-200">
                                                <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Quick Access
                                                </h4>
                                                {dashboardLinks.map((link) => (
                                                    <button
                                                        key={link.name}
                                                        onClick={() => router.push(link.href)}
                                                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        {link.icon}
                                                        <span className="font-medium">{link.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Sign Out Button */}
                                        <div className="pt-4 border-t border-gray-200">
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                                            >
                                                <FaSignOutAlt />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                </nav>
                            </div>
                        </div>

                        {/* Right Content Area */}
                        <div className="lg:w-3/4">
                            {message && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                                    {message}
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                {/* Profile Section */}
                                {activeSection === 'profile' && (
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
                                            {!isEditing ? (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                                                >
                                                    <FaEdit />
                                                    <span>Edit Profile</span>
                                                </button>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={handleEditSave}
                                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        <FaCheck />
                                                        <span>Save</span>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsEditing(false);
                                                            setEditForm({
                                                                name: userData?.name || '',
                                                                phone: userData?.phone || ''
                                                            });
                                                        }}
                                                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        <FaTimes />
                                                        <span>Cancel</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Full Name
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.name}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-900 font-medium">{userData?.name}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Email Address
                                                    </label>
                                                    <p className="text-gray-900 font-medium">{userData?.email}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Phone Number
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="tel"
                                                            value={editForm.phone}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                                                            placeholder="+880 1234 567890"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-900 font-medium">{userData?.phone || 'Not provided'}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Account Type
                                                    </label>
                                                    <div className="flex items-center">
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full capitalize">
                                                            {userData?.role}
                                                        </span>
                                                        {userData?.role === 'admin' && (
                                                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">
                                                                ADMIN
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Member Since
                                                        </label>
                                                        <p className="text-gray-900">
                                                            {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Account Status
                                                        </label>
                                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${userData?.isActive
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {userData?.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Orders Section */}
                                {activeSection === 'orders' && (
                                    <div className="p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">My Orders</h2>

                                        {orders.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <FaShoppingBag className="text-3xl text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                                                <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                                                <button
                                                    onClick={() => router.push('/shop')}
                                                    className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                                                >
                                                    Start Shopping
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {orders.map((order) => (
                                                    <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900">
                                                                        Order #{order.orderNumber}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-600">
                                                                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                                <div className="mt-2 md:mt-0">
                                                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                                'bg-yellow-100 text-yellow-800'
                                                                        }`}>
                                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-6">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <div className="space-y-2">
                                                                        {order.items.map((item, index) => (
                                                                            <div key={index} className="flex items-center">
                                                                                <div className="w-12 h-12 bg-gray-100 rounded mr-3"></div>
                                                                                <div className="flex-1">
                                                                                    <p className="text-gray-900 font-medium">{item.product.title}</p>
                                                                                    <p className="text-sm text-gray-600">
                                                                                        Qty: {item.quantity} × ৳{item.price.toLocaleString()}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="ml-6 text-right">
                                                                    <p className="text-lg font-bold text-gray-900">
                                                                        ৳{order.total.toLocaleString()}
                                                                    </p>
                                                                    <button
                                                                        onClick={() => router.push(`/orders/${order._id}`)}
                                                                        className="mt-2 text-sm text-gray-800 hover:text-gray-900 font-medium"
                                                                    >
                                                                        View Details →
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Change Password Section */}
                                {activeSection === 'password' && (
                                    <div className="p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>

                                        <div className="max-w-lg space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Current Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.oldPassword}
                                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                                                    placeholder="Enter current password"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                                                    placeholder="At least 6 characters"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>

                                            <div className="pt-4">
                                                <button
                                                    onClick={handlePasswordChange}
                                                    disabled={!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                                                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Update Password
                                                </button>
                                            </div>

                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                <h4 className="font-medium text-yellow-800 mb-2">Password Requirements</h4>
                                                <ul className="text-sm text-yellow-700 space-y-1">
                                                    <li>• At least 6 characters long</li>
                                                    <li>• Should include letters and numbers</li>
                                                    <li>• Avoid using common passwords</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}