import Script from "next/script";
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext"; // ★追加
import CartButton from "../components/CartButton";
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  buildAbsoluteUrl,
  defaultDescription,
  defaultOgImage,
  siteName,
  siteUrl,
} from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'megurid | モルタルの静かな日用品',
    template: '%s | MEGURID',
  },
  description: defaultDescription,
  alternates: {
    canonical: buildAbsoluteUrl('/'),
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: buildAbsoluteUrl('/'),
    siteName,
    title: 'megurid | モルタルの静かな日用品',
    description: defaultDescription,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'MEGURID',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'megurid | モルタルの静かな日用品',
    description: defaultDescription,
    images: [defaultOgImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-534N3XNK9D"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-534N3XNK9D');
          `}
        </Script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider> {/* ★追加 */} 
          <CartProvider>
            <Toaster />
            <div className="min-h-screen flex flex-col">
              <Header />
              <main role="main" className="flex-grow pt-[78px]">
                {children}
              </main>
              <Footer />
            </div>
            <CartButton />
          </CartProvider>
        </AuthProvider> {/* ★追加 */} 
      </body>
    </html>
  );
}
