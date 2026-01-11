// src/app/(dashboard)/layout.tsx

'use client';
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        if (!session || !session.user.isActive) {
            router.push("/unauthorized");
            return;
        }

        // Role-based access control based on path
        if (pathname.startsWith('/admin-dashboard') && session.user.role !== 'admin') {
            router.push("/unauthorized");
            return;
        }
        if (pathname.startsWith('/moderator-dashboard') && session.user.role !== 'moderator') {
            router.push("/unauthorized");
            return;
        }
        if (pathname.startsWith('/user-dashboard') && session.user.role !== 'user') {
            router.push("/unauthorized");
            return;
        }
    }, [session, status, router, pathname]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    if (!session || !session.user.isActive) {
        return null;
    }

    // Additional client-side guard for roles based on path
    if (
        (pathname.startsWith('/admin-dashboard') && session.user.role !== 'admin') ||
        (pathname.startsWith('/moderator-dashboard') && session.user.role !== 'moderator') ||
        (pathname.startsWith('/user-dashboard') && session.user.role !== 'user')
    ) {
        return null;
    }

    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}