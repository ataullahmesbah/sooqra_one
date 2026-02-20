// src/app/admin/nav-ads/page.tsx or wherever your component is
'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';

// Type definitions
interface NavAd {
    _id: string;
    shopName: string;
    adText: string;
    couponCode?: string;
    buttonText: string;
    buttonLink?: string;
    backgroundColor: string;
    textColor: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    impressions?: number;
    clicks?: number;
}

interface NavAdFormData {
    shopName: string;
    adText: string;
    couponCode: string;
    buttonText: string;
    buttonLink: string;
    backgroundColor: string;
    textColor: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

interface ApiResponse {
    success: boolean;
    data?: NavAd[];
    error?: string;
}

export default function NavAdsAdmin() {
    const [navAds, setNavAds] = useState<NavAd[]>([]);
    const [formData, setFormData] = useState<NavAdFormData>({
        shopName: 'SOOQRA ONE',
        adText: '',
        couponCode: '',
        buttonText: 'Shop Now',
        buttonLink: '',
        backgroundColor: 'bg-gradient-to-r from-purple-900 to-indigo-900',
        textColor: 'text-white',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchNavAds();
    }, []);

    const fetchNavAds = async (): Promise<void> => {
        try {
            const res = await fetch('/api/products/nav-ads/admin');
            const responseData: ApiResponse = await res.json();
            setNavAds(responseData.data || []);
        } catch (error) {
            // Silent fail - no console
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/products/nav-ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result: ApiResponse = await res.json();

            if (result.success) {
                alert('Nav ad created successfully!');
                setFormData({
                    shopName: 'SOOQRA ONE',
                    adText: '',
                    couponCode: '',
                    buttonText: 'Shop Now',
                    buttonLink: '',
                    backgroundColor: 'bg-gradient-to-r from-purple-900 to-indigo-900',
                    textColor: 'text-white',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    isActive: true
                });
                fetchNavAds();
            } else {
                alert(result.error || 'Failed to create nav ad');
            }
        } catch {
            alert('Error creating nav ad');
        } finally {
            setLoading(false);
        }
    };

    const deleteNavAd = async (id: string): Promise<void> => {
        if (!id) {
            alert('Invalid ad ID');
            return;
        }

        if (confirm('Are you sure you want to delete this nav ad?')) {
            setDeleteLoading(id);

            try {
                const res = await fetch(`/api/products/nav-ads/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!res.ok) {
                    alert('Failed to delete nav ad');
                    return;
                }

                const result = await res.json();

                if (result.success) {
                    alert('Nav ad deleted successfully!');
                    fetchNavAds();
                } else {
                    alert(result.error || 'Failed to delete nav ad');
                }
            } catch {
                alert('Error deleting nav ad');
            } finally {
                setDeleteLoading(null);
            }
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setFormData(prev => ({
            ...prev,
            isActive: e.target.checked
        }));
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Nav Ads Management</h1>

                {/* Create Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8"
                >
                    <h2 className="text-xl font-semibold mb-4">Create New Nav Ad</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="shopName" className="block text-sm font-medium text-gray-300 mb-2">
                                    Shop Name *
                                </label>
                                <input
                                    type="text"
                                    id="shopName"
                                    name="shopName"
                                    value={formData.shopName}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="adText" className="block text-sm font-medium text-gray-300 mb-2">
                                    Ad Text * (Max 100 chars)
                                </label>
                                <input
                                    type="text"
                                    id="adText"
                                    name="adText"
                                    maxLength={100}
                                    value={formData.adText}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                                    placeholder="Special offer! Get 50% off on all products..."
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="couponCode" className="block text-sm font-medium text-gray-300 mb-2">
                                    Coupon Code (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="couponCode"
                                    name="couponCode"
                                    maxLength={20}
                                    value={formData.couponCode}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                                    placeholder="SUMMER50"
                                />
                            </div>

                            <div>
                                <label htmlFor="buttonText" className="block text-sm font-medium text-gray-300 mb-2">
                                    Button Text
                                </label>
                                <input
                                    type="text"
                                    id="buttonText"
                                    name="buttonText"
                                    value={formData.buttonText}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="buttonLink" className="block text-sm font-medium text-gray-300 mb-2">
                                    Button Link (Optional)
                                </label>
                                <input
                                    type="url"
                                    id="buttonLink"
                                    name="buttonLink"
                                    value={formData.buttonLink}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                                    placeholder="https://example.com/shop"
                                />
                            </div>

                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleCheckboxChange}
                                className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-300">
                                Active Advertisement
                            </label>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            type="submit"
                            disabled={loading}
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Nav Ad'}
                        </motion.button>
                    </form>
                </motion.div>

                {/* Nav Ads List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-md rounded-lg p-6"
                >
                    <h2 className="text-xl font-semibold mb-4">Nav Ads List</h2>

                    {navAds.length > 0 ? (
                        <div className="space-y-4">
                            {navAds.map((ad) => (
                                <motion.div
                                    key={ad._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border border-gray-600 rounded-lg p-4"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{ad.shopName}</h3>
                                            <p className="text-gray-300 mt-1">{ad.adText}</p>
                                            {ad.couponCode && (
                                                <p className="text-yellow-400 mt-1">Coupon: {ad.couponCode}</p>
                                            )}
                                            <div className="flex space-x-4 text-sm text-gray-400 mt-2">
                                                <span>Impressions: {ad.impressions || 0}</span>
                                                <span>Clicks: {ad.clicks || 0}</span>
                                                <span>Status: {ad.isActive ? 'Active' : 'Inactive'}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => deleteNavAd(ad._id)}
                                            disabled={deleteLoading === ad._id}
                                            className={`px-3 py-1 rounded text-sm transition-colors ${deleteLoading === ad._id
                                                    ? 'bg-gray-500 cursor-not-allowed'
                                                    : 'bg-red-500 hover:bg-red-600'
                                                } text-white`}
                                        >
                                            {deleteLoading === ad._id ? 'Deleting...' : 'Delete'}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400">No nav ads created yet.</p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}