
DROP POLICY "Admins can manage product categories" ON public.product_categories;
CREATE POLICY "Admins can manage product categories"
ON public.product_categories
FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));
