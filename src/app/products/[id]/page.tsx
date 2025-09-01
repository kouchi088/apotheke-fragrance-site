'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stock_quantity: number;
  images: string[]; // Add images array
}

const supabase = createClient();

const ProductPage = ({ params }: { params: { id: string } }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // New state for image slider

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*, images') // Select images column
        .eq('id', params.id)
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        setError('商品情報の取得に失敗しました。');
        setProduct(null);
      } else {
        setProduct(productData);
        // Ensure currentImageIndex is valid if productData.images exists
        if (productData?.images && productData.images.length > 0) {
          setCurrentImageIndex(0);
        }
      }
      setLoading(false);
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success(`${product.name}をカートに追加しました。`);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    setIsBuyingNow(true);
    try {
      const response = await fetch('/api/checkout/quick-buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product.id, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '購入処理に失敗しました。');
      }

      window.location.href = data.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(errorMessage);
      setIsBuyingNow(false);
    }
  };

  const nextImage = () => {
    if (product && product.images && product.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % product.images.length
      );
    }
  };

  const prevImage = () => {
    if (product && product.images && product.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex - 1 + product.images.length) % product.images.length
      );
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="text-center py-20">商品が見つかりませんでした。</div>;
  }

  return (
    <div className="container mx-auto max-w-5xl py-16 px-4">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="relative w-full aspect-square bg-accent">
          {product.images && product.images.length > 0 ? (
            <>
              <Image
                src={product.images[currentImageIndex]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                priority
              />
              {product.images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button
                    onClick={prevImage}
                    className="bg-black bg-opacity-50 text-white p-2 rounded-full focus:outline-none"
                  >
                    &lt;
                  </button>
                  <button
                    onClick={nextImage}
                    className="bg-black bg-opacity-50 text-white p-2 rounded-full focus:outline-none"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          ) : (
            <Image
              src={product.image} // Fallback to single image if images array is empty
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              priority
            />
          )}
        </div>

        <div className="flex flex-col pt-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">{product.name}</h1>
          <p className="text-2xl text-primary mb-6">¥{product.price.toLocaleString()}</p>
          
          <div className="text-secondary leading-relaxed mb-8">
            <p className="whitespace-pre-line">{product.description}</p>
          </div>
          
          <div className="flex items-center mb-8">
            <label htmlFor="quantity" className="mr-4 font-medium text-sm text-secondary">QUANTITY</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              max={product.stock_quantity} // Use stock_quantity
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 p-2 border border-accent rounded-md text-center bg-white focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="w-full max-w-sm flex flex-col gap-4">
            <button 
              onClick={handleAddToCart}
              className="w-full py-3 px-6 bg-primary text-white font-bold tracking-wider hover:bg-foreground transition-colors duration-300 disabled:bg-secondary"
              disabled={product.stock_quantity === 0}
            >
              {product.stock_quantity > 0 ? 'ADD TO CART' : 'SOLD OUT'}
            </button>
            <button 
              onClick={handleBuyNow}
              className="w-full py-3 px-6 bg-transparent border border-primary text-primary font-bold tracking-wider hover:bg-primary hover:text-white transition-colors duration-300 disabled:bg-secondary disabled:text-white disabled:border-secondary"
              disabled={product.stock_quantity === 0 || isBuyingNow}
            >
              {isBuyingNow ? 'PROCESSING...' : (product.stock_quantity > 0 ? 'BUY NOW' : 'SOLD OUT')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
