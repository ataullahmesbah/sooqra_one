import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SOOQRA ONE",
  description: "SOOQRA ONE - Modern Next.ts 13+ Website with Tailwind CSS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/log.svg" type="image/svg+xml" />

        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>

      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
