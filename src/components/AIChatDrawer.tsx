import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, FileText, X, MessageSquare, ChevronLeft, Grid3X3, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ChartData, ChartType, Gender } from '@/types';
import { Client, ANALYSIS_TOPICS } from '@/types/database';
import { generateChart } from '@/lib/qimenEngine';
import { supabase } from '@/integrations/supabase/client';
import AnalysisTopics from './AnalysisTopics';
import ClientMentionInput from './ClientMentionInput';
import ChartGrid from './ChartGrid';
import FourPillarsDisplay from './FourPillarsDisplay';
import ExportPdfDialog from './ExportPdfDialog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chart: ChartData | null;
  chart2?: ChartData | null;
  clientName?: string;
  clientName1?: string;
  clientName2?: string;
  chartMode?: string;
  onExportReport?: () => void;
  onNewConversation?: () => void;
  issue?: string;
  loadedMessages?: Message[];
  currentConsultationId?: string | null;
  onSaveConsultation?: (topic?: string) => Promise<string | null>;
  onSaveMessage?: (consultationId: string, role: string, content: string) => void;
  clients?: Client[];
  currentClientId?: string;
  onSaveDestinyConsultation?: (topic?: string, mentionedClientIds?: string[]) => Promise<string | null>;
  onSaveDestinyMessage?: (consultationId: string, role: string, content: string) => void;
  loadedDestinyMessages?: Message[];
  currentDestinyConsultationId?: string | null;
  autoPrompt?: string | null;
  onAutoPromptSent?: () => void;
}

const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  open,
  onOpenChange,
  chart,
  chart2,
  clientName,
  clientName1,
  clientName2,
  chartMode,
  onExportReport,
  onNewConversation,
  issue,
  loadedMessages,
  currentConsultationId,
  onSaveConsultation,
  onSaveMessage,
  clients = [],
  currentClientId,
  onSaveDestinyConsultation,
  onSaveDestinyMessage,
  loadedDestinyMessages,
  currentDestinyConsultationId,
  autoPrompt,
  onAutoPromptSent,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [destinyConsultationId, setDestinyConsultationId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chartPersonIndex, setChartPersonIndex] = useState(0); // 0 = person 1, 1 = person 2
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Lock body scroll and hide bottom nav when panel is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-ai-chat-open', 'true');
    } else {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-ai-chat-open');
      // Abort any ongoing request when panel closes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // Reset loading state
      setLoading(false);
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-ai-chat-open');
    };
  }, [open]);

  // Load messages from history
  useEffect(() => {
    if (chartMode === '实时盘' && loadedMessages && loadedMessages.length > 0) {
      setMessages(loadedMessages);
      setConsultationId(currentConsultationId || null);
      setShowChat(true);
    }
  }, [loadedMessages, currentConsultationId, chartMode]);

  useEffect(() => {
    if (chartMode === '命理盘' && loadedDestinyMessages && loadedDestinyMessages.length > 0) {
      setMessages(loadedDestinyMessages);
      setDestinyConsultationId(currentDestinyConsultationId || null);
      setShowChat(true);
    }
  }, [loadedDestinyMessages, currentDestinyConsultationId, chartMode]);

  // Load messages for synastry (合盘) mode
  useEffect(() => {
    if (chartMode === '合盘' && loadedMessages && loadedMessages.length > 0) {
      setMessages(loadedMessages);
      setConsultationId(currentConsultationId || null);
      setShowChat(true);
    }
  }, [loadedMessages, currentConsultationId, chartMode]);

  // Reset when conversation cleared
  useEffect(() => {
    if (chartMode === '实时盘' && !currentConsultationId && !loadedMessages?.length) {
      setMessages([]);
      setConsultationId(null);
      setSelectedTopic(null);
      setShowChat(false);
    }
    if (chartMode === '命理盘' && !currentDestinyConsultationId && !loadedDestinyMessages?.length) {
      setMessages([]);
      setDestinyConsultationId(null);
      setSelectedTopic(null);
      setShowChat(false);
    }
    if (chartMode === '合盘' && !currentConsultationId && !loadedMessages?.length) {
      setMessages([]);
      setConsultationId(null);
      setSelectedTopic(null);
      setShowChat(false);
    }
  }, [currentConsultationId, loadedMessages, currentDestinyConsultationId, loadedDestinyMessages, chartMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMessageWithMentions = useCallback((content: string) => {
    if (!clients.length) return content;
    
    const clientNames = clients.map(c => c.name).filter(Boolean);
    if (!clientNames.length) return content;
    
    const escapedNames = clientNames.map(name => 
      name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const pattern = new RegExp(`(@(?:${escapedNames.join('|')}))`, 'g');
    
    const parts = content.split(pattern);
    
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const clientName = part.slice(1);
        const client = clients.find(c => c.name === clientName);
        if (client) {
          return (
            <span 
              key={index} 
              className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium text-xs mx-0.5"
            >
              {part}
            </span>
          );
        }
      }
      return part;
    });
  }, [clients]);

  const buildChartContext = () => {
    if (!chart) return '';
    
    const currentYear = new Date().getFullYear();
    const birthYear = chart.date.getFullYear();
    
    const palaceInfo = chart.palaces
      .filter(p => p.id !== 5)
      .map(p => `${p.name}宫: 天盘${p.skyStem}${p.skyStem2 || ''} 地盘${p.earthStem}${p.earthStem2 || ''} ${p.star} ${p.door} ${p.god}${p.empty ? ' (空亡)' : ''}${p.horse ? ' (马星)' : ''}`)
      .join('\n');

    let cyclesInfo = '';
    if (chartMode === '命理盘' && chart.bigCycles.length > 0) {
      const currentBigCycleIdx = chart.bigCycles.findIndex((cycle, idx) => {
        if (idx === chart.bigCycles.length - 1) return true;
        const nextCycle = chart.bigCycles[idx + 1];
        return currentYear >= cycle.year && currentYear < nextCycle.year;
      });

      const bigCyclesStr = chart.bigCycles.map((c, idx) => {
        const age = idx === 0 ? '出生' : `${c.year - birthYear}岁`;
        const isCurrent = idx === currentBigCycleIdx;
        return `${age}: ${c.gan}${c.zhi} (${c.desc})${isCurrent ? ' ←当前' : ''}`;
      }).join('\n');

      const annualCyclesStr = chart.annualCycles.map(c => {
        const isCurrent = c.year === currentYear;
        const displayAge = c.age <= 0 ? '-' : `${c.age}岁`;
        return `${c.year}: ${c.gan}${c.zhi} (${displayAge})${isCurrent ? ' ←今年' : ''}`;
      }).join('\n');

      const currentBigCycle = currentBigCycleIdx >= 0 ? chart.bigCycles[currentBigCycleIdx] : null;
      const currentAnnual = chart.annualCycles.find(c => c.year === currentYear);

      cyclesInfo = `

【当前运势关键信息】
- 当前大运: ${currentBigCycle ? `${currentBigCycle.gan}${currentBigCycle.zhi} (${currentBigCycle.desc})，${currentBigCycle.year}年起` : '未知'}
- 当前流年: ${currentYear}年 ${currentAnnual ? `${currentAnnual.gan}${currentAnnual.zhi}` : ''}

大运排盘:
${bigCyclesStr}

近期流年:
${annualCyclesStr}`;
    }

    const isRealtime = chartMode === '实时盘';
    
    const header = isRealtime 
      ? `【这是实时奇门盘（问事盘），请严格按照问事盘分析框架进行解读，不要给出一般性建议】\n\n实时奇门盘盘局信息:`
      : `奇门遁甲盘局信息:`;
    
    const clientLine = isRealtime ? '' : `\n- 客户: ${clientName || chart.name}\n- 性别: ${chart.gender}`;

    return `
${header}${clientLine}
- 时间: ${chart.date.toLocaleDateString()} ${chart.date.toLocaleTimeString()}
- 局数: ${chart.yinYang === 'Yin' ? '阴' : '阳'}遁${chart.juNum}局${chart.isFuYin ? ' (伏吟局)' : chart.isStarFuYin ? ' (星伏吟)' : chart.isDoorFuYin ? ' (门伏吟)' : ''}${chart.isFanYin ? ' (反吟局)' : chart.isStarFanYin ? ' (星反吟)' : chart.isDoorFanYin ? ' (门反吟)' : ''}
- 四柱: ${chart.pillars.year.gan}${chart.pillars.year.zhi} ${chart.pillars.month.gan}${chart.pillars.month.zhi} ${chart.pillars.day.gan}${chart.pillars.day.zhi} ${chart.pillars.hour.gan}${chart.pillars.hour.zhi}
- 日干: ${chart.pillars.day.gan}
- 时干: ${chart.pillars.hour.gan}
- 值符: ${chart.zhiFu}
- 值使: ${chart.zhiShi}
- 空亡: ${chart.voidBranches}
- 马星: ${chart.horseBranch}

九宫信息:
${palaceInfo}
`;
  };

  const buildMentionedClientContext = useCallback((client: Client): string => {
    const birthDate = new Date(client.birth_date);
    birthDate.setHours(client.birth_hour ?? 12, client.birth_minute || 0, 0, 0);
    
    const mentionedChart = generateChart(
      birthDate, 
      ChartType.LIFETIME, 
      client.name, 
      client.gender === '男' ? Gender.MALE : Gender.FEMALE
    );
    
    const currentYear = new Date().getFullYear();
    const birthYear = mentionedChart.date.getFullYear();
    
    const palaceInfo = mentionedChart.palaces
      .filter(p => p.id !== 5)
      .map(p => `${p.name}宫: 天盘${p.skyStem}${p.skyStem2 || ''} 地盘${p.earthStem}${p.earthStem2 || ''} ${p.star} ${p.door} ${p.god}${p.empty ? ' (空亡)' : ''}${p.horse ? ' (马星)' : ''}`)
      .join('\n');

    const currentBigCycleIdx = mentionedChart.bigCycles.findIndex((cycle, idx) => {
      if (idx === mentionedChart.bigCycles.length - 1) return true;
      const nextCycle = mentionedChart.bigCycles[idx + 1];
      return currentYear >= cycle.year && currentYear < nextCycle.year;
    });

    const bigCyclesStr = mentionedChart.bigCycles.map((c, idx) => {
      const age = idx === 0 ? '出生' : `${c.year - birthYear}岁`;
      const isCurrent = idx === currentBigCycleIdx;
      return `${age}: ${c.gan}${c.zhi} (${c.desc})${isCurrent ? ' ←当前' : ''}`;
    }).join('\n');

    const annualCyclesStr = mentionedChart.annualCycles.map(c => {
      const isCurrent = c.year === currentYear;
      const displayAge = c.age <= 0 ? '-' : `${c.age}岁`;
      return `${c.year}: ${c.gan}${c.zhi} (${displayAge})${isCurrent ? ' ←今年' : ''}`;
    }).join('\n');

    const currentBigCycleMentioned = currentBigCycleIdx >= 0 ? mentionedChart.bigCycles[currentBigCycleIdx] : null;
    const currentAnnualMentioned = mentionedChart.annualCycles.find(c => c.year === currentYear);

    return `
被提及客户「${client.name}」的命盘信息:
- 性别: ${client.gender}
- 生日: ${client.birth_date}
- 局数: ${mentionedChart.yinYang === 'Yin' ? '阴' : '阳'}遁${mentionedChart.juNum}局
- 四柱: ${mentionedChart.pillars.year.gan}${mentionedChart.pillars.year.zhi} ${mentionedChart.pillars.month.gan}${mentionedChart.pillars.month.zhi} ${mentionedChart.pillars.day.gan}${mentionedChart.pillars.day.zhi} ${mentionedChart.pillars.hour.gan}${mentionedChart.pillars.hour.zhi}
- 值符: ${mentionedChart.zhiFu}
- 值使: ${mentionedChart.zhiShi}
- 空亡: ${mentionedChart.voidBranches}
- 马星: ${mentionedChart.horseBranch}

九宫信息:
${palaceInfo}

【当前运势关键信息】
- 当前大运: ${currentBigCycleMentioned ? `${currentBigCycleMentioned.gan}${currentBigCycleMentioned.zhi} (${currentBigCycleMentioned.desc})，${currentBigCycleMentioned.year}年起` : '未知'}
- 当前流年: ${currentYear}年 ${currentAnnualMentioned ? `${currentAnnualMentioned.gan}${currentAnnualMentioned.zhi}` : ''}

大运排盘:
${bigCyclesStr}

近期流年:
${annualCyclesStr}
`;
  }, []);

  const sendMessage = async (content: string, mentionedClients: Client[] = []) => {
    if (!content.trim() || !chart) return;

    const userMessage: Message = { role: 'user', content };
    const assistantMessage: Message = { role: 'assistant', content: '' };
    
    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setLoading(true);
    setShowChat(true);

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const chartContext = buildChartContext();
      const topicContext = selectedTopic ? `\n用户希望重点分析【${selectedTopic}】方面。` : '';
      
      let mentionedContext = '';
      if (mentionedClients.length > 0) {
        mentionedContext = '\n\n===== 双人/多人分析 =====\n用户正在进行多人盘局对比分析。\n';
        for (const client of mentionedClients) {
          mentionedContext += buildMentionedClientContext(client);
        }
        mentionedContext += '\n请结合主客户和被提及客户的盘局信息，进行双人关系分析。';
      }

      // Get user session for authenticated request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('请先登录后再使用 AI 分析功能');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/qimen-interpret`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content }
          ],
          chartContext: chartContext + topicContext + mentionedContext,
          topic: selectedTopic,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || errorJson.msg || `HTTP error: ${response.status}`);
        } catch (e) {
          if (e instanceof SyntaxError) {
            throw new Error(`HTTP error: ${response.status}`);
          }
          throw e;
        }
      }

      // Check if response is SSE stream - if not, extract error from JSON body
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream')) {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.msg || json.error || json.message || '服务维护中，请稍后重试');
        } catch (e) {
          if (e instanceof SyntaxError) {
            throw new Error('服务返回异常，请稍后重试');
          }
          throw e;
        }
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const deltaContent = parsed.choices?.[0]?.delta?.content;
              
              if (deltaContent) {
                accumulatedContent += deltaContent;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: accumulatedContent,
                  };
                  return newMessages;
                });
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      if (!accumulatedContent) {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: '抱歉，无法生成解读。',
          };
          return newMessages;
        });
      } else {
        // Save consultation for event chart or synastry
        if ((chartMode === '实时盘' || chartMode === '合盘') && onSaveConsultation && onSaveMessage) {
          let savedId = consultationId;
          if (!savedId) {
            savedId = await onSaveConsultation(selectedTopic || undefined);
            if (savedId) setConsultationId(savedId);
          }
          if (savedId) {
            await onSaveMessage(savedId, 'user', content);
            await onSaveMessage(savedId, 'assistant', accumulatedContent);
          }
        }
        
        // Save consultation for destiny chart
        if (chartMode === '命理盘' && onSaveDestinyConsultation && onSaveDestinyMessage) {
          let savedId = destinyConsultationId;
          if (!savedId) {
            const mentionedIds = mentionedClients.map(c => c.id);
            savedId = await onSaveDestinyConsultation(selectedTopic || undefined, mentionedIds.length > 0 ? mentionedIds : undefined);
            if (savedId) setDestinyConsultationId(savedId);
          }
          if (savedId) {
            await onSaveDestinyMessage(savedId, 'user', content);
            await onSaveDestinyMessage(savedId, 'assistant', accumulatedContent);
          }
        }
      }
    } catch (err) {
      // Don't show error if request was aborted (user closed drawer)
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      
      console.error('AI Error:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      const displayMessage = errorMessage.includes('登录') 
        ? errorMessage 
        : '抱歉，服务暂时不可用，请稍后重试。';
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: displayMessage,
        };
        return newMessages;
      });
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  // Auto-send prompt when autoPrompt is set and drawer is open
  const autoPromptSentRef = useRef(false);
  useEffect(() => {
    if (open && autoPrompt && !autoPromptSentRef.current && !loading && chart) {
      autoPromptSentRef.current = true;
      sendMessage(autoPrompt);
      onAutoPromptSent?.();
    }
    if (!open) {
      autoPromptSentRef.current = false;
    }
  }, [open, autoPrompt]);

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    const topicLabels: Record<string, string> = {
      '健康': '请分析此盘的健康运势，包括身体状况、需要注意的方面以及调理建议。',
      '财富': '请分析此盘的财运，包括正财偏财、投资方向、求财时机等。',
      '关系': '请分析此盘的感情人际运势，包括桃花运、婚姻状况、贵人关系等。',
      '轨道': '请分析此盘的事业发展方向，包括适合的行业、发展机遇、职业规划等。',
      '学业': '请分析此盘的学业运势，包括考试运、学习方向、进修建议等。',
      '家庭': '请分析此盘的家庭运势，包括家庭和睦、子女运、亲情关系等。',
      '贵人': '请分析此盘的贵人运，包括贵人方位、合作关系、人脉拓展等。',
      '风险': '请分析此盘的风险预警，包括可能的灾厄、官非、小人等需要注意的方面。',
      '综合': '请对此盘进行全面综合分析，涵盖健康、财运、感情、事业各方面。',
    };
    sendMessage(topicLabels[topic] || '请分析此盘。');
  };

  const handleBack = () => {
    // Don't reset anything - just go back to menu while preserving the conversation
    // If loading, abort the request first
    if (loading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
    setShowChat(false);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setSelectedTopic(null);
    setConsultationId(null);
    setDestinyConsultationId(null);
    setShowChat(false);
    onNewConversation?.();
    onOpenChange(false)
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showChat ? (
              <button onClick={handleBack} className="p-1 -ml-1 hover:bg-muted rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : (
              <button onClick={() => onOpenChange(false)} className="p-1 -ml-1 hover:bg-muted rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-base font-semibold">
              {showChat ? (selectedTopic || '自由对话') : 'AI 解盘助手'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Export PDF Dialog */}
            {showChat && messages.length > 0 && (
              <ExportPdfDialog
                title={`${clientName || '实时盘'} - ${selectedTopic || '综合分析'}`}
                messages={messages}
                chartInfo={chart ? `${chart.yinYang === 'Yin' ? '阴' : '阳'}遁${chart.juNum}局 | 值符：${chart.zhiFu} | 值使：${chart.zhiShi}` : undefined}
                clientName={clientName}
                pillars={chart?.pillars}
                qimenChart={chart}
                hideHour={chart?.pillars ? !chart.pillars.hour?.gan : false}
                trigger={
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                }
              />
            )}
            {showChat && chart && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-lg max-w-[95vw] sm:max-w-[500px] max-h-[85vh] overflow-hidden p-0">
                  <DialogHeader className="px-4 pt-4 pb-2">
                    <DialogTitle>
                      {chartMode === '合盘' ? (
                        <div className="flex flex-col items-center gap-3">
                          <span>八字/奇门盘</span>
                          <div className="flex gap-1">
                            <Button
                              variant={chartPersonIndex === 0 ? "default" : "outline"}
                              size="sm"
                              className="h-7 text-xs px-3"
                              onClick={() => setChartPersonIndex(0)}
                            >
                              {clientName1 || '第一人'}
                            </Button>
                            <Button
                              variant={chartPersonIndex === 1 ? "default" : "outline"}
                              size="sm"
                              className="h-7 text-xs px-3"
                              onClick={() => setChartPersonIndex(1)}
                            >
                              {clientName2 || '第二人'}
                            </Button>
                          </div>
                        </div>
                      ) : '八字/奇门盘'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="px-4 pb-4 space-y-4 overflow-auto max-h-[calc(85vh-60px)]">
                    {(() => {
                      const displayChart = (chartMode === '合盘' && chartPersonIndex === 1 && chart2) ? chart2 : chart;
                      return displayChart ? (
                        <>
                          <FourPillarsDisplay pillars={displayChart.pillars} />
                          <ChartGrid data={displayChart} />
                        </>
                      ) : null;
                    })()}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {showChat && (
              <Button size="sm" onClick={handleNewConversation}>
                关闭对话
              </Button>
            )}
          </div>
        </div>
      </div>

      {!showChat ? (
        /* Topic Selection Menu */
        <ScrollArea className="flex-1">
          {/* Client Info */}
          {clientName && (
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {clientName.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{clientName}</div>
                  <div className="text-sm text-muted-foreground">
                    {chartMode === '命理盘' ? '命理盘分析' : '实时盘分析'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Topic List */}
          <div className="py-2">
            <div className="px-4 py-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                专项解读
              </h4>
            </div>
            <AnalysisTopics
              selectedTopic={selectedTopic}
              onSelectTopic={handleTopicSelect}
              disabled={loading || !chart}
              variant="list"
            />
          </div>

          {/* Free Chat Entry */}
          <div className="px-4 py-2 mb-8">
            <button
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors rounded-lg",
                "hover:bg-muted/50 active:bg-muted border border-dashed border-border",
                (!chart || loading) && "opacity-50 pointer-events-none"
              )}
              onClick={() => setShowChat(true)}
              disabled={loading || !chart}
            >
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium text-sm">自由提问</div>
                <div className="text-xs text-muted-foreground">输入任何问题进行解读</div>
              </div>
            </button>
          </div>
        </ScrollArea>
      ) : (
        /* Chat View */
        <>
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">输入问题开始解读</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'p-3 rounded-xl text-sm',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-8'
                        : 'bg-muted mr-8'
                    )}
                  >
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">
                        {renderMessageWithMentions(msg.content)}
                      </p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">正在解读...</span>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 flex-shrink-0 pb-safe border-t border-border">
            {chartMode === '命理盘' && clients.length > 0 ? (
              <ClientMentionInput
                value={input}
                onChange={setInput}
                onSubmit={(content, mentionedClients) => sendMessage(content, mentionedClients)}
                clients={clients}
                currentClientId={currentClientId}
                disabled={loading || !chart}
                placeholder="输入问题，@提及其他客户..."
              />              
            ) : (
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage(input)}
                  placeholder="输入问题..."
                  disabled={loading || !chart}
                  rows={3}
                  className={cn(
                    "flex w-full rounded-2xl border border-input bg-background pl-4 pr-12 py-2.5 text-base ring-offset-background",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                    "overflow-y-auto md:text-sm antialiased",
                    // These two lines ensure the text is solid and visible
                    "text-foreground opacity-100", 
                    "min-h-[44px] max-h-[120px]"
                  )}
                  style={{ 
                    caretColor: 'auto', // Let the browser handle the cursor naturally
                    color: 'inherit'    // Force it to use the standard text color
                  }}
                />

                {/* <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入问题..."
                  onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage(input)}
                  disabled={loading || !chart}
                  className="rounded-full"
                /> */}
                <Button
                  size="icon"
                  onClick={() => sendMessage(input)}
                  disabled={loading || !chart || !input.trim()}
                  className="rounded-full flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center mt-2">
              解读是由 AI 自动汇总，仅供参考，如有关键决策请咨询专业人士。
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatDrawer;