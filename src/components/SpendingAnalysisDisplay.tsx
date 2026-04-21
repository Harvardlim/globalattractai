import React, { useMemo, useState } from 'react';
import { ChartData, PalaceData } from '@/types';
import { hasFourHarms, findMingGong } from '@/components/WealthAnalysisDisplay';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ShoppingBag, Info, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { getComponentT } from '@/data/destinyTranslations';

// 宫位原始门对应的消费数据
interface PalaceSpendingInfo {
  palaceId: number;
  palaceName: string;
  nativeDoor: string;
  category: string;
  details: string;
  explanation: string;
}

const PALACE_SPENDING_DATA: Record<number, PalaceSpendingInfo> = {
  1: { palaceId: 1, palaceName: '坎一宫', nativeDoor: '休门', category: '家庭、健康、休闲、修行', details: '家居用品、养生保健、度假休闲', explanation: '休门象征休息与家庭生活，花费可能用于家居用品、养生保健或度假休闲。' },
  2: { palaceId: 2, palaceName: '坤二宫', nativeDoor: '死门', category: '房地产、保险、长期储蓄', details: '房产、保险、长期理财项目', explanation: '死门关联稳定与终结，可能用于购置房产、购买保险或长期理财项目。' },
  3: { palaceId: 3, palaceName: '震三宫', nativeDoor: '伤门', category: '医疗、法律、运动', details: '医疗费用、法律纠纷开支、运动器材购买', explanation: '伤门代表竞争与损伤，可能涉及医疗费用、法律纠纷开支或运动器材购买。' },
  4: { palaceId: 4, palaceName: '巽四宫', nativeDoor: '杜门', category: '技术产品、隐私保护、维修', details: '电子产品、保密服务（如加密软件）、维修费用', explanation: '杜门主隐秘与技术，可能用于购买电子产品、保密服务（如加密软件）或维修费用。' },
  6: { palaceId: 6, palaceName: '乾六宫', nativeDoor: '开门', category: '事业拓展、职场发展、公开活动', details: '创业启动、职业培训、公开宣传', explanation: '开门象征新开始，支出可能用于创业启动、职业培训或公开宣传。' },
  7: { palaceId: 7, palaceName: '兑七宫', nativeDoor: '惊门', category: '饮食、娱乐、社交应酬、诉讼', details: '餐饮、聚会、法律诉讼相关费用', explanation: '惊门主口舌是非，开销多用于餐饮、聚会或应对法律诉讼。' },
  8: { palaceId: 8, palaceName: '艮八宫', nativeDoor: '生门', category: '投资、生意、资产购置', details: '创业、理财、购置不动产或生产资料', explanation: '生门主财富与生机，支出多与创业、理财、购置不动产或生产资料相关。' },
  9: { palaceId: 9, palaceName: '离九宫', nativeDoor: '景门', category: '旅行、娱乐、艺术装饰', details: '旅游、艺术收藏、演出门票、家居装饰', explanation: '景门象征文化与美景，花费倾向于旅游、艺术收藏、演出门票或家居装饰。' },
};

const JI_DOORS = ['生门', '开门', '休门', '景门'];

interface SpendingEntry {
  palace: PalaceData;
  source: string; // e.g. '命宫', '生门落宫'
  spending: PalaceSpendingInfo;
  hasHarms: boolean;
  isPrimary: boolean;
}

const analyzeSpendingMulti = (chart: ChartData): SpendingEntry[] => {
  const palaces = chart.palaces.filter(p => p.id !== 5);
  const mingGong = findMingGong(chart);
  const entries: SpendingEntry[] = [];
  const usedPalaceIds = new Set<number>();

  // 1. 命宫（无四害时显示）
  if (mingGong && !hasFourHarms(mingGong)) {
    const spending = PALACE_SPENDING_DATA[mingGong.id];
    if (spending) {
      entries.push({
        palace: mingGong,
        source: '命宫',
        spending,
        hasHarms: false,
        isPrimary: true,
      });
      usedPalaceIds.add(mingGong.id);
    }
  }

  // 1.5 甲落宫（值符所在宫）— 无四害时显示
  const jiaPalace = palaces.find(p => p.god === '值符');
  if (jiaPalace && !usedPalaceIds.has(jiaPalace.id) && !hasFourHarms(jiaPalace)) {
    const spending = PALACE_SPENDING_DATA[jiaPalace.id];
    if (spending) {
      entries.push({
        palace: jiaPalace,
        source: '甲落宫',
        spending,
        hasHarms: false,
        isPrimary: false,
      });
      usedPalaceIds.add(jiaPalace.id);
    }
  }

  // 2. 吉门落宫（生门、开门、休门、景门）— 只显示无四害的
  for (const doorName of JI_DOORS) {
    const palace = palaces.find(p => p.door === doorName);
    if (palace && !usedPalaceIds.has(palace.id) && !hasFourHarms(palace)) {
      const spending = PALACE_SPENDING_DATA[palace.id];
      if (spending) {
        entries.push({
          palace,
          source: `${doorName}落宫`,
          spending,
          hasHarms: false,
          isPrimary: false,
        });
        usedPalaceIds.add(palace.id);
      }
    }
  }

  return entries;
};

interface SpendingAnalysisDisplayProps {
  chart: ChartData;
}

const SpendingAnalysisDisplay: React.FC<SpendingAnalysisDisplayProps> = ({ chart }) => {
  const [open, setOpen] = useState(false);
  const { currentLanguage } = useLanguage();
  const ct = getComponentT(currentLanguage);
  const entries = useMemo(() => analyzeSpendingMulti(chart), [chart]);

  if (entries.length === 0) return null;

  const primaryEntry = entries.find(e => e.isPrimary);
  const headerLabel = primaryEntry
    ? `${primaryEntry.spending.nativeDoor}·${primaryEntry.spending.category.split('、')[0]}`
    : `${entries[0].spending.nativeDoor}·${entries[0].spending.category.split('、')[0]}`;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-card rounded-lg border border-border">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-teal-500" />
            <span className="font-medium text-sm">{ct.spendingArea}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 font-medium">
              {headerLabel}
            </span>
            {entries.length > 1 && (
              <Badge variant="secondary" className="text-xs">{entries.length}</Badge>
            )}
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
          <div className="space-y-3">
            {entries.map((entry, idx) => (
              <div key={entry.palace.id} className="space-y-2">
                {idx > 0 && <div className="border-t border-border" />}

                {/* 来源标签 */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {entry.isPrimary && <Star className="h-3 w-3 text-teal-500 fill-teal-500" />}
                  <span>{entry.source}（{entry.spending.palaceName}）</span>
                </div>

                {/* 消费类别 */}
                <div className={cn(
                  "rounded-lg p-3 border",
                  entry.isPrimary
                    ? "bg-teal-50 dark:bg-teal-950/20 border-teal-200/50 dark:border-teal-800/30"
                    : "bg-muted/30 border-border"
                )}>
                  <div className="flex items-start gap-2">
                    <ShoppingBag className={cn("h-4 w-4 mt-0.5 flex-shrink-0", entry.isPrimary ? "text-teal-500" : "text-muted-foreground")} />
                    <div>
                      <span className={cn("text-xs font-medium", entry.isPrimary ? "text-teal-700 dark:text-teal-400" : "text-muted-foreground")}>
                        {entry.source}消费方向（{entry.spending.nativeDoor}）
                      </span>
                      <p className="text-sm mt-1 font-medium">{entry.spending.category}</p>
                      <p className="text-xs mt-1 text-muted-foreground">{entry.spending.details}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default SpendingAnalysisDisplay;
