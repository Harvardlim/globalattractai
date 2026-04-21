/**
 * 八字格局分析 - 新版逻辑
 * 
 * 格局成立条件：
 * 1. 月柱/年柱/时柱的天干十神 = 其地支藏干本气的十神
 * 2. 某柱天干的十神，在其他地支的藏干中也有
 * 
 * 如果都没有符合，就是"无格"
 */

import { FourPillars, GanZhi } from '@/types';

// 天干
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干对应的五行
const STEM_ELEMENTS = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];

// 天干阴阳
const isYangStem = (idx: number): boolean => idx % 2 === 0;

// 地支藏干表 - 每个地支的本气、中气、余气
const BRANCH_HIDDEN_STEMS: Record<number, number[]> = {
  0: [9],           // 子: 癸
  1: [5, 9, 7],     // 丑: 己、癸、辛
  2: [0, 2, 4],     // 寅: 甲、丙、戊
  3: [1],           // 卯: 乙
  4: [4, 1, 9],     // 辰: 戊、乙、癸
  5: [2, 4, 6],     // 巳: 丙、戊、庚
  6: [3, 5],        // 午: 丁、己
  7: [5, 3, 1],     // 未: 己、丁、乙
  8: [6, 8, 4],     // 申: 庚、壬、戊
  9: [7],           // 酉: 辛
  10: [4, 7, 3],    // 戌: 戊、辛、丁
  11: [8, 0],       // 亥: 壬、甲
};

// 十神名称
const TEN_GOD_NAMES = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];

/**
 * 计算十神类型 (0-9)
 */
export const getTenGodType = (selfStemIdx: number, targetStemIdx: number): number => {
  const selfElement = STEM_ELEMENTS[selfStemIdx];
  const targetElement = STEM_ELEMENTS[targetStemIdx];
  const samePolarity = isYangStem(selfStemIdx) === isYangStem(targetStemIdx);
  const elementDiff = (targetElement - selfElement + 5) % 5;
  
  const baseType = elementDiff * 2;
  return samePolarity ? baseType : baseType + 1;
};

/**
 * 获取十神全称
 */
export const getTenGodName = (selfStemIdx: number, targetStemIdx: number): string => {
  const type = getTenGodType(selfStemIdx, targetStemIdx);
  return TEN_GOD_NAMES[type];
};

// 导出常量供外部使用
export { HEAVENLY_STEMS as GEJU_HEAVENLY_STEMS, EARTHLY_BRANCHES as GEJU_EARTHLY_BRANCHES, BRANCH_HIDDEN_STEMS, TEN_GOD_NAMES as GEJU_TEN_GOD_NAMES };

// 单个格局信息
export interface GeJuInfo {
  name: string;           // 格局名称（如"正官格"、"偏财格"）
  tenGodName: string;     // 十神名称
  pillarName: string;     // 来源柱（年柱/月柱/时柱）
  rule: 1 | 2;            // 成格规则（1=有根：天干地支十神同，2=有气：天干十神在他支有）
  description: string;    // 描述
}

// 格局分析结果
export interface GeJuAnalysisResult {
  hasGeJu: boolean;       // 是否有格局
  geJuList: GeJuInfo[];   // 格局列表（一个人可以有多个格局）
  summary: string;        // 总结
  noPatternReason?: string; // 无格原因
}

/**
 * 分析八字格局
 */
export function analyzeGeJu(pillars: FourPillars, includeHour: boolean = true): GeJuAnalysisResult {
  const dayStemIdx = pillars.day.ganIdx;
  const geJuList: GeJuInfo[] = [];
  
  const monthStemIdx = pillars.month.ganIdx;
  const monthBranchIdx = pillars.month.zhiIdx;
  const monthStemTenGodType = getTenGodType(dayStemIdx, monthStemIdx);
  const monthStemTenGodName = TEN_GOD_NAMES[monthStemTenGodType];
  const monthBranchHiddenStems = BRANCH_HIDDEN_STEMS[monthBranchIdx] || [];
  
  // 其他柱（用于规则1的天干匹配）
  const otherPillars: { pillar: GanZhi; name: string }[] = [
    { pillar: pillars.year, name: '年柱' },
    { pillar: pillars.day, name: '日柱' },
  ];
  if (includeHour) {
    otherPillars.push({ pillar: pillars.hour, name: '时柱' });
  }
  
  // ========== 规则1 ==========
  // 月柱天干十神 与 月柱地支本气或中气十神一致，
  // 且其他柱（年/日/时）的天干十神中也有一致的
  const maxCheckIdx = Math.min(2, monthBranchHiddenStems.length); // 只检查本气(0)和中气(1)
  let rule1BranchMatch = false;
  let rule1MatchPosition = '';
  let rule1MatchHiddenStemIdx = -1;
  
  for (let i = 0; i < maxCheckIdx; i++) {
    const hiddenStemIdx = monthBranchHiddenStems[i];
    const hiddenTenGodType = getTenGodType(dayStemIdx, hiddenStemIdx);
    if (hiddenTenGodType === monthStemTenGodType) {
      rule1BranchMatch = true;
      rule1MatchPosition = i === 0 ? '本气' : '中气';
      rule1MatchHiddenStemIdx = hiddenStemIdx;
      break;
    }
  }
  
  if (rule1BranchMatch) {
    // 还需要其他柱的天干十神也一致
    for (const { pillar: otherPillar, name: otherName } of otherPillars) {
      const otherStemTenGodType = getTenGodType(dayStemIdx, otherPillar.ganIdx);
      if (otherStemTenGodType === monthStemTenGodType) {
        const geName = `${monthStemTenGodName}格`;
        if (!geJuList.some(g => g.name === geName && g.rule === 1)) {
          geJuList.push({
            name: geName,
            tenGodName: monthStemTenGodName,
            pillarName: '月柱',
            rule: 1,
            description: `月柱天干${HEAVENLY_STEMS[monthStemIdx]}(${monthStemTenGodName})与月支${EARTHLY_BRANCHES[monthBranchIdx]}${rule1MatchPosition}${HEAVENLY_STEMS[rule1MatchHiddenStemIdx]}十神一致，且${otherName}天干${HEAVENLY_STEMS[otherPillar.ganIdx]}同为${monthStemTenGodName}`,
          });
        }
        break;
      }
    }
  }
  
  // ========== 规则2 ==========
  // 月柱地支自坐：本气十神 与 中气或余气十神一致
  if (monthBranchHiddenStems.length >= 2) {
    const mainStemIdx = monthBranchHiddenStems[0]; // 本气
    const mainTenGodType = getTenGodType(dayStemIdx, mainStemIdx);
    const mainTenGodName = TEN_GOD_NAMES[mainTenGodType];
    
    for (let i = 1; i < monthBranchHiddenStems.length; i++) {
      const subStemIdx = monthBranchHiddenStems[i];
      const subTenGodType = getTenGodType(dayStemIdx, subStemIdx);
      const positionName = i === 1 ? '中气' : '余气';
      
      if (subTenGodType === mainTenGodType) {
        const geName = `${mainTenGodName}格`;
        if (!geJuList.some(g => g.name === geName && g.rule === 2)) {
          geJuList.push({
            name: geName,
            tenGodName: mainTenGodName,
            pillarName: '月柱',
            rule: 2,
            description: `月支${EARTHLY_BRANCHES[monthBranchIdx]}本气${HEAVENLY_STEMS[mainStemIdx]}(${mainTenGodName})与${positionName}${HEAVENLY_STEMS[subStemIdx]}十神一致，自坐成格`,
          });
        }
        break;
      }
    }
  }
  
  // ========== 规则3 ==========
  // 月支本气十神 与 其他柱（年/日/时）天干十神一致
  if (monthBranchHiddenStems.length >= 1) {
    const mainStemIdx = monthBranchHiddenStems[0]; // 本气
    const mainTenGodType = getTenGodType(dayStemIdx, mainStemIdx);
    const mainTenGodName = TEN_GOD_NAMES[mainTenGodType];
    
    for (const { pillar: otherPillar, name: otherName } of otherPillars) {
      const otherStemTenGodType = getTenGodType(dayStemIdx, otherPillar.ganIdx);
      if (otherStemTenGodType === mainTenGodType) {
        const geName = `${mainTenGodName}格`;
        if (!geJuList.some(g => g.name === geName)) {
          geJuList.push({
            name: geName,
            tenGodName: mainTenGodName,
            pillarName: '月柱',
            rule: 1,
            description: `月支${EARTHLY_BRANCHES[monthBranchIdx]}本气${HEAVENLY_STEMS[mainStemIdx]}(${mainTenGodName})与${otherName}天干${HEAVENLY_STEMS[otherPillar.ganIdx]}同为${mainTenGodName}，成格`,
          });
        }
        break;
      }
    }
  }
  
  // ========== 规则4 ==========
  // 月支本气或中气十神 与 月柱天干十神一致
  const rule4CheckCount = Math.min(2, monthBranchHiddenStems.length); // 本气和中气
  for (let i = 0; i < rule4CheckCount; i++) {
    const hiddenStemIdx = monthBranchHiddenStems[i];
    const hiddenTenGodType = getTenGodType(dayStemIdx, hiddenStemIdx);
    const positionName = i === 0 ? '本气' : '中气';
    
    if (hiddenTenGodType === monthStemTenGodType) {
      const geName = `${monthStemTenGodName}格`;
      if (!geJuList.some(g => g.name === geName)) {
        geJuList.push({
          name: geName,
          tenGodName: monthStemTenGodName,
          pillarName: '月柱',
          rule: 1,
          description: `月支${EARTHLY_BRANCHES[monthBranchIdx]}${positionName}${HEAVENLY_STEMS[hiddenStemIdx]}(${TEN_GOD_NAMES[hiddenTenGodType]})与月柱天干${HEAVENLY_STEMS[monthStemIdx]}(${monthStemTenGodName})十神一致，成格`,
        });
      }
      break;
    }
  }
  
  const uniqueGeJu = new Map<string, GeJuInfo>();
  for (const ge of geJuList) {
    const key = ge.name;
    if (!uniqueGeJu.has(key)) {
      uniqueGeJu.set(key, ge);
    }
  }
  
  const finalList = Array.from(uniqueGeJu.values());
  
  // 生成总结
  let summary = '';
  let noPatternReason: string | undefined;
  
  if (finalList.length === 0) {
    summary = '无格';
    noPatternReason = '月柱天干与月支本气/中气十神不一致或缺乏其他柱天干支持，月支本气与中气/余气十神也不一致，故无明显格局成立。';
  } else if (finalList.length === 1) {
    summary = `${finalList[0].name}`;
  } else {
    const names = [...new Set(finalList.map(g => g.name))];
    summary = names.join('、');
  }
  
  return {
    hasGeJu: finalList.length > 0,
    geJuList: finalList,
    summary,
    noPatternReason,
  };
}

/**
 * 格式化格局分析结果用于显示
 */
export function formatGeJuResult(result: GeJuAnalysisResult): string {
  if (!result.hasGeJu) {
    return '无格';
  }
  
  const lines: string[] = [];
  for (const ge of result.geJuList) {
    const ruleDesc = ge.rule === 1 ? '有根' : '有气';
    lines.push(`【${ge.name}】(${ge.pillarName}·${ruleDesc})`);
    lines.push(`  ${ge.description}`);
  }
  
  return lines.join('\n');
}
