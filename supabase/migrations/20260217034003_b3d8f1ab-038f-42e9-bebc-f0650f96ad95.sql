
-- Feature whitelist table: controls per-user access to specific features
CREATE TABLE public.feature_whitelist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_key)
);

-- Enable RLS
ALTER TABLE public.feature_whitelist ENABLE ROW LEVEL SECURITY;

-- Users can read their own whitelist entries
CREATE POLICY "Users can view their own feature whitelist"
ON public.feature_whitelist
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all whitelist entries
CREATE POLICY "Admins can manage all whitelist entries"
ON public.feature_whitelist
FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Trigger for updated_at
CREATE TRIGGER update_feature_whitelist_updated_at
BEFORE UPDATE ON public.feature_whitelist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_feature_whitelist_user_feature ON public.feature_whitelist(user_id, feature_key);
