CREATE TABLE IF NOT EXISTS public.admin_platform_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform_name)
);

ALTER TABLE public.admin_platform_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage admin_platform_access"
  ON public.admin_platform_access
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admins can view own platform access"
  ON public.admin_platform_access
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));