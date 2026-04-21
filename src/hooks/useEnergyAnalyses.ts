import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EnergyAnalysis {
  id: string;
  input_number: string;
  analysis_data: any;
  title: string | null;
  client_id: string | null;
  created_at: string;
}

export function useEnergyAnalyses() {
  const { user } = useAuth();
  const [history, setHistory] = useState<EnergyAnalysis[]>([]);
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
        .from('energy_analyses')
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

  const saveAnalysis = useCallback(async (
    inputNumber: string,
    analysisData: any,
    title?: string,
    clientId?: string
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await (supabase as any)
        .from('energy_analyses')
        .insert({
          user_id: user.id,
          input_number: inputNumber,
          analysis_data: analysisData,
          title: title || null,
          client_id: clientId || null,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (err) {
      console.error('Failed to save energy analysis:', err);
      return null;
    }
  }, [user]);

  const deleteAnalysis = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('energy_analyses')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setHistory(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete energy analysis:', err);
      return false;
    }
  }, []);

  const updateAnalysisTitle = useCallback(async (id: string, title: string) => {
    try {
      const { error } = await (supabase as any)
        .from('energy_analyses')
        .update({ title })
        .eq('id', id);
      if (error) throw error;
      setHistory(prev => prev.map(a => a.id === id ? { ...a, title } : a));
    } catch (err) {
      console.error('Error updating energy analysis title:', err);
    }
  }, []);

  return {
    history, loading, error, hasAttempted,
    fetchHistory, saveAnalysis, deleteAnalysis, updateAnalysisTitle,
  };
}
