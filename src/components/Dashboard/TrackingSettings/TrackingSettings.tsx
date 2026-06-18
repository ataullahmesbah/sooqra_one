// src/components/Dashboard/TrackingSettings/TrackingSettings.tsx
'use client';

import { useState, useEffect } from 'react';

interface TrackingConfig {
    pixelEnabled: boolean;
    capiEnabled: boolean;
    gtmEnabled: boolean;
    updatedAt?: string;
}

interface ToggleItem {
    key: keyof Omit<TrackingConfig, 'updatedAt'>;
    label: string;
    description: string;
    warning?: string;
    icon: React.ReactNode;
    color: string;
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const MetaIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" />
    </svg>
);
const ServerIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="2" y="2" width="20" height="8" rx="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" strokeLinecap="round" strokeWidth={3} />
        <line x1="6" y1="18" x2="6.01" y2="18" strokeLinecap="round" strokeWidth={3} />
    </svg>
);
const TagIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round" strokeWidth={3} />
    </svg>
);

// ── Toggle Switch ──────────────────────────────────────────────────────────────
function Toggle({
    checked,
    onChange,
    loading,
    color = 'bg-green-500',
}: {
    checked: boolean;
    onChange: (val: boolean) => void;
    loading: boolean;
    color?: string;
}) {
    return (
        <button
            onClick={() => !loading && onChange(!checked)}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 disabled:opacity-60 ${checked ? color : 'bg-gray-200'
                }`}
            role="switch"
            aria-checked={checked}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );
}

// ── Status badge ───────────────────────────────────────────────────────────────
function StatusBadge({ enabled }: { enabled: boolean }) {
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${enabled
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
            {enabled ? 'Active' : 'Disabled'}
        </span>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function TrackingSettings() {
    const [config, setConfig] = useState<TrackingConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null); // which key is saving
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // ── Fetch current settings ────────────────────────────────────────────────
    useEffect(() => {
        fetch('/api/admin/tracking-settings')
            .then(r => r.json())
            .then(data => { setConfig(data); setLoading(false); })
            .catch(() => { setLoading(false); showToast('Failed to load settings', 'error'); });
    }, []);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Toggle a setting ──────────────────────────────────────────────────────
    const handleToggle = async (key: keyof Omit<TrackingConfig, 'updatedAt'>, value: boolean) => {
        if (!config) return;
        setSaving(key);

        // Optimistic update
        setConfig(prev => prev ? { ...prev, [key]: value } : prev);

        try {
            const res = await fetch('/api/admin/tracking-settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: value }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');

            setConfig(data);
            showToast(
                `${key === 'pixelEnabled' ? 'Meta Pixel' : key === 'capiEnabled' ? 'Meta CAPI' : 'GTM'} ${value ? 'enabled' : 'disabled'} successfully`,
                'success'
            );
        } catch {
            // Revert optimistic
            setConfig(prev => prev ? { ...prev, [key]: !value } : prev);
            showToast('Failed to update setting. Please try again.', 'error');
        } finally {
            setSaving(null);
        }
    };

    // ── Tracking items config ─────────────────────────────────────────────────
    const items: ToggleItem[] = [
        {
            key: 'pixelEnabled',
            label: 'Meta Pixel',
            description: 'Browser-side Facebook tracking. Tracks PageView, AddToCart, Purchase events directly from the user\'s browser.',
            warning: 'Turning off Pixel stops browser tracking only. CAPI (server-side) continues unless also disabled.',
            icon: <MetaIcon />,
            color: 'bg-blue-500',
        },
        {
            key: 'capiEnabled',
            label: 'Meta Conversions API',
            description: 'Server-side Facebook tracking. More reliable — bypasses ad blockers. Sends hashed user data directly from your server.',
            warning: 'This is the most important tracker for Purchase events. Disabling affects Meta ad attribution.',
            icon: <ServerIcon />,
            color: 'bg-indigo-500',
        },
        {
            key: 'gtmEnabled',
            label: 'Google Tag Manager',
            description: 'GTM container that loads Google Analytics 4 and Microsoft Clarity. Turning this off disables GA4 and Clarity simultaneously.',
            icon: <TagIcon />,
            color: 'bg-orange-500',
        },
    ];

    // ── Summary counts ────────────────────────────────────────────────────────
    const activeCount = config
        ? [config.pixelEnabled, config.capiEnabled, config.gtmEnabled].filter(Boolean).length
        : 0;

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">

                {/* ── Page Header ──────────────────────────────────────────── */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Tracking Settings</h1>
                    </div>
                    <p className="text-sm text-gray-500 ml-11">
                        Control analytics and tracking integrations. Changes take effect immediately.
                    </p>
                </div>

                {/* ── Summary card ─────────────────────────────────────────── */}
                {!loading && config && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${activeCount === 3 ? 'bg-green-50' : activeCount === 0 ? 'bg-red-50' : 'bg-yellow-50'
                                }`}>
                                <span className="text-lg">
                                    {activeCount === 3 ? '✅' : activeCount === 0 ? '🚫' : '⚠️'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">
                                    {activeCount} of 3 trackers active
                                </p>
                                <p className="text-xs text-gray-400">
                                    {config.updatedAt
                                        ? `Last updated ${new Date(config.updatedAt).toLocaleString()}`
                                        : 'No changes yet'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            {[config.pixelEnabled, config.capiEnabled, config.gtmEnabled].map((on, i) => (
                                <div
                                    key={i}
                                    className={`w-2.5 h-2.5 rounded-full ${on ? 'bg-green-400' : 'bg-gray-200'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Loading skeleton ─────────────────────────────────────── */}
                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-32 bg-gray-100 rounded" />
                                            <div className="h-3 w-48 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                    <div className="w-11 h-6 bg-gray-100 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Tracker cards ────────────────────────────────────────── */}
                {!loading && config && (
                    <div className="space-y-3">
                        {items.map(item => {
                            const isEnabled = config[item.key];
                            const isSaving = saving === item.key;

                            return (
                                <div
                                    key={item.key}
                                    className={`bg-white rounded-xl border transition-all duration-200 ${isEnabled ? 'border-gray-200' : 'border-gray-100'
                                        }`}
                                >
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            {/* Left */}
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isEnabled ? `text-white ${item.color}` : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    {item.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-sm font-semibold text-gray-900">
                                                            {item.label}
                                                        </h3>
                                                        <StatusBadge enabled={isEnabled} />
                                                        {isSaving && (
                                                            <svg className="animate-spin h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Toggle */}
                                            <div className="flex-shrink-0 mt-0.5">
                                                <Toggle
                                                    checked={isEnabled}
                                                    onChange={val => handleToggle(item.key, val)}
                                                    loading={isSaving}
                                                    color={item.color}
                                                />
                                            </div>
                                        </div>

                                        {/* Warning — shown when disabling important trackers */}
                                        {!isEnabled && item.warning && (
                                            <div className="mt-3 ml-13 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                                <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-xs text-amber-700">{item.warning}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── GTM info note ────────────────────────────────────────── */}
                {!loading && config && (
                    <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <div className="flex gap-2.5">
                            <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-xs font-semibold text-blue-700 mb-0.5">GTM Controls GA4 + Microsoft Clarity</p>
                                <p className="text-xs text-blue-600">
                                    Since GA4 and Microsoft Clarity are configured inside your GTM container,
                                    toggling GTM off disables all three simultaneously. You do not need separate toggles.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Env check ────────────────────────────────────────────── */}
                {!loading && (
                    <div className="mt-4 bg-white border border-gray-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-600 mb-3">Environment Variables Status</p>
                        <div className="space-y-2">
                            {[
                                { label: 'NEXT_PUBLIC_FB_PIXEL_ID', key: 'FB_PIXEL_ID' },
                                { label: 'FB_ACCESS_TOKEN (CAPI)', key: 'FB_CAPI' },
                                { label: 'NEXT_PUBLIC_GTM_ID', key: 'GTM_ID' },
                            ].map(env => (
                                <div key={env.key} className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 font-mono">{env.label}</span>
                                    <span className="text-xs text-green-600 font-medium">✓ Set in .env</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Toast notification ───────────────────────────────────────── */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-bottom-2 ${toast.type === 'success'
                    ? 'bg-white border-green-200 text-gray-800'
                    : 'bg-white border-red-200 text-gray-800'
                    }`}>
                    <span className="text-base">{toast.type === 'success' ? '✅' : '❌'}</span>
                    {toast.msg}
                    <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 ml-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}