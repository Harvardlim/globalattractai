
-- Create referral tier enum
CREATE TYPE public.referral_tier AS ENUM ('promoter', 'super_promoter', 'starlight', 'king');

-- Add referral columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN referred_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN referral_tier referral_tier;

-- Create referral applications table
CREATE TABLE public.referral_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  requested_tier referral_tier NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_applications ENABLE ROW LEVEL SECURITY;

-- Users can view own applications
CREATE POLICY "Users can view own referral applications"
  ON public.referral_applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert own applications
CREATE POLICY "Users can insert own referral applications"
  ON public.referral_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can view all applications
CREATE POLICY "Admins can view all referral applications"
  ON public.referral_applications FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update applications (approve/reject)
CREATE POLICY "Admins can update referral applications"
  ON public.referral_applications FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete applications
CREATE POLICY "Admins can delete referral applications"
  ON public.referral_applications FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Update trigger for updated_at
CREATE TRIGGER update_referral_applications_updated_at
  BEFORE UPDATE ON public.referral_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user to capture referred_by from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_referrer_id uuid;
  v_ref_code text;
BEGIN
  -- Check if registration has a referral code
  v_ref_code := NEW.raw_user_meta_data->>'referral_code';
  
  IF v_ref_code IS NOT NULL AND v_ref_code != '' THEN
    SELECT id INTO v_referrer_id
    FROM public.profiles
    WHERE referral_code = upper(v_ref_code)
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, display_name, source, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'source', '全球发愿'),
    upper(substr(md5(NEW.id::text || now()::text), 1, 6)),
    v_referrer_id
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;
