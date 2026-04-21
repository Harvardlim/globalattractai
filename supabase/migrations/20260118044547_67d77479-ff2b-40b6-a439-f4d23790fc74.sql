-- Add birth_minute column to clients table
ALTER TABLE public.clients ADD COLUMN birth_minute integer NOT NULL DEFAULT 0;