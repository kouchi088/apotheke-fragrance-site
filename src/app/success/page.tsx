// src/app/success/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function SuccessPage() {
  const { clearCart } = useCart();

  // On component mount, clear the cart.
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="container mx-auto px-4 py-12 text-center">
      <div className="max-w-lg mx-auto bg-white p-10 rounded-lg shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Thank You for Your Order!</h1>
        <p className="text-gray-600 mb-8">
          Your payment was successful. A confirmation email has been sent to you.
        </p>
        <Link 
          href="/products"
          className="primary-button inline-block"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}