// src/components/Dashboard/ProductVariantsManager/ProductVariantsManager.tsx

'use client';

import { useState } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

export interface Variant {
    _id?: string;
    name: string;
    weight: string;
    price: number;
    comparePrice: number;
    sku: string;
    quantity: number;
    isDefault: boolean;
}

interface ProductVariantsManagerProps {
    productId: string;
    initialVariants?: Variant[];
    onVariantsChange?: (variants: Variant[]) => void;
    productQuantity?: number;  // ✅ নতুন prop যোগ করুন
}

export default function ProductVariantsManager({
    productId,
    initialVariants = [],
    onVariantsChange,
    productQuantity = 0  // ✅ default 0
}: ProductVariantsManagerProps) {
    const [variants, setVariants] = useState<Variant[]>(initialVariants);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newVariant, setNewVariant] = useState<Variant>({
        name: '',
        weight: '',
        price: 0,
        comparePrice: 0,
        sku: '',
        quantity: 0,
        isDefault: false
    });

    const handleAddVariant = () => {
        if (!newVariant.name || !newVariant.weight || newVariant.price <= 0) {
            alert('Please fill all required fields');
            return;
        }

        // Check if variant with same name already exists
        if (variants.some(v => v.name === newVariant.name)) {
            alert('A variant with this name already exists!');
            return;
        }

        // ✅ Calculate total quantity of all variants including the new one
        const currentTotalQuantity = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
        const newTotalQuantity = currentTotalQuantity + newVariant.quantity;

        // ✅ Check against product total quantity (using props)
        if (productQuantity > 0 && newTotalQuantity > productQuantity) {
            alert(`Total variant quantity (${newTotalQuantity}) cannot exceed product quantity (${productQuantity})`);
            return;
        }

        const updatedVariants = [...variants, {
            ...newVariant,
            sku: newVariant.sku || `${productId || Date.now()}-${Date.now()}`
        }];
        setVariants(updatedVariants);
        onVariantsChange?.(updatedVariants);

        setNewVariant({
            name: '',
            weight: '',
            price: 0,
            comparePrice: 0,
            sku: '',
            quantity: 0,
            isDefault: false
        });
        setIsAdding(false);
    };

    const handleUpdateVariant = (index: number) => {
        // ✅ Validate total quantity on update
        const updatedVariants = [...variants];
        const currentTotalQuantity = updatedVariants.reduce((sum, v, i) => {
            if (i === index) return sum;
            return sum + (v.quantity || 0);
        }, 0);
        const newTotalQuantity = currentTotalQuantity + updatedVariants[index].quantity;

        if (productQuantity > 0 && newTotalQuantity > productQuantity) {
            alert(`Total variant quantity (${newTotalQuantity}) cannot exceed product quantity (${productQuantity})`);
            return;
        }

        setEditingIndex(null);
        onVariantsChange?.(updatedVariants);
    };

    const handleRemoveVariant = (index: number) => {
        const updatedVariants = variants.filter((_, i) => i !== index);
        setVariants(updatedVariants);
        onVariantsChange?.(updatedVariants);
    };

    const handleSetDefault = (index: number) => {
        const updatedVariants = variants.map((v, i) => ({
            ...v,
            isDefault: i === index
        }));
        setVariants(updatedVariants);
        onVariantsChange?.(updatedVariants);
    };

    const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
        const updatedVariants = [...variants];
        updatedVariants[index] = { ...updatedVariants[index], [field]: value };
        setVariants(updatedVariants);
    };

    // ✅ Quantity change handler with validation
    const handleQuantityChange = (index: number, value: number) => {
        const updatedVariants = [...variants];
        const oldQuantity = updatedVariants[index].quantity;
        updatedVariants[index].quantity = value;

        // Validate total quantity
        const totalQuantity = updatedVariants.reduce((sum, v) => sum + (v.quantity || 0), 0);
        if (productQuantity > 0 && totalQuantity > productQuantity) {
            alert(`Total variant quantity (${totalQuantity}) cannot exceed product quantity (${productQuantity})`);
            updatedVariants[index].quantity = oldQuantity;
            return;
        }

        setVariants(updatedVariants);
        onVariantsChange?.(updatedVariants);
    };

    return (
        <div className="border border-gray-700 rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Product Variants (Weight/Size Options)</h3>
                <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                >
                    <FaPlus size={12} /> Add Variant
                </button>
            </div>

            {/* Show total quantity info */}
            {productQuantity > 0 && (
                <div className="mb-3 text-sm text-gray-400">
                    Total Product Stock: {productQuantity} |
                    Variants Total: {variants.reduce((sum, v) => sum + (v.quantity || 0), 0)} / {productQuantity}
                    {variants.reduce((sum, v) => sum + (v.quantity || 0), 0) > productQuantity && (
                        <span className="text-red-500 ml-2">⚠️ Exceeds product quantity!</span>
                    )}
                </div>
            )}

            {/* Variants List */}
            <div className="space-y-3">
                {variants.map((variant, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3">
                        {editingIndex === index ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <input
                                        type="text"
                                        value={variant.name}
                                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                                        className="px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white text-sm"
                                        placeholder="Name (e.g., 5kg Box)"
                                    />
                                    <input
                                        type="text"
                                        value={variant.weight}
                                        onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                                        className="px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white text-sm"
                                        placeholder="Weight (e.g., 5 KG)"
                                    />
                                    <input
                                        type="number"
                                        value={variant.price}
                                        onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))}
                                        className="px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white text-sm"
                                        placeholder="Price (৳)"
                                    />
                                    <input
                                        type="number"
                                        value={variant.quantity}
                                        onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                                        className="px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white text-sm"
                                        placeholder="Stock"
                                        min="0"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingIndex(null)}
                                        className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm flex items-center gap-1"
                                    >
                                        <FaTimes size={12} /> Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleUpdateVariant(index)}
                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1"
                                    >
                                        <FaSave size={12} /> Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div>
                                        <span className="text-gray-400 text-xs">Name</span>
                                        <p className="text-white font-medium">{variant.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-xs">Weight</span>
                                        <p className="text-white">{variant.weight}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-xs">Price</span>
                                        <p className="text-green-400 font-bold">৳{variant.price.toLocaleString()}</p>
                                    </div>
                                    {variant.comparePrice > 0 && (
                                        <div>
                                            <span className="text-gray-400 text-xs">Compare Price</span>
                                            <p className="text-gray-400 line-through">৳{variant.comparePrice.toLocaleString()}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-400 text-xs">Stock</span>
                                        <p className="text-white">{variant.quantity}</p>
                                    </div>
                                    {variant.isDefault && (
                                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Default</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {!variant.isDefault && variants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleSetDefault(index)}
                                            className="p-1.5 text-yellow-400 hover:text-yellow-300"
                                            title="Set as default"
                                        >
                                            ⭐
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setEditingIndex(index)}
                                        className="p-1.5 text-blue-400 hover:text-blue-300"
                                    >
                                        <FaEdit size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveVariant(index)}
                                        className="p-1.5 text-red-400 hover:text-red-300"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add New Variant Form - same as before */}
            {isAdding && (
                <div className="mt-4 bg-gray-800 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Add New Variant</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                        <input
                            type="text"
                            value={newVariant.name}
                            onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                            className="px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white text-sm"
                            placeholder="Name *"
                        />
                        <input
                            type="text"
                            value={newVariant.weight}
                            onChange={(e) => setNewVariant({ ...newVariant, weight: e.target.value })}
                            className="px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white text-sm"
                            placeholder="Weight *"
                        />
                        <input
                            type="number"
                            value={newVariant.price}
                            onChange={(e) => setNewVariant({ ...newVariant, price: Number(e.target.value) })}
                            className="px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white text-sm"
                            placeholder="Price *"
                        />
                        <input
                            type="number"
                            value={newVariant.comparePrice}
                            onChange={(e) => setNewVariant({ ...newVariant, comparePrice: Number(e.target.value) })}
                            className="px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white text-sm"
                            placeholder="Compare Price"
                        />
                        <input
                            type="number"
                            value={newVariant.quantity}
                            onChange={(e) => setNewVariant({ ...newVariant, quantity: Number(e.target.value) })}
                            className="px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white text-sm"
                            placeholder="Stock"
                            min="0"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleAddVariant}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm"
                        >
                            Add Variant
                        </button>
                    </div>
                </div>
            )}

            {variants.length === 0 && !isAdding && (
                <p className="text-gray-400 text-sm text-center py-4">
                    No variants added. Click -Add Variant- to add product options.
                </p>
            )}
        </div>
    );
}