
-- Drop the current policy
DROP POLICY "Admins can manage feature controls" ON public.feature_controls;

-- Recreate with superadmin only
CREATE POLICY "Superadmins can manage feature controls"
ON public.feature_controls
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));
