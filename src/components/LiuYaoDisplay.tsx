import React, { useState, useMemo } from "react";
import { FourPillars } from "@/types";
import { cn } from "@/lib/utils";
import { analyzeNumberEnhanced } from "@/utils/enhancedAnalysisUtils";
import { Combination } from "@/types/index";
import { luckyStars, unluckyStars, EnergyStarInfo } from "@/data/energyEncyclopediaData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, BookOpen } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getLiuYaoT } from "@/data/destinyTranslations";

const allStars: EnergyStarInfo[] = [...luckyStars, ...unluckyStars];

// 六爻映射表 - 每个天干对应的6个地支位置
// 一爻到六爻的地支索引
const LIU_YAO_MAP: Record<number, number[]> = {
  0: [0, 2, 4, 6, 8, 10], // 甲: 子寅辰午申戌
  1: [7, 5, 3, 1, 11, 9], // 乙: 未巳卯丑亥酉
  2: [4, 6, 8, 10, 0, 2], // 丙: 辰午申戌子寅
  3: [5, 3, 1, 11, 9, 7], // 丁: 巳卯丑亥酉未
  4: [2, 4, 6, 8, 10, 0], // 戊: 寅辰午申戌子
  5: [3, 1, 11, 9, 7, 5], // 己: 卯丑亥酉未巳
  6: [0, 2, 4, 6, 8, 10], // 庚: 子寅辰午申戌
  7: [1, 11, 9, 7, 5, 3], // 辛: 丑亥酉未巳卯
  8: [0, 2, 4, 6, 8, 10], // 壬: 子寅辰午申戌
  9: [7, 5, 3, 1, 11, 9], // 癸: 未巳卯丑亥酉
};

// 六爻详细信息
interface YaoDetail {
  name: string;
  title: string;
  traits: string;
  color: string;
  quickRef: string[];  // 快速参考要点
  yijingExplanation: {
    position: string;      // 爻位解说
    symbolism: string;     // 象征意义
    classic: string;       // 易经原典
  };
  personality: {
    overview: string;
    decisionMaking: string;
    workStyle: string;
    relationships: string;
    strengths: string[];
    weaknesses: string[];
  };
}

const YAO_DETAILS: YaoDetail[] = [
  {
    name: "一爻",
    title: "平民",
    traits: "善良、简单、低调",
    color: "text-slate-600",
    quickRef: ["踏实", "老实干活", "实在", "执行力强"],
    yijingExplanation: {
      position: "初爻为卦之始，位居最下，象征事物的萌芽阶段。如潜龙勿用，宜韬光养晦。",
      symbolism: "代表草根、基层、起步阶段。如同种子刚入土，需扎根蓄力，不宜妄动。",
      classic: "《易·乾》：初九，潜龙勿用。象曰：潜龙勿用，阳在下也。",
    },
    personality: {
      overview: "一爻之人朴实无华，脚踏实地，不好高骛远。性格温和善良，待人真诚，不喜张扬。",
      decisionMaking: "做决定时偏向保守稳妥，不冒险，喜欢选择安全可靠的方案。遇事先观望，不急于表态。",
      workStyle: "工作踏实认真，执行力强，善于完成具体任务。不喜欢出风头，默默付出。",
      relationships: "待人和善，容易相处，但不善于主动社交。重视家庭和身边的人。",
      strengths: ["务实可靠", "执行力强", "不浮躁", "善于倾听"],
      weaknesses: ["缺乏野心", "容易满足", "不善争取", "格局较小"],
    },
  },
  {
    name: "二爻",
    title: "商贾",
    traits: "有钱、聪明、商务",
    color: "text-emerald-600",
    quickRef: ["看中钱", "理性", "有管理能力", "懂用人", "格局还可以", "值符一般没问题"],
    yijingExplanation: {
      position: "二爻居下卦之中，得中位，象征内卦的核心。虽不在高位，却是实干家。",
      symbolism: "代表中层管理、商贾阶层。与五爻相应，能获得上层的赏识与支持。",
      classic: "《易·乾》：九二，见龙在田，利见大人。象曰：见龙在田，德施普也。",
    },
    personality: {
      overview: "二爻之人头脑灵活，善于经营，有商业头脑。精明能干，懂得利益权衡。",
      decisionMaking: "做决定时会仔细计算得失，权衡利弊。善于抓住机会，但也会规避风险。",
      workStyle: "工作讲究效率和回报，善于整合资源。喜欢有挑战性和收益的项目。",
      relationships: "人脉广泛，善于社交应酬。但交往中会考虑价值和利益。",
      strengths: ["商业敏锐", "善于谈判", "灵活变通", "积累财富"],
      weaknesses: ["过于功利", "重利轻义", "有时短视", "信任度低"],
    },
  },
  {
    name: "三爻",
    title: "润滑剂",
    traits: "灵活、情商高",
    color: "text-amber-600",
    quickRef: ["可上可下", "灵活", "有智商情商", "人际关系好", "接受度高", "润滑剂"],
    yijingExplanation: {
      position: "三爻居下卦之上，处于内外交界，为「多凶」之位。需谨慎行事，如临深渊。",
      symbolism: "代表过渡阶段，既要守住根基，又要向上突破。如庙宇承上启下，连接人神。",
      classic: "《易·乾》：九三，君子终日乾乾，夕惕若厉，无咎。象曰：终日乾乾，反复道也。",
    },
    personality: {
      overview: "三爻之人可上可下，灵活变通。有智商情商，人际关系处理得好，是团队中的润滑剂。",
      decisionMaking: "做决定时会考虑各方感受，善于权衡。接受度高，能适应不同环境和要求。",
      workStyle: "工作中善于协调沟通，能在不同层级之间游刃有余。适合做中间桥梁角色。",
      relationships: "人际关系好，接受度高，善于化解矛盾。是很好的调解者和沟通者。",
      strengths: ["灵活变通", "情商高", "人缘好", "适应力强"],
      weaknesses: ["立场不坚定", "容易左右摇摆", "有时两面讨好", "缺乏主见"],
    },
  },
  {
    name: "四爻",
    title: "宰相",
    traits: "规划、管理",
    color: "text-blue-600",
    quickRef: ["中高层管理", "规划能力强", "工作具体规划", "执行落地"],
    yijingExplanation: {
      position: "四爻居上卦之下，近君之位，为大臣、宰辅。承上启下，需谨慎处世。",
      symbolism: "代表近君之臣、高级幕僚。与初爻相应，能得草根支持，但需小心伴君如伴虎。",
      classic: "《易·乾》：九四，或跃在渊，无咎。象曰：或跃在渊，进无咎也。",
    },
    personality: {
      overview: "四爻之人是中高层管理者的料，善于规划，能把战略落地为具体的工作计划。",
      decisionMaking: "做决定时既考虑理想目标，也注重可行性。善于制定计划和方案。",
      workStyle: "工作专业深入，善于钻研。喜欢系统性地解决问题，注重细节和流程。",
      relationships: "善于协调各方，是很好的中间人。懂得如何与上下级相处。",
      strengths: ["规划能力强", "善于执行", "细节到位", "协调能力强"],
      weaknesses: ["有时过于谨慎", "不够果断", "容易焦虑", "追求完美"],
    },
  },
  {
    name: "五爻",
    title: "帝王",
    traits: "决策、战略",
    color: "text-red-600",
    quickRef: ["有决策/管理能力", "选择方向", "老板思维", "做战略", "期望高", "会考虑5-10年要做什么"],
    yijingExplanation: {
      position: "五爻居上卦之中，为「君位」、「尊位」，是全卦最尊贵的位置。得中得正，大吉。",
      symbolism: "代表君王、领袖、决策核心。与二爻相应，能获得贤臣辅佐，建功立业。",
      classic: "《易·乾》：九五，飞龙在天，利见大人。象曰：飞龙在天，大人造也。",
    },
    personality: {
      overview: "五爻之人有一定的决策和管理能力，善于选择方向。有老板思维，做战略规划，期望高，会考虑5-10年要做什么。",
      decisionMaking: "做决定时着眼大局，不拘小节。敢于拍板，有魄力承担责任。善于做选择题。",
      workStyle: "喜欢掌控全局，善于调动资源和人才。不喜欢做具体执行的事务，更关注战略方向。",
      relationships: "有威严感，让人敬畏。但有时显得高高在上，不够亲近。",
      strengths: ["战略眼光", "决策力强", "格局大", "敢于担当"],
      weaknesses: ["容易傲慢", "不接地气", "独断专行", "难以亲近"],
    },
  },
  {
    name: "六爻",
    title: "神仙",
    traits: "灵性、精神",
    color: "text-purple-600",
    quickRef: ["精神世界", "灵性", "有自己的想法", "用自己的感觉做事", "可以把信息发展开", "活在自己的世界"],
    yijingExplanation: {
      position: "上爻为卦之极，位居最上，象征事物的终结与极致。物极必反，需知进退。",
      symbolism: "代表超脱者、隐士、精神导师。已过巅峰，宜退居幕后，传道授业。",
      classic: "《易·乾》：上九，亢龙有悔。象曰：亢龙有悔，盈不可久也。",
    },
    personality: {
      overview: "六爻之人活在精神世界，有灵性，有自己的想法。用自己的感觉做事，可以把信息发展开。六爻多的人，活在自己的世界，比较安静。",
      decisionMaking: "做决定时凭直觉和感应，不完全依赖逻辑分析。有时决策让人费解。",
      workStyle: "不喜欢繁琐的日常事务，偏好创意性、艺术性的工作。需要自由空间。",
      relationships: "待人慈悲包容，不计较。但有时过于超脱，让人觉得不够务实。",
      strengths: ["洞察力强", "直觉敏锐", "创意丰富", "精神境界高"],
      weaknesses: ["不接地气", "过于理想化", "沉默寡言", "难以捉摸"],
    },
  },
];

// 简化版用于显示
const YAO_INFO = YAO_DETAILS.map(d => ({
  name: d.name,
  title: d.title,
  traits: d.traits,
  color: d.color,
}));

// 四柱含义
const PILLAR_MEANINGS: Record<string, string> = {
  year: "大目标",
  month: "做事方式",
  day: "自己状态",
  hour: "最后结果",
};

// 爻位配对关系
const YAO_PAIRS: Record<number, number> = {
  1: 4, 4: 1,
  2: 5, 5: 2,
  3: 6, 6: 3,
};

// 根据天干地支索引计算六爻位置 (1-6)
const getLiuYaoPosition = (ganIdx: number, zhiIdx: number): number => {
  const yaoMap = LIU_YAO_MAP[ganIdx];
  if (!yaoMap) return 0;

  const position = yaoMap.indexOf(zhiIdx);
  return position >= 0 ? position + 1 : 0;
};

// 分析性格特征
const analyzePersonality = (yaoPositions: number[], hideHour: boolean): string[] => {
  const insights: string[] = [];
  const validPositions = hideHour ? yaoPositions.slice(0, 3) : yaoPositions;
  
  // 检查是否全部低爻位 (1-3)
  const allLow = validPositions.every(y => y >= 1 && y <= 3);
  if (allLow) {
    insights.push("全部低爻位：务实、踏实、想法简单直接");
  }
  
  // 检查是否全部高爻位 (4-6)
  const allHigh = validPositions.every(y => y >= 4 && y <= 6);
  if (allHigh) {
    insights.push("全部高爻位：想法多、格局大，但容易飘");
  }
  
  // 检查是否有配对
  const hasPair = validPositions.some((y1, i) => 
    validPositions.some((y2, j) => i !== j && YAO_PAIRS[y1] === y2)
  );
  if (!hasPair && validPositions.length > 1) {
    insights.push("无配对爻位：容易内耗、想法难落地");
  }
  
  return insights;
};

// 生成六爻综合解说
const generateYaoSummary = (yaoPositions: number[], hideHour: boolean): string[] => {
  const labels = ["年柱", "月柱", "日柱", "时柱"];
  const meanings = ["大目标", "做事方式", "自己状态", "最后结果"];
  const positions = hideHour ? yaoPositions.slice(0, 3) : yaoPositions;
  const summary: string[] = [];

  // 每柱解说
  positions.forEach((yao, i) => {
    if (yao <= 0) return;
    const detail = YAO_DETAILS[yao - 1];
    const pillarDesc: Record<string, Record<number, string>> = {
      "大目标": {
        1: "目标简单务实，不好高骛远，追求安稳的生活",
        2: "目标与财富、商业相关，追求经济上的成功",
        3: "目标灵活多变，追求人脉与关系的发展",
        4: "目标在于管理与规划，追求事业上的系统化发展",
        5: "目标远大，有领导者的格局，追求影响力与决策权",
        6: "目标偏向精神层面，追求灵性与内心的丰富",
      },
      "做事方式": {
        1: "做事踏实稳重，一步一个脚印，执行力强",
        2: "做事精明理性，善于权衡利弊，讲究效率与回报",
        3: "做事灵活圆滑，善于协调各方，情商高",
        4: "做事有规划、有条理，善于制定方案并执行落地",
        5: "做事大气果断，善于把控方向，具有战略眼光",
        6: "做事凭直觉感觉，有独到见解，不走寻常路",
      },
      "自己状态": {
        1: "内心朴实善良，为人低调踏实，不喜张扬",
        2: "内心注重利益得失，头脑灵活，善于经营",
        3: "内心灵活通透，善于察言观色，适应力强",
        4: "内心注重秩序与规划，思维缜密，做事有章法",
        5: "内心有领导欲望，格局大，有决断力",
        6: "内心世界丰富，有灵性，喜欢独处思考",
      },
      "最后结果": {
        1: "结果趋于平稳安定，虽不轰轰烈烈但踏实可靠",
        2: "结果与财富积累有关，善于守住成果",
        3: "结果取决于人际关系的经营，贵人运重要",
        4: "结果需要靠系统规划来实现，执行到位则可成",
        5: "结果可期，有望达到较高成就，但需注意守成",
        6: "结果偏精神收获，内心满足大于物质回报",
      },
    };
    const desc = pillarDesc[meanings[i]]?.[yao];
    if (desc) {
      summary.push(`${labels[i]}（${detail.name}）：${desc}`);
    }
  });

  return summary;
};

// 获取合作建议
const getCooperationAdvice = (yaoPosition: number): string => {
  const partner = YAO_PAIRS[yaoPosition];
  if (!partner) return "";
  return `宜找${YAO_INFO[partner - 1].name}的人合作`;
};

// 六爻磁场分析组件
const YaoMagneticField: React.FC<{ yaoPositions: number[] }> = ({ yaoPositions }) => {
  const validPositions = yaoPositions.filter(y => y > 0);
  const [selectedStar, setSelectedStar] = useState<EnergyStarInfo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const analysis = useMemo(() => {
    if (validPositions.length < 2) return null;
    const numberStr = validPositions.join('');
    try {
      return analyzeNumberEnhanced(numberStr, 'zh');
    } catch {
      return null;
    }
  }, [validPositions.join('')]);

  if (!analysis || analysis.combinations.length === 0) return null;

  // Deduplicate by base star name
  const seen = new Set<string>();
  const uniqueCombos = analysis.combinations.filter((combo: Combination) => {
    const baseName = combo.name.replace(/[1-4]$/, '');
    if (seen.has(baseName)) return false;
    seen.add(baseName);
    return true;
  });

  const handleStarClick = (combo: Combination) => {
    const baseName = combo.name.replace(/[1-4]$/, '');
    const starInfo = allStars.find(s => s.name === baseName);
    if (!starInfo) return;
    setSelectedStar(starInfo);
    setDialogOpen(true);
  };

  return (
    <div className="border-t border-border pt-3 mt-3">
      <div className="text-xs font-medium text-muted-foreground mb-2">六爻磁场</div>
      <div className="flex flex-wrap gap-1.5">
        {uniqueCombos.map((combo: Combination, idx: number) => {
          const baseName = combo.name.replace(/[1-4]$/, '');
          return (
            <button
              key={idx}
              onClick={() => handleStarClick(combo)}
              className={cn(
                "text-xs px-2 py-1 rounded-full border cursor-pointer transition-colors",
                combo.type === 'lucky'
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                  : "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20"
              )}
            >
              {baseName}
            </button>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm rounded-lg">
          {selectedStar && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "text-sm px-2.5 py-0.5 rounded-full font-medium",
                    selectedStar.type === 'lucky'
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-red-500/15 text-red-600"
                  )}>
                    {selectedStar.type === 'lucky' ? '吉星' : '凶星'}
                  </span>
                  <span className="text-xs text-muted-foreground">{selectedStar.theme}</span>
                </div>
                <DialogTitle className="text-lg">{selectedStar.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-3 mt-2 text-sm">
                <div>
                  <div className="font-medium text-emerald-600 mb-1.5">✦ 优点</div>
                  <ul className="space-y-1 text-muted-foreground">
                    {selectedStar.personality.strengths.map((s, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="text-emerald-500 shrink-0">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="font-medium text-amber-600 mb-1.5">✧ 提醒</div>
                  <ul className="space-y-1 text-muted-foreground">
                    {selectedStar.personality.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="text-amber-500 shrink-0">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="font-medium text-blue-600 mb-1.5">♡ 健康关注</div>
                  <div className="text-muted-foreground">{selectedStar.health.advice}</div>
                </div>

                <div>
                  <div className="font-medium text-purple-600 mb-1.5">☆ 适合方向</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedStar.lifePath.career.slice(0, 4).map((c, i) => (
                      <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface LiuYaoDisplayProps {
  pillars: FourPillars;
  className?: string;
  hideHour?: boolean;
}

const LiuYaoDisplay: React.FC<LiuYaoDisplayProps> = ({ pillars, className, hideHour = false }) => {
  const [selectedYao, setSelectedYao] = useState<number | null>(null);
  const { currentLanguage } = useLanguage();
  const lt = getLiuYaoT(currentLanguage);

  const yearYao = getLiuYaoPosition(pillars.year.ganIdx, pillars.year.zhiIdx);
  const monthYao = getLiuYaoPosition(pillars.month.ganIdx, pillars.month.zhiIdx);
  const dayYao = getLiuYaoPosition(pillars.day.ganIdx, pillars.day.zhiIdx);
  const hourYao = getLiuYaoPosition(pillars.hour.ganIdx, pillars.hour.zhiIdx);

  const yaoPositions = [yearYao, monthYao, dayYao, hourYao];
  const personalityInsights = analyzePersonality(yaoPositions, hideHour);
  const yaoSummary = generateYaoSummary(yaoPositions, hideHour);

  const pillarData = hideHour
    ? [
        { label: lt.yearPillar, meaning: PILLAR_MEANINGS.year, ganZhi: pillars.year.gan + pillars.year.zhi, yao: yearYao },
        { label: lt.monthPillar, meaning: PILLAR_MEANINGS.month, ganZhi: pillars.month.gan + pillars.month.zhi, yao: monthYao },
        { label: lt.dayPillar, meaning: PILLAR_MEANINGS.day, ganZhi: pillars.day.gan + pillars.day.zhi, yao: dayYao },
      ]
    : [
        { label: lt.yearPillar, meaning: PILLAR_MEANINGS.year, ganZhi: pillars.year.gan + pillars.year.zhi, yao: yearYao },
        { label: lt.monthPillar, meaning: PILLAR_MEANINGS.month, ganZhi: pillars.month.gan + pillars.month.zhi, yao: monthYao },
        { label: lt.dayPillar, meaning: PILLAR_MEANINGS.day, ganZhi: pillars.day.gan + pillars.day.zhi, yao: dayYao },
        { label: lt.hourPillar, meaning: PILLAR_MEANINGS.hour, ganZhi: pillars.hour.gan + pillars.hour.zhi, yao: hourYao },
      ];

  const cooperationAdvice = getCooperationAdvice(dayYao);
  const displayYao = selectedYao;
  const displayYaoDetail = displayYao > 0 ? YAO_DETAILS[displayYao - 1] : null;

  return (
    <div className={cn("bg-card rounded-lg p-4 border border-border", className)}>
      <h3 className="text-sm font-medium mb-3">{lt.title}</h3>

      {/* 六爻概述 - 默认收起 */}
      {/* <Collapsible className="mb-4">
        <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group w-full">
          <BookOpen className="h-3.5 w-3.5" />
          <span>六爻解说</span>
          <ChevronDown className="h-3 w-3 ml-auto transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 space-y-2 text-xs text-muted-foreground bg-muted/30 rounded-md p-3 border border-border">
            <p>六爻源自《易经》爻位理论，代表人生层次与行事风格。每个天干地支组合对应一个爻位（一至六爻），反映不同的性格特质和处事方式。</p>
            <div className="grid grid-cols-3 gap-1.5">
              {YAO_INFO.map((yao, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-background rounded px-1.5 py-1 border border-border">
                  <span className={cn("font-medium", yao.color)}>{yao.name}</span>
                  <span className="text-[10px]">{yao.title}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-1"><span className="font-medium text-foreground/80">配对：</span>一↔四、二↔五、三↔六</div>
              <div className="flex items-center gap-1"><span className="font-medium text-foreground/80">四柱：</span>年柱(大目标)、月柱(做事方式)、日柱(自己状态)、时柱(最后结果)</div>
              <div className="flex items-center gap-1"><span className="font-medium text-foreground/80">治克：</span>六治五→五治四→四治三→三治二→二治一→一治六</div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible> */}

      {/* 四柱六爻展示 */}
      <div className={cn("grid gap-2 mb-4", hideHour ? "grid-cols-3" : "grid-cols-4")}>
        {pillarData.map((item, idx) => {
          const yaoInfo = item.yao > 0 ? YAO_INFO[item.yao - 1] : null;
          const isSelected = displayYao === item.yao;
          return (
            <div key={idx} className="flex flex-col items-center">
              <div className="text-xs text-muted-foreground mb-0.5">{item.label}</div>
              <div className="text-sm font-medium mb-1">{item.ganZhi}</div>
              {yaoInfo ? (
                <>
                  <button
                    onClick={() => setSelectedYao(item.yao)}
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full transition-all",
                      isSelected 
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30" 
                        : "bg-muted hover:bg-muted/80",
                      !isSelected && yaoInfo.color
                    )}
                  >
                    {yaoInfo.name}
                  </button>
                  {/* <div className="text-[10px] text-muted-foreground mt-1">{yaoInfo.title}</div> */}
                </>
              ) : (
                <div className="text-xs text-muted-foreground">-</div>
              )}
            </div>
          );
        })}
      </div>

      {/* 六爻综合解说 - 默认收起 */}
      {yaoSummary.length > 0 && (
        <Collapsible className="mb-3">
          <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group w-full">
            <span>{lt.personalSummary}</span>
            <ChevronDown className="h-3 w-3 ml-auto transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-2 text-xs bg-muted/30 rounded-md p-3 border border-border">
              {yaoSummary.map((line, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-primary shrink-0 mt-0.5">•</span>
                  <span className="text-foreground/80 leading-relaxed">{line}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* 选中的爻位详细信息（直接显示） */}
      {displayYaoDetail && (
        <div className="border-t border-border pt-3 mt-3">
          <YaoDetailCard detail={displayYaoDetail} />
        </div>
      )}

      {/* 性格分析 */}
      {personalityInsights.length > 0 && (
        <div className="border-t border-border pt-3 mt-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">{lt.compositeTraits}</div>
          <div className="space-y-1">
            {personalityInsights.map((insight, idx) => (
              <div key={idx} className="text-xs text-foreground/80 flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 六爻磁场分析 */}
      <YaoMagneticField yaoPositions={hideHour ? [yearYao, monthYao, dayYao] : yaoPositions} />
    </div>
  );
};

// 爻位详细卡片组件
const YaoDetailCard: React.FC<{ detail: YaoDetail }> = ({ detail }) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'yijing' | 'personality'>('quick');
  const { currentLanguage } = useLanguage();
  const lt = getLiuYaoT(currentLanguage);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-bold", detail.color)}>{detail.name}</span>
          {/* <span className="text-xs text-muted-foreground">· {detail.title}</span> */}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('quick')}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full transition-colors",
              activeTab === 'quick' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {lt.quickRef}
          </button>
          {/* <button
            onClick={() => setActiveTab('yijing')}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full transition-colors",
              activeTab === 'yijing' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            易经
          </button> */}
          <button
            onClick={() => setActiveTab('personality')}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full transition-colors",
              activeTab === 'personality' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {lt.personality}
          </button>
        </div>
      </div>

      {activeTab === 'quick' && (
        <div className="bg-muted/30 rounded-md p-3 border border-border">
          <div className="text-xs font-medium text-foreground/90 mb-2">{lt.quickRefTitle}</div>
          <div className="flex flex-wrap gap-1.5">
            {detail.quickRef.map((item, idx) => (
              <span 
                key={idx} 
                className={cn("text-xs px-2 py-1 rounded-full bg-background border border-border", detail.color)}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'yijing' && (
        <div className="space-y-2.5">
          {/* 易经解说 */}
          <div className="bg-muted/30 rounded-md p-3 border border-border">
            <div className="text-xs font-medium text-foreground/90 mb-2">📜 爻位解说</div>
            <p className="text-xs text-foreground/70 leading-relaxed">{detail.yijingExplanation.position}</p>
          </div>

          <div className="bg-muted/30 rounded-md p-3 border border-border">
            <div className="text-xs font-medium text-foreground/90 mb-2">🔮 象征意义</div>
            <p className="text-xs text-foreground/70 leading-relaxed">{detail.yijingExplanation.symbolism}</p>
          </div>

          <div className="bg-primary/5 rounded-md p-3 border border-primary/20">
            <div className="text-xs font-medium text-primary mb-2">📖 易经原典</div>
            <p className="text-xs text-foreground/80 leading-relaxed italic">{detail.yijingExplanation.classic}</p>
          </div>
        </div>
      )}

      {activeTab === 'personality' && (
        <div className="space-y-2.5">
          <div>
            <div className="text-xs font-medium text-foreground/90 mb-1">{lt.overallTraits}</div>
            <p className="text-xs text-foreground/70 leading-relaxed">{detail.personality.overview}</p>
          </div>

          <div>
            <div className="text-xs font-medium text-foreground/90 mb-1">{lt.decisionStyle}</div>
            <p className="text-xs text-foreground/70 leading-relaxed">{detail.personality.decisionMaking}</p>
          </div>

          <div>
            <div className="text-xs font-medium text-foreground/90 mb-1">{lt.workStyle}</div>
            <p className="text-xs text-foreground/70 leading-relaxed">{detail.personality.workStyle}</p>
          </div>

          <div>
            <div className="text-xs font-medium text-foreground/90 mb-1">{lt.relationships}</div>
            <p className="text-xs text-foreground/70 leading-relaxed">{detail.personality.relationships}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/50 rounded-md p-2 border border-primary/20">
              <div className="text-xs font-medium text-primary mb-1">{lt.strengths}</div>
              <div className="space-y-0.5">
                {detail.personality.strengths.map((s, i) => (
                  <div key={i} className="text-xs text-foreground/70">{s}</div>
                ))}
              </div>
            </div>
            <div className="bg-muted/50 rounded-md p-2 border border-destructive/20">
              <div className="text-xs font-medium text-destructive mb-1">{lt.weaknesses}</div>
              <div className="space-y-0.5">
                {detail.personality.weaknesses.map((w, i) => (
                  <div key={i} className="text-xs text-foreground/70">{w}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiuYaoDisplay;
