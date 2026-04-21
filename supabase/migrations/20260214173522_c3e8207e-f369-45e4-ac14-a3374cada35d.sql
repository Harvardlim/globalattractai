
-- 合盘咨询记录
CREATE TABLE public.synastry_consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id_1 uuid NOT NULL,
  client_id_2 uuid NOT NULL,
  chart_data_1 jsonb NOT NULL,
  chart_data_2 jsonb NOT NULL,
  title text,
  topic text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.synastry_consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own synastry_consultations"
  ON public.synastry_consultations FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own synastry_consultations"
  ON public.synastry_consultations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own synastry_consultations"
  ON public.synastry_consultations FOR UPDATE
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own synastry_consultations"
  ON public.synastry_consultations FOR DELETE
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- 合盘AI对话记录
CREATE TABLE public.synastry_interpretations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES public.synastry_consultations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.synastry_interpretations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view synastry_interpretations for own consultations"
  ON public.synastry_interpretations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM synastry_consultations c
    WHERE c.id = synastry_interpretations.consultation_id
    AND (c.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));

CREATE POLICY "Users can insert synastry_interpretations for own consultations"
  ON public.synastry_interpretations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM synastry_consultations c
    WHERE c.id = synastry_interpretations.consultation_id
    AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete synastry_interpretations for own consultations"
  ON public.synastry_interpretations FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM synastry_consultations c
    WHERE c.id = synastry_interpretations.consultation_id
    AND (c.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));

-- 数字能量分析记录
CREATE TABLE public.energy_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  input_number text NOT NULL,
  analysis_data jsonb NOT NULL,
  title text,
  client_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.energy_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own energy_analyses"
  ON public.energy_analyses FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own energy_analyses"
  ON public.energy_analyses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own energy_analyses"
  ON public.energy_analyses FOR UPDATE
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own energy_analyses"
  ON public.energy_analyses FOR DELETE
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
