// File: app/(dashboard)/admin-dashboard/home/banners/page.tsx - FULL UPDATED VERSION
'use client';
import { useState, useEffect } from 'react';
import BannerForm from '../BannerForm/BannerForm';
import { toast, Toaster } from 'react-hot-toast';
import BannerList from '../BannerList/BannerList ';

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
}

export default function BannersAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed the local state variables as they should be in BannerForm

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/admin/banners');
      const result = await response.json();

      if (result.success) {
        setBanners(result.data);
      } else {
        setError(result.error || 'Failed to load banners');
        toast.error(result.error || 'Failed to load banners');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch('/api/admin/banners', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        await fetchBanners();
        toast.success('Banner created successfully!');
      } else {
        setError(result.error || 'Failed to create banner');
        toast.error(result.error || 'Failed to create banner');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, formData: FormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      console.log('🔄 Updating banner with ID:', id);

      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      console.log('📦 Update response:', result);

      if (result.success) {
        await fetchBanners();
        setEditingBanner(null);
        toast.success('Banner updated successfully!');
      } else {
        const errorMsg = result.error || 'Failed to update banner';
        setError(errorMsg);
        toast.error(errorMsg);
        console.error('❌ Update error details:', result);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('💥 Update exception:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        await fetchBanners();
        toast.success('Banner deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete banner');
      }
    } catch (error: any) {
      toast.error(error.message || 'Network error');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const formData = new FormData();
      formData.append('isActive', (!currentStatus).toString());

      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        await fetchBanners();
        toast.success(`Banner ${!currentStatus ? 'activated' : 'deactivated'}!`);
      } else {
        toast.error(result.error || 'Failed to toggle status');
      }
    } catch (error) {
      toast.error('Failed to toggle banner status');
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    // Scroll to form
    document.getElementById('banner-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading banners...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Toaster position="top-right" />

      {/* Updated Header with better width */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            Banner Management Dashboard
          </h1>
          <p className="text-gray-600 text-lg md:text-xl">
            Create and manage your website banners with full control
          </p>
        </div>
      </div>

      {/* Main Content with max width */}
      <div className="max-w-7xl mx-auto">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left: Form Section */}
          <div id="banner-form">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-1">
                    {editingBanner ? '✏️ Edit Banner' : '➕ Create New Banner'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {editingBanner
                      ? 'Update your banner settings'
                      : 'Add a new banner to your website'
                    }
                  </p>
                </div>
                {editingBanner && (
                  <button
                    onClick={() => {
                      setEditingBanner(null);
                      toast.success('Edit cancelled');
                    }}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <BannerForm
                onSubmit={editingBanner ?
                  (data) => handleUpdate(editingBanner._id, data) :
                  handleCreate
                }
                initialData={editingBanner}
                onCancel={() => setEditingBanner(null)}
                isSubmitting={isSubmitting}
              />
            </div>

            {/* Stats - Improved Design */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-6">Dashboard Overview</h3>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Banners</p>
                      <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">{banners.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">{banners.length}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Active Banners</p>
                      <p className="text-2xl md:text-3xl font-bold text-green-800 mt-1">
                        {banners.filter(b => b.isActive).length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">
                        {banners.filter(b => b.isActive).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Banner List Section */}
          <div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              {/* Header with Search - Improved */}
              <div className="p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-1">All Banners</h2>
                    <p className="text-gray-500 text-sm">
                      Manage and organize your banners
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search banners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-72 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                    />
                    <svg
                      className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Banner List */}
              <div className="max-h-[600px] overflow-y-auto">
                <BannerList
                  banners={filteredBanners}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              </div>
            </div>

            {/* Help Text - Improved Design */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <span className="text-lg">💡</span> Quick Tips
              </h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span><strong>Title & Subtitle are optional</strong> - Leave empty if not needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span><strong>Button position</strong> - Choose from 9 positions for buttons</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span><strong>Gray buttons</strong> - Gradient design with hover effects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span><strong>Clean design</strong> - Light overlay for better text visibility</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
