'use client';

import { NavigationItem } from '@/src/types/navigation';
import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSave, FiX } from 'react-icons/fi';


export default function NavigationAdminPage() {
    const [navigation, setNavigation] = useState<NavigationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        slug: '#',
        type: 'link' as 'link' | 'dropdown',
        order: 0,
        parentId: '',
        isActive: true
    });

    // Fetch navigation
    const fetchNavigation = async () => {
        try {
            const response = await fetch('/api/navigation/admin');
            const data = await response.json();

            if (data.success) {
                setNavigation(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch navigation:', error);
            alert('Failed to load navigation data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNavigation();
    }, []);

    // Handle form input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'order' ? parseInt(value) || 0 : value
            }));
        }
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingId
                ? `/api/navigation?id=${editingId}`
                : '/api/navigation';

            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                alert(editingId ? 'Item updated successfully!' : 'Item added successfully!');
                await fetchNavigation();
                resetForm();
            } else {
                alert(data.error || 'Failed to save item');
            }
        } catch (error) {
            console.error('Failed to save navigation item:', error);
            alert('Failed to save item. Please try again.');
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item? All children will also be deleted.')) return;

        try {
            const response = await fetch(`/api/navigation?id=${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                alert('Item deleted successfully!');
                await fetchNavigation();
            } else {
                alert(data.error || 'Failed to delete item');
            }
        } catch (error) {
            console.error('Failed to delete navigation item:', error);
            alert('Failed to delete item. Please try again.');
        }
    };

    // Edit item
    const handleEdit = (item: NavigationItem) => {
        setEditingId(item._id);
        setFormData({
            title: item.title,
            slug: item.slug,
            type: item.type,
            order: item.order,
            parentId: item.parentId || '',
            isActive: item.isActive
        });
        setShowForm(true);
    };

    // Reset form
    const resetForm = () => {
        setEditingId(null);
        setShowForm(false);
        setFormData({
            title: '',
            slug: '#',
            type: 'link',
            order: 0,
            parentId: '',
            isActive: true
        });
    };

    // Get parent items for dropdown (only top-level items)
    const parentItems = navigation.filter(item => !item.parentId);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Navigation Management</h1>
                        <p className="text-gray-600 mt-1">Manage your website navigation menu</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                        <FiPlus className="w-4 h-4" />
                        Add New Item
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingId ? 'Edit Navigation Item' : 'Add New Navigation Item'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        required
                                        maxLength={30}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Max 30 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Slug (URL)
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        placeholder="/example"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Use # for dropdown parents</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type *
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    >
                                        <option value="link">Link (Single Item)</option>
                                        <option value="dropdown">Dropdown (Has Children)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Parent Item
                                    </label>
                                    <select
                                        name="parentId"
                                        value={formData.parentId}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    >
                                        <option value="">None (Top Level)</option>
                                        {parentItems.map(item => (
                                            <option key={item._id} value={item._id}>
                                                {item.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        min="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                                </div>

                                <div className="flex items-center h-[42px]">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-gray-900 rounded focus:ring-gray-500"
                                        />
                                        <span className="text-sm text-gray-700">Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-md transition-colors"
                                >
                                    <FiSave className="w-4 h-4" />
                                    {editingId ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Navigation List */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Navigation Items ({navigation.length})
                        </h2>
                    </div>

                    {navigation.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>No navigation items found.</p>
                            <p className="mt-2">Click "Add New Item" to create your first menu item.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {navigation
                                .filter(item => !item.parentId)
                                .sort((a, b) => a.order - b.order)
                                .map(item => (
                                    <div key={item._id}>
                                        {/* Parent Item */}
                                        <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">
                                                        {item.title}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                                                        {item.slug}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded ${item.isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {item.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                                        {item.type}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Order: {item.order}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Children Items */}
                                        {item.children && item.children.length > 0 && (
                                            <div className="pl-12 pr-4 pb-4 bg-gray-50 space-y-2">
                                                {item.children
                                                    .sort((a, b) => a.order - b.order)
                                                    .map(child => (
                                                        <div key={child._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-700">↳ {child.title}</span>
                                                                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                                                                    {child.slug}
                                                                </span>
                                                                <span className={`text-xs px-2 py-1 rounded ${child.isActive
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                    {child.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleEdit(child)}
                                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <FiEdit className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(child._id)}
                                                                    className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <FiTrash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="mt-8 p-6 bg-gray-100 rounded-xl border border-gray-300">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        How to use this system:
                    </h3>
                    <ul className="space-y-2 text-gray-700 list-disc pl-5">
                        <li>Add <strong>Top Level Items</strong> for main navigation</li>
                        <li>Add <strong>Child Items</strong> by selecting a parent for dropdown menus</li>
                        <li>Use <code>#</code> as slug for dropdown parent items</li>
                        <li>Set <strong>Order</strong> to control display sequence (lower numbers first)</li>
                        <li>Mark items as <strong>Inactive</strong> to temporarily hide them</li>
                        <li>Deleting a parent item will also delete all its children</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}