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

        if (session && (!session.user.isActive || session.user.role !== 'admin')) {
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

    if (!session || !session.user.isActive || session.user.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {children}
        </div>
    );
}