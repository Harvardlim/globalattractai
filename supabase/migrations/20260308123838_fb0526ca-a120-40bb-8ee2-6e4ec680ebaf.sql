-- 1. Create the missing trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Backfill profiles for existing users missing them
INSERT INTO public.profiles (id, email, display_name, source)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'source', 'public')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT DO NOTHING;

-- 3. Backfill user_roles for existing users missing them
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id)
ON CONFLICT DO NOTHING;