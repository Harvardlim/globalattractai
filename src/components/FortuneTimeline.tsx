import React, { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FortuneTimelineProps {
  bigCycles: Array<{ year: number; gan: string; zhi: string; desc: string }>;
  annualCycles: Array<{ year: number; gan: string; zhi: string; age: number; desc: string }>;
  favorableElements: string[];
  unfavorableElements: string[];
  birthYear: number;
  dayStemIdx: number;
}

const STEM_ELEMENT_IDX = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
const ELEMENTS = ['木', '火', '土', '金', '水'];

const TEN_GOD_OFFSET: Record<string, number> = {
  '比': 0, '劫': 0,
  '食': 1, '伤': 1,
  '财': 2, '才': 2,
  '官': 3, '杀': 3,
  '印': 4, '枭': 4,
};

const scoreCycle = (
  desc: string,
  dayStemIdx: number,
  favorableElements: string[],
  unfavorableElements: string[]
): number => {
  const dayElement = STEM_ELEMENT_IDX[dayStemIdx];
  let score = 0;
  for (const char of desc) {
    const offset = TEN_GOD_OFFSET[char];
    if (offset === undefined) continue;
    const element = ELEMENTS[(dayElement + offset) % 5];
    if (favorableElements.includes(element)) score += 1;
    if (unfavorableElements.includes(element)) score -= 1;
  }
  return score;
};

const FortuneTimeline: React.FC<FortuneTimelineProps> = ({
  bigCycles,
  annualCycles,
  favorableElements,
  unfavorableElements,
  birthYear,
  dayStemIdx,
}) => {
  const currentYear = new Date().getFullYear();

  const scoredCycles = useMemo(() => {
    return bigCycles.map((cycle, idx) => {
      const endYear = idx < bigCycles.length - 1 ? bigCycles[idx + 1].year : cycle.year + 10;
      const isCurrent = currentYear >= cycle.year && currentYear < endYear;
      const score = scoreCycle(cycle.desc, dayStemIdx, favorableElements, unfavorableElements);
      const age = cycle.year - birthYear;
      return { ...cycle, endYear, isCurrent, score, age: age > 0 ? age : 0 };
    });
  }, [bigCycles, currentYear, birthYear, favorableElements, unfavorableElements, dayStemIdx]);

  // Find current big cycle index
  const currentBigIdx = useMemo(() => {
    return scoredCycles.findIndex(c => c.isCurrent);
  }, [scoredCycles]);

  const [selectedBigIdx, setSelectedBigIdx] = useState<number>(currentBigIdx >= 0 ? currentBigIdx : 0);

  useEffect(() => {
    if (currentBigIdx >= 0) setSelectedBigIdx(currentBigIdx);
  }, [currentBigIdx]);

  // Filter annual cycles to selected big cycle's range
  const scoredAnnual = useMemo(() => {
    const selected = scoredCycles[selectedBigIdx];
    if (!selected) return [];
    return annualCycles
      .filter(a => a.year >= selected.year && a.year < selected.endYear)
      .map(cycle => {
        const score = scoreCycle(cycle.desc, dayStemIdx, favorableElements, unfavorableElements);
        const isCurrent = cycle.year === currentYear;
        return { ...cycle, score, isCurrent };
      });
  }, [annualCycles, selectedBigIdx, scoredCycles, currentYear, favorableElements, unfavorableElements, dayStemIdx]);

  return (
    <div className="bg-card rounded-lg p-2 sm:p-3 border border-border space-y-3">
      <p className="text-xs text-muted-foreground text-center">运势走势</p>
      
      {/* Big Cycles Timeline */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground mb-1.5">大运走势 <span className="text-muted-foreground/60">（点击查看流年）</span></p>
        <div className="flex gap-1 py-2 overflow-x-auto">
          {scoredCycles.map((cycle, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedBigIdx(idx)}
              className={cn(
                "flex-shrink-0 rounded-lg px-2 py-1.5 text-center min-w-[48px] border transition-all cursor-pointer",
                cycle.isCurrent && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                idx === selectedBigIdx && !cycle.isCurrent && "ring-2 ring-muted-foreground/40 ring-offset-1 ring-offset-background",
                cycle.score > 0 && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
                cycle.score < 0 && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                cycle.score === 0 && "bg-muted/50 border-border"
              )}
            >
              <p className="text-[9px] text-muted-foreground">{cycle.age}岁</p>
              <p className="text-[11px] font-bold">{cycle.gan}{cycle.zhi}</p>
              <p className="text-[9px] text-muted-foreground">{cycle.desc}</p>
              <p className={cn(
                "text-[10px] mt-0.5",
                cycle.score > 0 && "text-green-600 dark:text-green-400",
                cycle.score < 0 && "text-red-600 dark:text-red-400",
                cycle.score === 0 && "text-muted-foreground"
              )}>
                {cycle.score > 0 ? '▲' : cycle.score < 0 ? '▼' : '—'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Annual Cycles for selected Big Cycle */}
      {scoredAnnual.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-1.5">
            流年走势（{scoredCycles[selectedBigIdx]?.year}–{scoredCycles[selectedBigIdx]?.endYear - 1}）
          </p>
          <div className="flex gap-1 py-2 overflow-x-auto">
            {scoredAnnual.map((cycle, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex-shrink-0 rounded-lg px-2 py-1.5 text-center min-w-[48px] border transition-all",
                  cycle.isCurrent && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                  cycle.score > 0 && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
                  cycle.score < 0 && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                  cycle.score === 0 && "bg-muted/50 border-border"
                )}
              >
                <p className="text-[9px] text-muted-foreground">{cycle.age}岁</p>
                <p className="text-[11px] font-bold">{cycle.gan}{cycle.zhi}</p>
                <p className="text-[9px] text-muted-foreground">{cycle.year}</p>
                <p className="text-[9px] text-muted-foreground">{cycle.desc}</p>
                <p className={cn(
                  "text-[10px] mt-0.5",
                  cycle.score > 0 && "text-green-600 dark:text-green-400",
                  cycle.score < 0 && "text-red-600 dark:text-red-400",
                  cycle.score === 0 && "text-muted-foreground"
                )}>
                  {cycle.score > 0 ? '▲' : cycle.score < 0 ? '▼' : '—'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-green-400 dark:bg-green-600 inline-block" /> 喜用神运
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-400 dark:bg-red-600 inline-block" /> 忌神运
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-muted-foreground/30 inline-block" /> 中性
        </span>
      </div>
    </div>
  );
};

export default FortuneTimeline;
