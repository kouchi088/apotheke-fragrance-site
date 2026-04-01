-- Harden public.products so the storefront can read published items
-- without exposing writes or unpublished/deleted rows.
-- Safe to re-run in Supabase SQL Editor.

ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- Keep policy names stable and remove older broad public-read variants.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "public read published products" ON public.products;

CREATE POLICY "public read published products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (
  is_published = true
  AND deleted_at IS NULL
);

-- Defense in depth: the storefront does not need direct writes on products.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
ON TABLE public.products
FROM anon, authenticated;

GRANT SELECT
ON TABLE public.products
TO anon, authenticated;
