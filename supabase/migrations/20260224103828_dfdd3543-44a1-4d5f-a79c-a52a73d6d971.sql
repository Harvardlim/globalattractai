
-- Add selling_price to products (optional discount price)
ALTER TABLE public.products ADD COLUMN selling_price numeric NULL;

-- Create coupons table
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL,
  min_order_amount numeric NOT NULL DEFAULT 0,
  max_uses integer NULL,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamp with time zone NULL,
  expires_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Admins can manage coupons
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view active coupons (for validation)
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT
  USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
