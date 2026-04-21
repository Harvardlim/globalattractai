
-- Client reports table
CREATE TABLE public.client_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  report_content text NOT NULL,
  report_sections jsonb NOT NULL DEFAULT '{}',
  payment_amount numeric NOT NULL DEFAULT 0,
  payment_currency text NOT NULL DEFAULT 'MYR',
  is_paid boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'generating',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own reports" ON public.client_reports
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own reports" ON public.client_reports
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reports" ON public.client_reports
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reports" ON public.client_reports
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all
CREATE POLICY "Admins can view all reports" ON public.client_reports
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));
