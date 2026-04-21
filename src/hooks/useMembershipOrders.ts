import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MembershipOrder {
  id: string;
  user_id: string;
  tier: string;
  duration_months: number;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export function useMembershipOrders(adminMode = false) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: membershipOrders = [], isLoading } = useQuery({
    queryKey: ['membership_orders', adminMode, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const query = (supabase
        .from('membership_orders' as any)
        .select('*')
        .order('created_at', { ascending: false })) as any;
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as MembershipOrder[];
    },
    enabled: !!user,
  });

  const createOrder = useMutation({
    mutationFn: async (order: { tier: string; duration_months: number; amount: number; currency: string }) => {
      if (!user) throw new Error('请先登录');
      const { data, error } = await (supabase
        .from('membership_orders' as any)
        .insert({ ...order, user_id: user.id } as any)
        .select()
        .single()) as any;
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['membership_orders'] }),
  });

  return { membershipOrders, isLoading, createOrder };
}
