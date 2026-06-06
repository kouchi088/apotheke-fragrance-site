import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const collectionRouteSource = readFileSync(new URL('./route.ts', import.meta.url), 'utf8');
const itemRouteSource = readFileSync(new URL('./[id]/route.ts', import.meta.url), 'utf8');

test('admin product APIs accept the new arrivals flag', () => {
  assert.match(collectionRouteSource, /is_new_arrival/);
  assert.match(itemRouteSource, /is_new_arrival/);
});

test('admin product APIs accept product image fields', () => {
  assert.match(collectionRouteSource, /image: body\.image/);
  assert.match(collectionRouteSource, /images: Array\.isArray\(body\.images\)/);
  assert.match(itemRouteSource, /'image'/);
  assert.match(itemRouteSource, /'images'/);
});
