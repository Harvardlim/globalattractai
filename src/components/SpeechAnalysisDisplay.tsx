import React, { useMemo, useState } from 'react';
import { ChartData, PalaceData } from '@/types';
import { hasFourHarms, findMingGong } from '@/components/WealthAnalysisDisplay';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, MessageCircle, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { getComponentT } from '@/data/destinyTranslations';

// 九星语商数据 - 基于宫位九星的表达风格
interface StarSpeechInfo {
  star: string;
  style: string;
  traits: string[];
  tips: string[];
  mingGongNote?: string;
}

const STAR_SPEECH_DATA: Record<string, StarSpeechInfo> = {
  '天蓬': {
    star: '天蓬',
    style: '学什么都是照耀，光而不耀，静水深流',
    traits: ['多讲出奇制胜的故事', '深藏不露的智慧表达', '以柔克刚的沟通方式'],
    tips: ['语言风格偏沉稳内敛', '善于用故事暗示深意', '适合一对一深度沟通'],
  },
  '天任': {
    star: '天任',
    style: '慢节奏，稳中求进，来日方长',
    traits: ['巅峰相见，语迟者贵', '直播周期要拉长', '多讲坚韧道来的故事'],
    tips: ['不急于表达，慢工出细活', '用真实经历打动人', '适合长期内容输出'],
  },
  '天冲': {
    star: '天冲',
    style: '平稳之中突然出金句，抑扬顿挫，有波动',
    traits: ['震宫情绪价值达到极致', '多研究电视剧，模仿跌宕起伏', '表情、语气、手势到位，用抑扬顿挫的语气带动情绪'],
    tips: ['善用情绪波动制造记忆点', '语言要有戏剧张力', '适合演讲和直播'],
    mingGongNote: '命宫：必须发挥情绪价值，语气跌宕起伏',
  },
  '天辅': {
    star: '天辅',
    style: '柔和纯澈的，多用反问句，多提问',
    traits: ['抛出仿佛无助的问题，带动粉丝互动', '把你想讲的话，通过提问引起好奇', '再用故事的方式解答'],
    tips: ['善用提问引导思考', '温和但有深度', '适合教学和咨询类表达'],
    mingGongNote: '命宫：孔子、革新，大方向价值观不变，正反案例多种，正面反面都要讲，可以根据时事的故事展开',
  },
  '天英': {
    star: '天英',
    style: '讲有高度有层次，高素质，修行的话',
    traits: ['语言有格局感', '善于提升话题高度', '用修行和哲理打动人'],
    tips: ['多用有深度的词汇', '引用经典和智慧语录', '适合知识型内容输出'],
  },
  '天芮': {
    star: '天芮',
    style: '如大地，谦逊有礼，厚重包容',
    traits: ['朴实无华，承载托起', '向死而生的表达力量', '与德行相关的，国内外词语'],
    tips: ['用真诚打动人', '不需要华丽辞藻', '适合传递价值观和信念'],
  },
  '天柱': {
    star: '天柱',
    style: '聊吃的，社会话题，结合所在的门选题',
    traits: ['关注热点，网络流行语', '兑宫讲话要有网感', '跟紧时事热点'],
    tips: ['善用流行文化和热梗', '语言接地气有亲和力', '适合社交媒体和短视频'],
  },
  '天心': {
    star: '天心',
    style: '自强不息，领导力，批发，裂变，大规模生意',
    traits: ['高维智慧，发挥自己', '看名人领袖传记', '星星之火，可以燎原'],
    tips: ['给我一个杠杆，我能翘起整个地球', '治大国如烹小鲜', '适合商业演讲和领导力表达'],
  },
  '天禽': {
    star: '天禽',
    style: '中正平和，稳重大气',
    traits: ['居中调和的沟通风格', '善于协调各方观点', '语言平衡有力'],
    tips: ['做桥梁和纽带型表达', '善于总结和归纳', '适合主持和协调类工作'],
  },
};

interface SpeechAnalysisResult {
  palace: PalaceData;
  selectionReason: string;
  star: string;
  speech: StarSpeechInfo;
  mingGongHasHarms: boolean;
}

const analyzeSpeech = (chart: ChartData): SpeechAnalysisResult | null => {
  const palaces = chart.palaces.filter(p => p.id !== 5);
  const mingGong = findMingGong(chart);
  if (!mingGong) return null;

  let selectedPalace = mingGong;
  let selectionReason = '命宫';

  if (hasFourHarms(selectedPalace)) {
    const shengMenPalace = palaces.find(p => p.door === '生门');
    if (shengMenPalace && !hasFourHarms(shengMenPalace)) {
      selectedPalace = shengMenPalace;
      selectionReason = '生门落宫';
    } else {
      const kaiMenPalace = palaces.find(p => p.door === '开门');
      if (kaiMenPalace && !hasFourHarms(kaiMenPalace)) {
        selectedPalace = kaiMenPalace;
        selectionReason = '开门落宫';
      } else {
        const hourStem = chart.pillars.hour.gan;
        let hourStemToFind = hourStem;
        if (hourStem === '甲') {
          hourStemToFind = chart.xunShou?.slice(-1) || hourStem;
        }
        const hourPalace = palaces.find(p => p.skyStem === hourStemToFind || p.earthStem === hourStemToFind);
        if (hourPalace && !hasFourHarms(hourPalace)) {
          selectedPalace = hourPalace;
          selectionReason = '时干落宫';
        } else {
          const cleanPalace = palaces.find(p => !hasFourHarms(p));
          if (cleanPalace) {
            selectedPalace = cleanPalace;
            selectionReason = '无害宫位';
          }
        }
      }
    }
  }

  const star = selectedPalace.star;
  const speech = STAR_SPEECH_DATA[star];
  if (!speech) return null;

  return {
    palace: selectedPalace,
    selectionReason,
    star,
    speech,
    mingGongHasHarms: hasFourHarms(mingGong),
  };
};

interface SpeechAnalysisDisplayProps {
  chart: ChartData;
}

const SpeechAnalysisDisplay: React.FC<SpeechAnalysisDisplayProps> = ({ chart }) => {
  const [open, setOpen] = useState(false);
  const { currentLanguage } = useLanguage();
  const ct = getComponentT(currentLanguage);
  const analysis = useMemo(() => analyzeSpeech(chart), [chart]);

  if (!analysis) return null;

  const { speech, selectionReason, palace, mingGongHasHarms } = analysis;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-card rounded-lg border border-border">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-indigo-500" />
            <span className="font-medium text-sm">{ct.speechExpression}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 font-medium">
              {speech.star}
            </span>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
          <div className="space-y-3">
            {/* 来源说明 */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{ct.fromSource}：{selectionReason}（{palace.name}·{palace.position}）</span>
              {mingGongHasHarms && selectionReason !== '命宫' && (
                <span className="flex items-center gap-0.5 text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  {ct.mingGongHasHarms}
                </span>
              )}
            </div>

            {/* 表达风格 */}
            <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-3 border border-indigo-200/50 dark:border-indigo-800/30">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400">{ct.speechStyle}</span>
                  <p className="text-sm mt-1 font-medium">{speech.style}</p>
                </div>
              </div>
            </div>

            {/* 命宫特别提示 */}
            {speech.mingGongNote && selectionReason === '命宫' && (
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2.5 border border-amber-200/50 dark:border-amber-800/30">
                <p className="text-xs text-amber-700 dark:text-amber-400">💡 {speech.mingGongNote}</p>
              </div>
            )}

            {/* 表达特征 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{ct.speechTraits}</span>
              </div>
              <div className="space-y-1 pl-1">
                {speech.traits.map((trait, idx) => (
                  <div key={idx} className="flex gap-2 text-sm">
                    <span className="text-indigo-500 flex-shrink-0">•</span>
                    <span>{trait}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 实操建议 */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">{ct.practicalTips}</span>
              {speech.tips.map((tip, idx) => (
                <div key={idx} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-indigo-400 flex-shrink-0">→</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default SpeechAnalysisDisplay;
