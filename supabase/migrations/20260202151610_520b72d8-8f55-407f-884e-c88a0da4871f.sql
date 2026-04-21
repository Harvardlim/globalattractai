-- Add a separate title column for consultations to avoid overloading topic
ALTER TABLE public.consultations
ADD COLUMN IF NOT EXISTS title text;

-- Optional: index to speed up history list queries
CREATE INDEX IF NOT EXISTS idx_consultations_user_client_created_at
ON public.consultations (user_id, client_id, created_at DESC);
