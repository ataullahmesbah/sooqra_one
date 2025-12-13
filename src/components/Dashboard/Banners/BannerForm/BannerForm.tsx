// File: components/Dashboard/Banners/BannerForm.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, X, Move } from 'lucide-react';

interface BannerButton {
  text: string;
  link: string;
  type: string;
}

interface Banner {
  _id?: string;
  title?: string;
  subtitle?: string;
  image: string;
  buttons: BannerButton[];
  buttonPosition?: string;
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
  {
    value: 'gray',
    label: 'Gray Gradient',
    class: 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg hover:shadow-xl'
  },
  {
    value: 'primary',
    label: 'Blue Primary',
    class: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg hover:shadow-xl'
  },
  {
    value: 'secondary',
    label: 'Dark Gray',
    class: 'bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-lg hover:shadow-xl'
  },
  {
    value: 'outline',
    label: 'Glass Outline',
    class: 'bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20'
  },
  {
    value: 'success',
    label: 'Green Success',
    class: 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg hover:shadow-xl'
  },
  {
    value: 'warning',
    label: 'Orange Warning',
    class: 'bg-gradient-to-r from-orange-600 to-orange-800 text-white shadow-lg hover:shadow-xl'
  }
];

const buttonPositions = [
  { value: 'left-top', label: 'Top Left', grid: 'justify-start items-start' },
  { value: 'left-center', label: 'Left Center', grid: 'justify-start items-center' },
  { value: 'left-bottom', label: 'Bottom Left', grid: 'justify-start items-end' },
  { value: 'center-top', label: 'Top Center', grid: 'justify-center items-start' },
  { value: 'center-center', label: 'Center', grid: 'justify-center items-center' },
  { value: 'center-bottom', label: 'Bottom Center', grid: 'justify-center items-end' },
  { value: 'right-top', label: 'Top Right', grid: 'justify-end items-start' },
  { value: 'right-center', label: 'Right Center', grid: 'justify-end items-center' },
  { value: 'right-bottom', label: 'Bottom Right', grid: 'justify-end items-end' }
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
  const [buttons, setButtons] = useState<BannerButton[]>([
    { text: 'Shop Now', link: '/shop', type: 'gray' },
    { text: 'Learn More', link: '/about', type: 'outline' }
  ]);
  const [buttonPosition, setButtonPosition] = useState('center-bottom');
  const [newButton, setNewButton] = useState<BannerButton>({
    text: '',
    link: '',
    type: 'gray'
  });

  // Helper function for position classes in preview
  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'left-top': return 'justify-start items-start pt-4 pl-4';
      case 'left-center': return 'justify-start items-center pl-4';
      case 'left-bottom': return 'justify-start items-end pb-4 pl-4';
      case 'center-top': return 'justify-center items-start pt-4';
      case 'center-center': return 'justify-center items-center';
      case 'center-bottom': return 'justify-center items-end pb-4';
      case 'right-top': return 'justify-end items-start pt-4 pr-4';
      case 'right-center': return 'justify-end items-center pr-4';
      case 'right-bottom': return 'justify-end items-end pb-4 pr-4';
      default: return 'justify-center items-end pb-4';
    }
  };

  const resetForm = useCallback(() => {
    setTitle('');
    setSubtitle('');
    setImageFile(null);
    setImagePreview('');
    setIsActive(true);
    setOrder(0);
    setDuration(5);
    setButtons([
      { text: 'Shop Now', link: '/shop', type: 'gray' },
      { text: 'Learn More', link: '/about', type: 'outline' }
    ]);
    setButtonPosition('center-bottom');
    setNewButton({ text: '', link: '', type: 'gray' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSubtitle(initialData.subtitle || '');
      setImagePreview(initialData.image);
      setIsActive(initialData.isActive);
      setOrder(initialData.order);
      setDuration(initialData.duration || 5);
      setButtons(initialData.buttons || []);
      setButtonPosition(initialData.buttonPosition || 'center-bottom');
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

    if (!imageFile && !imagePreview) {
      alert('Please select an image');
      return;
    }

    const formData = new FormData();

    // Title is optional - only add if exists
    if (title.trim()) {
      formData.append('title', title.trim());
    }

    // Subtitle is optional - only add if exists
    if (subtitle.trim()) {
      formData.append('subtitle', subtitle.trim());
    }

    formData.append('isActive', isActive.toString());
    formData.append('order', order.toString());
    formData.append('duration', duration.toString());
    formData.append('buttonPosition', buttonPosition);

    // Add buttons only if they exist
    if (buttons.length > 0) {
      formData.append('buttons', JSON.stringify(buttons));
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

  // Quick button examples
  const quickButtons = [
    { text: 'Shop Now', type: 'gray' },
    { text: 'Learn More', type: 'outline' },
    { text: 'Get Started', type: 'primary' },
    { text: 'View All', type: 'secondary' },
    { text: 'Buy Now', type: 'success' },
    { text: 'Limited Offer', type: 'warning' },
    { text: 'Explore', type: 'gray' },
    { text: 'Contact Us', type: 'outline' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Field - Optional */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Enter banner title (optional)"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty if you don't want a title
        </p>
      </div>

      {/* Subtitle Field - Optional */}
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
        <p className="text-xs text-gray-500 mt-1">
          Leave empty if you don't want a subtitle
        </p>
      </div>

      {/* Image Upload - Required */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Image *
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
          required={!imagePreview}
        />

        <button
          type="button"
          onClick={triggerFileInput}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          <Upload size={18} />
          {imagePreview ? 'Change Image' : 'Upload Image *'}
        </button>

        <p className="text-xs text-gray-500 mt-2">
          Required: 1920×600px • Max: 5MB
        </p>
      </div>

      {/* Button Position Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Button Position
        </label>

        {/* Position Preview */}
        <div className="mb-4">
          <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-300 mb-3">
            {/* Preview Content */}
            <div className={`absolute inset-0 flex ${getPositionClasses(buttonPosition)}`}>
              <div className="flex flex-wrap gap-2">
                <div className="w-24 h-10 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg flex items-center justify-center shadow">
                  <span className="text-white text-xs font-medium">Button</span>
                </div>
                <div className="w-20 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow">
                  <span className="text-white text-xs font-medium">Shop</span>
                </div>
              </div>
            </div>

            {/* Grid Lines */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300/50"></div>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300/50"></div>

            {/* Position Labels */}
            <div className="absolute top-2 left-2 text-xs text-gray-500">Top Left</div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">Top Center</div>
            <div className="absolute top-2 right-2 text-xs text-gray-500">Top Right</div>
            <div className="absolute top-1/2 left-2 transform -translate-y-1/2 text-xs text-gray-500">Middle Left</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-gray-500">Center</div>
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 text-xs text-gray-500">Middle Right</div>
            <div className="absolute bottom-2 left-2 text-xs text-gray-500">Bottom Left</div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">Bottom Center</div>
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">Bottom Right</div>
          </div>
        </div>

        {/* Position Buttons Grid */}
        <div className="grid grid-cols-3 gap-2">
          {buttonPositions.map((pos) => (
            <button
              key={pos.value}
              type="button"
              onClick={() => setButtonPosition(pos.value)}
              className={`p-3 border rounded-lg flex flex-col items-center gap-1 transition-all ${buttonPosition === pos.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              disabled={isSubmitting}
            >
              <Move size={16} />
              <span className="text-xs">{pos.label}</span>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Selected: {buttonPositions.find(p => p.value === buttonPosition)?.label}
        </p>
      </div>

      {/* Quick Button Examples */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Button Examples
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {quickButtons.map((btn, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => {
                setButtons([...buttons, {
                  text: btn.text,
                  link: '/shop',
                  type: btn.type
                }]);
              }}
              className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${btn.type === 'gray' ? 'bg-gray-800 text-white hover:bg-gray-900' :
                  btn.type === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                    btn.type === 'outline' ? 'border border-gray-600 text-gray-700 hover:bg-gray-100' :
                      btn.type === 'secondary' ? 'bg-gray-600 text-white hover:bg-gray-700' :
                        btn.type === 'success' ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                          'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              disabled={isSubmitting}
            >
              {btn.text}
            </button>
          ))}
        </div>
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
                <span className={`px-3 py-1.5 text-sm rounded-md font-medium ${buttonTypes.find(t => t.value === button.type)?.class
                  }`}>
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
            <h4 className="font-medium text-gray-700 mb-3">Add Custom Button</h4>
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
              className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
              disabled={isSubmitting}
            >
              + Add Button
            </button>
          </div>
        </div>
      </div>

      {/* Duration Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slide Duration (seconds)
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
          className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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