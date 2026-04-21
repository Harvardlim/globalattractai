import React, { useMemo, useState } from 'react';
import { FourPillars } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { getComponentT } from '@/data/destinyTranslations';
import { analyzeGeJu, GeJuInfo, getTenGodName, BRANCH_HIDDEN_STEMS, GEJU_HEAVENLY_STEMS, GEJU_EARTHLY_BRANCHES } from '@/lib/baziGeJuAnalysis';
import { analyzeBaziPattern, formatRootInfo } from '@/lib/baziPatternAnalysis';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Info, AlertCircle, AlertOctagon, ChevronDown, CheckCircle2, Briefcase, User, Heart, Lightbulb, ShieldAlert, Star, AlertTriangle, Dock } from 'lucide-react';
import { ESTABLISHED_PATTERN_TRAITS, BROKEN_PATTERN_TRAITS, BROKEN_PATTERN_SOLUTIONS, NO_PATTERN_CHARACTERISTICS, getNormalPatternInfo, AUSPICIOUS_COMBINATIONS, INAUSPICIOUS_COMBINATIONS, CombinationPatternInfo } from '@/data/baziPatternData';
import { getTenGodCharacteristics, getTenGodCareer, TEN_GOD_ROOT_MEANINGS } from '@/data/baziTenGodsData';

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

interface GeJuDisplayProps {
  pillars: FourPillars;
  includeHour?: boolean;
  className?: string;
}

// 成格/破格特征卡片
const PatternTraitsCard: React.FC<{ isEstablished: boolean; patternName: string; patternDescription?: string }> = ({ isEstablished, patternName, patternDescription }) => {
  const traits = isEstablished ? ESTABLISHED_PATTERN_TRAITS : BROKEN_PATTERN_TRAITS;
  const patternInfo = getNormalPatternInfo(patternName);
  
  return (
    <div className="space-y-3">
      {/* 格局解说 */}
      {isEstablished && patternDescription && (
        <div className="rounded-lg p-3 border bg-primary/5 border-primary/20">
          <h6 className="text-xs font-medium mb-1 flex items-center gap-1 text-primary">
            <Crown className="h-3 w-3" />
            格局解说
          </h6>
          <p className="text-xs text-muted-foreground">{patternDescription}</p>
        </div>
      )}
      
      {/* 特征列表 */}
      <div className={cn(
        'rounded-lg p-3 border',
        isEstablished 
          ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800/50' 
          : 'bg-orange-50/50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800/50'
      )}>
        <h6 className={cn(
          'text-xs font-medium mb-2 flex items-center gap-1',
          isEstablished ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'
        )}>
          {isEstablished ? <Crown className="h-3 w-3" /> : <AlertOctagon className="h-3 w-3" />}
          {traits.title}
        </h6>
        <ul className="space-y-1.5">
          {traits.characteristics.map((trait, idx) => (
            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className={cn(
                'shrink-0 mt-0.5',
                isEstablished ? 'text-green-600' : 'text-orange-500'
              )}>
                {isEstablished ? <CheckCircle2 className="h-3 w-3" /> : <Info className="h-3 w-3" />}
              </span>
              <span>{trait}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 无格局人特征 - 仅在无格局时显示 */}
      {!isEstablished && (
        <div className="rounded-lg p-3 border bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800/50">
          <h6 className="text-xs font-medium mb-2 flex items-center gap-1 text-amber-700 dark:text-amber-400">
            <User className="h-3 w-3" />
            {NO_PATTERN_CHARACTERISTICS.title}
          </h6>
          <ul className="space-y-1.5">
            {NO_PATTERN_CHARACTERISTICS.traits.map((trait, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="shrink-0 mt-0.5 text-amber-500">•</span>
                <span>{trait}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 破格解决方案 - 仅在无格局/破格时显示 */}
      {!isEstablished && (
        <div className="rounded-lg p-3 border bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800/50">
          <h6 className="text-xs font-medium mb-2 flex items-center gap-1 text-blue-700 dark:text-blue-400">
            <Lightbulb className="h-3 w-3" />
            破局建议
          </h6>
          <ul className="space-y-1.5">
            {BROKEN_PATTERN_SOLUTIONS.map((solution, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="shrink-0 mt-0.5 text-blue-500">
                  <CheckCircle2 className="h-3 w-3" />
                </span>
                <span>{solution}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 格局详情 */}
      {patternInfo && (
        <div className="rounded-lg p-3 border bg-muted/30">
          <h6 className="text-xs font-medium mb-2 flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {patternName}详解
          </h6>
          <div className="space-y-1.5 text-xs">
            <div>
              <span className="text-muted-foreground">成格条件：</span>
              <span>{patternInfo.formationCondition}</span>
            </div>
            <div>
              <span className="text-muted-foreground">核心特征：</span>
              <span>{patternInfo.coreCharacteristics}</span>
            </div>
            <div>
              <span className="text-muted-foreground">现代领域：</span>
              <span>{patternInfo.modernFields.join('、')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">护卫需求：</span>
              <span>{patternInfo.protectionNeeds.join('、')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">怕遇见：</span>
              <span className="text-red-500">{patternInfo.fears.join('、')}</span>
            </div>
          </div>
        </div>
      )}
    
    </div>
  );
};

// 十神通根表格
const RootsTable: React.FC<{ stemAnalyses: any[] }> = ({ stemAnalyses }) => {
  const getRootMeaning = (tenGodName: string, isRooted: boolean, hasInjury?: boolean): string | null => {
    const meanings = TEN_GOD_ROOT_MEANINGS[tenGodName];
    if (!meanings) return null;
    if (hasInjury) return meanings.injured;
    return isRooted ? meanings.rooted : meanings.unrooted;
  };

  // 过滤掉日柱（日主与自己地支比较无意义）
  const filteredStemAnalyses = stemAnalyses.filter(stem => stem.pillarName !== '日柱');

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-7 text-xs">位置</TableHead>
          {/* <TableHead className="h-7 text-xs">十神</TableHead> */}
          <TableHead className="h-7 text-xs">通根</TableHead>
          <TableHead className="h-7 text-xs">命理表现</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredStemAnalyses.map((stem, idx) => {
          const rootMeaning = getRootMeaning(stem.tenGodName, stem.isRooted, stem.rootInjury);
          return (
            <TableRow key={idx}>
              <TableCell className="py-1.5 text-xs w-20">
                <div className="flex flex-col">
                  <span>{stem.pillarName}干</span>
                  <span className={cn('text-xs font-bold', getElementColor(stem.element))}>{stem.stem}</span>
                  <span>({stem.tenGodName})</span>
                </div>
              </TableCell>
              {/* <TableCell className="py-1.5 text-xs w-16">{stem.tenGodName}</TableCell> */}
              <TableCell className="py-1.5 text-xs w-30">
                {stem.isRooted ? (
                  <span className="text-green-600">
                    {formatRootInfo(stem.roots)}
                    <div className="mt-1">
                      {stem.hasMonthRoot && <Badge variant="default" className="text-[10px] ml-1 bg-primary h-4">得令</Badge>}
                    </div>
                  </span>
                ) : (
                  <span className="text-orange-500">无根</span>
                )}
              </TableCell>
              <TableCell className="py-1.5 text-xs text-muted-foreground">
                {rootMeaning || '-'}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

// 十神性格分析表格 - 排序：成格 > 月令本气 > 日柱自坐 > 其他格局
const TenGodPersonalityTable: React.FC<{ geJuList: GeJuInfo[]; pillars: FourPillars }> = ({ geJuList, pillars }) => {
  const uniqueTenGods = useMemo(() => {
    const seen = new Set<string>();
    const result: { tenGodName: string; pillarName: string; rule: number; source?: string; priority: number }[] = [];
    const dayStemIdx = pillars.day.ganIdx;
    const isValid = (name: string) => name !== '比肩' && name !== '劫财' && name !== '日主';
    
    // 1. 成格的十神（最高优先级 = 0）
    for (const ge of geJuList) {
      const tenGodName = ge.tenGodName || ge.name.replace(/格$/, '').replace(/^自坐/, '');
      if (!seen.has(tenGodName) && isValid(tenGodName)) {
        seen.add(tenGodName);
        result.push({
          tenGodName,
          pillarName: `成格·${ge.pillarName}`,
          rule: ge.rule,
          source: ge.description,
          priority: 0,
        });
      }
    }
    
    // 2. 月令坐下本气十神（优先级 = 1，无条件加入，不论是否成格）
    const monthBranchHidden = BRANCH_HIDDEN_STEMS[pillars.month.zhiIdx] || [];
    if (monthBranchHidden.length > 0) {
      const monthMainHiddenIdx = monthBranchHidden[0];
      const monthMainTenGod = getTenGodName(dayStemIdx, monthMainHiddenIdx);
      const monthBranch = GEJU_EARTHLY_BRANCHES[pillars.month.zhiIdx];
      if (!seen.has(monthMainTenGod) && monthMainTenGod !== '日主') {
        seen.add(monthMainTenGod);
        result.push({
          tenGodName: monthMainTenGod,
          pillarName: '月令·本气',
          rule: 1,
          source: `月支${monthBranch}藏${GEJU_HEAVENLY_STEMS[monthMainHiddenIdx]}(本气)`,
          priority: 1,
        });
      }
    }
    
    // 3. 日柱自坐的十神（优先级 = 2，日支本气必加 + 中气）
    const dayBranchHidden = BRANCH_HIDDEN_STEMS[pillars.day.zhiIdx] || [];
    const dayBranch = GEJU_EARTHLY_BRANCHES[pillars.day.zhiIdx];
    for (let i = 0; i < Math.min(2, dayBranchHidden.length); i++) {
      const hiddenIdx = dayBranchHidden[i];
      const tenGod = getTenGodName(dayStemIdx, hiddenIdx);
      const posName = i === 0 ? '本气' : '中气';
      // 自坐本气无条件加入（不过滤比肩/劫财），中气仍过滤
      const shouldAdd = i === 0 ? !seen.has(tenGod) : (!seen.has(tenGod) && isValid(tenGod));
      if (shouldAdd) {
        seen.add(tenGod);
        result.push({
          tenGodName: tenGod,
          pillarName: `日支自坐·${posName}`,
          rule: 1,
          source: `${dayBranch}藏${GEJU_HEAVENLY_STEMS[hiddenIdx]}(${posName})`,
          priority: 2,
        });
      }
    }
    
    // 4. 其他格局：所有天干与每个地支的本气/中气十神一致（优先级 = 3/4）
    // 收集所有柱
    const allPillars = [
      { pillar: pillars.year, name: '年柱' },
      { pillar: pillars.month, name: '月柱' },
      { pillar: pillars.day, name: '日柱' },
      { pillar: pillars.hour, name: '时柱' },
    ];
    // 收集所有地支的本气和中气十神
    const branchTenGods = new Map<string, { branchName: string; position: string; priority: number }>();
    for (const { pillar, name } of allPillars) {
      const hidden = BRANCH_HIDDEN_STEMS[pillar.zhiIdx] || [];
      for (let i = 0; i < Math.min(2, hidden.length); i++) {
        const tenGod = getTenGodName(dayStemIdx, hidden[i]);
        const posName = i === 0 ? '本气' : '中气';
        const pri = i === 0 ? 3 : 4; // 本气优先于中气
        if (isValid(tenGod) && (!branchTenGods.has(`${tenGod}-${name}`) || pri < (branchTenGods.get(`${tenGod}-${name}`)?.priority ?? 99))) {
          branchTenGods.set(`${tenGod}-${name}`, { branchName: `${name}${GEJU_EARTHLY_BRANCHES[pillar.zhiIdx]}${posName}`, position: posName, priority: pri });
        }
      }
    }
    // 检查每个天干十神是否与某地支本气/中气一致
    for (const { pillar: stemPillar, name: stemName } of allPillars) {
      if (stemName === '日柱') continue; // 日干是日主，跳过
      const stemTenGod = getTenGodName(dayStemIdx, stemPillar.ganIdx);
      if (!isValid(stemTenGod) || seen.has(stemTenGod)) continue;
      
      // 查找匹配的地支
      for (const { pillar: branchPillar, name: branchName } of allPillars) {
        const hidden = BRANCH_HIDDEN_STEMS[branchPillar.zhiIdx] || [];
        for (let i = 0; i < Math.min(2, hidden.length); i++) {
          const branchTenGod = getTenGodName(dayStemIdx, hidden[i]);
          if (branchTenGod === stemTenGod) {
            const posName = i === 0 ? '本气' : '中气';
            const pri = i === 0 ? 3 : 4;
            if (!seen.has(stemTenGod)) {
              seen.add(stemTenGod);
              result.push({
                tenGodName: stemTenGod,
                pillarName: `${stemName}天干·${branchName}${posName}`,
                rule: 1,
                source: `${stemName}${GEJU_HEAVENLY_STEMS[stemPillar.ganIdx]}与${branchName}${GEJU_EARTHLY_BRANCHES[branchPillar.zhiIdx]}${posName}同为${stemTenGod}`,
                priority: pri,
              });
            }
            break;
          }
        }
        if (seen.has(stemTenGod)) break;
      }
    }
    
    // 按优先级排序：成格(0) > 月令本气(1) > 日柱自坐(2) > 其他本气(3) > 其他中气(4)
    result.sort((a, b) => a.priority - b.priority);
    
    return result;
  }, [geJuList, pillars]);

  if (uniqueTenGods.length === 0) {
    return <p className="text-xs text-muted-foreground">暂无十神性格数据</p>;
  }

  return (
    <div className="space-y-3">
      {uniqueTenGods.map((god, idx) => {
        const characteristics = getTenGodCharacteristics(god.tenGodName);
        const career = getTenGodCareer(god.tenGodName);
        
        if (!characteristics) return null;

        return (
          <div key={idx} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs font-bold">{god.tenGodName}</Badge>
              <span className="text-xs text-muted-foreground">（{god.pillarName}{god.source ? `·${god.source}` : ''}）</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <div>
                <h6 className="text-[10px] text-green-600 font-medium mb-1">优点</h6>
                <div className="flex flex-wrap gap-1">
                  {characteristics.strengths.map((s, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] border-green-300">{s}</Badge>
                  ))}
                </div>
              </div>
              <div className="border-t border-border pt-2">
                <h6 className="text-[10px] text-red-500 font-medium mb-1">缺点</h6>
                <div className="flex flex-wrap gap-1">
                  {characteristics.weaknesses.map((w, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] border-red-300">{w}</Badge>
                  ))}
                </div>
              </div>
            </div>
             
            <div className="border-t border-border pt-2">
              <h6 className="text-[10px] text-orange-500 font-medium mb-1">冲突触发点</h6>
              <div className="flex flex-wrap gap-1">
                {characteristics.conflictTriggers.map((t, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] border-orange-300">{t}</Badge>
                ))}
              </div>
            </div>

            {/* 健康提示 */}
            <div className="border-t border-border pt-2">
              <h6 className="text-[10px] text-pink-500 font-medium mb-1 flex items-center gap-1">
                <Heart className="h-3 w-3" />
                健康提示
              </h6>
              <div className="flex flex-wrap gap-1">
                {characteristics.health.map((h, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] border-pink-300">{h}</Badge>
                ))}
              </div>
            </div>

            {/* 命理建议 */}
            <div className="border-t border-border pt-2">
              <h6 className="text-[10px] text-blue-500 font-medium mb-1 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                命理建议
              </h6>
              <div className="flex flex-wrap gap-1">
                {characteristics.advice.map((a, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] border-blue-300">{a}</Badge>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-2">
                <h6 className="text-[10px] text-primary font-medium mb-1 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  个人参考
                </h6>
              <div className="space-y-1">
                <div className="text-xs">
                  <span className="text-muted-foreground">人际关系：</span>
                  <span>{characteristics.relationships}</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">情感模式：</span>
                  <span>{characteristics.emotionalStyle}</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">处事方式：</span>
                  <span>{characteristics.handlingStyle}</span>
                </div>
              </div>
            </div>
            
            {career && (
              <div className="border-t border-border pt-2">
                <h6 className="text-[10px] text-primary font-medium mb-1 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  职业参考
                </h6>
                <div className="space-y-1">
                  <div className="text-xs">
                    <span className="text-muted-foreground">核心能力：</span>
                    <span>{career.coreAbilities.join('、')}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">适合岗位：</span>
                    <span className="text-green-600">{career.suitableRoles.join('、')}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">不宜岗位：</span>
                    <span className="text-red-500">{career.unsuitableRoles.join('、')}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">传统职业：</span>
                    <span>{career.traditionalCareers.join('、')}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">新兴职业：</span>
                    <span>{career.modernCareers.join('、')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const GeJuDisplay: React.FC<GeJuDisplayProps> = ({ 
  pillars, 
  includeHour = true,
  className 
}) => {
  const { currentLanguage } = useLanguage();
  const ct = getComponentT(currentLanguage);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    traits: false,
    roots: false,
    personality: false,
    combinations: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const result = useMemo(() => {
    return analyzeGeJu(pillars, includeHour);
  }, [pillars, includeHour]);

  // 八字分析结果（用于十神通根）
  const baziAnalysis = useMemo(() => {
    return analyzeBaziPattern(pillars, includeHour);
  }, [pillars, includeHour]);

  // 月柱摘要信息
  const monthSummary = useMemo(() => {
    const dayStemIdx = pillars.day.ganIdx;
    const monthStemIdx = pillars.month.ganIdx;
    const monthBranchIdx = pillars.month.zhiIdx;
    const dayBranchIdx = pillars.day.zhiIdx;

    // 月柱天干十神
    const monthStemTenGod = getTenGodName(dayStemIdx, monthStemIdx);
    
    // 月柱地支本气
    const monthBranchHidden = BRANCH_HIDDEN_STEMS[monthBranchIdx] || [];
    const monthBenQiIdx = monthBranchHidden[0];
    const monthBenQiStem = GEJU_HEAVENLY_STEMS[monthBenQiIdx];
    const monthBenQiTenGod = getTenGodName(dayStemIdx, monthBenQiIdx);
    
    // 日支自坐（本气）十神
    const dayBranchHidden = BRANCH_HIDDEN_STEMS[dayBranchIdx] || [];
    const dayBenQiIdx = dayBranchHidden[0];
    const dayBenQiStem = GEJU_HEAVENLY_STEMS[dayBenQiIdx];
    const dayBenQiTenGod = getTenGodName(dayStemIdx, dayBenQiIdx);
    
    // 月柱是否成格：月柱天干十神 === 月柱地支本气十神
    const monthIsEstablished = monthStemTenGod === monthBenQiTenGod;
    
    return {
      monthStem: GEJU_HEAVENLY_STEMS[monthStemIdx],
      monthStemTenGod,
      monthBranch: GEJU_EARTHLY_BRANCHES[monthBranchIdx],
      monthBenQiStem,
      monthBenQiTenGod,
      dayBranch: GEJU_EARTHLY_BRANCHES[dayBranchIdx],
      dayBenQiStem,
      dayBenQiTenGod,
      monthIsEstablished,
    };
  }, [pillars]);

  // 检测吉凶格局组合 - 基于成格来检测
  const detectedCombinations = useMemo(() => {
    // 收集所有成格的格局名称
    const patternSet = new Set<string>();
    result.geJuList.forEach(ge => {
      // 提取基础格局名（去除"(日柱)"后缀）
      const baseName = ge.name.replace(/\(日柱\)$/, '');
      patternSet.add(baseName);
    });
    
    // 同时收集所有十神名称用于辅助匹配
    const tenGodSet = new Set<string>();
    baziAnalysis.stemAnalyses.forEach(stem => {
      tenGodSet.add(stem.tenGodName);
    });
    
    const auspicious: CombinationPatternInfo[] = [];
    const inauspicious: CombinationPatternInfo[] = [];
    
    // 检测吉格 - 需要成格中包含相关格局
    AUSPICIOUS_COMBINATIONS.forEach(combo => {
      if (combo.requiredPatterns && combo.requiredPatterns.length > 0) {
        // 检查是否有至少一个必需的格局存在于成格中
        const hasRequiredPattern = combo.requiredPatterns.some(pattern => patternSet.has(pattern));
        // 同时检查组合中的十神是否都存在
        const combinationParts = combo.combination.split('+').map(p => p.trim().replace(/\/.*/, '')); // 取第一个选项
        const hasTenGods = combinationParts.every(part => tenGodSet.has(part));
        
        if (hasRequiredPattern && hasTenGods) {
          auspicious.push(combo);
        }
      } else {
        // 如果没有定义 requiredPatterns，使用旧逻辑
        const parts = combo.combination.split('+').map(p => p.trim());
        if (parts.every(part => tenGodSet.has(part))) {
          auspicious.push(combo);
        }
      }
    });
    
    // 检测凶格 - 需要成格中包含相关格局
    INAUSPICIOUS_COMBINATIONS.forEach(combo => {
      if (combo.requiredPatterns && combo.requiredPatterns.length > 0) {
        const hasRequiredPattern = combo.requiredPatterns.some(pattern => patternSet.has(pattern));
        const baseParts = combo.combination.replace(/无制|透干/g, '').split('+').map(p => p.trim()).filter(Boolean);
        const hasTenGods = baseParts.every(part => tenGodSet.has(part));
        
        if (hasRequiredPattern && hasTenGods) {
          inauspicious.push(combo);
        }
      } else {
        const baseParts = combo.combination.replace(/无制|透干/g, '').split('+').map(p => p.trim()).filter(Boolean);
        if (baseParts.every(part => tenGodSet.has(part))) {
          inauspicious.push(combo);
        }
      }
    });
    
    return { auspicious, inauspicious };
  }, [result.geJuList, baziAnalysis.stemAnalyses]);

  // 获取第一个格局信息用于特征分析
  const primaryPattern = result.geJuList.length > 0 ? result.geJuList[0] : null;
  const primaryPatternName = primaryPattern?.name || '';
  const primaryPatternDescription = primaryPattern?.description || '';

  // 将相同十神的格局合并分组
  const groupedPatterns = useMemo(() => {
    const groups = new Map<string, GeJuInfo[]>();
    for (const ge of result.geJuList) {
      // 提取基础格局名（去除"(日柱)"后缀）
      const baseName = ge.name.replace(/\(日柱\)$/, '');
      if (!groups.has(baseName)) {
        groups.set(baseName, []);
      }
      groups.get(baseName)!.push(ge);
    }
    return Array.from(groups.entries());
  }, [result.geJuList]);

  // 是否有吉凶组合需要显示
  const hasCombinations = detectedCombinations.auspicious.length > 0 || detectedCombinations.inauspicious.length > 0;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className={cn('bg-card rounded-lg border border-border', className)}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <h3 className="text-sm font-medium flex items-center gap-2">
              {isOpen ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary -rotate-90" />}
              {ct.patternAnalysis}
            </h3>
          </CollapsibleTrigger>
          <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">

        {/* 月柱格局摘要 */}
        <div className="rounded-lg p-3 border bg-muted/30 space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            格局判定依据
          </h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {/* 月柱地支本气 */}
            <div className="flex items-center justify-between bg-card rounded px-3 py-2 border">
              <span className="text-xs text-muted-foreground">月支本气</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{monthSummary.monthBranch}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{monthSummary.monthBenQiStem}</span>
                <Badge variant="outline" className="text-[10px] h-5">{monthSummary.monthBenQiTenGod}</Badge>
              </div>
            </div>
            {/* 月柱天干 */}
            <div className="flex items-center justify-between bg-card rounded px-3 py-2 border">
              <span className="text-xs text-muted-foreground">月柱天干</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{monthSummary.monthStem}</span>
                <Badge variant="outline" className="text-[10px] h-5">{monthSummary.monthStemTenGod}</Badge>
              </div>
            </div>
            {/* 日支自坐 */}
            <div className="flex items-center justify-between bg-card rounded px-3 py-2 border">
              <span className="text-xs text-muted-foreground">日支自坐</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{monthSummary.dayBranch}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{monthSummary.dayBenQiStem}</span>
                <Badge variant="outline" className="text-[10px] h-5">{monthSummary.dayBenQiTenGod}</Badge>
              </div>
            </div>
          </div>
          {/* 成格判定 */}
          <div className="flex items-center gap-2 pt-1">
            {monthSummary.monthIsEstablished ? (
              <div className="flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-700 dark:text-green-400 font-medium">
                  月柱成格：月干{monthSummary.monthStem}({monthSummary.monthStemTenGod}) = 月支{monthSummary.monthBranch}本气{monthSummary.monthBenQiStem}({monthSummary.monthBenQiTenGod})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs">
                <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  月柱未成格：月干{monthSummary.monthStem}({monthSummary.monthStemTenGod}) ≠ 月支{monthSummary.monthBranch}本气{monthSummary.monthBenQiStem}({monthSummary.monthBenQiTenGod})
                </span>
              </div>
            )}
          </div>
        </div>

        {!result.hasGeJu ? (
          <div className="space-y-3">
            {/* 无格显示 */}
            <div className="rounded-lg p-4 border border-orange-200 bg-orange-50/50 dark:bg-orange-900/10 dark:border-orange-800/50">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300">无格</h4>
                  <p className="text-xs text-orange-700/80 dark:text-orange-400/80">
                    {result.noPatternReason || '命局中无明显格局成立'}
                  </p>
                  <div className="pt-1 text-xs text-muted-foreground">
                    <p>• 各柱天干与其地支本气的十神不相同（无根）</p>
                    <p>• 各柱天干十神未在其他地支藏干中出现（无气）</p>
                  </div>

                  
                </div>
              </div>
            </div>
            
            {/* 破格特征分析 */}
            <Collapsible open={expandedSections.traits} onOpenChange={() => toggleSection('traits')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                <span className="flex items-center gap-1">
                  <Dock className="h-3 w-3" />
                  破格特征分析
                </span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.traits && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <PatternTraitsCard isEstablished={false} patternName="" patternDescription="" />
              </CollapsibleContent>
            </Collapsible>


            {/* 十神性格分析 */}
            <Collapsible open={expandedSections.personality} onOpenChange={() => toggleSection('personality')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  十神性格分析
                </span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.personality && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <TenGodPersonalityTable geJuList={result.geJuList} pillars={pillars} />
              </CollapsibleContent>
            </Collapsible>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedPatterns.map(([baseName, patterns], idx) => (
              <div key={idx} className="flex items-center gap-2 flex-wrap">
                <Crown className="h-4 w-4 text-primary shrink-0" />
                <Badge variant="secondary" className="text-sm font-bold">
                  {baseName}
                </Badge>
                {patterns.map((ge, pIdx) => {
                  // 判断是否为日柱自坐格
                  const isDayPillar = ge.name.includes('(日柱)') || ge.pillarName === '日柱';
                  const pillarLabel = isDayPillar ? '日柱' : ge.pillarName;
                  const ruleLabel = isDayPillar ? '自坐' : (ge.rule === 1 ? '有根' : '有气');
                  
                  return (
                    <Tooltip key={pIdx}>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-xs cursor-help',
                            isDayPillar 
                              ? 'border-purple-500/50 text-purple-600'
                              : ge.rule === 1 
                                ? 'border-green-500/50 text-green-600' 
                                : 'border-blue-500/50 text-blue-600'
                          )}
                        >
                          {pillarLabel} · {ruleLabel}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-sm">
                        <p className="text-xs">{ge.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
            
            {/* 吉凶格局组合 */}
            {hasCombinations && (
              <Collapsible open={expandedSections.combinations} onOpenChange={() => toggleSection('combinations')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-primary" />
                    吉凶格局组合 ({detectedCombinations.auspicious.length + detectedCombinations.inauspicious.length})
                  </span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.combinations && 'rotate-180')} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-3">
                  {/* 吉格 */}
                  {detectedCombinations.auspicious.length > 0 && (
                    <div className="rounded-lg p-3 border bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800/50">
                      <h6 className="text-xs font-medium mb-2 flex items-center gap-1 text-green-700 dark:text-green-400">
                        <Star className="h-3 w-3" />
                        吉格 ({detectedCombinations.auspicious.length})
                      </h6>
                      <div className="space-y-3">
                        {detectedCombinations.auspicious.map((combo, idx) => (
                          <div key={idx} className="text-xs space-y-2 pb-3 border-b border-green-200 dark:border-green-800 last:border-b-0 last:pb-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-green-500 text-green-600">{combo.name}</Badge>
                              <span className="text-muted-foreground">{combo.combination}</span>
                            </div>
                            <div className="text-muted-foreground pl-2">
                              <span className="text-green-600">富贵：</span>{combo.fortune}
                            </div>
                            <div className="text-muted-foreground pl-2">
                              <span className="text-primary">现代：</span>{combo.modernMapping}
                            </div>
                            {/* 优点 */}
                            {combo.advantages && combo.advantages.length > 0 && (
                              <div className="pl-2 mt-1">
                                <span className="text-green-600 font-medium">优点：</span>
                                <ul className="mt-1 space-y-0.5">
                                  {combo.advantages.map((adv, i) => (
                                    <li key={i} className="text-muted-foreground flex items-start gap-1">
                                      <span className="text-green-500 shrink-0">✓</span>
                                      <span>{adv}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {/* 缺点 */}
                            {combo.disadvantages && combo.disadvantages.length > 0 && (
                              <div className="pl-2 mt-1">
                                <span className="text-orange-500 font-medium">缺点：</span>
                                <ul className="mt-1 space-y-0.5">
                                  {combo.disadvantages.map((dis, i) => (
                                    <li key={i} className="text-muted-foreground flex items-start gap-1">
                                      <span className="text-orange-400 shrink-0">•</span>
                                      <span>{dis}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {/* 增运建议 */}
                            {combo.remedies && combo.remedies.length > 0 && (
                              <div className="pl-2 mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                                <span className="text-primary font-medium">💡 增运建议：</span>
                                <ul className="mt-1 space-y-0.5">
                                  {combo.remedies.map((remedy, i) => (
                                    <li key={i} className="text-muted-foreground flex items-start gap-1">
                                      <span className="text-primary shrink-0">→</span>
                                      <span>{remedy}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 凶格 */}
                  {detectedCombinations.inauspicious.length > 0 && (
                    <div className="rounded-lg p-3 border bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800/50">
                      <h6 className="text-xs font-medium mb-2 flex items-center gap-1 text-red-700 dark:text-red-400">
                        <AlertTriangle className="h-3 w-3" />
                        凶格 ({detectedCombinations.inauspicious.length})
                      </h6>
                      <div className="space-y-3">
                        {detectedCombinations.inauspicious.map((combo, idx) => (
                          <div key={idx} className="text-xs space-y-2 pb-3 border-b border-red-200 dark:border-red-800 last:border-b-0 last:pb-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-red-500 text-red-600">{combo.name}</Badge>
                              <span className="text-muted-foreground">{combo.combination}</span>
                            </div>
                            <div className="text-muted-foreground pl-2">
                              <span className="text-red-600">灾厄：</span>{combo.fortune}
                            </div>
                            <div className="text-muted-foreground pl-2">
                              <span className="text-blue-600">解法：</span>{combo.modernMapping}
                            </div>
                            {/* 优点（凶格中也有亮点） */}
                            {combo.advantages && combo.advantages.length > 0 && (
                              <div className="pl-2 mt-1">
                                <span className="text-green-600 font-medium">优点：</span>
                                <ul className="mt-1 space-y-0.5">
                                  {combo.advantages.map((adv, i) => (
                                    <li key={i} className="text-muted-foreground flex items-start gap-1">
                                      <span className="text-green-500 shrink-0">✓</span>
                                      <span>{adv}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {/* 缺点 */}
                            {combo.disadvantages && combo.disadvantages.length > 0 && (
                              <div className="pl-2 mt-1">
                                <span className="text-red-500 font-medium">缺点：</span>
                                <ul className="mt-1 space-y-0.5">
                                  {combo.disadvantages.map((dis, i) => (
                                    <li key={i} className="text-muted-foreground flex items-start gap-1">
                                      <span className="text-red-400 shrink-0">✗</span>
                                      <span>{dis}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {/* 化解方法 */}
                            {combo.remedies && combo.remedies.length > 0 && (
                              <div className="pl-2 mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                                <span className="text-blue-600 font-medium">🛡️ 化解方法：</span>
                                <ul className="mt-1 space-y-0.5">
                                  {combo.remedies.map((remedy, i) => (
                                    <li key={i} className="text-muted-foreground flex items-start gap-1">
                                      <span className="text-blue-500 shrink-0">→</span>
                                      <span>{remedy}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}
            {/* 成格特征分析 */}
            <Collapsible open={expandedSections.traits} onOpenChange={() => toggleSection('traits')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                <span className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  成格特征分析
                </span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.traits && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <PatternTraitsCard isEstablished={true} patternName={primaryPatternName} patternDescription={primaryPatternDescription} />
              </CollapsibleContent>
            </Collapsible>


            {/* 十神性格分析 */}
            {result.geJuList.length > 0 ? (
            <Collapsible open={expandedSections.personality} onOpenChange={() => toggleSection('personality')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  十神性格分析
                </span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.personality && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <TenGodPersonalityTable geJuList={result.geJuList} pillars={pillars} />
              </CollapsibleContent>
            </Collapsible>
            ):(<div></div>)}
          </div>
        )}
          </div>
        </CollapsibleContent>
      </Collapsible>
      </div>
    </TooltipProvider>
  );
};

export default GeJuDisplay;
