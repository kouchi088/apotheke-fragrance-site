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

test('homepage keeps new arrivals filtering when only deleted_at is missing', () => {
  const firstFallbackQuery = pageSource.match(
    /if \(error\?\.code === '42703'\) \{[\s\S]*?\.from\('products'\)[\s\S]*?\.limit\(3\)\);/,
  )?.[0];

  assert.ok(firstFallbackQuery, 'expected to find the first products fallback query');
  assert.match(firstFallbackQuery, /\.eq\('is_new_arrival', true\)/);
  assert.doesNotMatch(firstFallbackQuery, /\.is\('deleted_at', null\)/);
});
