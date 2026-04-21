/**
 * 拆补法定局 - 按照《神奇之门》标准实现
 * 
 * 核心算法：
 * 1. 确定当前节气（用 lunar-javascript 的 getPrevJieQi）
 * 2. 用日干支推符头（往前推到最近的甲或己日）
 * 3. 根据符头地支定上中下元：
 *    - 子午卯酉 → 上元
 *    - 寅申巳亥 → 中元
 *    - 辰戌丑未 → 下元
 * 4. 查节气局数表，取对应元的局数
 */

import { Solar } from 'lunar-javascript';

// Complete simplified-to-traditional mapping for solar term names
const S2T_MAP: Record<string, string> = {
  '谷雨': '穀雨',
  '惊蛰': '驚蟄',
  '处暑': '處暑',
  '芒种': '芒種',
  '小满': '小滿',
};

function s2t(str: string): string {
  let result = str;
  for (const [simplified, traditional] of Object.entries(S2T_MAP)) {
    result = result.replace(new RegExp(simplified, 'g'), traditional);
  }
  return result;
}

interface JieQiConfig {
  yang: boolean;
  ju: number[];
}

interface ChaiBuResult {
  jieQiName: string;
  yuan: number;
  yuanName: string;
  isYang: boolean;
  yinYang: '陽' | '陰';
  gameNumber: number;
  fuTou: string; // 符头干支
}

/**
 * 地支分组，用于判断上中下元
 * 子午卯酉 → 上元 (0)
 * 寅申巳亥 → 中元 (1)  
 * 辰戌丑未 → 下元 (2)
 */
const BRANCH_YUAN_MAP: Record<number, number> = {
  0: 0,   // 子 → 上元
  1: 2,   // 丑 → 下元
  2: 1,   // 寅 → 中元
  3: 0,   // 卯 → 上元
  4: 2,   // 辰 → 下元
  5: 1,   // 巳 → 中元
  6: 0,   // 午 → 上元
  7: 2,   // 未 → 下元
  8: 1,   // 申 → 中元
  9: 0,   // 酉 → 上元
  10: 2,  // 戌 → 下元
  11: 1,  // 亥 → 中元
};

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 根据日干支推算符头
 * 符头 = 往前推到最近的甲日或己日
 * 
 * @param dayGanIdx 日天干索引 (0-9)
 * @param dayZhiIdx 日地支索引 (0-11)
 * @returns 符头的干支信息
 */
function findFuTou(dayGanIdx: number, dayZhiIdx: number): { ganIdx: number; zhiIdx: number; name: string } {
  // 从当前日干往前推到最近的甲(0)或己(5)
  let stepsBack = 0;
  let ganIdx = dayGanIdx;
  
  while (ganIdx !== 0 && ganIdx !== 5) {
    ganIdx = (ganIdx - 1 + 10) % 10;
    stepsBack++;
  }
  
  // 地支同步回退
  const zhiIdx = ((dayZhiIdx - stepsBack) % 12 + 12) % 12;
  
  return {
    ganIdx,
    zhiIdx,
    name: HEAVENLY_STEMS[ganIdx] + EARTHLY_BRANCHES[zhiIdx]
  };
}

export function calculateJuByChaiBuFixed(
  solar: ReturnType<typeof Solar.fromYmdHms>,
  jieQiJuShu: Record<string, JieQiConfig>,
  yuanNames: readonly string[]
): ChaiBuResult {
  const lunar = solar.getLunar();

  // 1. Get the current solar term (previous JieQi)
  const currentJieQi = lunar.getPrevJieQi();
  const jieQiName = s2t(currentJieQi.getName());

  // 2. Get day pillar's Gan and Zhi indices
  const dayGanZhi = lunar.getDayInGanZhi();
  const dayGan = dayGanZhi.charAt(0);
  const dayZhi = dayGanZhi.charAt(1);
  const dayGanIdx = HEAVENLY_STEMS.indexOf(dayGan);
  const dayZhiIdx = EARTHLY_BRANCHES.indexOf(dayZhi);

  // 3. Find 符头 (nearest 甲/己 day on or before current day)
  const fuTou = findFuTou(dayGanIdx, dayZhiIdx);

  // 4. Determine 元 from 符头's branch
  const yuan = BRANCH_YUAN_MAP[fuTou.zhiIdx];

  // 5. Look up ju number from the solar term's table
  const config = jieQiJuShu[jieQiName];
  if (!config) {
    throw new Error(`未知的節氣：${jieQiName}`);
  }

  return {
    jieQiName,
    yuan,
    yuanName: yuanNames[yuan],
    isYang: config.yang,
    yinYang: config.yang ? '陽' : '陰',
    gameNumber: config.ju[yuan],
    fuTou: fuTou.name,
  };
}

// ============================================================
// 置闰法定局 - 从节气起始日推符头，按固定15天周期分配上中下元
// ============================================================

/**
 * 从给定天干索引，往前推到最近的甲(0)或己(5)天需要多少天
 */
function findFuTouStepsForward(ganIdx: number): number {
  if (ganIdx === 0 || ganIdx === 5) return 0;
  const toJia = (10 - ganIdx) % 10;
  const toJi = (5 - ganIdx + 10) % 10;
  return Math.min(toJia, toJi);
}

/**
 * 计算两个日期之间的天数差 (date2 - date1)
 */
function daysBetween(y1: number, m1: number, d1: number, y2: number, m2: number, d2: number): number {
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  return Math.round((date2.getTime() - date1.getTime()) / 86400000);
}

/**
 * 获取某个节气起始日的符头信息（第一个甲/己日在节气开始当天或之后）
 */
function getJieQiFuTouInfo(jieQiSolar: { getYear(): number; getMonth(): number; getDay(): number }) {
  const jqSolar = Solar.fromYmdHms(
    jieQiSolar.getYear(), jieQiSolar.getMonth(), jieQiSolar.getDay(), 12, 0, 0
  );
  const jqLunar = jqSolar.getLunar();
  const dayGanZhi = jqLunar.getDayInGanZhi();
  const ganIdx = HEAVENLY_STEMS.indexOf(dayGanZhi.charAt(0));
  const zhiIdx = EARTHLY_BRANCHES.indexOf(dayGanZhi.charAt(1));
  const stepsForward = findFuTouStepsForward(ganIdx);

  // 用 JS Date 处理跨月/跨年的日期偏移
  const fuTouDate = new Date(jieQiSolar.getYear(), jieQiSolar.getMonth() - 1, jieQiSolar.getDay() + stepsForward);
  const fuTouGanIdx = (ganIdx + stepsForward) % 10;
  const fuTouZhiIdx = (zhiIdx + stepsForward) % 12;

  return {
    fuTouYear: fuTouDate.getFullYear(),
    fuTouMonth: fuTouDate.getMonth() + 1,
    fuTouDay: fuTouDate.getDate(),
    fuTouGanIdx,
    fuTouZhiIdx,
    fuTouName: HEAVENLY_STEMS[fuTouGanIdx] + EARTHLY_BRANCHES[fuTouZhiIdx],
  };
}

/**
 * 置闰法定局
 * 
 * 算法：
 * 1. 找到当前天文节气
 * 2. 从节气起始日推符头（节气当天或之后第一个甲/己日）
 * 3. 符头起每5天为一元：上元(0-4天)、中元(5-9天)、下元(10-14天)
 * 4. 若当前日在符头之前 → 属于上一个节气的延续（闰奇用下元）
 * 5. 若超过15天 → 闰奇，仍用当前节气的下元
 */
export function calculateJuByZhiRun(
  solar: ReturnType<typeof Solar.fromYmdHms>,
  jieQiJuShu: Record<string, JieQiConfig>,
  yuanNames: readonly string[]
): ChaiBuResult {
  const lunar = solar.getLunar();
  const currentY = solar.getYear();
  const currentM = solar.getMonth();
  const currentD = solar.getDay();

  // 获取当前天文节气
  const currentJieQi = lunar.getPrevJieQi();
  const jieQiSolar = currentJieQi.getSolar();
  const jieQiName = s2t(currentJieQi.getName());

  // 计算当前节气的符头
  const fuTou = getJieQiFuTouInfo(jieQiSolar);
  const daysDiff = daysBetween(fuTou.fuTouYear, fuTou.fuTouMonth, fuTou.fuTouDay, currentY, currentM, currentD);

  // 情况1：日期在当前节气符头的15天周期内
  if (daysDiff >= 0 && daysDiff < 15) {
    const yuan = Math.floor(daysDiff / 5); // 0=上, 1=中, 2=下
    const config = jieQiJuShu[jieQiName];
    if (!config) throw new Error(`未知的節氣：${jieQiName}`);
    return {
      jieQiName, yuan,
      yuanName: yuanNames[yuan],
      isYang: config.yang,
      yinYang: config.yang ? '陽' : '陰',
      gameNumber: config.ju[yuan],
      fuTou: fuTou.fuTouName,
    };
  }

  // 情况2：闰奇 - 超过15天但天文上仍在当前节气
  if (daysDiff >= 15) {
    const config = jieQiJuShu[jieQiName];
    if (!config) throw new Error(`未知的節氣：${jieQiName}`);
    return {
      jieQiName, yuan: 2,
      yuanName: yuanNames[2],
      isYang: config.yang,
      yinYang: config.yang ? '陽' : '陰',
      gameNumber: config.ju[2],
      fuTou: fuTou.fuTouName,
    };
  }

  // 情况3：daysDiff < 0，日期在当前节气符头之前
  // 回退到上一个节气的周期
  const prevDate = new Date(jieQiSolar.getYear(), jieQiSolar.getMonth() - 1, jieQiSolar.getDay() - 1);
  const prevSolar = Solar.fromYmdHms(prevDate.getFullYear(), prevDate.getMonth() + 1, prevDate.getDate(), 12, 0, 0);
  const prevLunar = prevSolar.getLunar();
  const prevJieQi = prevLunar.getPrevJieQi();
  const prevJieQiSolar = prevJieQi.getSolar();
  const prevJieQiName = s2t(prevJieQi.getName());

  const prevFuTou = getJieQiFuTouInfo(prevJieQiSolar);
  const prevDaysDiff = daysBetween(
    prevFuTou.fuTouYear, prevFuTou.fuTouMonth, prevFuTou.fuTouDay,
    currentY, currentM, currentD
  );

  const prevConfig = jieQiJuShu[prevJieQiName];
  if (!prevConfig) throw new Error(`未知的節氣：${prevJieQiName}`);

  if (prevDaysDiff >= 0 && prevDaysDiff < 15) {
    const yuan = Math.floor(prevDaysDiff / 5);
    return {
      jieQiName: prevJieQiName, yuan,
      yuanName: yuanNames[yuan],
      isYang: prevConfig.yang,
      yinYang: prevConfig.yang ? '陽' : '陰',
      gameNumber: prevConfig.ju[yuan],
      fuTou: prevFuTou.fuTouName,
    };
  }

  // 闰奇 - 上一个节气的下元延续
  return {
    jieQiName: prevJieQiName, yuan: 2,
    yuanName: yuanNames[2],
    isYang: prevConfig.yang,
    yinYang: prevConfig.yang ? '陽' : '陰',
    gameNumber: prevConfig.ju[2],
    fuTou: prevFuTou.fuTouName,
  };
}
