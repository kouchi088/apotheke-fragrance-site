-- Add manual New Arrivals selection to products.
-- Run this in Supabase SQL Editor.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_products_new_arrivals
  ON public.products (is_new_arrival, is_published, deleted_at, updated_at DESC);
