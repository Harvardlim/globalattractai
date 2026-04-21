import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export function useProductImages(productId?: string) {
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['product_images', productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as ProductImage[];
    },
    enabled: !!productId,
  });

  const addImage = useMutation({
    mutationFn: async ({ productId, imageUrl, sortOrder }: { productId: string; imageUrl: string; sortOrder: number }) => {
      const { data, error } = await supabase
        .from('product_images')
        .insert({ product_id: productId, image_url: imageUrl, sort_order: sortOrder })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product_images'] }),
  });

  const removeImage = useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase.from('product_images').delete().eq('id', imageId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product_images'] }),
  });

  const reorderImages = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      for (const u of updates) {
        const { error } = await supabase.from('product_images').update({ sort_order: u.sort_order }).eq('id', u.id);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product_images'] }),
  });

  return { images, isLoading, addImage, removeImage, reorderImages };
}
