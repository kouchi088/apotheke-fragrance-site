-- Add product visibility columns if they do not exist yet.
-- Run this in Supabase SQL editor.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Optional index for faster storefront queries.
CREATE INDEX IF NOT EXISTS idx_products_visibility
  ON public.products (is_published, deleted_at);
