'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext'; // ★追加

interface FavoriteButtonProps {
  productId: string;
}

const supabase = createClient();

export default function FavoriteButton({ productId }: FavoriteButtonProps) {
  const { user } = useAuth(); // ★変更
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ユーザーがいない、またはユーザーIDがない場合は何もしない
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchFavoriteStatus = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_favorites')
        .select('product_id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching favorite status:', error);
      } else {
        setIsFavorited(!!data);
      }
      setIsLoading(false);
    };

    fetchFavoriteStatus();
  }, [user, productId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      alert('Please log in to add favorites.');
      return;
    }

    if (isFavorited) {
      // Remove from favorites
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Error removing favorite:', error);
      } else {
        setIsFavorited(false);
      }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('user_favorites')
        .insert([{ user_id: user.id, product_id: productId }]);

      if (error) {
        console.error('Error adding favorite:', error);
      } else {
        setIsFavorited(true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="absolute top-2 right-2 bg-gray-200 rounded-full p-2 animate-pulse">
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>
      </div>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      className="absolute top-2 right-2 bg-white rounded-full p-2 z-10 shadow-md hover:bg-gray-100 transition"
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`w-6 h-6 ${isFavorited ? 'text-red-500' : 'text-gray-400'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        ></path>
      </svg>
    </button>
  );
}
