-- Product options table: admin defines selectable options per product
CREATE TABLE public.product_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  option_label TEXT NOT NULL,
  option_values TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for product_options
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product options" ON public.product_options
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage product options" ON public.product_options
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add selected_options to cart_items
ALTER TABLE public.cart_items ADD COLUMN selected_options JSONB DEFAULT '{}';

-- Add selected_options to order_items
ALTER TABLE public.order_items ADD COLUMN selected_options JSONB DEFAULT '{}';