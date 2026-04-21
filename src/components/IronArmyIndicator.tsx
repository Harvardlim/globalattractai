import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ChartData, PalaceData } from '@/types';
import { DOORS, DOOR_ELEMENTS, PALACE_ELEMENTS, Element } from '@/lib/constants';

interface IronArmyIndicatorProps {
  chart: ChartData;
}

const PALACE_NAMES: Record<number, string> = {
  1: '坎宫', 2: '坤宫', 3: '震宫', 4: '巽宫', 5: '中宫', 6: '乾宫', 7: '兑宫', 8: '艮宫', 9: '离宫',
};

// The 5 key elements to check
const IRON_ARMY_TARGETS = [
  { key: 'wu_tu', label: '戊土', type: 'stem' as const, match: '戊' },
  { key: 'sheng_men', label: '生门', type: 'door' as const, match: '生门' },
  { key: 'jiu_di', label: '九地', type: 'god' as const, match: '九地' },
  { key: 'shang_men', label: '伤门', type: 'door' as const, match: '伤门' },
  { key: 'xuan_wu', label: '玄武', type: 'god' as const, match: '玄武' },
];

interface SiHaiCheck {
  kongWang: boolean;
  ruMu: boolean;
  jiXing: boolean;
  menPo: boolean;
}

function checkPalaceSiHai(palace: PalaceData): SiHaiCheck {
  const kongWang = palace.empty;

  // 入墓: check sky/earth stem statuses
  const ruMu = !!(
    palace.skyStatus?.isMu ||
    palace.sky2Status?.isMu ||
    palace.earthStatus?.isMu ||
    palace.earth2Status?.isMu
  );

  // 击刑
  const jiXing = !!(
    palace.skyStatus?.isXing ||
    palace.sky2Status?.isXing ||
    palace.earthStatus?.isXing ||
    palace.earth2Status?.isXing
  );

  // 门迫
  const menPo = palace.isMenPo;

  return { kongWang, ruMu, jiXing, menPo };
}

function findPalaceForTarget(
  palaces: PalaceData[],
  target: typeof IRON_ARMY_TARGETS[number]
): PalaceData | null {
  for (const p of palaces) {
    if (target.type === 'stem') {
      if (p.skyStem === target.match || p.skyStem2 === target.match) return p;
    } else if (target.type === 'door') {
      if (p.door === target.match) return p;
    } else if (target.type === 'god') {
      if (p.god === target.match) return p;
    }
  }
  return null;
}

const SI_HAI_LABELS: Record<string, string> = {
  kongWang: '空亡',
  ruMu: '入墓',
  jiXing: '击刑',
  menPo: '门迫',
};

interface TargetResult {
  key: string;
  label: string;
  palace: PalaceData | null;
  palaceName: string;
  siHai: SiHaiCheck | null;
  hasSiHai: boolean;
  siHaiList: string[];
}

const IronArmyIndicator: React.FC<IronArmyIndicatorProps> = ({ chart }) => {
  const results = useMemo<TargetResult[]>(() => {
    return IRON_ARMY_TARGETS.map(target => {
      const palace = findPalaceForTarget(chart.palaces, target);
      if (!palace) {
        return { key: target.key, label: target.label, palace: null, palaceName: '-', siHai: null, hasSiHai: false, siHaiList: [] };
      }
      const siHai = checkPalaceSiHai(palace);
      const siHaiList: string[] = [];
      if (siHai.kongWang) siHaiList.push('空亡');
      if (siHai.ruMu) siHaiList.push('入墓');
      if (siHai.jiXing) siHaiList.push('击刑');
      if (siHai.menPo) siHaiList.push('门迫');
      return {
        key: target.key,
        label: target.label,
        palace,
        palaceName: PALACE_NAMES[palace.id] || `${palace.id}宫`,
        siHai,
        hasSiHai: siHaiList.length > 0,
        siHaiList,
      };
    });
  }, [chart.palaces]);

  const totalClean = results.filter(r => r.palace && !r.hasSiHai).length;
  const totalHarmed = results.filter(r => r.hasSiHai).length;

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          铁军指标
          <Badge variant={totalHarmed === 0 ? 'default' : 'destructive'} className="ml-auto text-xs">
            {totalHarmed === 0 ? '全清' : `${totalHarmed} 项受害`}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {results.map(r => (
            <div
              key={r.key}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm border ${
                r.hasSiHai
                  ? 'bg-destructive/5 border-destructive/20'
                  : r.palace
                    ? 'bg-green-500/5 border-green-200 dark:border-green-800'
                    : 'bg-muted/50 border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                {r.hasSiHai ? (
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                ) : r.palace ? (
                  <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Shield className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{r.label}</span>
                <span className="text-muted-foreground text-xs">{r.palaceName}</span>
              </div>
              <div className="flex items-center gap-1">
                {r.hasSiHai ? (
                  r.siHaiList.map(s => (
                    <Badge key={s} variant="destructive" className="text-xs px-1.5 py-0">
                      {s}
                    </Badge>
                  ))
                ) : r.palace ? (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700">
                    无害
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">未找到</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default IronArmyIndicator;
