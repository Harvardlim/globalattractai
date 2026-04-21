import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, BookOpen, Brain, Handshake, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { LIU_YAO_DATA, LiuYaoInfo } from "@/data/qimenEncyclopediaData";

// 性质颜色映射
const NATURE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  auspicious: { bg: 'bg-green-500/20', text: 'text-green-600', border: 'border-green-500/30' },
  inauspicious: { bg: 'bg-rose-500/20', text: 'text-rose-600', border: 'border-rose-500/30' },
  neutral: { bg: 'bg-slate-500/20', text: 'text-slate-600', border: 'border-slate-500/30' },
};

const NATURE_LABELS: Record<string, string> = {
  auspicious: '吉',
  inauspicious: '凶',
  neutral: '中',
};

// 六爻颜色映射
const LIU_YAO_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-slate-500/20', text: 'text-slate-600' },
  2: { bg: 'bg-emerald-500/20', text: 'text-emerald-600' },
  3: { bg: 'bg-amber-500/20', text: 'text-amber-600' },
  4: { bg: 'bg-blue-500/20', text: 'text-blue-600' },
  5: { bg: 'bg-red-500/20', text: 'text-red-600' },
  6: { bg: 'bg-purple-500/20', text: 'text-purple-600' },
};

// 六爻卡片组件
interface LiuYaoCardProps {
  yao: LiuYaoInfo;
}

const LiuYaoCard: React.FC<LiuYaoCardProps> = ({ yao }) => {
  const [isOpen, setIsOpen] = useState(false);
  const yaoColors = LIU_YAO_COLORS[yao.id] || LIU_YAO_COLORS[1];
  const natureColors = NATURE_COLORS[yao.nature];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border/50">
        <CollapsibleTrigger asChild>
          <CardContent className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-14 h-14 rounded-lg flex flex-col items-center justify-center font-bold shrink-0",
                yaoColors.bg
              )}>
                <span className={cn("text-lg font-bold", yaoColors.text)}>{yao.name.charAt(0)}</span>
                <span className="text-xs text-muted-foreground">{yao.title}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{yao.name} · {yao.title}</span>
                  <Badge variant="outline" className={cn("text-xs", natureColors.text, natureColors.border)}>
                    {NATURE_LABELS[yao.nature]}
                  </Badge>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform ml-auto shrink-0",
                    isOpen && "rotate-180"
                  )} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {yao.keywords.slice(0, 4).map((keyword, idx) => (
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
            {/* 易经象意 */}
            <div className={cn("rounded-lg p-3", yaoColors.bg)}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className={cn("h-4 w-4", yaoColors.text)} />
                <span className={cn("font-medium", yaoColors.text)}>易经象意</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">爻位：</span>
                  <span className="text-muted-foreground">{yao.yijing.position}</span>
                </div>
                <div>
                  <span className="font-medium">象征：</span>
                  <span className="text-muted-foreground">{yao.yijing.symbolism}</span>
                </div>
                <div className="bg-background/60 rounded p-2 text-xs italic">
                  {yao.yijing.classic}
                </div>
              </div>
            </div>

            {/* 性格分析 */}
            <div className="bg-primary/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">性格分析</span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">{yao.personality.overview}</p>
                <div>
                  <span className="font-medium">决策风格：</span>
                  <span className="text-muted-foreground">{yao.personality.decisionMaking}</span>
                </div>
                <div>
                  <span className="font-medium">工作方式：</span>
                  <span className="text-muted-foreground">{yao.personality.workStyle}</span>
                </div>
                <div>
                  <span className="font-medium">人际关系：</span>
                  <span className="text-muted-foreground">{yao.personality.relationships}</span>
                </div>
              </div>
            </div>

            {/* 优势与劣势 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-500/10 rounded-lg p-3">
                <div className="text-xs font-medium text-green-600 mb-2">✓ 优势</div>
                <div className="space-y-1">
                  {yao.personality.strengths.map((s, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">• {s}</div>
                  ))}
                </div>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-3">
                <div className="text-xs font-medium text-amber-600 mb-2">! 注意</div>
                <div className="space-y-1">
                  {yao.personality.weaknesses.map((w, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">• {w}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* 治克关系 */}
            <div className="bg-purple-500/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-600">治克关系</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-background/60 rounded p-2 text-center">
                  <span className="text-muted-foreground">治</span>
                  <span className={cn("ml-1 font-medium", LIU_YAO_COLORS[yao.governance.governs]?.text)}>
                    {LIU_YAO_DATA.find(y => y.id === yao.governance.governs)?.name}（{LIU_YAO_DATA.find(y => y.id === yao.governance.governs)?.title}）
                  </span>
                </div>
                <div className="bg-background/60 rounded p-2 text-center">
                  <span className="text-muted-foreground">被</span>
                  <span className={cn("ml-1 font-medium", LIU_YAO_COLORS[yao.governance.governedBy]?.text)}>
                    {LIU_YAO_DATA.find(y => y.id === yao.governance.governedBy)?.name}（{LIU_YAO_DATA.find(y => y.id === yao.governance.governedBy)?.title}）
                  </span>
                  <span className="text-muted-foreground">治</span>
                </div>
              </div>
            </div>

            {/* 合作建议 */}
            <div className="bg-blue-500/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Handshake className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-600">合作建议</span>
              </div>
              <p className="text-sm text-muted-foreground">{yao.cooperation.advice}</p>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const LiuYaoEncyclopedia: React.FC = () => {
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
            <h1 className="text-lg font-bold flex-1">六爻宝典</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-lg">
        <p className="text-sm text-muted-foreground text-center mb-4">
          六爻代表人生层次与行事风格，源自《易经》爻位理论
        </p>
        
        {/* 爻位配对说明 */}
        <div className="bg-muted/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">爻位配对关系</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-background rounded p-2 text-center">
              <span className="text-slate-600">一爻</span>
              <span className="text-muted-foreground"> ↔ </span>
              <span className="text-blue-600">四爻</span>
            </div>
            <div className="bg-background rounded p-2 text-center">
              <span className="text-emerald-600">二爻</span>
              <span className="text-muted-foreground"> ↔ </span>
              <span className="text-red-600">五爻</span>
            </div>
            <div className="bg-background rounded p-2 text-center">
              <span className="text-amber-600">三爻</span>
              <span className="text-muted-foreground"> ↔ </span>
              <span className="text-purple-600">六爻</span>
            </div>
          </div>
        </div>

        {/* 爻位相治关系 */}
        <div className="bg-amber-500/10 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">爻位相治关系</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1 text-xs">
            <span className="text-purple-600 font-medium">六爻</span>
            <span className="text-muted-foreground">治</span>
            <span className="text-red-600 font-medium">五爻</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-red-600 font-medium">五爻</span>
            <span className="text-muted-foreground">治</span>
            <span className="text-blue-600 font-medium">四爻</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-blue-600 font-medium">四爻</span>
            <span className="text-muted-foreground">治</span>
            <span className="text-amber-600 font-medium">三爻</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-amber-600 font-medium">三爻</span>
            <span className="text-muted-foreground">治</span>
            <span className="text-emerald-600 font-medium">二爻</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-emerald-600 font-medium">二爻</span>
            <span className="text-muted-foreground">治</span>
            <span className="text-slate-600 font-medium">一爻</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-slate-600 font-medium">一爻</span>
            <span className="text-muted-foreground">治</span>
            <span className="text-purple-600 font-medium">六爻</span>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">高位治低位，形成循环制约</p>
        </div>

        {/* 四柱含义说明 */}
        <div className="bg-primary/5 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">四柱六爻含义</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs text-center">
            <div className="bg-background rounded p-2">
              <div className="font-medium">年柱</div>
              <div className="text-muted-foreground">大目标</div>
            </div>
            <div className="bg-background rounded p-2">
              <div className="font-medium">月柱</div>
              <div className="text-muted-foreground">做事方式</div>
            </div>
            <div className="bg-background rounded p-2">
              <div className="font-medium">日柱</div>
              <div className="text-muted-foreground">自己状态</div>
            </div>
            <div className="bg-background rounded p-2">
              <div className="font-medium">时柱</div>
              <div className="text-muted-foreground">最后结果</div>
            </div>
          </div>
        </div>

        {/* 六爻磁场示例 */}
        <div className="bg-muted/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">六爻磁场分析</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            将四柱的爻位数字组合，可用数字能量磁场解读整体格局。
          </p>
          <div className="bg-background rounded-lg p-3 border border-border space-y-2">
            <div className="flex items-center justify-center gap-1 text-sm">
              <span className="text-amber-600 font-bold">三爻</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-emerald-600 font-bold">二爻</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-purple-600 font-bold">六爻</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-purple-600 font-bold">六爻</span>
              <span className="text-muted-foreground mx-2">→</span>
              <span className="font-bold text-primary">3266</span>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              取每柱爻位编号拼接，即可查看对应的数字磁场组合（吉凶星）
            </div>
          </div>
        </div>

        {/* 天干地支六爻对照表 */}
        <div className="overflow-x-auto rounded-lg border border-amber-300 dark:border-amber-700 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-200 dark:bg-amber-800/50">
                <th className="px-3 py-2.5 text-center font-medium border-r border-amber-300 dark:border-amber-700">一爻</th>
                <th className="px-3 py-2.5 text-center font-medium border-r border-amber-300 dark:border-amber-700">二爻</th>
                <th className="px-3 py-2.5 text-center font-medium border-r border-amber-300 dark:border-amber-700">三爻</th>
                <th className="px-3 py-2.5 text-center font-medium border-r border-amber-300 dark:border-amber-700">四爻</th>
                <th className="px-3 py-2.5 text-center font-medium border-r border-amber-300 dark:border-amber-700">五爻</th>
                <th className="px-3 py-2.5 text-center font-medium">六爻</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['甲\n子','甲\n寅','甲\n辰','甲\n午','甲\n申','甲\n戌'],
                ['乙\n未','乙\n巳','乙\n卯','乙\n丑','乙\n亥','乙\n酉'],
                ['丙\n辰','丙\n午','丙\n申','丙\n戌','丙\n子','丙\n寅'],
                ['丁\n巳','丁\n卯','丁\n丑','丁\n亥','丁\n酉','丁\n未'],
                ['戊\n寅','戊\n辰','戊\n午','戊\n申','戊\n戌','戊\n子'],
                ['己\n卯','己\n丑','己\n亥','己\n酉','己\n未','己\n巳'],
                ['庚\n子','庚\n寅','庚\n辰','庚\n午','庚\n申','庚\n戌'],
                ['辛\n丑','辛\n亥','辛\n酉','辛\n未','辛\n巳','辛\n卯'],
                ['壬\n子','壬\n寅','壬\n辰','壬\n午','壬\n申','壬\n戌'],
                ['癸\n未','癸\n巳','癸\n卯','癸\n丑','癸\n亥','癸\n酉'],
              ].map((row, idx) => (
                <tr key={idx} className={cn(
                  "border-t border-amber-300 dark:border-amber-700",
                  idx % 2 === 0 ? "bg-amber-50 dark:bg-amber-950/20" : "bg-amber-100/70 dark:bg-amber-900/20"
                )}>
                  {row.map((cell, ci) => {
                    const [gan, zhi] = cell.split('\n');
                    return (
                      <td key={ci} className={cn(
                        "px-3 py-2.5 text-center border-amber-300 dark:border-amber-700",
                        ci < 5 && "border-r"
                      )}>
                        <div className="font-medium">{gan}</div>
                        <div className="text-muted-foreground">{zhi}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 六爻速查表 */}
        <div className="overflow-x-auto rounded-lg border border-border mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-100 dark:bg-amber-900/30">
                <th className="px-2 py-2.5 text-center font-medium border-r border-amber-200 dark:border-amber-800">爻位</th>
                <th className="px-2 py-2.5 text-center font-medium border-r border-amber-200 dark:border-amber-800">角色</th>
                <th className="px-2 py-2.5 text-center font-medium border-r border-amber-200 dark:border-amber-800">性质</th>
                <th className="px-2 py-2.5 text-center font-medium border-r border-amber-200 dark:border-amber-800">特征</th>
                <th className="px-2 py-2.5 text-center font-medium border-r border-amber-200 dark:border-amber-800">配对</th>
                <th className="px-2 py-2.5 text-center font-medium">治克</th>
              </tr>
            </thead>
            <tbody>
              {LIU_YAO_DATA.map((yao, idx) => {
                const natureColors = NATURE_COLORS[yao.nature];
                const yaoColors = LIU_YAO_COLORS[yao.id] || LIU_YAO_COLORS[1];
                const partner = LIU_YAO_DATA.find(y => y.id === yao.cooperation.partner);
                const governs = LIU_YAO_DATA.find(y => y.id === yao.governance.governs);
                return (
                  <tr
                    key={yao.id}
                    className={cn(
                      "border-t border-amber-200 dark:border-amber-800",
                      idx % 2 === 0
                        ? "bg-amber-50/50 dark:bg-amber-950/20"
                        : "bg-amber-100/50 dark:bg-amber-900/20"
                    )}
                  >
                    <td className={cn("px-2 py-2 text-center font-medium border-r border-amber-200 dark:border-amber-800", yaoColors.text)}>
                      {yao.name}
                    </td>
                    <td className="px-2 py-2 text-center border-r border-amber-200 dark:border-amber-800">
                      {yao.title}
                    </td>
                    <td className="px-2 py-2 text-center border-r border-amber-200 dark:border-amber-800">
                      <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", natureColors.bg, natureColors.text)}>
                        {NATURE_LABELS[yao.nature]}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center border-r border-amber-200 dark:border-amber-800 text-xs text-muted-foreground">
                      {yao.traits}
                    </td>
                    <td className="px-2 py-2 text-center border-r border-amber-200 dark:border-amber-800">
                      <span className={cn("text-xs", LIU_YAO_COLORS[yao.cooperation.partner]?.text)}>
                        {partner?.name}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-xs">
                      治<span className={cn("font-medium", LIU_YAO_COLORS[yao.governance.governs]?.text)}>{governs?.name}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 六爻列表 */}
        <div className="space-y-3">
          {LIU_YAO_DATA.map((yao) => (
            <LiuYaoCard key={yao.id} yao={yao} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiuYaoEncyclopedia;
