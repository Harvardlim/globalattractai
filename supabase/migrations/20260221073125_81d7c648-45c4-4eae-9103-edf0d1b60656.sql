
-- Add shipping address fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS shipping_first_name TEXT,
  ADD COLUMN IF NOT EXISTS shipping_last_name TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address2 TEXT,
  ADD COLUMN IF NOT EXISTS shipping_city TEXT,
  ADD COLUMN IF NOT EXISTS shipping_state TEXT,
  ADD COLUMN IF NOT EXISTS shipping_postcode TEXT,
  ADD COLUMN IF NOT EXISTS shipping_country TEXT DEFAULT 'Malaysia';
