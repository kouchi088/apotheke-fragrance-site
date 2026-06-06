import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');

test('homepage new arrivals query returns selected products first', () => {
  const newArrivalsQuery = pageSource.match(
    /let productsQuery = supabase[\s\S]*?\.from\('products'\)[\s\S]*?\.limit\(3\);/,
  )?.[0];

  assert.ok(newArrivalsQuery, 'expected to find the homepage products query');
  assert.match(newArrivalsQuery, /\.eq\('is_new_arrival', true\)/);
  assert.match(newArrivalsQuery, /\.order\('created_at', \{ ascending: false \}\)/);
});
