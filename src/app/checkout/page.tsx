
// src/app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // loading, redirecting, error

  useEffect(() => {
    if (items.length === 0) {
      // If cart is empty, redirect to home or products page
      router.replace("/products");
      return;
    }

    const handleCheckout = async () => {
      setStatus("redirecting");
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: items.map(item => ({ 
              productId: item.product.id, 
              quantity: item.quantity 
            })),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create checkout session");
        }

        const { url } = await response.json();
        if (url) {
          // On successful session creation, redirect to Stripe
          window.location.href = url;
        } else {
          throw new Error("Stripe URL not returned");
        }
      } catch (error) {
        console.error("Checkout error:", error);
        setStatus("error");
      }
    };

    handleCheckout();

  }, [items, router]);

  return (
    <main className="container mx-auto px-4 py-12 text-center">
      <div className="max-w-md mx-auto">
        {status === "loading" && (
          <div className="animate-fadeIn">
            <h1 className="text-section-title font-semibold mb-md">Preparing your order...</h1>
            <div className="mt-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal mx-auto"></div>
            </div>
          </div>
        )}
        {status === "redirecting" && (
          <div className="animate-fadeIn">
            <h1 className="text-section-title font-semibold mb-md">Redirecting to payment...</h1>
            <div className="mt-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal mx-auto"></div>
            </div>
          </div>
        )}
        {status === "error" && (
          <div className="animate-fadeIn">
            <h1 className="text-section-title font-semibold text-red-600 transition-colors duration-300 mb-md">Payment Error</h1>
            <p className="text-body text-gray-600 mt-sm">Something went wrong. Please try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="primary-button mt-xl"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
