'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

// Interface definitions
interface Category {
    _id: string;
    name: string;
}

interface AdditionalImage {
    url: string;
    alt: string;
}

interface Size {
    name: string;
    quantity: number;
}

interface FAQ {
    question: string;
    answer: string;
}

interface Specification {
    name: string;
    value: string;
}

interface AggregateRating {
    ratingValue: string;
    reviewCount: string;
}

interface FormData {
    title: string;
    bdtPrice: string;
    usdPrice: string;
    eurPrice: string;
    usdExchangeRate: string;
    eurExchangeRate: string;
    description: string;
    shortDescription: string;
    descriptions: string[];
    bulletPoints: string;
    productType: 'Own' | 'Affiliate';
    affiliateLink: string;
    category: string;
    newCategory: string;
    mainImage: File | null;
    mainImageAlt: string;
    existingMainImage: string;
    additionalImages: (File | null)[];
    additionalAlts: string[];
    existingAdditionalImages: AdditionalImage[];
    quantity: string;
    product_code: string;
    brand: string;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    faqs: FAQ[];
    specifications: Specification[];
    sizeRequirement: 'Optional' | 'Mandatory';
    sizes: Size[];
    aggregateRating: AggregateRating;
    isGlobal: boolean;
    targetCountry: string;
    targetCity: string;
}

interface ImagePreviews {
    mainImage: string | null;
    additionalImages: (string | null)[];
}

interface Errors {
    [key: string]: string;
}

export default function UpdateProduct() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    
    // ✅ useParams থেকে productId নিন
    const productId = params?.id as string;

    console.log('Product ID from useParams:', productId);

    // Early return যদি productId না থাকে
    if (!productId) {
        console.error('No product ID found in params');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-lg">Product ID not found. Please check the URL.</div>
            </div>
        );
    }

    const [formData, setFormData] = useState<FormData>({
        title: '',
        bdtPrice: '',
        usdPrice: '',
        eurPrice: '',
        usdExchangeRate: '',
        eurExchangeRate: '',
        description: '',
        shortDescription: '',
        descriptions: [''],
        bulletPoints: '',
        productType: 'Own',
        affiliateLink: '',
        category: '',
        newCategory: '',
        mainImage: null,
        mainImageAlt: '',
        existingMainImage: '',
        additionalImages: [],
        additionalAlts: [],
        existingAdditionalImages: [],
        quantity: '',
        product_code: '',
        brand: '',
        availability: 'InStock',
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        faqs: [],
        specifications: [],
        sizeRequirement: 'Optional',
        sizes: [],
        aggregateRating: { ratingValue: '', reviewCount: '' },
        isGlobal: false,
        targetCountry: 'Bangladesh',
        targetCity: 'Dhaka',
    });

    const [errors, setErrors] = useState<Errors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreviews, setImagePreviews] = useState<ImagePreviews>({
        mainImage: null,
        additionalImages: []
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const additionalImageInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Fetch product and categories
    useEffect(() => {
        const fetchData = async () => {
            if (!productId) return;

            setIsLoading(true);
            try {
                console.log('Fetching product data for ID:', productId);

                // Product fetch
                const productRes = await fetch(`/api/products/${productId}`);
                if (!productRes.ok) {
                    const errorText = await productRes.text();
                    console.error('Product fetch error:', errorText);
                    throw new Error('Failed to fetch product');
                }

                const product = await productRes.json();
                console.log('Fetched product:', product);

                // Categories fetch
                const categoriesRes = await fetch('/api/products?type=categories');
                if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
                const categoriesData = await categoriesRes.json();

                // Extract prices
                const bdtPriceObj = product.prices?.find((p: any) => p.currency === 'BDT');
                const usdPriceObj = product.prices?.find((p: any) => p.currency === 'USD');
                const eurPriceObj = product.prices?.find((p: any) => p.currency === 'EUR');

                // Set form data
                setFormData({
                    title: product.title || '',
                    bdtPrice: bdtPriceObj?.amount?.toString() || '',
                    usdPrice: usdPriceObj?.amount?.toString() || '',
                    eurPrice: eurPriceObj?.amount?.toString() || '',
                    usdExchangeRate: usdPriceObj?.exchangeRate?.toString() || '',
                    eurExchangeRate: eurPriceObj?.exchangeRate?.toString() || '',
                    description: product.description || '',
                    shortDescription: product.shortDescription || '',
                    product_code: product.product_code || '',
                    descriptions: product.descriptions && product.descriptions.length > 0 
                        ? product.descriptions 
                        : [''],
                    bulletPoints: product.bulletPoints?.join(', ') || '',
                    productType: product.productType || 'Own',
                    affiliateLink: product.affiliateLink || '',
                    category: product.category?._id || '',
                    newCategory: '',
                    mainImage: null,
                    mainImageAlt: product.mainImageAlt || '',
                    existingMainImage: product.mainImage || '',
                    additionalImages: [],
                    additionalAlts: [],
                    existingAdditionalImages: product.additionalImages || [],
                    quantity: product.quantity?.toString() || '',
                    brand: product.brand || '',
                    availability: product.availability || 'InStock',
                    metaTitle: product.metaTitle || '',
                    metaDescription: product.metaDescription || '',
                    keywords: product.keywords?.join(', ') || '',
                    faqs: product.faqs || [],
                    specifications: product.specifications || [],
                    sizeRequirement: product.sizeRequirement || 'Optional',
                    sizes: product.sizes || [],
                    aggregateRating: {
                        ratingValue: product.aggregateRating?.ratingValue?.toString() || '',
                        reviewCount: product.aggregateRating?.reviewCount?.toString() || '',
                    },
                    isGlobal: product.isGlobal || false,
                    targetCountry: product.targetCountry || 'Bangladesh',
                    targetCity: product.targetCity || 'Dhaka',
                });

                // Set image previews
                setImagePreviews({
                    mainImage: product.mainImage || null,
                    additionalImages: product.additionalImages?.map(() => null) || [],
                });

                setCategories(categoriesData);
                setErrors({});
            } catch (err: any) {
                console.error('Error in fetchData:', err);
                setErrors({ general: err.message || 'Failed to load product data' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [productId]);

    // Image cleanup
    useEffect(() => {
        return () => {
            if (imagePreviews.mainImage && imagePreviews.mainImage.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreviews.mainImage);
            }
            imagePreviews.additionalImages.forEach((url) => 
                url && url.startsWith('blob:') && URL.revokeObjectURL(url)
            );
        };
    }, [imagePreviews]);

    // Validation function
    const validateForm = (): Errors => {
        const newErrors: Errors = {};
        
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        
        const bdtPriceNum = parseFloat(formData.bdtPrice);
        if (isNaN(bdtPriceNum) || bdtPriceNum <= 0) {
            newErrors.bdtPrice = 'BDT price must be a positive number';
        }
        
        if (formData.usdPrice) {
            const usdPriceNum = parseFloat(formData.usdPrice);
            if (isNaN(usdPriceNum) || usdPriceNum <= 0) {
                newErrors.usdPrice = 'USD price must be a positive number';
            }
        }
        
        if (formData.eurPrice) {
            const eurPriceNum = parseFloat(formData.eurPrice);
            if (isNaN(eurPriceNum) || eurPriceNum <= 0) {
                newErrors.eurPrice = 'EUR price must be a positive number';
            }
        }
        
        if (!formData.description.trim()) newErrors.description = 'Primary description is required';
        if (!formData.product_code.trim()) newErrors.product_code = 'Product Code is required';
        
        if (formData.productType === 'Affiliate' && !formData.affiliateLink.trim()) {
            newErrors.affiliateLink = 'Affiliate link is required';
        } else if (formData.affiliateLink && !/^https?:\/\/.+/.test(formData.affiliateLink)) {
            newErrors.affiliateLink = 'Invalid URL format';
        }
        
        if (!formData.category && !formData.newCategory.trim()) {
            newErrors.category = 'Category or new category name is required';
        }
        
        if (formData.newCategory && !/^[a-zA-Z0-9\s&-]+$/.test(formData.newCategory)) {
            newErrors.newCategory = 'Category name can only contain letters, numbers, spaces, &, or -';
        }
        
        if (!formData.mainImage && !formData.existingMainImage) {
            newErrors.mainImage = 'Main image is required';
        }
        
        if (!formData.mainImageAlt.trim()) newErrors.mainImageAlt = 'Main image ALT text is required';
        
        const quantityNum = parseInt(formData.quantity, 10);
        if (isNaN(quantityNum) || quantityNum < 0) {
            newErrors.quantity = 'Quantity must be a non-negative integer';
        }
        
        if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
        
        if (!formData.metaTitle.trim() || formData.metaTitle.length > 60) {
            newErrors.metaTitle = 'Meta Title is required (max 60 chars)';
        }
        
        if (!formData.metaDescription.trim() || formData.metaDescription.length > 160) {
            newErrors.metaDescription = 'Meta Description is required (max 160 chars)';
        }

        // Size validation
        if (formData.sizeRequirement === 'Mandatory') {
            if (formData.sizes.length === 0) {
                newErrors.sizes = 'At least one size with quantity is required';
            } else {
                formData.sizes.forEach((size, index) => {
                    if (!size.name.trim()) {
                        newErrors[`sizeName${index}`] = 'Size name cannot be empty';
                    }
                    if (size.quantity < 0 || isNaN(size.quantity)) {
                        newErrors[`sizeQuantity${index}`] = 'Size quantity must be a non-negative number';
                    }
                });
                
                const totalSizeQuantity = formData.sizes.reduce((sum, size) => sum + (size.quantity || 0), 0);
                if (totalSizeQuantity !== quantityNum) {
                    newErrors.sizes = 'Sum of size quantities must equal total quantity';
                }
            }
        }
        
        if (!formData.isGlobal) {
            if (!formData.targetCountry.trim()) newErrors.targetCountry = 'Target country is required';
            if (!formData.targetCity.trim()) newErrors.targetCity = 'Target city is required';
        }
        
        return newErrors;
    };

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        if (!session) {
            setErrors({ general: 'You must be logged in' });
            setIsSubmitting(false);
            return;
        }

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const data = new FormData();

            // Basic required fields
            data.append('title', formData.title);
            data.append('bdtPrice', formData.bdtPrice);
            data.append('description', formData.description);
            data.append('product_code', formData.product_code);
            data.append('brand', formData.brand);
            data.append('metaTitle', formData.metaTitle);
            data.append('metaDescription', formData.metaDescription);
            data.append('mainImageAlt', formData.mainImageAlt);
            data.append('quantity', formData.quantity);
            data.append('category', formData.category);
            data.append('productType', formData.productType);
            data.append('availability', formData.availability);
            data.append('sizeRequirement', formData.sizeRequirement);
            data.append('isGlobal', formData.isGlobal.toString());

            // Optional fields
            if (formData.usdPrice) data.append('usdPrice', formData.usdPrice);
            if (formData.eurPrice) data.append('eurPrice', formData.eurPrice);
            if (formData.usdExchangeRate) data.append('usdExchangeRate', formData.usdExchangeRate);
            if (formData.eurExchangeRate) data.append('eurExchangeRate', formData.eurExchangeRate);
            if (formData.affiliateLink) data.append('affiliateLink', formData.affiliateLink);
            if (formData.newCategory) data.append('newCategory', formData.newCategory);
            if (formData.shortDescription) data.append('shortDescription', formData.shortDescription);
            if (formData.targetCountry) data.append('targetCountry', formData.targetCountry);
            if (formData.targetCity) data.append('targetCity', formData.targetCity);
            if (formData.keywords) data.append('keywords', formData.keywords);

            // Main image handling
            if (formData.mainImage) {
                data.append('mainImage', formData.mainImage);
            }
            data.append('existingMainImage', formData.existingMainImage || '');

            // Additional images
            formData.additionalImages.forEach((img, index) => {
                if (img) {
                    data.append('additionalImages', img);
                }
            });

            // Additional ALT texts
            formData.additionalAlts.forEach((alt, index) => {
                data.append('additionalAlts', alt || '');
            });

            // Existing additional images
            if (formData.existingAdditionalImages.length > 0) {
                data.append('existingAdditionalImages', JSON.stringify(formData.existingAdditionalImages));
            }

            // Arrays
            data.append('descriptions', formData.descriptions.filter(desc => desc.trim()).join('|||'));
            data.append('bulletPoints', formData.bulletPoints);

            // JSON data
            if (formData.faqs.length > 0) {
                data.append('faqs', JSON.stringify(formData.faqs));
            }
            if (formData.specifications.length > 0) {
                data.append('specifications', JSON.stringify(formData.specifications));
            }
            if (formData.sizes.length > 0) {
                data.append('sizes', JSON.stringify(formData.sizes));
            }

            // ✅ সঠিকভাবে aggregateRating append করুন
            data.append('aggregateRating.ratingValue', formData.aggregateRating.ratingValue || '0');
            data.append('aggregateRating.reviewCount', formData.aggregateRating.reviewCount || '0');

            // Debug
            console.log('Sending FormData for update...');
            for (let [key, value] of data.entries()) {
                console.log(`${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
            }

            const res = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                body: data,
            });

            const result = await res.json();
            console.log('API Response:', result);

            if (!res.ok) {
                if (result.details) {
                    // Merge validation errors
                    setErrors(result.details);
                }
                throw new Error(result.error || result.details || 'Failed to update product');
            }

            alert('Product updated successfully!');
            router.push('/admin-dashboard/shop/all-products');
            router.refresh(); // Refresh the page data
        } catch (err: any) {
            console.error('Error updating product:', err);
            setErrors(prev => ({ 
                ...prev, 
                general: err.message || 'Failed to update product' 
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper functions (addDescription, removeDescription, etc.)
    const handleDescriptionChange = (index: number, value: string) => {
        const newDescriptions = [...formData.descriptions];
        newDescriptions[index] = value;
        setFormData({ ...formData, descriptions: newDescriptions });
    };

    const addDescription = () => {
        setFormData({ ...formData, descriptions: [...formData.descriptions, ''] });
    };

    const removeDescription = (index: number) => {
        const newDescriptions = formData.descriptions.filter((_, i) => i !== index);
        setFormData({ ...formData, descriptions: newDescriptions.length ? newDescriptions : [''] });
    };

    const handleFaqChange = (index: number, field: keyof FAQ, value: string) => {
        const newFaqs = [...formData.faqs];
        newFaqs[index] = { ...newFaqs[index], [field]: value };
        setFormData({ ...formData, faqs: newFaqs });
    };

    const addFaq = () => {
        setFormData({ ...formData, faqs: [...formData.faqs, { question: '', answer: '' }] });
    };

    const removeFaq = (index: number) => {
        const newFaqs = formData.faqs.filter((_, i) => i !== index);
        setFormData({ ...formData, faqs: newFaqs });
    };

    const handleSpecChange = (index: number, field: keyof Specification, value: string) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
        setFormData({ ...formData, specifications: newSpecs });
    };

    const addSpec = () => {
        setFormData({ ...formData, specifications: [...formData.specifications, { name: '', value: '' }] });
    };

    const removeSpec = (index: number) => {
        const newSpecs = formData.specifications.filter((_, i) => i !== index);
        setFormData({ ...formData, specifications: newSpecs });
    };

    const addImageInput = () => {
        if (formData.additionalImages.length + formData.existingAdditionalImages.length < 5) {
            setFormData({
                ...formData,
                additionalImages: [...formData.additionalImages, null],
                additionalAlts: [...formData.additionalAlts, ''],
            });
            setImagePreviews({
                ...imagePreviews,
                additionalImages: [...imagePreviews.additionalImages, null],
            });
        }
    };

    const removeImageInput = (index: number) => {
        const newImages = formData.additionalImages.filter((_, i) => i !== index);
        const newAlts = formData.additionalAlts.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.additionalImages.filter((_, i) => i !== index);
        setFormData({ ...formData, additionalImages: newImages, additionalAlts: newAlts });
        setImagePreviews({ ...imagePreviews, additionalImages: newPreviews });
        if (additionalImageInputRefs.current[index]) {
            additionalImageInputRefs.current[index]!.value = '';
        }
    };

    const removeExistingImage = (index: number) => {
        const newExistingImages = formData.existingAdditionalImages.filter((_, i) => i !== index);
        setFormData({ ...formData, existingAdditionalImages: newExistingImages });
    };

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrors({ ...errors, mainImage: 'Please upload a valid image file' });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, mainImage: 'Image size must be less than 5MB' });
                return;
            }
            setFormData({ ...formData, mainImage: file });
            setImagePreviews({ ...imagePreviews, mainImage: URL.createObjectURL(file) });
            setErrors({ ...errors, mainImage: '' });
        }
    };

    const handleAdditionalImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrors({ ...errors, [`additionalImage${index}`]: 'Please upload a valid image file' });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, [`additionalImage${index}`]: 'Image size must be less than 5MB' });
                return;
            }
            const newImages = [...formData.additionalImages];
            newImages[index] = file;
            const newPreviews = [...imagePreviews.additionalImages];
            newPreviews[index] = URL.createObjectURL(file);
            setFormData({ ...formData, additionalImages: newImages });
            setImagePreviews({ ...imagePreviews, additionalImages: newPreviews });
            setErrors({ ...errors, [`additionalImage${index}`]: '' });
        }
    };

    const handleAdditionalAltChange = (index: number, value: string) => {
        const newAlts = [...formData.additionalAlts];
        newAlts[index] = value;
        setFormData({ ...formData, additionalAlts: newAlts });
    };

    const handleExistingAltChange = (index: number, value: string) => {
        const newExistingImages = [...formData.existingAdditionalImages];
        newExistingImages[index] = { ...newExistingImages[index], alt: value };
        setFormData({ ...formData, existingAdditionalImages: newExistingImages });
    };

    const handleSizeChange = (index: number, field: keyof Size, value: string) => {
        const newSizes = [...formData.sizes];
        newSizes[index] = {
            ...newSizes[index],
            [field]: field === 'quantity' ? parseInt(value, 10) || 0 : value
        };
        setFormData({ ...formData, sizes: newSizes });
    };

    const addSize = () => {
        setFormData({ ...formData, sizes: [...formData.sizes, { name: '', quantity: 0 }] });
    };

    const removeSize = (index: number) => {
        const newSizes = formData.sizes.filter((_, i) => i !== index);
        setFormData({ ...formData, sizes: newSizes });
    };

    const setAdditionalImageRef = (index: number) => (el: HTMLInputElement | null) => {
        additionalImageInputRefs.current[index] = el;
    };

    // Loading states
    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    if (!session || session.user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-lg">Unauthorized access</div>
            </div>
        );
    }

    // Render the form
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white p-4 md:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="group relative inline-block text-3xl md:text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-wide">
                    Update Product
                    <span className="block h-[3px] w-0 group-hover:w-32 mx-auto mt-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"></span>
                </h1>

                {errors.general && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {typeof errors.general === 'string' ? errors.general : JSON.stringify(errors.general)}
                    </div>
                )}

                <div className="mb-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl border border-gray-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <div className="flex items-center mb-4">
                        <div className="bg-purple-600/20 p-2 rounded-lg mr-3">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Product Owner</h2>
                    </div>
                    <div className="pl-1">
                        <p className="text-sm text-gray-400 mb-1">Logged in as</p>
                        <p className="text-lg font-semibold text-white flex items-center">
                            {session?.user?.name || 'Not available'}
                            <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        </p>
                        {session?.user?.email && (
                            <p className="text-sm text-gray-400 mt-2">{session.user.email}</p>
                        )}
                    </div>
                </div>

            
                    
                    

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Product Title*</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={`w-full p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.title ? 'border-red-500' : 'border-gray-700'}`}
                                placeholder="Enter product title"
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Brand*</label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className={`w-full p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.brand ? 'border-red-500' : 'border-gray-700'}`}
                                placeholder="Enter brand name"
                            />
                            {errors.brand && <p className="mt-1 text-sm text-red-500">{errors.brand}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Availability</label>
                            <select
                                value={formData.availability}
                                onChange={(e) => setFormData({ ...formData, availability: e.target.value as 'InStock' | 'OutOfStock' | 'PreOrder' })}
                                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="InStock">In Stock</option>
                                <option value="OutOfStock">Out of Stock</option>
                                <option value="PreOrder">Pre-Order</option>
                            </select>
                        </div>

                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Quantity*</label>
                                <input
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className={`w-full p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.quantity ? 'border-red-500' : 'border-gray-700'}`}
                                    placeholder="Enter quantity"
                                    min="0"
                                    step="1"
                                />
                                {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
                            </div>

                            <div className="flex-1">
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Product Code*</label>
                                <input
                                    type="text"
                                    value={formData.product_code}
                                    onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                                    className={`w-full p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.product_code ? 'border-red-500' : 'border-gray-700'}`}
                                    placeholder="Enter product code (e.g. ATM12345)"
                                />
                                {errors.product_code && <p className="mt-1 text-sm text-red-500">{errors.product_code}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Category*</label>
                            <select
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        category: e.target.value,
                                        newCategory: e.target.value === 'new' ? formData.newCategory : '',
                                    })
                                }
                                className={`w-full p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.category ? 'border-red-500' : 'border-gray-700'}`}
                            >
                                <option value="" disabled>
                                    Select a category
                                </option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                                <option value="new">Add New Category</option>
                            </select>
                            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                            {formData.category === 'new' && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={formData.newCategory}
                                        onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                                        className={`w-full p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.newCategory ? 'border-red-500' : 'border-gray-700'}`}
                                        placeholder="Enter new category name"
                                    />
                                    {errors.newCategory && <p className="mt-1 text-sm text-red-500">{errors.newCategory}</p>}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">BDT Price*</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">৳</span>
                                    <input
                                        type="number"
                                        value={formData.bdtPrice}
                                        onChange={(e) => setFormData({ ...formData, bdtPrice: e.target.value })}
                                        className={`w-full pl-8 pr-4 py-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.bdtPrice ? 'border-red-500' : 'border-gray-700'}`}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                {errors.bdtPrice && <p className="mt-1 text-sm text-red-500">{errors.bdtPrice}</p>}
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">USD Price</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={formData.usdPrice}
                                        onChange={(e) => setFormData({ ...formData, usdPrice: e.target.value })}
                                        className={`w-full pl-8 pr-4 py-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.usdPrice ? 'border-red-500' : 'border-gray-700'}`}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                {errors.usdPrice && <p className="mt-1 text-sm text-red-500">{errors.usdPrice}</p>}
                                {formData.usdPrice && (
                                    <div className="mt-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Exchange Rate (1 USD = ? BDT)</label>
                                        <input
                                            type="number"
                                            value={formData.usdExchangeRate}
                                            onChange={(e) => setFormData({ ...formData, usdExchangeRate: e.target.value })}
                                            className={`w-full px-3 py-2 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.usdExchangeRate ? 'border-red-500' : 'border-gray-700'}`}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                        />
                                        {errors.usdExchangeRate && <p className="mt-1 text-sm text-red-500">{errors.usdExchangeRate}</p>}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">EUR Price</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">€</span>
                                    <input
                                        type="number"
                                        value={formData.eurPrice}
                                        onChange={(e) => setFormData({ ...formData, eurPrice: e.target.value })}
                                        className={`w-full pl-8 pr-4 py-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.eurPrice ? 'border-red-500' : 'border-gray-700'}`}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                {errors.eurPrice && <p className="mt-1 text-sm text-red-500">{errors.eurPrice}</p>}
                                {formData.eurPrice && (
                                    <div className="mt-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Exchange Rate (1 EUR = ? BDT)</label>
                                        <input
                                            type="number"
                                            value={formData.eurExchangeRate}
                                            onChange={(e) => setFormData({ ...formData, eurExchangeRate: e.target.value })}
                                            className={`w-full px-3 py-2 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.eurExchangeRate ? 'border-red-500' : 'border-gray-700'}`}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                        />
                                        {errors.eurExchangeRate && <p className="mt-1 text-sm text-red-500">{errors.eurExchangeRate}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Primary Description*</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className={`w-full p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.description ? 'border-red-500' : 'border-gray-700'}`}
                                placeholder="Describe your product"
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Short Description (max 160 chars)</label>
                            <textarea
                                value={formData.shortDescription}
                                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                rows={2}
                                maxLength={160}
                                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Short summary for snippets"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Additional Descriptions</label>
                            {formData.descriptions.map((desc, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <textarea
                                        value={desc}
                                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder={`Additional description ${index + 1}`}
                                    />
                                    {formData.descriptions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeDescription(index)}
                                            className="ml-2 text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addDescription}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                            >
                                + Add More Description
                            </button>
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Bullet Points (comma-separated)</label>
                            <textarea
                                value={formData.bulletPoints}
                                onChange={(e) => setFormData({ ...formData, bulletPoints: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Feature 1, Feature 2, Feature 3"
                            />
                            <div className="mt-2">
                                <p className="text-xs text-gray-500">Preview:</p>
                                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                                    {formData.bulletPoints.split(',').filter(Boolean).map((point, i) => (
                                        <div key={i} className="flex items-start mb-1">
                                            <span className="mr-2">•</span>
                                            <span>{point.trim()}</span>
                                        </div>
                                    ))}
                                    {!formData.bulletPoints && <p className="text-gray-500">No bullet points added</p>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Keywords (comma-separated)</label>
                            <input
                                type="text"
                                value={formData.keywords}
                                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="keyword1, keyword2, keyword3"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Meta Title* (max 60 chars)</label>
                            <input
                                type="text"
                                value={formData.metaTitle}
                                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                maxLength={60}
                                className={`w-full p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.metaTitle ? 'border-red-500' : 'border-gray-700'}`}
                                placeholder="Enter meta title"
                            />
                            {errors.metaTitle && <p className="mt-1 text-sm text-red-500">{errors.metaTitle}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Meta Description* (max 160 chars)</label>
                            <textarea
                                value={formData.metaDescription}
                                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                rows={3}
                                maxLength={160}
                                className={`w-full p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.metaDescription ? 'border-red-500' : 'border-gray-700'}`}
                                placeholder="Enter meta description"
                            />
                            {errors.metaDescription && <p className="mt-1 text-sm text-red-500">{errors.metaDescription}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">FAQs</label>
                            {formData.faqs.map((faq, index) => (
                                <div key={index} className="mb-4 border p-4 rounded-lg">
                                    <input
                                        type="text"
                                        value={faq.question}
                                        onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                                        placeholder="Question"
                                    />
                                    <textarea
                                        value={faq.answer}
                                        onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Answer"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFaq(index)}
                                        className="mt-2 text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Remove FAQ
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addFaq}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                            >
                                + Add FAQ
                            </button>
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Specifications</label>
                            {formData.specifications.map((spec, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input
                                        type="text"
                                        value={spec.name}
                                        onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                                        className="w-1/2 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mr-2"
                                        placeholder="Spec Name (e.g. Weight)"
                                    />
                                    <input
                                        type="text"
                                        value={spec.value}
                                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                        className="w-1/2 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Value (e.g. 200g)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSpec(index)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addSpec}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                            >
                                + Add Specification
                            </button>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Size Requirement*</label>
                            <select
                                value={formData.sizeRequirement}
                                onChange={(e) => setFormData({ ...formData, sizeRequirement: e.target.value as 'Optional' | 'Mandatory' })}
                                className={`w-full p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.sizeRequirement ? 'border-red-500' : 'border-gray-700'}`}
                            >
                                <option value="Optional">Optional</option>
                                <option value="Mandatory">Mandatory</option>
                            </select>
                            {errors.sizeRequirement && <p className="mt-1 text-sm text-red-500">{errors.sizeRequirement}</p>}

                            {formData.sizeRequirement === 'Mandatory' && (
                                <div>
                                    <label className="block text-gray-300 mb-2 text-sm font-medium">Sizes* (Total quantity must match sum of size quantities)</label>
                                    {formData.sizes.map((size, index) => (
                                        <div key={index} className="flex items-center mb-2 gap-4">
                                            <input
                                                type="text"
                                                value={size.name}
                                                onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                                                className={`w-1/2 p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors[`sizeName${index}`] ? 'border-red-500' : 'border-gray-700'}`}
                                                placeholder={`Size ${index + 1} (e.g., S, M, 40)`}
                                            />
                                            <input
                                                type="number"
                                                value={size.quantity}
                                                onChange={(e) => handleSizeChange(index, 'quantity', e.target.value)}
                                                className={`w-1/2 p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors[`sizeQuantity${index}`] ? 'border-red-500' : 'border-gray-700'}`}
                                                placeholder="Quantity"
                                                min="0"
                                            />
                                            {formData.sizes.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeSize(index)}
                                                    className="ml-2 text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                            {(errors[`sizeName${index}`] || errors[`sizeQuantity${index}`]) && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors[`sizeName${index}`] || errors[`sizeQuantity${index}`]}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addSize}
                                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                    >
                                        + Add Size
                                    </button>
                                    {errors.sizes && <p className="mt-1 text-sm text-red-500">{errors.sizes}</p>}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Global Product</label>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isGlobal}
                                    onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-300">Enable global targeting</span>
                            </div>
                        </div>

                        {!formData.isGlobal && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-2 text-sm font-medium">Target Country*</label>
                                    <input
                                        type="text"
                                        value={formData.targetCountry}
                                        onChange={(e) => setFormData({ ...formData, targetCountry: e.target.value })}
                                        className={`w-full p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.targetCountry ? 'border-red-500' : 'border-gray-700'}`}
                                        placeholder="Enter target country"
                                    />
                                    {errors.targetCountry && <p className="mt-1 text-sm text-red-500">{errors.targetCountry}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2 text-sm font-medium">Target City*</label>
                                    <input
                                        type="text"
                                        value={formData.targetCity}
                                        onChange={(e) => setFormData({ ...formData, targetCity: e.target.value })}
                                        className={`w-full p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.targetCity ? 'border-red-500' : 'border-gray-700'}`}
                                        placeholder="Enter target city"
                                    />
                                    {errors.targetCity && <p className="mt-1 text-sm text-red-500">{errors.targetCity}</p>}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Initial Rating Value (1-5)</label>
                                <input
                                    type="number"
                                    value={formData.aggregateRating.ratingValue}
                                    onChange={(e) => setFormData({ ...formData, aggregateRating: { ...formData.aggregateRating, ratingValue: e.target.value } })}
                                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g. 4.5"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Initial Review Count</label>
                                <input
                                    type="number"
                                    value={formData.aggregateRating.reviewCount}
                                    onChange={(e) => setFormData({ ...formData, aggregateRating: { ...formData.aggregateRating, reviewCount: e.target.value } })}
                                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g. 0"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Type */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-100 mb-3">Product Type*</label>
                            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="Own"
                                        checked={formData.productType === 'Own'}
                                        onChange={() => setFormData({ ...formData, productType: 'Own', affiliateLink: '' })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-100">Own Product</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="Affiliate"
                                        checked={formData.productType === 'Affiliate'}
                                        onChange={() => setFormData({ ...formData, productType: 'Affiliate' })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-100">Affiliate Product</span>
                                </label>
                            </div>
                        </div>

                        {formData.productType === 'Affiliate' && (
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Affiliate Link*</label>
                                <input
                                    type="url"
                                    value={formData.affiliateLink}
                                    onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
                                    className={`w-full p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.affiliateLink ? 'border-red-500' : 'border-gray-700'}`}
                                    placeholder="https://example.com/affiliate"
                                />
                                {errors.affiliateLink && <p className="mt-1 text-sm text-red-500">{errors.affiliateLink}</p>}
                            </div>
                        )}
                    </div>

                    {/* Images */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-100 mb-2 text-sm font-medium">Main Image* (800*800 px)</label>
                            <input
                                type="file"
                                accept="image/*"
                                ref={mainImageInputRef}
                                onChange={handleMainImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {errors.mainImage && <p className="mt-1 text-sm text-red-500">{errors.mainImage}</p>}
                            {formData.existingMainImage && !formData.mainImage && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-100 mb-2">Existing Image:</p>
                                    <Image
                                        src={formData.existingMainImage}
                                        alt="Existing main image"
                                        width={150}
                                        height={150}
                                        className="rounded-lg object-cover"
                                    />
                                </div>
                            )}
                            {imagePreviews.mainImage && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-100 mb-2">New Image Preview:</p>
                                    <Image
                                        src={imagePreviews.mainImage}
                                        alt="Main image preview"
                                        width={150}
                                        height={150}
                                        className="rounded-lg object-cover"
                                    />
                                </div>
                            )}
                            <label className="block text-sm font-medium text-gray-100 mt-4 mb-2">Main Image ALT Text*</label>
                            <input
                                type="text"
                                value={formData.mainImageAlt}
                                onChange={(e) => setFormData({ ...formData, mainImageAlt: e.target.value })}
                                className={`w-full p-3 bg-gray-800 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.mainImageAlt ? 'border-red-500' : 'border-gray-700'}`}
                                placeholder="Enter ALT text for main image"
                            />
                            {errors.mainImageAlt && <p className="mt-1 text-sm text-red-500">{errors.mainImageAlt}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-100 mb-2 text-sm font-medium">Additional Images (max 5) - (800*800 px)</label>
                            {formData.existingAdditionalImages.map((img, index) => (
                                <div key={`existing-${index}`} className="mb-4">
                                    <div className="flex items-center">
                                        <Image
                                            src={img.url}
                                            alt={img.alt || `Existing additional image ${index + 1}`}
                                            width={100}
                                            height={100}
                                            className="rounded-lg object-cover mr-4"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <label className="block text-sm font-medium text-gray-100 mt-2 mb-1">ALT Text for Existing Image {index + 1}</label>
                                    <input
                                        type="text"
                                        value={img.alt}
                                        onChange={(e) => handleExistingAltChange(index, e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder={`Enter ALT text for existing image ${index + 1}`}
                                    />
                                </div>
                            ))}
                            {formData.additionalImages.map((img, index) => (
                                <div key={index} className="mb-4">
                                    <div className="flex items-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={setAdditionalImageRef(index)}
                                            onChange={(e) => handleAdditionalImageChange(index, e)}
                                            className="block w-full text-sm text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImageInput(index)}
                                            className="ml-2 text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    {errors[`additionalImage${index}`] && (
                                        <p className="mt-1 text-sm text-red-500">{errors[`additionalImage${index}`]}</p>
                                    )}
                                    {imagePreviews.additionalImages[index] && (
                                        <div className="mt-2">
                                            <Image
                                                src={imagePreviews.additionalImages[index]!}
                                                alt={`Additional image ${index + 1} preview`}
                                                width={100}
                                                height={100}
                                                className="rounded-lg object-cover"
                                            />
                                        </div>
                                    )}
                                    <label className="block text-sm font-medium text-gray-100 mt-2 mb-1">ALT Text for New Image {index + 1}</label>
                                    <input
                                        type="text"
                                        value={formData.additionalAlts[index]}
                                        onChange={(e) => handleAdditionalAltChange(index, e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder={`Enter ALT text for additional image ${index + 1}`}
                                    />
                                </div>
                            ))}
                            {formData.additionalImages.length + formData.existingAdditionalImages.length < 5 && (
                                <button
                                    type="button"
                                    onClick={addImageInput}
                                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                >
                                    + Add Image
                                </button>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                {formData.additionalImages.length + formData.existingAdditionalImages.length > 0
                                    ? `${formData.additionalImages.length + formData.existingAdditionalImages.length} image(s) selected`
                                    : 'No additional images selected'}
                            </p>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Updating Product...
                                </span>
                            ) : (
                                'Update Product'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}