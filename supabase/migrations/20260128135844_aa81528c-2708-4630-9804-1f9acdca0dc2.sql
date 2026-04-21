-- Add category column to clients table
ALTER TABLE public.clients
ADD COLUMN category text DEFAULT '其他';

-- Create index for category filtering
CREATE INDEX idx_clients_category ON public.clients(category);