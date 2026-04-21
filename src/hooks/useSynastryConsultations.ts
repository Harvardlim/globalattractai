import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChartData } from '@/types';

export interface SynastryConsultation {
  id: string;
  client_id_1: string;
  client_id_2: string;
  chart_data_1: any;
  chart_data_2: any;
  title: string | null;
  topic: string | null;
  created_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function useSynastryConsultations() {
  const { user } = useAuth();
  const [history, setHistory] = useState<SynastryConsultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setError('请先登录');
      setHasAttempted(true);
      setHistory([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await (supabase as any)
        .from('synastry_consultations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (err) throw err;
      setHistory(data || []);
    } catch (err: any) {
      setError(err?.message || '加载失败');
    } finally {
      setLoading(false);
      setHasAttempted(true);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchHistory();
    else {
      setHistory([]);
      setHasAttempted(false);
    }
  }, [user?.id]);

  const saveConsultation = useCallback(async (
    clientId1: string,
    clientId2: string,
    chartData1: ChartData,
    chartData2: ChartData,
    title?: string,
    topic?: string
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await (supabase as any)
        .from('synastry_consultations')
        .insert({
          user_id: user.id,
          client_id_1: clientId1,
          client_id_2: clientId2,
          chart_data_1: chartData1,
          chart_data_2: chartData2,
          title: title || null,
          topic: topic || null,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (err) {
      console.error('Failed to save synastry consultation:', err);
      return null;
    }
  }, [user]);

  const saveMessage = useCallback(async (
    consultationId: string,
    role: string,
    content: string
  ): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('synastry_interpretations')
        .insert({ consultation_id: consultationId, role, content });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to save synastry message:', err);
      return false;
    }
  }, []);

  const loadConsultation = useCallback(async (
    consultationId: string
  ): Promise<{ consultation: SynastryConsultation; messages: Message[] } | null> => {
    try {
      const [consultationRes, messagesRes] = await Promise.all([
        (supabase as any).from('synastry_consultations').select('*').eq('id', consultationId).single(),
        (supabase as any).from('synastry_interpretations').select('*').eq('consultation_id', consultationId).order('created_at', { ascending: true }),
      ]);

      if (consultationRes.error) throw consultationRes.error;
      if (messagesRes.error) throw messagesRes.error;

      const messages: Message[] = (messagesRes.data || []).map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      return { consultation: consultationRes.data, messages };
    } catch (err) {
      console.error('Failed to load synastry consultation:', err);
      return null;
    }
  }, []);

  const deleteConsultation = useCallback(async (id: string): Promise<boolean> => {
    try {
      await (supabase as any).from('synastry_interpretations').delete().eq('consultation_id', id);
      const { error } = await (supabase as any).from('synastry_consultations').delete().eq('id', id);
      if (error) throw error;
      setHistory(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete synastry consultation:', err);
      return false;
    }
  }, []);

  const updateConsultationTitle = useCallback(async (id: string, title: string) => {
    try {
      const { error } = await (supabase as any)
        .from('synastry_consultations')
        .update({ title })
        .eq('id', id);
      if (error) throw error;
      setHistory(prev => prev.map(c => c.id === id ? { ...c, title } : c));
    } catch (err) {
      console.error('Error updating synastry title:', err);
    }
  }, []);

  const getConsultationStats = useCallback(async (ids: string[]): Promise<Record<string, { count: number; lastMessage: string | null }>> => {
    if (ids.length === 0) return {};
    try {
      const stats: Record<string, { count: number; lastMessage: string | null }> = {};
      await Promise.all(ids.map(async (id) => {
        const { data, count } = await (supabase as any)
          .from('synastry_interpretations')
          .select('content', { count: 'exact' })
          .eq('consultation_id', id)
          .order('created_at', { ascending: false })
          .limit(1);
        stats[id] = { count: count || 0, lastMessage: data?.[0]?.content || null };
      }));
      return stats;
    } catch (err) {
      console.error('Error fetching synastry stats:', err);
      return {};
    }
  }, []);

  return {
    history, loading, error, hasAttempted,
    fetchHistory, saveConsultation, saveMessage,
    loadConsultation, deleteConsultation,
    updateConsultationTitle, getConsultationStats,
  };
}
