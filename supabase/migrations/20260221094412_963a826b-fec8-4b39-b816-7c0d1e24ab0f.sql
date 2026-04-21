
-- Add category column to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category text DEFAULT '未分类';

-- Create product_categories table for admin-managed categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
CREATE POLICY "Anyone can view product categories" ON public.product_categories
  FOR SELECT USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage product categories" ON public.product_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default category
INSERT INTO public.product_categories (name, sort_order) VALUES ('未分类', 0) ON CONFLICT (name) DO NOTHING;
