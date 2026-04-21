
-- Drop the old admin-only policy
DROP POLICY "Admins can manage feature controls" ON public.feature_controls;

-- Recreate with both admin and superadmin
CREATE POLICY "Admins can manage feature controls"
ON public.feature_controls
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));
