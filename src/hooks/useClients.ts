import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Client } from '@/types/database';

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    if (!user) {
      setClients([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setClients((data || []) as Client[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('clients')
      .insert({ 
        ...client, 
        user_id: user.id,
        birth_hour: client.birth_hour ?? null // explicitly handle null
      })
      .select()
      .single();

    if (error) throw error;
    await fetchClients();
    return data as Client;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const { error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchClients();
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchClients();
  };

  /**
   * Get existing "self" client (category="自己") or create one if not exists.
   * This allows self-mode destiny chart to save/view history with a real UUID.
   * NOTE: We query the database directly to avoid race conditions with state.
   */
  const getOrCreateSelfClient = useCallback(async (profileData: {
    name: string;
    birth_date: string;
    birth_hour: number;
    birth_minute: number;
    gender: '男' | '女';
  }): Promise<Client> => {
    if (!user) throw new Error('Not authenticated');

    // Query database directly for existing "self" client (avoid stale state issues)
    const { data: existingClients, error: queryError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', '自己')
      .limit(1);

    if (queryError) throw queryError;

    const existingClient = existingClients?.[0] as Client | undefined;

    if (existingClient) {
      // Optionally sync profile changes to the existing client
      const needsUpdate =
        existingClient.name !== profileData.name ||
        existingClient.birth_date !== profileData.birth_date ||
        existingClient.birth_hour !== profileData.birth_hour ||
        existingClient.birth_minute !== profileData.birth_minute ||
        existingClient.gender !== profileData.gender;

      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            name: profileData.name,
            birth_date: profileData.birth_date,
            birth_hour: profileData.birth_hour,
            birth_minute: profileData.birth_minute,
            gender: profileData.gender,
          })
          .eq('id', existingClient.id);

        if (updateError) throw updateError;

        // Refresh local state
        await fetchClients();

        // Return updated version
        return {
          ...existingClient,
          ...profileData,
        };
      }
      return existingClient;
    }

    // Create new self client
    const newClient = await addClient({
      name: profileData.name,
      birth_date: profileData.birth_date,
      birth_hour: profileData.birth_hour,
      birth_minute: profileData.birth_minute,
      gender: profileData.gender,
      notes: '个人档案（自动创建）',
      phone_number: null,
      category: '自己',
    });

    return newClient;
  }, [user, fetchClients, addClient]);

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    getOrCreateSelfClient,
    refetch: fetchClients,
  };
}
