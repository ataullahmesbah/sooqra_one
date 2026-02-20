import SuccessPage from '@/src/components/Share/Shop/SuccessPage/SuccessPage';
import { Suspense } from 'react';


export const metadata = {
    title: 'Payment Successful | SOOQRA ONE',
    description: 'Your payment has been successfully processed.',
};

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="h-12 w-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading payment confirmation...</p>
                </div>
            </div>
        }>
            <SuccessPage />
        </Suspense>
    );
}