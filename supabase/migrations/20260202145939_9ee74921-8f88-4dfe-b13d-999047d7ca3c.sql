-- Drop the old constraint and recreate with all allowed topics
ALTER TABLE public.consultations DROP CONSTRAINT IF EXISTS consultations_topic_check;

-- Add updated constraint with all topics from ANALYSIS_TOPICS
ALTER TABLE public.consultations ADD CONSTRAINT consultations_topic_check 
CHECK (topic IS NULL OR topic = ANY (ARRAY['健康'::text, '财富'::text, '关系'::text, '轨道'::text, '学业'::text, '家庭'::text, '贵人'::text, '风险'::text, '综合'::text]));