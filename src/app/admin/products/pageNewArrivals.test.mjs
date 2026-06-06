import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');

test('admin products page exposes a new arrivals toggle', () => {
  assert.match(pageSource, /updateNewArrivalStatus/);
  assert.match(pageSource, /is_new_arrival/);
  assert.match(pageSource, /New Arrivals/);
});
