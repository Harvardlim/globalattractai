import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Heart, User, Briefcase, Sparkles, Star, DoorOpen, Shield, MapPin, AlertTriangle, Skull, Zap, GitBranch, Crown, Swords } from 'lucide-react';
import { ChartData } from '@/types';
import { analyzeQimenChart, QimenAnalysisResult } from '@/data/qimenAnalysisData';
import { analyzeZhiFuZhiShi } from '@/data/zhifuZhishiData';
import { useLanguage } from '@/hooks/useLanguage';
import { getComponentT } from '@/data/destinyTranslations';

// 地支关系数据
const BRANCH_RELATIONS: Record<string, { liuHe: string; sanHe: string; sanHui: string; chong: string; xing: string; po: string; hai: string; jue: string }> = {
  "子": { liuHe: "丑", sanHe: "辰·申", sanHui: "丑·亥", chong: "午", xing: "卯", po: "酉", hai: "未", jue: "巳" },
  "丑": { liuHe: "子", sanHe: "巳·酉", sanHui: "子·亥", chong: "未", xing: "戌", po: "辰", hai: "午", jue: "" },
  "寅": { liuHe: "亥", sanHe: "午·戌", sanHui: "卯·辰", chong: "申", xing: "巳", po: "亥", hai: "巳", jue: "酉" },
  "卯": { liuHe: "戌", sanHe: "未·亥", sanHui: "寅·辰", chong: "酉", xing: "子", po: "午", hai: "辰", jue: "申" },
  "辰": { liuHe: "酉", sanHe: "子·申", sanHui: "寅·卯", chong: "戌", xing: "辰(自刑)", po: "丑", hai: "卯", jue: "" },
  "巳": { liuHe: "申", sanHe: "丑·酉", sanHui: "午·未", chong: "亥", xing: "申", po: "申", hai: "寅", jue: "子" },
  "午": { liuHe: "未", sanHe: "寅·戌", sanHui: "巳·未", chong: "子", xing: "午(自刑)", po: "卯", hai: "丑", jue: "亥" },
  "未": { liuHe: "午", sanHe: "卯·亥", sanHui: "巳·午", chong: "丑", xing: "丑", po: "戌", hai: "子", jue: "" },
  "申": { liuHe: "巳", sanHe: "子·辰", sanHui: "酉·戌", chong: "寅", xing: "寅", po: "巳", hai: "亥", jue: "卯" },
  "酉": { liuHe: "辰", sanHe: "丑·巳", sanHui: "申·戌", chong: "卯", xing: "酉(自刑)", po: "子", hai: "戌", jue: "寅" },
  "戌": { liuHe: "卯", sanHe: "寅·午", sanHui: "申·酉", chong: "辰", xing: "未", po: "未", hai: "酉", jue: "" },
  "亥": { liuHe: "寅", sanHe: "卯·未", sanHui: "子·丑", chong: "巳", xing: "亥(自刑)", po: "寅", hai: "申", jue: "午" },
};

interface QimenAnalysisDisplayProps {
  chart: ChartData;
  gender?: '男' | '女';
}

const QimenAnalysisDisplay: React.FC<QimenAnalysisDisplayProps> = ({ chart, gender }) => {
  const { currentLanguage } = useLanguage();
  const ct = getComponentT(currentLanguage);
  const dayGan = chart.pillars.day.gan;

  const analysis = useMemo<QimenAnalysisResult>(() => {
    return analyzeQimenChart(chart.palaces, dayGan, gender);
  }, [chart.palaces, dayGan, gender]);

  const mingGongPalace = analysis.mingGongPalace;
  const [isOpen, setIsOpen] = useState(false);

  if (!mingGongPalace) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {ct.qimenAnalysis}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{ct.cannotFindDayGan} "{dayGan}"</p>
        </CardContent>
      </Card>
    );
  }




  return (
    <Card className="border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild className="flex items-center w-full p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <h3 className="text-sm font-medium flex items-center gap-2">
              {isOpen ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary -rotate-90" />}
              {ct.qimenAnalysis}
            </h3>
          </CollapsibleTrigger>
        <CollapsibleContent>
        <CardContent className="space-y-4">
        {/* 命宫信息 */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex flex-col gap-3 text-sm flex-wrap">
            <div className="flex flex-row gap-2">
              <span className="text-muted-foreground flex items-center gap-1">
                {/* 命宫（日干"{dayGan}"落宫）： */}
                {ct.mingGong}：
              </span>
              <Badge variant="outline" className="bg-primary/5">{analysis.palaceTraits?.name ?? `${mingGongPalace.id}宫`}</Badge>
            </div>
            <div className="flex flex-row gap-2">
              <span className="text-muted-foreground mr-3">{ct.starLabel}：</span>
              <Badge variant="outline" className="bg-primary/5">{mingGongPalace.star}</Badge>
            </div>
            <div className="flex flex-row gap-2">
              <span className="text-muted-foreground mr-3">{ct.doorLabel}：</span>
              <Badge variant="outline" className="bg-primary/5">{mingGongPalace.door}</Badge>
            </div>
           <div className="flex flex-row gap-2">
              <span className="text-muted-foreground mr-3">{ct.godLabel}：</span>
              <Badge variant="outline" className="bg-primary/5">{mingGongPalace.god}</Badge>
            </div>
          </div>
        </div>

        {/* 值符值使分析 */}
        {(() => {
          const relation = analyzeZhiFuZhiShi(chart.zhiFu, chart.zhiShi, chart.palaces);
          const typeColors: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
            '同宫': { icon: <Crown className="h-4 w-4 text-amber-500" />, bg: 'bg-amber-500/5 hover:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
            '相生': { icon: <Sparkles className="h-4 w-4 text-green-500" />, bg: 'bg-green-500/5 hover:bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
            '相克': { icon: <Swords className="h-4 w-4 text-red-500" />, bg: 'bg-red-500/5 hover:bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
          };
          const style = typeColors[relation.type];
          return (
            <Collapsible>
              <CollapsibleTrigger className={`flex items-center justify-between w-full p-3 ${style.bg} rounded-lg transition-colors`}>
                <div className="flex items-center gap-2">
                  {style.icon}
                  <span className="font-medium text-sm">{ct.zhiFuZhiShi}</span>
                  <Badge variant="outline" className={`text-xs ${style.text}`}>
                    {relation.subType || relation.type}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                  <div className="pl-2 space-y-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                    <span>值符：<span className="font-medium text-foreground">{chart.zhiFu}</span>
                      {relation.zhiFuPalaceName && <span className="ml-1 text-muted-foreground">（{relation.zhiFuPalaceName}）</span>}
                    </span>
                    <span>·</span>
                    <span>值使：<span className="font-medium text-foreground">{chart.zhiShi}</span>
                      {relation.zhiShiPalaceName && <span className="ml-1 text-muted-foreground">（{relation.zhiShiPalaceName}）</span>}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{relation.description}</p>
                  <ul className="space-y-1">
                    {relation.points.map((point, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-1.5">
                        <span className={`shrink-0 ${style.text}`}>•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })()}

        {/* 健康分析 - 基于空亡、入墓、击刑 */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-colors">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="font-medium text-sm">{ct.healthConcerns}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="pl-2 space-y-3">
              {analysis.healthIssues.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  {ct.noHealthIssues}
                </p>
              ) : (
                <>
                  {/* 需警惕 - 击刑 */}
                  {(() => {
                    const xingIssues = analysis.healthIssues.filter(i => i.type === 'xing');
                    if (xingIssues.length === 0) return null;
                    const allHealthIssues = [...new Set(xingIssues.flatMap(i => i.healthIssues))];
                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-red-500" />
                          <Badge variant="outline" className="text-xs border-red-300 text-red-600 dark:text-red-400">
                            {ct.needAlert}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-6">
                          {allHealthIssues.map((h, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-red-500/5 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                              {h}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 需注意 - 空亡 */}
                  {(() => {
                    const emptyIssues = analysis.healthIssues.filter(i => i.type === 'empty');
                    if (emptyIssues.length === 0) return null;
                    const allHealthIssues = [...new Set(emptyIssues.flatMap(i => i.healthIssues))];
                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 dark:text-orange-400">
                            {ct.needAttention}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-6">
                          {allHealthIssues.map((h, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-orange-500/5 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                              {h}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 需关注 - 入墓 */}
                  {(() => {
                    const tombIssues = analysis.healthIssues.filter(i => i.type === 'tomb');
                    if (tombIssues.length === 0) return null;
                    const allHealthIssues = [...new Set(tombIssues.flatMap(i => i.healthIssues))];
                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Skull className="h-4 w-4 text-purple-500" />
                          <Badge variant="outline" className="text-xs border-purple-300 text-purple-600 dark:text-purple-400">
                            {ct.needMonitor}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-6">
                          {allHealthIssues.map((h, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-purple-500/5 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                              {h}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 性格分析 */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-blue-500/5 hover:bg-blue-500/10 rounded-lg transition-colors">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">{ct.personalityTraits}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="pl-2 space-y-3">
              {/* 宫位性格 */}
              {analysis.palaceTraits && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {analysis.palaceTraits.name}{ct.palaceTraitsLabel}
                  </div>
                  <ul className="space-y-0.5">
                    {analysis.palaceTraits.traits.map((item, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-1.5">
                        <span className="text-blue-500 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* 星辰性格 */}
              {analysis.mainStar && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {analysis.mainStar.name}{ct.palaceTraitsLabel}
                  </div>
                  <ul className="space-y-0.5">
                    {analysis.mainStar.personality.map((item, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-1.5">
                        <span className="text-indigo-500 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 八门性格 */}
              {analysis.mainDoor && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <DoorOpen className="h-3 w-3" />
                    {analysis.mainDoor.name}{ct.palaceTraitsLabel}
                  </div>
                  <ul className="space-y-0.5">
                    {analysis.mainDoor.personality.map((item, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-1.5">
                        <span className="text-purple-500 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 行业分析 */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-green-500/5 hover:bg-green-500/10 rounded-lg transition-colors">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">{ct.suitableIndustries}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="pl-2 space-y-3">
              {/* 宫位行业 */}
              {analysis.palaceTraits && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {analysis.palaceTraits.name}{ct.suitableFieldLabel}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.palaceTraits.careerAdvice.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-green-500/5 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 星辰行业 */}
              {analysis.mainStar && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {analysis.mainStar.name}{ct.suitableIndustryLabel}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.mainStar.industries.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 八门行业 */}
              {analysis.mainDoor && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <DoorOpen className="h-3 w-3" />
                    {analysis.mainDoor.name}{ct.suitableIndustryLabel}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.mainDoor.industries.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-teal-500/5 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 命主地支关系 */}
        {(() => {
          const dayZhi = chart.pillars.day.zhi;
          const relations = BRANCH_RELATIONS[dayZhi];
          if (!relations) return null;
          const items = [
            { label: "六合", value: relations.liuHe, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/5 border-green-200 dark:border-green-800" },
            { label: "三合", value: relations.sanHe, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/5 border-blue-200 dark:border-blue-800" },
            { label: "三会", value: relations.sanHui, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/5 border-cyan-200 dark:border-cyan-800" },
            { label: "冲", value: relations.chong, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/5 border-red-200 dark:border-red-800" },
            { label: "刑", value: relations.xing, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/5 border-orange-200 dark:border-orange-800" },
            { label: "破", value: relations.po, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/5 border-amber-200 dark:border-amber-800" },
            { label: "害", value: relations.hai, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/5 border-rose-200 dark:border-rose-800" },
            ...(relations.jue ? [{ label: "绝", value: relations.jue, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-500/5 border-gray-200 dark:border-gray-800" }] : []),
          ];
          return (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-amber-500/5 hover:bg-amber-500/10 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-amber-500" />
                  <span className="font-medium text-sm">命主地支关系（{dayZhi}）</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="grid grid-cols-2 gap-2 pl-2">
                  {items.map((item) => (
                    <div key={item.label} className={`flex items-center gap-2 p-2 rounded-md border ${item.bg}`}>
                      <span className={`text-xs font-medium ${item.color} min-w-[28px]`}>{item.label}</span>
                      <span className="text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })()}

        {/* 八神指引 */}
        {analysis.mainGod && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-purple-500/5 hover:bg-purple-500/10 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-sm">值符指引</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="pl-2 space-y-2">
                <ul className="space-y-0.5">
                  {analysis.mainGod.guidance.map((item, idx) => (
                    <li key={idx} className="text-sm text-foreground flex items-start gap-1.5">
                      <span className="text-purple-500 shrink-0">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                  {analysis.mainGod.personality.join('；')}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default QimenAnalysisDisplay;
