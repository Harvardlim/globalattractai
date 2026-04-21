
-- Update has_role function so owner is the highest tier
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        role = _role
        OR role = 'owner'
        OR (role = 'superadmin' AND _role IN ('admin', 'user'))
      )
  )
$$;

-- RLS policies for owner to see ALL data
CREATE POLICY "Owner can view all clients" ON public.clients FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Owner can view all consultations" ON public.consultations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Owner can view all interpretations" ON public.interpretations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Owner can view all energy_analyses" ON public.energy_analyses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Owner can view all realtime_consultations" ON public.realtime_consultations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Owner can view all realtime_interpretations" ON public.realtime_interpretations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Owner can view all synastry_consultations" ON public.synastry_consultations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Owner can view all synastry_interpretations" ON public.synastry_interpretations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Owner can view all chat_conversations" ON public.chat_conversations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Owner can view all chat_messages" ON public.chat_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Owner can view all client_reports" ON public.client_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Owner can view all unlocked_clients" ON public.unlocked_clients FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'::app_role));
