// src/app/components/CategoryGrid.tsx - SIMPLIFIED
'use client';

import { useEffect, useState } from 'react';
import CategoryCard from '../CategoryCard/CategoryCard';


const CategoryGrid = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);

                // Use simple API
                const response = await fetch('/api/categories?limit=6&withCount=true&withLatestProduct=true');

                if (!response.ok) {
                    throw new Error('Failed to fetch');
                }

                const data = await response.json();
                setCategories(data);
            } catch (err) {
                console.error('Error:', err);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">No categories found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: any) => (
                <CategoryCard key={category._id} category={category} />
            ))}
        </div>
    );
};

export default CategoryGrid;