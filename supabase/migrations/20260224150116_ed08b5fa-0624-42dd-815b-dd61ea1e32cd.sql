
ALTER TABLE public.products ADD COLUMN is_bundle boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN bundle_quantity integer NOT NULL DEFAULT 1;
