/**
 * 奇门时格检测 - 天显时格与五不遇时
 * 基于传统奇门遁甲时格理论
 */

import { FourPillars } from '@/types';

// 天干索引
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

export interface TianXianShiGeResult {
  isActive: boolean;
  hourPillar: string;    // 时柱名称
  timeRange: string;     // 北京时间范围
  effect: string;        // 能量特性
  advice: string;        // 宜做事项
}

export interface WuBuYuShiResult {
  isActive: boolean;
  dayGan: string;        // 日干
  hourGan: string;       // 时干
  hourZhi: string;       // 时支
  keRelation: string;    // 克应关系
}

export interface TimingPatternResult {
  tianXian: TianXianShiGeResult | null;
  wuBuYu: WuBuYuShiResult | null;
}

/**
 * 天显时格配置
 * 当日干遇特定时柱时，为吉时
 */
const TIAN_XIAN_CONFIG: Record<string, {
  hourPillar: string;
  timeRange: string;
  effect: string;
  advice: string;
}> = {
  // 甲日或己日 + 甲子时
  '甲_子': { hourPillar: '甲子时', timeRange: '23:00-01:00', effect: '新生之力', advice: '宜机密决策、祭祀' },
  '己_子': { hourPillar: '甲子时', timeRange: '23:00-01:00', effect: '新生之力', advice: '宜机密决策、祭祀' },
  // 甲日或己日 + 甲戌时
  '甲_戌': { hourPillar: '甲戌时', timeRange: '19:00-21:00', effect: '稳固之机', advice: '宜签约、婚嫁' },
  '己_戌': { hourPillar: '甲戌时', timeRange: '19:00-21:00', effect: '稳固之机', advice: '宜签约、婚嫁' },
  // 乙日或庚日 + 甲申时
  '乙_申': { hourPillar: '甲申时', timeRange: '15:00-17:00', effect: '变革之能', advice: '宜谈判、诉讼翻盘' },
  '庚_申': { hourPillar: '甲申时', timeRange: '15:00-17:00', effect: '变革之能', advice: '宜谈判、诉讼翻盘' },
  // 丙日或辛日 + 甲午时
  '丙_午': { hourPillar: '甲午时', timeRange: '11:00-13:00', effect: '鼎盛阳气', advice: '宜开业、求财' },
  '辛_午': { hourPillar: '甲午时', timeRange: '11:00-13:00', effect: '鼎盛阳气', advice: '宜开业、求财' },
  // 丁日或壬日 + 甲辰时
  '丁_辰': { hourPillar: '甲辰时', timeRange: '07:00-09:00', effect: '生机涌动', advice: '宜出行、动土' },
  '壬_辰': { hourPillar: '甲辰时', timeRange: '07:00-09:00', effect: '生机涌动', advice: '宜出行、动土' },
  // 戊日或癸日 + 甲寅时
  '戊_寅': { hourPillar: '甲寅时', timeRange: '03:00-05:00', effect: '暗藏玄机', advice: '宜修炼、重大决策' },
  '癸_寅': { hourPillar: '甲寅时', timeRange: '03:00-05:00', effect: '暗藏玄机', advice: '宜修炼、重大决策' },
};

/**
 * 五不遇时配置
 * 时干克日干，且同阴阳（无情之克）
 */
const WU_BU_YU_CONFIG: Record<string, {
  hourGan: string;
  hourZhi: string;
  keRelation: string;
}> = {
  '甲': { hourGan: '庚', hourZhi: '午', keRelation: '庚金克甲木（阳克阳）' },
  '乙': { hourGan: '辛', hourZhi: '巳', keRelation: '辛金克乙木（阴克阴）' },
  '丙': { hourGan: '壬', hourZhi: '辰', keRelation: '壬水克丙火（阳克阳）' },
  '丁': { hourGan: '癸', hourZhi: '卯', keRelation: '癸水克丁火（阴克阴）' },
  '戊': { hourGan: '甲', hourZhi: '寅', keRelation: '甲木克戊土（阳克阳）' },
  '己': { hourGan: '乙', hourZhi: '丑', keRelation: '乙木克己土（阴克阴）' },
  '庚': { hourGan: '丙', hourZhi: '子', keRelation: '丙火克庚金（阳克阳）' },
  '辛': { hourGan: '丁', hourZhi: '亥', keRelation: '丁火克辛金（阴克阴）' },
  '壬': { hourGan: '戊', hourZhi: '申', keRelation: '戊土克壬水（阳克阳）' },
  '癸': { hourGan: '己', hourZhi: '未', keRelation: '己土克癸水（阴克阴）' },
};

/**
 * 检测天显时格
 */
export function checkTianXianShiGe(pillars: FourPillars): TianXianShiGeResult | null {
  const dayGan = pillars.day.gan;
  const hourZhi = pillars.hour.zhi;
  
  // 天显时格需要时干为甲
  if (pillars.hour.gan !== '甲') {
    return null;
  }
  
  const key = `${dayGan}_${hourZhi}`;
  const config = TIAN_XIAN_CONFIG[key];
  
  if (config) {
    return {
      isActive: true,
      hourPillar: config.hourPillar,
      timeRange: config.timeRange,
      effect: config.effect,
      advice: config.advice,
    };
  }
  
  return null;
}

/**
 * 检测五不遇时
 */
export function checkWuBuYuShi(pillars: FourPillars): WuBuYuShiResult | null {
  const dayGan = pillars.day.gan;
  const hourGan = pillars.hour.gan;
  const hourZhi = pillars.hour.zhi;
  
  const config = WU_BU_YU_CONFIG[dayGan];
  
  if (config && hourGan === config.hourGan && hourZhi === config.hourZhi) {
    return {
      isActive: true,
      dayGan,
      hourGan,
      hourZhi,
      keRelation: config.keRelation,
    };
  }
  
  return null;
}

/**
 * 综合检测时格
 */
export function checkTimingPatterns(pillars: FourPillars): TimingPatternResult {
  return {
    tianXian: checkTianXianShiGe(pillars),
    wuBuYu: checkWuBuYuShi(pillars),
  };
}
