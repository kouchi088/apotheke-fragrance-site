-- MEGURID admin schema (affiliate/product/content/settings)
CREATE TYPE admin_role AS ENUM ('OWNER','ADMIN','EDITOR','ANALYST');
CREATE TYPE affiliate_status AS ENUM ('ACTIVE','INACTIVE');
CREATE TYPE commission_type AS ENUM ('PERCENTAGE','FIXED');
CREATE TYPE commission_status AS ENUM ('PENDING','APPROVED','PAID','REVERSED');
CREATE TYPE content_status AS ENUM ('DRAFT','PENDING','APPROVED','REJECTED','PUBLISHED','ARCHIVED');

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role admin_role NOT NULL DEFAULT 'ANALYST',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  code TEXT UNIQUE NOT NULL,
  status affiliate_status NOT NULL DEFAULT 'ACTIVE',
  commission_type commission_type NOT NULL DEFAULT 'PERCENTAGE',
  commission_value NUMERIC(10,2) NOT NULL DEFAULT 10.00,
  payout_term_days INT NOT NULL DEFAULT 30,
  note TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  code TEXT NOT NULL,
  destination_path TEXT NOT NULL DEFAULT '/',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  link_id UUID REFERENCES affiliate_links(id),
  ip_hash TEXT NOT NULL,
  ua_hash TEXT NOT NULL,
  referrer TEXT,
  landed_path TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  order_id UUID NOT NULL,
  base_amount NUMERIC(12,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  status commission_status NOT NULL DEFAULT 'PENDING',
  approved_by UUID REFERENCES admin_users(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description_md TEXT,
  description_html TEXT,
  price NUMERIC(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'JPY',
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  seo_canonical TEXT,
  structured_data JSONB,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ugc_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT,
  author_handle TEXT,
  media_url TEXT,
  caption TEXT,
  status content_status NOT NULL DEFAULT 'PENDING',
  reject_reason TEXT,
  placement TEXT,
  priority INT NOT NULL DEFAULT 50 CHECK (priority BETWEEN 1 AND 100),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content_md TEXT,
  content_html TEXT,
  status content_status NOT NULL DEFAULT 'DRAFT',
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  seo_canonical TEXT,
  og_image_url TEXT,
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_admin_id UUID REFERENCES admin_users(id),
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_data JSONB,
  after_data JSONB,
  ip_hash TEXT,
  ua_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
