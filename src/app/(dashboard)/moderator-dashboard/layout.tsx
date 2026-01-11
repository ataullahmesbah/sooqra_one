'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaHome, FaUser, FaEnvelope, FaUserShield } from 'react-icons/fa';
import { MdDashboard, MdStore, MdPeople, MdImage, MdMenu, MdShoppingBag, MdSettings, MdLogout } from 'react-icons/md';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { IoMdImages } from 'react-icons/io';
import Link from 'next/link';
import { Suspense, useState, useEffect, ReactNode } from 'react';

// Types for DynamicDropDown
interface MenuItem {
    label: string;
    link: string;
    icon?: ReactNode;
}
interface FolderItem {
    label: string;
    icon: ReactNode;
    children: MenuItem[];
}
interface DynamicDropDownProps {
    data: FolderItem[];
}

// Enhanced DynamicDropDown Component
const DynamicDropDown = ({ data }: DynamicDropDownProps) => {
    const [openDropdown, setOpenDropdown] = useState<number | null>(0); // First folder open by default

    const toggleDropdown = (index: number) => {
        setOpenDropdown(openDropdown === index ? null : index);
    };

    return (
        <div className="space-y-1">
            {data.map((item: FolderItem, index: number) => (
                <div key={index} className="mb-1">
                    <button
                        onClick={() => toggleDropdown(index)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-all duration-200 flex justify-between items-center rounded-lg group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-gray-600 group-hover:text-gray-700 transition-colors">
                                {item.icon}
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-gray-900">
                                {item.label}
                            </span>
                        </div>
                        <span className={`text-gray-400 transition-transform duration-300 ${openDropdown === index ? 'rotate-180' : ''}`}>
                            <MdSettings size={16} />
                        </span>
                    </button>

                    {openDropdown === index && (
                        <div className="ml-10 space-y-1 animate-fadeIn">
                            {item.children.map((child: MenuItem, childIndex: number) => (
                                <Link
                                    key={childIndex}
                                    href={child.link}
                                    className="block py-3 px-4 text-gray-600 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 rounded-lg flex items-center gap-3"
                                >
                                    <span className="text-gray-500">•</span>
                                    <span>{child.label}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// Types for ModeratorDashboardLayout
interface ModeratorDashboardLayoutProps {
    children: ReactNode;
}

const ModeratorDashboardLayout = ({ children }: ModeratorDashboardLayoutProps) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [isClient, setIsClient] = useState<boolean>(false);

    // Client-side check
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Enhanced security: Re-validate session on mount and role changes
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'moderator') {
            router.push('/unauthorized');
        }
    }, [status, session, router]);

    const FolderData: FolderItem[] = [
        {
            label: 'Dashboard',
            icon: <MdDashboard size={20} />,
            children: [
                { label: 'Dashboard Home', link: '/moderator-dashboard' },
            ],
        },
        {
            label: 'Navigation',
            icon: <MdMenu size={20} />,
            children: [
                { label: 'Navbar Settings', link: '/moderator-dashboard/navbar' },
            ],
        },
        {
            label: 'Shop Management',
            icon: <MdStore size={20} />,
            children: [
                { label: 'All Products', link: '/moderator-dashboard/shop/all-products' },
                { label: 'Order Status', link: '/moderator-dashboard/shop/order-status' },
                { label: 'Add New Product', link: '/moderator-dashboard/shop/create-products' },
                { label: 'Shop Banners', link: '/moderator-dashboard/shop/shop-banner' },
                { label: 'Shipping Charges', link: '/moderator-dashboard/shop/shipping-charges' },
            ],
        },
        
        {
            label: 'Banner Management',
            icon: <IoMdImages size={20} />,
            children: [
                { label: 'Banner Settings', link: '/moderator-dashboard/home/banners' },
            ],
        },
    ];

    // Loading state
    if (status === 'loading' || !isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    // Redirect if user is not authenticated or not a moderator
    if (status === 'unauthenticated' || session?.user?.role !== 'moderator') {
        router.push('/unauthorized');
        return null;
    }

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-gray-600 text-white rounded-xl shadow-lg hover:bg-gray-700 transition-all duration-300"
            >
                {isDrawerOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            {/* Mobile Overlay */}
            {isDrawerOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed lg:relative w-72 bg-white text-gray-800 transform transition-all duration-300 h-screen overflow-y-auto shadow-xl ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-50 flex flex-col border-r border-gray-200`}
            >
                {/* Sidebar Header with User Info */}
                <div className="p-6 bg-gradient-to-r from-gray-600 to-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <FaUserShield className="text-white text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Moderator Panel</h2>
                            <p className="text-gray-100 text-sm">Control Center</p>
                        </div>
                    </div>

                    {/* User Profile Card */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-gray-700 text-xl font-bold">
                                    {session?.user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-lg truncate">
                                    {session?.user?.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <FaEnvelope className="text-gray-200" size={12} />
                                    <p className="text-gray-200 text-sm truncate">
                                        {session?.user?.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaUser className="text-gray-200" size={14} />
                                <span className="text-white text-sm font-medium">Moderator</span>
                            </div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 p-5 overflow-y-auto">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-4 px-2">
                        Main Navigation
                    </h3>
                    <DynamicDropDown data={FolderData} />
                </div>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-gray-200">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-3 p-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:shadow-lg transition-all duration-300 group"
                        onClick={() => setIsDrawerOpen(false)}
                    >
                        <FaHome className="group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Back to Home</span>
                    </Link>

                    <div className="mt-4 text-center">
                        <p className="text-gray-500 text-xs">
                            Sooqra One v3.0 • Secure Access
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-screen overflow-auto">
                {/* Top Navigation Bar */}
                <div className="sticky top-0 z-30 bg-white shadow-sm px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                            <p className="text-gray-600">Welcome back, <span className="text-gray-600 font-medium">{session?.user?.name}</span></p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:block text-right">
                                <p className="text-gray-700 font-medium">Last Active</p>
                                <p className="text-gray-500 text-sm">Just now</p>
                            </div>
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {session?.user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <Suspense fallback={
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="w-10 h-10 border-3 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading content...</p>
                        </div>
                    </div>
                }>
                    <div className="p-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 ">
                            {children}
                        </div>
                    </div>
                </Suspense>


            </div>
        </div>
    );
};

export default ModeratorDashboardLayout;