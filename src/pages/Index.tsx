import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Users, AlertCircle, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import ChartGrid from '@/components/ChartGrid';
import ChartModeSwitch from '@/components/ChartModeSwitch';
import ClientList from '@/components/ClientList';
import ClientForm from '@/components/ClientForm';
import AIChatPanel from '@/components/AIChatPanel';
import ChatPanel from '@/components/ChatPanel';
import CyclesDisplay from '@/components/CyclesDisplay';
import FourPillarsDisplay from '@/components/FourPillarsDisplay';
import LiuYaoDisplay from '@/components/LiuYaoDisplay';
import RealtimeConsultationHistory from '@/components/RealtimeConsultationHistory';
import DestinyConsultationHistory from '@/components/DestinyConsultationHistory';
import { UserMenu } from '@/components/UserMenu';
import { generateChart } from '@/lib/qimenEngine';
import { getLunarDate } from '@/lib/lunar';
import { makeBeijingDate, parseYmd } from '@/lib/time/beijing';
import { ChartType, Gender, ChartData } from '@/types';
import { ChartMode, Client, HOUR_OPTIONS, RealtimeConsultation } from '@/types/database';
import { useClients } from '@/hooks/useClients';
import { useRealtimeConsultations, Message } from '@/hooks/useRealtimeConsultations';
import { useConsultations } from '@/hooks/useConsultations';
import { useChatConversations } from '@/hooks/useChatConversations';
import { useToast } from '@/hooks/use-toast';

const LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const LUNAR_DAYS = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

const Index = () => {
  const { toast } = useToast();
  const { clients, loading: clientsLoading, addClient, updateClient, deleteClient } = useClients();
  const {
    history: consultationHistory,
    loading: historyLoading,
    fetchHistory,
    saveConsultation,
    saveMessage,
    loadConsultation,
    deleteConsultation,
    updateConsultationTitle: updateRealtimeTitle,
    getConsultationStats: getRealtimeStats,
  } = useRealtimeConsultations();

  // Chat mode hooks
  const {
    conversations: chatConversations,
    loading: chatConversationsLoading,
    fetchConversations: fetchChatConversations,
    createConversation: createChatConversation,
    updateConversationTitle: updateChatTitle,
    deleteConversation: deleteChatConversation,
    saveMessage: saveChatMessage,
    getMessages: getChatMessages,
    getConversationStats: getChatConversationStats,
  } = useChatConversations();

  // Chart mode
  const [chartMode, setChartMode] = useState<ChartMode>('实时盘');
  const isMobile = useIsMobile();

  // Realtime chart controls
  const [realtimeDate, setRealtimeDate] = useState<Date>(new Date());
  const [realtimeHour, setRealtimeHour] = useState<number>(() => {
    const hour = new Date().getHours();
    return Math.floor(((hour + 1) % 24) / 2);
  });
  const [realtimeDateDrawerOpen, setRealtimeDateDrawerOpen] = useState(false);
  const [realtimeHourDrawerOpen, setRealtimeHourDrawerOpen] = useState(false);

  // Event chart - issue and consultation tracking
  const [issue, setIssue] = useState('');
  const [currentConsultationId, setCurrentConsultationId] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  const [realtimeChartGenerated, setRealtimeChartGenerated] = useState(false);

  // Destiny chart - client selection
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Destiny chart - consultation history
  const [currentDestinyConsultationId, setCurrentDestinyConsultationId] = useState<string | null>(null);
  const [loadedDestinyMessages, setLoadedDestinyMessages] = useState<Message[]>([]);

  // Chat mode state
  const [currentChatConversationId, setCurrentChatConversationId] = useState<string | null>(null);
  const [loadedChatMessages, setLoadedChatMessages] = useState<Message[]>([]);
  
  // Destiny consultations hook
  const {
    consultations: destinyConsultations,
    loading: destinyConsultationsLoading,
    fetchConsultations: fetchDestinyConsultations,
    saveDestinyConsultation,
    saveInterpretation: saveDestinyInterpretation,
    getInterpretations: getDestinyInterpretations,
    deleteConsultation: deleteDestinyConsultation,
    updateConsultationTitle: updateDestinyTitle,
    getConsultationStats: getDestinyStats,
  } = useConsultations(selectedClient?.id);

  // Convert consultation history to RealtimeConsultation format for Chat mode
  const realtimeConsultationsForChat: RealtimeConsultation[] = useMemo(() => {
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

  // Compute the chart date based on mode
  const chartDate = useMemo(() => {
    if (chartMode === '实时盘') {
      const hourMap = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];
      const baseY = realtimeDate.getFullYear();
      const baseM = realtimeDate.getMonth() + 1;
      const baseD = realtimeDate.getDate();
      return makeBeijingDate({
        year: baseY,
        month: baseM,
        day: baseD,
        hour: hourMap[realtimeHour],
        minute: 0,
      });
    } else if (chartMode === '命理盘' && selectedClient) {
      const { year, month, day } = parseYmd(selectedClient.birth_date);
      return makeBeijingDate({
        year,
        month,
        day,
        hour: selectedClient.birth_hour,
        minute: selectedClient.birth_minute || 0,
      });
    }
    return null;
  }, [chartMode, realtimeDate, realtimeHour, selectedClient]);

  // Generate chart
  const chart = useMemo(() => {
    if (!chartDate || chartMode === 'Chat') return null;
    
    const name = chartMode === '命理盘' && selectedClient ? selectedClient.name : '实时盘';
    const gender = chartMode === '命理盘' && selectedClient 
      ? (selectedClient.gender === '男' ? Gender.MALE : Gender.FEMALE)
      : Gender.MALE;
    const type = chartMode === '命理盘' ? ChartType.LIFETIME : ChartType.REALTIME;
    
    return generateChart(chartDate, type, name, gender);
  }, [chartDate, chartMode, selectedClient]);

  // Lunar date for display
  const lunar = useMemo(() => {
    if (!chartDate || chartMode === 'Chat') return null;
    return getLunarDate(chartDate);
  }, [chartDate, chartMode]);

  // Auto-fetch chat conversations when entering Chat mode
  useEffect(() => {
    if (chartMode === 'Chat') {
      fetchChatConversations();
    }
  }, [chartMode, fetchChatConversations]);

  // Client management handlers
  const handleSaveClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, clientData);
        if (selectedClient?.id === editingClient.id) {
          setSelectedClient({ ...selectedClient, ...clientData } as Client);
        }
        toast({ title: '客户已更新' });
      } else {
        const newClient = await addClient(clientData);
        setSelectedClient(newClient);
        setChartMode('命理盘');
        toast({ title: '客户已添加' });
      }
    } catch (err) {
      toast({ title: '保存失败', variant: 'destructive' });
      throw err;
    }
  };

  const handleDeleteClient = async (client: Client) => {
    await deleteClient(client.id);
    if (selectedClient?.id === client.id) {
      setSelectedClient(null);
    }
  };

  const handleExportReport = useCallback(() => {
    if (!chart) return;
    
    const currentYear = new Date().getFullYear();
    const birthYear = chart.date.getFullYear();

    const palaceDetails = chart.palaces.filter(p => p.id !== 5).map(p => {
      const skyStems = p.skyStem2 
        ? `${p.skyStem} (${p.lifeStages[0]}) ${p.skyStem2} (${p.lifeStages[2] || ''})` 
        : `${p.skyStem} (${p.lifeStages[0]})`;
      
      const earthStems = p.earthStem2 
        ? `${p.earthStem} (${p.lifeStages[1]}) ${p.earthStem2} (${p.lifeStages[3] || ''})` 
        : `${p.earthStem} (${p.lifeStages[1]})`;
      
      const hiddenStemsStr = p.hiddenStem || '无';
      
      const markers = [
        p.empty ? '【空亡】' : '',
        p.horse ? '【马星】' : '',
        p.isMenPo ? '【门迫】' : ''
      ].filter(Boolean).join('');
      
      return `${p.name}宫 (${p.position}):
  天盘: ${skyStems}
  地盘: ${earthStems}
  隐干: ${hiddenStemsStr}
  九星: ${p.star} | 八门: ${p.door} | 八神: ${p.god}
  ${markers}`;
    }).join('\n\n');

    let cyclesSection = '';
    if (chartMode === '命理盘' && chart.bigCycles.length > 0) {
      const currentBigCycleIdx = chart.bigCycles.findIndex((cycle, idx) => {
        if (idx === chart.bigCycles.length - 1) return true;
        const nextCycle = chart.bigCycles[idx + 1];
        return currentYear >= cycle.year && currentYear < nextCycle.year;
      });

      const bigCyclesStr = chart.bigCycles.map((c, idx) => {
        const age = idx === 0 ? '出生' : `${c.year - birthYear}岁`;
        const isCurrent = idx === currentBigCycleIdx;
        return `  ${age}: ${c.gan}${c.zhi} (${c.desc})${isCurrent ? ' ← 当前大运' : ''}`;
      }).join('\n');

      const annualCyclesStr = chart.annualCycles.map(c => {
        const isCurrent = c.year === currentYear;
        const displayAge = c.age <= 0 ? '-' : `${c.age}岁`;
        return `  ${c.year}: ${c.gan}${c.zhi} (${displayAge})${isCurrent ? ' ← 今年' : ''}`;
      }).join('\n');

      cyclesSection = `

大运排盘
--------
${bigCyclesStr}

流年运势
--------
${annualCyclesStr}`;
    }

    const reportContent = `
全球发愿奇门遁甲分析报告
===================

客户信息
--------
姓名: ${chart.name}
性别: ${chart.gender}
日期: ${format(chart.date, 'yyyy年MM月dd日')}

盘局信息
--------
局数: ${chart.yinYang === 'Yin' ? '阴' : '阳'}遁${chart.juNum}局
四柱: ${chart.pillars.year.gan}${chart.pillars.year.zhi} ${chart.pillars.month.gan}${chart.pillars.month.zhi} ${chart.pillars.day.gan}${chart.pillars.day.zhi} ${chart.pillars.hour.gan}${chart.pillars.hour.zhi}
值符: ${chart.zhiFu}
值使: ${chart.zhiShi}
空亡: ${chart.voidBranches}
马星: ${chart.horseBranch}

九宫详情
--------
${palaceDetails}
${cyclesSection}

---
报告生成时间: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `奇门报告_${chart.name}_${format(new Date(), 'yyyyMMdd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: '报告已导出' });
  }, [chart, toast, chartMode]);

  // Handle loading a consultation from history
  const handleLoadHistory = useCallback(async (consultationId: string) => {
    const result = await loadConsultation(consultationId);
    if (result) {
      setCurrentConsultationId(consultationId);
      setLoadedMessages(result.messages);
      setIssue(result.consultation.issue || '');
      
      const chartDate = new Date(result.consultation.chart_date);
      setRealtimeDate(chartDate);
      const hour = chartDate.getHours();
      setRealtimeHour(Math.floor(((hour + 1) % 24) / 2));
      setRealtimeChartGenerated(true); // Show chart when loading history
      
      toast({ title: '已加载历史记录' });
    }
  }, [loadConsultation, toast]);

  // Handle saving a new consultation
  const handleSaveConsultation = useCallback(async (topic?: string): Promise<string | null> => {
    if (!chartDate || !chart) return null;
    
    // Generate intelligent title for realtime chart
    let title = issue || '实时占卜';
    if (title.length > 30) {
      title = title.slice(0, 30) + '...';
    }
    if (topic && topic !== '综合') {
      title += ` - ${topic}`;
    }
    
    const id = await saveConsultation(chartDate, chart, issue, title);
    if (id) {
      setCurrentConsultationId(id);
    }
    return id;
  }, [chartDate, chart, issue, saveConsultation]);

  // Handle saving a message
  const handleSaveMessage = useCallback(async (consultationId: string, role: string, content: string) => {
    await saveMessage(consultationId, role, content);
  }, [saveMessage]);

  // Handle starting a new chart
  const handleNewChart = useCallback(() => {
    if (realtimeChartGenerated) {
      // Already have a chart, reset and prepare for new one
      setCurrentConsultationId(null);
      setLoadedMessages([]);
      setIssue('');
      setRealtimeDate(new Date());
      const hour = new Date().getHours();
      setRealtimeHour(Math.floor(((hour + 1) % 24) / 2));
      setRealtimeChartGenerated(false);
    } else {
      // First time generating chart
      setRealtimeChartGenerated(true);
    }
  }, [realtimeChartGenerated]);

  // Destiny chart - save consultation handler
  const handleSaveDestinyConsultation = useCallback(async (topic?: string, mentionedClientIds?: string[]): Promise<string | null> => {
    if (!chartDate || !chart || !selectedClient) return null;
    
    // Generate intelligent title
    let title = selectedClient.name;
    
    // If mentioning other clients (dual-person analysis)
    if (mentionedClientIds && mentionedClientIds.length > 0) {
      const mentionedNames = clients
        .filter(c => mentionedClientIds.includes(c.id))
        .map(c => c.name)
        .join(', ');
      if (mentionedNames) {
        title += ` + ${mentionedNames}`;
      }
    }
    
    // Add analysis topic
    if (topic && topic !== '综合') {
      title += ` - ${topic}分析`;
    } else {
      title += ' - 命理咨询';
    }
    
    // Use new params format with title and topic separated
    const id = await saveDestinyConsultation(selectedClient.id, chartDate, chart, {
      title,
      topic: topic ?? null,
      mentionedClientIds,
    });
    if (id) {
      setCurrentDestinyConsultationId(id);
    }
    return id;
  }, [chartDate, chart, selectedClient, clients, saveDestinyConsultation]);

  // Destiny chart - save message handler
  const handleSaveDestinyMessage = useCallback(async (consultationId: string, role: string, content: string) => {
    await saveDestinyInterpretation(consultationId, role as 'user' | 'assistant', content);
  }, [saveDestinyInterpretation]);

  // Destiny chart - load history handler
  const handleLoadDestinyHistory = useCallback(async (consultationId: string, messages: Message[]) => {
    setCurrentDestinyConsultationId(consultationId);
    setLoadedDestinyMessages(messages);
    toast({ title: '已加载历史记录' });
  }, [toast]);

  // Destiny chart - new consultation
  const handleNewDestinyConsultation = useCallback(() => {
    setCurrentDestinyConsultationId(null);
    setLoadedDestinyMessages([]);
  }, []);

  // Chat mode handlers
  const handleLoadChatConversation = useCallback(async (conversationId: string) => {
    const messages = await getChatMessages(conversationId);
    setCurrentChatConversationId(conversationId);
    setLoadedChatMessages(messages.map(m => ({ role: m.role, content: m.content })));
    toast({ title: '已加载对话' });
  }, [getChatMessages, toast]);

  const handleNewChatConversation = useCallback(() => {
    setCurrentChatConversationId(null);
    setLoadedChatMessages([]);
  }, []);

  const handleChatConversationCreated = useCallback((id: string) => {
    setCurrentChatConversationId(id);
  }, []);

  const handleSaveChatMessage = useCallback((
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    clientIds?: string[],
    consultationIds?: string[]
  ) => {
    saveChatMessage(conversationId, role, content, clientIds || [], consultationIds || []);
  }, [saveChatMessage]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl">
        <div className="flex items-center justify-between mb-3 sm:mb-6">
          <div className="w-8 sm:w-24" /> {/* Spacer for centering */}
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-center">全球发愿奇门遁甲</h1>
          <UserMenu />
        </div>
        
        {/* Chat Mode - Full width layout */}
        {chartMode === 'Chat' ? (
          <div className="space-y-4">
            <div className="bg-card rounded-lg p-4 border border-border max-w-md mx-auto">
              <ChartModeSwitch mode={chartMode} onChange={setChartMode} />
            </div>
            <div className="max-w-3xl mx-auto">
              <ChatPanel
                clients={clients}
                consultations={realtimeConsultationsForChat}
                conversations={chatConversations}
                conversationsLoading={chatConversationsLoading}
                currentConversationId={currentChatConversationId}
                onFetchConversations={fetchChatConversations}
                onCreateConversation={createChatConversation}
                onUpdateConversationTitle={updateChatTitle}
                onDeleteConversation={deleteChatConversation}
                onSaveMessage={handleSaveChatMessage}
                onLoadConversation={handleLoadChatConversation}
                loadedMessages={loadedChatMessages}
                onNewConversation={handleNewChatConversation}
                onConversationCreated={handleChatConversationCreated}
                onGetConversationStats={getChatConversationStats}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {/* Left Panel - Controls */}
            <div className="space-y-3 sm:space-y-4 order-1 lg:order-1">
              {/* Mode Switch */}
              <div className="bg-card rounded-lg p-3 sm:p-4 border border-border">
                <ChartModeSwitch mode={chartMode} onChange={setChartMode} />
              </div>

              {/* Realtime Chart Controls */}
              {chartMode === '实时盘' && (
                <>
                  <div className="bg-card rounded-lg p-4 border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">事项内容（可选）</label>
                      <div className="flex gap-2">
                        <RealtimeConsultationHistory
                          history={consultationHistory}
                          loading={historyLoading}
                          onFetch={fetchHistory}
                          onSelect={handleLoadHistory}
                          onDelete={deleteConsultation}
                          onUpdateTitle={updateRealtimeTitle}
                          onGetStats={getRealtimeStats}
                        />
                        <Button size="sm" variant={realtimeChartGenerated? "outline" : "default"} onClick={handleNewChart}>
                          {realtimeChartGenerated ? '重起' : '起盘'}
                        </Button>
                      </div>
                    </div>
                    <Input
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      placeholder="例如：求职面试、项目合作..."
                      disabled={!!currentConsultationId}
                    />
                  </div>

                  <div className="bg-card rounded-lg p-4 border border-border">
                    <label className="text-sm font-medium mb-2 block">选择日期</label>
                    {isMobile ? (
                      <>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          onClick={() => setRealtimeDateDrawerOpen(true)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(realtimeDate, 'yyyy年M月d日')}
                        </Button>

                        <Drawer open={realtimeDateDrawerOpen} onOpenChange={setRealtimeDateDrawerOpen}>
                          <DrawerContent className="h-[100vh] max-h-[100vh] rounded-none [&>div:first-child]:hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b">
                              <DrawerTitle>选择日期</DrawerTitle>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setRealtimeDateDrawerOpen(false)}
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                            
                            <div className="px-4 py-6 bg-primary/5 border-b">
                              <p className="text-sm text-muted-foreground mb-1">已选择</p>
                              <p className="text-2xl font-semibold">{format(realtimeDate, 'yyyy年M月d日')}</p>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center p-4">
                              <Calendar
                                mode="single"
                                selected={realtimeDate}
                                onSelect={(d) => d && setRealtimeDate(d)}
                                defaultMonth={realtimeDate}
                                className="pointer-events-auto scale-110"
                              />
                            </div>

                            <div className="px-4 py-4 border-t flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setRealtimeDate(new Date())}
                              >
                                今天
                              </Button>
                              <Button
                                type="button"
                                className="flex-1"
                                onClick={() => setRealtimeDateDrawerOpen(false)}
                              >
                                确认
                              </Button>
                            </div>
                          </DrawerContent>
                        </Drawer>
                      </>
                    ) : (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn('w-full justify-start text-left font-normal')}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(realtimeDate, 'yyyy-MM-dd')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={realtimeDate}
                            onSelect={(d) => d && setRealtimeDate(d)}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>

                  <div className="bg-card rounded-lg p-4 border border-border">
                    <label className="text-sm font-medium mb-2 block">选择时辰</label>
                    {isMobile ? (
                      <>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          onClick={() => setRealtimeHourDrawerOpen(true)}
                        >
                          {HOUR_OPTIONS.find(opt => opt.value === realtimeHour)?.label || '选择时辰'}
                        </Button>

                        <Drawer open={realtimeHourDrawerOpen} onOpenChange={setRealtimeHourDrawerOpen}>
                          <DrawerContent className="h-[100vh] max-h-[100vh] rounded-none [&>div:first-child]:hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b">
                              <DrawerTitle>选择时辰</DrawerTitle>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setRealtimeHourDrawerOpen(false)}
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                            <ScrollArea className="flex-1">
                              <div className="divide-y">
                                {HOUR_OPTIONS.map((opt) => {
                                  const isSelected = realtimeHour === opt.value;
                                  return (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      className={cn(
                                        "w-full px-4 py-4 flex items-center justify-between text-left transition-colors",
                                        isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                                      )}
                                      onClick={() => {
                                        setRealtimeHour(opt.value);
                                        setRealtimeHourDrawerOpen(false);
                                      }}
                                    >
                                      <span className="text-base">{opt.label}</span>
                                      {isSelected && <Check className="h-5 w-5 text-primary" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </ScrollArea>
                          </DrawerContent>
                        </Drawer>
                      </>
                    ) : (
                      <Select value={realtimeHour.toString()} onValueChange={(v) => setRealtimeHour(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOUR_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value.toString()}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </>
              )}

              {/* Destiny Chart - Client Selection */}
              {chartMode === '命理盘' && (
                <div className="bg-card rounded-lg p-4 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">客户列表</span>
                    </div>
                    <div className="flex gap-2">
                      {selectedClient && (
                        <DestinyConsultationHistory
                          clientId={selectedClient.id}
                          clients={clients}
                          consultations={destinyConsultations}
                          loading={destinyConsultationsLoading}
                          onFetch={fetchDestinyConsultations}
                          onSelect={handleLoadDestinyHistory}
                          onDelete={deleteDestinyConsultation}
                          getMessages={getDestinyInterpretations}
                          onUpdateTitle={updateDestinyTitle}
                          onGetStats={getDestinyStats}
                        />
                      )}
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingClient(null);
                          setShowClientForm(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        添加
                      </Button>
                    </div>
                  </div>

                  <ClientList
                    clients={clients}
                    selectedClientId={selectedClient?.id || null}
                    onViewDestiny={setSelectedClient}
                    onEditClient={(client) => {
                      setEditingClient(client);
                      setShowClientForm(true);
                    }}
                    onDeleteClient={handleDeleteClient}
                    loading={clientsLoading}
                  />

                  {!selectedClient && clients.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        请选择一个客户以查看其命盘
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Lunar & Chart Info - Show for destiny chart always, for realtime only after generated */}
              {chart && lunar && (chartMode === '命理盘' || realtimeChartGenerated) && (
                <>
                  {/* Four Pillars Display */}
                  <FourPillarsDisplay pillars={chart.pillars} />

                  {/* Liu Yao Display */}
                  <LiuYaoDisplay pillars={chart.pillars} />

                  <div className="bg-card rounded-lg p-4 border border-border">
                    <h3 className="text-sm font-medium mb-3">农历信息</h3>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p>农历: {LUNAR_MONTHS[lunar.month - 1]}月{LUNAR_DAYS[lunar.day - 1]}</p>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg p-4 border border-border">
                    <h3 className="text-sm font-medium mb-3">盘局信息</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">局数:</div>
                      <div>{chart.yinYang === 'Yin' ? '阴' : '阳'}遁{chart.juNum}局</div>
                      <div className="text-muted-foreground">值符:</div>
                      <div>{chart.zhiFu}</div>
                      <div className="text-muted-foreground">值使:</div>
                      <div>{chart.zhiShi}</div>
                      <div className="text-muted-foreground">旬首:</div>
                      <div>{chart.xunShou}</div>
                      <div className="text-muted-foreground">空亡:</div>
                      <div>{chart.voidBranches}</div>
                      <div className="text-muted-foreground">马星:</div>
                      <div>{chart.horseBranch}</div>
                    </div>
                  </div>

                  {/* Big Cycles & Annual Cycles - Only for Destiny Chart */}
                  {chartMode === '命理盘' && chart.bigCycles.length > 0 && (
                    <CyclesDisplay
                      bigCycles={chart.bigCycles}
                      annualCycles={chart.annualCycles}
                      birthYear={chart.date.getFullYear()}
                    />
                  )}
                </>
              )}
            </div>

            {/* Center - Chart Grid */}
            <div className="lg:col-span-1 order-2 lg:order-none">
              {(chartMode === '命理盘' || realtimeChartGenerated) ? (
                <ChartGrid data={chart} />
              ) : (
                <div className="bg-card rounded-lg p-8 border border-border h-full flex items-center justify-center min-h-[400px]">
                  <p className="text-muted-foreground text-center">
                    请设置日期时辰后<br />点击「新建」生成盘局
                  </p>
                </div>
              )}
            </div>

            {/* Right Panel - AI Chat */}
            <div className="order-3 lg:order-none">
              {(chartMode === '命理盘' || realtimeChartGenerated) ? (
                <AIChatPanel
                  chart={chart}
                  clientName={chartMode === '命理盘' ? selectedClient?.name : undefined}
                  chartMode={chartMode}
                  onExportReport={chart ? handleExportReport : undefined}
                  onNewConversation={chartMode === '命理盘' ? handleNewDestinyConsultation : handleNewChart}
                  issue={chartMode === '实时盘' ? issue : undefined}
                  loadedMessages={chartMode === '实时盘' ? loadedMessages : undefined}
                  currentConsultationId={chartMode === '实时盘' ? currentConsultationId : undefined}
                  onSaveConsultation={chartMode === '实时盘' ? handleSaveConsultation : undefined}
                  onSaveMessage={chartMode === '实时盘' ? handleSaveMessage : undefined}
                  clients={chartMode === '命理盘' ? clients : undefined}
                  currentClientId={chartMode === '命理盘' ? selectedClient?.id : undefined}
                  onSaveDestinyConsultation={chartMode === '命理盘' ? handleSaveDestinyConsultation : undefined}
                  onSaveDestinyMessage={chartMode === '命理盘' ? handleSaveDestinyMessage : undefined}
                  loadedDestinyMessages={chartMode === '命理盘' ? loadedDestinyMessages : undefined}
                  currentDestinyConsultationId={chartMode === '命理盘' ? currentDestinyConsultationId : undefined}
                />
              ) : (
                <div className="bg-card rounded-lg p-8 border border-border h-full flex items-center justify-center min-h-[400px]">
                  <p className="text-muted-foreground text-center">
                    生成盘局后<br />可进行 AI 分析
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Client Form Dialog */}
      <ClientForm
        open={showClientForm}
        onClose={() => {
          setShowClientForm(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        client={editingClient}
      />
    </div>
  );
};

export default Index;
