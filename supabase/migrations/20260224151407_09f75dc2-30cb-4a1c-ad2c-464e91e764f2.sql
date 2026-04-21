
-- Product variants table for per-option-combination inventory
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  option_values JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Admins can manage
CREATE POLICY "Admins can manage product variants"
ON public.product_variants FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view
CREATE POLICY "Anyone can view product variants"
ON public.product_variants FOR SELECT
USING (true);

-- Updated at trigger
CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to sync product quantity across same SKU
CREATE OR REPLACE FUNCTION public.sync_product_sku_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sku IS NOT NULL AND NEW.sku != '' AND (OLD.sku IS NULL OR NEW.quantity IS DISTINCT FROM OLD.quantity) THEN
    UPDATE public.products
    SET quantity = NEW.quantity
    WHERE sku = NEW.sku AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER sync_product_quantity_on_sku
AFTER UPDATE OF quantity ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.sync_product_sku_quantity();

-- Trigger to sync variant quantity across same SKU
CREATE OR REPLACE FUNCTION public.sync_variant_sku_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sku IS NOT NULL AND NEW.sku != '' AND (OLD IS NULL OR NEW.quantity IS DISTINCT FROM OLD.quantity) THEN
    UPDATE public.product_variants
    SET quantity = NEW.quantity
    WHERE sku = NEW.sku AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER sync_variant_quantity_on_sku
AFTER UPDATE OF quantity ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.sync_variant_sku_quantity();

-- Also sync on insert for variants
CREATE TRIGGER sync_variant_quantity_on_sku_insert
AFTER INSERT ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.sync_variant_sku_quantity();

-- Function to decrement variant stock
CREATE OR REPLACE FUNCTION public.decrement_variant_stock(p_variant_id uuid, p_quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_variants
  SET quantity = GREATEST(0, quantity - p_quantity)
  WHERE id = p_variant_id;
END;
$$;
