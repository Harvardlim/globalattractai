import React, { useMemo, useState } from 'react';
import { ChartData, PalaceData } from '@/types';
import { WEALTH_ARCHETYPES, WealthArchetype } from '@/data/wealthArchetypeData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, TrendingUp, Star, AlertTriangle, Lightbulb, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { getComponentT } from '@/data/destinyTranslations';

interface WealthAnalysisDisplayProps {
  chart: ChartData;
}

/**
 * 创富分析宫位选择逻辑：
 * 1. 命宫（日干所在宫）
 * 2. 如果命宫有入墓/击刑/门迫/空亡 → 生门落宫
 * 3. 如果生门落宫也有 → 开门落宫
 * 4. 如果开门落宫也有 → 时柱天干落宫
 * 5. 如果还有 → 找任意没有四害的宫
 */

export const hasFourHarms = (palace: PalaceData): boolean => {
  return palace.empty ||
    palace.skyStatus.isMu || palace.skyStatus.isXing || palace.isMenPo ||
    palace.earthStatus.isMu || palace.earthStatus.isXing ||
    (palace.sky2Status?.isMu ?? false) || (palace.sky2Status?.isXing ?? false) ||
    (palace.earth2Status?.isMu ?? false) || (palace.earth2Status?.isXing ?? false);
};

export const findMingGong = (chart: ChartData): PalaceData | null => {
  const dayStem = chart.pillars.day.gan;

  const normalizeCenterPalace = (palace: PalaceData | undefined): PalaceData | null => {
    if (!palace) return null;
    // 中宫命宫寄坤二宫，避免分析结果为空
    if (palace.id === 5) {
      return chart.palaces.find(p => p.id === 2) || null;
    }
    return palace;
  };

  if (dayStem === '甲') {
    const zhiFuPalace = chart.palaces.find(p => p.god === '值符');
    return normalizeCenterPalace(zhiFuPalace);
  }

  const skyPalace = chart.palaces.find(p => p.skyStem === dayStem);
  if (skyPalace) return normalizeCenterPalace(skyPalace);

  const earthPalace = chart.palaces.find(p => p.earthStem === dayStem);
  return normalizeCenterPalace(earthPalace);
};

export interface WealthAnalysisResult {
  palace: PalaceData;
  selectionReason: string;
  star: string;
  archetype: WealthArchetype;
  mingGongHasHarms: boolean;
}

export const analyzeWealth = (chart: ChartData): WealthAnalysisResult | null => {
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
  const archetype = WEALTH_ARCHETYPES[star];
  if (!archetype) return null;

  return {
    palace: selectedPalace,
    selectionReason,
    star,
    archetype,
    mingGongHasHarms: hasFourHarms(mingGong),
  };
};

const WealthArchetypeContent: React.FC<{ archetype: WealthArchetype; selectionReason: string; palace: PalaceData; mingGongHasHarms: boolean; ct: ReturnType<typeof getComponentT> }> = ({ archetype, selectionReason, palace, mingGongHasHarms, ct }) => (
  <div className="space-y-4">
    {/* Header */}
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 text-amber-500" />
          <span className="font-bold text-base">{archetype.title}</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {ct.dominant}：{archetype.subtitle}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>{ct.fromSource}：{selectionReason}（{palace.name}·{palace.position}）</span>
        {mingGongHasHarms && selectionReason !== '命宫' && (
          <span className="flex items-center gap-0.5 text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            {ct.mingGongHasHarms}
          </span>
        )}
      </div>
    </div>

    {/* 财富密码 */}
    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200/50 dark:border-amber-800/30">
      <div className="flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">{ct.wealthCode}</span>
          <p className="text-sm mt-1">{archetype.wealthCode}</p>
        </div>
      </div>
    </div>

    {/* 形象 */}
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">{ct.image}</span>
      </div>
      <p className="text-sm pl-5">{archetype.image}</p>
    </div>

    {/* 核心行动 */}
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">{ct.coreActions}</span>
      </div>
      <div className="space-y-2 pl-1">
        {archetype.coreActions.map((action, idx) => (
          <div key={idx} className="flex gap-2 text-sm">
            <span className="text-primary font-bold flex-shrink-0">{idx + 1}.</span>
            <span>{action}</span>
          </div>
        ))}
      </div>
    </div>

    {/* 辅星建议 */}
    <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
      {archetype.auxiliaryStars}
    </div>
  </div>
);

const WealthAnalysisDisplay: React.FC<WealthAnalysisDisplayProps> = ({ chart }) => {
  const [open, setOpen] = useState(false);
  const { currentLanguage } = useLanguage();
  const ct = getComponentT(currentLanguage);

  const analysis = useMemo(() => analyzeWealth(chart), [chart]);

  if (!analysis) return null;

  const { archetype, selectionReason, palace, mingGongHasHarms } = analysis;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-card rounded-lg border border-border">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            <span className="font-medium text-sm">{ct.wealthAnalysis}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium">
              {archetype.title}
            </span>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
          <WealthArchetypeContent
            archetype={archetype}
            selectionReason={selectionReason}
            palace={palace}
            mingGongHasHarms={mingGongHasHarms}
            ct={ct}
          />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default WealthAnalysisDisplay;
