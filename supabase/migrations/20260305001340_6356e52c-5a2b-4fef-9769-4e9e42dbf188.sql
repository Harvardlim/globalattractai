
-- Remove admin override from clients table policies
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (user_id = auth.uid());

-- Remove admin override from consultations table
DROP POLICY IF EXISTS "Users can view own consultations" ON public.consultations;
CREATE POLICY "Users can view own consultations" ON public.consultations FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own consultations" ON public.consultations;
CREATE POLICY "Users can update own consultations" ON public.consultations FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own consultations" ON public.consultations;
CREATE POLICY "Users can delete own consultations" ON public.consultations FOR DELETE USING (user_id = auth.uid());

-- Remove admin override from interpretations (uses consultation ownership)
DROP POLICY IF EXISTS "Users can view interpretations for own consultations" ON public.interpretations;
CREATE POLICY "Users can view interpretations for own consultations" ON public.interpretations FOR SELECT
USING (EXISTS (SELECT 1 FROM consultations c WHERE c.id = interpretations.consultation_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete interpretations for own consultations" ON public.interpretations;
CREATE POLICY "Users can delete interpretations for own consultations" ON public.interpretations FOR DELETE
USING (EXISTS (SELECT 1 FROM consultations c WHERE c.id = interpretations.consultation_id AND c.user_id = auth.uid()));

-- Remove admin override from energy_analyses
DROP POLICY IF EXISTS "Users can view own energy_analyses" ON public.energy_analyses;
CREATE POLICY "Users can view own energy_analyses" ON public.energy_analyses FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own energy_analyses" ON public.energy_analyses;
CREATE POLICY "Users can update own energy_analyses" ON public.energy_analyses FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own energy_analyses" ON public.energy_analyses;
CREATE POLICY "Users can delete own energy_analyses" ON public.energy_analyses FOR DELETE USING (user_id = auth.uid());

-- Remove admin override from synastry_consultations
DROP POLICY IF EXISTS "Users can view own synastry_consultations" ON public.synastry_consultations;
CREATE POLICY "Users can view own synastry_consultations" ON public.synastry_consultations FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own synastry_consultations" ON public.synastry_consultations;
CREATE POLICY "Users can update own synastry_consultations" ON public.synastry_consultations FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own synastry_consultations" ON public.synastry_consultations;
CREATE POLICY "Users can delete own synastry_consultations" ON public.synastry_consultations FOR DELETE USING (user_id = auth.uid());

-- Remove admin override from synastry_interpretations
DROP POLICY IF EXISTS "Users can view synastry_interpretations for own consultations" ON public.synastry_interpretations;
CREATE POLICY "Users can view synastry_interpretations for own consultations" ON public.synastry_interpretations FOR SELECT
USING (EXISTS (SELECT 1 FROM synastry_consultations c WHERE c.id = synastry_interpretations.consultation_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete synastry_interpretations for own consultations" ON public.synastry_interpretations;
CREATE POLICY "Users can delete synastry_interpretations for own consultations" ON public.synastry_interpretations FOR DELETE
USING (EXISTS (SELECT 1 FROM synastry_consultations c WHERE c.id = synastry_interpretations.consultation_id AND c.user_id = auth.uid()));

-- Remove admin override from realtime_consultations
DROP POLICY IF EXISTS "Users can view own realtime_consultations" ON public.realtime_consultations;
CREATE POLICY "Users can view own realtime_consultations" ON public.realtime_consultations FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own realtime_consultations" ON public.realtime_consultations;
CREATE POLICY "Users can update own realtime_consultations" ON public.realtime_consultations FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own realtime_consultations" ON public.realtime_consultations;
CREATE POLICY "Users can delete own realtime_consultations" ON public.realtime_consultations FOR DELETE USING (user_id = auth.uid());

-- Remove admin override from realtime_interpretations
DROP POLICY IF EXISTS "Users can view realtime_interpretations for own consultations" ON public.realtime_interpretations;
CREATE POLICY "Users can view realtime_interpretations for own consultations" ON public.realtime_interpretations FOR SELECT
USING (EXISTS (SELECT 1 FROM realtime_consultations c WHERE c.id = realtime_interpretations.consultation_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete realtime_interpretations for own consultations" ON public.realtime_interpretations;
CREATE POLICY "Users can delete realtime_interpretations for own consultations" ON public.realtime_interpretations FOR DELETE
USING (EXISTS (SELECT 1 FROM realtime_consultations c WHERE c.id = realtime_interpretations.consultation_id AND c.user_id = auth.uid()));

-- Remove admin override from chat_conversations
DROP POLICY IF EXISTS "Users can view own chat_conversations" ON public.chat_conversations;
CREATE POLICY "Users can view own chat_conversations" ON public.chat_conversations FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own chat_conversations" ON public.chat_conversations;
CREATE POLICY "Users can update own chat_conversations" ON public.chat_conversations FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own chat_conversations" ON public.chat_conversations;
CREATE POLICY "Users can delete own chat_conversations" ON public.chat_conversations FOR DELETE USING (user_id = auth.uid());

-- Remove admin override from chat_messages
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.chat_messages;
CREATE POLICY "Users can view messages in own conversations" ON public.chat_messages FOR SELECT
USING (EXISTS (SELECT 1 FROM chat_conversations c WHERE c.id = chat_messages.conversation_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete messages in own conversations" ON public.chat_messages;
CREATE POLICY "Users can delete messages in own conversations" ON public.chat_messages FOR DELETE
USING (EXISTS (SELECT 1 FROM chat_conversations c WHERE c.id = chat_messages.conversation_id AND c.user_id = auth.uid()));
