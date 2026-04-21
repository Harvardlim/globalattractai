
-- Update default source in profiles table
ALTER TABLE public.profiles ALTER COLUMN source SET DEFAULT '全球发愿';

-- Update handle_new_user function to use new default
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, source)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'source', '全球发愿')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;

-- Update existing 'public' source members to '全球发愿'
UPDATE public.profiles SET source = '全球发愿' WHERE source = 'public';

-- Ensure 全球发愿 platform exists
INSERT INTO public.platforms (name) VALUES ('全球发愿') ON CONFLICT DO NOTHING;

-- Remove public platform if it exists
DELETE FROM public.platforms WHERE name = 'public';
