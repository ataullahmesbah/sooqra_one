// File: components/Dashboard/Banners/BannerForm.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface BannerButton {
  text: string;
  link: string;
  type: string;
}

interface Banner {
  _id?: string;
  title: string;
  subtitle?: string;
  image: string;
  buttons: BannerButton[];
  isActive: boolean;
  order: number;
  duration: number;
}

interface BannerFormProps {
  onSubmit: (formData: FormData) => void;
  initialData?: Banner | null;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const buttonTypes = [
  { value: 'gray', label: 'Gray', class: 'bg-gray-800 hover:bg-gray-900 text-white' },
  { value: 'primary', label: 'Primary', class: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { value: 'secondary', label: 'Secondary', class: 'bg-gray-600 hover:bg-gray-700 text-white' },
  { value: 'outline', label: 'Outline', class: 'border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white' }
];

export default function BannerForm({ 
  onSubmit, 
  initialData, 
  onCancel, 
  isSubmitting = false 
}: BannerFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);
  const [duration, setDuration] = useState(5);
  const [buttons, setButtons] = useState<BannerButton[]>([]);
  const [newButton, setNewButton] = useState<BannerButton>({
    text: '',
    link: '',
    type: 'gray'
  });

  const resetForm = useCallback(() => {
    setTitle('');
    setSubtitle('');
    setImageFile(null);
    setImagePreview('');
    setIsActive(true);
    setOrder(0);
    setDuration(5);
    setButtons([]);
    setNewButton({ text: '', link: '', type: 'gray' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSubtitle(initialData.subtitle || '');
      setImagePreview(initialData.image);
      setIsActive(initialData.isActive);
      setOrder(initialData.order);
      setDuration(initialData.duration || 5);
      setButtons(initialData.buttons || []);
    } else {
      resetForm();
    }
  }, [initialData, resetForm]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
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

  const addButton = () => {
    if (newButton.text.trim() && newButton.link.trim()) {
      setButtons([...buttons, { ...newButton }]);
      setNewButton({ text: '', link: '', type: 'gray' });
    } else {
      alert('Please fill in both button text and link');
    }
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (!initialData && !imageFile) {
      alert('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    
    if (subtitle.trim()) {
      formData.append('subtitle', subtitle.trim());
    }
    
    formData.append('isActive', isActive.toString());
    formData.append('order', order.toString());
    formData.append('duration', duration.toString());
    
    // Add buttons only if they exist
    if (buttons.length > 0) {
      formData.append('buttons', JSON.stringify(buttons));
    } else {
      // Optional: Add default button if none provided
      formData.append('buttons', JSON.stringify([{ 
        text: 'Shop Now', 
        link: '/shop', 
        type: 'gray' 
      }]));
    }
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    onSubmit(formData);
    
    if (!initialData) {
      resetForm();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
          placeholder="Enter banner title"
          disabled={isSubmitting}
        />
      </div>

      {/* Subtitle Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subtitle (Optional)
        </label>
        <textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows={2}
          placeholder="Enter banner subtitle (optional)"
          disabled={isSubmitting}
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Image {!initialData && '*'}
        </label>
        
        {imagePreview && (
          <div className="mb-4 relative">
            <div className="relative h-48 w-full rounded-lg overflow-hidden border border-gray-300">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview('');
                  setImageFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                disabled={isSubmitting}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          disabled={isSubmitting}
        />
        
        <button
          type="button"
          onClick={triggerFileInput}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          <Upload size={18} />
          {imagePreview ? 'Change Image' : 'Upload Image'}
        </button>
        
        <p className="text-xs text-gray-500 mt-2">
          Recommended: 1920×600px • Max: 5MB
        </p>
      </div>

      {/* Duration Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slide Duration (seconds) *
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="3"
            max="10"
            step="1"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            disabled={isSubmitting}
          />
          <span className="text-lg font-semibold text-gray-700 w-12">
            {duration}s
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Auto-slide duration between banners
        </p>
      </div>

      {/* Buttons Section - Optional */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Buttons (Optional)
          </label>
          <span className="text-xs text-gray-500">
            {buttons.length} button{buttons.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="space-y-3">
          {buttons.map((button, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3 flex-1">
                <span className={`px-3 py-1.5 text-sm rounded-md font-medium ${buttonTypes.find(t => t.value === button.type)?.class}`}>
                  {button.text}
                </span>
                <span className="text-gray-500">→</span>
                <span className="text-blue-600 text-sm truncate">{button.link}</span>
              </div>
              <button
                type="button"
                onClick={() => removeButton(index)}
                className="ml-2 text-red-500 hover:text-red-700"
                disabled={isSubmitting}
              >
                <X size={16} />
              </button>
            </div>
          ))}
          
          {/* Add New Button Form */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-3">Add New Button</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                placeholder="Button Text"
                value={newButton.text}
                onChange={(e) => setNewButton({ ...newButton, text: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                disabled={isSubmitting}
              />
              <input
                type="text"
                placeholder="Link (e.g., /shop)"
                value={newButton.link}
                onChange={(e) => setNewButton({ ...newButton, link: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                disabled={isSubmitting}
              />
              <select
                value={newButton.type}
                onChange={(e) => setNewButton({ ...newButton, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                disabled={isSubmitting}
              >
                {buttonTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} Button
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={addButton}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors text-sm font-medium"
              disabled={isSubmitting}
            >
              + Add Button
            </button>
          </div>
        </div>
      </div>

      {/* Status and Order */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Active Status</span>
              <p className="text-xs text-gray-500">Show this banner on website</p>
            </div>
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Order
          </label>
          <input
            type="number"
            min="0"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            initialData ? 'Update Banner' : 'Create Banner'
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}