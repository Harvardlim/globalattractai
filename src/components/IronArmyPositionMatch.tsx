import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Briefcase, CheckCircle2, XCircle, Trophy, Megaphone, Swords, Brain, HeartHandshake, ChevronDown } from 'lucide-react';
import { ChartData, PalaceData } from '@/types';

interface IronArmyPositionMatchProps {
  chart: ChartData;
}

const PALACE_NAMES: Record<number, string> = {
  1: '坎宫', 2: '坤宫', 3: '震宫', 4: '巽宫', 5: '中宫', 6: '乾宫', 7: '兑宫', 8: '艮宫', 9: '离宫',
};

type TargetType = 'stem' | 'door' | 'god' | 'star';

interface PositionRequirement {
  type: TargetType;
  match: string;
  label: string;
}

interface PositionDef {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  requirements: PositionRequirement[]; // ALL must be present and clean
  algorithm: string;
  amplify: string;
  avoid: string;
}

const POSITIONS: PositionDef[] = [
  {
    key: 'liuliu',
    title: '引流王',
    subtitle: '广告引流 / 内容创作岗',
    icon: Megaphone,
    requirements: [
      { type: 'god', match: '九天', label: '九天' },
      { type: 'door', match: '景门', label: '景门' },
      { type: 'stem', match: '丁', label: '丁奇' },
    ],
    algorithm: '如果这组符号所在的宫位干干净净，说明此人的创意能落地，发出的广告必红，且不会有版权或违规纠纷。',
    amplify: '给他最大的创作自由度和投放预算。',
    avoid: '如果此人其他宫位有"入墓"，不要让他处理琐碎的文书，只让他负责出 Point、出创意。',
  },
  {
    key: 'qiandan',
    title: '签单王',
    subtitle: '攻坚谈单 / 现场收网岗',
    icon: Swords,
    requirements: [
      { type: 'god', match: '白虎', label: '白虎' },
      { type: 'door', match: '伤门', label: '伤门' },
      { type: 'stem', match: '庚', label: '庚金' },
    ],
    algorithm: '这种组合最怕"击刑"（容易用力过猛导致丢单或犯法）。如果无四害，说明此人杀气内敛，威而不怒，客户见到他会有"不得不签"的顺从感。',
    amplify: '专门处理"大 Ticket"或者"临门一脚"的僵持单。',
    avoid: '这种人通常不喜欢做琐碎的回访，把售后交给别人，让他专心杀敌。',
  },
  {
    key: 'zhuanjia',
    title: '专家王',
    subtitle: '方案策划 / 资产配置岗',
    icon: Brain,
    requirements: [
      { type: 'god', match: '值符', label: '值符' },
      { type: 'star', match: '天心', label: '天心星' },
      { type: 'door', match: '开门', label: '开门' },
    ],
    algorithm: '无四害代表思路清晰，公信力满分。他做出的财务报表和 ROI 分析，客户挑不出毛病。',
    amplify: '让他负责高净值客户（VVIP）的接待，或者作为团队的"讲师"赋能。',
    avoid: '这种人可能动作不够快（天冲），所以不要让他去跑街拓客，让他坐镇售楼部接高端单。',
  },
  {
    key: 'renmai',
    title: '人脉王',
    subtitle: '客户关系 / 转介绍岗',
    icon: HeartHandshake,
    requirements: [
      { type: 'god', match: '六合', label: '六合' },
      { type: 'door', match: '生门', label: '生门' },
      { type: 'stem', match: '乙', label: '乙奇' },
    ],
    algorithm: '这种组合最怕"门迫"（好事多磨、人际关系紧张）。如果无四害，说明此人天生自带招财体质，客户买了房还会感激他。',
    amplify: '让他负责 Old Client Referral 计划，专门打入各种商会和社交圈。',
    avoid: '这种人可能不够"硬"，不要让他去处理追债或强硬谈判。',
  },
];

interface SiHaiCheck {
  kongWang: boolean;
  ruMu: boolean;
  jiXing: boolean;
  menPo: boolean;
}

function checkPalaceSiHai(palace: PalaceData): SiHaiCheck {
  return {
    kongWang: !!palace.empty,
    ruMu: !!(
      palace.skyStatus?.isMu ||
      palace.sky2Status?.isMu ||
      palace.earthStatus?.isMu ||
      palace.earth2Status?.isMu
    ),
    jiXing: !!(
      palace.skyStatus?.isXing ||
      palace.sky2Status?.isXing ||
      palace.earthStatus?.isXing ||
      palace.earth2Status?.isXing
    ),
    menPo: !!palace.isMenPo,
  };
}

function findPalace(palaces: PalaceData[], req: PositionRequirement): PalaceData | null {
  for (const p of palaces) {
    if (req.type === 'stem') {
      // 乙奇/丁奇等天干只看天盘（skyStem / skyStem2），不看地盘
      if (p.skyStem === req.match || p.skyStem2 === req.match) return p;
    } else if (req.type === 'door') {
      if (p.door === req.match) return p;
    } else if (req.type === 'god') {
      if (p.god === req.match) return p;
    } else if (req.type === 'star') {
      if (p.star === req.match) return p;
    }
  }
  return null;
}

interface ReqResult {
  label: string;
  found: boolean;
  palaceName: string;
  clean: boolean;
  siHaiList: string[];
}

interface PositionResult {
  def: PositionDef;
  reqs: ReqResult[];
  matchCount: number; // # of clean requirements
  totalReqs: number;
  fullyMatched: boolean; // all clean
}

const IronArmyPositionMatch: React.FC<IronArmyPositionMatchProps> = ({ chart }) => {
  const results = useMemo<PositionResult[]>(() => {
    return POSITIONS.map(def => {
      const reqs: ReqResult[] = def.requirements.map(req => {
        const palace = findPalace(chart.palaces, req);
        if (!palace) {
          return { label: req.label, found: false, palaceName: '-', clean: false, siHaiList: [] };
        }
        const siHai = checkPalaceSiHai(palace);
        const list: string[] = [];
        if (siHai.kongWang) list.push('空亡');
        if (siHai.ruMu) list.push('入墓');
        if (siHai.jiXing) list.push('击刑');
        if (siHai.menPo) list.push('门迫');
        return {
          label: req.label,
          found: true,
          palaceName: PALACE_NAMES[palace.id] || `${palace.id}宫`,
          clean: list.length === 0,
          siHaiList: list,
        };
      });
      const matchCount = reqs.filter(r => r.found && r.clean).length;
      return {
        def,
        reqs,
        matchCount,
        totalReqs: reqs.length,
        fullyMatched: matchCount === reqs.length,
      };
    });
  }, [chart.palaces]);

  // 最适合的岗位：完全匹配优先；否则取无害项最多者；同分按 POSITIONS 顺序
  const bestPosition = useMemo(() => {
    const sorted = [...results].sort((a, b) => b.matchCount - a.matchCount);
    return sorted[0];
  }, [results]);

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          铁军岗位匹配
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* 最佳岗位推荐 */}
        {bestPosition && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">最适合岗位</span>
            </div>
            <div className="flex items-center gap-2">
              <bestPosition.def.icon className="h-4 w-4 text-foreground" />
              <span className="text-sm font-bold">{bestPosition.def.title}</span>
              <span className="text-xs text-muted-foreground">{bestPosition.def.subtitle}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {bestPosition.fullyMatched
                ? `三大要素全部无四害，天生适合此岗位`
                : `三要素中 ${bestPosition.matchCount}/${bestPosition.totalReqs} 项无四害，相对最优`}
            </div>
          </div>
        )}

        {/* 各岗位明细 */}
        <div className="space-y-2">
          {results.map(r => (
            <PositionCard key={r.def.key} result={r} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const PositionCard: React.FC<{ result: PositionResult }> = ({ result: r }) => {
  const [open, setOpen] = useState(false);
  const Icon = r.def.icon;
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        r.fullyMatched
          ? 'bg-green-500/5 border-green-300 dark:border-green-800'
          : 'bg-muted/30 border-border'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{r.def.title}</span>
          <span className="text-[11px] text-muted-foreground">{r.def.subtitle}</span>
        </div>
        <Badge
          variant={r.fullyMatched ? 'default' : 'outline'}
          className="text-[10px] px-1.5 py-0"
        >
          {r.matchCount}/{r.totalReqs}
        </Badge>
      </div>
      <div className="space-y-1">
        {r.reqs.map(req => (
          <div key={req.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {req.found && req.clean ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-destructive" />
              )}
              <span className="font-medium">{req.label}</span>
              <span className="text-muted-foreground">{req.palaceName}</span>
            </div>
            <div className="flex items-center gap-1">
              {!req.found ? (
                <span className="text-[10px] text-muted-foreground">未找到</span>
              ) : req.clean ? (
                <span className="text-[10px] text-green-700 dark:text-green-400">无害</span>
              ) : (
                req.siHaiList.map(s => (
                  <Badge key={s} variant="destructive" className="text-[10px] px-1 py-0">
                    {s}
                  </Badge>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 岗位详细说明（默认收起） */}
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="mt-2 w-full flex items-center justify-between text-[11px] text-muted-foreground hover:text-foreground transition-colors py-1 border-t border-border/50 pt-1.5">
          <span>岗位详细说明</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1.5 pt-1.5 text-[11px] leading-relaxed">
          <div>
            <span className="font-semibold text-foreground">算法逻辑：</span>
            <span className="text-muted-foreground">{r.def.algorithm}</span>
          </div>
          <div>
            <span className="font-semibold text-foreground">放大优势：</span>
            <span className="text-muted-foreground">{r.def.amplify}</span>
          </div>
          <div>
            <span className="font-semibold text-foreground">避开短板：</span>
            <span className="text-muted-foreground">{r.def.avoid}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default IronArmyPositionMatch;
