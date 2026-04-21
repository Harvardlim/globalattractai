-- Allow birth_hour to be nullable for clients who don't know their birth time
-- First, drop the existing constraint if it exists
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_birth_hour_check;

-- Alter birth_hour column to allow null values
ALTER TABLE public.clients ALTER COLUMN birth_hour DROP NOT NULL;

-- Add back the check constraint for valid hour values (0-23) when not null
ALTER TABLE public.clients ADD CONSTRAINT clients_birth_hour_check 
  CHECK (birth_hour IS NULL OR (birth_hour >= 0 AND birth_hour <= 23));