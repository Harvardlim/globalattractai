import React, { useMemo, useState } from 'react';
import { FourPillars } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { getComponentT } from '@/data/destinyTranslations';
import { 
  analyzeBaziPattern, 
  ELEMENT_NAMES, 
  FavorableGod, 
  ShenShaInfo, 
  SpecialPatternInfo,
  DayMasterStrengthAnalysis,
  TiaohouInfo
} from '@/lib/baziPatternAnalysis';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star, Ban, Sparkles, AlertTriangle, ChevronDown, TrendingUp, Lightbulb, CheckCircle2, XCircle, Briefcase, Info, Boxes, User, MessageCircle, Heart, Activity } from 'lucide-react';
import { getDayMasterPersonality, ELEMENT_COLOR_MAP, DayMasterPersonality } from '@/data/dayMasterPersonalityData';

// 五行颜色
const getElementColor = (element: number): string => {
  switch (element) {
    case 0: return 'text-emerald-600'; // 木
    case 1: return 'text-red-500'; // 火
    case 2: return 'text-amber-600'; // 土
    case 3: return 'text-yellow-500'; // 金
    case 4: return 'text-blue-500'; // 水
    default: return '';
  }
};

const getElementBg = (element: number): string => {
  switch (element) {
    case 0: return 'bg-emerald-100 dark:bg-emerald-900/30'; // 木
    case 1: return 'bg-red-100 dark:bg-red-900/30'; // 火
    case 2: return 'bg-amber-100 dark:bg-amber-900/30'; // 土
    case 3: return 'bg-yellow-100 dark:bg-yellow-900/30'; // 金
    case 4: return 'bg-blue-100 dark:bg-blue-900/30'; // 水
    default: return '';
  }
};

// 五行对应天干
const ELEMENT_STEMS: Record<number, [string, string]> = {
  0: ['甲', '乙'], // 木
  1: ['丙', '丁'], // 火
  2: ['戊', '己'], // 土
  3: ['庚', '辛'], // 金
  4: ['壬', '癸'], // 水
};

const formatGodLabel = (god: { element: number; elementName: string; stem?: string; tenGods: string[] }) => {
  const stems = ELEMENT_STEMS[god.element];
  const stemStr = stems ? `${stems[0]}/${stems[1]}` : '';
  return `${god.elementName}（${stemStr}）（${god.tenGods.join('/')}）`;
};

interface BaziPatternDisplayProps {
  pillars: FourPillars;
  includeHour?: boolean;
  className?: string;
}

const BaziPatternDisplay: React.FC<BaziPatternDisplayProps> = ({ 
  pillars, 
  includeHour = true,
  className 
}) => {
  const { currentLanguage } = useLanguage();
  const ct = getComponentT(currentLanguage);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personality: false,
    strength: false,
    shenSha: false,
    patterns: false,
    fortune: false,
    elements: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const analysis = useMemo(() => {
    return analyzeBaziPattern(pillars, includeHour);
  }, [pillars, includeHour]);

  const { 
    dayMaster, 
    stemAnalyses, 
    pattern, 
    monthBranch, 
    elementStrengths, 
    favorableGods, 
    unfavorableGods,
    wealthGods,
    tiaohou,
    shenSha,
    specialPatterns,
    fortuneAnalysis
  } = analysis;

  // 获取日主性格数据
  const dayMasterPersonality = useMemo(() => {
    return getDayMasterPersonality(pillars.day.gan);
  }, [pillars.day.gan]);

  // 分类神煞
  const auspiciousShenSha = shenSha.filter(s => s.type === 'auspicious');
  const inauspiciousShenSha = shenSha.filter(s => s.type === 'inauspicious');
  
  // 分类特殊格局
  const auspiciousPatterns = specialPatterns.filter(p => p.type === 'auspicious');
  const inauspiciousPatterns = specialPatterns.filter(p => p.type === 'inauspicious');

  // 强度文字
  const subStrength = dayMaster.strengthAnalysis?.subStrength;
  const strengthText = dayMaster.strength === 'strong' ? ct.bodyStrong : 
                      dayMaster.strength === 'weak' ? ct.bodyWeak : 
                      subStrength === 'leaning_strong' ? `${ct.bodyNeutral}` :
                      subStrength === 'leaning_weak' ? `${ct.bodyNeutral}` :
                      `${ct.bodyNeutral}`;
  // const strengthText = dayMaster.strength === 'strong' ? ct.bodyStrong : 
  //                      dayMaster.strength === 'weak' ? ct.bodyWeak : 
  //                      subStrength === 'leaning_strong' ? `${ct.bodyNeutral}（${ct.bodyLeaningStrong}）` :
  //                      subStrength === 'leaning_weak' ? `${ct.bodyNeutral}（${ct.bodyLeaningWeak}）` :
  //                      `${ct.bodyNeutral}（${ct.bodyBalanced}）`;
  
  const strengthColor = dayMaster.strength === 'strong' ? 'text-green-600' : 
                        dayMaster.strength === 'weak' ? 'text-orange-500' : 
                        subStrength === 'leaning_strong' ? 'text-emerald-500' :
                        subStrength === 'leaning_weak' ? 'text-amber-500' :
                        'text-blue-500';

  const [isMainOpen, setIsMainOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className={cn('bg-card rounded-lg border border-border', className)}>
        <Collapsible open={isMainOpen} onOpenChange={setIsMainOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <h3 className="text-sm font-medium flex items-center gap-2">
              {isMainOpen ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary -rotate-90" />}
              {ct.baziAnalysis}
            </h3>
          </CollapsibleTrigger>
          <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
        
        {/* 核心信息 */}
        <div className="space-y-3">
          {/* 身强身弱标签 */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn('text-xs', strengthColor)}>
              {strengthText}
            </Badge>
          </div>
          
          {/* 喜用神 */}
          <div className="flex items-start gap-2">
            <span className="text-xs text-muted-foreground w-16 pt-0.5">{favorableGods.some(g => g.isWealth) ? `${ct.favorable}/财神` : ct.favorable}</span>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {favorableGods.map((god, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs cursor-help border-green-500/50 hover:border-green-500',
                        getElementBg(god.element),
                        getElementColor(god.element)
                      )}
                    >
                      {/* <span className="text-muted-foreground mr-1">
                        {god.priority === 1 ? '①' : god.priority === 2 ? '②' : '③'}
                      </span> */}
                      {formatGodLabel(god)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs font-medium mb-1">{god.isWealth ? '喜用/财神' : `第${god.priority}喜用神`}</p>
                    <p className="text-xs">{god.reason}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
          
          {/* 忌神 - hide for neutral charts */}
          {dayMaster.strength !== 'neutral' && (
          <div className="flex items-start gap-2">
            <span className="text-xs text-muted-foreground w-16 pt-0.5">{ct.unfavorable}</span>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {unfavorableGods.length > 0 ? unfavorableGods.map((god, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs cursor-help border-red-500/50 hover:border-red-500',
                        getElementBg(god.element),
                        getElementColor(god.element)
                      )}
                    >
                      {formatGodLabel(god)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs font-medium mb-1">第{god.priority}忌神</p>
                    <p className="text-xs">{god.reason}</p>
                  </TooltipContent>
                </Tooltip>
              )) : (
                <Badge variant="outline" className="text-xs text-blue-500 border-blue-300">
                  {ct.neutralNoUnfavorable}
                </Badge>
              )}
            </div>
          </div>
          )}

          {/* 财（独立分类） */}
          {wealthGods && wealthGods.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground w-12 pt-0.5">财神</span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {wealthGods.map((god, idx) => (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs cursor-help border-amber-500/50 hover:border-amber-500',
                          getElementBg(god.element),
                          getElementColor(god.element)
                        )}
                      >
                        {formatGodLabel(god)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs font-medium mb-1">财</p>
                      <p className="text-xs">{god.reason}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          {tiaohou && (
            <div className={cn(
              "rounded-lg p-3 border",
              dayMaster.strength === 'neutral' 
                ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                : "bg-muted/30 border-border"
            )}>
              <div className="flex items-center gap-1.5 mb-2">
                <Info className={cn("h-3.5 w-3.5", dayMaster.strength === 'neutral' ? "text-blue-500" : "text-muted-foreground")} />
                <span className={cn(
                  "text-xs font-medium",
                  dayMaster.strength === 'neutral' 
                    ? "text-blue-700 dark:text-blue-300" 
                    : "text-muted-foreground"
                )}>
                  {dayMaster.strength === 'neutral' ? '调候用神' : '调候参考'}（{tiaohou.lunarMonthName}·{dayMaster.stem}{dayMaster.elementName}）
                </span>
              </div>
              <p className={cn(
                "text-xs mb-2",
                dayMaster.strength === 'neutral' 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-muted-foreground"
              )}>{tiaohou.note}</p>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                <span className="text-[10px] text-muted-foreground">八字里有：</span>
                {tiaohou.allStems.map((stem, idx) => {
                  const matched = tiaohou.matchedStems.find(m => m.stem === stem);
                  if (matched) {
                    return (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant="outline" 
                            className="text-[10px] bg-green-100 dark:bg-green-900/30 border-green-400 text-green-700 dark:text-green-300 cursor-help"
                          >
                            {stem} ✓
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {matched.location}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  return (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="text-[10px] border-dashed text-muted-foreground"
                    >
                      {stem}
                    </Badge>
                  );
                })}
              </div>
              {tiaohou.matchedStems.length > 0 && (
                <p className="text-[10px] text-green-600 dark:text-green-400">
                  ✓ 八字中见{tiaohou.matchedStems.map(m => m.stem).join('、')}
                  {dayMaster.strength === 'neutral' && (
                    <>，{tiaohou.matchedStems[0].stem}为第一用神
                    {tiaohou.matchedStems.length > 1 ? `，${tiaohou.matchedStems[1].stem}为第二用神` : ''}</>
                  )}
                </p>
              )}
              {tiaohou.matchedStems.length === 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                  ⚠ 八字中未见调候用神天干，宜大运流年补之
                </p>
              )}
            </div>
          )}
        </div>

        {/* 可折叠的详细分析 */}
        <div className="space-y-1">
          {/* 日主性格与沟通 */}
          {dayMasterPersonality && (
            <Collapsible open={expandedSections.personality} onOpenChange={() => toggleSection('personality')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {ct.dayMasterPersonality}
                </span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.personality && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <DayMasterPersonalityCard personality={dayMasterPersonality} />
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* 身强身弱分析 */}
          <Collapsible open={expandedSections.strength} onOpenChange={() => toggleSection('strength')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                  {ct.strengthAnalysis}
              </span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.strength && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <StrengthAnalysisTable analysis={dayMaster.strengthAnalysis} />
            </CollapsibleContent>
          </Collapsible>

          {/* 神煞分析 */}
          <Collapsible open={expandedSections.shenSha} onOpenChange={() => toggleSection('shenSha')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                  {ct.shenShaAnalysis} ({shenSha.length})
              </span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.shenSha && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <ShenShaTable auspicious={auspiciousShenSha} inauspicious={inauspiciousShenSha} />
            </CollapsibleContent>
          </Collapsible>

          {/* 特殊格局 */}
          <Collapsible open={expandedSections.patterns} onOpenChange={() => toggleSection('patterns')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                  {ct.auspiciousInauspicious} ({specialPatterns.length})
              </span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.patterns && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <SpecialPatternsTable auspicious={auspiciousPatterns} inauspicious={inauspiciousPatterns} />
            </CollapsibleContent>
          </Collapsible>

          {/* 运势喜忌 */}
          {/* <Collapsible open={expandedSections.fortune} onOpenChange={() => toggleSection('fortune')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              <span className="flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                运势喜忌
              </span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.fortune && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <FortuneTable fortune={fortuneAnalysis} />
            </CollapsibleContent>
          </Collapsible> */}

          {/* 五行力量 */}
          <Collapsible open={expandedSections.elements} onOpenChange={() => toggleSection('elements')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              <span className="flex items-center gap-1">
                <Boxes className="h-3 w-3" />
                  {ct.fiveElements}
              </span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.elements && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <ElementsTable elementStrengths={elementStrengths} />
            </CollapsibleContent>
          </Collapsible>
        </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      </div>
    </TooltipProvider>
  );
};

// 身强身弱分析表格
const StrengthAnalysisTable: React.FC<{ analysis: DayMasterStrengthAnalysis }> = ({ analysis }) => {
  const StatusIcon = ({ value }: { value: boolean }) => (
    value 
      ? <CheckCircle2 className="h-3 w-3 text-green-600" />
      : <XCircle className="h-3 w-3 text-orange-500" />
  );

  return (
    <div className="space-y-2">
      <div className={cn(
        'rounded-lg p-2 border text-xs',
        analysis.strength === 'strong' 
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
          : analysis.strength === 'weak'
            ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
            : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
      )}>
        <div>{analysis.strengthReason}</div>
        {analysis.strengthScore !== undefined && (
          <div className="mt-1 text-muted-foreground">
            综合得分：{analysis.strengthScore}%
            {analysis.subStrengthDesc && ` · ${analysis.subStrengthDesc.split('，').slice(1).join('，')}`}
          </div>
        )}
      </div>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="py-1.5 w-24">
              <div className="flex items-center gap-1">
                <StatusIcon value={analysis.deLing} />
                <span className="text-xs font-medium">{analysis.deLing ? '得令' : '失令'}</span>
              </div>
            </TableCell>
            <TableCell className="py-1.5 text-xs text-muted-foreground">{analysis.deLingDesc}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="py-1.5">
              <div className="flex items-center gap-1">
                <StatusIcon value={analysis.deDi} />
                <span className="text-xs font-medium">{analysis.deDi ? '得地' : '失地'}</span>
              </div>
            </TableCell>
            <TableCell className="py-1.5 text-xs text-muted-foreground">{analysis.deDiDesc}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="py-1.5">
              <div className="flex items-center gap-1">
                <StatusIcon value={analysis.deShi} />
                <span className="text-xs font-medium">{analysis.deShi ? '得势' : '失势'}</span>
              </div>
            </TableCell>
            <TableCell className="py-1.5 text-xs text-muted-foreground">{analysis.deShiDesc}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

// 日主性格卡片
const DayMasterPersonalityCard: React.FC<{ personality: DayMasterPersonality }> = ({ personality }) => {
  const colors = ELEMENT_COLOR_MAP[personality.element];
  
  return (
    <div className="space-y-3">
      {/* 标题与五行属性 */}
      <div className={cn('rounded-lg p-3 border', colors.bg, colors.border)}>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className={cn('text-xs', colors.text, colors.border)}>
            {personality.stem}{personality.element} · {personality.polarity}{personality.element}
          </Badge>
          <span className={cn('text-sm font-medium', colors.text)}>{personality.nickname}</span>
        </div>
        <p className="text-xs text-muted-foreground">{personality.elementTraits}</p>
      </div>

      {/* 优势与提醒 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <h6 className="text-xs font-medium text-green-600 mb-1.5 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            优势
          </h6>
          <ul className="space-y-0.5">
            {personality.strengths.map((s, idx) => (
              <li key={idx} className="text-xs text-green-700 dark:text-green-400">• {s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <h6 className="text-xs font-medium text-orange-600 mb-1.5 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            提醒
          </h6>
          <ul className="space-y-0.5">
            {personality.weaknesses.map((w, idx) => (
              <li key={idx} className="text-xs text-orange-700 dark:text-orange-400">• {w}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 适合职业 */}
      <div className="rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h6 className="text-xs font-medium text-blue-600 mb-2 flex items-center gap-1">
          <Briefcase className="h-3 w-3" />
          职业参考
        </h6>
        <div className="space-y-2">
          <div>
            <span className="text-[10px] text-muted-foreground font-medium">适合职业</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {personality.career.suitable.map((job, idx) => (
                <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded">{job}</span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-medium">不适合职业</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {personality.career.unsuitable.map((job, idx) => (
                <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-300 rounded border border-red-200 dark:border-red-700">{job}</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{personality.career.advice}</p>
        </div>
      </div>

      {/* 感情婚姻 */}
      <div className="rounded-lg p-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800">
        <h6 className="text-xs font-medium text-pink-600 mb-2 flex items-center gap-1">
          <Heart className="h-3 w-3" />
          感情婚姻 · {personality.relationship.style}
        </h6>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-muted-foreground font-medium">感情优点</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {personality.relationship.strengths.map((s, idx) => (
                  <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-pink-100 dark:bg-pink-800/50 text-pink-700 dark:text-pink-300 rounded">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground font-medium">感情挑战</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {personality.relationship.challenges.map((c, idx) => (
                  <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-orange-100 dark:bg-orange-800/50 text-orange-700 dark:text-orange-300 rounded">{c}</span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-medium">理想伴侣</span>
            <p className="text-xs text-foreground mt-0.5">{personality.relationship.idealPartner}</p>
          </div>
          <p className="text-xs text-muted-foreground">{personality.relationship.advice}</p>
        </div>
      </div>

      {/* 健康提示 */}
      <div className="rounded-lg p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
        <h6 className="text-xs font-medium text-rose-600 mb-2 flex items-center gap-1">
          <Activity className="h-3 w-3" />
          健康提示
        </h6>
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1">
            {personality.health.focus.map((item, idx) => (
              <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-rose-100 dark:bg-rose-800/50 text-rose-700 dark:text-rose-300 rounded">{item}</span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{personality.health.advice}</p>
        </div>
      </div>

      {/* 如何沟通 */}
      <div className="rounded-lg p-3 bg-primary/5 border border-primary/20">
        <h6 className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          如何沟通 · {personality.communication.approach}
        </h6>
        
        <div className="space-y-2">
          <div>
            <span className="text-[10px] text-muted-foreground font-medium">沟通技巧</span>
            <ul className="mt-0.5 space-y-0.5">
              {personality.communication.tips.map((tip, idx) => (
                <li key={idx} className="text-xs text-foreground">✓ {tip}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-medium">沟通禁忌</span>
            <ul className="mt-0.5 space-y-0.5">
              {personality.communication.avoid.map((avoid, idx) => (
                <li key={idx} className="text-xs text-destructive">✗ {avoid}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// 神煞表格 - 按柱排列：年柱、月柱、日柱（命宫）、时柱
const PILLAR_ORDER = ['年柱', '月柱', '日柱', '时柱'];
const PILLAR_LABELS: Record<string, string> = { '年柱': '年柱', '月柱': '月柱', '日柱': '日（命宫）', '时柱': '时柱' };

const ShenShaTable: React.FC<{ auspicious: ShenShaInfo[]; inauspicious: ShenShaInfo[] }> = ({ auspicious, inauspicious }) => {
  const allShenSha = [...auspicious, ...inauspicious];
  if (allShenSha.length === 0) {
    return <p className="text-xs text-muted-foreground">未检测到显著神煞</p>;
  }

  // Group by pillar, items not matching any pillar go to "其他"
  const grouped: Record<string, ShenShaInfo[]> = {};
  for (const pillar of PILLAR_ORDER) {
    grouped[pillar] = [];
  }
  grouped['其他'] = [];

  for (const sha of allShenSha) {
    const loc = sha.location || '';
    let placed = false;
    for (const pillar of PILLAR_ORDER) {
      if (loc.includes(pillar.replace('柱', '')) || loc.includes(pillar)) {
        grouped[pillar].push(sha);
        placed = true;
        break;
      }
    }
    if (!placed) {
      grouped['其他'].push(sha);
    }
  }

  const pillarKeys = [...PILLAR_ORDER, ...(grouped['其他'].length > 0 ? ['其他'] : [])];

  return (
    <div className="space-y-2">
      {pillarKeys.map(pillar => {
        const items = grouped[pillar];
        if (!items || items.length === 0) return null;
        const label = PILLAR_LABELS[pillar] || pillar;
        return (
          <div key={pillar}>
            <h5 className="text-xs font-medium text-muted-foreground mb-1 border-b border-border pb-0.5">
              {label}
            </h5>
            <div className="space-y-0.5">
              {items.map((sha, idx) => (
                <div key={idx} className="flex items-start gap-2 py-0.5 text-xs">
                  <span className={cn(
                    'font-medium whitespace-nowrap min-w-[4.5rem]',
                    sha.type === 'auspicious' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {sha.type === 'auspicious' ? '★' : '▲'} {sha.name}
                  </span>
                  <span className="text-muted-foreground">{sha.effect}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 特殊格局表格
const SpecialPatternsTable: React.FC<{ auspicious: SpecialPatternInfo[]; inauspicious: SpecialPatternInfo[] }> = ({ auspicious, inauspicious }) => {
  if (auspicious.length === 0 && inauspicious.length === 0) {
    return <p className="text-xs text-muted-foreground">未检测到特殊格局</p>;
  }

  return (
    <div className="space-y-2">
      {auspicious.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-green-600 mb-1">吉格 ({auspicious.length})</h5>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-7 text-xs">格局</TableHead>
                <TableHead className="h-7 text-xs">说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auspicious.map((pat, idx) => (
                <TableRow key={idx}>
                  <TableCell className="py-1.5 text-xs w-24 font-medium text-green-600">{pat.name}</TableCell>
                  <TableCell className="py-1.5 text-xs text-muted-foreground">{pat.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {inauspicious.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-red-600 mb-1">凶格 ({inauspicious.length})</h5>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-7 w-24 text-xs">格局</TableHead>
                <TableHead className="h-7 text-xs">说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inauspicious.map((pat, idx) => (
                <TableRow key={idx}>
                  <TableCell className="py-1.5 text-xs font-medium text-red-600">{pat.name}</TableCell>
                  <TableCell className="py-1.5 text-xs text-muted-foreground">{pat.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

// 运势表格
const FortuneTable: React.FC<{ fortune: { currentLuck: string; favorableYears: string[]; unfavorableYears: string[]; advices: string[] } }> = ({ fortune }) => {
  return (
    <div className="space-y-2">
      <div className="bg-primary/10 rounded-lg p-2 text-xs">{fortune.currentLuck}</div>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="py-1.5 w-20 text-xs font-medium text-green-600">喜用年份</TableCell>
            <TableCell className="py-1.5">
              <div className="flex flex-wrap gap-1">
                {fortune.favorableYears.slice(0, 4).map((year, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px] border-green-300 text-green-600">{year}</Badge>
                ))}
              </div>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="py-1.5 text-xs font-medium text-red-600">忌讳年份</TableCell>
            <TableCell className="py-1.5">
              <div className="flex flex-wrap gap-1">
                {fortune.unfavorableYears.slice(0, 4).map((year, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px] border-red-300 text-red-600">{year}</Badge>
                ))}
              </div>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="py-1.5 text-xs font-medium text-muted-foreground">命理建议</TableCell>
            <TableCell className="py-1.5">
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {fortune.advices.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-primary">•</span><span>{advice}</span>
                  </li>
                ))}
              </ul>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

// 五行力量表格
const ElementsTable: React.FC<{ elementStrengths: Record<number, number> }> = ({ elementStrengths }) => {
  const total = Object.values(elementStrengths).reduce((a, b) => a + b, 0);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {[0, 1, 2, 3, 4].map(el => (
            <TableHead key={el} className={cn('h-7 text-xs text-center', getElementColor(el))}>
              {ELEMENT_NAMES[el]}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          {[0, 1, 2, 3, 4].map(el => {
            const strength = elementStrengths[el];
            const percent = Math.round((strength / total) * 100);
            return (
              <TableCell key={el} className="py-1.5 text-xs text-center">
                {percent}%
              </TableCell>
            );
          })}
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default BaziPatternDisplay;