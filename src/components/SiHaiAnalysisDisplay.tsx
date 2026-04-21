import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, AlertTriangle, Skull, Zap, DoorClosed, Sparkles, Shield, Info } from 'lucide-react';
import { ChartData, PalaceData } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { getComponentT } from '@/data/destinyTranslations';
import {
  SI_HAI_DATA, REMEDY_METHODS, CRYSTAL_REMEDIES, SPECIAL_REMEDY_NOTES, SI_HAI_BRIEF,
  STEM_SI_HAI_TRAITS, JI_XING_DETAILS,
  MEN_PO_DETAILS, MEN_PO_JI_XIONG,
} from '@/data/siHaiEncyclopediaData';
import { HEAVENLY_STEMS, DOORS, PALACE_ELEMENTS, DOOR_ELEMENTS, Element } from '@/lib/constants';

interface SiHaiAnalysisDisplayProps {
  chart: ChartData;
}

interface SiHaiDetection {
  type: 'kong_wang' | 'ru_mu' | 'ji_xing' | 'men_po';
  name: string;
  palace: number;
  palaceName: string;
  detail: string;
  symbol?: string;
  severity: 'high' | 'medium' | 'low';
}

const PALACE_NAMES: Record<number, string> = {
  1: '坎宫', 2: '坤宫', 3: '震宫', 4: '巽宫', 5: '中宫', 6: '乾宫', 7: '兑宫', 8: '艮宫', 9: '离宫',
};

const isGateCompel = (doorName: string, palaceId: number): boolean => {
  if (!doorName) return false;
  const dIdx = DOORS.indexOf(doorName);
  if (dIdx === -1) return false;
  const doorEl = DOOR_ELEMENTS[dIdx];
  const palaceEl = PALACE_ELEMENTS[palaceId];
  if (doorEl === Element.METAL && palaceEl === Element.FIRE) return true;
  if (doorEl === Element.WOOD && palaceEl === Element.METAL) return true;
  if (doorEl === Element.EARTH && palaceEl === Element.WOOD) return true;
  if (doorEl === Element.WATER && palaceEl === Element.EARTH) return true;
  if (doorEl === Element.FIRE && palaceEl === Element.WATER) return true;
  return false;
};

// Get stem trait for a given stem
const getStemTrait = (stem: string) => {
  return STEM_SI_HAI_TRAITS.find(t => t.stems.includes(stem));
};




const SiHaiAnalysisDisplay: React.FC<SiHaiAnalysisDisplayProps> = ({ chart }) => {
  const { currentLanguage } = useLanguage();
  const ct = getComponentT(currentLanguage);
  const detections = useMemo<SiHaiDetection[]>(() => {
    const results: SiHaiDetection[] = [];
    const palaces = chart.palaces;

    // 1. 空亡
    palaces.forEach(palace => {
      if (palace.empty) {
        results.push({ type: 'kong_wang', name: '空亡', palace: palace.id, palaceName: PALACE_NAMES[palace.id] || `${palace.id}宫`, detail: `${PALACE_NAMES[palace.id]}落空亡`, severity: 'high' });
      }
    });

    // 2. 入墓
    palaces.forEach(palace => {
      if (palace.skyStatus?.isMu) {
        results.push({ type: 'ru_mu', name: '入墓', palace: palace.id, palaceName: PALACE_NAMES[palace.id] || `${palace.id}宫`, detail: `${palace.skyStem}入墓于${PALACE_NAMES[palace.id]}`, symbol: palace.skyStem, severity: 'high' });
      }
      if (palace.sky2Status?.isMu && palace.skyStem2) {
        results.push({ type: 'ru_mu', name: '入墓', palace: palace.id, palaceName: PALACE_NAMES[palace.id] || `${palace.id}宫`, detail: `${palace.skyStem2}入墓于${PALACE_NAMES[palace.id]}`, symbol: palace.skyStem2, severity: 'high' });
      }
      if (palace.earthStatus?.isMu) {
        results.push({ type: 'ru_mu', name: '入墓', palace: palace.id, palaceName: PALACE_NAMES[palace.id] || `${palace.id}宫`, detail: `${palace.earthStem}入墓于${PALACE_NAMES[palace.id]}（地盘）`, symbol: palace.earthStem, severity: 'high' });
      }
      if (palace.earth2Status?.isMu && palace.earthStem2) {
        results.push({ type: 'ru_mu', name: '入墓', palace: palace.id, palaceName: PALACE_NAMES[palace.id] || `${palace.id}宫`, detail: `${palace.earthStem2}入墓于${PALACE_NAMES[palace.id]}（地盘）`, symbol: palace.earthStem2, severity: 'high' });
      }
    });

    // 3. 击刑
    palaces.forEach(palace => {
      if (palace.skyStatus?.isXing) {
        results.push({ type: 'ji_xing', name: '击刑', palace: palace.id, palaceName: PALACE_NAMES[palace.id] || `${palace.id}宫`, detail: `${palace.skyStem}击刑于${PALACE_NAMES[palace.id]}`, symbol: palace.skyStem, severity: 'medium' });
      }
      if (palace.sky2Status?.isXing && palace.skyStem2) {
        results.push({ type: 'ji_xing', name: '击刑', palace: palace.id, palaceName: PALACE_NAMES[palace.id] || `${palace.id}宫`, detail: `${palace.skyStem2}击刑于${PALACE_NAMES[palace.id]}`, symbol: palace.skyStem2, severity: 'medium' });
      }
      if (palace.earthStatus?.isXing) {
        results.push({ type: 'ji_xing', name: '击刑', palace: palace.id, palaceName: PALACE_NAMES[palace.id] || `${palace.id}宫`, detail: `${palace.earthStem}击刑于${PALACE_NAMES[palace.id]}（地盘）`, symbol: palace.earthStem, severity: 'medium' });
      }
      if (palace.earth2Status?.isXing && palace.earthStem2) {
        results.push({ type: 'ji_xing', name: '击刑', palace: palace.id, palaceName: PALACE_NAMES[palace.id] || `${palace.id}宫`, detail: `${palace.earthStem2}击刑于${PALACE_NAMES[palace.id]}（地盘）`, symbol: palace.earthStem2, severity: 'medium' });
      }
    });

    // 4. 门迫
    palaces.forEach(palace => {
      if (palace.isMenPo) {
        const dIdx = DOORS.indexOf(palace.door);
        const doorEl = dIdx !== -1 ? DOOR_ELEMENTS[dIdx] : undefined;
        const palaceEl = PALACE_ELEMENTS[palace.id];
        const elementName = (el: Element | undefined) => {
          if (el === undefined) return '';
          return ['木', '火', '土', '金', '水'][el] || '';
        };
        results.push({ type: 'men_po', name: '门迫', palace: palace.id, palaceName: PALACE_NAMES[palace.id] || `${palace.id}宫`, detail: `${palace.door}（${elementName(doorEl)}）入${PALACE_NAMES[palace.id]}（${elementName(palaceEl)}）受迫`, symbol: palace.door, severity: 'medium' });
      }
    });

    return results;
  }, [chart.palaces]);

  const groupedDetections = useMemo(() => ({
    kong_wang: detections.filter(d => d.type === 'kong_wang'),
    ru_mu: detections.filter(d => d.type === 'ru_mu'),
    ji_xing: detections.filter(d => d.type === 'ji_xing'),
    men_po: detections.filter(d => d.type === 'men_po'),
  }), [detections]);

  const typeConfig = {
    kong_wang: { icon: AlertTriangle, color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-200 dark:border-blue-800' },
    ru_mu: { icon: Skull, color: 'text-orange-500', bg: 'bg-orange-500/5', border: 'border-orange-200 dark:border-orange-800' },
    ji_xing: { icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/5', border: 'border-purple-200 dark:border-purple-800' },
    men_po: { icon: DoorClosed, color: 'text-red-500', bg: 'bg-red-500/5', border: 'border-red-200 dark:border-red-800' },
  };

  const getSiHaiInfo = (type: string) => SI_HAI_DATA.find(s => s.id === type);

  const getRemediesForTypes = (types: string[]) => {
    return REMEDY_METHODS.filter(m => m.applicableTo.some(t => types.includes(t)));
  };

  const activeTypes = Object.entries(groupedDetections)
    .filter(([_, items]) => items.length > 0)
    .map(([type]) => getSiHaiInfo(type)?.name || type);

  const applicableRemedies = getRemediesForTypes(activeTypes);

  // Collect unique stems affected by 四害
  const affectedStems = useMemo(() => {
    const stems = new Set<string>();
    detections.forEach(d => {
      if (d.symbol && HEAVENLY_STEMS.includes(d.symbol)) {
        stems.add(d.symbol);
      }
    });
    return Array.from(stems);
  }, [detections]);

  const stemTraits = useMemo(() => {
    const traits = new Set<string>();
    const result: { stems: string; trait: string; health?: string }[] = [];
    affectedStems.forEach(stem => {
      const t = getStemTrait(stem);
      if (t && !traits.has(t.element)) {
        traits.add(t.element);
        result.push({ stems: t.stems.join(''), trait: t.trait, health: t.health });
      }
    });
    return result;
  }, [affectedStems]);

  if (detections.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            {ct.fourHarmsDetection}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">{ct.fourHarmsClean}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {ct.fourHarmsDetection}
          <Badge variant="outline" className="ml-auto text-xs border-amber-300 text-amber-600">
            {detections.length} {ct.items}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* <div className="text-md text-center font-medium text-amber-600 dark:text-amber-400">{ct.fourHarmsUpgrading}</div> */}

        {/* 天干性格特征 */}
        {stemTraits.length > 0 && (
          <div className="bg-amber-500/5 rounded-lg p-3 space-y-1.5">
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400">🔮 天干受害特征</div>
            {stemTraits.map((t, idx) => (
              <div key={idx} className="text-sm">
                <Badge variant="outline" className="text-xs mr-1.5">{t.stems}</Badge>
                <span>{t.trait}</span>
                {t.health && <span className="text-muted-foreground ml-1">（{t.health}）</span>}
              </div>
            ))}
          </div>
        )}

        {/* 四害检测结果 */}
        {Object.entries(groupedDetections).map(([type, items]) => {
          if (items.length === 0) return null;
          const config = typeConfig[type as keyof typeof typeConfig];
          const Icon = config.icon;
          const siHaiInfo = getSiHaiInfo(type);
          const brief = SI_HAI_BRIEF[type];

          return (
            <Collapsible key={type}>
              <CollapsibleTrigger className={`flex flex-row items-center justify-between w-full p-3 ${config.bg} hover:opacity-80 rounded-lg transition-colors`}>
                <div className="flex flex-row items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span className="font-medium text-sm">{siHaiInfo?.name || type}</span>
                  <Badge variant="outline" className={`text-xs ${config.border}`}>{items.length}</Badge>
                  {brief && <span className="text-xs text-muted-foreground hidden sm:inline">— {brief}</span>}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="pl-2 space-y-3">
                  
                {/* 检测到的具体情况 */}
              <div className="flex flex-row items-center gap-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex flex-row items-center gap-2 text-sm">
                    <Badge variant="outline" className={`text-xs ${config.border}`}>{item.palaceName}</Badge>
                  </div>
                ))}
              </div>

              {/* 击刑 - 详细天干解读 */}
              {type === 'ji_xing' && items.map((item, idx) => {
                const detail = JI_XING_DETAILS.find(d => d.palaceName === PALACE_NAMES[item.palace]?.replace('宫', ''));
                if (!detail) return null;
                return (
                  <div key={`xing-detail-${idx}`} className="bg-red-500/5 rounded-lg p-3 space-y-1.5">
                    <div className="flex flex-row items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400">
                      <span>{detail.stem} → {detail.palaceName}宫（{detail.element}）</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div><span className="text-muted-foreground">健康：</span>{detail.health}</div>
                      <div><span className="text-muted-foreground">化解六合：</span>{detail.liuHe}</div>
                    </div>
                    <p className="text-xs"><span className="text-muted-foreground">问题：</span>{detail.problems}</p>
                    {detail.specialNote && <p className="text-xs text-amber-600 dark:text-amber-400">⚠️ {detail.specialNote}</p>}
                  </div>
                );
              })}

              {/* 门迫 - 详细门解读 */}
              {type === 'men_po' && items.map((item, idx) => {
                const detail = MEN_PO_DETAILS.find(d => d.door === item.symbol);
                if (!detail) return null;
                  return (
                  <div key={`menpo-detail-${idx}`} className="bg-blue-500/5 rounded-lg p-3 space-y-1.5">
                      <div className="flex flex-row items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">{detail.door}</Badge>
                        <span className="text-muted-foreground">属{detail.element}</span>
                        <Badge variant="outline" className="text-xs" style={{ borderColor: detail.color === '青色' ? '#0ea5e9' : detail.color === '紫色' ? '#a855f7' : detail.color === '黑色' ? '#64748b' : detail.color === '黄色' ? '#eab308' : detail.color === '白色' ? '#94a3b8' : undefined }}>
                        {detail.color}（{detail.colorReason}）
                        </Badge>
                      <span className="text-xs text-muted-foreground">六合：{detail.liuHe}</span>
                    </div>
                    <p className="text-xs"><span className="text-muted-foreground">主：</span>{detail.mainMeaning}，<strong className="text-foreground">{detail.keyIssue}</strong></p>
                    <p className="text-xs text-muted-foreground">{detail.menPoEffect}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">→ 解决：{detail.remedy}</p>
                  </div>
                );
              })}

              {/* 门迫吉凶区别 */}
              {type === 'men_po' && (
                <div className="bg-muted/50 rounded-lg p-2.5 space-y-1 text-xs">
                  <p>{MEN_PO_JI_XIONG.ji}</p>
                  <p>{MEN_PO_JI_XIONG.xiong}</p>
                  <p className="text-muted-foreground">{MEN_PO_JI_XIONG.remedy}</p>
                </div>
              )}

              {/* 四害影响说明 */}
              {siHaiInfo && (
                <div className={`${config.bg} rounded-lg p-3 space-y-2`}>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Info className="h-3 w-3" />
                    <span>影响说明</span>
                  </div>
                  <p className="text-sm text-foreground">{siHaiInfo.interpretation.general}</p>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div><span className="text-muted-foreground">事业：</span><span>{siHaiInfo.interpretation.career.slice(0, 30)}...</span></div>
                    <div><span className="text-muted-foreground">健康：</span><span>{siHaiInfo.interpretation.health.slice(0, 30)}...</span></div>
                  </div>
                </div>
              )}

              {/* 化解建议 */}
              {siHaiInfo && siHaiInfo.remedies.length > 0 && (
                <div className="bg-green-500/5 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <Sparkles className="h-3 w-3" />
                    <span>化解方法</span>
                  </div>
                <ul className="space-y-1">
                    {siHaiInfo.remedies.slice(0, 3).map((remedy, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-1.5">
                      <span className="text-green-500 shrink-0">→</span>
                        <span>{remedy}</span>
                    </li>
                  ))}
                  </ul>
                </div>
              )}
              </div>
            </CollapsibleContent>
          </Collapsible>
          );
        })}

        {/* 综合化解建议 */}
        <Collapsible>
          <CollapsibleTrigger className="flex flex-row items-center justify-between w-full p-3 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-lg transition-colors">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-sm">综合化解建议</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="pl-2 space-y-3">
              <div className="bg-amber-500/5 rounded-lg p-3 space-y-2">
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400">⚠️ 特殊注意</div>
                <ul className="space-y-1">
                  {SPECIAL_REMEDY_NOTES.map((note, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">{note}</li>
                  ))}
                </ul>
              </div>

              {applicableRemedies.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">✨ 推荐化解</div>
                  <div className="grid gap-2">
                    {applicableRemedies.slice(0, 4).map((remedy, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-lg p-2.5 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{remedy.category}</Badge>
                          <span className="text-sm font-medium">{remedy.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{remedy.usage}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detections.some(d => d.type === 'men_po') && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400">💎 水晶能量增强</div>
                  <div className="flex flex-wrap gap-1.5">
                    {detections
                      .filter(d => d.type === 'men_po')
                      .map(d => {
                        const crystal = CRYSTAL_REMEDIES.find(c => c.door === d.symbol);
                        if (!crystal) return null;
                        return (
                          <Badge key={d.symbol} variant="outline" className="text-xs bg-purple-500/5">
                            {crystal.door}→{crystal.crystal}（{crystal.color}）
                          </Badge>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default SiHaiAnalysisDisplay;