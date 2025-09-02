import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();
const siteUrl = 'https://www.megurid.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Get product URLs from the database
  const { data: products, error } = await supabase.from('products').select('id');

  const productUrls = products
    ? products.map((product) => ({
        url: `${siteUrl}/products/${product.id}`,
        lastModified: new Date(),
      }))
    : [];

  if (error) {
    console.error('Error fetching products for sitemap:', error);
    // Don't block the build if products fail to fetch
  }

  // 2. Get static page URLs
  const staticRoutes = [
    '/',
    '/concept',
    '/contact',
    '/cart',
    '/favorites',
    '/legal',
    '/online-store',
    '/privacy',
    '/store',
    '/terms',
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  // 3. Combine and return all URLs
  return [...staticUrls, ...productUrls];
}
