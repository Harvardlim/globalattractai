import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const currentYear = new Date().getFullYear();

const REPORT_SYSTEM_PROMPT = `你是一位精通阴盘奇门遁甲和八字命理的命理专家。你需要根据提供的完整命盘数据，生成一份专业的个人命理分析报告。

【重要】当前年份是${currentYear}年。

【核心分析原则】
1. 命宫核心：命宫 = 日干落在天盘的宫位。所有章节都要围绕命宫的星、门、神展开分析。
2. 对宫参照：命宫的对宫（对面宫位）是重要参照，反映外在环境、他人态度。提到对面宫位时使用"对宫"一词。
3. 八字十神结合：每个章节必须结合八字十神（正财、偏财、正官、七杀、正印、偏印、食神、伤官、比肩、劫财）进行分析，说明十神在命局中的状态（有根/无根、透干/暗藏）对该领域的影响。
4. 喜用神运势：运势分析必须基于喜用神和忌神，结合大运流年判断好运和低谷时期。走喜用神运=顺利期，走忌神运=挑战期。
5. 奇门盘象：结合九宫的星门神组合来细化判断。

报告要求：
1. 报告必须分为以下9个章节，每个章节用 ## 标题标记
2. 每个章节需要详细分析，给出具体建议
3. 语言风格：通俗易懂、亲切温暖，像朋友在聊天一样。不要堆砌专业术语，用日常语言讲清楚重点
4. 不需要解释什么是奇门遁甲、什么是八字，直接讲结论和影响
5. 必须基于实际盘局数据分析，不要泛泛而谈
6. 每个章节至少300字

报告章节：
## 性格特质
结合日主五行、十神格局（如食神格、正官格等）、命宫星门神、以及六爻分析来综合分析性格。说明哪些十神影响了思维方式和处事风格。六爻数据中的爻位（一爻到六爻）反映了此人的行事层次和人生格局，必须融入性格分析中。

## 关系运势
关系分析必须结合以下三个维度：
1. 奇门盘六合宫位：找到"六合"所落的宫位，分析该宫的星、门、神组合，判断此人的感情模式和关系质量。
2. 日柱天干五合：根据天干五合（甲己合、乙庚合、丙辛合、丁壬合、戊癸合），找到日干的五合对象落在哪个宫位，分析对象的特质和相处模式。
3. 命宫与六合宫、五合宫的生克关系：判断命宫与这两个宫位是生还是克，生=关系和谐助力，克=关系有冲突需要磨合。
4. 再结合八字十神：正财/偏财（男看妻）、正官/七杀（女看夫）的状态来综合分析。

## 健康提醒
健康分析必须以奇门盘"四害"宫位为核心：
1. 找出所有有四害（空亡、入墓、击刑、门迫）的宫位
2. 根据受害宫位的五行属性，对应人体器官和健康方向（水=肾/泌尿、木=肝/筋骨、火=心/眼/血液、土=脾胃/消化、金=肺/呼吸/皮肤）
3. 分析四害的类型对健康的具体影响：空亡=该方面能量不足、入墓=该方面功能受困、击刑=容易受伤或炎症、门迫=长期压力导致的问题
4. 结合日主五行旺衰来综合判断

## 适合行业
结合喜用神五行、十神特质（食伤=创意、财星=商业、官杀=管理、印星=教育）和命宫的星门组合来推荐行业。

## 财富分析
结合正财/偏财的有根无根、命宫与财宫的关系，以及大运流年中走财运的时期来分析。

## 学业进修
结合印星（正印/偏印）的状态和命宫的星门来分析学习方向。

## 贵人运势
结合命宫的六合、太阴等吉神以及八字中的神煞来分析贵人运。

## 运势走向
【重点章节】根据喜用神和忌神，逐段分析大运和近年流年的运势起伏：
- 哪些大运走的是喜用神？那些年份整体顺利，适合做什么？
- 哪些大运走的是忌神？需要注意什么？
- 当前所处的大运和近几年流年如何？是上升期还是调整期？
- 未来几年有什么重要的转折点？
用通俗的话说清楚，让人知道什么时候该冲、什么时候该守。

## 需要注意的事项
根据盘局中的"四害"信息（空亡、入墓、击刑、门迫）来分析此人需要注意的事项：
- 空亡：哪些方面容易落空？
- 入墓：哪些能量被"困住"了？
- 击刑：容易在哪些方面遇到冲突？
- 门迫：哪些方面会感到被压制？
每一项结合盘局数据，说清楚具体影响和应对建议。用大白话讲。`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
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
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { chartContext, clientName, clientId, reportId } = await req.json();

    // No quota or tier restrictions — unlimited report generation for all users

    // Call AI to generate report
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('AI service not configured');
    }

    const aiMessages = [
      { role: 'system', content: REPORT_SYSTEM_PROMPT + `\n\n命盘数据:\n${chartContext}` },
      { role: 'user', content: `请为「${clientName}」生成完整的命理分析报告。` }
    ];

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://lovable.app',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
        max_tokens: 8192,
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('AI API error:', errText);
      throw new Error('AI 服务暂时不可用，请稍后重试');
    }

    const aiResult = await aiResponse.json();
    const reportContent = aiResult.choices?.[0]?.message?.content;

    if (!reportContent) {
      throw new Error('AI 未返回有效内容');
    }

    // Parse sections from markdown
    const sections: Record<string, string> = {};
    const sectionRegex = /## (性格特质|关系运势|健康提醒|适合行业|财富分析|学业进修|贵人运势|运势走向|需要注意的事项)\s*\n([\s\S]*?)(?=\n## |$)/g;
    let match;
    while ((match = sectionRegex.exec(reportContent)) !== null) {
      sections[match[1]] = match[2].trim();
    }

    // Update the report record
    if (reportId) {
      await supabaseAdmin
        .from('client_reports')
        .update({
          report_content: reportContent,
          report_sections: sections,
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId)
        .eq('user_id', user.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reportContent, 
        sections,
        reportId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Report generation error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || '报告生成失败' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
