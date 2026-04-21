/**
 * Personal Calendar Analysis Logic
 * - Daily clothing color recommendations based on Day Master
 * - Strong/Weak body factor (uses analyzeBaziPattern)
 * - Da Yun (大运) + Liu Nian (流年) cycle analysis
 * - Day favorability highlighting
 */

import { FourPillars, Gender, BigCycle, AnnualCycle } from '@/types';
import { HEAVENLY_STEMS } from '@/lib/constants';
import { calculateCycles, getTenGodsSingleLabel } from '@/lib/ganzhiHelper';
import {
  STEM_ELEMENTS, ELEMENT_NAMES,
  analyzeBaziPattern,
  type BaziAnalysisResult,
} from '@/lib/baziPatternAnalysis';

// ===== Clothing Color Recommendations =====

export const ELEMENT_CLOTHING_COLORS: Record<number, { colors: string[]; hex: string[]; label: string }> = {
  0: { colors: ['绿色', '青色', '翠色'], hex: ['#22c55e', '#10b981', '#059669'], label: '木' },
  1: { colors: ['红色', '紫色', '橙色'], hex: ['#ef4444', '#a855f7', '#f97316'], label: '火' },
  2: { colors: ['黄色', '棕色', '米色'], hex: ['#eab308', '#a16207', '#d4a574'], label: '土' },
  3: { colors: ['白色', '金色', '银色'], hex: ['#f5f5f4', '#fbbf24', '#d1d5db'], label: '金' },
  4: { colors: ['黑色', '深蓝', '灰色'], hex: ['#1e293b', '#1e40af', '#6b7280'], label: '水' },
};

export interface ClothingRecommendation {
  recommended: { element: number; colors: string[]; hex: string[]; reason: string }[];
  avoid: { element: number; colors: string[]; hex: string[]; reason: string }[];
}

export const getClothingRecommendation = (
  dayMasterElement: number,
  strength: 'strong' | 'weak' | 'neutral',
  _dailyStemElement: number,
): ClothingRecommendation => {
  const recommended: ClothingRecommendation['recommended'] = [];
  const avoid: ClothingRecommendation['avoid'] = [];

  if (strength === 'strong') {
    const woSheng = (dayMasterElement + 1) % 5;
    const woKe = (dayMasterElement + 2) % 5;
    recommended.push({
      element: woSheng,
      colors: ELEMENT_CLOTHING_COLORS[woSheng].colors,
      hex: ELEMENT_CLOTHING_COLORS[woSheng].hex,
      reason: `泄身 · ${ELEMENT_NAMES[woSheng]}色助运`,
    });
    recommended.push({
      element: woKe,
      colors: ELEMENT_CLOTHING_COLORS[woKe].colors,
      hex: ELEMENT_CLOTHING_COLORS[woKe].hex,
      reason: `耗身 · ${ELEMENT_NAMES[woKe]}色旺财`,
    });
    const shengWo = (dayMasterElement + 4) % 5;
    avoid.push({
      element: shengWo,
      colors: ELEMENT_CLOTHING_COLORS[shengWo].colors,
      hex: ELEMENT_CLOTHING_COLORS[shengWo].hex,
      reason: `生身过旺 · 忌${ELEMENT_NAMES[shengWo]}色`,
    });
    avoid.push({
      element: dayMasterElement,
      colors: ELEMENT_CLOTHING_COLORS[dayMasterElement].colors,
      hex: ELEMENT_CLOTHING_COLORS[dayMasterElement].hex,
      reason: `助身过旺 · 忌${ELEMENT_NAMES[dayMasterElement]}色`,
    });
  } else {
    const shengWo = (dayMasterElement + 4) % 5;
    recommended.push({
      element: shengWo,
      colors: ELEMENT_CLOTHING_COLORS[shengWo].colors,
      hex: ELEMENT_CLOTHING_COLORS[shengWo].hex,
      reason: `生扶日主 · ${ELEMENT_NAMES[shengWo]}色旺运`,
    });
    recommended.push({
      element: dayMasterElement,
      colors: ELEMENT_CLOTHING_COLORS[dayMasterElement].colors,
      hex: ELEMENT_CLOTHING_COLORS[dayMasterElement].hex,
      reason: `助力日主 · ${ELEMENT_NAMES[dayMasterElement]}色补气`,
    });
    const woSheng = (dayMasterElement + 1) % 5;
    const keWo = (dayMasterElement + 3) % 5;
    avoid.push({
      element: woSheng,
      colors: ELEMENT_CLOTHING_COLORS[woSheng].colors,
      hex: ELEMENT_CLOTHING_COLORS[woSheng].hex,
      reason: `泄气 · 忌${ELEMENT_NAMES[woSheng]}色`,
    });
    avoid.push({
      element: keWo,
      colors: ELEMENT_CLOTHING_COLORS[keWo].colors,
      hex: ELEMENT_CLOTHING_COLORS[keWo].hex,
      reason: `克身 · 忌${ELEMENT_NAMES[keWo]}色`,
    });
  }

  return { recommended, avoid };
};

/**
 * 通用穿衣建议 — 纯粹基于当日天干五行
 * 大吉：我生（日干所生的五行）
 * 次吉：同我（与日干同五行）
 * 不宜：生我（生日干的五行）+ 克我（克日干的五行）
 * 忌：我克（日干所克的五行）
 *
 * 例：水日 → 大吉木，次吉水，不宜金/土，忌火
 */
export const getDailyClothingByElement = (dayStemElement: number): ClothingRecommendation => {
  const recommended: ClothingRecommendation['recommended'] = [];
  const avoid: ClothingRecommendation['avoid'] = [];

  const woSheng = (dayStemElement + 1) % 5;  // 我生
  const sameEl = dayStemElement;              // 同我
  const shengWo = (dayStemElement + 4) % 5;  // 生我
  const keWo = (dayStemElement + 3) % 5;     // 克我
  const woKe = (dayStemElement + 2) % 5;     // 我克

  recommended.push({
    element: woSheng,
    colors: ELEMENT_CLOTHING_COLORS[woSheng].colors,
    hex: ELEMENT_CLOTHING_COLORS[woSheng].hex,
    reason: `大吉 · ${ELEMENT_NAMES[dayStemElement]}生${ELEMENT_NAMES[woSheng]}`,
  });
  recommended.push({
    element: sameEl,
    colors: ELEMENT_CLOTHING_COLORS[sameEl].colors,
    hex: ELEMENT_CLOTHING_COLORS[sameEl].hex,
    reason: `次吉 · ${ELEMENT_NAMES[sameEl]}助${ELEMENT_NAMES[dayStemElement]}`,
  });
  avoid.push({
    element: shengWo,
    colors: ELEMENT_CLOTHING_COLORS[shengWo].colors,
    hex: ELEMENT_CLOTHING_COLORS[shengWo].hex,
    reason: `不宜 · ${ELEMENT_NAMES[shengWo]}泄气`,
  });
  avoid.push({
    element: keWo,
    colors: ELEMENT_CLOTHING_COLORS[keWo].colors,
    hex: ELEMENT_CLOTHING_COLORS[keWo].hex,
    reason: `不宜 · ${ELEMENT_NAMES[keWo]}克${ELEMENT_NAMES[dayStemElement]}`,
  });
  avoid.push({
    element: woKe,
    colors: ELEMENT_CLOTHING_COLORS[woKe].colors,
    hex: ELEMENT_CLOTHING_COLORS[woKe].hex,
    reason: `忌 · ${ELEMENT_NAMES[dayStemElement]}克${ELEMENT_NAMES[woKe]}`,
  });

  return { recommended, avoid };
};

// ===== Da Yun + Liu Nian Analysis =====

export interface CalendarDaYunInfo {
  currentDaYun: BigCycle | null;
  currentDaYunTenGod: string;
  daYunFavorability: 'favorable' | 'unfavorable' | 'neutral';
  daYunHint: string;
  daYunLife: LifeInterpretation;
  allBigCycles: BigCycle[];
  allAnnualCycles: AnnualCycle[];
  // 流年
  currentLiuNian: AnnualCycle | null;
  liuNianTenGod: string;
  liuNianFavorability: 'favorable' | 'unfavorable' | 'neutral';
  liuNianHint: string;
  liuNianLife: LifeInterpretation;
}

/**
 * 判断五行对日主的吉凶
 */
export const getElementFavorability = (
  element: number,
  dayElement: number,
  strength: 'strong' | 'weak' | 'neutral',
): 'favorable' | 'unfavorable' | 'neutral' => {
  const generatingMe = (dayElement + 4) % 5;
  const iGenerate = (dayElement + 1) % 5;
  const iOvercome = (dayElement + 2) % 5;
  const overcomesMe = (dayElement + 3) % 5;

  if (strength === 'strong') {
    if (element === iGenerate || element === iOvercome) return 'favorable';
    if (element === generatingMe || element === dayElement) return 'unfavorable';
  } else {
    if (element === generatingMe || element === dayElement) return 'favorable';
    if (element === overcomesMe || element === iGenerate) return 'unfavorable';
  }
  return 'neutral';
};

// ===== Ten Gods Life Interpretations =====

export interface LifeInterpretation {
  career: string;
  relationship: string;
  wealth: string;
}

const STRONG_INTERPRETATIONS: Record<string, LifeInterpretation> = {
  '比': { career: '竞争激烈，需独立开创', relationship: '朋友多但易有竞争', wealth: '花销较大，不宜合伙' },
  '劫': { career: '变动大，防小人', relationship: '感情易有第三者干扰', wealth: '破财风险高，忌投机' },
  '食': { career: '创意爆发，表现出色', relationship: '感情甜蜜，异性缘佳', wealth: '生财有道，收入增长' },
  '伤': { career: '才华展露，但易冲突', relationship: '个性突出，感情波动', wealth: '偏财机会多，但不稳' },
  '才': { career: '商机多，利投资理财', relationship: '桃花旺，社交活跃', wealth: '偏财运佳，意外收入' },
  '财': { career: '事业稳定，利升职', relationship: '感情稳定，利婚姻', wealth: '正财稳健，收入稳定' },
  '杀': { career: '压力大但有突破机会', relationship: '感情强烈但波折', wealth: '竞争得财，需要魄力' },
  '官': { career: '贵人助力，利考试升职', relationship: '感情正式，利婚姻', wealth: '稳定收入，不宜冒险' },
  '枭': { career: '学习新技能，转型期', relationship: '感情冷淡，需主动', wealth: '收入不稳，需节省' },
  '印': { career: '贵人扶持，利学习深造', relationship: '感情温馨，有人关爱', wealth: '收入平稳，有靠山' },
};

const WEAK_INTERPRETATIONS: Record<string, LifeInterpretation> = {
  '比': { career: '贵人相助，合伙顺利', relationship: '朋友助力，感情稳定', wealth: '有人帮衬，财运平稳' },
  '劫': { career: '竞争中成长，需坚持', relationship: '感情需磨合', wealth: '有得有失，量力而行' },
  '食': { career: '精力外泄，不宜过劳', relationship: '付出较多，注意平衡', wealth: '花销增大，控制开支' },
  '伤': { career: '易冲动，防口舌是非', relationship: '感情波折，易争吵', wealth: '耗财较多，忌投资' },
  '才': { career: '追财辛苦，量力而行', relationship: '桃花多但不稳', wealth: '求财艰难，忌贪' },
  '财': { career: '压力大，事业波动', relationship: '感情有压力', wealth: '财来财去，不稳定' },
  '杀': { career: '压力巨大，防小人', relationship: '感情受外力干扰', wealth: '破财风险高' },
  '官': { career: '压力较大但有规矩', relationship: '感情有约束感', wealth: '收入受限，稳中求进' },
  '枭': { career: '有贵人但需辨别', relationship: '有人关心，但有依赖', wealth: '有靠山，收入尚可' },
  '印': { career: '贵人运旺，利学习进修', relationship: '感情温暖，有人庇护', wealth: '稳定收入，贵人送财' },
};

export const getTenGodLifeInterpretation = (
  tenGod: string,
  strength: 'strong' | 'weak' | 'neutral',
): LifeInterpretation => {
  const map = strength === 'strong' ? STRONG_INTERPRETATIONS : WEAK_INTERPRETATIONS;
  return map[tenGod] || { career: '运势平稳', relationship: '感情平顺', wealth: '财运一般' };
};

const TEN_GODS_FULL: Record<string, string> = {
  '比': '比肩', '劫': '劫财', '食': '食神', '伤': '伤官',
  '才': '偏财', '财': '正财', '杀': '七杀', '官': '正官',
  '枭': '偏印', '印': '正印',
};

export const getCalendarDaYunInfo = (
  birthDate: Date,
  gender: Gender,
  pillars: FourPillars,
  targetYear: number,
  dayMasterStrength: 'strong' | 'weak' | 'neutral',
): CalendarDaYunInfo => {
  const { big, annual } = calculateCycles(birthDate, gender, pillars);
  const dayElement = STEM_ELEMENTS[pillars.day.ganIdx];

  // 大运提前2年进入：除第0柱（出生柱）外，每个大运的生效年份 = 起始年 - 2
  let currentDaYun: BigCycle | null = null;
  for (let i = big.length - 1; i >= 0; i--) {
    const effectiveYear = i === 0 ? big[i].year : big[i].year - 2;
    if (targetYear >= effectiveYear) {
      currentDaYun = big[i];
      break;
    }
  }

  // 流年
  let currentLiuNian: AnnualCycle | null = null;
  for (const a of annual) {
    if (a.year === targetYear) {
      currentLiuNian = a;
      break;
    }
  }

  // Da Yun favorability
  let daYunFavorability: 'favorable' | 'unfavorable' | 'neutral' = 'neutral';
  let daYunTenGod = '';
  let daYunHint = '尚未起运';

  if (currentDaYun) {
    const daYunGanIdx = HEAVENLY_STEMS.indexOf(currentDaYun.gan);
    daYunTenGod = getTenGodsSingleLabel(pillars.day.ganIdx, daYunGanIdx);
    const daYunElement = STEM_ELEMENTS[daYunGanIdx];
    daYunFavorability = getElementFavorability(daYunElement, dayElement, dayMasterStrength);

    const favLabels = { favorable: '有利', unfavorable: '注意', neutral: '平稳' };
    daYunHint = `大运${TEN_GODS_FULL[daYunTenGod] || daYunTenGod}（${currentDaYun.gan}${currentDaYun.zhi}），${
      daYunFavorability === 'favorable' ? (dayMasterStrength === 'strong' ? '泄身助运' : '扶身旺运')
        : daYunFavorability === 'unfavorable' ? (dayMasterStrength === 'strong' ? '生助过旺' : '泄克损身')
        : '运势平稳'
    }`;
  }

  // Liu Nian favorability
  let liuNianFavorability: 'favorable' | 'unfavorable' | 'neutral' = 'neutral';
  let liuNianTenGod = '';
  let liuNianHint = '';

  if (currentLiuNian) {
    const lnGanIdx = HEAVENLY_STEMS.indexOf(currentLiuNian.gan);
    liuNianTenGod = getTenGodsSingleLabel(pillars.day.ganIdx, lnGanIdx);
    const lnElement = STEM_ELEMENTS[lnGanIdx];
    liuNianFavorability = getElementFavorability(lnElement, dayElement, dayMasterStrength);

    liuNianHint = `流年${TEN_GODS_FULL[liuNianTenGod] || liuNianTenGod}（${currentLiuNian.gan}${currentLiuNian.zhi}），${
      liuNianFavorability === 'favorable' ? '今年整体运势有利'
        : liuNianFavorability === 'unfavorable' ? '今年需多加注意'
        : '今年运势平稳'
    }`;
  }

  const daYunLife = daYunTenGod
    ? getTenGodLifeInterpretation(daYunTenGod, dayMasterStrength)
    : { career: '尚未起运', relationship: '尚未起运', wealth: '尚未起运' };

  const liuNianLife = liuNianTenGod
    ? getTenGodLifeInterpretation(liuNianTenGod, dayMasterStrength)
    : { career: '', relationship: '', wealth: '' };

  return {
    currentDaYun,
    currentDaYunTenGod: daYunTenGod,
    daYunFavorability,
    daYunHint,
    daYunLife,
    allBigCycles: big,
    allAnnualCycles: annual,
    currentLiuNian,
    liuNianTenGod,
    liuNianFavorability,
    liuNianHint,
    liuNianLife,
  };
};

// 判断某日十神的吉凶（结合身强身弱）
export const getDayFavorability = (
  tenGod: string,
  strength: 'strong' | 'weak' | 'neutral',
): 'good' | 'caution' | 'neutral' => {
  if (strength === 'strong') {
    if (['食', '伤', '才', '财'].includes(tenGod)) return 'good';
    if (['印', '枭', '比', '劫'].includes(tenGod)) return 'caution';
    return 'neutral';
  } else {
    if (['印', '枭', '比', '劫'].includes(tenGod)) return 'good';
    if (['官', '杀', '食', '伤'].includes(tenGod)) return 'caution';
    return 'neutral';
  }
};

// Re-export analyzeBaziPattern for use in Calendar
export { analyzeBaziPattern };
export type { BaziAnalysisResult };
