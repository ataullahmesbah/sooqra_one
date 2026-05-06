// src/components/admin/PromotionalBannerAdmin.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Save, X, Eye, EyeOff } from 'lucide-react';

interface PromotionalData {
    isActive: boolean;
    text: string;
    emoji: string;
    backgroundColor: string;
    textColor: string;
}

const PromotionalBannerAdmin: React.FC = () => {
    const [promoData, setPromoData] = useState<PromotionalData>({
        isActive: false,
        text: '',
        emoji: '🎉',
        backgroundColor: '#f59e0b',
        textColor: '#ffffff'
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetchPromoData();
    }, []);

    const fetchPromoData = async () => {
        try {
            const response = await fetch('/api/promotional');
            const result = await response.json();
            if (result.success && result.data) {
                setPromoData(result.data);
            }
        } catch (error) {
            console.error('Error fetching promo data:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/promotional', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(promoData),
            });

            const result = await response.json();
            if (result.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Error saving promo data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Preview colors
    const colorPresets = {
        orange: { bg: '#f59e0b', text: '#ffffff' },
        green: { bg: '#10b981', text: '#ffffff' },
        blue: { bg: '#3b82f6', text: '#ffffff' },
        red: { bg: '#ef4444', text: '#ffffff' },
        purple: { bg: '#8b5cf6', text: '#ffffff' },
        pink: { bg: '#ec4899', text: '#ffffff' },
        dark: { bg: '#1f2937', text: '#ffffff' },
        black: { bg: '#000000', text: '#ffffff' },
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Promotional Banner Settings</h2>

                {/* Live Preview Badge */}
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${promoData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {promoData.isActive ? (
                        <span className="flex items-center gap-1">
                            <Eye size={14} /> Live
                        </span>
                    ) : (
                        <span className="flex items-center gap-1">
                            <EyeOff size={14} /> Inactive
                        </span>
                    )}
                </div>
            </div>

            {/* Status Toggle */}
            <div className="mb-6">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                    <div>
                        <span className="font-medium text-gray-700">Enable Banner</span>
                        <p className="text-sm text-gray-500">Show promotional banner on website</p>
                    </div>
                    <button
                        onClick={() => setPromoData({ ...promoData, isActive: !promoData.isActive })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${promoData.isActive ? 'bg-green-600' : 'bg-gray-300'}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${promoData.isActive ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </button>
                </label>
            </div>

            {/* Emoji Input */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emoji / Icon
                </label>
                <input
                    type="text"
                    value={promoData.emoji}
                    onChange={(e) => setPromoData({ ...promoData, emoji: e.target.value })}
                    placeholder="🎉"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-2xl"
                    maxLength={4}
                />
                <p className="text-xs text-gray-500 mt-1">Enter any emoji (e.g., 🎉, 🔥, ⚡, 💰)</p>
            </div>

            {/* Text Input */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promotional Text
                </label>
                <textarea
                    value={promoData.text}
                    onChange={(e) => setPromoData({ ...promoData, text: e.target.value })}
                    placeholder="Special Offer! Get 20% off on all products"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
            </div>

            {/* Color Presets */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Presets
                </label>
                <div className="flex gap-2 mb-3">
                    {Object.entries(colorPresets).map(([name, colors]) => (
                        <button
                            key={name}
                            onClick={() => setPromoData({
                                ...promoData,
                                backgroundColor: colors.bg,
                                textColor: colors.text
                            })}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: colors.bg }}
                            title={name}
                        />
                    ))}
                </div>
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={promoData.backgroundColor}
                            onChange={(e) => setPromoData({ ...promoData, backgroundColor: e.target.value })}
                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={promoData.backgroundColor}
                            onChange={(e) => setPromoData({ ...promoData, backgroundColor: e.target.value })}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="#f59e0b"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Color
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={promoData.textColor}
                            onChange={(e) => setPromoData({ ...promoData, textColor: e.target.value })}
                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={promoData.textColor}
                            onChange={(e) => setPromoData({ ...promoData, textColor: e.target.value })}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="#ffffff"
                        />
                    </div>
                </div>
            </div>

            {/* Live Preview */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Live Preview
                </label>
                <div
                    className="rounded-lg overflow-hidden"
                    style={{
                        backgroundColor: promoData.backgroundColor,
                        color: promoData.textColor
                    }}
                >
                    <div className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-xl">{promoData.emoji || '🎉'}</span>
                            <span className="text-sm font-medium">
                                {promoData.text || 'Your promotional text here'}
                            </span>
                            <span className="text-xl">{promoData.emoji || '🎉'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving...
                    </>
                ) : saved ? (
                    <>
                        <Save size={18} />
                        Saved Successfully!
                    </>
                ) : (
                    <>
                        <Save size={18} />
                        Save Changes
                    </>
                )}
            </button>
        </div>
    );
};

export default PromotionalBannerAdmin;