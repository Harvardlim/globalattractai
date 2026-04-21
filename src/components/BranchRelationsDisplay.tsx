import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from "@/hooks/useLanguage";
import { getComponentT } from "@/data/destinyTranslations";
// 天干五合
const TIAN_GAN_WU_HE: Record<string, string> = {
  '甲己': '甲己合（土）', '乙庚': '乙庚合（金）', '丙辛': '丙辛合（水）',
  '丁壬': '丁壬合（木）', '戊癸': '戊癸合（火）',
};

// 六合
const LIU_HE: Record<string, string> = {
  '子丑': '子丑合（土）', '寅亥': '寅亥合（木）', '卯戌': '卯戌合（火）',
  '辰酉': '辰酉合（金）', '巳申': '巳申合（水）', '午未': '午未合（火）',
};

// 六冲
const LIU_CHONG: Record<string, string> = {
  '子午': '子午冲', '丑未': '丑未冲', '寅申': '寅申冲',
  '卯酉': '卯酉冲', '辰戌': '辰戌冲', '巳亥': '巳亥冲',
};

// 六害
const LIU_HAI: Record<string, string> = {
  '子未': '子未害', '丑午': '丑午害', '寅巳': '寅巳害',
  '卯辰': '卯辰害', '申亥': '申亥害', '酉戌': '酉戌害',
};

// 刑
const XING_PAIRS: Record<string, string> = {
  '子卯': '子卯刑（无礼之刑）', '丑戌': '丑戌刑（恃势之刑）', '丑未': '丑未刑（恃势之刑）',
  '戌未': '戌未刑（恃势之刑）', '寅巳': '寅巳刑（无恩之刑）', '寅申': '寅申刑（无恩之刑）',
  '巳申': '巳申刑（无恩之刑）',
};

// 自刑
const SELF_XING = ['辰', '午', '酉', '亥'];

// 破
const PO_PAIRS: Record<string, string> = {
  '子酉': '子酉破', '丑辰': '丑辰破', '寅亥': '寅亥破',
  '卯午': '卯午破', '巳申': '巳申破', '未戌': '未戌破',
};

// 绝
const JUE_PAIRS: Record<string, string> = {
  '子巳': '子巳绝', '寅酉': '寅酉绝', '卯申': '卯申绝', '午亥': '午亥绝',
};

// 三合
const SAN_HE_GROUPS = [
  { branches: ['申', '子', '辰'], name: '申子辰三合水局' },
  { branches: ['寅', '午', '戌'], name: '寅午戌三合火局' },
  { branches: ['巳', '酉', '丑'], name: '巳酉丑三合金局' },
  { branches: ['亥', '卯', '未'], name: '亥卯未三合木局' },
];

// 三会
const SAN_HUI_GROUPS = [
  { branches: ['亥', '子', '丑'], name: '亥子丑三会水局' },
  { branches: ['寅', '卯', '辰'], name: '寅卯辰三会木局' },
  { branches: ['巳', '午', '未'], name: '巳午未三会火局' },
  { branches: ['申', '酉', '戌'], name: '申酉戌三会金局' },
];

interface BranchRel {
  type: string;
  name: string;
  pillars: string;
  color: string;
  nature: 'auspicious' | 'inauspicious' | 'neutral';
}

function detectPairRelations(zhi1: string, zhi2: string, pillarLabel: string): BranchRel[] {
  const rels: BranchRel[] = [];
  const pair = zhi1 + zhi2;
  const pairRev = zhi2 + zhi1;

  const he = LIU_HE[pair] || LIU_HE[pairRev];
  if (he) rels.push({ type: '六合', name: he, pillars: pillarLabel, color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', nature: 'auspicious' });

  const chong = LIU_CHONG[pair] || LIU_CHONG[pairRev];
  if (chong) rels.push({ type: '六冲', name: chong, pillars: pillarLabel, color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', nature: 'inauspicious' });

  const hai = LIU_HAI[pair] || LIU_HAI[pairRev];
  if (hai) rels.push({ type: '六害', name: hai, pillars: pillarLabel, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', nature: 'inauspicious' });

  const xing = XING_PAIRS[pair] || XING_PAIRS[pairRev];
  if (xing) rels.push({ type: '刑', name: xing, pillars: pillarLabel, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', nature: 'inauspicious' });

  const po = PO_PAIRS[pair] || PO_PAIRS[pairRev];
  if (po) rels.push({ type: '破', name: po, pillars: pillarLabel, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', nature: 'inauspicious' });

  const jue = JUE_PAIRS[pair] || JUE_PAIRS[pairRev];
  if (jue) rels.push({ type: '绝', name: jue, pillars: pillarLabel, color: 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-300', nature: 'inauspicious' });

  return rels;
}

function detectStemCombinations(
  stems: { label: string; gan: string }[]
): BranchRel[] {
  const rels: BranchRel[] = [];
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const pair = stems[i].gan + stems[j].gan;
      const pairRev = stems[j].gan + stems[i].gan;
      const he = TIAN_GAN_WU_HE[pair] || TIAN_GAN_WU_HE[pairRev];
      if (he) {
        rels.push({
          type: '天干五合',
          name: he,
          pillars: `${stems[i].label}${stems[j].label}`,
          color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
          nature: 'auspicious',
        });
      }
    }
  }
  return rels;
}

interface Pillars {
  year: { gan?: string; zhi: string };
  month: { gan?: string; zhi: string };
  day: { gan?: string; zhi: string };
  hour?: { gan?: string; zhi: string };
}

interface BranchRelationsDisplayProps {
  pillars: Pillars;
  includeHour?: boolean;
}

const RELATION_TIPS: Record<string, string> = {
  '天干五合': '天干相合，主合化亲和，彼此有天然吸引力',
  '六合': '相合主和谐亲密，彼此有天然亲近感',
  '六冲': '相冲主冲突变动，需注意该两柱代表的人事关系',
  '六害': '相害主暗害阻碍，关系中容易有暗中消耗',
  '刑': '相刑主刑伤是非，容易因固执引发冲突',
  '破': '相破主破坏损耗，关系容易出现裂痕',
  '绝': '相绝主力量最弱，缺乏天然联结',
  '三合局': '三支合局，力量加强，目标一致',
  '三会局': '三支会局，势力聚集，方向统一',
  '自刑': '自刑主自我矛盾、内心纠结',
};

export default function BranchRelationsDisplay({ pillars, includeHour = false }: BranchRelationsDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage } = useLanguage();
  const ct = getComponentT(currentLanguage);
  const branches = includeHour && pillars.hour
    ? [
        { label: '年', zhi: pillars.year.zhi },
        { label: '月', zhi: pillars.month.zhi },
        { label: '日', zhi: pillars.day.zhi },
        { label: '时', zhi: pillars.hour.zhi },
      ]
    : [
        { label: '年', zhi: pillars.year.zhi },
        { label: '月', zhi: pillars.month.zhi },
        { label: '日', zhi: pillars.day.zhi },
      ];

  // Build stems array for 天干五合 detection
  const stems: { label: string; gan: string }[] = [];
  if (pillars.year.gan) stems.push({ label: '年', gan: pillars.year.gan });
  if (pillars.month.gan) stems.push({ label: '月', gan: pillars.month.gan });
  if (pillars.day.gan) stems.push({ label: '日', gan: pillars.day.gan });
  if (includeHour && pillars.hour?.gan) stems.push({ label: '时', gan: pillars.hour.gan });

  // Detect stem combinations (天干五合)
  const stemRels = detectStemCombinations(stems);

  // Detect pairwise relations
  const allRels: BranchRel[] = [];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const label = `${branches[i].label}${branches[j].label}`;
      allRels.push(...detectPairRelations(branches[i].zhi, branches[j].zhi, label));
    }
  }

  // Detect self-punishment
  const selfXingRels: BranchRel[] = [];
  for (const b of branches) {
    if (SELF_XING.includes(b.zhi)) {
      const count = branches.filter(x => x.zhi === b.zhi).length;
      if (count >= 2) {
        const existing = selfXingRels.find(r => r.name.includes(b.zhi));
        if (!existing) {
          selfXingRels.push({
            type: '自刑', name: `${b.zhi}${b.zhi}自刑`,
            pillars: branches.filter(x => x.zhi === b.zhi).map(x => x.label).join(''),
            color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
            nature: 'inauspicious',
          });
        }
      }
    }
  }
  allRels.push(...selfXingRels);

  // Detect three-combination (三合局)
  const zhiSet = branches.map(b => b.zhi);
  const threeWayRels: BranchRel[] = [];
  for (const group of SAN_HE_GROUPS) {
    if (group.branches.every(b => zhiSet.includes(b))) {
      threeWayRels.push({
        type: '三合局', name: group.name, pillars: '全',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        nature: 'auspicious',
      });
    }
  }
  for (const group of SAN_HUI_GROUPS) {
    if (group.branches.every(b => zhiSet.includes(b))) {
      threeWayRels.push({
        type: '三会局', name: group.name, pillars: '全',
        color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
        nature: 'auspicious',
      });
    }
  }

  // Half-combinations
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const label = `${branches[i].label}${branches[j].label}`;
      for (const group of SAN_HE_GROUPS) {
        if (group.branches.includes(branches[i].zhi) && group.branches.includes(branches[j].zhi)) {
          if (!threeWayRels.find(r => r.name === group.name)) {
            allRels.push({
              type: '三合半合', name: `${branches[i].zhi}${branches[j].zhi}（${group.name}之二）`,
              pillars: label,
              color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
              nature: 'auspicious',
            });
          }
        }
      }
      for (const group of SAN_HUI_GROUPS) {
        if (group.branches.includes(branches[i].zhi) && group.branches.includes(branches[j].zhi)) {
          if (!threeWayRels.find(r => r.name === group.name)) {
            allRels.push({
              type: '三会半会', name: `${branches[i].zhi}${branches[j].zhi}（${group.name}之二）`,
              pillars: label,
              color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
              nature: 'auspicious',
            });
          }
        }
      }
    }
  }

  const combined = [...stemRels, ...threeWayRels, ...allRels];

  const CATEGORIES = [
    { key: '天干五合', label: '干合', nature: 'auspicious' as const, color: 'text-emerald-600 dark:text-emerald-400' },
    { key: '六合', label: '六合', nature: 'auspicious' as const, color: 'text-green-600 dark:text-green-400' },
    { key: '三合', label: '三合', nature: 'auspicious' as const, color: 'text-blue-600 dark:text-blue-400' },
    { key: '三会', label: '三会', nature: 'auspicious' as const, color: 'text-cyan-600 dark:text-cyan-400' },
    { key: '冲', label: '冲', nature: 'inauspicious' as const, color: 'text-red-600 dark:text-red-400' },
    { key: '刑', label: '刑', nature: 'inauspicious' as const, color: 'text-purple-600 dark:text-purple-400' },
    { key: '破', label: '破', nature: 'inauspicious' as const, color: 'text-amber-600 dark:text-amber-400' },
    { key: '害', label: '害', nature: 'inauspicious' as const, color: 'text-orange-600 dark:text-orange-400' },
    { key: '绝', label: '绝', nature: 'inauspicious' as const, color: 'text-gray-500 dark:text-gray-400' },
  ];

  const getMatchesForCategory = (key: string) => {
    if (key === '天干五合') return combined.filter(r => r.type === '天干五合');
    if (key === '三合') return combined.filter(r => r.type === '三合局' || r.type === '三合半合');
    if (key === '三会') return combined.filter(r => r.type === '三会局' || r.type === '三会半会');
    if (key === '冲') return combined.filter(r => r.type === '六冲');
    if (key === '害') return combined.filter(r => r.type === '六害');
    if (key === '刑') return combined.filter(r => r.type === '刑' || r.type === '自刑');
    return combined.filter(r => r.type === key);
  };

  // Count total relations found
  const totalRelations = combined.length;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <h3 className="text-sm font-medium flex items-center gap-2">
              {isOpen ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-primary" />}
              {ct.branchRelations}
              {totalRelations > 0 && (
                <Badge variant="secondary" className="text-xs ml-1">{totalRelations}</Badge>
              )}
            </h3>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="px-4 pb-4 pt-0 space-y-3">
            <div className="space-y-2">
              {CATEGORIES.map(cat => {
                const matches = getMatchesForCategory(cat.key);
                return (
                  <div key={cat.key} className="flex items-start gap-2">
                    <span className={cn("text-xs font-semibold w-8 shrink-0 pt-0.5", cat.color)}>
                      {cat.label}
                    </span>
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {matches.length > 0 ? matches.map((r, i) => (
                        <Badge key={i} variant="outline" className={cn("text-xs", r.color)}>
                          <span className="text-muted-foreground mr-1">[{r.pillars}]</span>
                          {r.name}
                        </Badge>
                      )) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {combined.length > 0 && (
              <div className="text-xs text-muted-foreground space-y-0.5 pt-1 border-t border-border">
                {combined.map((r, i) => {
                  const tip = RELATION_TIPS[r.type];
                  return tip ? (
                    <div key={i}>
                      <span className="font-medium">{r.name}</span>
                      <span className="mx-1">—</span>
                      {tip}
                    </div>
                  ) : null;
                }).filter(Boolean)}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
