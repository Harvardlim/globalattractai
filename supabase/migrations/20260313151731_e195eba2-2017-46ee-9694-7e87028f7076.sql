
-- 1. Create platforms table
CREATE TABLE IF NOT EXISTS public.platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view platforms" ON public.platforms FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage platforms" ON public.platforms FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Create feature_controls table
CREATE TABLE IF NOT EXISTS public.feature_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text NOT NULL UNIQUE,
  feature_name text NOT NULL,
  is_globally_disabled boolean NOT NULL DEFAULT false,
  disabled_platforms text[] NOT NULL DEFAULT '{}',
  disabled_message text NOT NULL DEFAULT '即将上线',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feature_controls" ON public.feature_controls FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage feature_controls" ON public.feature_controls FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Create client_reports table
CREATE TABLE IF NOT EXISTS public.client_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  report_content text NOT NULL DEFAULT '',
  report_sections jsonb NOT NULL DEFAULT '{}',
  payment_amount numeric NOT NULL DEFAULT 0,
  payment_currency text NOT NULL DEFAULT 'MYR',
  is_paid boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'generating',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.client_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own client_reports" ON public.client_reports FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own client_reports" ON public.client_reports FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own client_reports" ON public.client_reports FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own client_reports" ON public.client_reports FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Seed default feature controls
INSERT INTO public.feature_controls (feature_key, feature_name) VALUES
  ('branch_relations', '地支关系'),
  ('bazi_encyclopedia', '八字宝典'),
  ('energy_encyclopedia', '能量宝典'),
  ('qimen_encyclopedia', '奇门宝典'),
  ('liuyao_encyclopedia', '六爻宝典'),
  ('sihai_encyclopedia', '四海宝典'),
  ('wealth_encyclopedia', '财富宝典'),
  ('spending_encyclopedia', '消费宝典'),
  ('speech_encyclopedia', '言辞宝典'),
  ('clients', '客户管理'),
  ('energy', '能量分析'),
  ('realtime', '实时盘'),
  ('destiny', '命理盘'),
  ('synastry', '合盘'),
  ('ai_chat', 'AI对话'),
  ('calendar', '日历'),
  ('flying_stars', '玄空飞星'),
  ('sihai_analysis', '四海分析'),
  ('store', '商城'),
  ('my_orders', '我的订单')
ON CONFLICT (feature_key) DO NOTHING;
