import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');

test('admin products page exposes a new arrivals toggle', () => {
  assert.match(pageSource, /updateNewArrivalStatus/);
  assert.match(pageSource, /is_new_arrival/);
  assert.match(pageSource, /New Arrivals/);
});

test('admin products keeps the new arrivals column when only deleted_at is missing', () => {
  const firstFallbackQuery = pageSource.match(
    /if \(error\?\.code === '42703'\) \{[\s\S]*?\.from\('products'\)[\s\S]*?\.limit\(100\)\);/,
  )?.[0];

  assert.ok(firstFallbackQuery, 'expected to find the first admin products fallback query');
  assert.match(firstFallbackQuery, /is_new_arrival/);
  assert.doesNotMatch(firstFallbackQuery, /\.is\('deleted_at', null\)/);
});

test('admin products keeps the new arrivals column when created_at is missing', () => {
  const newArrivalFallbacks = Array.from(
    pageSource.matchAll(/if \(error\?\.code === '42703'\) \{[\s\S]*?\.from\('products'\)[\s\S]*?\.limit\(100\)\);/g),
    (match) => match[0],
  ).filter((query) => query.includes('is_new_arrival'));
  const noCreatedAtFallback = newArrivalFallbacks.find((query) => !query.includes(".order('created_at'"));

  assert.ok(noCreatedAtFallback, 'expected an admin products fallback without created_at ordering');
});
