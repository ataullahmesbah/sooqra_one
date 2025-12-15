
import FAQSection from '@/src/components/Share/FAQSection/FAQSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Frequently Asked Questions | Sooqra One",
    description:
        "Find answers to common questions about shopping, orders, delivery, returns, payment, and customer support at Sooqra One e-commerce store.",
    keywords: 'FAQ, Sooqra One, e-commerce FAQ, online shopping questions, order support, delivery questions, return policy, payment methods',
    authors: [{ name: 'Sooqra One' }],
    robots: 'index, follow',
    openGraph: {
        title: "Frequently Asked Questions | Sooqra One",
        description:
            "Explore answers to common questions about shopping, orders, delivery, returns, and customer support at Sooqra One.",
        url: "https://sooqraone.com/faq",
        siteName: "Sooqra One",
        type: "website",
        locale: "en_US",
        images: [{ url: 'https://sooqraone.com/images/og-faq.jpg' }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Frequently Asked Questions | Sooqra One",
        description:
            "Answers to common questions about shopping, orders, delivery, returns, and customer support at Sooqra One.",
        images: ['https://sooqraone.com/images/og-faq.jpg'],
    },
};

export default function FAQPage() {
    return (
        <main className="bg-gray-100 min-h-screen">
            <FAQSection />
        </main>
    );
}