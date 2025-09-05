'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-secondary mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link 
            href="/online-store"
            className="inline-block bg-primary text-white font-bold py-3 px-8 hover:bg-foreground transition-colors"
          >
            START SHOPPING
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-wider">SHOPPING CART</h1>
      </div>
      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.product.id} className="flex items-center gap-6 border-b border-accent pb-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : item.product.image}
                  alt={item.product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="flex-1">
                <Link href={`/products/${item.product.id}`} className="font-bold text-lg hover:underline">
                  {item.product.name}
                </Link>
                <p className="text-secondary mt-1">¥{item.product.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-accent">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-2 hover:bg-accent"><MinusIcon className="w-4 h-4"/></button>
                  <span className="px-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2 hover:bg-accent"><PlusIcon className="w-4 h-4"/></button>
                </div>
                <p className="font-bold w-24 text-right">¥{(item.product.price * item.quantity).toLocaleString()}</p>
                <button onClick={() => removeFromCart(item.product.id)} className="text-secondary hover:text-primary">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 bg-accent rounded-lg p-8 h-fit sticky top-24">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-secondary">Subtotal ({totalItems} items)</span>
              <span className="font-bold">¥{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-300">
              <span>Total</span>
              <span>¥{totalPrice.toLocaleString()}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="w-full mt-8 block text-center py-3 px-6 bg-primary text-white font-bold tracking-wider hover:bg-foreground transition-colors"
          >
            PROCEED TO CHECKOUT
          </Link>
        </div>
      </div>
    </main>
  );
}
