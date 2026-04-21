
-- 2. Create platforms table
CREATE TABLE public.platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed with existing sources
INSERT INTO public.platforms (name) VALUES ('public'), ('易商平台') ON CONFLICT (name) DO NOTHING;

-- 3. Create admin_platform_access table
CREATE TABLE public.admin_platform_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform_name)
);

-- 4. RLS for platforms
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can manage platforms"
  ON public.platforms FOR ALL
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins can view platforms"
  ON public.platforms FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- 5. RLS for admin_platform_access
ALTER TABLE public.admin_platform_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can manage all platform access"
  ON public.admin_platform_access FOR ALL
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins can view own platform access"
  ON public.admin_platform_access FOR SELECT
  USING (user_id = auth.uid());

-- 6. Helper function: check if admin has access to a platform
CREATE OR REPLACE FUNCTION public.admin_has_platform_access(_user_id uuid, _platform text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.has_role(_user_id, 'superadmin')
    OR EXISTS (
      SELECT 1
      FROM public.admin_platform_access
      WHERE user_id = _user_id
        AND platform_name = _platform
    )
$$;
