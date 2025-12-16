'use client';

import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { FiSend, FiUser, FiMail, FiPhone, FiMessageCircle } from 'react-icons/fi';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
    subject?: string;
}

interface Errors {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    message?: string;
}

interface ContactFormProps {
    onSuccess?: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSuccess }) => {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
        subject: 'General Inquiry'
    });

    const [errors, setErrors] = useState<Errors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [subject, setSubject] = useState('General Inquiry');

    const subjects = [
        'General Inquiry',
        'Order Support',
        'Return/Refund',
        'Technical Issue',
        'Business Partnership',
        'Product Inquiry',
        'Shipping/Delivery',
        'Other'
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name as keyof Errors]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Errors = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[\+]?[0-9\s\-\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!formData.message.trim()) newErrors.message = 'Message is required';
        if (formData.message.length < 10) newErrors.message = 'Message must be at least 10 characters';
        if (formData.message.length > 1000) newErrors.message = 'Message must be less than 1000 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);
        toast.info('Sending your message...', {
            position: "top-right",
            autoClose: 3000,
        });

        try {
            const dataToSend = {
                ...formData,
                subject: subject
            };

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Message sent successfully! We\'ll get back to you soon.', {
                    position: "top-right",
                    autoClose: 5000,
                });

                // Reset form
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    message: '',
                    subject: 'General Inquiry'
                });
                setSubject('General Inquiry');

                if (onSuccess) onSuccess();
            } else {
                throw new Error(result.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Submission error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Subject Selection */}
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        What can we help you with?
                    </label>
                    <select
                        name="subject"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                        {subjects.map((subj) => (
                            <option key={subj} value={subj}>{subj}</option>
                        ))}
                    </select>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FiUser className="w-4 h-4" />
                            First Name*
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`mt-1 block w-full px-4 py-3 bg-gray-50 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                            placeholder="Sooqra"
                        />
                        {errors.firstName && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span>
                                {errors.firstName}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FiUser className="w-4 h-4" />
                            Last Name*
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`mt-1 block w-full px-4 py-3 bg-gray-50 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                            placeholder="One"
                        />
                        {errors.lastName && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span>
                                {errors.lastName}
                            </p>
                        )}
                    </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FiMail className="w-4 h-4" />
                            Email Address*
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`mt-1 block w-full px-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                            placeholder="sooqra@one.com"
                        />
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span>
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FiPhone className="w-4 h-4" />
                            Phone Number*
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`mt-1 block w-full px-4 py-3 bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                            placeholder="+880 1571-083401"
                        />
                        {errors.phone && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span>
                                {errors.phone}
                            </p>
                        )}
                    </div>
                </div>

                {/* Message */}
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FiMessageCircle className="w-4 h-4" />
                        Message*
                    </label>
                    <textarea
                        name="message"
                        id="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className={`mt-1 block w-full px-4 py-3 bg-gray-50 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none`}
                        placeholder="Please describe your inquiry in detail..."
                        maxLength={1000}
                    />
                    <div className="flex justify-between items-center mt-2">
                        {errors.message ? (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span>
                                {errors.message}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500">
                                Be as detailed as possible for better assistance
                            </p>
                        )}
                        <p className="text-sm text-gray-500">
                            {formData.message.length}/1000
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Sending Message...</span>
                            </>
                        ) : (
                            <>
                                <FiSend className="w-5 h-5" />
                                <span>Send Message</span>
                            </>
                        )}
                    </motion.button>

                    <p className="text-center text-sm text-gray-500 mt-4">
                        By submitting this form, you agree to our{' '}
                        <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 font-medium">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default ContactForm;