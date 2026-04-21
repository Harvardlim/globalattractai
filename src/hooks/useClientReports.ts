import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

import { useToast } from './use-toast';

export interface ClientReport {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  report_content: string;
  report_sections: Record<string, string>;
  payment_amount: number;
  payment_currency: string;
  is_paid: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useClientReports(clientId?: string) {
  const { user, profile } = useAuth();
  
  const { toast } = useToast();
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState<ClientReport | null>(null);

  const fetchReports = useCallback(async () => {
    if (!user || !clientId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_reports')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data || []) as ClientReport[]);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  }, [user, clientId]);

  const getMonthlyReportCount = useCallback(async (): Promise<number> => {
    if (!user) return 0;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { count } = await supabase
      .from('client_reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    return count || 0;
  }, [user]);

  const getQuotaInfo = useCallback(async () => {
    return { used: 0, limit: Infinity, canGenerate: true };
  }, []);

  const generateReport = useCallback(async (
    chartContext: string,
    clientName: string,
    clientIdToUse: string,
    title: string,
  ): Promise<ClientReport | null> => {
    if (!user) return null;
    setGenerating(true);

    try {
      // Create report record first
      const { data: reportRow, error: insertError } = await supabase
        .from('client_reports')
        .insert({
          user_id: user.id,
          client_id: clientIdToUse,
          title,
          report_content: '',
          report_sections: {},
          payment_amount: 0,
          is_paid: true,
          status: 'generating',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('请先登录');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            chartContext,
            clientName,
            clientId: clientIdToUse,
            reportId: reportRow.id,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || '报告生成失败');
      }

      const result = await response.json();
      
      const completedReport: ClientReport = {
        ...(reportRow as ClientReport),
        report_content: result.reportContent,
        report_sections: result.sections,
        status: 'completed',
      };

      setCurrentReport(completedReport);
      return completedReport;
    } catch (err: any) {
      toast({ title: err.message || '报告生成失败', variant: 'destructive' });
      return null;
    } finally {
      setGenerating(false);
    }
  }, [user, toast]);

  const deleteReport = useCallback(async (reportId: string) => {
    const { error } = await supabase
      .from('client_reports')
      .delete()
      .eq('id', reportId);
    
    if (error) throw error;
    setReports(prev => prev.filter(r => r.id !== reportId));
  }, []);

  return {
    reports,
    loading,
    generating,
    currentReport,
    setCurrentReport,
    fetchReports,
    generateReport,
    deleteReport,
    getQuotaInfo,
    getMonthlyReportCount,
  };
}
