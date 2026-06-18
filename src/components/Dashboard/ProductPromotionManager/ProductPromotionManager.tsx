'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';

interface HeroData {
    _id?: string;
    image: {
        url: string;
        publicId: string;
        alt: string;
    };
    link: {
        url: string;
        isActive: boolean;
    };
    isActive: boolean;
}

export default function ProductPromotionManager() {
    const [hero, setHero] = useState<HeroData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [imageAlt, setImageAlt] = useState('Hero Banner - Sooqra One');
    const [linkUrl, setLinkUrl] = useState('');
    const [linkActive, setLinkActive] = useState(false);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        fetchHeroSection();
    }, []);

    const fetchHeroSection = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/product-promotionSection');
            const data = await response.json();

            if (data.success && data.data) {
                setHero(data.data);
                setImageAlt(data.data.image.alt);
                setLinkUrl(data.data.link?.url || '');
                setLinkActive(data.data.link?.isActive || false);
                setIsActive(data.data.isActive);
                setImagePreview(data.data.image.url);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load hero section');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imagePreview && !imageFile) {
            toast.error('Please select an image');
            return;
        }

        setSaving(true);

        try {
            const formData = new FormData();

            if (imageFile) {
                formData.append('image', imageFile);
            }
            if (hero?.image.url && !imageFile) {
                formData.append('existingImageUrl', hero.image.url);
                formData.append('existingPublicId', hero.image.publicId);
            }
            formData.append('imageAlt', imageAlt);
            formData.append('linkUrl', linkUrl);
            formData.append('linkActive', String(linkActive));
            formData.append('isActive', String(isActive));

            const response = await fetch('/api/admin/product-promotionSection', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Hero section saved successfully!');
                fetchHeroSection();
                setImageFile(null);
            } else {
                toast.error(data.error || 'Failed to save');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to save hero section');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete the hero section? This action cannot be undone.')) {
            return;
        }

        setSaving(true);

        try {
            const response = await fetch('/api/admin/product-promotionSection', {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Hero section deleted successfully!');
                setHero(null);
                setImagePreview('');
                setImageAlt('Hero Banner - Sooqra One');
                setLinkUrl('');
                setLinkActive(false);
                setIsActive(true);
            } else {
                toast.error(data.error || 'Failed to delete');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete hero section');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" />

            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Hero Section Manager</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hero Image <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                                <div className="space-y-1 text-center">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="mx-auto h-48 w-auto object-contain rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview('');
                                                    setImageFile(null);
                                                }}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-gray-600 hover:text-gray-500 focus-within:outline-none">
                                                    <span>Upload an image</span>
                                                    <input
                                                        type="file"
                                                        className="sr-only"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, GIF up to 5MB. Recommended size: 1920x600px
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Image Alt Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image Alt Text
                            </label>
                            <input
                                type="text"
                                value={imageAlt}
                                onChange={(e) => setImageAlt(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                placeholder="Hero Banner - Sooqra One"
                            />
                            <p className="text-xs text-gray-500 mt-1">For SEO and accessibility</p>
                        </div>

                        {/* Link URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Link URL (Optional)
                            </label>
                            <input
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                placeholder="https://sooqraone.com/shop"
                            />
                            <p className="text-xs text-gray-500 mt-1">Example: /shop, /products, https://example.com</p>
                        </div>

                        {/* Link Active Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Make Image Clickable
                                </label>
                                <p className="text-xs text-gray-500">Enable to make the hero image clickable</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setLinkActive(!linkActive)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${linkActive ? 'bg-gray-800' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${linkActive ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Show Hero Section
                                </label>
                                <p className="text-xs text-gray-500">Enable to display on homepage</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsActive(!isActive)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-gray-800' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Hero Section'}
                            </button>

                            {hero && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={saving}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Preview Section */}
                    {/* Preview Section — aspect-ratio দিয়ে */}
                    {imagePreview && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                            {/* ✅ aspect-ratio maintain করে preview */}
                            <div className="relative w-full aspect-[1920/600] overflow-hidden rounded-lg border border-gray-200">
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    className="object-contain"
                                    sizes="100vw"
                                    unoptimized={imagePreview.startsWith('data:')} // blob preview-এর জন্য
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Recommended: 1920×600px or wider image with same ratio
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}