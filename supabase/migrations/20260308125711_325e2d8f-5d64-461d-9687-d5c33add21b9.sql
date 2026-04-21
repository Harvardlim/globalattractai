
-- Update profiles SELECT policy for admins: filter by platform access
-- Drop old admin view policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate: superadmin sees all, admin sees only assigned platforms
CREATE POLICY "Admins can view profiles by platform"
  ON public.profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'superadmin')
    OR (
      public.has_role(auth.uid(), 'admin')
      AND public.admin_has_platform_access(auth.uid(), source)
    )
  );

-- Update admin UPDATE policy similarly
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can update profiles by platform"
  ON public.profiles FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'superadmin')
    OR (
      public.has_role(auth.uid(), 'admin')
      AND public.admin_has_platform_access(auth.uid(), source)
    )
  );
