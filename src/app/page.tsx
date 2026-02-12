import React from 'react';
import { createClient } from '@/lib/supabaseClient';
import LandingPageClient from '@/components/LandingPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- Page Component (Server Component) ---
export default async function LandingPage() {
  const supabase = createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, images, description, stock_quantity')
    .limit(3);

  if (error) {
    console.error('Error fetching products for LP:', error);
  }

  const { data: reviews, error: reviewsError } = await supabase
    .from('user_content')
    .select(`
      id,
      user_name,
      rating,
      review_text,
      created_at,
      content_images (image_path),
      products (name)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(3);

  if (reviewsError) {
    console.error('Error fetching reviews for LP:', reviewsError);
  }

  const { data: featuredProducts, error: featuredProductsError } = await supabase
    .from('products')
    .select('id, name, price, images, description, stock_quantity')
    .eq('is_featured', true)
    .limit(3);

  if (featuredProductsError) {
    console.error('Error fetching featured products for LP:', featuredProductsError);
  }

  return (
    <LandingPageClient 
      products={products || []} 
      reviews={reviews || []} 
      featuredProducts={featuredProducts || []}
    />
  );
}
