'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image';

// Types
interface BannerFeature {
    icon: string;
    text: string;
}

interface ShopBanner {
    _id: string;
    title: string;
    subtitle: string;
    highlights: string[];
    cta: string;
    bg: string;
    textColor: string;
    badgeColor: string;
    features: BannerFeature[];
    image: string;
    link: string;
}

interface BannerFormData {
    title: string;
    subtitle: string;
    highlights: string[];
    cta: string;
    bg: string;
    textColor: string;
    badgeColor: string;
    features: BannerFeature[];
    image: File | null;
    link: string;
}

interface ApiResponse<T = any> {
    success: boolean;
    data: T extends any[] ? T : T | null;
    error?: string;
    message?: string;
}

const ShopBanner = () => {
    const [banners, setBanners] = useState<ShopBanner[]>([]);
    const [formData, setFormData] = useState<BannerFormData>({
        title: '',
        subtitle: '',
        highlights: [''],
        cta: '',
        bg: 'bg-gradient-to-br from-gray-900 via-purple-900/70 to-gray-900',
        textColor: 'text-white',
        badgeColor: 'from-purple-600 to-indigo-600',
        features: [{ icon: '', text: '' }],
        image: null,
        link: '',
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await fetch('/api/products/shop-banner');
            const data: ApiResponse<ShopBanner[]> = await response.json();
            if (data.success) {
                setBanners(data.data || []);
            } else {
                setError(data.error || 'Failed to fetch banners');
            }
        } catch (err) {
            setError('Network error while fetching banners');
        }
    };

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement>,
        index?: number,
        type?: 'highlight' | 'feature'
    ) => {
        const { name, value } = e.target;

        if (type === 'highlight' && index !== undefined) {
            const newHighlights = [...formData.highlights];
            newHighlights[index] = value;
            setFormData({ ...formData, highlights: newHighlights });
        } else if (type === 'feature' && index !== undefined) {
            const newFeatures = [...formData.features];
            newFeatures[index] = { ...newFeatures[index], [name]: value };
            setFormData({ ...formData, features: newFeatures });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const addHighlight = () => {
        setFormData({ ...formData, highlights: [...formData.highlights, ''] });
    };

    const removeHighlight = (index: number) => {
        const newHighlights = formData.highlights.filter((_, i) => i !== index);
        setFormData({ ...formData, highlights: newHighlights });
    };

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, { icon: '', text: '' }] });
    };

    const removeFeature = (index: number) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setError('No file selected');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }
        setFormData({ ...formData, image: file });
        setImagePreview(URL.createObjectURL(file));
        setError(null);
    };

    const isFormValid = (): boolean => {
        return Boolean(
            formData.title?.trim() &&
            formData.subtitle?.trim() &&
            formData.highlights.length > 0 &&
            formData.highlights.every((h: string) => h.trim()) &&
            formData.cta?.trim() &&
            formData.bg?.trim() &&
            formData.textColor?.trim() &&
            formData.badgeColor?.trim() &&
            formData.features.length > 0 &&
            formData.features.every((f: BannerFeature) => f.icon?.trim() && f.text?.trim()) &&
            formData.link?.trim() &&
            (editingId ? true : formData.image)
        );
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setUploading(true);

        if (!isFormValid()) {
            setError('Please fill all required fields, including the image for new banners');
            setUploading(false);
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('subtitle', formData.subtitle);
        formDataToSend.append('highlights', JSON.stringify(formData.highlights));
        formDataToSend.append('cta', formData.cta);
        formDataToSend.append('bg', formData.bg);
        formDataToSend.append('textColor', formData.textColor);
        formDataToSend.append('badgeColor', formData.badgeColor);
        formDataToSend.append('features', JSON.stringify(formData.features));
        formDataToSend.append('link', formData.link);

        if (formData.image) {
            formDataToSend.append('image', formData.image);
        }

        if (editingId) {
            formDataToSend.append('id', editingId);
        }

        try {
            const url = '/api/products/shop-banner';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formDataToSend,
            });

            const data: ApiResponse<ShopBanner> = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save banner');
            }

            await fetchBanners();
            resetForm();
            setSuccess(editingId ? 'Banner updated successfully!' : 'Banner added successfully!');
            setUploading(false);
        } catch (err) {
            setError(`Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setUploading(false);
        }
    };

    const handleEdit = (banner: ShopBanner) => {
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle,
            highlights: banner.highlights || [''],
            cta: banner.cta,
            bg: banner.bg,
            textColor: banner.textColor,
            badgeColor: banner.badgeColor,
            features: banner.features || [{ icon: '', text: '' }],
            image: null,
            link: banner.link,
        });
        setImagePreview(banner.image);
        setEditingId(banner._id);
        setError(null);
        setSuccess(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            const response = await fetch('/api/products/shop-banner', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            const data: ApiResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete banner');
            }

            await fetchBanners();
            setSuccess('Banner deleted successfully!');
        } catch (err) {
            setError(`Delete failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            subtitle: '',
            highlights: [''],
            cta: '',
            bg: 'bg-gradient-to-br from-gray-900 via-purple-900/70 to-gray-900',
            textColor: 'text-white',
            badgeColor: 'from-purple-600 to-indigo-600',
            features: [{ icon: '', text: '' }],
            image: null,
            link: '',
        });
        setEditingId(null);
        setImagePreview(null);
        setError(null);
        setSuccess(null);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Form Section */}
                <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className="p-6 bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                        <h1 className="text-3xl font-bold">Shop Banner Management</h1>
                        <p className="mt-2 text-gray-300">Create and manage hero banners for your shop</p>
                    </div>

                    <div className="p-6">
                        {(error || success) && (
                            <div className={`mb-6 p-4 rounded-lg border-l-4 ${error ? 'bg-red-900/50 border-red-500 text-red-200' :
                                    'bg-green-900/50 border-green-500 text-green-200'
                                }`}>
                                <p>{error || success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange(e)}
                                            placeholder="e.g., Elite Member Exclusive"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Subtitle *</label>
                                        <input
                                            type="text"
                                            name="subtitle"
                                            value={formData.subtitle}
                                            onChange={(e) => handleInputChange(e)}
                                            placeholder="e.g., Enjoy special privileges with Team Mesbah membership"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Highlights *</label>
                                        <div className="space-y-2">
                                            {formData.highlights.map((highlight, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={highlight}
                                                        onChange={(e) => handleInputChange(e, index, 'highlight')}
                                                        placeholder={`Highlight ${index + 1}`}
                                                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
                                                        required
                                                    />
                                                    {formData.highlights.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeHighlight(index)}
                                                            className="p-2 text-red-400 hover:text-red-300"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addHighlight}
                                                className="mt-2 px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 text-sm"
                                            >
                                                + Add Highlight
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">CTA Button Text *</label>
                                        <input
                                            type="text"
                                            name="cta"
                                            value={formData.cta}
                                            onChange={(e) => handleInputChange(e)}
                                            placeholder="e.g., Join Now"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Link *</label>
                                        <input
                                            type="text"
                                            name="link"
                                            value={formData.link}
                                            onChange={(e) => handleInputChange(e)}
                                            placeholder="e.g., /membership"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Background Gradient *</label>
                                        <input
                                            type="text"
                                            name="bg"
                                            value={formData.bg}
                                            onChange={(e) => handleInputChange(e)}
                                            placeholder="e.g., bg-gradient-to-br from-gray-900 via-purple-900/70 to-gray-900"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Text Color *</label>
                                        <input
                                            type="text"
                                            name="textColor"
                                            value={formData.textColor}
                                            onChange={(e) => handleInputChange(e)}
                                            placeholder="e.g., text-white"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Badge Gradient *</label>
                                        <input
                                            type="text"
                                            name="badgeColor"
                                            value={formData.badgeColor}
                                            onChange={(e) => handleInputChange(e)}
                                            placeholder="e.g., from-purple-600 to-indigo-600"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Features *</label>
                                        <div className="space-y-2">
                                            {formData.features.map((feature, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        name="icon"
                                                        value={feature.icon}
                                                        onChange={(e) => handleInputChange(e, index, 'feature')}
                                                        placeholder="Icon (e.g., 🚚)"
                                                        className="w-1/4 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
                                                        required
                                                    />
                                                    <input
                                                        type="text"
                                                        name="text"
                                                        value={feature.text}
                                                        onChange={(e) => handleInputChange(e, index, 'feature')}
                                                        placeholder="Text (e.g., Free Delivery)"
                                                        className="w-3/4 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
                                                        required
                                                    />
                                                    {formData.features.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFeature(index)}
                                                            className="p-2 text-red-400 hover:text-red-300"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addFeature}
                                                className="mt-2 px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 text-sm"
                                            >
                                                + Add Feature
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            {editingId ? 'Update Image' : 'Image *'}
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="block w-full text-sm text-gray-400
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-lg file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-purple-900 file:text-purple-200
                                                        file:hover:bg-purple-800"
                                                    disabled={uploading}
                                                />
                                                <p className="mt-1 text-xs text-red-400">
                                                    Recommended: WebP, 1920×700px, max 5MB
                                                </p>
                                            </div>
                                            {imagePreview && (
                                                <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-600">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={uploading || !isFormValid()}
                                    className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${uploading || !isFormValid()
                                            ? 'bg-gray-600 cursor-not-allowed'
                                            : 'bg-purple-600 hover:bg-purple-700'
                                        }`}
                                >
                                    {uploading && (
                                        <svg
                                            className="animate-spin h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    )}
                                    {uploading
                                        ? editingId
                                            ? 'Updating...'
                                            : 'Creating...'
                                        : editingId
                                            ? 'Update Banner'
                                            : 'Create Banner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Existing Banners Section */}
                <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 bg-gray-700 border-b border-gray-600">
                        <h2 className="text-xl font-semibold text-gray-100">Existing Banners</h2>
                    </div>
                    {banners.length === 0 ? (
                        <div className="p-6 text-center text-gray-400">
                            No banners found. Create your first banner above.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-700">
                            {banners.map((banner) => (
                                <div key={banner._id} className="p-6 hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-start gap-6">
                                        <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden border border-gray-600">
                                            <img
                                                src={banner.image}
                                                alt={banner.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-medium text-gray-100 truncate">{banner.title}</h3>
                                            <p className="mt-1 text-sm text-gray-400 truncate">{banner.subtitle}</p>
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {banner.highlights?.map((highlight, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-1 text-xs font-medium bg-purple-900/50 text-purple-200 rounded-full"
                                                    >
                                                        {highlight}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 flex gap-2">
                                            <button
                                                onClick={() => handleEdit(banner)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner._id)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopBanner;