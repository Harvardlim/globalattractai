
-- Feature controls table for managing feature/book visibility per platform
CREATE TABLE public.feature_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text NOT NULL UNIQUE,
  feature_name text NOT NULL,
  is_globally_disabled boolean NOT NULL DEFAULT false,
  disabled_platforms text[] NOT NULL DEFAULT '{}',
  disabled_message text NOT NULL DEFAULT '即将上线',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_controls ENABLE ROW LEVEL SECURITY;

-- Anyone can read feature controls (needed for UI)
CREATE POLICY "Anyone can view feature controls"
ON public.feature_controls FOR SELECT
TO public
USING (true);

-- Admins can manage feature controls
CREATE POLICY "Admins can manage feature controls"
ON public.feature_controls FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Updated at trigger
CREATE TRIGGER update_feature_controls_updated_at
  BEFORE UPDATE ON public.feature_controls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
