-- Add birth and identity fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS birth_hour INTEGER CHECK (birth_hour >= 0 AND birth_hour <= 23),
ADD COLUMN IF NOT EXISTS birth_minute INTEGER DEFAULT 0 CHECK (birth_minute >= 0 AND birth_minute <= 59),
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female')),
ADD COLUMN IF NOT EXISTS id_number TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.birth_date IS 'User birth date';
COMMENT ON COLUMN public.profiles.birth_hour IS 'Birth hour (0-23), NULL if unknown';
COMMENT ON COLUMN public.profiles.birth_minute IS 'Birth minute (0-59)';
COMMENT ON COLUMN public.profiles.gender IS 'User gender: male or female';
COMMENT ON COLUMN public.profiles.id_number IS 'Identity card number';