import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string | null;
  quantity: number;
  option_values: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export function useProductVariants(productId?: string) {
  const queryClient = useQueryClient();

  const { data: variants = [], isLoading } = useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await (supabase
        .from('product_variants' as any)
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true })) as any;
      if (error) throw error;
      return (data || []) as ProductVariant[];
    },
    enabled: !!productId,
  });

  const upsertVariants = useMutation({
    mutationFn: async (items: { id?: string; product_id: string; sku: string | null; quantity: number; option_values: Record<string, string> }[]) => {
      // Delete existing variants for this product, then insert all
      const productId = items[0]?.product_id;
      if (!productId) return;
      
      await (supabase.from('product_variants' as any).delete().eq('product_id', productId) as any);
      
      if (items.length > 0) {
        const { error } = await (supabase.from('product_variants' as any).insert(
          items.map(i => ({
            product_id: i.product_id,
            sku: i.sku || null,
            quantity: i.quantity,
            option_values: i.option_values,
          }))
        ) as any);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-variants'] }),
  });

  return { variants, isLoading, upsertVariants };
}

/** Find a variant matching the selected options */
export function findMatchingVariant(
  variants: ProductVariant[],
  selectedOptions: Record<string, string>,
  optionLabels: { id: string; option_label: string }[]
): ProductVariant | undefined {
  // Build a lookup: option_label -> selected value
  const selectedByLabel: Record<string, string> = {};
  optionLabels.forEach(opt => {
    if (selectedOptions[opt.id]) {
      selectedByLabel[opt.option_label] = selectedOptions[opt.id];
    }
  });

  return variants.find(v => {
    const vals = v.option_values as Record<string, string>;
    return Object.keys(selectedByLabel).every(k => vals[k] === selectedByLabel[k]);
  });
}

/** Generate all combinations from option groups */
export function generateOptionCombinations(
  options: { option_label: string; option_values: string[] }[]
): Record<string, string>[] {
  if (options.length === 0) return [];
  
  let combos: Record<string, string>[] = [{}];
  for (const opt of options) {
    const newCombos: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const val of opt.option_values) {
        newCombos.push({ ...combo, [opt.option_label]: val });
      }
    }
    combos = newCombos;
  }
  return combos;
}
