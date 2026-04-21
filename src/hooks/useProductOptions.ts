import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface ProductOption {
  id: string;
  product_id: string;
  option_label: string;
  option_values: string[];
  sort_order: number;
}

export function useProductOptions(productId?: string) {
  const queryClient = useQueryClient();

  const { data: options = [], isLoading } = useQuery({
    queryKey: ['product-options', productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await (supabase
        .from('product_options' as any)
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true })) as any;
      if (error) throw error;
      return (data || []) as ProductOption[];
    },
    enabled: !!productId,
  });

  const addOption = useMutation({
    mutationFn: async (opt: { productId: string; label: string; values: string[] }) => {
      const { error } = await (supabase
        .from('product_options' as any)
        .insert({ product_id: opt.productId, option_label: opt.label, option_values: opt.values } as any)) as any;
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-options', productId] }),
  });

  const updateOption = useMutation({
    mutationFn: async (opt: { id: string; label: string; values: string[] }) => {
      const { error } = await (supabase
        .from('product_options' as any)
        .update({ option_label: opt.label, option_values: opt.values } as any)
        .eq('id', opt.id)) as any;
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-options', productId] }),
  });

  const deleteOption = useMutation({
    mutationFn: async (optionId: string) => {
      const { error } = await (supabase
        .from('product_options' as any)
        .delete()
        .eq('id', optionId)) as any;
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-options', productId] }),
  });

  return { options, isLoading, addOption, updateOption, deleteOption };
}

/** Fetch ALL product options (for Store listing to check which products need options) */
export function useAllProductOptions() {
  const { data: allOptions = [] } = useQuery({
    queryKey: ['all-product-options'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('product_options' as any)
        .select('*')
        .order('sort_order', { ascending: true })) as any;
      if (error) throw error;
      return (data || []) as ProductOption[];
    },
  });

  const optionsMap = useMemo(() => {
    const map: Record<string, ProductOption[]> = {};
    allOptions.forEach(o => {
      if (!map[o.product_id]) map[o.product_id] = [];
      map[o.product_id].push(o);
    });
    return map;
  }, [allOptions]);

  return { allOptions, optionsMap };
}