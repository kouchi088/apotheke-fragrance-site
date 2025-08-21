// components/CartButton.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CartButton() {
  const { totalItems } = useCart();

  return (
    <Link href="/cart">
      <div className="fixed bottom-4 right-4 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-800 hover:text-white transition-colors z-50">
        <span className="text-2xl">🛒</span>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {totalItems}
          </span>
        )}
      </div>
    </Link>
  );
}
