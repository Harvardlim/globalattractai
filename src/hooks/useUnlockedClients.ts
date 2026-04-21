import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UnlockedClient {
  id: string;
  user_id: string;
  client_id: string;
  unlocked_at: string;
  payment_amount: number;
  payment_currency: string;
}

export function useUnlockedClients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unlockedClients, setUnlockedClients] = useState<UnlockedClient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnlockedClients = useCallback(async () => {
    if (!user) {
      setUnlockedClients([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('unlocked_clients')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUnlockedClients(data || []);
    } catch (error) {
      console.error('Error fetching unlocked clients:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUnlockedClients();
  }, [fetchUnlockedClients]);

  const isClientUnlocked = useCallback((clientId: string): boolean => {
    return unlockedClients.some(uc => uc.client_id === clientId);
  }, [unlockedClients]);

  const unlockClient = useCallback(async (clientId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('unlocked_clients')
        .insert({
          user_id: user.id,
          client_id: clientId,
          payment_amount: 19.90,
          payment_currency: 'MYR',
        });

      if (error) throw error;

      toast({
        title: '解锁成功',
        description: '您已成功解锁该客户的命盘分析',
      });

      await fetchUnlockedClients();
      return true;
    } catch (error: any) {
      console.error('Error unlocking client:', error);
      toast({
        title: '解锁失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast, fetchUnlockedClients]);

  return {
    unlockedClients,
    loading,
    isClientUnlocked,
    unlockClient,
    refetch: fetchUnlockedClients,
  };
}
