import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const sql = readFileSync(new URL('./add_new_arrivals_selection_column.sql', import.meta.url), 'utf8');

test('new arrivals SQL works on products tables without updated_at', () => {
  assert.doesNotMatch(sql, /updated_at/i);
  assert.match(sql, /ADD COLUMN IF NOT EXISTS is_new_arrival/);
});
