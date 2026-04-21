
-- Fix membership_orders SELECT policy to include superadmin
DROP POLICY IF EXISTS "Users can view own membership orders" ON public.membership_orders;
CREATE POLICY "Users can view own membership orders" ON public.membership_orders
  FOR SELECT TO public
  USING (
    user_id = auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'superadmin'::app_role)
  );

-- Fix membership_orders UPDATE policy to include superadmin
DROP POLICY IF EXISTS "Admins can update membership orders" ON public.membership_orders;
CREATE POLICY "Admins can update membership orders" ON public.membership_orders
  FOR UPDATE TO public
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'superadmin'::app_role)
  );

-- Fix membership_orders DELETE policy to include superadmin
DROP POLICY IF EXISTS "Admins can delete membership orders" ON public.membership_orders;
CREATE POLICY "Admins can delete membership orders" ON public.membership_orders
  FOR DELETE TO public
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'superadmin'::app_role)
  );
