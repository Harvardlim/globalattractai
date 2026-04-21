-- Create table to store user's custom category order
CREATE TABLE public.category_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_order TEXT[] NOT NULL DEFAULT ARRAY['自己', '家人', '朋友', '客户', '其他']::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.category_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own category settings"
ON public.category_settings
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own category settings"
ON public.category_settings
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own category settings"
ON public.category_settings
FOR UPDATE
USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_category_settings_updated_at
BEFORE UPDATE ON public.category_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();