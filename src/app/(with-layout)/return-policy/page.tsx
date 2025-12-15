import type { Metadata } from 'next';

const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Return & Refund Policy - Sooqra One",
    "description": "Sooqra One's exchange and return policy. Learn about our refund process, eligibility criteria, and how to request returns for e-commerce purchases.",
    "url": "https://sooqraone.com/return-policy",
    "publisher": {
        "@type": "Organization",
        "name": "Sooqra One",
        "url": "https://sooqraone.com",
        "contactPoint": {
            "@type": "ContactPoint",
            "email": "support@sooqraone.com",
            "contactType": "Customer Support"
        }
    },
    "lastReviewed": "2025-05-18"
};

const ReturnPolicy = () => {
    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 px-6 py-16 md:px-12 lg:px-24">
                <div className="max-w-5xl mx-auto space-y-12">
                    {/* JSON-LD Schema */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                    />

                    {/* Header */}
                    <header className="text-center mb-12" aria-labelledby="policy-title">
                        <h1 id="policy-title" className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                            Return & Refund Policy
                        </h1>
                        <div className="w-24 h-1 bg-green-500 mx-auto mb-4 rounded"></div>
                        <p className="text-sm text-gray-300">Last Updated: July 17, 2025</p>
                    </header>

                    {/* Introduction */}
                    <p className="text-lg text-gray-200 leading-relaxed">
                        Thank you for shopping at <strong className="text-green-400">Sooqra One</strong>. Our goal is your complete satisfaction. If you're not happy with your purchase, you may request an exchange or refund under the conditions outlined below.
                    </p>

                    {/* Policy Sections */}
                    <div className="space-y-10">
                        {/* Return Eligibility */}
                        <article className="bg-gray-800 p-6 rounded-xl shadow-xl border-l-4 border-green-500">
                            <h2 className="text-2xl font-bold text-white mb-4">1. Return Eligibility</h2>
                            <ul className="list-disc list-inside space-y-3 text-gray-300">
                                <li><span className="text-gray-200 font-medium">Time Limit:</span> Return requests must be made within 48 hours of receiving the product.</li>
                                <li><span className="text-gray-200 font-medium">Acceptable Reasons:</span> Accepted only for incorrect, defective, or damaged items.</li>
                                <li><span className="text-gray-200 font-medium">Condition:</span> Items must be unused, unworn, unwashed, and undamaged.</li>
                                <li><span className="text-gray-200 font-medium">Packaging:</span> Include original tags, packaging, and accessories.</li>
                            </ul>
                        </article>

                        {/* Exchange Policy */}
                        <article className="bg-gray-800 p-6 rounded-xl shadow-xl border-l-4 border-blue-500">
                            <h2 className="text-2xl font-bold text-white mb-4">2. Exchange Policy</h2>
                            <div className="space-y-4 text-gray-300">
                                <p className="leading-relaxed">
                                    Received the wrong product? We'll exchange it at no extra cost. Ensure the item is in its original condition and meets the eligibility criteria above.
                                </p>

                                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                                    <h3 className="text-lg font-semibold text-green-400 mb-2">📦 Unboxing Video Requirement</h3>
                                    <p>To claim a missing or damaged product, you <strong className="text-yellow-300">must record an unboxing video</strong> during the unboxing process as proof. Claims for missing products will not be accepted without an unboxing video.</p>
                                </div>

                                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                                    <h3 className="text-lg font-semibold text-blue-400 mb-2">⏰ Time Limit for Claims</h3>
                                    <p>If you receive a defective or incorrect product, you must claim for an exchange within <strong className="text-yellow-300">2 days (48 hours)</strong> of receiving the product (working days only). In such cases, we will collect the product and deliver a replacement to you without any additional delivery charges.</p>
                                    <p className="mt-2 text-red-300">Please note that claims made after 2 days will not be accepted under any circumstances.</p>
                                </div>
                            </div>
                        </article>

                        {/* Refund Policy */}
                        <article className="bg-gray-800 p-6 rounded-xl shadow-xl border-l-4 border-yellow-500">
                            <h2 className="text-2xl font-bold text-white mb-4">3. Refund Policy</h2>
                            <ul className="list-disc list-inside space-y-3 text-gray-300">
                                <li><span className="text-gray-200 font-medium">Processing Time:</span> Refunds are processed within 10-15 business days post-inspection.</li>
                                <li><span className="text-gray-200 font-medium">Wrong Order:</span> If the customer ordered the wrong product, delivery charges will be deducted from the refund.</li>
                                <li><span className="text-gray-200 font-medium">Refund Method:</span> Refunds will be issued to the original payment method used during purchase.</li>
                                <li><span className="text-gray-200 font-medium">Partial Refunds:</span> In cases of partial returns, only the returned item(s) value will be refunded.</li>
                            </ul>
                        </article>

                        {/* Return Process */}
                        <article className="bg-gray-800 p-6 rounded-xl shadow-xl border-l-4 border-purple-500">
                            <h2 className="text-2xl font-bold text-white mb-4">4. Return Process</h2>
                            <p className="text-gray-200 mb-4">To initiate a return or exchange, contact our support team with:</p>
                            <ul className="list-disc list-inside space-y-3 text-gray-300 mb-6">
                                <li><span className="text-gray-200 font-medium">Order ID</span> (from your confirmation email)</li>
                                <li><span className="text-gray-200 font-medium">Clear photos</span> of the product showing the issue</li>
                                <li><span className="text-gray-200 font-medium">Description</span> of the issue</li>
                                <li><span className="text-gray-200 font-medium">Receipt or proof</span> of purchase</li>
                                <li><span className="text-gray-200 font-medium">Unboxing video</span> (for missing/damaged items)</li>
                            </ul>

                            <div className="bg-gray-900 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-purple-400 mb-2">🔄 Return Steps:</h3>
                                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                    <li>Contact support with required details</li>
                                    <li>Await approval and return instructions</li>
                                    <li>Our delivery team will schedule pickup</li>
                                    <li>Product inspection at our warehouse</li>
                                    <li>Approval and processing of refund/exchange</li>
                                </ol>
                            </div>
                        </article>

                        {/* Non-Returnable Items */}
                        <article className="bg-gray-800 p-6 rounded-xl shadow-xl border-l-4 border-red-500">
                            <h2 className="text-2xl font-bold text-white mb-4">5. Non-Returnable Items</h2>
                            <div className="space-y-3 text-gray-300">
                                <p className="leading-relaxed">The following items cannot be returned or exchanged:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Personalized or custom-made products</li>
                                    <li>Underwear, innerwear, and hygiene products</li>
                                    <li>Perishable goods and consumables</li>
                                    <li>Products without original tags/packaging</li>
                                    <li>Items damaged due to customer misuse</li>
                                    <li>Software, digital products, and gift cards</li>
                                </ul>
                            </div>
                        </article>

                        {/* Contact Information */}
                        <article className="bg-gray-800 p-6 rounded-xl shadow-xl border-l-4 border-cyan-500">
                            <h2 className="text-2xl font-bold text-white mb-4">6. Contact Information</h2>
                            <p className="text-gray-200 mb-4">For questions about our exchange and return policy, reach out to us:</p>
                            <ul className="space-y-4 text-gray-300">
                                <li className="flex items-start">
                                    <span className="font-medium text-gray-200 min-w-20">Email:</span>
                                    <a
                                        href="mailto:support@sooqraone.com"
                                        className="text-cyan-400 hover:underline ml-2"
                                        aria-label="Email customer support"
                                    >
                                        support@sooqraone.com
                                    </a>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-medium text-gray-200 min-w-20">Phone:</span>
                                    <a
                                        href="tel:+8801571083401"
                                        className="text-cyan-400 hover:underline ml-2"
                                        aria-label="Call customer support"
                                    >
                                        +880 1571-083401
                                    </a>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-medium text-gray-200 min-w-20">Return Form:</span>
                                    <a
                                        href="/contact"
                                        className="text-cyan-400 hover:underline ml-2"
                                        aria-label="Access return contact form"
                                    >
                                        Online Return Request Form
                                    </a>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-medium text-gray-200 min-w-20">Business Hours:</span>
                                    <span className="ml-2">Sunday - Thursday, 9:00 AM - 6:00 PM (GMT+6)</span>
                                </li>
                            </ul>
                        </article>
                    </div>

                    {/* Footer Note */}
                    <footer className="pt-8 border-t border-gray-700 mt-12">
                        <p className="text-sm italic text-gray-400 text-center">
                            Note: Returns without prior contact or beyond the 48-hour window may not be accepted. All returns are subject to inspection and approval by our quality control team.
                        </p>
                        <p className="text-center text-gray-500 text-xs mt-4">
                            © {new Date().getFullYear()} Sooqra One. All rights reserved.
                        </p>
                    </footer>
                </div>
            </section>
        </div>
    );
};

export const metadata: Metadata = {
    title: 'Return & Refund Policy - Sooqra One',
    description: "Sooqra One's exchange and return policy. Learn about our refund process, eligibility criteria, and how to request returns for e-commerce purchases.",
    keywords: 'return policy, refund policy, exchange policy, Sooqra One, e-commerce returns, customer support, online shopping returns',
    authors: [{ name: 'Sooqra One' }],
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1',
    openGraph: {
        title: 'Return & Refund Policy - Sooqra One',
        description: "Learn about Sooqra One's exchange and return policy for e-commerce purchases, including refund processes and eligibility.",
        url: 'https://sooqraone.com/return-policy',
        type: 'website',
        siteName: 'Sooqra One',
        images: [{ url: 'https://sooqraone.com/images/og-return-policy.jpg' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Return & Refund Policy - Sooqra One',
        description: "Sooqra One's exchange and return policy. Learn about our refund process and eligibility criteria for online shopping.",
        images: ['https://sooqraone.com/images/og-return-policy.jpg'],
    },
};

export default ReturnPolicy;