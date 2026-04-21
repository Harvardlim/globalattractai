import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  currency: string;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export function useOrders(adminMode = false) {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', adminMode, user?.id],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (!adminMode) {
        query = query.eq('user_id', user.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });

  return { orders, isLoading };
}
