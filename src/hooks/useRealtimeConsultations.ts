import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChartData } from '@/types';
import { Json } from '@/integrations/supabase/types';

export interface RealtimeConsultation {
  id: string;
  issue: string | null;
  chart_date: string;
  chart_data: Json;
  topic: string | null;
  created_at: string;
}

export interface RealtimeInterpretation {
  id: string;
  consultation_id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface FetchState {
  loading: boolean;
  error: string | null;
  hasAttempted: boolean;
}

export function useRealtimeConsultations() {
  const { user } = useAuth();
  const [history, setHistory] = useState<RealtimeConsultation[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>({
    loading: false,
    error: null,
    hasAttempted: false,
  });

  const fetchHistory = useCallback(async () => {
    // Debug: Log fetch attempt
    console.debug('[useRealtimeConsultations] fetchHistory called', {
      userId: user?.id || null,
    });

    if (!user) {
      console.debug('[useRealtimeConsultations] Skipped: no user session');
      setFetchState({ loading: false, error: '请先登录', hasAttempted: true });
      setHistory([]);
      return;
    }
    
    try {
      setFetchState(prev => ({ ...prev, loading: true, error: null }));

      // Verify session is valid
      const { data: sessionData } = await supabase.auth.getSession();
      console.debug('[useRealtimeConsultations] Session check', {
        hasSession: !!sessionData.session,
        hasAccessToken: !!sessionData.session?.access_token,
      });

      if (!sessionData.session) {
        setFetchState({ loading: false, error: '会话已过期，请重新登录', hasAttempted: true });
        setHistory([]);
        return;
      }

      // Query with explicit user_id filter as second layer of security
      const { data, error } = await supabase
        .from('realtime_consultations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      console.debug('[useRealtimeConsultations] Query result', {
        dataLength: data?.length || 0,
        error: error?.message || null,
      });

      if (error) {
        throw error;
      }

      setHistory(data || []);
      setFetchState({ loading: false, error: null, hasAttempted: true });
    } catch (err: any) {
      console.error('[useRealtimeConsultations] Failed to fetch history:', err);
      setFetchState({
        loading: false,
        error: err?.message || '加载失败',
        hasAttempted: true,
      });
    }
  }, [user]);

  // Auto-fetch when user becomes available (session restored)
  useEffect(() => {
    if (user) {
      console.debug('[useRealtimeConsultations] Auto-fetching due to user change');
      fetchHistory();
    } else {
      // Clear data when user logs out
      setHistory([]);
      setFetchState({ loading: false, error: null, hasAttempted: false });
    }
  }, [user?.id]);

  const saveConsultation = useCallback(async (
    chartDate: Date,
    chartData: ChartData,
    issue?: string,
    topic?: string
  ): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('realtime_consultations')
        .insert({
          chart_date: chartDate.toISOString(),
          chart_data: chartData as unknown as Json,
          issue: issue || null,
          topic: topic || null,
          user_id: user.id,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (err) {
      console.error('Failed to save consultation:', err);
      return null;
    }
  }, [user]);

  const saveMessage = useCallback(async (
    consultationId: string,
    role: string,
    content: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('realtime_interpretations')
        .insert({
          consultation_id: consultationId,
          role,
          content,
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to save message:', err);
      return false;
    }
  }, []);

  const loadConsultation = useCallback(async (
    consultationId: string
  ): Promise<{ consultation: RealtimeConsultation; messages: Message[] } | null> => {
    try {
      const [consultationRes, messagesRes] = await Promise.all([
        supabase
          .from('realtime_consultations')
          .select('*')
          .eq('id', consultationId)
          .single(),
        supabase
          .from('realtime_interpretations')
          .select('*')
          .eq('consultation_id', consultationId)
          .order('created_at', { ascending: true }),
      ]);

      if (consultationRes.error) throw consultationRes.error;
      if (messagesRes.error) throw messagesRes.error;

      const messages: Message[] = (messagesRes.data || []).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      return {
        consultation: consultationRes.data,
        messages,
      };
    } catch (err) {
      console.error('Failed to load consultation:', err);
      return null;
    }
  }, []);

  const deleteConsultation = useCallback(async (consultationId: string): Promise<boolean> => {
    try {
      // Delete interpretations first (due to foreign key)
      await supabase
        .from('realtime_interpretations')
        .delete()
        .eq('consultation_id', consultationId);

      const { error } = await supabase
        .from('realtime_consultations')
        .delete()
        .eq('id', consultationId);

      if (error) throw error;

      setHistory(prev => prev.filter(c => c.id !== consultationId));
      return true;
    } catch (err) {
      console.error('Failed to delete consultation:', err);
      return false;
    }
  }, []);

  // Update consultation title (issue field)
  const updateConsultationTitle = useCallback(async (id: string, issue: string) => {
    try {
      const { error } = await supabase
        .from('realtime_consultations')
        .update({ issue })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state immediately
      setHistory(prev => 
        prev.map(c => c.id === id ? { ...c, issue } : c)
      );
    } catch (err) {
      console.error('Error updating consultation title:', err);
    }
  }, []);

  // Get message stats for consultations (count and last message)
  const getConsultationStats = useCallback(async (consultationIds: string[]): Promise<Record<string, { count: number; lastMessage: string | null }>> => {
    if (consultationIds.length === 0) return {};
    
    try {
      const stats: Record<string, { count: number; lastMessage: string | null }> = {};
      
      await Promise.all(
        consultationIds.map(async (id) => {
          const { data, count } = await supabase
            .from('realtime_interpretations')
            .select('content', { count: 'exact' })
            .eq('consultation_id', id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          stats[id] = {
            count: count || 0,
            lastMessage: data?.[0]?.content || null,
          };
        })
      );
      
      return stats;
    } catch (err) {
      console.error('Error fetching consultation stats:', err);
      return {};
    }
  }, []);

  return {
    history,
    loading: fetchState.loading,
    error: fetchState.error,
    hasAttempted: fetchState.hasAttempted,
    fetchHistory,
    saveConsultation,
    saveMessage,
    loadConsultation,
    deleteConsultation,
    updateConsultationTitle,
    getConsultationStats,
  };
}
