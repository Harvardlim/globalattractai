
-- Add referral_code column
ALTER TABLE public.profiles ADD COLUMN referral_code text UNIQUE;

-- Generate referral codes for existing users
UPDATE public.profiles
SET referral_code = upper(substr(md5(id::text || now()::text || random()::text), 1, 6))
WHERE referral_code IS NULL;

-- Make it NOT NULL after backfill
ALTER TABLE public.profiles ALTER COLUMN referral_code SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN referral_code SET DEFAULT upper(substr(md5(gen_random_uuid()::text), 1, 6));

-- Update handle_new_user to include referral_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, source, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'source', '全球发愿'),
    upper(substr(md5(NEW.id::text || now()::text), 1, 6))
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;
