
-- Referral commissions: tracks each commission earned
CREATE TABLE public.referral_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referee_id uuid NOT NULL,
  source_type text NOT NULL DEFAULT 'membership_order',
  source_id uuid,
  commission_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'MYR',
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own commissions" ON public.referral_commissions
  FOR SELECT TO authenticated
  USING (referrer_id = auth.uid());

CREATE POLICY "Admins can view all commissions" ON public.referral_commissions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admins can insert commissions" ON public.referral_commissions
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update commissions" ON public.referral_commissions
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete commissions" ON public.referral_commissions
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_referral_commissions_updated_at
  BEFORE UPDATE ON public.referral_commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Referral payouts: tracks payments made to referrers
CREATE TABLE public.referral_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'MYR',
  notes text,
  paid_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payouts" ON public.referral_payouts
  FOR SELECT TO authenticated
  USING (referrer_id = auth.uid());

CREATE POLICY "Admins can view all payouts" ON public.referral_payouts
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admins can insert payouts" ON public.referral_payouts
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admins can update payouts" ON public.referral_payouts
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admins can delete payouts" ON public.referral_payouts
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role));
