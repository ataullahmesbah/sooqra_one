'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaUser, 
  FaEnvelope, 
  FaUserShield,
  FaCircle,
  FaUserCircle
} from 'react-icons/fa';
import { 
  MdDashboard, 
  MdStore, 
  MdImage, 
  MdShoppingBag, 
  MdLogout,
  MdSpaceDashboard,
  MdInventory,
  MdAddShoppingCart,
  MdLocalShipping,
  MdSettings
} from 'react-icons/md';
import { IoMdImages } from 'react-icons/io';
import { RiAdminLine } from 'react-icons/ri';
import { HiOutlineUserGroup, HiOutlineShoppingBag } from 'react-icons/hi';
import { BsGrid3X3Gap, BsFillGridFill, BsImages } from 'react-icons/bs';
import { TbBasket, TbBasketPlus } from 'react-icons/tb';
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
    const [openDropdown, setOpenDropdown] = useState<number | null>(0);

    const toggleDropdown = (index: number) => {
        setOpenDropdown(openDropdown === index ? null : index);
    };

    return (
        <div className="space-y-1">
            {data.map((item: FolderItem, index: number) => (
                <div key={index} className="mb-1">
                    <button
                        onClick={() => toggleDropdown(index)}
                        className="w-full p-3 text-left hover:bg-orange-200/50 transition-all duration-200 flex justify-between items-center rounded-lg group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-orange-700 group-hover:text-orange-800 transition-colors">
                                {item.icon}
                            </div>
                            <span className="font-medium text-gray-800 group-hover:text-orange-800">
                                {item.label}
                            </span>
                        </div>
                        <span className={`text-orange-600 transition-transform duration-300 ${openDropdown === index ? 'rotate-180' : ''}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </button>

                    {openDropdown === index && (
                        <div className="ml-10 space-y-1 animate-fadeIn mt-1">
                            {item.children.map((child: MenuItem, childIndex: number) => (
                                <Link
                                    key={childIndex}
                                    href={child.link}
                                    className="block py-2 px-4 text-gray-600 hover:text-orange-700 hover:bg-orange-100 transition-all duration-200 rounded-lg flex items-center gap-3 text-sm"
                                >
                                    <span className="text-orange-500">•</span>
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

    // ✅ Updated Folder Data with working icons
    const FolderData: FolderItem[] = [
        {
            label: 'Dashboard',
            icon: <MdSpaceDashboard size={20} />,
            children: [
                { label: 'Moderator Dashboard', link: '/moderator-dashboard' },
            ],
        },
        {
            label: 'Product Management',
            icon: <MdInventory size={20} />,
            children: [
                { label: 'All Products', link: '/moderator-dashboard/product/all-products' },
                { label: 'Order Management', link: '/moderator-dashboard/product/order-status' },
                { label: 'Add Product', link: '/moderator-dashboard/shop/create-products' },
            ],
        },
        {
            label: 'Banner Management',
            icon: <BsImages size={20} />, // ✅ Fixed: RiBannerLine -> BsImages
            children: [
                { label: 'Manage Banners', link: '/moderator-dashboard/home/banners' },
            ],
        },
    ];

    // Loading state
    if (status === 'loading' || !isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-orange-500 text-white rounded-xl shadow-lg hover:bg-orange-600 transition-all duration-300"
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

            {/* Sidebar - with bg-orange-100 as requested */}
            <div
                className={`fixed lg:relative w-72 bg-orange-100 text-gray-800 transform transition-all duration-300 h-screen overflow-y-auto shadow-xl ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-50 flex flex-col border-r border-orange-200`}
            >
                {/* Sidebar Header with "Moderator Panel" at the very top */}
                <div className="p-6 bg-orange-200 border-b border-orange-300">
                    <h2 className="text-2xl font-bold text-orange-800 flex items-center gap-2">
                        <RiAdminLine className="text-orange-800" />
                        Moderator Panel
                    </h2>
                </div>

                {/* Welcome Section with Name, Email, and User Circle */}
                <div className="p-6 border-b border-orange-200 bg-orange-50/50">
                    <div className="flex items-center gap-4">
                        {/* User React Icon Circle */}
                        <div className="relative">
                            <FaUserCircle className="text-6xl text-orange-600" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-orange-100"></div>
                        </div>
                        
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">
                                Welcome, {session?.user?.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <FaEnvelope className="text-orange-600" size={14} />
                                <p className="text-gray-600 text-sm truncate">
                                    {session?.user?.email}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <FaUser className="text-orange-600" size={12} />
                                <span className="text-xs font-medium text-orange-700 bg-orange-200 px-2 py-0.5 rounded-full">
                                    Moderator
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <h3 className="text-orange-800 text-xs font-semibold uppercase tracking-wider mb-3 px-2">
                        Main Navigation
                    </h3>
                    <DynamicDropDown data={FolderData} />
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-orange-200 bg-orange-100">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all duration-300 group"
                        onClick={() => setIsDrawerOpen(false)}
                    >
                        <FaHome className="group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Back to Home</span>
                    </Link>

                    <div className="mt-3 text-center">
                        <p className="text-orange-700 text-xs">
                            Sooqra One v3.0 • Moderator Access
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
                            <h1 className="text-2xl font-bold text-gray-800">Moderator Dashboard</h1>
                            <p className="text-gray-600">Welcome back, <span className="text-orange-600 font-medium">{session?.user?.name}</span></p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:block text-right">
                                <p className="text-gray-700 font-medium">Last Active</p>
                                <p className="text-gray-500 text-sm">Just now</p>
                            </div>
                            <div className="relative">
                                <FaUserCircle className="text-4xl text-orange-600" />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <Suspense fallback={
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="w-10 h-10 border-3 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading content...</p>
                        </div>
                    </div>
                }>
                    <div className="p-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            {children}
                        </div>
                    </div>
                </Suspense>
            </div>
        </div>
    );
};

export default ModeratorDashboardLayout;