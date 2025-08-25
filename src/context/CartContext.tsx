// context/CartContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from "react";

// Product 型をインポートする代わりに、ここで定義します。
// もし他の場所でも使うなら、types/index.ts のような共通ファイルに移動するのが望ましいです。
export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  stock_quantity: number; // stock_quantityに変更
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, qty?: number) => void; // 引数を Product オブジェクトに変更
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, qty: number = 1) => { // 引数を Product オブジェクトに変更
    setItems((curr) => {
      const existing = curr.find((item) => item.product.id === product.id);
      if (existing) {
        return curr.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      } else {
        return [...curr, { product, quantity: qty }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((curr) => curr.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setItems((curr) => {
      if (newQuantity <= 0) {
        return curr.filter((item) => item.product.id !== productId);
      }
      return curr.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: string) => {
    const item = items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};