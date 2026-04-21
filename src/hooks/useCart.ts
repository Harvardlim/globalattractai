import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_options: Record<string, string> | null;
  product: {
    id: string;
    name: string;
    price: number;
    selling_price: number | null;
    currency: string;
    image_url: string | null;
    quantity: number; // stock
    weight_kg: number;
  };
}

export function useCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('cart_items')
        .select('id, user_id, product_id, quantity, selected_options, product:products(id, name, price, selling_price, currency, image_url, quantity, weight_kg)')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data || []) as unknown as CartItem[];
    },
    enabled: !!user,
  });

  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity = 1, selectedOptions }: { productId: string; quantity?: number; selectedOptions?: any }) => {
      if (!user) throw new Error('Not logged in');
      // If options provided, always insert new line (different options = different line item)
      if (selectedOptions && Object.keys(selectedOptions).length > 0) {
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: productId, quantity, selected_options: selectedOptions });
        if (error) throw error;
      } else {
        // Upsert: if exists (no options), increment
        const existing = cartItems.find(i => i.product_id === productId && (!i.selected_options || Object.keys(i.selected_options).length === 0));
        if (existing) {
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + quantity })
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('cart_items')
            .insert({ user_id: user.id, product_id: productId, quantity });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      // toast({ title: '已加入购物车' });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cartItems.reduce((sum, i) => {
    const effectivePrice = i.product?.selling_price != null ? Number(i.product.selling_price) : Number(i.product?.price || 0);
    return sum + i.quantity * effectivePrice;
  }, 0);

  return {
    cartItems,
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalAmount,
  };
}
