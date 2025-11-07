-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- 1. Affiliates Table
-- Stores information about each affiliate partner.
CREATE TABLE affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    default_rate_type TEXT NOT NULL DEFAULT 'percentage' CHECK (default_rate_type IN ('percentage', 'fixed')),
    default_rate_value NUMERIC NOT NULL DEFAULT 0.1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE affiliates IS 'Stores information about affiliate partners.';
CREATE INDEX ON affiliates(email);

-- 2. Affiliate Links Table
-- Stores unique links for each affiliate.
CREATE TABLE affiliate_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE, -- The unique code in the URL, e.g., ?aff=CODE
    landing_url TEXT NOT NULL DEFAULT '/',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE affiliate_links IS 'Stores unique links generated for each affiliate.';
CREATE INDEX ON affiliate_links(affiliate_id);
CREATE INDEX ON affiliate_links(code);

-- 3. Affiliate Clicks Table
-- Tracks each time an affiliate link is clicked.
CREATE TABLE affiliate_clicks (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    link_id UUID REFERENCES affiliate_links(id) ON DELETE SET NULL,
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    ip_hash TEXT, -- Anonymized IP address
    ua_hash TEXT, -- Anonymized User Agent
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE affiliate_clicks IS 'Tracks each click on an affiliate link for analytics.';
CREATE INDEX ON affiliate_clicks(affiliate_id);
CREATE INDEX ON affiliate_clicks(link_id);

-- 4. Order-Affiliate Association Table
-- Links an order to an affiliate if the purchase was referred.
CREATE TABLE order_affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL, -- Assuming your existing orders table has a TEXT id.
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
    link_id UUID REFERENCES affiliate_links(id) ON DELETE SET NULL,
    commission_amount NUMERIC NOT NULL,
    commission_rate NUMERIC,
    commission_type TEXT NOT NULL CHECK (commission_type IN ('percentage', 'fixed')),
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE order_affiliates IS 'Associates an order with an affiliate and records the calculated commission.';
CREATE INDEX ON order_affiliates(order_id);
CREATE INDEX ON order_affiliates(affiliate_id);

-- 5. Payouts Table
-- Records payments made to affiliates.
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
    amount NUMERIC NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    memo TEXT
);
COMMENT ON TABLE payouts IS 'Records commission payout history for affiliates.';
CREATE INDEX ON payouts(affiliate_id);

-- Enable Row Level Security for all new tables
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
-- NOTE: These are basic policies. We will refine them later based on your admin authentication logic.

-- Admins can do anything.
CREATE POLICY "Allow admin full access on affiliates" ON affiliates FOR ALL USING (true);
CREATE POLICY "Allow admin full access on affiliate_links" ON affiliate_links FOR ALL USING (true);
CREATE POLICY "Allow admin full access on order_affiliates" ON order_affiliates FOR ALL USING (true);
CREATE POLICY "Allow admin full access on payouts" ON payouts FOR ALL USING (true);

-- For affiliate_clicks, we need to allow public inserts (for tracking) and admin reads.
CREATE POLICY "Allow public insert on affiliate_clicks" ON affiliate_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin read access on affiliate_clicks" ON affiliate_clicks FOR SELECT USING (true);
