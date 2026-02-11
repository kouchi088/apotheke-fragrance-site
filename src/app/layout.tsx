'use client';

import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext"; // ★追加
import CartButton from "../components/CartButton";
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
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
