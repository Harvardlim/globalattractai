import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Crown, Grid3X3, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ChatPanel from '@/components/ChatPanel';
import ChartGrid from '@/components/ChartGrid';
import FourPillarsDisplay from '@/components/FourPillarsDisplay';
import ExportPdfDialog from '@/components/ExportPdfDialog';
import { useClients } from '@/hooks/useClients';
import { useRealtimeConsultations } from '@/hooks/useRealtimeConsultations';
import { useChatConversations } from '@/hooks/useChatConversations';
import { useMemberPermissions } from '@/hooks/useMemberPermissions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateChart } from '@/lib/qimenEngine';
import { RealtimeConsultation } from '@/types/database';
import { ChartData, ChartType, Gender, FourPillars } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { canAccess, getTierLabel, getRequiredTier } = useMemberPermissions();
  
  // Check permission first
  const hasAccess = canAccess('ai_chat');
  
  const { clients } = useClients();
  const { history: consultationHistory } = useRealtimeConsultations();
  
  const {
    conversations,
    loading: conversationsLoading,
    fetchConversations,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    saveMessage,
    getMessages,
    getConversationStats,
  } = useChatConversations();

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [exportPillars, setExportPillars] = useState<FourPillars | undefined>(undefined);
  const [exportQimenChart, setExportQimenChart] = useState<ChartData | undefined>(undefined);
  const [conversationTitle, setConversationTitle] = useState<string>('AI 对话');

  // Use live messages (from ChatPanel) if available, otherwise loaded messages
  const currentMessages = liveMessages.length > 0 ? liveMessages : loadedMessages;

  const handleMessagesChange = useCallback((msgs: Message[]) => {
    setLiveMessages(msgs);
  }, []);
  // Convert consultation history to RealtimeConsultation format
  const consultationsForChat: RealtimeConsultation[] = React.useMemo(() => {
    return consultationHistory.map(c => ({
      id: c.id,
      chart_date: c.chart_date,
      chart_data: c.chart_data,
      issue: c.issue,
      topic: c.topic,
      title: c.issue || null,
      created_at: c.created_at,
    }));
  }, [consultationHistory]);

  // Auto-fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleLoadConversation = useCallback(async (conversationId: string) => {
    const messages = await getMessages(conversationId);
    setCurrentConversationId(conversationId);
    setLoadedMessages(messages.map(m => ({ role: m.role, content: m.content })));
    
    // Find conversation title
    const conv = conversations.find(c => c.id === conversationId);
    setConversationTitle(conv?.title || 'AI 对话');

    // Fetch chart data from mentioned consultations/clients
    const allConsultationIds = new Set<string>();
    const allClientIds = new Set<string>();
    for (const msg of messages) {
      (msg.mentioned_consultation_ids || []).forEach(id => allConsultationIds.add(id));
      (msg.mentioned_client_ids || []).forEach(id => allClientIds.add(id));
    }

    let chartData: ChartData | undefined;

    if (allConsultationIds.size > 0) {
      const { data } = await supabase
        .from('realtime_consultations')
        .select('chart_data')
        .in('id', Array.from(allConsultationIds))
        .limit(1);
      if (data?.[0]?.chart_data) {
        chartData = data[0].chart_data as unknown as ChartData;
      }
    }

    if (!chartData && allClientIds.size > 0) {
      const { data } = await supabase
        .from('consultations')
        .select('chart_data')
        .in('client_id', Array.from(allClientIds))
        .order('created_at', { ascending: false })
        .limit(1);
      if (data?.[0]?.chart_data) {
        chartData = data[0].chart_data as unknown as ChartData;
      }
    }

    // Fallback: if no chart data from mentions but conversation contains Qimen analysis,
    // generate a chart from conversation creation time
    if (!chartData) {
      const hasQimenContent = messages.some(m => 
        m.role === 'assistant' && /(九宫|奇门|天盘|地盘|八门|九星|值符|值使|伏吟|反吟|阴遁|阳遁|甲子|六仪|三奇|遁甲)/.test(m.content)
      );
      if (hasQimenContent && conv) {
        try {
          const chartDate = new Date(conv.created_at);
          const generatedChart = generateChart(chartDate, ChartType.REALTIME);
          chartData = generatedChart as unknown as ChartData;
        } catch (e) {
          console.error('Failed to generate fallback chart:', e);
        }
      }
    }

    if (chartData?.pillars) {
      setExportPillars(chartData.pillars);
      setExportQimenChart(chartData);
    } else {
      setExportPillars(undefined);
      setExportQimenChart(undefined);
    }

    toast({ title: '已加载对话' });
  }, [getMessages, toast, conversations]);

  // Auto-load conversation from URL query parameter
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversationId !== currentConversationId) {
      handleLoadConversation(conversationId);
    }
  }, [searchParams, handleLoadConversation, currentConversationId]);

  const handleNewConversation = useCallback(() => {
    setCurrentConversationId(null);
    setLoadedMessages([]);
  }, []);

  const handleConversationCreated = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  const handleSaveMessage = useCallback((
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    clientIds?: string[],
    consultationIds?: string[]
  ) => {
    saveMessage(conversationId, role, content, clientIds || [], consultationIds || []);
  }, [saveMessage]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4 py-3 max-w-3xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold flex-1">AI 对话</h1>
            {currentMessages.length > 0 && exportQimenChart && exportPillars && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-lg max-w-[95vw] sm:max-w-[500px] max-h-[85vh] overflow-hidden p-0">
                  <DialogHeader className="px-4 pt-4 pb-2">
                    <DialogTitle>八字/奇门盘</DialogTitle>
                  </DialogHeader>
                  <div className="px-4 pb-4 space-y-4 overflow-auto max-h-[calc(85vh-60px)]">
                    <FourPillarsDisplay pillars={exportPillars} />
                    <ChartGrid data={exportQimenChart} />
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {currentMessages.length > 0 && (
              <ExportPdfDialog
                title={conversationTitle}
                messages={currentMessages}
                pillars={exportPillars}
                qimenChart={exportQimenChart}
              />
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-3xl">
        {!hasAccess ? (
          <Card className="mt-8">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">需要 VIP+ 会员</h2>
              <p className="text-muted-foreground">
                AI 对话功能仅对 VIP+ 会员开放，升级后即可无限使用智能问答功能。
              </p>
              <Button 
                onClick={() => navigate('/pricing')}
                className="bg-amber-500 hover:bg-amber-600"
              >
                <Crown className="h-4 w-4 mr-2" />
                升级会员
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ChatPanel
            clients={clients}
            consultations={consultationsForChat}
            conversations={conversations}
            conversationsLoading={conversationsLoading}
            currentConversationId={currentConversationId}
            onFetchConversations={fetchConversations}
            onCreateConversation={createConversation}
            onUpdateConversationTitle={updateConversationTitle}
            onDeleteConversation={deleteConversation}
            onSaveMessage={handleSaveMessage}
            onLoadConversation={handleLoadConversation}
            loadedMessages={loadedMessages}
            onNewConversation={handleNewConversation}
            onConversationCreated={handleConversationCreated}
            onGetConversationStats={getConversationStats}
            onMessagesChange={handleMessagesChange}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
