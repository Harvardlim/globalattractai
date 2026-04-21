-- Fix category_settings policies to require authenticated users
-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own category settings" ON public.category_settings;
DROP POLICY IF EXISTS "Users can update own category settings" ON public.category_settings;
DROP POLICY IF EXISTS "Users can view own category settings" ON public.category_settings;

-- Recreate policies with authenticated role
CREATE POLICY "Users can insert own category settings"
ON public.category_settings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own category settings"
ON public.category_settings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view own category settings"
ON public.category_settings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add DELETE policy (was missing)
CREATE POLICY "Users can delete own category settings"
ON public.category_settings
FOR DELETE
TO authenticated
USING (user_id = auth.uid());