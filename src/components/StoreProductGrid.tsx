"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

export default function StoreProductGrid({ products }: { products: Product[] }) {
  const { addToCart } = useCart();

  const handleAddToCart = (product: any) => {
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg',
      images: product.images || [],
      description: product.description || '',
      stock_quantity: product.stock_quantity || 0,
    };
    addToCart(productToAdd, 1);
  };

  if (products.length === 0) {
    return <p className="text-center text-secondary py-20">商品が見つかりませんでした。</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
      {products.map((product) => (
        <div key={product.id} className="group">
          <Link href={`/products/${product.id}`} className="block">
            <div className="relative w-full aspect-square overflow-hidden bg-accent rounded-lg shadow-md">
              {product.images && product.images.length > 0 && (
                <>
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className={`transition-all duration-500 ${
                      product.images.length > 1 ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                    }`}
                  />
                  {/* Hover Image (if available) */}
                  {product.images.length > 1 && (
                    <Image
                      src={product.images[1]}
                      alt={`${product.name} - detail`}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="absolute inset-0 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                    />
                  )}
                </>
              )}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">{product.name}</h3>
          </Link>
          <p className="mt-1 text-sm text-primary">¥{product.price.toLocaleString()}</p>
          <button
            onClick={() => handleAddToCart(product)}
            className="mt-4 px-4 py-2 border border-gray-button text-gray-button text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-colors w-full"
          >
            カートに追加
          </button>
        </div>
      ))}
    </div>
  );
}
