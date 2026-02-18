import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../providers/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sooqra One | Premium Organic & Islamic Lifestyle Products in Bangladesh",
  description:
    "Sooqra One is a trusted ecommerce platform in Bangladesh offering premium organic food, Sunnah products, Islamic lifestyle essentials, and halal lifestyle items. Shop quality, authenticity, and purity in one place.",
  keywords: [
    "Sooqra One",
    "Organic products in Bangladesh",
    "Islamic products BD",
    "Sunnah products",
    "Halal lifestyle store",
    "Organic food shop BD",
    "Islamic ecommerce Bangladesh",
  ],
  metadataBase: new URL("https://sooqraone.com"),
  openGraph: {
    title:
      "Sooqra One | Organic & Islamic Lifestyle Ecommerce in Bangladesh",
    description:
      "Discover premium organic food, Sunnah products, and halal lifestyle essentials at Sooqra One.",
    url: "https://sooqraone.com",
    siteName: "Sooqra One",
    locale: "en_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sooqra One | Organic & Islamic Lifestyle Store",
    description:
      "Shop premium organic & Islamic lifestyle products online in Bangladesh.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
