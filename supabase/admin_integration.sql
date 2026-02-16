-- Run in Supabase SQL editor
-- 0) First run /Users/kou/concrete-lab/megurid/admin_schema.sql
-- 1) Then run this file

-- 2) Enable RLS tables for admin surfaces
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ugc_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 3) Helper function
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.auth_user_id = uid
      AND au.is_active = true
  );
$$;

-- 4) Read policies
DROP POLICY IF EXISTS "admin read affiliates" ON affiliates;
CREATE POLICY "admin read affiliates" ON affiliates FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin read products" ON products;
CREATE POLICY "admin read products" ON products FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin read ugc" ON ugc_posts;
CREATE POLICY "admin read ugc" ON ugc_posts FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin read blog" ON blog_posts;
CREATE POLICY "admin read blog" ON blog_posts FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin read settings" ON system_settings;
CREATE POLICY "admin read settings" ON system_settings FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin read logs" ON audit_logs;
CREATE POLICY "admin read logs" ON audit_logs FOR SELECT
USING (public.is_admin(auth.uid()));

-- 5) Write policies (admin only)
DROP POLICY IF EXISTS "admin write affiliates" ON affiliates;
CREATE POLICY "admin write affiliates" ON affiliates FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin write products" ON products;
CREATE POLICY "admin write products" ON products FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin write ugc" ON ugc_posts;
CREATE POLICY "admin write ugc" ON ugc_posts FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin write blog" ON blog_posts;
CREATE POLICY "admin write blog" ON blog_posts FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin write settings" ON system_settings;
CREATE POLICY "admin write settings" ON system_settings FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin write logs" ON audit_logs;
CREATE POLICY "admin write logs" ON audit_logs FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 6) Bootstrap example (replace with your auth user id)
-- INSERT INTO admin_users (auth_user_id, email, role, is_active)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'OWNER', true)
-- ON CONFLICT (auth_user_id) DO UPDATE SET role = EXCLUDED.role, is_active = true;
