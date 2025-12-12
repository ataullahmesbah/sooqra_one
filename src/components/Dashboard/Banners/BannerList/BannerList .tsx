// File: components/Dashboard/Banners/BannerList.tsx
interface BannerButton {
    text: string;
    link: string;
    type: string;
}

interface Banner {
    _id: string;
    title: string;
    subtitle?: string;
    image: string;
    buttons: BannerButton[];
    isActive: boolean;
    order: number;
    duration: number;
    createdAt?: string;
}

interface BannerListProps {
    banners: Banner[];
    onEdit: (banner: Banner) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export default function BannerList({ banners, onEdit, onDelete, onToggleStatus }: BannerListProps) {
    if (banners.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Banners Found</h3>
                <p className="text-gray-500">Try a different search or create a new banner</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
            {banners.map((banner) => (
                <div key={banner._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                            <div className="relative w-20 h-14 rounded overflow-hidden border border-gray-200">
                                <img
                                    src={banner.image}
                                    alt={banner.title}
                                    className="w-full h-full object-cover"
                                />
                                {!banner.isActive && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-xs text-white font-semibold">INACTIVE</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Banner Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                        {banner.title}
                                    </h3>
                                    {banner.subtitle && (
                                        <p className="text-sm text-gray-500 truncate mt-1">
                                            {banner.subtitle}
                                        </p>
                                    )}

                                    <div className="flex items-center space-x-2 mt-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            Order: {banner.order}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            {banner.duration}s
                                        </span>
                                        {banner.buttons.length > 0 && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                {banner.buttons.length} btn
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Status Toggle */}
                                <button
                                    onClick={() => onToggleStatus(banner._id, banner.isActive)}
                                    className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${banner.isActive
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        }`}
                                >
                                    {banner.isActive ? 'Active' : 'Inactive'}
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => onEdit(banner)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Edit"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>

                            <button
                                onClick={() => onDelete(banner._id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}