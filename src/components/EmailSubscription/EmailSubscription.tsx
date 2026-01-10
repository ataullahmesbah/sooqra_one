'use client';

import React, { useState } from 'react';

const EmailSubscription = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccess(true);
            setEmail('');

            // Reset success state after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            setError('Subscription failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="relative overflow-hidden rounded-2xl">
                {/* Enhanced Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>

                {/* Subtle Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4)_0px,transparent_50%)]"></div>

                {/* Animated Gradient Border Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

                <div className="relative p-8 sm:p-12 lg:p-16">
                    <div className="max-w-3xl mx-auto">
                        {/* Title Section */}
                        <div className="text-center mb-12">

                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                                Sooqra One – Your Organic Home Market
                            </h2>
                            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                                Naturally sourced organic essentials for your everyday home needs.
                            </p>
                        </div>

                        {/* Subscription Form */}
                        <div className="bg-white/5 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 sm:p-8 shadow-2xl">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {/* Enhanced Email Input */}
                                        <div className="relative flex-1">
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                </svg>
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    setError('');
                                                }}
                                                placeholder="Email Address"
                                                className={`w-full pl-12 pr-4 py-3 sm:py-4 rounded-lg border ${error ? 'border-red-500/50' : 'border-gray-600/50'} bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all backdrop-blur-sm`}
                                                disabled={loading}
                                            />
                                        </div>

                                        {/* Enhanced Subscribe Button */}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center gap-2 min-w-[140px] border border-gray-700 ${loading ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-gray-900/30'}`}
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Subscribing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    <span>Subscribe Now</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Error/Success Messages */}
                                    <div className="mt-2 min-h-[24px]">
                                        {error && (
                                            <p className="text-red-400 text-sm flex items-center gap-2 animate-fadeIn">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {error}
                                            </p>
                                        )}
                                        {success && (
                                            <p className="text-green-400 text-sm flex items-center gap-2 animate-fadeIn">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Successfully subscribed! Check your email for confirmation
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </form>


                        </div>


                    </div>
                </div>
            </div>

            {/* Add animation styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default EmailSubscription;