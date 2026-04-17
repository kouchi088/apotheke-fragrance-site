import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { buildImageUrl, defaultOgImage } from './seo.ts';

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

afterEach(() => {
  if (originalSupabaseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    return;
  }

  process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
});

test('keeps absolute image URLs unchanged', () => {
  const absoluteUrl = 'https://qkdyqzoptuiorjqxrqex.supabase.co/storage/v1/object/public/products/sample.jpg';

  assert.equal(buildImageUrl(absoluteUrl), absoluteUrl);
});

test('removes an accidentally prefixed site URL from absolute image URLs', () => {
  const malformedUrl =
    'https://www.megurid.comhttps://qkdyqzoptuiorjqxrqex.supabase.co/storage/v1/object/public/products/sample.jpg';
  const expectedUrl =
    'https://qkdyqzoptuiorjqxrqex.supabase.co/storage/v1/object/public/products/sample.jpg';

  assert.equal(buildImageUrl(malformedUrl), expectedUrl);
});

test('builds supabase storage image URLs from relative storage paths', () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://qkdyqzoptuiorjqxrqex.supabase.co';

  assert.equal(
    buildImageUrl('/storage/v1/object/public/products/sample.jpg'),
    'https://qkdyqzoptuiorjqxrqex.supabase.co/storage/v1/object/public/products/sample.jpg',
  );
});

test('points the default OG image at the dedicated og-image asset', () => {
  assert.match(defaultOgImage, /\/og-image\.jpg$/);
});
