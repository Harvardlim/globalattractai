import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, AlertTriangle, Shield, Lightbulb, BookOpen, Briefcase, Heart, Activity, Users, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { 
  SI_HAI_DATA, 
  SiHaiInfo, 
  SI_HAI_PALACE_QUICK_REF,
  REMEDY_DECISION_TABLE,
  SPECIAL_REMEDY_NOTES,
  REMEDY_METHODS,
  CRYSTAL_REMEDIES,
  ZODIAC_REMEDY_PRINCIPLE,
  RU_MU_PALACE_REMEDIES,
  JI_XING_PALACE_REMEDIES,
  KONG_WANG_JUDGMENTS,
  RU_MU_JUDGMENTS,
  JI_XING_JUDGMENTS,
  MEN_PO_JUDGMENTS,
  KONG_WANG_PALACE_MEANINGS,
  RU_MU_PALACE_MEANINGS,
  JI_XING_DETAILS,
  MEN_PO_DETAILS,
  MEN_PO_JI_XIONG,
} from "@/data/siHaiEncyclopediaData";

// 严重程度颜色
const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-rose-500/20', text: 'text-rose-600', border: 'border-rose-500/30' },
  medium: { bg: 'bg-amber-500/20', text: 'text-amber-600', border: 'border-amber-500/30' },
  low: { bg: 'bg-yellow-500/20', text: 'text-yellow-600', border: 'border-yellow-500/30' },
};

const SEVERITY_LABELS: Record<string, string> = {
  high: '重',
  medium: '中',
  low: '轻',
};

// 四害图标和颜色
const SI_HAI_STYLES: Record<string, { icon: string; bg: string; text: string }> = {
  kong_wang: { icon: '空', bg: 'bg-slate-500/20', text: 'text-slate-600' },
  ru_mu: { icon: '墓', bg: 'bg-amber-600/20', text: 'text-amber-700' },
  ji_xing: { icon: '刑', bg: 'bg-purple-500/20', text: 'text-purple-600' },
  men_po: { icon: '迫', bg: 'bg-rose-500/20', text: 'text-rose-600' },
};

// 四害卡片组件
interface SiHaiCardProps {
  harm: SiHaiInfo;
}

const SiHaiCard: React.FC<SiHaiCardProps> = ({ harm }) => {
  const [isOpen, setIsOpen] = useState(false);
  const style = SI_HAI_STYLES[harm.id];
  const severityColors = SEVERITY_COLORS[harm.severity];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border/50">
        <CollapsibleTrigger asChild>
          <CardContent className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-14 h-14 rounded-lg flex flex-col items-center justify-center font-bold shrink-0",
                style.bg
              )}>
                <span className={cn("text-xl font-bold", style.text)}>{style.icon}</span>
                <span className="text-[10px] text-muted-foreground">{harm.alias}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{harm.name}</span>
                  <Badge variant="outline" className={cn("text-xs", severityColors.text, severityColors.border)}>
                    {SEVERITY_LABELS[harm.severity]}
                  </Badge>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform ml-auto shrink-0",
                    isOpen && "rotate-180"
                  )} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {harm.keywords.slice(0, 4).map((keyword, idx) => (
                    <span key={idx} className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3">
            {/* 定义 */}
            <div className={cn("rounded-lg p-3", style.bg)}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className={cn("h-4 w-4", style.text)} />
                <span className={cn("font-medium", style.text)}>定义</span>
              </div>
              <p className="text-sm text-muted-foreground">{harm.definition}</p>
              <p className="text-xs text-muted-foreground/80 mt-2 italic">{harm.principle}</p>
            </div>

            {/* 判定条件 */}
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-600">判定条件</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{harm.conditions.description}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {harm.conditions.examples.map((ex, idx) => (
                  <div key={idx} className="text-xs bg-background rounded p-1.5 text-center">
                    {ex}
                  </div>
                ))}
              </div>
            </div>

            {/* 宫位影响 */}
            <div className="bg-blue-500/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-600">宫位影响</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{harm.palaceRules.description}</p>
              <div className="space-y-1">
                {harm.palaceRules.details.slice(0, 4).map((detail, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground bg-background/60 rounded p-1.5">
                    {detail}
                  </div>
                ))}
              </div>
            </div>

            {/* 符号影响 */}
            <div className="bg-purple-500/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-600">符号影响</span>
              </div>
              <div className="space-y-1">
                {harm.symbolRules.details.slice(0, 5).map((detail, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground bg-background/60 rounded p-1.5">
                    {detail}
                  </div>
                ))}
              </div>
            </div>

            {/* 分类解读 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-primary/10 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Briefcase className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">事业</span>
                </div>
                <p className="text-xs text-muted-foreground">{harm.interpretation.career}</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Activity className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">财运</span>
                </div>
                <p className="text-xs text-muted-foreground">{harm.interpretation.wealth}</p>
              </div>
              <div className="bg-rose-500/10 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Heart className="h-3 w-3 text-rose-600" />
                  <span className="text-xs font-medium text-rose-600">健康</span>
                </div>
                <p className="text-xs text-muted-foreground">{harm.interpretation.health}</p>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Users className="h-3 w-3 text-amber-600" />
                  <span className="text-xs font-medium text-amber-600">感情</span>
                </div>
                <p className="text-xs text-muted-foreground">{harm.interpretation.relationships}</p>
              </div>
            </div>

            {/* 断人/断事/断物 */}
            {harm.id === 'kong_wang' && (
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <div className="bg-muted/50 rounded p-1.5">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><User className="h-3 w-3" />断人</div>
                  <span>{KONG_WANG_JUDGMENTS.person}</span>
                </div>
                <div className="bg-muted/50 rounded p-1.5">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Briefcase className="h-3 w-3" />断事</div>
                  <span>{KONG_WANG_JUDGMENTS.matter}</span>
                </div>
                <div className="bg-muted/50 rounded p-1.5">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Package className="h-3 w-3" />断物</div>
                  <span>{KONG_WANG_JUDGMENTS.object}</span>
                </div>
              </div>
            )}
            {harm.id === 'ru_mu' && (
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <div className="bg-muted/50 rounded p-1.5">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><User className="h-3 w-3" />断人</div>
                  <span>{RU_MU_JUDGMENTS.person}</span>
                </div>
                <div className="bg-muted/50 rounded p-1.5">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Briefcase className="h-3 w-3" />断事</div>
                  <span>{RU_MU_JUDGMENTS.matter}</span>
                </div>
                <div className="bg-muted/50 rounded p-1.5">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Package className="h-3 w-3" />断物</div>
                  <span>{RU_MU_JUDGMENTS.object}</span>
                </div>
              </div>
            )}
            {harm.id === 'ji_xing' && (
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <div className="bg-muted/50 rounded p-1.5">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><User className="h-3 w-3" />断人</div>
                  <span>{JI_XING_JUDGMENTS.person}</span>
                </div>
                <div className="bg-muted/50 rounded p-1.5">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Briefcase className="h-3 w-3" />断事</div>
                  <span>{JI_XING_JUDGMENTS.matter}</span>
                </div>
                <div className="bg-muted/50 rounded p-1.5">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Package className="h-3 w-3" />断物</div>
                  <span>{JI_XING_JUDGMENTS.object}</span>
                </div>
              </div>
            )}
            {harm.id === 'men_po' && (
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <div className="bg-muted/50 rounded p-1.5">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><User className="h-3 w-3" />断人</div>
                  <span>{MEN_PO_JUDGMENTS.person}</span>
                </div>
                <div className="bg-muted/50 rounded p-1.5">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Briefcase className="h-3 w-3" />断事</div>
                  <span>{MEN_PO_JUDGMENTS.matter}</span>
                </div>
                <div className="bg-muted/50 rounded p-1.5">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Package className="h-3 w-3" />断物</div>
                  <span>{MEN_PO_JUDGMENTS.object}</span>
                </div>
              </div>
            )}

            {/* 宫位象义 */}
            {harm.id === 'kong_wang' && KONG_WANG_PALACE_MEANINGS.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
                <div className="text-xs font-medium">📍 宫位象义</div>
                {KONG_WANG_PALACE_MEANINGS.map((m, idx) => (
                  <div key={idx} className="text-xs">
                    <Badge variant="outline" className="text-xs mr-1.5">{m.palace}</Badge>
                    <span>{m.meaning}</span>
                  </div>
                ))}
              </div>
            )}
            {harm.id === 'ru_mu' && RU_MU_PALACE_MEANINGS.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
                <div className="text-xs font-medium">📍 宫位象义</div>
                {RU_MU_PALACE_MEANINGS.map((m, idx) => (
                  <div key={idx} className="text-xs">
                    <Badge variant="outline" className="text-xs mr-1.5">{m.position}</Badge>
                    <span>{m.meaning}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 击刑详情 */}
            {harm.id === 'ji_xing' && JI_XING_DETAILS.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-purple-600">⚡ 击刑详情</div>
                {JI_XING_DETAILS.map((detail, idx) => (
                  <div key={idx} className="bg-muted/30 rounded-lg p-2 space-y-1">
                    <div className="text-xs font-medium">{detail.stem} → {detail.palaceName}宫（{detail.element}）</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div><span className="text-muted-foreground">健康：</span>{detail.health}</div>
                      <div><span className="text-muted-foreground">六合：</span>{detail.liuHe}</div>
                    </div>
                    <p className="text-xs text-muted-foreground">{detail.problems}</p>
                    {detail.specialNote && <p className="text-xs text-amber-600">⚠️ {detail.specialNote}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* 门迫详情 */}
            {harm.id === 'men_po' && MEN_PO_DETAILS.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-rose-600">🚪 门迫详情</div>
                {MEN_PO_DETAILS.map((detail, idx) => (
                  <div key={idx} className="bg-muted/30 rounded-lg p-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-xs">{detail.door}</Badge>
                      <span className="text-muted-foreground">属{detail.element}</span>
                      <span className="text-xs">六合：{detail.liuHe}</span>
                    </div>
                    <p className="text-xs"><span className="text-muted-foreground">主：</span>{detail.mainMeaning}，<strong>{detail.keyIssue}</strong></p>
                    <p className="text-xs text-muted-foreground">{detail.menPoEffect}</p>
                    <p className="text-xs text-emerald-600">→ {detail.remedy}</p>
                  </div>
                ))}
                <div className="bg-muted/50 rounded-lg p-2 space-y-1 text-xs">
                  <p>{MEN_PO_JI_XIONG.ji}</p>
                  <p>{MEN_PO_JI_XIONG.xiong}</p>
                  <p className="text-muted-foreground">{MEN_PO_JI_XIONG.remedy}</p>
                </div>
              </div>
            )}


            <div className="bg-emerald-500/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-emerald-600">化解建议</span>
              </div>
              <div className="space-y-1">
                {harm.remedies.map((remedy, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-emerald-600">•</span>
                    <span>{remedy}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

// 宫位速查组件
// const PalaceQuickRef: React.FC = () => {
//   const palaces = [1, 8, 3, 4, 9, 2, 7, 6] as const; // 按九宫排列顺序
//   const palaceNames: Record<number, string> = {
//     1: '坎一', 2: '坤二', 3: '震三', 4: '巽四',
//     6: '乾六', 7: '兑七', 8: '艮八', 9: '离九',
//   };

//   return (
//     <div className="bg-muted/30 rounded-lg p-3 mb-4">
//       <div className="flex items-center gap-2 mb-3">
//         <AlertTriangle className="h-4 w-4 text-amber-600" />
//         <span className="text-sm font-medium">宫位四害速查</span>
//       </div>
//       <div className="grid grid-cols-4 gap-2">
//         {palaces.map((palace) => {
//           const ref = SI_HAI_PALACE_QUICK_REF[palace];
//           if (!ref) return null;
//           const hasIssues = ref.kongWang.length > 0 || ref.ruMu.length > 0 || 
//                            ref.jiXing.length > 0 || ref.menPo.length > 0;
//           return (
//             <div key={palace} className={cn(
//               "bg-background rounded p-2 text-center",
//               hasIssues && "ring-1 ring-amber-500/30"
//             )}>
//               <div className="text-xs font-medium mb-1">{palaceNames[palace]}</div>
//               <div className="space-y-0.5">
//                 {ref.kongWang.length > 0 && (
//                   <div className="text-[10px] text-slate-600">空</div>
//                 )}
//                 {ref.ruMu.length > 0 && (
//                   <div className="text-[10px] text-amber-700">墓</div>
//                 )}
//                 {ref.jiXing.length > 0 && (
//                   <div className="text-[10px] text-rose-600">刑</div>
//                 )}
//                 {ref.menPo.length > 0 && (
//                   <div className="text-[10px] text-purple-600">迫</div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };
// 可折叠化解卡片组件
interface RemedyCollapsibleCardProps {
  harmId: string;
  title: string;
  children: React.ReactNode;
}

const RemedyCollapsibleCard: React.FC<RemedyCollapsibleCardProps> = ({ harmId, title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const style = SI_HAI_STYLES[harmId];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border/50">
        <CollapsibleTrigger asChild>
          <CardContent className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold",
                  style.bg, style.text
                )}>
                  {style.icon}
                </span>
                <span className={cn("text-sm font-medium", style.text)}>{title}</span>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )} />
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3">
            {children}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

// 化解方法组件
const RemedySection: React.FC = () => {
  return (
    <div className="space-y-3">
      {/* 化解决策表 */}
      <Card className="border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-emerald-600">化解决策表</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-1 font-medium">本宫</th>
                  <th className="text-left py-2 px-1 font-medium">对宫</th>
                  <th className="text-left py-2 px-1 font-medium">方法</th>
                </tr>
              </thead>
              <tbody>
                {REMEDY_DECISION_TABLE.map((row) => (
                  <tr key={row.id} className="border-b border-border/30">
                    <td className="py-2 px-1 text-amber-600">{row.selfPalace}</td>
                    <td className="py-2 px-1 text-muted-foreground">{row.oppositePalace}</td>
                    <td className="py-2 px-1 text-primary font-medium">{row.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 特殊注意事项 */}
          <div className="mt-3 p-2 bg-rose-500/10 rounded">
            <div className="text-xs font-medium text-rose-600 mb-1">⚠️ 特殊注意</div>
            {SPECIAL_REMEDY_NOTES.map((note, idx) => (
              <div key={idx} className="text-xs text-muted-foreground">• {note}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 空亡化解 - 可折叠 */}
      <RemedyCollapsibleCard harmId="kong_wang" title="空亡化解">
        <div className="space-y-2">
          {REMEDY_METHODS.filter(m => m.applicableTo.includes('空亡')).map((method) => (
            <div key={method.id} className="bg-muted/30 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] px-1.5">{method.category}</Badge>
                <span className="text-sm font-medium">{method.name}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-1">
                {method.items.slice(0, 3).map((item, idx) => (
                  <span key={idx} className="text-[10px] bg-background rounded px-1.5 py-0.5">{item}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{method.usage}</p>
            </div>
          ))}
        </div>
      </RemedyCollapsibleCard>

      {/* 入墓化解（按宫位）- 可折叠 */}
      <RemedyCollapsibleCard harmId="ru_mu" title="入墓化解（按宫位）">
        <div className="space-y-2">
          {RU_MU_PALACE_REMEDIES.map((palace) => (
            <div key={palace.palace} className="bg-muted/30 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px] px-1.5 bg-amber-500/10 text-amber-700 border-amber-500/30">
                  {palace.palaceName}
                </Badge>
                <span className="text-xs text-muted-foreground">{palace.tombType}</span>
              </div>
              <div className="space-y-1.5">
                {palace.remedyMethods.map((method, idx) => (
                  <div key={idx} className="bg-background/60 rounded p-1.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-medium text-primary">{method.method}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {method.items.join('、')}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/80">{method.usage}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </RemedyCollapsibleCard>

      {/* 击刑化解（按宫位）- 可折叠 */}
      <RemedyCollapsibleCard harmId="ji_xing" title="击刑化解（按宫位）">
        <div className="space-y-2">
          {JI_XING_PALACE_REMEDIES.map((palace) => (
            <div key={palace.palace} className="bg-muted/30 rounded-lg p-2">
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 bg-purple-500/10 text-purple-600 border-purple-500/30">
                    {palace.palaceName}
                  </Badge>
                  <span className="text-xs font-medium text-purple-600">{palace.xingType}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{palace.xingDescription}</span>
              </div>
              <div className="space-y-1.5">
                {palace.remedyMethods.map((method, idx) => (
                  <div key={idx} className="bg-background/60 rounded p-1.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-medium text-primary">{method.method}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {method.items.join('、')}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/80">{method.usage}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </RemedyCollapsibleCard>

      {/* 门迫化解（含水晶）- 可折叠 */}
      <RemedyCollapsibleCard harmId="men_po" title="门迫化解">
        <div className="space-y-3">
          {/* 通用方法 */}
          <div className="space-y-2">
            {REMEDY_METHODS.filter(m => m.applicableTo.includes('门迫')).map((method) => (
              <div key={method.id} className="bg-muted/30 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] px-1.5">{method.category}</Badge>
                  <span className="text-sm font-medium">{method.name}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {method.items.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="text-[10px] bg-background rounded px-1.5 py-0.5">{item}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{method.usage}</p>
              </div>
            ))}
          </div>

          {/* 水晶能量物品 */}
          <div className="bg-purple-500/10 rounded-lg p-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">💎</span>
              <span className="text-xs font-medium text-purple-600">水晶能量物品</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">
              用能"生"门五行的水晶来化解门迫
            </p>
            <div className="space-y-1.5">
              {CRYSTAL_REMEDIES.map((crystal, idx) => (
                <div key={idx} className="bg-background/60 rounded p-1.5">
                  <div className="flex items-center flex-wrap gap-1 mb-1">
                    <span className="text-xs font-medium">{crystal.door}</span>
                    <Badge variant="outline" className="text-[10px] px-1 h-4">{crystal.doorElement}</Badge>
                    <span className="text-[10px] text-muted-foreground">→</span>
                    <span className="text-xs text-primary font-medium">{crystal.crystal}</span>
                    {crystal.affectedPalaces.map((p) => (
                      <Badge 
                        key={p.palace} 
                        variant="outline" 
                        className="text-[10px] px-1 h-4 bg-rose-500/10 text-rose-600 border-rose-500/30"
                      >
                        {p.palaceName}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {crystal.generatingElement}生{crystal.doorElement}・{crystal.color}物品
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RemedyCollapsibleCard>

      {/* 生肖化解原则 */}
      <Card className="border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🐲</span>
            <span className="font-medium text-blue-600">{ZODIAC_REMEDY_PRINCIPLE.title}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{ZODIAC_REMEDY_PRINCIPLE.description}</p>
          <div className="space-y-1">
            {ZODIAC_REMEDY_PRINCIPLE.details.map((detail, idx) => (
              <div key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                <span className="text-blue-600">•</span>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SiHaiEncyclopedia: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-3 max-w-lg">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold flex-1">四害宝典</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-lg">
        <p className="text-sm text-muted-foreground text-center mb-4">
          奇门四害：空亡、入墓、击刑、门迫<br />
          {/* <span className="text-xs">源自《御定奇门宝鉴》</span> */}
        </p>

        {/* 四害概览 */}
        <div className="bg-rose-500/10 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span className="text-sm font-medium text-rose-600">四害概览</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {SI_HAI_DATA.map((harm) => {
              const style = SI_HAI_STYLES[harm.id];
              return (
                <div key={harm.id} className="bg-background rounded p-2">
                  <div className={cn("text-lg font-bold mb-0.5", style.text)}>{style.icon}</div>
                  <div className="text-xs font-medium">{harm.name}</div>
                  <div className="text-[10px] text-muted-foreground">{harm.alias}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs切换 */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="details" className="text-sm">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              四害详解
            </TabsTrigger>
            <TabsTrigger value="remedy" className="text-sm">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              化解方法
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-0">
            {/* 宫位速查 */}
            {/* <PalaceQuickRef /> */}

            {/* 四害详解列表 */}
            <div className="space-y-3">
              {SI_HAI_DATA.map((harm) => (
                <SiHaiCard key={harm.id} harm={harm} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="remedy" className="mt-0">
            <RemedySection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SiHaiEncyclopedia;
