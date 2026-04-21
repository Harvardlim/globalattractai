
-- Create enum for feature packages
CREATE TYPE public.feature_package AS ENUM ('marketing', 'numerology', 'professional_fengshui');

-- Create user feature packages table
CREATE TABLE public.user_feature_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  package_key feature_package NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, package_key)
);

-- Enable RLS
ALTER TABLE public.user_feature_packages ENABLE ROW LEVEL SECURITY;

-- Users can view their own packages
CREATE POLICY "Users can view own feature packages"
ON public.user_feature_packages
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can manage all packages
CREATE POLICY "Admins can manage all feature packages"
ON public.user_feature_packages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
