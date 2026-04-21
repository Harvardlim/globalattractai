import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Consultation, Interpretation } from '@/types/database';
import { ChartData } from '@/types';

export interface FetchState {
  loading: boolean;
  error: string | null;
  hasAttempted: boolean;
}

export function useConsultations(clientId?: string) {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>({
    loading: false,
    error: null,
    hasAttempted: false,
  });

  const fetchConsultations = useCallback(async () => {
    // Debug: Log fetch attempt
    console.debug('[useConsultations] fetchConsultations called', {
      clientId,
      userId: user?.id || null,
    });

    if (!clientId) {
      console.debug('[useConsultations] Skipped: no clientId');
      return;
    }

    if (!user) {
      console.debug('[useConsultations] Skipped: no user session');
      setFetchState({ loading: false, error: '请先登录', hasAttempted: true });
      setConsultations([]);
      return;
    }

    try {
      setFetchState(prev => ({ ...prev, loading: true, error: null }));

      // Verify session is valid
      const { data: sessionData } = await supabase.auth.getSession();
      console.debug('[useConsultations] Session check', {
        hasSession: !!sessionData.session,
        hasAccessToken: !!sessionData.session?.access_token,
      });

      if (!sessionData.session) {
        setFetchState({ loading: false, error: '会话已过期，请重新登录', hasAttempted: true });
        setConsultations([]);
        return;
      }

      // Query with explicit user_id filter as second layer of security
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('client_id', clientId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.debug('[useConsultations] Query result', {
        dataLength: data?.length || 0,
        error: error?.message || null,
      });

      if (error) {
        throw error;
      }

      setConsultations((data || []) as Consultation[]);
      setFetchState({ loading: false, error: null, hasAttempted: true });
    } catch (err: any) {
      console.error('[useConsultations] Error fetching consultations:', err);
      setFetchState({
        loading: false,
        error: err?.message || '加载失败',
        hasAttempted: true,
      });
    }
  }, [clientId, user]);

  // Auto-fetch when user becomes available (session restored)
  useEffect(() => {
    if (user && clientId) {
      console.debug('[useConsultations] Auto-fetching due to user/clientId change');
      fetchConsultations();
    } else if (!user) {
      // Clear data when user logs out
      setConsultations([]);
      setFetchState({ loading: false, error: null, hasAttempted: false });
    }
  }, [user?.id, clientId, fetchConsultations]);

  // Reset state when clientId changes
  useEffect(() => {
    setConsultations([]);
    setFetchState({ loading: false, error: null, hasAttempted: false });
  }, [clientId]);

  const createConsultation = async (
    consultation: Omit<Consultation, 'id' | 'created_at'>
  ) => {
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('consultations')
      .insert({ ...consultation, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Save destiny chart consultation with mentioned clients
  // topic: must be valid category (健康/财富/关系/轨道/学业/家庭/贵人/风险/综合) or null
  // title: display name for the consultation (e.g., "Reagan Saw - 风险分析")
  const saveDestinyConsultation = async (
    clientId: string,
    chartDate: Date,
    chartData: ChartData,
    params?: {
      title?: string;
      topic?: string | null;
      mentionedClientIds?: string[];
    }
  ): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const insertData: Record<string, unknown> = {
        client_id: clientId,
        user_id: user.id,
        chart_date: chartDate.toISOString(),
        chart_type: '命理盘',
        chart_data: chartData as unknown as Record<string, unknown>,
        title: params?.title ?? null,
        topic: params?.topic ?? null,
        mentioned_client_ids: params?.mentionedClientIds ?? [],
      };
      
      const { data, error } = await supabase
        .from('consultations')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh consultations list
      fetchConsultations();
      
      return data?.id || null;
    } catch (err) {
      console.error('Error saving destiny consultation:', err);
      return null;
    }
  };

  const saveInterpretation = async (
    consultationId: string,
    role: 'user' | 'assistant',
    content: string
  ) => {
    const { error } = await supabase
      .from('interpretations')
      .insert({
        consultation_id: consultationId,
        role,
        content,
      });

    if (error) throw error;
  };

  const getInterpretations = useCallback(async (consultationId: string): Promise<Interpretation[]> => {
    const { data, error } = await supabase
      .from('interpretations')
      .select('*')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as Interpretation[];
  }, []);

  const deleteConsultation = async (consultationId: string) => {
    // Delete interpretations first
    await supabase
      .from('interpretations')
      .delete()
      .eq('consultation_id', consultationId);

    // Then delete consultation
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', consultationId);

    if (error) throw error;
    
    // Refresh list
    fetchConsultations();
  };

  // Update consultation title (display name, not topic category)
  const updateConsultationTitle = useCallback(async (id: string, title: string) => {
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ title })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state immediately
      setConsultations(prev => 
        prev.map(c => c.id === id ? { ...c, title } : c)
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
            .from('interpretations')
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

  // Load a single consultation with its messages
  const loadConsultation = useCallback(async (consultationId: string): Promise<{ consultation: Consultation; messages: Interpretation[] } | null> => {
    try {
      const { data: consultation, error: consError } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', consultationId)
        .single();

      if (consError) throw consError;

      const messages = await getInterpretations(consultationId);
      return { consultation: consultation as Consultation, messages };
    } catch (err) {
      console.error('Error loading consultation:', err);
      return null;
    }
  }, [getInterpretations]);

  return {
    consultations,
    loading: fetchState.loading,
    error: fetchState.error,
    hasAttempted: fetchState.hasAttempted,
    fetchConsultations,
    createConsultation,
    saveDestinyConsultation,
    saveInterpretation,
    getInterpretations,
    deleteConsultation,
    updateConsultationTitle,
    getConsultationStats,
    loadConsultation,
  };
}
