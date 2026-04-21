CREATE POLICY "Anyone can view platforms for registration"
ON public.platforms
FOR SELECT
TO anon, authenticated
USING (true);