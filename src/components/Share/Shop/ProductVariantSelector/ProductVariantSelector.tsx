'use client';

import { useState, useEffect } from 'react';
import { FaCheck } from 'react-icons/fa';

export interface Variant {
    _id: string;
    name: string;
    weight: string;
    price: number;
    comparePrice: number;
    sku: string;
    quantity: number;
    isDefault: boolean;
}

interface ProductVariantSelectorProps {
    productId: string;
    onVariantChange?: (variant: Variant | null) => void;
    selectedVariantId?: string;
}

export default function ProductVariantSelector({
    productId,
    onVariantChange,
    selectedVariantId
}: ProductVariantSelectorProps) {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVariants();
    }, [productId]);

    useEffect(() => {
        if (selectedVariantId && variants.length > 0) {
            const found = variants.find(v => v._id === selectedVariantId);
            if (found) {
                setSelectedVariant(found);
                onVariantChange?.(found);
            }
        }
    }, [selectedVariantId, variants]);

    const fetchVariants = async () => {
        try {
            const res = await fetch(`/api/products/variants?productId=${productId}`);
            const data = await res.json();
            setVariants(data);

            const defaultVariant = data.find((v: Variant) => v.isDefault);
            if (defaultVariant) {
                setSelectedVariant(defaultVariant);
                onVariantChange?.(defaultVariant);
            } else if (data.length > 0) {
                setSelectedVariant(data[0]);
                onVariantChange?.(data[0]);
            }
        } catch (error) {
            console.error('Error fetching variants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectVariant = (variant: Variant) => {
        setSelectedVariant(variant);
        onVariantChange?.(variant);
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
        );
    }

    if (variants.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Label - Bold and Gray */}
            <label className="block text-sm font-bold text-gray-700">
                Select Package / Weight
            </label>

            {/* Variants - Single Line with Wrap */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-3">
                {variants.map((variant) => (
                    <button
                        key={variant._id}
                        onClick={() => handleSelectVariant(variant)}
                        disabled={variant.quantity === 0}
                        className={`
                            inline-flex items-center gap-2 sm:gap-2
                            px-3 sm:px-3 py-2 rounded-lg border 
                            transition-all duration-200
                            text-xs sm:text-sm
                            ${variant.quantity === 0
                                ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200'
                                : selectedVariant?._id === variant._id
                                    ? 'bg-green-600 border-green-600 text-white shadow-sm'
                                    : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }
                        `}
                    >
                        {/* Weight - Darker gray (text-gray-700) */}
                        <span className={`
                            md:text-base font-medium
                            ${selectedVariant?._id === variant._id
                                ? 'text-green-200'
                                : 'text-gray-700'
                            }
                        `}>
                            {variant.weight}
                        </span>

                        {/* Separator */}
                        <span className={`
                            text-xs
                            ${selectedVariant?._id === variant._id
                                ? 'text-green-300'
                                : 'text-gray-400'
                            }
                        `}>
                            •
                        </span>

                        {/* Variant Name - semibold when selected */}
                        <span className={`
                            ${selectedVariant?._id === variant._id
                                ? 'font-semibold text-white'
                                : 'font-medium text-gray-800'
                            }
                        `}>
                            {variant.name}
                        </span>

                        {/* Separator */}
                        <span className={`
                            text-xs
                            ${selectedVariant?._id === variant._id
                                ? 'text-green-300'
                                : 'text-gray-400'
                            }
                        `}>
                            •
                        </span>

                        {/* Price */}
                        <span className={`
                            font-bold
                            ${selectedVariant?._id === variant._id
                                ? 'text-white'
                                : 'text-gray-900'
                            }
                        `}>
                            ৳ {variant.price.toLocaleString()}
                        </span>

                        {/* Check icon when selected */}
                        {selectedVariant?._id === variant._id && (
                            <FaCheck size={12} className="text-white ml-0.5" />
                        )}

                        {/* Low Stock Warning */}
                        {variant.quantity <= 3 && variant.quantity > 0 && (
                            <span className="text-xs text-orange-500 ml-0.5 whitespace-nowrap">
                                ({variant.quantity} left)
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}