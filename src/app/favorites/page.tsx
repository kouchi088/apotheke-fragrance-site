'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

const supabase = createClient();

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndFavorites = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const { data: favoriteProductIds, error } = await supabase
          .from('user_favorites')
          .select('product_id')
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error fetching favorites:', error);
          setLoading(false);
          return;
        }

        if (favoriteProductIds && favoriteProductIds.length > 0) {
          const productIds = favoriteProductIds.map(f => f.product_id);
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, name, price, image')
            .in('id', productIds);

          if (productsError) {
            console.error('Error fetching favorited products:', productsError);
          } else {
            setFavorites(products as FavoriteProduct[]);
          }
        }
      } else {
        // Not logged in
        setUserId(null);
      }
      setLoading(false);
    };

    fetchUserAndFavorites();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading favorites...</div>;
  }

  if (!userId) {
    return <div className="text-center py-10">Please log in to see your favorites.</div>;
  }

  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-10 text-center">Your Favorites</h1>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {favorites.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group">
                <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden xl:aspect-w-7 xl:aspect-h-8 relative shadow-lg hover:shadow-2xl transition-shadow duration-300 h-64">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
                <p className="mt-1 text-lg font-medium text-gray-900">¥{product.price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">You have no favorite items yet.</p>
        )}
      </div>
    </div>
  );
}
