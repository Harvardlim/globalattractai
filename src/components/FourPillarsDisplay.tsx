import React, { useMemo, useState } from "react";
import { FourPillars, GanZhi, BigCycle, AnnualCycle } from "@/types";
import { cn } from "@/lib/utils";
import { 
  analyzeBaziPattern, 
  ELEMENT_NAMES,
  SelfSittingInfo,
  SeasonalStrengthInfo 
} from "@/lib/baziPatternAnalysis";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getFourPillarsT } from "@/data/destinyTranslations";

// 天干对应的五行：甲乙-木(0), 丙丁-火(1), 戊己-土(2), 庚辛-金(3), 壬癸-水(4)
const STEM_ELEMENTS = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];

// 地支对应的五行：子-水, 丑-土, 寅-木, 卯-木, 辰-土, 巳-火, 午-火, 未-土, 申-金, 酉-金, 戌-土, 亥-水
const BRANCH_ELEMENTS = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

// 天干的阴阳：偶数(0,2,4,6,8)为阳，奇数(1,3,5,7,9)为阴
const isYangStem = (idx: number) => idx % 2 === 0;

// 地支藏干表 - 每个地支的本气、中气、余气
const BRANCH_HIDDEN_STEMS: Record<number, number[]> = {
  0: [9], // 子: 癸
  1: [5, 9, 7], // 丑: 己、癸、辛
  2: [0, 2, 4], // 寅: 甲、丙、戊
  3: [1], // 卯: 乙
  4: [4, 1, 9], // 辰: 戊、乙、癸
  5: [2, 6, 4], // 巳: 丙、庚、戊
  6: [3, 5], // 午: 丁、己
  7: [5, 3, 1], // 未: 己、丁、乙
  8: [6, 8, 4], // 申: 庚、壬、戊
  9: [7], // 酉: 辛
  10: [4, 7, 3], // 戌: 戊、辛、丁
  11: [8, 0], // 亥: 壬、甲
};

const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

// 简写十神
const getTenGodShort = (selfStemIdx: number, targetStemIdx: number): string => {
  const selfElement = STEM_ELEMENTS[selfStemIdx];
  const targetElement = STEM_ELEMENTS[targetStemIdx];
  const selfIsYang = isYangStem(selfStemIdx);
  const targetIsYang = isYangStem(targetStemIdx);
  const samePolarity = selfIsYang === targetIsYang;

  const elementDiff = (targetElement - selfElement + 5) % 5;

  switch (elementDiff) {
    case 0:
      return samePolarity ? "比" : "劫";
    case 1:
      return samePolarity ? "食" : "伤";
    case 2:
      return samePolarity ? "才" : "财";
    case 3:
      return samePolarity ? "杀" : "官";
    case 4:
      return samePolarity ? "枭" : "印";
    default:
      return "";
  }
};

// 五行颜色 - 根据五行元素返回颜色
const getElementColor = (element: number): string => {
  switch (element) {
    case 0:
      return "text-emerald-600"; // 木 - 青色
    case 1:
      return "text-red-500"; // 火 - 红色
    case 2:
      return "text-amber-600"; // 土 - 土黄色
    case 3:
      return "text-yellow-500"; // 金 - 金色
    case 4:
      return "text-blue-500"; // 水 - 蓝色
    default:
      return "";
  }
};

// 天干颜色
const getStemColor = (stemIdx: number): string => {
  return getElementColor(STEM_ELEMENTS[stemIdx]);
};

// 地支颜色
const getBranchColor = (branchIdx: number): string => {
  return getElementColor(BRANCH_ELEMENTS[branchIdx]);
};

interface PillarColumnProps {
  pillar: GanZhi;
  label: string;
  dayStemIdx: number;
  isDayPillar?: boolean;
  selfSitting?: SelfSittingInfo;
  isCyclePillar?: boolean;
  isCurrentCycle?: boolean;
}

const PillarColumn: React.FC<PillarColumnProps> = ({ pillar, label, dayStemIdx, isDayPillar, selfSitting, isCyclePillar, isCurrentCycle }) => {
  const hiddenStems = BRANCH_HIDDEN_STEMS[pillar.zhiIdx] || [];
  const tenGod = isDayPillar ? (isCyclePillar ? "" : "日主") : getTenGodShort(dayStemIdx, pillar.ganIdx);

  return (
    <div className="flex flex-col items-center">
      {/* 柱标签 */}
      <div className={cn(
        "text-xs mb-2",
        isCyclePillar ? "text-primary font-medium" : "text-muted-foreground",
        isCurrentCycle && "text-red-500 font-semibold"
      )}>{label}</div>

      {/* 十神 */}
      <div className={cn("text-xs mb-1 h-4", isDayPillar ? "text-primary font-medium" : "text-muted-foreground")}>
        {tenGod}
      </div>

      {/* 天干 */}
      <div
        className={cn(
          "w-10 h-10 flex items-center justify-center text-lg font-bold rounded-md border",
          isDayPillar ? "bg-primary/10 border-primary" : isCyclePillar ? "bg-primary/5 border-primary/30" : "bg-muted/50 border-border",
          getStemColor(pillar.ganIdx),
        )}
      >
        {pillar.gan}
      </div>

      {/* 地支 */}
      <div
        className={cn(
          "w-10 h-10 flex items-center justify-center text-lg font-bold rounded-md border mt-1",
          isDayPillar ? "bg-primary/10 border-primary" : isCyclePillar ? "bg-primary/5 border-primary/30" : "bg-muted/50 border-border",
          getBranchColor(pillar.zhiIdx),
        )}
      >
        {pillar.zhi}
      </div>

      {/* 藏干 */}
      <div className="flex flex-col items-center mt-1 min-h-[48px]">
        {hiddenStems.map((stemIdx, i) => (
          <div
            key={i}
            className={cn("text-xs leading-tight", getStemColor(stemIdx), i === 0 ? "font-medium" : "opacity-70")}
          >
            {HEAVENLY_STEMS[stemIdx]}
            <span className="text-muted-foreground ml-0.5 text-[10px]">{getTenGodShort(dayStemIdx, stemIdx)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 流运柱数据
export interface CyclePillarData {
  daYun?: GanZhi;      // 大运
  liuNian?: GanZhi;    // 流年
  liuYue?: GanZhi;     // 流月
  liuRi?: GanZhi;      // 流日
}

interface FourPillarsDisplayProps {
  pillars: FourPillars;
  hideHour?: boolean;
  className?: string;
  cyclePillars?: CyclePillarData;
}

const FourPillarsDisplay: React.FC<FourPillarsDisplayProps> = ({ pillars, hideHour = false, className, cyclePillars }) => {
  const [showCycles, setShowCycles] = useState(false);
  const { currentLanguage } = useLanguage();
  const ft = getFourPillarsT(currentLanguage);
  const dayStemIdx = pillars.day.ganIdx;

  // 获取分析结果（自坐和旺相休囚死）
  const analysis = useMemo(() => {
    return analyzeBaziPattern(pillars, !hideHour);
  }, [pillars, hideHour]);

  const { selfSitting } = analysis.dayMaster;

  const pillarsToShow = hideHour
    ? [
        { pillar: pillars.year, label: ft.yearPillar, isDayPillar: false },
        { pillar: pillars.month, label: ft.monthPillar, isDayPillar: false },
        { pillar: pillars.day, label: ft.dayPillar, isDayPillar: true },
      ]
    : [
        { pillar: pillars.year, label: ft.yearPillar, isDayPillar: false },
        { pillar: pillars.month, label: ft.monthPillar, isDayPillar: false },
        { pillar: pillars.day, label: ft.dayPillar, isDayPillar: true },
        { pillar: pillars.hour, label: ft.hourPillar, isDayPillar: false },
      ];

  const hasCycles = cyclePillars && (cyclePillars.daYun || cyclePillars.liuNian || cyclePillars.liuYue || cyclePillars.liuRi);

  return (
    <TooltipProvider>
      <div className={cn("bg-card rounded-lg p-4 border border-border", className)}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">{hideHour ? ft.sixCharBazi : ft.fourPillarsBazi}</h3>
          {hasCycles && (
            <button
              onClick={() => setShowCycles(!showCycles)}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <span>{ft.liuYun}</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showCycles && "rotate-180")} />
            </button>
          )}
        </div>
        {hideHour && <p className="text-xs text-muted-foreground mb-3">{ft.hourPillarNote}</p>}
        
        <div className="flex justify-center gap-3">
          {pillarsToShow.map(({ pillar, label, isDayPillar }) => (
            <PillarColumn 
              key={label} 
              pillar={pillar} 
              label={label} 
              dayStemIdx={dayStemIdx} 
              isDayPillar={isDayPillar}
              selfSitting={isDayPillar ? selfSitting : undefined}
            />
          ))}
        </div>

        {/* 流运展开区域 */}
        {showCycles && hasCycles && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex justify-center gap-3">
              {cyclePillars.daYun && (
                <PillarColumn
                  pillar={cyclePillars.daYun}
                  label={ft.daYun}
                  dayStemIdx={dayStemIdx}
                  isCyclePillar
                  isCurrentCycle
                />
              )}
              {cyclePillars.liuNian && (
                <PillarColumn
                  pillar={cyclePillars.liuNian}
                  label={ft.liuNian}
                  dayStemIdx={dayStemIdx}
                  isCyclePillar
                  isCurrentCycle
                />
              )}
              {cyclePillars.liuYue && (
                <PillarColumn
                  pillar={cyclePillars.liuYue}
                  label={ft.liuYue}
                  dayStemIdx={dayStemIdx}
                  isCyclePillar
                />
              )}
              {cyclePillars.liuRi && (
                <PillarColumn
                  pillar={cyclePillars.liuRi}
                  label={ft.liuRi}
                  dayStemIdx={dayStemIdx}
                  isCyclePillar
                />
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default FourPillarsDisplay;
