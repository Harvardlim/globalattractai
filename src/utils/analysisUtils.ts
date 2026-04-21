
import { energyMap } from '@/data/energyMapping';
import { getTranslations } from '@/data/translations';
import { SpecialCombination, Language, Combination, MagneticFieldStats } from '../types/index';

export function calculateScore(baseScore: number, number: string, originalNumber: string, position: number): { score: number; modifier?: string; isHidden?: boolean } {
  let score = baseScore;
  let modifier: string | undefined;
  let isHidden = false;

  // 检查三位数组合中是否有0（隐藏效果，扣20%）
  if (position < originalNumber.length - 2) {
    const threeDigit = originalNumber.substr(position, 3);
    if (threeDigit[1] === '0') {
      score = Math.round(score * 0.8);
      modifier = '隐藏(-20%)';
      isHidden = true;
    }
  }

  // 检查三位数组合中是否有5（加强效果，加20%）
  if (position < originalNumber.length - 2) {
    const threeDigit = originalNumber.substr(position, 3);
    if (threeDigit[1] === '5') {
      score = Math.round(score * 1.2);
      modifier = '加强(+20%)';
    }
  }

  return { score, modifier, isHidden };
}

export function detectSpecialCombinations(numbers: string, currentLanguage: Language): SpecialCombination[] {
  const specialCombinations: SpecialCombination[] = [];
  const t = getTranslations(currentLanguage);

  // 检测三位数组合中的特殊情况
  for (let i = 0; i < numbers.length - 2; i++) {
    const threeDigit = numbers.substr(i, 3);
    const twoDigit = threeDigit[0] + threeDigit[2]; // 第一位和第三位
    const middleDigit = threeDigit[1];

    // 检查是否是有效的磁场组合
    const energy = energyMap[twoDigit];
    if (energy) {
      if (middleDigit === '0') {
        // 隐藏组合
        specialCombinations.push({
          number: threeDigit,
          position: `位置${i + 1}-${i + 3}`,
          type: 'hidden',
          name: currentLanguage === 'zh' ? `隐藏${energy.name}` : `Hidden ${t.starNames[energy.name.replace(/[1-4]$/, '')] || energy.name}${energy.name.slice(-1)}`,
          description: currentLanguage === 'zh' ? `${energy.name}${t.specialCombinationTexts.hiddenEnergy}` : `${t.starNames[energy.name.replace(/[1-4]$/, '')] || energy.name}${energy.name.slice(-1)} ${t.specialCombinationTexts.hiddenEnergy}`,
          effect: t.specialCombinationTexts.hiddenEffect
        });
      } else if (middleDigit === '5') {
        // 加强组合
        specialCombinations.push({
          number: threeDigit,
          position: `位置${i + 1}-${i + 3}`,
          type: 'enhanced',
          name: currentLanguage === 'zh' ? `加强${energy.name}` : `Enhanced ${t.starNames[energy.name.replace(/[1-4]$/, '')] || energy.name}${energy.name.slice(-1)}`,
          description: currentLanguage === 'zh' ? `${energy.name}${t.specialCombinationTexts.enhancedEnergy}` : `${t.starNames[energy.name.replace(/[1-4]$/, '')] || energy.name}${energy.name.slice(-1)} ${t.specialCombinationTexts.enhancedEnergy}`,
          effect: t.specialCombinationTexts.enhancedEffect
        });
      }
    }
  }

  // 检测连号（特殊组合）
  for (let i = 0; i < numbers.length - 2; i++) {
    const threeDigit = numbers.substr(i, 3);
    const digits = threeDigit.split('').map(Number);
    
    // 检测连续数字
    if (digits[1] === digits[0] + 1 && digits[2] === digits[1] + 1) {
      specialCombinations.push({
        number: threeDigit,
        position: `位置${i + 1}-${i + 3}`,
        type: 'special',
        name: t.specialCombinationTexts.continuousUp,
        description: t.specialCombinationTexts.continuousUpDesc,
        effect: t.specialCombinationTexts.continuousUpEffect
      });
    } else if (digits[1] === digits[0] - 1 && digits[2] === digits[1] - 1) {
      specialCombinations.push({
        number: threeDigit,
        position: `位置${i + 1}-${i + 3}`,
        type: 'special',
        name: t.specialCombinationTexts.continuousDown,
        description: t.specialCombinationTexts.continuousDownDesc,
        effect: t.specialCombinationTexts.continuousDownEffect
      });
    }
    
    // 检测三位相同数字
    if (digits[0] === digits[1] && digits[1] === digits[2]) {
      specialCombinations.push({
        number: threeDigit,
        position: `位置${i + 1}-${i + 3}`,
        type: 'special',
        name: t.specialCombinationTexts.tripleForce,
        description: t.specialCombinationTexts.tripleForceDesc,
        effect: currentLanguage === 'zh' ? `数字${digits[0]}${t.specialCombinationTexts.tripleForceEffect}` : `Number ${digits[0]} ${t.specialCombinationTexts.tripleForceEffect}`
      });
    }
  }

  // 完整的特殊组合检查 - 使用翻译
  const specialChecks = Object.keys(t.specialCombinationMeanings);
  
  // 检查所有特殊组合（按长度从长到短排序，避免短组合覆盖长组合）
  const sortedChecks = specialChecks.sort((a, b) => b.length - a.length);
  
  for (const combo of sortedChecks) {
    const index = numbers.indexOf(combo);
    if (index !== -1) {
      // 检查是否已经添加了重叠的组合
      const hasOverlap = specialCombinations.some(existing => {
        const existingStart = numbers.indexOf(existing.number);
        const existingEnd = existingStart + existing.number.length - 1;
        const currentStart = index;
        const currentEnd = index + combo.length - 1;
        
        return !(existingEnd < currentStart || currentEnd < existingStart);
      });
      
      if (!hasOverlap) {
        specialCombinations.push({
          number: combo,
          position: `[${combo}]`,
          type: 'special',
          name: t.specialCombinationMeanings[combo as keyof typeof t.specialCombinationMeanings],
          description: t.specialCombinationTexts.specialCombinationMeaning
        });
      }
    }
  }

  return specialCombinations;
}

export function calculateMagneticFieldStats(combinations: Combination[], specialCombinations: SpecialCombination[]): MagneticFieldStats {
  let totalLuckyScore = 0;
  let totalUnluckyScore = 0;
  let luckyCount = 0;
  let unluckyCount = 0;

  // 按星象类型统计分数和数量
  const starStats: Record<string, { score: number; count: number; type: 'lucky' | 'unlucky' }> = {};

  combinations.forEach(combo => {
    const baseName = combo.name.replace(/[1-4]$/, '').replace('隐藏', '').replace('加强', ''); // 移除数字后缀、隐藏和加强前缀
    
    if (!starStats[baseName]) {
      starStats[baseName] = { score: 0, count: 0, type: combo.type };
    }
    
    starStats[baseName].score += combo.score;
    starStats[baseName].count += 1;
    
    if (combo.type === 'lucky') {
      totalLuckyScore += combo.score;
      luckyCount++;
    } else {
      totalUnluckyScore += combo.score;
      unluckyCount++;
    }
  });

  // 找出主导磁场（分数最高的星象）
  let dominantField = '';
  let dominantType: 'lucky' | 'unlucky' = 'lucky';
  let maxScore = 0;

  Object.entries(starStats).forEach(([starName, stats]) => {
    if (stats.score > maxScore) {
      maxScore = stats.score;
      dominantField = starName;
      dominantType = stats.type;
    }
  });

  return {
    totalLuckyScore,
    totalUnluckyScore,
    dominantField,
    dominantType,
    luckyCount,
    unluckyCount,
    specialCount: specialCombinations.length
  };
}

export function getStarRankings(combinations: Combination[]) {
  const starStats: Record<string, { score: number; count: number; type: 'lucky' | 'unlucky' }> = {};

  combinations.forEach(combo => {
    const baseName = combo.name.replace(/[1-4]$/, '').replace('隐藏', '').replace('加强', '').replace('混合', '').replace('Hidden ', '').replace('Enhanced ', '').replace('Mixed ', '');
    
    if (!starStats[baseName]) {
      starStats[baseName] = { score: 0, count: 0, type: combo.type };
    }
    
    starStats[baseName].score += combo.score;
    starStats[baseName].count += 1;
  });

  const sortedByScore = Object.entries(starStats)
    .sort(([,a], [,b]) => b.score - a.score);

  const sortedByCount = Object.entries(starStats)
    .sort(([,a], [,b]) => b.count - a.count);

  return { sortedByScore, sortedByCount };
}

// Legacy analysis function - kept for backward compatibility
export async function analyzeNumber(inputNumber: string, currentLanguage: Language) {
  const { analyzeNumberEnhanced } = await import('./enhancedAnalysisUtils');
  return analyzeNumberEnhanced(inputNumber, currentLanguage);
}
