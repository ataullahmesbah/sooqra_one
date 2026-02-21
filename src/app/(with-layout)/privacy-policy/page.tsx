import type { Metadata } from 'next';

const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - Sooqra One",
    "description": "Learn how Sooqra One e-commerce website collects, uses, and protects your personal information. We value your privacy and ensure transparency with data practices.",
    "url": "https://sooqraone.com/privacy-policy",
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

export const viewport = {
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    title: 'Privacy Policy - Sooqra One',
    description: "Learn how Sooqra One e-commerce website collects, uses, and protects your personal information. We value your privacy and ensure transparency with data practices.",
    keywords: 'privacy policy, Sooqra One, e-commerce, data protection, user rights, personal information, website privacy, cookies',
    authors: [{ name: 'Sooqra One' }],
    robots: 'index, follow',
    openGraph: {
        title: 'Privacy Policy - Sooqra One',
        description: "Understand how Sooqra One collects, uses, and protects your personal information for e-commerce transactions.",
        url: 'https://sooqraone.com/privacy-policy',
        type: 'website',
        siteName: 'Sooqra One',
        images: [{ url: 'https://sooqraone.com/images/og-privacy-policy.jpg' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Privacy Policy - Sooqra One',
        description: "Learn about Sooqra One's privacy practices and data protection policies for online shopping.",
        images: ['https://sooqraone.com/images/og-privacy-policy.jpg'],
    },
};

const PrivacyPolicy = () => {
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 px-6 py-16 md:px-12 lg:px-24">
                <div className="max-w-5xl mx-auto space-y-12">
                    {/* JSON-LD Schema */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                    />

                    {/* Header */}
                    <header className="text-center mb-12" aria-labelledby="privacy-title">
                        <h1 id="privacy-title" className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                            Privacy Policy
                        </h1>
                        <div className="w-24 h-1 bg-blue-600 mx-auto mb-4 rounded"></div>
                        <p className="text-sm text-gray-400">Last Updated: November 18, 2025</p>
                    </header>

                    {/* Introduction */}
                    <p className="text-lg text-gray-200 leading-relaxed">
                        Welcome to <strong>Sooqra One</strong>. This Privacy Policy explains how we collect, use, and protect your personal information when you interact with our e-commerce website or services. Your privacy is our priority, and we are committed to transparency in our data practices.
                    </p>

                    {/* Policy Sections */}
                    <div className="space-y-10">
                        <article className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-semibold text-white mb-4">1. What We Collect</h2>
                            <ul className="list-disc list-inside space-y-3 text-gray-300">
                                <li><span className="font-medium text-gray-200">Order Information:</span> Name, email, phone number, shipping address.</li>
                                <li><span className="font-medium text-gray-200">Account Information:</span> Email, hashed password, profile image.</li>
                                <li><span className="font-medium text-gray-200">Newsletter:</span> Email, optional name.</li>
                                <li><span className="font-medium text-gray-200">Payment Information:</span> Processed securely through payment gateways (we don't store card details).</li>
                                <li><span className="font-medium text-gray-200">Analytics:</span> Facebook Pixel (planned for future use).</li>
                                <li><span className="font-medium text-gray-200">Services Used:</span> Firebase, NextAuth, Mailchimp, Brevo, Cloudinary, and other e-commerce tools.</li>
                            </ul>
                        </article>

                        <article className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                            <ul className="list-disc list-inside space-y-3 text-gray-300">
                                <li>Process and fulfill your orders.</li>
                                <li>Respond to contact requests and customer inquiries.</li>
                                <li>Manage user accounts, logins, and profiles.</li>
                                <li>Send order confirmations, updates, and shipping notifications.</li>
                                <li>Send opt-in marketing newsletters and promotional offers.</li>
                                <li>Improve our website, products, and user experience.</li>
                            </ul>
                        </article>

                        <article className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-semibold text-white mb-4">3. Data Protection</h2>
                            <p className="text-gray-200 leading-relaxed">
                                We implement robust security measures to safeguard your data. Passwords are securely hashed, payment information is encrypted, and we never sell or share your personal information with third parties for marketing purposes without your consent.
                            </p>
                        </article>

                        <article className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-semibold text-white mb-4">4. Your Rights</h2>
                            <p className="text-gray-200 mb-4">
                                You can contact us at{' '}
                                <a href="mailto:support@sooqraone.com" className="text-blue-400 hover:underline" aria-label="Email customer support">
                                    support@sooqraone.com
                                </a>{' '}
                                to:
                            </p>
                            <ul className="list-disc list-inside space-y-3 text-gray-300">
                                <li>Access or update your personal data.</li>
                                <li>Request account deletion.</li>
                                <li>Unsubscribe from marketing communications.</li>
                                <li>Request information about data we hold about you.</li>
                                <li>Withdraw consent for data processing.</li>
                            </ul>
                        </article>

                        <article className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-semibold text-white mb-4">5. Children's Privacy</h2>
                            <p className="text-gray-200 leading-relaxed">
                                We do not knowingly collect data from users under 13. If such data is identified, we will promptly delete it.
                            </p>
                        </article>

                        <article className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-semibold text-white mb-4">6. Policy Updates</h2>
                            <p className="text-gray-200 leading-relaxed">
                                We may revise this Privacy Policy periodically. Updates will be posted here with a new revision date. We encourage you to review this page regularly.
                            </p>
                        </article>

                        <article className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies & Tracking Technologies</h2>
                            <p className="text-gray-200 leading-relaxed">
                                We use cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can control cookies through your browser settings. Our website may also use third-party services like Google Analytics and Facebook Pixel for analytics and advertising purposes.
                            </p>
                        </article>

                        <article className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-semibold text-white mb-4">8. Third-Party Services</h2>
                            <p className="text-gray-200 leading-relaxed">
                                We use trusted third-party services for payment processing, email marketing, analytics, and hosting. These services have their own privacy policies, and we recommend you review them. We only share necessary information with these providers to deliver our services.
                            </p>
                        </article>
                    </div>

                    {/* Footer Note */}
                    <footer className="pt-8 border-t border-gray-700 mt-12">
                        <p className="text-sm italic text-gray-400 text-center">
                            For any privacy-related concerns, please reach out to us at{' '}
                            <a href="mailto:support@sooqraone.com" className="text-blue-400 hover:underline" aria-label="Email customer support">
                                support@sooqraone.com
                            </a>{' '}
                            or through our{' '}
                            <a href="/contact" className="text-blue-400 hover:underline" aria-label="Contact page">
                                Contact Page
                            </a>.
                        </p>
                    </footer>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicy;