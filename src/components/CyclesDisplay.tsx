import React, { useState, useMemo, useEffect } from 'react';
import { BigCycle, AnnualCycle } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLunarYear } from '@/lib/ganzhiHelper';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from '@/lib/constants';

// 天干五行：甲乙-木, 丙丁-火, 戊己-土, 庚辛-金, 壬癸-水
const STEM_ELEMENTS = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
// 地支五行：子-水, 丑-土, 寅-木, 卯-木, 辰-土, 巳-火, 午-火, 未-土, 申-金, 酉-金, 戌-土, 亥-水
const BRANCH_ELEMENTS = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

const ELEMENT_TEXT_COLORS = [
  'text-emerald-600', // 木
  'text-red-500',     // 火
  'text-amber-600',   // 土
  'text-yellow-500',  // 金
  'text-blue-500',    // 水
];

const getStemColor = (gan: string) => {
  const idx = HEAVENLY_STEMS.indexOf(gan);
  return idx >= 0 ? ELEMENT_TEXT_COLORS[STEM_ELEMENTS[idx]] : '';
};

const getBranchColor = (zhi: string) => {
  const idx = EARTHLY_BRANCHES.indexOf(zhi);
  return idx >= 0 ? ELEMENT_TEXT_COLORS[BRANCH_ELEMENTS[idx]] : '';
};

interface CyclesDisplayProps {
  bigCycles: BigCycle[];
  annualCycles: AnnualCycle[];
  birthYear: number;
}

const CyclesDisplay: React.FC<CyclesDisplayProps> = ({ bigCycles, annualCycles, birthYear }) => {
  // 使用农历年（考虑立春）判断当前年
  const now = new Date();
  const currentLunarYear = getLunarYear(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  // 找到当前大运索引
  const currentBigCycleIdx = useMemo(() => {
    return bigCycles.findIndex((cycle, idx) => {
      if (idx === bigCycles.length - 1) return true;
      const nextCycle = bigCycles[idx + 1];
      return currentLunarYear >= cycle.year && currentLunarYear < nextCycle.year;
    });
  }, [bigCycles, currentLunarYear]);

  // 显示起始索引（控制大运行显示哪10个）
  const [displayStartIdx, setDisplayStartIdx] = useState<number>(0);
  
  // 当前选中的大运索引（用于显示流年）
  const [selectedCycleIdx, setSelectedCycleIdx] = useState<number>(
    currentBigCycleIdx >= 0 ? currentBigCycleIdx : 0
  );

  // 初始化时让当前大运居中显示
  useEffect(() => {
    if (currentBigCycleIdx >= 0) {
      const startIdx = Math.max(0, Math.min(currentBigCycleIdx - 4, bigCycles.length - 10));
      setDisplayStartIdx(Math.max(0, startIdx));
      setSelectedCycleIdx(currentBigCycleIdx);
    }
  }, [currentBigCycleIdx, bigCycles.length]);

  // 获取要显示的10个大运
  const displayBigCycles = useMemo(() => {
    return bigCycles.slice(displayStartIdx, displayStartIdx + 10);
  }, [bigCycles, displayStartIdx]);

  // 获取选中大运对应的流年
  const selectedAnnuals = useMemo(() => {
    const selectedBigCycle = bigCycles[selectedCycleIdx];
    if (!selectedBigCycle) return [];
    const nextCycleYear = selectedCycleIdx < bigCycles.length - 1 
      ? bigCycles[selectedCycleIdx + 1].year 
      : selectedBigCycle.year + 10;
    return annualCycles.filter(a => a.year >= selectedBigCycle.year && a.year < nextCycleYear);
  }, [selectedCycleIdx, bigCycles, annualCycles]);

  // 计算虚岁
  const getTraditionalAge = (year: number) => {
    const age = year - birthYear + 1;
    return age > 0 ? age : '-';
  };

  // 导航处理
  const goToPrev = () => setDisplayStartIdx(prev => Math.max(0, prev - 1));
  const goToNext = () => setDisplayStartIdx(prev => Math.min(bigCycles.length - 10, prev + 1));

  if (bigCycles.length === 0) return null;

  return (
    <div className="bg-card rounded-lg p-2 sm:p-3 border border-border">
      {/* 导航栏 */}
      <div className="text-center w-full mb-2">
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={goToPrev}
          disabled={displayStartIdx === 0}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button> */}
        
        <span className="text-xs text-muted-foreground text-center">大运流年</span>
        
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          disabled={displayStartIdx + 10 >= bigCycles.length}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button> */}
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs sm:text-sm border-collapse">
          {/* 大运区域 */}
          <thead>
            {/* 第一行：大运年份 */}
            <tr className="border-b border-border">
              <th 
                rowSpan={3} 
                className="text-qimen-gold font-medium px-1 sm:px-2 py-1 border-r border-border w-8 sm:w-10"
                style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
              >
                大运
              </th>
              {displayBigCycles.map((cycle, idx) => {
                const actualIdx = displayStartIdx + idx;
                const isCurrent = actualIdx === currentBigCycleIdx;
                const isSelected = actualIdx === selectedCycleIdx;
                return (
                  <th 
                    key={idx}
                    onClick={() => setSelectedCycleIdx(actualIdx)}
                    className={cn(
                      "px-1 sm:px-2 py-1 cursor-pointer hover:bg-muted/50 transition-colors min-w-[40px] sm:min-w-[50px]",
                      isCurrent && "text-qimen-highlight",
                      isSelected && "bg-muted/30"
                    )}
                  >
                    {cycle.year}
                  </th>
                );
              })}
            </tr>
            {/* 第二行：干支（竖排） */}
            <tr className="border-b border-border">
              {displayBigCycles.map((cycle, idx) => {
                const actualIdx = displayStartIdx + idx;
                const isCurrent = actualIdx === currentBigCycleIdx;
                const isSelected = actualIdx === selectedCycleIdx;
                return (
                  <th 
                    key={idx}
                    onClick={() => setSelectedCycleIdx(actualIdx)}
                    className={cn(
                      "px-1 sm:px-2 py-1 cursor-pointer hover:bg-muted/50 transition-colors font-medium",
                      isCurrent && "text-qimen-highlight",
                      isSelected && "bg-muted/30"
                    )}
                  >
                    <div className="leading-tight">{cycle.gan}</div>
                    <div className="leading-tight">{cycle.zhi}</div>
                  </th>
                );
              })}
            </tr>
            {/* 第三行：十神 */}
            <tr className="border-b border-border">
              {displayBigCycles.map((cycle, idx) => {
                const actualIdx = displayStartIdx + idx;
                const isCurrent = actualIdx === currentBigCycleIdx;
                const isSelected = actualIdx === selectedCycleIdx;
                return (
                  <th 
                    key={idx}
                    onClick={() => setSelectedCycleIdx(actualIdx)}
                    className={cn(
                      "px-1 sm:px-2 py-1 cursor-pointer hover:bg-muted/50 transition-colors text-xs text-muted-foreground font-normal",
                      isCurrent && "text-qimen-highlight",
                      isSelected && "bg-muted/30"
                    )}
                  >
                    {cycle.desc}
                  </th>
                );
              })}
            </tr>
          </thead>
          
          {/* 流年区域 */}
          <tbody>
            {/* 第一行：年份+年龄 */}
            <tr className="border-b border-border">
              <td 
                rowSpan={3} 
                className="text-qimen-gold font-medium px-1 sm:px-2 py-1 border-r border-border"
                style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
              >
                流年
              </td>
              {selectedAnnuals.map((annual, idx) => {
                const isCurrent = annual.year === currentLunarYear;
                return (
                  <td 
                    key={idx}
                    className={cn(
                      "px-1 sm:px-2 py-1",
                      isCurrent && "text-qimen-highlight"
                    )}
                  >
                    <div className="leading-tight">{annual.year}</div>
                    <div className="leading-tight text-xs">{getTraditionalAge(annual.year)}岁</div>
                  </td>
                );
              })}
            </tr>
            {/* 第二行：干支 */}
            <tr className="border-b border-border">
              {selectedAnnuals.map((annual, idx) => {
                const isCurrent = annual.year === currentLunarYear;
                return (
                  <td 
                    key={idx}
                    className={cn(
                      "px-1 sm:px-2 py-1 font-medium",
                      isCurrent && "text-qimen-highlight"
                    )}
                  >
                    <div className="leading-tight">{annual.gan}</div>
                    <div className="leading-tight">{annual.zhi}</div>
                  </td>
                );
              })}
            </tr>
            {/* 第三行：十神 */}
            <tr>
              {selectedAnnuals.map((annual, idx) => {
                const isCurrent = annual.year === currentLunarYear;
                return (
                  <td 
                    key={idx}
                    className={cn(
                      "px-1 sm:px-2 py-1 text-xs text-muted-foreground",
                      isCurrent && "text-qimen-highlight"
                    )}
                  >
                    {annual.desc}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CyclesDisplay;
