'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import { Suspense, useState, useEffect, ReactNode } from 'react';

// Types for DynamicDropDown
interface MenuItem {
    label: string;
    link: string;
}

interface FolderItem {
    label: string;
    children: MenuItem[];
}

interface DynamicDropDownProps {
    data: FolderItem[];
}

// DynamicDropDown Component
const DynamicDropDown = ({ data }: DynamicDropDownProps) => {
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    const toggleDropdown = (index: number) => {
        setOpenDropdown(openDropdown === index ? null : index);
    };

    return (
        <div className="space-y-2">
            {data.map((item: FolderItem, index: number) => (
                <div key={index} className="border border-gray-700 rounded-lg">
                    <button
                        onClick={() => toggleDropdown(index)}
                        className="w-full p-3 text-left bg-gray-800 hover:bg-gray-700 rounded-lg flex justify-between items-center transition-colors duration-200"
                    >
                        <span className="font-semibold text-white">{item.label}</span>
                        <span className={`transform transition-transform duration-200 ${openDropdown === index ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>

                    {openDropdown === index && (
                        <div className="mt-1 space-y-1 p-2 bg-gray-800 rounded-lg">
                            {item.children.map((child: MenuItem, childIndex: number) => (
                                <Link
                                    key={childIndex}
                                    href={child.link}
                                    className="block p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
                                >
                                    {child.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// Types for AdminDashboardLayout
interface AdminDashboardLayoutProps {
    children: ReactNode;
}

const AdminDashboardLayout = ({ children }: AdminDashboardLayoutProps) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [isClient, setIsClient] = useState<boolean>(false);

    // Client-side check
    useEffect(() => {
        setIsClient(true);
    }, []);

    const FolderData: FolderItem[] = [
        {
            label: 'DASHBOARD',
            children: [
                { label: 'Dashboard Home', link: '/admin-dashboard' },
            ],
        },
        {
            label: 'SHOP',
            children: [
                { label: 'ALL Products', link: '/admin-dashboard/shop/all-products' },
                { label: 'Order Status', link: '/admin-dashboard/shop/order-status' },
                { label: 'Add Product', link: '/admin-dashboard/shop/create-products' },
                { label: 'Banner Shop', link: '/admin-dashboard/shop/shop-banner' },
                { label: 'Shipping Charges', link: '/admin-dashboard/shop/shipping-charges' },
            ],
        },
        {
            label: 'USER',
            children: [
                { label: 'User Control', link: '/admin-dashboard/users/users-control' },

            ],
        },
    ];

    // Loading state
    if (status === 'loading' || !isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    // Redirect if user is not authenticated or not an admin
    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
        router.push('/');
        return null;
    }

    return (
        <div className="admin-dashboard-layout min-h-screen flex bg-gray-900">
            {/* Drawer Toggle Button (Mobile) */}
            <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md lg:hidden"
            >
                {isDrawerOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            {/* Overlay for mobile */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed lg:relative w-80 bg-gray-900 text-white p-6 transform transition-transform duration-300 ease-in-out h-screen overflow-y-auto ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-40`}
            >
                {/* User Info Section */}
                <div className="mb-8 p-4 bg-gray-800 rounded-lg">
                    <h2 className="text-xl font-bold text-center mb-2">Admin Panel</h2>
                    <p className="text-center text-blue-300">Welcome, {session?.user?.name}!</p>
                    <p className="text-center text-gray-400 text-sm mt-1">{session?.user?.email}</p>
                </div>

                <nav className="space-y-3">
                    <DynamicDropDown data={FolderData} />

                    <Link
                        href="/"
                        className="block p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 text-center"
                        onClick={() => setIsDrawerOpen(false)}
                    >
                        🏠 Back to Home
                    </Link>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-screen bg-gray-800 overflow-auto">
                <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                        <div className="text-white text-lg">Loading...</div>
                    </div>
                }>
                    <div className="p-4 lg:p-6">
                        {children}
                    </div>
                </Suspense>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;