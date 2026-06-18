'use client';
import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import card from '../../../../../public/images/payment/card.png';
import bkash from '../../../../../public/images/payment/bkash.webp';
import cash from '../../../../../public/images/payment/COD.png';

// Interface Definitions
interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postcode: string;
    country: string;
    district: string;
    thana: string;
}

interface CheckoutPaymentProps {
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;
    customerInfo: CustomerInfo;
    loading: boolean;
    bkashNumber: string;
    setBkashNumber: (value: string) => void;
    transactionId: string;
    setTransactionId: (value: string) => void;
    acceptedTerms: boolean;
    setAcceptedTerms: (value: boolean) => void;
    payableAmount: number;
    subtotal: number;
    discount: number;
    shippingCharge: number;
}

export default function CheckoutPayment({
    paymentMethod,
    setPaymentMethod,
    customerInfo,
    loading,
    bkashNumber,
    setBkashNumber,
    transactionId,
    setTransactionId,
    acceptedTerms,
    setAcceptedTerms,
    payableAmount,
    subtotal,
    discount,
    shippingCharge
}: CheckoutPaymentProps) {
    const handleBkashNumberChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            setBkashNumber(value);
        }
    };

    const handleTransactionIdChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value.toUpperCase();
        setTransactionId(value);
    };

    // Payment methods data
    const paymentMethods = [
        {
            id: 'cod',
            name: 'Cash On Delivery',
            image: cash,
            imageAlt: 'Cash on Delivery',
            showForBangladesh: true,
            isActive: true
        },
        {
            id: 'bkash',
            name: 'bKash Payment',
            image: bkash,
            imageAlt: 'bKash',
            showForBangladesh: true,
            isActive: true
        },
        {
            id: 'online',
            name: 'Online Payment',
            description: 'Coming Soon',
            image: card,
            imageAlt: 'Online Payment',
            showForBangladesh: true,
            isActive: false
        }
    ];

    const filteredMethods = paymentMethods.filter(
        method => !method.showForBangladesh || customerInfo.country === 'Bangladesh'
    );

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
            {/* ✅ Title with left vertical line */}
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-3 h-6 bg-gray-600 rounded-full flex-shrink-0"></div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Payment Method</h2>
            </div>

            <div className="space-y-2 sm:space-y-3 mb-6">
                {filteredMethods.map((method) => (
                    <div key={method.id}>
                        {/* ✅ Left side vertical gray border - thick */}
                        <div className={`relative border-l-4 ${paymentMethod === method.id && method.isActive ? 'border-gray-600' : 'border-gray-200'} pl-3 transition-all duration-200`}>
                            <label
                                className={`flex flex-row items-center gap-2 sm:gap-3 p-2 sm:p-2.5 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                    paymentMethod === method.id && method.isActive
                                        ? 'border-gray-600 bg-gray-50'
                                        : method.isActive
                                            ? 'border-gray-200 hover:border-gray-400'
                                            : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                }`}
                            >
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    {/* ✅ Custom Radio Button - Orange when selected */}
                                    <div className="relative flex-shrink-0">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.id}
                                            checked={paymentMethod === method.id}
                                            onChange={() => method.isActive && setPaymentMethod(method.id)}
                                            className="sr-only"
                                            disabled={loading || !method.isActive}
                                        />
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                            paymentMethod === method.id && method.isActive
                                                ? 'border-orange-500 bg-orange-500'
                                                : 'border-gray-300 bg-white'
                                        }`}>
                                            {paymentMethod === method.id && method.isActive && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ✅ Very Small Image - No background */}
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 flex items-center justify-center">
                                            <Image
                                                src={method.image}
                                                alt={method.imageAlt}
                                                width={28}
                                                height={28}
                                                className="object-contain w-6 h-6"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <span className="block font-semibold text-gray-900 text-xs sm:text-sm">
                                            {method.name}
                                            {!method.isActive && (
                                                <span className="ml-2 text-xs text-orange-500 font-normal">
                                                    (Coming Soon)
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Bkash Payment Instructions */}
                        {method.id === 'bkash' && paymentMethod === 'bkash' && method.isActive && (
                            <div className="mt-2 sm:mt-3 ml-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="space-y-3">
                                    {/* Header */}
                                    <div className="text-center mb-2">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
                                                <Image
                                                    src={bkash}
                                                    alt="bKash"
                                                    width={24}
                                                    height={24}
                                                    className="object-contain w-6 h-6 sm:w-8 sm:h-8"
                                                />
                                            </div>
                                            <span className="text-base sm:text-lg font-bold text-gray-900">bKash Payment</span>
                                        </div>
                                    </div>

                                    {/* Steps - Responsive Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {[
                                            { step: '01', text: 'Go to your bKash app or Dial *247#' },
                                            { step: '02', text: 'Choose "Send Money" option' },
                                            { step: '03', text: 'Enter bKash Account Number: 01881334450' },
                                            { step: '04', text: `Enter amount: ৳${(Number.isFinite(payableAmount) ? payableAmount : 0).toLocaleString()}` },
                                            { step: '05', text: 'Enter reference (optional)' },
                                            { step: '06', text: 'Enter your bKash PIN to confirm' },
                                            { step: '07', text: 'Copy Transaction ID from confirmation message' }
                                        ].map((item, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <div className="flex-shrink-0 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5">
                                                    {item.step}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] sm:text-xs text-gray-700 break-words">
                                                        {item.text}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Payment Details Box */}
                                    <div className="mt-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
                                        <div className="text-center mb-2">
                                            <p className="text-xs text-gray-600">You need to send</p>
                                            <p className="text-xl sm:text-2xl font-bold text-gray-900 break-all">
                                                ৳{(Number.isFinite(payableAmount) ? payableAmount : 0).toLocaleString()}
                                            </p>
                                            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-1">
                                                {shippingCharge > 0 && (
                                                    <p className="text-[10px] sm:text-xs text-gray-600">
                                                        Shipping: ৳{shippingCharge.toLocaleString()}
                                                    </p>
                                                )}
                                                {discount > 0 && (
                                                    <p className="text-[10px] sm:text-xs text-green-600">
                                                        Discount: -৳{discount.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 p-1.5 bg-white rounded">
                                                <span className="text-xs text-gray-700">Account Type:</span>
                                                <span className="text-xs font-medium text-gray-800">Personal</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 p-1.5 bg-white rounded">
                                                <span className="text-xs text-gray-700">Account Number:</span>
                                                <span className="text-sm sm:text-base font-bold text-gray-900 font-mono break-all">01881334450</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bkash Form Fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Your bKash Number *
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                                                    +88
                                                </span>
                                                <input
                                                    type="text"
                                                    value={bkashNumber}
                                                    onChange={handleBkashNumberChange}
                                                    placeholder="01XXXXXXXXX"
                                                    className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    maxLength={11}
                                                    disabled={loading}
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-0.5">Enter the bKash number you used</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Transaction ID *
                                            </label>
                                            <input
                                                type="text"
                                                value={transactionId}
                                                onChange={handleTransactionIdChange}
                                                placeholder="e.g., Yx4oM2"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono uppercase"
                                                maxLength={20}
                                                disabled={loading}
                                            />
                                            <p className="text-[10px] text-gray-500 mt-0.5">Copy from payment confirmation</p>
                                        </div>
                                    </div>

                                    {/* Important Note */}
                                    <div className="mt-3 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-start gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-[10px] sm:text-xs text-yellow-800 break-words">
                                                <strong>Important:</strong> Please ensure the bKash number and Transaction ID are correct.
                                                We will verify your payment before processing the order.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ✅ Terms and Conditions - Circle checkbox with orange when selected */}
            <div className="border-t border-gray-200 pt-4">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                    <div className="relative flex-shrink-0 mt-0.5">
                        <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="sr-only"
                            disabled={loading}
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            acceptedTerms
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300 bg-white group-hover:border-gray-400'
                        }`}>
                            {acceptedTerms && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className={`text-[11px] sm:text-xs ${acceptedTerms ? 'text-gray-900' : 'text-gray-600'} group-hover:text-gray-900 transition-colors break-words`}>
                            I accept the{' '}
                            <a
                                href="/terms-of-service"
                                target="_blank"
                                className="bg-gray-200 font-semibold text-gray-800 px-1 rounded hover:bg-gray-300 transition-colors no-underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Terms & Conditions
                            </a>
                            ,{' '}
                            <a
                                href="/return-policy"
                                target="_blank"
                                className="bg-gray-200 font-semibold text-gray-800 px-1 rounded hover:bg-gray-300 transition-colors no-underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Return & Refund Policy
                            </a>
                            {' '}and{' '}
                            <a
                                href="/privacy-policy"
                                target="_blank"
                                className="bg-gray-200 font-semibold text-gray-800 px-1 rounded hover:bg-gray-300 transition-colors no-underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Privacy Policy
                            </a>
                            {' '}of Sooqra One
                        </span>
                    </div>
                </label>
            </div>

            {/* Validation Messages */}
            {paymentMethod === 'bkash' && (!bkashNumber || !transactionId) && (
                <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-[11px] sm:text-xs text-red-600 text-center break-words">
                        Please provide both bKash number and Transaction ID to proceed.
                    </p>
                </div>
            )}

            {!acceptedTerms && (
                <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-[11px] sm:text-xs text-red-600 text-center break-words">
                        Please accept the Terms & Conditions to place your order.
                    </p>
                </div>
            )}
        </div>
    );
}