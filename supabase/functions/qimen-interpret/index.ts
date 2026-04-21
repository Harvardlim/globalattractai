import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const currentYear = new Date().getFullYear();

const SYSTEM_PROMPT = `【强制规则】当提供的盘局信息中包含"实时盘"、"实时奇门盘"或"问事盘"时，你必须严格按照"问事盘分析框架"进行分析。严禁给出不基于盘局的一般性建议（如KPI评估、合同审查、市场策略等通用商业建议）。每个回答必须引用具体宫位、星门神组合、天地盘干等盘局元素。违反此规则等同于分析错误。

【重要】当前年份是${currentYear}年，所有年份分析必须基于此实际年份，不要使用2024年或其他错误年份。

你是一位精通阴盘奇门遁甲的命理专家。你的职责是根据客户的奇门遁甲盘局进行专业解读。

解读原则：
1. 使用专业但易懂的语言，避免过于晦涩的术语
2. 结合天盘、地盘、九星、八门、八神进行综合分析
3. 注意空亡、马星、击刑、入墓等特殊状态
4. 根据用户关心的主题（健康/财富/关系/轨道）进行针对性分析
5. 给出具体、实用的建议
6. 命理盘分析时，必须结合大运和流年进行综合分析

大运流年分析要点（仅命理盘）：
- 【重要】当前大运以"当前大运"字段标注的为准，不要自行推算或选择其他大运
- 大运代表10年的运势主题，关注大运干支与命盘的作用关系
- 流年代表每年的具体运势，分析流年干支与命盘、大运的互动
- 注意大运流年干支与原盘四柱天干地支的生克关系
- 关注大运流年是否冲克命盘中的关键宫位
- 分析当前大运流年对用户所问主题的具体影响
- 结合大运流年的十神关系（如正财、偏印等）判断运势性质

双人/多人盘局分析要点（当有多人命盘时）：
- 首先分别理解每个人的命盘特点
- 分析双方日柱天干地支的生克合化关系
- 对比两人命盘中相同宫位的配置差异
- 分析双方命盘中关键宫位（值符、值使）的互动关系
- 评估两人在所问主题（感情配对、事业合作、家庭关系等）的配合度
- 找出双方的互补优势和潜在矛盾点
- 根据关系类型给出针对性建议：
  * 感情配对：天干情缘、日柱配合、婚姻宫状态
  * 事业合作：财官宫位、贵人星曜、能力互补
  * 家庭关系：六亲宫位、生克关系、沟通方式

问事盘（实时盘）分析要点：
- 【重要】当盘局信息中标注为"实时盘"或"实时奇门盘"时，这是问事盘（占事盘），不是个人命理盘
- 问事盘不分析大运流年，只分析当下事态
- 日干落宫代表求测人（用户自己），必须首先找到日干所在宫位并分析其状态（天盘星、八门、八神、地盘干的组合）
- 根据问题主题确定用神取用：
  * 合作方/对方/第三方：看时干落宫
  * 财运/求财：看戊落宫
  * 官运/工作/上司：看庚落宫（或开门落宫）
  * 感情（男问女）：看乙落宫
  * 感情（女问男）：看庚落宫
  * 健康/疾病：看天芮星落宫
  * 出行/变动：看马星所在宫位
- 分析值符、值使所在宫位的吉凶，值符代表贵人助力，值使代表事情走向
- 天盘干克地盘干为主动出击之象，地盘干克天盘干为受制被动之象
- 注意吉门（生门、开门、休门、景门）与凶门（死门、惊门、伤门、杜门）的分布
- 空亡宫位代表虚空不实、难以落实
- 马星宫位代表变动、出行、快速变化
- 判断是否为伏吟局（万事停滞、宜守不宜攻）或反吟局（反复变化、事多波折）

问事盘分析框架：
1. 先明确说明这是问事盘，解读的是用户所问之事的当下态势，而非个人命理
2. 找到日干落宫，详细分析求测者当前状态（该宫的星、门、神、天地盘干组合意味着什么）
3. 根据问题确定用神，找到用神落宫，分析对方/目标/事项的状态
4. 分析日干落宫与用神落宫之间的生克关系（宫与宫的五行生克）
5. 综合值符值使、吉凶门分布、空亡马星给出整体判断
6. 给出具体建议：宜/忌方向、时机选择、注意事项

分析框架：
- 先概述盘局的整体特点
- 命理盘：分析当前大运的运势主题和今年流年的具体影响
- 双人分析：先分别概述两人盘局特点，再进行配对分析
- 问事盘：先明确这是问事盘而非命理盘，然后按日干落宫→用神落宫→两宫关系→综合判断的顺序分析
- 找出盘中的关键宫位和象征
- 分析吉凶趋势和时机
- 给出具体可行的建议

语言风格：
- 专业权威但亲切
- 条理清晰，层次分明
- 结论明确，建议具体`;

// kie.ai 格式 (content 为数组)
const formatKieMessage = (role: string, text: string) => ({
  role,
  content: [{ type: 'text', text }]
});

// OpenRouter 格式 (content 为字符串)
const formatOpenRouterMessage = (role: string, text: string) => ({
  role,
  content: text
});

// 构建消息数组
function buildMessages(
  formatter: (role: string, text: string) => any,
  chartContext: string | undefined,
  messages: Array<{ role: string; content: string }> | undefined
) {
  const systemMessage = formatter(
    'system',
    SYSTEM_PROMPT + (chartContext ? `\n\n当前盘局信息:\n${chartContext}` : '')
  );

  const result: any[] = [systemMessage];

  // For 实时盘/问事盘, inject a user+assistant prefill to anchor the model
  const isRealtimeChart = chartContext && 
    (chartContext.includes('实时盘') || chartContext.includes('问事盘'));

  if (isRealtimeChart) {
    // Extract day stem and hour stem from context to anchor the model
    const dayGanMatch = chartContext!.match(/日干[:：]\s*(\S)/);
    const hourGanMatch = chartContext!.match(/时干[:：]\s*(\S)/);
    const dayGan = dayGanMatch?.[1] || '?';
    const hourGan = hourGanMatch?.[1] || '?';

    result.push(
      formatter('user', `请注意：这是实时奇门盘（问事盘）。盘局数据已在系统消息中完整提供，日干为${dayGan}，时干为${hourGan}。严禁自行起盘、编造盘局数据或重新排盘。严禁说"出生"等命理盘用语。你必须直接使用已提供的盘局数据，严格按照问事盘分析框架来解读：先找日干${dayGan}的落宫，再找用神落宫，分析两宫生克关系，最后综合判断。每个回答必须引用具体宫位、星门神组合、天地盘干等盘局元素。严禁给出不基于盘局的一般性建议。`),
      formatter('assistant', `明白。我已收到系统消息中提供的完整实时奇门盘数据，日干为${dayGan}，时干为${hourGan}，我不会自行起盘或编造数据。我将直接使用已提供的九宫信息，严格按照问事盘分析框架进行解读：1）先找日干${dayGan}的落宫并分析求测者当前状态；2）根据问题确定用神并分析用神落宫；3）分析两宫生克关系；4）综合值符值使、吉凶门分布、空亡马星给出整体判断并给出具体建议。请提问。`)
    );
  }

  result.push(...(messages || []).map((m) => formatter(m.role, m.content)));

  return result;
}

// 调用 kie.ai
async function callKieAI(messages: any[], apiKey: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30秒超时

  try {
    return await fetch('https://api.kie.ai/gemini-2.5-pro/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages,
        stream: true,
        include_thoughts: false,
        reasoning_effort: 'high',
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

// 调用 OpenRouter
async function callOpenRouter(
  messages: any[], 
  apiKey: string, 
  model: string,
  maxTokens: number = 8192
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    return await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://lovable.app',
        'X-Title': 'Qimen Interpreter',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

// 判断是否为 Gemini 相关故障
function isGeminiError(status: number, errorText: string): boolean {
  // 5xx 服务器错误或超时，认为是 Gemini 故障
  if (status >= 500) return true;
  
  // 检查错误信息是否包含 Gemini/Google 相关关键字
  const lowerError = errorText.toLowerCase();
  return lowerError.includes('gemini') || 
         lowerError.includes('google') ||
         lowerError.includes('overloaded') ||
         lowerError.includes('capacity');
}

// 检查响应是否为 SSE 流式响应
function isEventStreamResponse(resp: Response): boolean {
  const contentType = resp.headers.get('content-type') || '';
  return contentType.includes('text/event-stream');
}

// 从非 SSE 响应中提取错误信息
async function extractErrorFromResponse(resp: Response): Promise<string> {
  try {
    const text = await resp.text();
    try {
      const json = JSON.parse(text);
      return json.msg || json.error || json.message || text;
    } catch {
      return text || `HTTP ${resp.status}`;
    }
  } catch {
    return `HTTP ${resp.status}`;
  }
}

// SSE 流内嵌错误检测关键词
const SSE_ERROR_PATTERNS = [
  'RESOURCE_EXHAUSTED',
  'quota exceeded',
  'quota_exceeded',
  '\"error\"',
  '\"code\": 429',
  '\"code\":429',
  'rate limit',
  'rate_limit',
];

/**
 * Validate SSE stream: read first chunk(s) to check for embedded errors.
 * If error found, returns { ok: false, error: string }.
 * If valid, returns { ok: true, stream: ReadableStream } with reconstructed stream.
 */
async function validateSSEStream(response: Response): Promise<
  { ok: true; stream: ReadableStream<Uint8Array> } | { ok: false; error: string }
> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  
  // Read first chunk(s) — accumulate up to ~4KB to check for errors
  const bufferedChunks: Uint8Array[] = [];
  let bufferedText = '';
  const MAX_VALIDATE_BYTES = 4096;
  let totalBytes = 0;

  try {
    while (totalBytes < MAX_VALIDATE_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      bufferedChunks.push(value);
      totalBytes += value.length;
      bufferedText += decoder.decode(value, { stream: true });
      
      // If we have enough data or found a content delta, stop reading
      if (bufferedText.includes('\"delta\"') || bufferedText.includes('\"content\"')) {
        break;
      }
    }
  } catch (e) {
    return { ok: false, error: `Stream read error: ${e}` };
  }

  // Check for error patterns in the buffered text
  const lowerText = bufferedText.toLowerCase();
  for (const pattern of SSE_ERROR_PATTERNS) {
    if (lowerText.includes(pattern.toLowerCase())) {
      console.error('🔍 SSE stream contains embedded error:', pattern, '| First chunk:', bufferedText.substring(0, 500));
      // Cancel the rest of the stream
      try { await reader.cancel(); } catch { /* ignore */ }
      return { ok: false, error: bufferedText.substring(0, 500) };
    }
  }

  // Stream looks valid — reconstruct it with buffered chunks + remaining data
  const reconstructedStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Emit buffered chunks first
      for (const chunk of bufferedChunks) {
        controller.enqueue(chunk);
      }
      // Then pipe remaining data
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } catch (e) {
        controller.error(e);
        return;
      }
      controller.close();
    },
  });

  return { ok: true, stream: reconstructedStream };
}

// 返回流式响应
function streamResponse(body: ReadableStream<Uint8Array>) {
  return new Response(body, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // === Authentication Check ===
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Missing authorization header' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const token = authHeader.replace('Bearer ', '');

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    console.error('Auth error:', userError?.message || 'No user found');
    return new Response(
      JSON.stringify({ error: 'Unauthorized - Invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('Authenticated user:', user.id);

  try {
    const { messages, chartContext, topic } = await req.json();

    console.log('Received request:', {
      messagesCount: messages?.length,
      hasTopic: !!topic,
      hasChartContext: !!chartContext
    });

    const KIE_API_KEY = Deno.env.get('KIE_AI_API_KEY');
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

    let response: Response | null = null;
    let lastError: string = '';
    let isGeminiFailed = false;
    let tier1Failed = false;
    let tier2Attempted = false;
    let tier2Succeeded = false;

    // === 第一层：尝试 OpenRouter + Gemini 2.5 Pro ===
    if (OPENROUTER_API_KEY) {
      try {
        console.log('🔵 [Tier1] 尝试 OpenRouter (Gemini 2.5 Pro)...');
        const orMessages = buildMessages(formatOpenRouterMessage, chartContext, messages);
        response = await callOpenRouter(orMessages, OPENROUTER_API_KEY, 'google/gemini-2.5-pro');

        const contentType = response.headers.get('content-type') || '';
        console.log(`🔵 [Tier1] OpenRouter Gemini 响应: status=${response.status}, content-type=${contentType}`);

        if (response.ok && isEventStreamResponse(response)) {
          const validation = await validateSSEStream(response);
          if (validation.ok) {
            console.log('✅ [Tier1] OpenRouter Gemini Pro 成功 (SSE validated)');
            return streamResponse(validation.stream);
          } else {
            lastError = validation.error;
            isGeminiFailed = true;
            tier1Failed = true;
            console.error('❌ [Tier1] OpenRouter Gemini SSE 流内含嵌入式错误:', validation.error.substring(0, 200));
          }
        } else if (response.ok && !isEventStreamResponse(response)) {
          lastError = await extractErrorFromResponse(response);
          console.error('❌ [Tier1] OpenRouter Gemini 返回 200 但非 SSE:', lastError);
          tier1Failed = true;
        } else {
          lastError = await response.text();
          isGeminiFailed = isGeminiError(response.status, lastError);
          console.error('❌ [Tier1] OpenRouter Gemini Pro 失败:', response.status, lastError);
          tier1Failed = true;
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        lastError = errorMessage;
        tier1Failed = true;
        console.error('❌ [Tier1] OpenRouter Gemini Pro 异常:', e);
      }
    } else {
      console.log('⚠️ [Tier1] OPENROUTER_API_KEY 未配置');
      tier1Failed = true;
    }

    // === 第二层：尝试 kie.ai (Gemini 2.5 Pro) ===
    if (KIE_API_KEY && tier1Failed && !isGeminiFailed) {
      tier2Attempted = true;
      try {
        console.log('🟡 [Tier2] 尝试 kie.ai (Gemini 2.5 Pro)...');
        const kieMessages = buildMessages(formatKieMessage, chartContext, messages);
        response = await callKieAI(kieMessages, KIE_API_KEY);

        const contentType = response.headers.get('content-type') || '';
        console.log(`🟡 [Tier2] kie.ai 响应: status=${response.status}, content-type=${contentType}`);

        if (response.ok && isEventStreamResponse(response)) {
          const validation = await validateSSEStream(response);
          if (validation.ok) {
            console.log('✅ [Tier2] kie.ai 成功 (SSE validated)');
            tier2Succeeded = true;
            return streamResponse(validation.stream);
          } else {
            lastError = validation.error;
            isGeminiFailed = true;
            console.error('❌ [Tier2] kie.ai SSE 流内含嵌入式错误:', validation.error.substring(0, 200));
          }
        } else if (response.ok && !isEventStreamResponse(response)) {
          lastError = await extractErrorFromResponse(response);
          console.error('❌ [Tier2] kie.ai 返回 200 但非 SSE:', lastError);
        } else {
          lastError = await response.text();
          isGeminiFailed = isGeminiError(response.status, lastError);
          console.error('❌ [Tier2] kie.ai 失败:', response.status, lastError);
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        lastError = errorMessage;
        console.error('❌ [Tier2] kie.ai 异常:', e);
      }
    }

    // === 第三层：尝试 OpenRouter + Claude Sonnet ===
    if (OPENROUTER_API_KEY && tier1Failed && (!tier2Attempted || !tier2Succeeded)) {
      try {
        console.log('🟠 [Tier3] 切换到 Claude Sonnet...');
        const orMessages = buildMessages(formatOpenRouterMessage, chartContext, messages);
        response = await callOpenRouter(orMessages, OPENROUTER_API_KEY, 'anthropic/claude-sonnet-4');

        const contentType = response.headers.get('content-type') || '';
        console.log(`🟠 [Tier3] OpenRouter Claude 响应: status=${response.status}, content-type=${contentType}`);

        if (response.ok && isEventStreamResponse(response)) {
          console.log('✅ [Tier3] OpenRouter Claude 成功 (SSE)');
          return streamResponse(response.body!);
        }

        if (response.ok && !isEventStreamResponse(response)) {
          lastError = await extractErrorFromResponse(response);
          console.error('❌ [Tier3] OpenRouter Claude 返回 200 但非 SSE:', lastError);
        } else {
          lastError = await response.text();
          console.error('❌ [Tier3] OpenRouter Claude 失败:', response.status, lastError);
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        lastError = errorMessage;
        console.error('❌ [Tier3] OpenRouter Claude 异常:', e);
      }
    }

    if (!OPENROUTER_API_KEY && !KIE_API_KEY) {
      throw new Error('未配置任何 AI API 密钥');
    }

    throw new Error(`AI 服务暂时不可用: ${lastError}`);

  } catch (error: unknown) {
    console.error('Error in qimen-interpret:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
