export default function CancelPage() {
    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-white mb-6">Payment Cancelled</h1>
                <p className="text-gray-300 text-lg">Your payment was cancelled. Please try again if needed.</p>
                <a
                    href="/checkout"
                    className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Try Again
                </a>
            </div>
        </div>
    );
}