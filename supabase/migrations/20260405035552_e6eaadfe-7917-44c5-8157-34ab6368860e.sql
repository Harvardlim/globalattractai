
CREATE TABLE public.referral_income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.referral_applications(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  tier TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'MYR',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_income ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all referral income"
ON public.referral_income
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own referral income"
ON public.referral_income
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
