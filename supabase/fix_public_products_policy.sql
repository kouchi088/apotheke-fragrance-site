-- Public read policy should only return published + non-deleted products.
-- Run in Supabase SQL editor.

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "public read published products" ON public.products;

CREATE POLICY "public read published products"
ON public.products FOR SELECT
TO public
USING (
  is_published = true
  AND deleted_at IS NULL
);
