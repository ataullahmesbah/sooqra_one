'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    FaBars,
    FaTimes,
    FaHome,
    FaEnvelope,
    FaUserCircle,
    FaCircle
} from 'react-icons/fa';
import {
    MdSpaceDashboard,
    MdInventory,
    MdAddCircleOutline,
    MdListAlt,
    MdImage,
    MdDashboard,
    MdOutlineDashboardCustomize
} from 'react-icons/md';
import { BsImages } from 'react-icons/bs';
import { RiAdminLine } from 'react-icons/ri';
import Link from 'next/link';
import { Suspense, useState, ReactNode } from 'react';
import { TbLayoutDashboardFilled } from 'react-icons/tb';

// ─── Types ────────────────────────────────────────────────
interface MenuItem {
    label: string;
    link: string;
    icon: ReactNode;          // ← now required for child items
}

interface FolderItem {
    label: string;
    icon: ReactNode;
    children: MenuItem[];
}

interface DynamicDropDownProps {
    data: FolderItem[];
}

// ─── Dropdown with icons on children ──────────────────────
const DynamicDropDown = ({ data }: DynamicDropDownProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="space-y-1 px-3">
            {data.map((folder, i) => {
                const isOpen = openIndex === i;
                return (
                    <div key={i}>
                        <button
                            onClick={() => setOpenIndex(isOpen ? null : i)}
                            className={`
                group w-full flex items-center gap-3.5 py-3.5 px-4 rounded-xl text-left
                transition-all duration-200
                ${isOpen
                                    ? 'bg-indigo-700/25 text-indigo-300 font-medium'
                                    : 'text-gray-300 hover:bg-white/8 hover:text-indigo-400'}
              `}
                        >
                            <span className="text-xl opacity-90 group-hover:scale-110 transition-transform duration-200">
                                {folder.icon}
                            </span>
                            <span className="flex-1 font-medium tracking-wide">
                                {folder.label}
                            </span>
                            <svg
                                className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isOpen && (
                            <div className="mt-1.5 mb-2 space-y-0.5 animate-fade-in">
                                {folder.children.map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={item.link}
                                        className={`
                      flex items-center gap-3 py-2.5 px-5 text-sm rounded-lg
                      transition-all duration-200
                      text-gray-400 hover:text-indigo-300 hover:bg-indigo-950/30
                      hover:pl-6
                    `}
                                    >
                                        <span className="text-indigo-400/80 text-base">
                                            {item.icon}
                                        </span>
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ─── Main Layout ──────────────────────────────────────────
interface ModeratorDashboardLayoutProps {
    children: ReactNode;
}

export default function ModeratorDashboardLayout({ children }: ModeratorDashboardLayoutProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Fix: No setState in useEffect → simple client check via typeof
    const isClient = typeof window !== 'undefined';

    if (!isClient || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 mt-3">Loading moderator panel...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated' || session?.user?.role !== 'moderator') {
        router.replace('/unauthorized');
        return null;
    }

    // ── Updated menu with icons for children ───────────────
    const menuData: FolderItem[] = [
        {
            label: 'Dashboard',
            icon: <TbLayoutDashboardFilled />,
            children: [
                { label: 'Moderator Dashboard', link: '/moderator-dashboard', icon: <MdOutlineDashboardCustomize size={10} /> },
            ],
        },
        {
            label: 'Product Management',
            icon: <MdInventory />,
            children: [
                { label: 'All Products', link: '/moderator-dashboard/product/all-products', icon: <MdListAlt /> },
                { label: 'Order Management', link: '/moderator-dashboard/product/order-status', icon: <MdListAlt /> },
                { label: 'Add Product', link: '/moderator-dashboard/product/create-products', icon: <MdAddCircleOutline /> },
            ],
        },
        {
            label: 'Banner Management',
            icon: <BsImages />,
            children: [
                { label: 'Manage Banners', link: '/moderator-dashboard/home/banners', icon: <MdImage /> },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex">
            {/* Mobile toggle */}
            <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-3.5 bg-indigo-600/90 backdrop-blur-md text-white rounded-xl shadow-xl hover:bg-indigo-700 transition"
            >
                {isDrawerOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            {isDrawerOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/65 backdrop-blur-sm z-40"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            {/* ─── Sidebar (indigo glass style) ─── */}
            <aside
                className={`
          fixed lg:static z-50 h-screen w-72 lg:w-72 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-gradient-to-b from-slate-900/85 to-slate-950/90
          backdrop-blur-xl border-r border-slate-700/40 shadow-2xl
        `}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-700/50 bg-black/25">
                    <div className="flex items-center gap-3">
                        <RiAdminLine className="text-3xl text-indigo-500" />
                        <h2 className="text-2xl font-bold tracking-tight text-white">
                            Moderator
                        </h2>
                    </div>
                </div>

                {/* User info */}
                <div className="p-5 border-b border-slate-800/50 bg-black/15">
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            <FaUserCircle className="text-5xl text-indigo-500/90" />
                            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-950" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold truncate text-lg">
                                {session?.user?.name || 'Moderator'}
                            </p>
                            <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1 truncate">
                                <FaEnvelope size={14} className="text-indigo-400" />
                                {session?.user?.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 pt-6 pb-10 overflow-y-auto">
                    <h3 className="px-6 mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                        Navigation
                    </h3>
                    <DynamicDropDown data={menuData} />
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-800/50 bg-black/25 mt-auto">
                    <Link
                        href="/"
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center justify-center gap-3 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-normal rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 active:scale-[0.98]"
                    >
                        <FaHome size={18} />
                        Back to Home
                    </Link>
                   
                </div>
            </aside>

            {/* ─── Main Content ─── */}
            <main className="flex-1 min-h-screen overflow-auto bg-gradient-to-br from-gray-950 via-slate-950 to-black">
                <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Moderator Dashboard</h1>
                            <p className="text-gray-400 mt-0.5">
                                Welcome back, <span className="text-indigo-400 font-medium">{session?.user?.name}</span>
                            </p>
                        </div>
                        <FaUserCircle className="text-4xl text-indigo-500/90" />
                    </div>
                </header>

                <div className="p-6 lg:p-8">
                    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/50 shadow-xl p-6 lg:p-8">
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-64">
                                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        }>
                            {children}
                        </Suspense>
                    </div>
                </div>
            </main>
        </div>
    );
}