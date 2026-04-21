-- Create table to track unlocked client readings for normal members
CREATE TABLE public.unlocked_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_amount DECIMAL(10,2) NOT NULL DEFAULT 19.90,
  payment_currency TEXT NOT NULL DEFAULT 'MYR',
  UNIQUE(user_id, client_id)
);

-- Enable RLS
ALTER TABLE public.unlocked_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own unlocked clients"
ON public.unlocked_clients
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own unlocked clients"
ON public.unlocked_clients
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Index for faster lookups
CREATE INDEX idx_unlocked_clients_user_client ON public.unlocked_clients(user_id, client_id);