
ALTER TABLE public.products ADD COLUMN visible_platforms text[] NOT NULL DEFAULT '{}';
COMMENT ON COLUMN public.products.visible_platforms IS 'Empty array means visible to all platforms. Non-empty means only visible to listed platforms.';
