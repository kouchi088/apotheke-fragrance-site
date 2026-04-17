import type { Metadata } from 'next';
import React from 'react';
import { createClient } from '@/lib/supabaseClient';
import LandingPageClient from '@/components/LandingPageClient';
import { getLatestColumn } from '@/lib/columns';
import { buildAbsoluteUrl, defaultOgImage, siteName, siteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const homeTitle = 'MEGURID | モルタルの静かな日用品';
const homeDescription =
  'meguridは、コンクリート・モルタルで作られたミニマルな日用品ブランドです。トレイ・灰皿・香炉スタンドなど、空間に静けさをもたらすプロダクトを販売しています。';
const homeOgDescription = 'コンクリート・モルタルで作られたミニマルな日用品ブランド。';

export const metadata: Metadata = {
  title: {
    absolute: homeTitle,
  },
  description: homeDescription,
  alternates: {
    canonical: buildAbsoluteUrl('/'),
  },
  openGraph: {
    title: homeTitle,
    description: homeOgDescription,
    url: buildAbsoluteUrl('/'),
    siteName,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: homeTitle,
    description: homeOgDescription,
    images: [defaultOgImage],
  },
};

// --- Page Component (Server Component) ---
export default async function LandingPage() {
  const supabase = createClient();
  const latestColumn = getLatestColumn();
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    alternateName: 'megurid',
    url: siteUrl,
    description: homeDescription,
    inLanguage: 'ja-JP',
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
  };

  let productsQuery = supabase
    .from('products')
    .select('id, name, price, images, description, stock_quantity')
    .eq('is_published', true)
    .is('deleted_at', null)
    .limit(3);
  let { data: products, error } = await productsQuery;
  if (error?.code === '42703') {
    ({ data: products, error } = await supabase
      .from('products')
      .select('id, name, price, images, description, stock_quantity')
      .eq('is_published', true)
      .limit(3));
  }
  if (error?.code === '42703') {
    ({ data: products, error } = await supabase
      .from('products')
      .select('id, name, price, images, description, stock_quantity')
      .limit(3));
  }

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

  let featuredQuery = supabase
    .from('products')
    .select('id, name, price, images, description, stock_quantity')
    .eq('is_published', true)
    .is('deleted_at', null)
    .eq('is_featured', true)
    .limit(3);
  let { data: featuredProducts, error: featuredProductsError } = await featuredQuery;
  if (featuredProductsError?.code === '42703') {
    ({ data: featuredProducts, error: featuredProductsError } = await supabase
      .from('products')
      .select('id, name, price, images, description, stock_quantity')
      .eq('is_published', true)
      .eq('is_featured', true)
      .limit(3));
  }
  if (featuredProductsError?.code === '42703') {
    ({ data: featuredProducts, error: featuredProductsError } = await supabase
      .from('products')
      .select('id, name, price, images, description, stock_quantity')
      .eq('is_featured', true)
      .limit(3));
  }

  if (featuredProductsError) {
    console.error('Error fetching featured products for LP:', featuredProductsError);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <h1 className="sr-only">{homeTitle}</h1>
      <LandingPageClient
        products={products || []}
        reviews={reviews || []}
        featuredProducts={featuredProducts || []}
        latestColumn={latestColumn}
      />
    </>
  );
}
