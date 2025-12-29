'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

interface OTPVerificationProps {
    phone: string;
    onVerified: (verified: boolean) => void;
    onCancel?: () => void;
}

export default function OTPVerification({ phone, onVerified, onCancel }: OTPVerificationProps) {
    const [otp, setOtp] = useState<string[]>(Array(5).fill(''));
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [canResend, setCanResend] = useState(false);

    // Type ঠিক করে দিন
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    // Timer for OTP expiry
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Format timer display
    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Send OTP
    const sendOTP = async () => {
        if (!phone || !/^(?:\+88|88)?(01[3-9]\d{8})$/.test(phone)) {
            setError('Please enter a valid phone number first');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setOtp(Array(5).fill(''));

        try {
            const response = await axios.post('/api/otp/send', { phone });

            if (response.data.success) {
                setTimer(120); // 2 minutes
                setCanResend(false);
                setSuccess('OTP sent successfully!');
                setTimeout(() => setSuccess(''), 3000);

                // Focus first OTP input
                setTimeout(() => {
                    if (inputRefs.current[0]) {
                        inputRefs.current[0].focus();
                    }
                }, 100);
            } else {
                setError(response.data.message || 'Failed to send OTP');
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP
    const verifyOTP = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 5) {
            setError('Please enter 5-digit OTP');
            return;
        }

        setVerifying(true);
        setError('');

        try {
            const response = await axios.post('/api/otp/verify', {
                phone,
                otp: otpString,
            });

            if (response.data.success) {
                setSuccess('Phone verified successfully!');
                onVerified(true);
            } else {
                setError(response.data.message || 'Invalid OTP');
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    // Handle OTP input change
    const handleOtpChange = useCallback((value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 4) {
            const nextInput = inputRefs.current[index + 1];
            if (nextInput) {
                nextInput.focus();
            }
        }
    }, [otp]);

    // Handle backspace
    const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = inputRefs.current[index - 1];
            if (prevInput) {
                prevInput.focus();
            }
        }
    }, [otp]);

    // Handle paste
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const digits = pastedData.replace(/\D/g, '').slice(0, 5);

        const newOtp = [...otp];
        digits.split('').forEach((digit, index) => {
            if (index < 5) {
                newOtp[index] = digit;
            }
        });

        setOtp(newOtp);

        // Focus last filled input
        const lastIndex = Math.min(digits.length - 1, 4);
        const lastInput = inputRefs.current[lastIndex];
        if (lastInput) {
            lastInput.focus();
        }
    }, [otp]);

    // Ref callback function - FIXED VERSION
    const setInputRef = useCallback((index: number) => (el: HTMLInputElement | null) => {
        inputRefs.current[index] = el;
    }, []);

    // Initial OTP send when component mounts
    useEffect(() => {
        if (phone && /^(?:\+88|88)?(01[3-9]\d{8})$/.test(phone)) {
            sendOTP();
        }
    }, [phone]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Verify Phone Number
                </h3>
                <p className="text-sm text-gray-600">
                    We've sent a 5-digit OTP to <span className="font-medium">+88{phone.replace(/\D/g, '').slice(1)}</span>
                </p>
            </div>

            {/* OTP Inputs - FIXED REF */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Enter 5-digit OTP
                </label>
                <div className="flex justify-center gap-3 mb-4" onPaste={handlePaste}>
                    {[0, 1, 2, 3, 4].map((index) => (
                        <input
                            key={index}
                            ref={setInputRef(index)}
                            type="text"
                            maxLength={1}
                            value={otp[index]}
                            onChange={(e) => handleOtpChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-12 h-12 text-center text-xl border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                            disabled={loading || verifying}
                        />
                    ))}
                </div>

                {/* Timer */}
                <div className="text-center mb-4">
                    {timer > 0 ? (
                        <p className="text-sm text-gray-600">
                            OTP expires in: <span className="font-bold">{formatTimer(timer)}</span>
                        </p>
                    ) : (
                        <p className="text-sm text-red-600">OTP has expired</p>
                    )}
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                    {success}
                </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={verifyOTP}
                    disabled={verifying || loading || otp.join('').length !== 5}
                    className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    {verifying ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                        </span>
                    ) : (
                        'Verify OTP'
                    )}
                </button>

                <button
                    onClick={sendOTP}
                    disabled={loading || !canResend}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    {loading ? 'Sending...' : 'Resend OTP'}
                </button>

                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
                By verifying, you agree to our Terms of Service and Privacy Policy
            </p>
        </div>
    );
}