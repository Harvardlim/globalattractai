import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  selling_price: number | null;
  currency: string;
  sku: string | null;
  quantity: number;
  image_url: string | null;
  is_digital: boolean;
  is_active: boolean;
  weight_kg: number;
  category: string;
  max_per_customer: number | null;
  summary: string | null;
  is_bundle: boolean;
  bundle_quantity: number;
  visible_platforms: string[];
  created_at: string;
  updated_at: string;
}

/** Get the effective price a customer pays */
export function getEffectivePrice(product: { price: number; selling_price?: number | null }): number {
  return product.selling_price != null ? product.selling_price : product.price;
}

export function useProducts(includeInactive = false) {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', includeInactive],
    queryFn: async () => {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });

  const createProduct = useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('products').insert(product).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase.from('products').update(updates).eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('更新失败：未找到商品或权限不足，请刷新页面重试');
      return data[0];
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  return { products, isLoading, createProduct, updateProduct, deleteProduct };
}
