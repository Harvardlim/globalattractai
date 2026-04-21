-- Add membership expiration to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS membership_expires_at timestamp with time zone DEFAULT NULL;

-- Create membership orders table
CREATE TABLE public.membership_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tier text NOT NULL CHECK (tier IN ('vip', 'vip_plus')),
  duration_months integer NOT NULL DEFAULT 1,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'MYR',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone DEFAULT NULL,
  approved_by uuid DEFAULT NULL
);

ALTER TABLE public.membership_orders ENABLE ROW LEVEL SECURITY;

-- Users can view own membership orders
CREATE POLICY "Users can view own membership orders"
  ON public.membership_orders FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Users can insert own membership orders
CREATE POLICY "Users can insert own membership orders"
  ON public.membership_orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can update membership orders
CREATE POLICY "Admins can update membership orders"
  ON public.membership_orders FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete membership orders
CREATE POLICY "Admins can delete membership orders"
  ON public.membership_orders FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));