// app/test/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useState } from 'react';

interface TestData {
  _id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: TestData[];
  count?: number;
  error?: string; // FIX: Added this
  details?: string; // FIX: Added this
}

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [data, setData] = useState<TestData[]>([]);
  const [count, setCount] = useState(0);

  const testConnection = async (method: 'GET' | 'POST' | 'DELETE' = 'GET') => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/test', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: ApiResponse = await response.tson();

      if (result.success) {
        setMessage(`✅ ${result.message}`);
        if (result.data) setData(result.data);
        if (result.count !== undefined) setCount(result.count);
      } else {
        // FIX: Now error property exists in type
        setMessage(`❌ ${result.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // New function to test direct insert
  const testInsert = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/test/insert');
      const result: ApiResponse = await response.tson();

      if (result.success) {
        setMessage(`✅ ${result.message}`);
        // Refresh the data after insert
        testConnection('GET');
      } else {
        setMessage(`❌ ${result.error || 'Insert failed'}`);
      }
    } catch (error) {
      setMessage(`❌ Insert error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 SOOQRA ONE Database Test
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            MongoDB Database Connection Testing Interface
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => testConnection('GET')}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              🔍 Fetch Data
            </button>

            <button
              onClick={testInsert}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              🚀 Insert Test Data
            </button>

            <button
              onClick={() => testConnection('POST')}
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              ➕ Add Single
            </button>

            <button
              onClick={() => testConnection('DELETE')}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              🗑️ Clear All
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`p-4 rounded-lg mb-4 ${message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' :
                'bg-red-50 text-red-800 border border-red-200'
              }`}>
              {message}
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 mt-2">Processing...</p>
            </div>
          )}
        </div>

        {/* Rest of your UI remains same */}
        {data.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📊 Test Data ({count} items)
            </h2>
            <div className="space-y-4">
              {data.map((item) => (
                <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                      <p className="text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Created: {new Date(item.createdAt).toLocaleString()}</span>
                    <span>Updated: {new Date(item.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && data.length === 0 && count === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Test Data</h3>
            <p className="text-gray-500">
              Click Insert Test Data to add sample documents to your database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}