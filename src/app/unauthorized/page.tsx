// src/app/unauthorized/page.tsx

import Link from 'next/link';
import { FaLock, FaHome, FaSignInAlt, FaExclamationTriangle } from 'react-icons/fa';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center p-10 bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-200">
        {/* Icon Section */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gray-800/10 blur-xl rounded-full" />
            <div className="relative p-5 bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl shadow-lg border border-gray-300">
              <FaLock className="text-6xl text-gray-800" />
            </div>
            <div className="absolute -top-2 -right-2">
              <FaExclamationTriangle className="text-amber-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black mb-4 text-gray-900">
          Access Denied
        </h1>

        {/* Subtitle */}
        <p className="text-xl mb-4 text-gray-700 font-semibold">
          Unauthorized Access
        </p>

        {/* Message */}
        <div className="mb-10">
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            You don&apos;t have the required permissions to access this page. 
            Please contact your administrator if you believe this is an error.
          </p>
          <div className="inline-flex items-center space-x-2 bg-gray-100 px-5 py-3 rounded-full border border-gray-300">
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="font-semibold text-gray-800">Error: 403 Forbidden</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          {/* Home Button */}
          <Link
            href="/"
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <FaHome className="text-xl group-hover:scale-110 transition-transform duration-300" />
            <span className="text-lg">Go to Home</span>
          </Link>

          {/* Sign In Button */}
          <Link
            href="/auth/signin"
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-gray-800"
          >
            <FaSignInAlt className="text-xl group-hover:scale-110 transition-transform duration-300" />
            <span className="text-lg">Sign In</span>
          </Link>
        </div>

        {/* Reference Code */}
        <div className="mt-10 pt-8 border-t border-gray-300">
          <p className="text-gray-500 mb-2">Reference Code:</p>
          <div className="font-mono bg-gray-100 px-4 py-3 rounded-lg border border-gray-300 text-gray-800 font-semibold">
            403-{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </div>
        </div>

        {/* Security Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🔐</span>
            </div>
            <p className="text-gray-700 font-medium text-sm">Check Permissions</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">👤</span>
            </div>
            <p className="text-gray-700 font-medium text-sm">Verify Account</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">📞</span>
            </div>
            <p className="text-gray-700 font-medium text-sm">Contact Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}