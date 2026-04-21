import { HEAVENLY_STEMS, EARTHLY_BRANCHES, ZODIACS } from './constants';
import { GanZhi, FourPillars, Gender, BigCycle, AnnualCycle } from '@/types';
import { getBeijingParts } from '@/lib/time/beijing';
import { Solar } from 'lunar-javascript';

// ---- helpers to convert a Chinese stem/branch character to index ----
const ganToIdx = (g: string): number => HEAVENLY_STEMS.indexOf(g);
const zhiToIdx = (z: string): number => EARTHLY_BRANCHES.indexOf(z);

const parseGanZhi = (gz: string): GanZhi => {
  const gan = gz[0];
  const zhi = gz[1];
  return { gan, zhi, ganIdx: ganToIdx(gan), zhiIdx: zhiToIdx(zhi) };
};

/**
 * 获取某年立春的精确日期（使用 lunar-javascript 天文算法）
 */
const getLiChunDate = (year: number): { month: number; day: number } => {
  const solar = Solar.fromYmd(year, 2, 1);
  const lunar = solar.getLunar();
  const table = lunar.getJieQiTable();
  const liChun = table['立春'];
  if (liChun) {
    return { month: liChun.getMonth(), day: liChun.getDay() };
  }
  return { month: 2, day: 4 };
};

/**
 * 获取某日期对应的农历年（考虑立春）
 */
export const getLunarYear = (year: number, month: number, day: number): number => {
  const lc = getLiChunDate(year);
  if (month < lc.month || (month === lc.month && day < lc.day)) {
    return year - 1;
  }
  return year;
};

/**
 * Calculates accurate Year GanZhi respecting Li Chun (precise astronomical date)
 */
export const getYearGanZhi = (date: Date): GanZhi => {
  const parts = getBeijingParts(date);
  const solar = Solar.fromYmdHms(parts.year, parts.month, parts.day, parts.hour, parts.minute, 0);
  const ec = solar.getLunar().getEightChar();
  return parseGanZhi(ec.getYear());
};

/**
 * Calculates Month GanZhi based on precise solar terms (Jie Qi) – minute-level precision
 */
export const getMonthGanZhi = (date: Date, _yearGanIdx?: number): GanZhi => {
  const parts = getBeijingParts(date);
  const solar = Solar.fromYmdHms(parts.year, parts.month, parts.day, parts.hour, parts.minute, 0);
  const ec = solar.getLunar().getEightChar();
  return parseGanZhi(ec.getMonth());
};

export const getDayGanZhi = (date: Date): GanZhi => {
  const parts = getBeijingParts(date);
  const solar = Solar.fromYmdHms(parts.year, parts.month, parts.day, parts.hour, parts.minute, 0);
  const ec = solar.getLunar().getEightChar();
  return parseGanZhi(ec.getDay());
};

export const getHourGanZhi = (date: Date, _dayGanIdx?: number): GanZhi => {
  const parts = getBeijingParts(date);
  const solar = Solar.fromYmdHms(parts.year, parts.month, parts.day, parts.hour, parts.minute, 0);
  const ec = solar.getLunar().getEightChar();
  return parseGanZhi(ec.getTime());
};

/**
 * 使用 lunar-javascript 的 getEightChar() 精确计算四柱
 * 精确到分钟级别的节气交接判定
 * 自动处理子时（早子/晚子）、跨年立春等边界情况
 */
export const getFourPillars = (date: Date): FourPillars => {
  const parts = getBeijingParts(date);
  const solar = Solar.fromYmdHms(parts.year, parts.month, parts.day, parts.hour, parts.minute, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  const year = parseGanZhi(ec.getYear());
  const month = parseGanZhi(ec.getMonth());
  const hour = parseGanZhi(ec.getTime());

  // 晚子时 (23:00-23:59)：日柱用次日
  let day: GanZhi;
  if (parts.hour === 23) {
    // Use JS Date to safely handle month/year rollover (e.g. day 31 + 1)
    const nextDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1));
    const nextDaySolar = Solar.fromYmdHms(
      nextDate.getUTCFullYear(), nextDate.getUTCMonth() + 1, nextDate.getUTCDate(), 0, 0, 0
    );
    const nextDayEc = nextDaySolar.getLunar().getEightChar();
    day = parseGanZhi(nextDayEc.getDay());
  } else {
    day = parseGanZhi(ec.getDay());
  }

  return { year, month, day, hour };
};

export const getZodiac = (zhiIdx: number): string => {
  return ZODIACS[zhiIdx];
};

/**
 * 计算命卦（八宅风水）
 * 男命：(100 - 年份后两位) % 9，结果为5则改为2（坤）
 * 女命：(年份后两位 - 4) % 9，结果为5则改为8（艮）
 * 2000年后出生的调整公式
 */
const MING_GUA_NAMES = ['', '坎', '坤', '震', '巽', '', '乾', '兑', '艮', '离'];

export const calculateMingGua = (year: number, gender: Gender): { gua: number; name: string } => {
  let yearSum = 0;
  const yearStr = year.toString();
  for (const digit of yearStr) {
    yearSum += parseInt(digit);
  }
  // 继续将数字相加直到得到个位数
  while (yearSum >= 10) {
    let temp = 0;
    while (yearSum > 0) {
      temp += yearSum % 10;
      yearSum = Math.floor(yearSum / 10);
    }
    yearSum = temp;
  }

  let gua: number;
  if (gender === Gender.MALE) {
    if (year < 2000) {
      gua = (10 - yearSum) % 9;
    } else {
      gua = (9 - yearSum) % 9;
    }
    if (gua === 0) gua = 9;
    if (gua === 5) gua = 2; // 男命5改为2（坤）
  } else {
    if (year < 2000) {
      gua = (yearSum + 5) % 9;
    } else {
      gua = (yearSum + 6) % 9;
    }
    if (gua === 0) gua = 9;
    if (gua === 5) gua = 8; // 女命5改为8（艮）
  }

  return { gua, name: MING_GUA_NAMES[gua] || '' };
};

/**
 * Accurate Ten Gods relationship label logic (2-character)
 * Based on Five Elements (五行) and Yin/Yang (阴阳) relationships
 */

// 天干对应的五行：甲乙-木(0), 丙丁-火(1), 戊己-土(2), 庚辛-金(3), 壬癸-水(4)
const STEM_ELEMENTS = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]; // 木火土金水

// 地支本气藏干索引：子-癸(9), 丑-己(5), 寅-甲(0), 卯-乙(1), 辰-戊(4), 
// 巳-丙(2), 午-丁(3), 未-己(5), 申-庚(6), 酉-辛(7), 戌-戊(4), 亥-壬(8)
const BRANCH_MAIN_STEM = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8];

// 天干的阴阳：偶数(0,2,4,6,8)为阳，奇数(1,3,5,7,9)为阴
const isYangStem = (idx: number) => idx % 2 === 0;

export const getTenGodsSingleLabel = (selfStemIdx: number, targetStemIdx: number): string => {
  const selfElement = STEM_ELEMENTS[selfStemIdx];
  const targetElement = STEM_ELEMENTS[targetStemIdx];
  const selfIsYang = isYangStem(selfStemIdx);
  const targetIsYang = isYangStem(targetStemIdx);
  const samePolarity = selfIsYang === targetIsYang; // 阴阳相同
  
  // 五行生克关系 (相生: 木->火->土->金->水->木, 相克: 木->土->水->火->金->木)
  // elementDiff: 0=同我, 1=我生, 2=我克, 3=克我, 4=生我
  const elementDiff = (targetElement - selfElement + 5) % 5;
  
  switch (elementDiff) {
    case 0: // 同我（比劫）
      return samePolarity ? "比" : "劫";
    case 1: // 我生（食伤）
      return samePolarity ? "食" : "伤";
    case 2: // 我克（财才）- 同性为才，异性为财
      return samePolarity ? "才" : "财";
    case 3: // 克我（官杀）- 同性为杀，异性为官
      return samePolarity ? "杀" : "官";
    case 4: // 生我（印枭）- 同性为枭，异性为印
      return samePolarity ? "枭" : "印";
    default:
      return "";
  }
};

const getTenGodsLabel = (dayStemIdx: number, targetStemIdx: number, targetZhiIdx: number): string => {
  // 天干十神
  const stemLabel = getTenGodsSingleLabel(dayStemIdx, targetStemIdx);
  
  // 地支十神：使用地支本气藏干来计算
  const branchMainStem = BRANCH_MAIN_STEM[targetZhiIdx % 12];
  const branchLabel = getTenGodsSingleLabel(dayStemIdx, branchMainStem);
  
  return stemLabel + branchLabel;
};

/**
 * 12 节（Jie）名称，按月序排列（用于大运起运计算）
 */
const JIE_NAMES = [
  '小寒', '立春', '惊蛰', '清明', '立夏', '芒种',
  '小暑', '立秋', '白露', '寒露', '立冬', '大雪'
];


/**
 * 获取某年所有12个"节"的精确 Date 对象（用于大运起运计算）
 */
const getSolarJieDates = (year: number): Date[] => {
  const solar = Solar.fromYmd(year, 7, 1);
  const lunar = solar.getLunar();
  const table = lunar.getJieQiTable();
  
  return JIE_NAMES.map(name => {
    const d = table[name];
    if (d) {
      return new Date(d.getYear(), d.getMonth() - 1, d.getDay());
    }
    // fallback
    return new Date(year, 0, 1);
  });
};

export const calculateCycles = (date: Date, gender: Gender, pillars: FourPillars): { big: BigCycle[], annual: AnnualCycle[] } => {
  const isYangYear = pillars.year.ganIdx % 2 === 0;
  const isForward = (gender === Gender.MALE && isYangYear) || (gender === Gender.FEMALE && !isYangYear);
  
  // 1. Calculate Accurate Start Age
  // Rule: 3 days = 1 year
  const currentYear = getBeijingParts(date).year;
  const jieDates = getSolarJieDates(currentYear);
  // Also get prev/next year's Jie for overlaps
  const nextJieDates = getSolarJieDates(currentYear + 1);
  const prevJieDates = getSolarJieDates(currentYear - 1);
  const allJie = [...prevJieDates, ...jieDates, ...nextJieDates].sort((a,b) => a.getTime() - b.getTime());

  let targetJie: Date;
  if (isForward) {
    targetJie = allJie.find(d => d.getTime() > date.getTime()) || allJie[allJie.length-1];
  } else {
    const reversed = [...allJie].reverse();
    targetJie = reversed.find(d => d.getTime() < date.getTime()) || allJie[0];
  }

  const diffMs = Math.abs(targetJie.getTime() - date.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const startAge = Math.max(1, Math.round(diffDays / 3));

  const birthYear = getBeijingParts(date).year;
  const big: BigCycle[] = [];

  // Column 0: Birth Year (Month Pillar)
  big.push({
    year: birthYear,
    gan: pillars.month.gan,
    zhi: pillars.month.zhi,
    desc: getTenGodsLabel(pillars.day.ganIdx, pillars.month.ganIdx, pillars.month.zhiIdx)
  });

  // Columns 1-9: Big Cycles starting from Start Age
  let currentStemIdx = pillars.month.ganIdx;
  let currentBranchIdx = pillars.month.zhiIdx;

  for (let i = 0; i < 9; i++) {
    if (isForward) {
      currentStemIdx = (currentStemIdx + 1) % 10;
      currentBranchIdx = (currentBranchIdx + 1) % 12;
    } else {
      currentStemIdx = (currentStemIdx - 1 + 10) % 10;
      currentBranchIdx = (currentBranchIdx - 1 + 12) % 12;
    }
    
    big.push({
      year: birthYear + startAge + (i * 10),
      gan: HEAVENLY_STEMS[currentStemIdx],
      zhi: EARTHLY_BRANCHES[currentBranchIdx],
      desc: getTenGodsLabel(pillars.day.ganIdx, currentStemIdx, currentBranchIdx)
    });
  }

  // Annual Cycles - 为每个大运生成对应的10年流年
  const annual: AnnualCycle[] = [];
  
  // 从出生年开始，为每个大运周期生成流年
  for (let cycleIdx = 0; cycleIdx < big.length; cycleIdx++) {
    const cycleStartYear = big[cycleIdx].year;
    const cycleEndYear = cycleIdx < big.length - 1 ? big[cycleIdx + 1].year : cycleStartYear + 10;
    
    for (let year = cycleStartYear; year < cycleEndYear; year++) {
      const offset = year - 1984;
      let ganIdx = (0 + offset) % 10;
      let zhiIdx = (0 + offset) % 12;
      if (ganIdx < 0) ganIdx += 10;
      if (zhiIdx < 0) zhiIdx += 12;
      
      annual.push({
        year,
        gan: HEAVENLY_STEMS[ganIdx],
        zhi: EARTHLY_BRANCHES[zhiIdx],
        age: year - birthYear,
        desc: getTenGodsLabel(pillars.day.ganIdx, ganIdx, zhiIdx)
      });
    }
  }

  return { big, annual };
};
