import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ChartData, ChartType, Gender } from '@/types';
import { Client } from '@/types/database';
import { generateChart } from '@/lib/qimenEngine';
import { supabase } from '@/integrations/supabase/client';
import AnalysisTopics from './AnalysisTopics';
import ClientMentionInput from './ClientMentionInput';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatPanelProps {
  chart: ChartData | null;
  clientName?: string;
  chartMode?: string;
  onExportReport?: () => void;
  onNewConversation?: () => void;
  // Event chart history support
  issue?: string;
  loadedMessages?: Message[];
  currentConsultationId?: string | null;
  onSaveConsultation?: (topic?: string) => Promise<string | null>;
  onSaveMessage?: (consultationId: string, role: string, content: string) => void;
  // Client mention support for destiny chart
  clients?: Client[];
  currentClientId?: string;
  // Destiny chart history support
  onSaveDestinyConsultation?: (topic?: string, mentionedClientIds?: string[]) => Promise<string | null>;
  onSaveDestinyMessage?: (consultationId: string, role: string, content: string) => void;
  loadedDestinyMessages?: Message[];
  currentDestinyConsultationId?: string | null;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({
  chart,
  clientName,
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
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [destinyConsultationId, setDestinyConsultationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages from history (event chart)
  useEffect(() => {
    if (chartMode === '实时盘' && loadedMessages && loadedMessages.length > 0) {
      setMessages(loadedMessages);
      setConsultationId(currentConsultationId || null);
    }
  }, [loadedMessages, currentConsultationId, chartMode]);

  // Load messages from history (destiny chart)
  useEffect(() => {
    if (chartMode === '命理盘' && loadedDestinyMessages && loadedDestinyMessages.length > 0) {
      setMessages(loadedDestinyMessages);
      setDestinyConsultationId(currentDestinyConsultationId || null);
    }
  }, [loadedDestinyMessages, currentDestinyConsultationId, chartMode]);

  // Reset messages when chart mode changes or consultation is cleared
  useEffect(() => {
    if (chartMode === '实时盘' && !currentConsultationId && !loadedMessages?.length) {
      setMessages([]);
      setConsultationId(null);
      setSelectedTopic(null);
    }
    if (chartMode === '命理盘' && !currentDestinyConsultationId && !loadedDestinyMessages?.length) {
      setMessages([]);
      setDestinyConsultationId(null);
      setSelectedTopic(null);
    }
  }, [currentConsultationId, loadedMessages, currentDestinyConsultationId, loadedDestinyMessages, chartMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Render mentions as styled tags in messages
  const renderMessageWithMentions = useCallback((content: string) => {
    if (!clients.length) return content;
    
    // Build regex to match @ClientName patterns
    const clientNames = clients.map(c => c.name).filter(Boolean);
    if (!clientNames.length) return content;
    
    // Escape special regex characters and create pattern
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
              className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary-foreground/20 text-primary-foreground font-medium text-xs mx-0.5"
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
      // Find current big cycle
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

    return `
奇门遁甲盘局信息:
- 客户: ${clientName || chart.name}
- 性别: ${chart.gender}
- 日期: ${chart.date.toLocaleDateString()}
- 局数: ${chart.yinYang === 'Yin' ? '阴' : '阳'}遁${chart.juNum}局${chart.isFuYin ? ' (伏吟局)' : chart.isStarFuYin ? ' (星伏吟)' : chart.isDoorFuYin ? ' (门伏吟)' : ''}${chart.isFanYin ? ' (反吟局)' : chart.isStarFanYin ? ' (星反吟)' : chart.isDoorFanYin ? ' (门反吟)' : ''}
- 四柱: ${chart.pillars.year.gan}${chart.pillars.year.zhi} ${chart.pillars.month.gan}${chart.pillars.month.zhi} ${chart.pillars.day.gan}${chart.pillars.day.zhi} ${chart.pillars.hour.gan}${chart.pillars.hour.zhi}
- 值符: ${chart.zhiFu}
- 值使: ${chart.zhiShi}
- 空亡: ${chart.voidBranches}
- 马星: ${chart.horseBranch}

九宫信息:
${palaceInfo}
`;
  };

  // Build context for mentioned clients (for dual-person analysis)
  const buildMentionedClientContext = useCallback((client: Client): string => {
    const birthDate = new Date(client.birth_date);
    birthDate.setHours(client.birth_hour, client.birth_minute || 0, 0, 0);
    
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

    // Find current big cycle
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

    try {
      const chartContext = buildChartContext();
      const topicContext = selectedTopic ? `\n用户希望重点分析【${selectedTopic}】方面。` : '';
      
      // Build context for mentioned clients
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
        
        // 按行解析 SSE 消息
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留最后不完整的行

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const deltaContent = parsed.choices?.[0]?.delta?.content;
              
              if (deltaContent) {
                accumulatedContent += deltaContent;
                // 实时更新最后一条消息
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
              // 忽略解析错误的行
            }
          }
        }
      }

      // 如果没有收到任何内容，显示错误
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
        // Save consultation and messages for event chart
        if (chartMode === '实时盘' && onSaveConsultation && onSaveMessage) {
          let savedId = consultationId;
          
          // If no consultation exists, create one
          if (!savedId) {
            savedId = await onSaveConsultation(selectedTopic || undefined);
            if (savedId) {
              setConsultationId(savedId);
            }
          }
          
          // Save both messages
          if (savedId) {
            await onSaveMessage(savedId, 'user', content);
            await onSaveMessage(savedId, 'assistant', accumulatedContent);
          }
        }
        
        // Save consultation and messages for destiny chart
        if (chartMode === '命理盘' && onSaveDestinyConsultation && onSaveDestinyMessage) {
          let savedId = destinyConsultationId;
          
          // If no consultation exists, create one
          if (!savedId) {
            const mentionedIds = mentionedClients.map(c => c.id);
            savedId = await onSaveDestinyConsultation(selectedTopic || undefined, mentionedIds.length > 0 ? mentionedIds : undefined);
            if (savedId) {
              setDestinyConsultationId(savedId);
            }
          }
          
          // Save both messages
          if (savedId) {
            await onSaveDestinyMessage(savedId, 'user', content);
            await onSaveDestinyMessage(savedId, 'assistant', accumulatedContent);
          }
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

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    const topicLabels: Record<string, string> = {
      '健康': '请分析此盘的健康运势，包括身体状况、需要注意的方面以及调理建议。',
      '财富': '请分析此盘的财运，包括正财偏财、投资方向、求财时机等。',
      '关系': '请分析此盘的感情人际运势，包括桃花运、婚姻状况、贵人关系等。',
      '轨道': '请分析此盘的事业发展方向，包括适合的行业、发展机遇、职业规划等。',
      '综合': '请对此盘进行全面综合分析，涵盖健康、财运、感情、事业各方面。',
    };
    sendMessage(topicLabels[topic] || '请分析此盘。');
  };

  return (
    <div className="bg-card rounded-lg border border-border flex flex-col h-[450px] sm:h-[500px] md:h-[600px]">
      <div className="p-2 sm:p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-medium text-sm sm:text-base">AI 解盘助手</h3>
        <div className="flex items-center gap-2">
          {onNewConversation && (
            <Button variant="outline" size="sm" onClick={onNewConversation} className="text-xs sm:text-sm">
              新建
            </Button>
          )}
          {onExportReport && messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={onExportReport} className="text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              导出
            </Button>
          )}
        </div>
      </div>

      {/* Analysis Topics */}
      <div className="p-2 sm:p-3 border-b border-border">
        <AnalysisTopics
          selectedTopic={selectedTopic}
          onSelectTopic={handleTopicSelect}
          disabled={loading || !chart}
        />
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-2 sm:p-3 mb-10" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <p className="text-xs sm:text-sm">选择上方专项分析主题</p>
            <p className="text-xs sm:text-sm">或输入问题开始解读</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'p-2 sm:p-3 rounded-lg text-xs sm:text-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-4 sm:ml-8'
                    : 'bg-muted mr-4 sm:mr-8'
                )}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">
                    {renderMessageWithMentions(msg.content)}
                  </p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-2 prose-headings:mb-1 sm:prose-headings:mt-3 sm:prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
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

      {/* Input - Use ClientMentionInput for destiny mode */}
      <div className="p-3 border-t border-border">
        {chartMode === '命理盘' && clients.length > 0 ? (
          <ClientMentionInput
            value={input}
            onChange={setInput}
            onSubmit={(content, mentionedClients) => sendMessage(content, mentionedClients)}
            clients={clients}
            currentClientId={currentClientId}
            disabled={loading || !chart}
            placeholder="输入问题，@提及其他客户进行双人分析..."
          />
        ) : (
          <div className="flex gap-2 bg-white">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入问题..."
              onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage(input)}
              disabled={loading || !chart}
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={loading || !chart || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatPanel;
