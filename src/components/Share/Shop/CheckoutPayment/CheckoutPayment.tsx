'use client';
import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import bkash from '../../../../../public/images/bkash.svg';

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

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>

            <div className="space-y-4 mb-6">
                {/* Cash on Delivery */}
                {customerInfo.country === 'Bangladesh' && (
                    <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-800 transition-colors">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={() => setPaymentMethod('cod')}
                            className="text-gray-800 focus:ring-gray-800 mt-1 flex-shrink-0"
                            disabled={loading}
                        />
                        <div className="flex-1 min-w-0">
                            <span className="block font-medium text-gray-900 text-base">Cash On Delivery</span>
                            <span className="text-gray-600 text-sm break-words">
                                Pay ৳{(Number.isFinite(payableAmount) ? payableAmount : 0).toLocaleString()} when you receive your order
                                {shippingCharge > 0 && ` (Includes ৳${shippingCharge.toLocaleString()} shipping)`}
                            </span>
                        </div>
                    </label>
                )}

                {/* Bkash Payment */}
                {customerInfo.country === 'Bangladesh' && (
                    <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-800 transition-colors">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="bkash"
                            checked={paymentMethod === 'bkash'}
                            onChange={() => setPaymentMethod('bkash')}
                            className="text-gray-800 focus:ring-gray-800 mt-1 flex-shrink-0"
                            disabled={loading}
                        />
                        <div className="flex-1 min-w-0">
                            <span className="block font-medium text-gray-900 text-base">bKash Payment</span>
                            <span className="text-gray-600 text-sm break-words">
                                Pay ৳{(Number.isFinite(payableAmount) ? payableAmount : 0).toLocaleString()} via bKash
                                {shippingCharge > 0 && ` (Includes ৳${shippingCharge.toLocaleString()} shipping)`}
                            </span>

                            {/* Bkash Payment Instructions */}
                            {paymentMethod === 'bkash' && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="text-center mb-4">
                                            <div className="flex items-center justify-center gap-2 mb-3">
                                                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                                                    <Image
                                                        src={bkash}
                                                        alt="bKash"
                                                        width={24}
                                                        height={24}
                                                        className="object-contain"
                                                    />
                                                </div>
                                                <span className="text-xl font-bold text-gray-900">bKash Payment</span>
                                            </div>
                                        </div>

                                        {/* Steps */}
                                        <div className="space-y-3">
                                            {[
                                                { step: '01', text: 'Go to your bKash app or Dial *247#' },
                                                { step: '02', text: 'Choose Payment' },
                                                { step: '03', text: 'Enter below Merchant Account Number' },
                                                { step: '04', text: 'Enter total amount' },
                                                { step: '06', text: 'Now enter your bKash Account PIN to confirm the transaction' },
                                                { step: '07', text: 'Copy Transaction ID from payment confirmation message and paste that Transaction ID below' }
                                            ].map((item, index) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5">
                                                        {item.step}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-700 break-words">
                                                            {item.text.includes('*247#') ? (
                                                                <>
                                                                    Go to your bKash app or Dial <span className="text-green-600 font-mono">*247#</span>
                                                                </>
                                                            ) : item.text.includes('total amount') ? (
                                                                <>
                                                                    Enter <span className="text-gray-900 font-bold">total amount</span>
                                                                </>
                                                            ) : (
                                                                item.text
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Payment Details Box */}
                                        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
                                            <div className="text-center mb-3">
                                                <p className="text-sm text-gray-600">You need to send us</p>
                                                <p className="text-2xl font-bold text-gray-900 break-all">
                                                    ৳{(Number.isFinite(payableAmount) ? payableAmount : 0).toLocaleString()}
                                                </p>
                                                <div className="flex flex-col sm:flex-row sm:justify-center sm:gap-4 mt-1">
                                                    {shippingCharge > 0 && (
                                                        <p className="text-sm text-gray-600">
                                                            Includes ৳{shippingCharge.toLocaleString()} shipping
                                                        </p>
                                                    )}
                                                    {discount > 0 && (
                                                        <p className="text-sm text-green-600">
                                                            Includes ৳{discount.toLocaleString()} discount
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                                    <span className="text-sm text-gray-700">Account Type:</span>
                                                    <span className="text-sm font-medium text-gray-800">Merchant</span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                                    <span className="text-sm text-gray-700">Account Number:</span>
                                                    <span className="text-lg font-bold text-gray-900 font-mono break-all">01881334450</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bkash Form Fields */}
                                        <div className="grid grid-cols-1 gap-4 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Your bKash Account Number *
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                                        +88
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={bkashNumber}
                                                        onChange={handleBkashNumberChange}
                                                        placeholder="01XXXXXXXXX"
                                                        className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                                                        maxLength={11}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Enter the bKash number you used for payment</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Your bKash Transaction ID *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={transactionId}
                                                    onChange={handleTransactionIdChange}
                                                    placeholder="e.g., Yx4oM2"
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent font-mono uppercase"
                                                    maxLength={20}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Copy from payment confirmation message</p>
                                            </div>
                                        </div>

                                        {/* Important Note */}
                                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-sm text-yellow-800 break-words">
                                                    <strong>Important:</strong> Please ensure the bKash number and Transaction ID are correct. We will verify your payment before processing the order.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </label>
                )}
            </div>

            {/* Terms and Conditions */}
            <div className="border-t border-gray-200 pt-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="text-gray-800 focus:ring-gray-800 mt-1 rounded flex-shrink-0"
                        disabled={loading}
                    />
                    <div className="flex-1 min-w-0">
                        <span className={`text-sm ${acceptedTerms ? 'text-gray-900' : 'text-gray-600'} group-hover:text-gray-900 transition-colors break-words`}>
                            I accept the{' '}
                            <a
                                href="/terms-of-service"
                                target="_blank"
                                className="text-gray-800 hover:text-gray-900 underline break-words"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Terms & Conditions
                            </a>
                            ,{' '}
                            <a
                                href="/return-policy"
                                target="_blank"
                                className="text-gray-800 hover:text-gray-900 underline break-words"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Return & Refund Policy
                            </a>
                            {' '}and{' '}
                            <a
                                href="/privacy-policy"
                                target="_blank"
                                className="text-gray-800 hover:text-gray-900 underline break-words"
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
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-600 text-center break-words">
                        Please provide both bKash number and Transaction ID to proceed.
                    </p>
                </div>
            )}

            {!acceptedTerms && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-600 text-center break-words">
                        Please accept the Terms & Conditions to place your order.
                    </p>
                </div>
            )}
        </div>
    );
}