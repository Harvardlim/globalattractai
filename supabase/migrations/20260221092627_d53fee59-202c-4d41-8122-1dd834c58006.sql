
-- Add weight column to products table for shipping calculation
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS weight_kg numeric NOT NULL DEFAULT 1;
