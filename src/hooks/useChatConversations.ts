import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChatConversation, ChatMessage } from '@/types/database';

export interface ChatMessageWithMeta extends ChatMessage {
  mentionedClients?: string[];
  mentionedConsultations?: string[];
}

export const useChatConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createConversation = useCallback(async (title?: string): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({ title: title || null, user_id: user.id })
        .select('*')
        .single();

      if (error) throw error;
      
      // Immediately add to local list for instant UI update
      setConversations(prev => [data, ...prev]);
      
      return data.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      return null;
    }
  }, [user]);

  const updateConversationTitle = useCallback(async (id: string, title: string) => {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ title })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state immediately
      setConversations(prev => 
        prev.map(c => c.id === id ? { ...c, title } : c)
      );
    } catch (err) {
      console.error('Error updating conversation title:', err);
    }
  }, []);

  // Get message stats for conversations (count and last message)
  const getConversationStats = useCallback(async (conversationIds: string[]): Promise<Record<string, { count: number; lastMessage: string | null }>> => {
    if (conversationIds.length === 0) return {};
    
    try {
      const stats: Record<string, { count: number; lastMessage: string | null }> = {};
      
      await Promise.all(
        conversationIds.map(async (id) => {
          const { data, count } = await supabase
            .from('chat_messages')
            .select('content', { count: 'exact' })
            .eq('conversation_id', id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          stats[id] = {
            count: count || 0,
            lastMessage: data?.[0]?.content || null,
          };
        })
      );
      
      return stats;
    } catch (err) {
      console.error('Error fetching conversation stats:', err);
      return {};
    }
  }, []);

  const deleteConversation = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setConversations(prev => prev.filter(c => c.id !== id));
  }, []);

  const saveMessage = useCallback(async (
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    mentionedClientIds: string[] = [],
    mentionedConsultationIds: string[] = []
  ) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role,
          content,
          mentioned_client_ids: mentionedClientIds,
          mentioned_consultation_ids: mentionedConsultationIds,
        });

      if (error) throw error;

      // Update conversation's updated_at
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  }, []);

  const getMessages = useCallback(async (conversationId: string): Promise<ChatMessageWithMeta[]> => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(m => ({
        ...m,
        role: m.role as 'user' | 'assistant',
        mentioned_client_ids: m.mentioned_client_ids || [],
        mentioned_consultation_ids: m.mentioned_consultation_ids || [],
      }));
    } catch (err) {
      console.error('Error getting messages:', err);
      return [];
    }
  }, []);

  const loadConversation = useCallback(async (conversationId: string): Promise<{ conversation: ChatConversation; messages: ChatMessageWithMeta[] } | null> => {
    try {
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;

      const messages = await getMessages(conversationId);
      return { conversation, messages };
    } catch (err) {
      console.error('Error loading conversation:', err);
      return null;
    }
  }, [getMessages]);

  return {
    conversations,
    loading,
    fetchConversations,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    saveMessage,
    getMessages,
    getConversationStats,
    loadConversation,
  };
};
