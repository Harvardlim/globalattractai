
CREATE TABLE public.coupon_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  used_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id)
);

ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupon usages" ON public.coupon_usages
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own coupon usages" ON public.coupon_usages
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all coupon usages" ON public.coupon_usages
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
