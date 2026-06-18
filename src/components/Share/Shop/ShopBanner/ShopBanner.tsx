'use client';
// src/components/share/shop/shopbanner.tsx

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ShopBanner {
    _id: string;
    image: string;
    title?: string;
    subtitle?: string;
    offer?: string;
    ctaText?: string;
    ctaLink?: string;
    textPosition?: 'left' | 'center';
    isActive: boolean;
}

interface FormState {
    title: string;
    subtitle: string;
    offer: string;
    ctaText: string;
    ctaLink: string;
    textPosition: 'left' | 'center';
    isActive: boolean;
    image: File | null;
}

const EMPTY_FORM: FormState = {
    title: '',
    subtitle: '',
    offer: '',
    ctaText: '',
    ctaLink: '/shop',
    textPosition: 'left',
    isActive: true,
    image: null,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ShopBannerPage() {
    const [banners, setBanners] = useState<ShopBanner[]>([]);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => { fetchBanners(); }, []);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── API ───────────────────────────────────────────────────────────────────

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/products/shop-banner');
            const data = await res.json();
            if (data.success) setBanners(data.data || []);
        } catch { showToast('Failed to fetch banners', 'error'); }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingId && !form.image) {
            showToast('Please select an image', 'error');
            return;
        }

        setUploading(true);
        try {
            const fd = new FormData();
            if (editingId) fd.append('id', editingId);

            // Always send text fields (even empty — PUT handles clearing)
            fd.append('title', form.title);
            fd.append('subtitle', form.subtitle);
            fd.append('offer', form.offer);
            fd.append('ctaText', form.ctaText);
            fd.append('ctaLink', form.ctaLink || '/shop');
            fd.append('textPosition', form.textPosition);
            fd.append('isActive', String(form.isActive));
            if (form.image) fd.append('image', form.image);

            const res = await fetch('/api/products/shop-banner', {
                method: editingId ? 'PUT' : 'POST',
                body: fd,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');

            showToast(editingId ? 'Banner updated!' : 'Banner created!');
            await fetchBanners();
            resetForm();
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Save failed', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this banner?')) return;
        try {
            const res = await fetch('/api/products/shop-banner', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showToast('Banner deleted!');
            await fetchBanners();
            if (editingId === id) resetForm();
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
        }
    };

    const handleEdit = (banner: ShopBanner) => {
        setForm({
            title: banner.title || '',
            subtitle: banner.subtitle || '',
            offer: banner.offer || '',
            ctaText: banner.ctaText || '',
            ctaLink: banner.ctaLink || '/shop',
            textPosition: banner.textPosition || 'left',
            isActive: banner.isActive,
            image: null,
        });
        setImagePreview(banner.image);
        setEditingId(banner._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setImagePreview(null);
    };

    // ── Image handler ─────────────────────────────────────────────────────────

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return; }
        if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return; }
        setForm(f => ({ ...f, image: file }));
        setImagePreview(URL.createObjectURL(file));
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.msg}
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-8">

                {/* ── Form ── */}
                <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-6 py-5 bg-gradient-to-r from-gray-700 to-gray-800 border-b border-gray-700">
                        <h1 className="text-xl font-bold text-white">
                            {editingId ? '✏️ Edit Banner' : '➕ Create New Banner'}
                        </h1>
                        <p className="text-gray-400 text-sm mt-0.5">
                            All text fields are optional — image only is fine.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Image upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Banner Image <span className="text-red-400">{editingId ? '' : '*'}</span>
                                <span className="ml-2 font-normal text-gray-500 text-xs">Recommended: WebP · 1920×600px · max 5MB</span>
                            </label>

                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 hover:border-gray-400 rounded-xl py-6 px-4 cursor-pointer transition-colors bg-gray-700/30 hover:bg-gray-700/50">
                                    <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span className="text-sm text-gray-400">{form.image ? form.image.name : 'Click to upload image'}</span>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                                </label>

                                {imagePreview && (
                                    <div className="relative w-full sm:w-48 aspect-[1920/600] rounded-xl overflow-hidden border border-gray-600 shrink-0">
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized={imagePreview.startsWith('blob:')} />
                                        <button
                                            type="button"
                                            onClick={() => { setImagePreview(null); setForm(f => ({ ...f, image: null })); }}
                                            className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-0.5 hover:bg-red-600"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Text fields grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                label="Title" placeholder="e.g., এক্সক্লুসিভ অফার"
                                value={form.title}
                                onChange={v => setForm(f => ({ ...f, title: v }))}
                            />
                            <Field
                                label="Offer Badge" placeholder="e.g., ৳500 ছাড় · Free Delivery"
                                value={form.offer}
                                onChange={v => setForm(f => ({ ...f, offer: v }))}
                            />
                            <Field
                                label="Subtitle" placeholder="e.g., সেরা মানের অর্গানিক পণ্য..."
                                value={form.subtitle}
                                onChange={v => setForm(f => ({ ...f, subtitle: v }))}
                                className="sm:col-span-2"
                            />
                            <Field
                                label="Button Text (CTA)" placeholder="e.g., Shop Now / এখনই কিনুন"
                                value={form.ctaText}
                                onChange={v => setForm(f => ({ ...f, ctaText: v }))}
                            />
                            <Field
                                label="Button Link" placeholder="e.g., /shop or /products/slug"
                                value={form.ctaLink}
                                onChange={v => setForm(f => ({ ...f, ctaLink: v }))}
                            />
                        </div>

                        {/* Text position + Active */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-300 mb-2">Text Position</p>
                                <div className="flex gap-2">
                                    {(['left', 'center'] as const).map(pos => (
                                        <button
                                            key={pos}
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, textPosition: pos }))}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${form.textPosition === pos
                                                ? 'bg-purple-600 border-purple-600 text-white'
                                                : 'border-gray-600 text-gray-400 hover:border-gray-400'
                                                }`}
                                        >
                                            {pos === 'left' ? '⬅ Left' : '↔ Center'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 ml-auto">
                                <span className="text-sm text-gray-400">Active</span>
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-green-600' : 'bg-gray-600'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2 border-t border-gray-700">
                            {editingId && (
                                <button type="button" onClick={resetForm}
                                    className="px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 text-sm font-medium">
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={uploading || (!editingId && !form.image)}
                                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${uploading || (!editingId && !form.image)
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-purple-500/30'
                                    }`}
                            >
                                {uploading && (
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {uploading ? (editingId ? 'Updating…' : 'Creating…') : (editingId ? 'Update Banner' : 'Create Banner')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Banner list ── */}
                <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-100">All Banners ({banners.length})</h2>
                    </div>

                    {banners.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">No banners yet. Create your first one above.</div>
                    ) : (
                        <div className="divide-y divide-gray-700">
                            {banners.map(banner => (
                                <div key={banner._id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start hover:bg-gray-700/30 transition-colors">
                                    {/* Thumbnail */}
                                    <div className="relative w-full sm:w-40 aspect-[1920/600] rounded-xl overflow-hidden border border-gray-600 shrink-0">
                                        <Image src={banner.image} alt={banner.title || 'Banner'} fill className="object-cover" />
                                        {/* Active badge */}
                                        <div className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${banner.isActive ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-gray-200'}`}>
                                            {banner.isActive ? 'Active' : 'Hidden'}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-100 truncate">{banner.title || <span className="text-gray-500 font-normal italic">No title</span>}</p>
                                        {banner.offer && (
                                            <span className="inline-block mt-1 bg-red-900/50 text-red-300 text-xs px-2 py-0.5 rounded-full">
                                                🔥 {banner.offer}
                                            </span>
                                        )}
                                        {banner.subtitle && (
                                            <p className="text-gray-400 text-sm mt-1 line-clamp-1">{banner.subtitle}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                                            {banner.ctaText && <span>🔘 {banner.ctaText}</span>}
                                            {banner.ctaLink && <span>🔗 {banner.ctaLink}</span>}
                                            <span>↔ {banner.textPosition || 'left'}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => handleEdit(banner)}
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(banner._id)}
                                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Reusable field ────────────────────────────────────────────────────────────

function Field({
    label, placeholder, value, onChange, className = '',
}: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    className?: string;
}) {
    return (
        <div className={className}>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                {label} <span className="font-normal normal-case text-gray-600">— optional</span>
            </label>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
        </div>
    );
}