import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_CATEGORIES, INITIAL_CATEGORIES } from '@/types/database';

export function useCategorySettings() {
  const { user } = useAuth();
  const [categoryOrder, setCategoryOrder] = useState<string[]>([...INITIAL_CATEGORIES]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setCategoryOrder([...INITIAL_CATEGORIES]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('category_settings')
        .select('category_order')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.category_order) {
        setCategoryOrder(data.category_order);
      } else {
        setCategoryOrder([...INITIAL_CATEGORIES]);
      }
    } catch (err) {
      console.error('Error fetching category settings:', err);
      setCategoryOrder([...INITIAL_CATEGORIES]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateCategoryOrder = async (newOrder: string[]) => {
    if (!user) return;

    try {
      // Upsert the settings
      const { error } = await supabase
        .from('category_settings')
        .upsert(
          {
            user_id: user.id,
            category_order: newOrder,
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;
      setCategoryOrder(newOrder);
    } catch (err) {
      console.error('Error updating category order:', err);
      throw err;
    }
  };

  // Update category order, migrate removed categories, and rename categories
  const updateCategoryOrderWithMigration = async (
    newOrder: string[],
    removedCategories: string[],
    renamedCategories?: Record<string, string>
  ) => {
    if (!user) return;

    try {
      // Migrate clients from removed categories to "未分类"
      if (removedCategories.length > 0) {
        const { error: updateError } = await supabase
          .from('clients')
          .update({ category: '未分类' })
          .in('category', removedCategories);
        if (updateError) throw updateError;
      }

      // Rename categories on clients
      if (renamedCategories && Object.keys(renamedCategories).length > 0) {
        for (const [oldName, newName] of Object.entries(renamedCategories)) {
          const { error: renameError } = await supabase
            .from('clients')
            .update({ category: newName })
            .eq('category', oldName);
          if (renameError) throw renameError;
        }
      }

      // Update the category order
      const { error } = await supabase
        .from('category_settings')
        .upsert(
          { user_id: user.id, category_order: newOrder },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
      setCategoryOrder(newOrder);
    } catch (err) {
      console.error('Error updating category order:', err);
      throw err;
    }
  };

  const addCategory = async (category: string) => {
    if (!category.trim() || categoryOrder.includes(category)) return;
    const newOrder = [...categoryOrder, category.trim()];
    await updateCategoryOrder(newOrder);
  };

  const removeCategory = async (category: string) => {
    // Don't allow removing default categories
    if (DEFAULT_CATEGORIES.includes(category as any)) return;
    const newOrder = categoryOrder.filter((c) => c !== category);
    await updateCategoryOrderWithMigration(newOrder, [category]);
  };

  const moveCategory = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newOrder = [...categoryOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    await updateCategoryOrder(newOrder);
  };

  return {
    categoryOrder,
    loading,
    updateCategoryOrder,
    updateCategoryOrderWithMigration,
    addCategory,
    removeCategory,
    moveCategory,
    refetch: fetchSettings,
  };
}
