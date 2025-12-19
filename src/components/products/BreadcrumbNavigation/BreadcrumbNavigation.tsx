// src/components/products/BreadcrumbNavigation/BreadcrumbNavigation.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FaHome, FaChevronRight } from 'react-icons/fa';
import { Category } from '@/src/types/index';

interface BreadcrumbNavigationProps {
    currentCategory: Category | null;
    categorySlug: string;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
    currentCategory,
    categorySlug
}) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const breadcrumbItems = [
        {
            label: 'Home',
            href: '/',
            icon: <FaHome className="w-4 h-4" />,
            current: false,
        },
        {
            label: 'Products',
            href: '/products',
            current: !categorySlug && pathname === '/products',
        },
    ];

    // Add category if exists
    if (categorySlug && currentCategory) {
        breadcrumbItems.push({
            label: currentCategory.name,
            href: `/products?category=${categorySlug}`,
            current: true,
        });
    }

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                {breadcrumbItems.map((item, index) => (
                    <li key={item.label} className="flex items-center">
                        {index > 0 && (
                            <FaChevronRight className="w-3 h-3 text-gray-400 mx-2" />
                        )}

                        <Link
                            href={item.href}
                            className={`inline-flex items-center text-sm font-medium transition-colors ${item.current
                                    ? 'text-gray-900 font-semibold'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            aria-current={item.current ? 'page' : undefined}
                        >
                            {item.icon && (
                                <span className="mr-2">{item.icon}</span>
                            )}
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default BreadcrumbNavigation;