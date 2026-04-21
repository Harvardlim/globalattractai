-- Drop the incorrect check constraint
ALTER TABLE public.clients DROP CONSTRAINT clients_birth_hour_check;

-- Add the correct check constraint for 24-hour format (0-23)
ALTER TABLE public.clients ADD CONSTRAINT clients_birth_hour_check CHECK (birth_hour >= 0 AND birth_hour <= 23);