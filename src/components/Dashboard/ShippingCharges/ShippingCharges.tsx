'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';

interface ShippingCharges {
    'Dhaka': number;
    'Other-Districts': number;
}

interface ShippingChargeItem {
    type: string;
    charge: number;
}

export default function ShippingCharges() {
    const [charges, setCharges] = useState<ShippingCharges>({
        'Dhaka': 0,
        'Other-Districts': 0
    });
    const [dhakaCharge, setDhakaCharge] = useState<string>('');
    const [otherDistrictsCharge, setOtherDistrictsCharge] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const fetchCharges = async (): Promise<void> => {
        setLoading(true);
        try {
            setError('');
            const response = await axios.get<ShippingChargeItem[]>('/api/products/shipping-charges');
            console.log('Shipping Charges Response:', response.data);

            const chargeMap: ShippingCharges = { 'Dhaka': 0, 'Other-Districts': 0 };

            response.data.forEach((c: ShippingChargeItem) => {
                if (c.type === 'Dhaka' || c.type === 'Other-Districts') {
                    chargeMap[c.type as keyof ShippingCharges] = c.charge || 0;
                }
            });

            setCharges(chargeMap);
            setDhakaCharge(chargeMap['Dhaka'].toString());
            setOtherDistrictsCharge(chargeMap['Other-Districts'].toString());
        } catch (error: any) {
            console.error('Error fetching shipping charges:', error);
            setError('Failed to load shipping charges. Please try again or reset to default.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCharges();
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        const dhakaNum = Number(dhakaCharge);
        const otherDistrictsNum = Number(otherDistrictsCharge);

        if (!dhakaCharge || isNaN(dhakaNum) || dhakaNum < 0) {
            setError('Please enter a valid charge for Dhaka.');
            return;
        }

        if (!otherDistrictsCharge || isNaN(otherDistrictsNum) || otherDistrictsNum < 0) {
            setError('Please enter a valid charge for other districts.');
            return;
        }

        try {
            setError('');
            setLoading(true);

            const payload: ShippingChargeItem[] = [
                { type: 'Dhaka', charge: dhakaNum },
                { type: 'Other-Districts', charge: otherDistrictsNum }
            ];

            console.log('Submitting:', payload);
            await axios.post('/api/products/shipping-charges', payload);
            alert('Shipping charges updated successfully');
            fetchCharges();
        } catch (error: any) {
            console.error('Error updating shipping charges:', error.response?.data || error);
            setError(error.response?.data?.error || 'Failed to update shipping charges. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (): Promise<void> => {
        if (confirm('Reset charges to default (Dhaka: 80 BDT, Other Districts: 120 BDT)?')) {
            try {
                setError('');
                setLoading(true);
                const payload: ShippingChargeItem[] = [
                    { type: 'Dhaka', charge: 80 },
                    { type: 'Other-Districts', charge: 120 }
                ];
                console.log('Resetting:', payload);
                await axios.post('/api/products/shipping-charges', payload);
                alert('Charges reset to default');
                fetchCharges();
            } catch (error: any) {
                console.error('Error resetting shipping charges:', error.response?.data || error);
                setError(error.response?.data?.error || 'Failed to reset shipping charges');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDhakaChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setDhakaCharge(e.target.value);
    };

    const handleOtherDistrictsChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setOtherDistrictsCharge(e.target.value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Delivery Charges Management
                </h1>
                <p className="text-gray-400 text-center mb-8">Set different delivery charges for Dhaka and other districts</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-600/20 border border-red-600 rounded-lg text-red-400 text-center">
                        <span className="font-medium">Error:</span> {error}
                    </div>
                )}

                {loading && (
                    <div className="text-center py-4">
                        <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 text-gray-400">Processing...</p>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                    <button
                        onClick={fetchCharges}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                        disabled={loading}
                        type="button"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Charges
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:bg-yellow-400 disabled:cursor-not-allowed"
                        disabled={loading}
                        type="button"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset to Default
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Current Charges Display */}
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-blue-300">Current Delivery Charges</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-white">Dhaka Delivery</h3>
                                    <p className="text-sm text-gray-400">Within Dhaka city</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-green-400">৳{charges['Dhaka'].toLocaleString()}</p>
                                    <p className="text-sm text-gray-400">Per delivery</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-white">Other Districts</h3>
                                    <p className="text-sm text-gray-400">All other districts including Chattogram</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-purple-400">৳{charges['Other-Districts'].toLocaleString()}</p>
                                    <p className="text-sm text-gray-400">Per delivery</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Update Charges Form */}
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-green-300">Update Delivery Charges</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Dhaka Delivery Charge (BDT)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">৳</span>
                                        <input
                                            type="number"
                                            value={dhakaCharge}
                                            onChange={handleDhakaChange}
                                            className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all duration-200"
                                            required
                                            min="0"
                                            step="1"
                                            placeholder="Enter charge for Dhaka"
                                            disabled={loading}
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-400">Delivery charge within Dhaka city limits</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Other Districts Charge (BDT)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">৳</span>
                                        <input
                                            type="number"
                                            value={otherDistrictsCharge}
                                            onChange={handleOtherDistrictsChange}
                                            className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-200"
                                            required
                                            min="0"
                                            step="1"
                                            placeholder="Enter charge for other districts"
                                            disabled={loading}
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-400">Delivery charge for all other districts including Chattogram</p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Update Delivery Charges
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-medium mb-3 text-gray-300">Delivery Charges Information</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span><strong>Dhaka:</strong> Applies to all areas within Dhaka city corporation</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-purple-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span><strong>Other Districts:</strong> Includes Chattogram, Sylhet, Rajshahi, Khulna, Barisal, Rangpur, Mymensingh divisions</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Charges are applied per order. Changes take effect immediately</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}