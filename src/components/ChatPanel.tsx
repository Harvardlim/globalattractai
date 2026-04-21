import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, Compass, HelpCircle, History, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Client, RealtimeConsultation, ChatConversation } from '@/types/database';
import { ChartData, ChartType, Gender } from '@/types';
import { generateChart } from '@/lib/qimenEngine';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import UniversalMentionInput, { MentionedItems } from './UniversalMentionInput';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChartGrid from './ChartGrid';
import FourPillarsDisplay from './FourPillarsDisplay';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  clients: Client[];
  consultations: RealtimeConsultation[];
  conversations: ChatConversation[];
  conversationsLoading: boolean;
  currentConversationId: string | null;
  onFetchConversations: () => void;
  onCreateConversation: (title?: string) => Promise<string | null>;
  onUpdateConversationTitle: (id: string, title: string) => void;
  onDeleteConversation: (id: string) => Promise<void>;
  onSaveMessage: (conversationId: string, role: 'user' | 'assistant', content: string, clientIds?: string[], consultationIds?: string[]) => void;
  onLoadConversation: (id: string) => void;
  loadedMessages: Message[];
  onNewConversation: () => void;
  onConversationCreated?: (id: string) => void;
  onGetConversationStats: (ids: string[]) => Promise<Record<string, { count: number; lastMessage: string | null }>>;
  onMessagesChange?: (messages: Message[]) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  clients,
  consultations,
  conversations,
  conversationsLoading,
  currentConversationId,
  onFetchConversations,
  onCreateConversation,
  onUpdateConversationTitle,
  onDeleteConversation,
  onSaveMessage,
  onLoadConversation,
  loadedMessages,
  onNewConversation,
  onConversationCreated,
  onGetConversationStats,
  onMessagesChange,
}) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages from history
  useEffect(() => {
    if (loadedMessages && loadedMessages.length > 0) {
      setMessages(loadedMessages);
      setConversationId(currentConversationId);
    }
  }, [loadedMessages, currentConversationId]);

  // Reset when conversation is cleared
  useEffect(() => {
    if (!currentConversationId && !loadedMessages?.length) {
      setMessages([]);
      setConversationId(null);
    }
  }, [currentConversationId, loadedMessages]);

  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Build chart context for a client
  const buildClientChartContext = useCallback((client: Client): string => {
    const birthDate = new Date(client.birth_date);
    birthDate.setHours(client.birth_hour, client.birth_minute || 0, 0, 0);

    const chart = generateChart(
      birthDate,
      ChartType.LIFETIME,
      client.name,
      client.gender === '男' ? Gender.MALE : Gender.FEMALE
    );

    const currentYear = new Date().getFullYear();
    const birthYear = chart.date.getFullYear();

    const palaceInfo = chart.palaces
      .filter(p => p.id !== 5)
      .map(p => `${p.name}宫: 天盘${p.skyStem}${p.skyStem2 || ''} 地盘${p.earthStem}${p.earthStem2 || ''} ${p.star} ${p.door} ${p.god}${p.empty ? ' (空亡)' : ''}${p.horse ? ' (马星)' : ''}`)
      .join('\n');

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

    return `
客户「${client.name}」的命盘信息:
- 性别: ${client.gender}
- 生日: ${client.birth_date}
- 局数: ${chart.yinYang === 'Yin' ? '阴' : '阳'}遁${chart.juNum}局
- 四柱: ${chart.pillars.year.gan}${chart.pillars.year.zhi} ${chart.pillars.month.gan}${chart.pillars.month.zhi} ${chart.pillars.day.gan}${chart.pillars.day.zhi} ${chart.pillars.hour.gan}${chart.pillars.hour.zhi}
- 值符: ${chart.zhiFu}
- 值使: ${chart.zhiShi}
- 空亡: ${chart.voidBranches}
- 马星: ${chart.horseBranch}

九宫信息:
${palaceInfo}

【当前运势关键信息】
- 当前大运: ${currentBigCycle ? `${currentBigCycle.gan}${currentBigCycle.zhi} (${currentBigCycle.desc})，${currentBigCycle.year}年起` : '未知'}
- 当前流年: ${currentYear}年 ${currentAnnual ? `${currentAnnual.gan}${currentAnnual.zhi}` : ''}

大运排盘:
${bigCyclesStr}

近期流年:
${annualCyclesStr}
`;
  }, []);

  // Build context for a consultation/event
  const buildConsultationContext = useCallback((consultation: RealtimeConsultation): string => {
    const chartData = consultation.chart_data as ChartData;
    const displayName = consultation.issue || consultation.title || format(new Date(consultation.chart_date), 'MM-dd HH:mm');

    const palaceInfo = chartData.palaces
      ?.filter(p => p.id !== 5)
      .map(p => `${p.name}宫: 天盘${p.skyStem}${p.skyStem2 || ''} 地盘${p.earthStem}${p.earthStem2 || ''} ${p.star} ${p.door} ${p.god}${p.empty ? ' (空亡)' : ''}${p.horse ? ' (马星)' : ''}`)
      .join('\n') || '无数据';

    return `
事项「${displayName}」的奇门盘:
- 时间: ${format(new Date(consultation.chart_date), 'yyyy-MM-dd HH:mm')}
- 主题: ${consultation.topic || '未指定'}
- 局数: ${chartData.yinYang === 'Yin' ? '阴' : '阳'}遁${chartData.juNum}局
- 四柱: ${chartData.pillars?.year?.gan || ''}${chartData.pillars?.year?.zhi || ''} ${chartData.pillars?.month?.gan || ''}${chartData.pillars?.month?.zhi || ''} ${chartData.pillars?.day?.gan || ''}${chartData.pillars?.day?.zhi || ''} ${chartData.pillars?.hour?.gan || ''}${chartData.pillars?.hour?.zhi || ''}
- 值符: ${chartData.zhiFu || ''}
- 值使: ${chartData.zhiShi || ''}
- 空亡: ${chartData.voidBranches || ''}
- 马星: ${chartData.horseBranch || ''}

九宫信息:
${palaceInfo}
`;
  }, []);

  // Build auto realtime chart context when no mentions
  const buildAutoRealtimeContext = useCallback((): string => {
    const now = new Date();
    const chart = generateChart(now, ChartType.REALTIME, '实时盘', Gender.MALE);

    const palaceInfo = chart.palaces
      .filter(p => p.id !== 5)
      .map(p => `${p.name}宫: 天盘${p.skyStem}${p.skyStem2 || ''} 地盘${p.earthStem}${p.earthStem2 || ''} ${p.star} ${p.door} ${p.god}${p.empty ? ' (空亡)' : ''}${p.horse ? ' (马星)' : ''}`)
      .join('\n');

    return `以下为当前时间自动生成的实时奇门盘，请基于此盘局信息回答用户问题：
- 时间: ${format(now, 'yyyy-MM-dd HH:mm')}
- 局数: ${chart.yinYang === 'Yin' ? '阴' : '阳'}遁${chart.juNum}局
- 四柱: ${chart.pillars.year.gan}${chart.pillars.year.zhi} ${chart.pillars.month.gan}${chart.pillars.month.zhi} ${chart.pillars.day.gan}${chart.pillars.day.zhi} ${chart.pillars.hour.gan}${chart.pillars.hour.zhi}
- 值符: ${chart.zhiFu}
- 值使: ${chart.zhiShi}
- 空亡: ${chart.voidBranches}
- 马星: ${chart.horseBranch}
${chart.isFuYin ? '- 伏吟局\n' : ''}${chart.isFanYin ? '- 反吟局\n' : ''}
九宫信息:
${palaceInfo}`;
  }, []);

  const sendMessage = async (content: string, mentionedItems: MentionedItems) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content };
    const assistantMessage: Message = { role: 'assistant', content: '' };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build context from mentioned items
      let mentionedContext = '';

      if (mentionedItems.clients.length > 0) {
        mentionedContext += '\n\n===== 提及的客户命盘 =====\n';
        for (const client of mentionedItems.clients) {
          mentionedContext += buildClientChartContext(client);
        }
      }

      if (mentionedItems.consultations.length > 0) {
        mentionedContext += '\n\n===== 提及的事项记录 =====\n';
        for (const c of mentionedItems.consultations) {
          mentionedContext += buildConsultationContext(c);
        }
      }

      const systemPrompt = `你是一个专业的奇门遁甲分析师AI助手。用户可能会：
1. 询问关于客户命盘的问题（用户会@提及客户名字）
2. 询问关于某个事项/事件的问题（用户会@提及事项）
3. 进行多人对比分析
4. 或者提出任何问题

无论用户提出什么问题，你都必须结合提供的奇门盘局信息进行分析回答。即使用户没有@提及任何客户或事项，系统也会自动提供当前时间的实时奇门盘，你必须基于该盘局信息来回答用户的问题，不要给出一般性的回答。`;

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
          chartContext: mentionedContext || buildAutoRealtimeContext(),
          mode: 'chat',
        }),
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

      // Detect raw error JSON in accumulated content
      const isErrorResponse = accumulatedContent && (
        (accumulatedContent.includes('"error"') && (
          accumulatedContent.includes('RESOURCE_EXHAUSTED') ||
          accumulatedContent.includes('quota') ||
          accumulatedContent.includes('429') ||
          accumulatedContent.includes('rate_limit')
        ))
      );

      if (!accumulatedContent || isErrorResponse) {
        const friendlyMsg = isErrorResponse
          ? 'AI 服务暂时繁忙，请稍后重试。'
          : '抱歉，无法生成回复。';
        accumulatedContent = friendlyMsg;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: friendlyMsg,
          };
          return newMessages;
        });
      } else {
        // Save conversation and messages
        let savedId = conversationId;

        if (!savedId) {
          // Generate intelligent title based on context
          let title: string;
          
          if (mentionedItems.clients.length > 0) {
            // If mentioning clients, use their names
            const names = mentionedItems.clients.map(c => c.name).join(', ');
            title = `@${names} 命盘分析`;
          } else if (mentionedItems.consultations.length > 0) {
            // If mentioning consultations/matters
            const firstConsultation = mentionedItems.consultations[0];
            const issueText = firstConsultation.issue?.slice(0, 20) || '咨询';
            title = `事项分析 - ${issueText}${(firstConsultation.issue?.length || 0) > 20 ? '...' : ''}`;
          } else {
            // Default: extract key part of user question
            const cleanContent = content
              .replace(/请帮我分析|我想了解|请分析|帮我看看|请问/g, '')
              .trim();
            title = cleanContent.slice(0, 30) + (cleanContent.length > 30 ? '...' : '');
          }
          
          savedId = await onCreateConversation(title);
          if (savedId) {
            setConversationId(savedId);
            onConversationCreated?.(savedId);
          }
        }

        if (savedId) {
          const clientIds = mentionedItems.clients.map(c => c.id);
          const consultationIds = mentionedItems.consultations.map(c => c.id);
          onSaveMessage(savedId, 'user', content, clientIds, consultationIds);
          onSaveMessage(savedId, 'assistant', accumulatedContent);
        }
      }
    } catch (err) {
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
      setLoading(false);
    }
  };

  // Quick start functions
  const handleQuickStart = (type: 'event' | 'destiny' | 'free') => {
    const prompts: Record<string, string> = {
      event: '请帮我分析当前时间的奇门盘，我想了解当前的运势和适合做的事情。',
      destiny: '请帮我分析命盘。（提示：您可以@提及客户名字来分析特定客户的命盘）',
      free: '你好，我想了解一些关于奇门遁甲的知识。',
    };
    setInput(prompts[type]);
  };

  // Render mentions in messages
  const renderMessageWithMentions = useCallback((content: string) => {
    const allPatterns: { name: string; type: 'client' | 'consultation' }[] = [];

    clients.forEach(c => allPatterns.push({ name: c.name, type: 'client' }));
    consultations.forEach(c => {
      const displayName = c.issue || c.title || format(new Date(c.chart_date), 'MM-dd HH:mm');
      allPatterns.push({ name: displayName, type: 'consultation' });
    });

    if (allPatterns.length === 0) return content;

    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sortedPatterns = [...allPatterns].sort((a, b) => b.name.length - a.name.length);
    const patternStr = sortedPatterns.map(p => escapeRegExp(p.name)).join('|');
    const mentionRegex = new RegExp(`(@(?:${patternStr}))`, 'g');

    const parts = content.split(mentionRegex);

    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const name = part.slice(1);
        const item = allPatterns.find(p => p.name === name);
        if (item) {
          const isClient = item.type === 'client';
          return (
            <span
              key={index}
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded font-medium text-xs mx-0.5",
                isClient
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-secondary/50 text-secondary-foreground"
              )}
            >
              {part}
            </span>
          );
        }
      }
      return part;
    });
  }, [clients, consultations]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[500px] max-h-[800px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-end gap-2 mr-4">
        {/* {consultations.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Grid3X3 className="h-4 w-4 mr-1" />
                奇门盘
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-lg max-w-[95vw] sm:max-w-[500px] max-h-[85vh] overflow-hidden p-0">
              <DialogHeader className="px-4 pt-4 pb-2">
                <DialogTitle>奇门盘</DialogTitle>
              </DialogHeader>
              <div className="px-4 pb-4 space-y-4 overflow-auto max-h-[calc(85vh-60px)]">
                {consultations.length > 0 && consultations[0].chart_data && (
                  <>
                    <FourPillarsDisplay pillars={(consultations[0].chart_data as ChartData).pillars} />
                    <ChartGrid data={consultations[0].chart_data as ChartData} />
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )} */}
        {messages.length === 0 ? (
          <Button variant="outline" size="sm" onClick={() => navigate('/chat/history')}>
            <History className="h-4 w-4 mr-3" />
            历史记录
          </Button>
        ) : (
          <div></div>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="py-4">
            {/* Welcome Message */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">你好，我是奇门 AI</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                我是基于奇门遁甲的智能分析助手，可以帮助你解读命盘、分析时运、预测趋势。
              </p>
            </div>
            
            {/* Quick Start Prompt */}
            <p className="text-sm font-medium mb-3">你可以问我这些问题...</p>
            
            {/* Quick Action Chips */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleQuickStart('event')}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
              >
                <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">帮我起卦分析当前运势</span>
              </button>
              <button
                onClick={() => handleQuickStart('destiny')}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
              >
                <Compass className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">解读客户的命理盘</span>
              </button>
              <button
                onClick={() => handleQuickStart('free')}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
              >
                <HelpCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">询问奇门遁甲知识</span>
              </button>
            </div>
            
            {/* Hint */}
            <p className="text-xs text-muted-foreground mt-4">
              💡 输入 @ 可以提及客户或事项记录
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-2 mb-36">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-2xl text-sm px-4 py-3',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-8'
                    : 'bg-muted/60 mr-8'
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
              <div className="flex items-center gap-2 text-muted-foreground px-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">思考中...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="pt-3 pb-2 pl-3 pr-8 fixed bottom-0 w-full bg-white">
        <div className="relative">
          <UniversalMentionInput
            value={input}
            onChange={setInput}
            onSubmit={sendMessage}
            clients={clients}
            consultations={consultations}
            disabled={loading}
            placeholder="输入问题..."
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
