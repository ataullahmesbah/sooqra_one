import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../providers/providers";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/log.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>

      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
