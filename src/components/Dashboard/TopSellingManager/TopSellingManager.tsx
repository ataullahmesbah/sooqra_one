'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast, Toaster } from 'react-hot-toast';

interface Product {
    _id: string;
    title: string;
    mainImage: string;
    total_sales: number;
    brand?: string;
}

interface PinnedProduct {
    productId: string;
    order: number;
}

export default function TopSellingManager() {
    const [mode, setMode] = useState<'manual' | 'auto'>('auto');
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [pinnedProducts, setPinnedProducts] = useState<PinnedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch data on mount
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            
            // Fetch current config
            const configRes = await fetch('/api/products/top-selling-config');
            const configData = await configRes.json();
            
            if (configData.success) {
                setMode(configData.config.mode);
                setPinnedProducts(configData.config.pinnedProducts || []);
            }
            
            // Fetch all products with sales data
            const [productsRes, topSellingRes] = await Promise.all([
                fetch('/api/products?limit=200'),
                fetch('/api/products/top-selling?limit=200')
            ]);
            
            const products = await productsRes.json();
            const topSelling = await topSellingRes.json();
            
            // Create sales map
            const salesMap = new Map();
            if (topSelling.products) {
                topSelling.products.forEach((p: any) => {
                    salesMap.set(p._id, p.total_sales);
                });
            }
            
            const productsWithSales = products.map((p: any) => ({
                _id: p._id,
                title: p.title,
                mainImage: p.mainImage,
                brand: p.brand,
                total_sales: salesMap.get(p._id) || 0
            }));
            
            setAvailableProducts(productsWithSales);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToPinned = (productId: string) => {
        if (pinnedProducts.length >= 15) {
            toast.error('Maximum 15 products can be pinned');
            return;
        }
        
        if (!pinnedProducts.find(p => p.productId === productId)) {
            const newOrder = pinnedProducts.length;
            setPinnedProducts([...pinnedProducts, { productId, order: newOrder }]);
            toast.success('Product pinned successfully');
        } else {
            toast.error('Product already pinned');
        }
    };

    const handleRemoveFromPinned = (productId: string) => {
        const newPinned = pinnedProducts.filter(p => p.productId !== productId);
        const reordered = newPinned.map((p, idx) => ({ ...p, order: idx }));
        setPinnedProducts(reordered);
        toast.success('Product removed from pinned');
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;
        
        const items = Array.from(pinnedProducts);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        const updatedItems = items.map((item, idx) => ({ ...item, order: idx }));
        setPinnedProducts(updatedItems);
        toast.success('Order updated');
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            const response = await fetch('/api/products/top-selling-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mode,
                    pinnedProducts: mode === 'manual' ? pinnedProducts : []
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                toast.success('Settings saved successfully!');
                // Refresh to verify
                await fetchAllData();
            } else {
                toast.error(data.error || 'Failed to save');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const filteredProducts = availableProducts.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !pinnedProducts.find(p => p.productId === product._id)
    );

    const getProductDetails = (productId: string) => {
        return availableProducts.find(p => p._id === productId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" />
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Top Selling Products Manager</h1>
                        <p className="mt-2 text-gray-600">Manage which products appear in the top selling section</p>
                    </div>

                    {/* Mode Selection Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Display Mode</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div 
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                    mode === 'auto' 
                                        ? 'border-indigo-600 bg-indigo-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setMode('auto')}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Auto Mode</h3>
                                        <p className="text-sm text-gray-600 mt-1">Products automatically sorted by sales</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 ${
                                        mode === 'auto' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                                    }`}>
                                        {mode === 'auto' && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                                    </div>
                                </div>
                            </div>
                            
                            <div 
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                    mode === 'manual' 
                                        ? 'border-indigo-600 bg-indigo-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setMode('manual')}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Manual Mode</h3>
                                        <p className="text-sm text-gray-600 mt-1">Hand-pick and arrange products manually</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 ${
                                        mode === 'manual' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                                    }`}>
                                        {mode === 'manual' && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {mode === 'manual' && (
                        <>
                            {/* Search and Available Products */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Products</h2>
                                
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                
                                <div className="max-h-96 overflow-y-auto space-y-2">
                                    {filteredProducts.slice(0, 50).map(product => (
                                        <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                            <div className="flex items-center gap-3 flex-1">
                                                <img 
                                                    src={product.mainImage} 
                                                    alt={product.title} 
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{product.title}</p>
                                                    <div className="flex gap-4 text-sm text-gray-500">
                                                        {product.brand && <span>Brand: {product.brand}</span>}
                                                        <span>Sales: {product.total_sales}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAddToPinned(product._id)}
                                                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                                            >
                                                Pin Product
                                            </button>
                                        </div>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <p className="text-center text-gray-500 py-8">No products available</p>
                                    )}
                                </div>
                            </div>

                            {/* Pinned Products with Drag & Drop */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Pinned Products ({pinnedProducts.length}/15)
                                    </h2>
                                    <span className="text-sm text-gray-500">Drag to reorder</span>
                                </div>
                                
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId="pinned-products">
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="space-y-2"
                                            >
                                                {pinnedProducts.map((pin, index) => {
                                                    const product = getProductDetails(pin.productId);
                                                    if (!product) return null;
                                                    return (
                                                        <Draggable key={pin.productId} draggableId={pin.productId} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition ${
                                                                        snapshot.isDragging 
                                                                            ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                                                                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-3 flex-1">
                                                                        <div
                                                                            {...provided.dragHandleProps}
                                                                            className="cursor-move text-gray-400 hover:text-gray-600"
                                                                        >
                                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                                                            </svg>
                                                                        </div>
                                                                        <img 
                                                                            src={product.mainImage} 
                                                                            alt={product.title} 
                                                                            className="w-12 h-12 object-cover rounded-lg"
                                                                        />
                                                                        <div className="flex-1">
                                                                            <p className="font-medium text-gray-900">{product.title}</p>
                                                                            <p className="text-sm text-gray-500">Order: #{pin.order + 1} | Sales: {product.total_sales}</p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleRemoveFromPinned(pin.productId)}
                                                                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                                
                                {pinnedProducts.length === 0 && (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                        <p className="text-gray-500">No pinned products yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Click Pin Product to add products here</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Save Button */}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}