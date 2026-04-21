/**
 * 天地门户计算模块
 * 包含：月将十二神、建除十二神、四门户（天门、地户、人门、鬼门）
 * 使用"月将随局飞布"方法
 */

import { EARTHLY_BRANCHES } from './constants';
import { Solar } from 'lunar-javascript';

// 十二月将（按地支顺序：子丑寅卯辰巳午未申酉戌亥）
// 十二月将与地支对应：从魁酉、河魁戌、登明亥、神后子、大吉丑、功曹寅、太冲卯、天罡辰、太乙巳、胜光午、小吉未、传送申
export const TWELVE_GENERALS = ['神后', '大吉', '功曹', '太冲', '天罡', '太乙', '胜光', '小吉', '传送', '从魁', '河魁', '登明'];

// 建除十二神
export const JIAN_CHU_SPIRITS = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];

// 宫位与地支的映射（用于显示）
export const PALACE_BRANCH_MAP: Record<number, number[]> = {
  1: [0],        // 坎 - 子
  8: [1, 2],     // 艮 - 丑寅
  3: [3],        // 震 - 卯
  4: [4, 5],     // 巽 - 辰巳
  9: [6],        // 离 - 午
  2: [7, 8],     // 坤 - 未申
  7: [9],        // 兑 - 酉
  6: [10, 11],   // 乾 - 戌亥
  5: [],         // 中宫
};

// 洛书九宫飞布顺序（不含中宫5）
const LUO_SHU_RING = [1, 8, 3, 4, 9, 2, 7, 6];

// 中气与月将对应表（御定奇门宝鉴）
// 月将以中气为准，过中气换将
// 中气顺序：雨水、春分、谷雨、小满、夏至、大暑、处暑、秋分、霜降、小雪、冬至、大寒
export const ZHONG_QI_GENERAL_MAP: { zhongQi: string; branchIdx: number; generalName: string }[] = [
  { zhongQi: '雨水', branchIdx: 11, generalName: '登明' },   // 正月中 -> 亥将
  { zhongQi: '春分', branchIdx: 10, generalName: '河魁' },   // 二月中 -> 戌将
  { zhongQi: '谷雨', branchIdx: 9, generalName: '从魁' },    // 三月中 -> 酉将
  { zhongQi: '小满', branchIdx: 8, generalName: '传送' },    // 四月中 -> 申将
  { zhongQi: '夏至', branchIdx: 7, generalName: '小吉' },    // 五月中 -> 未将
  { zhongQi: '大暑', branchIdx: 6, generalName: '胜光' },    // 六月中 -> 午将
  { zhongQi: '处暑', branchIdx: 5, generalName: '太乙' },    // 七月中 -> 巳将
  { zhongQi: '秋分', branchIdx: 4, generalName: '天罡' },    // 八月中 -> 辰将
  { zhongQi: '霜降', branchIdx: 3, generalName: '太冲' },    // 九月中 -> 卯将
  { zhongQi: '小雪', branchIdx: 2, generalName: '功曹' },    // 十月中 -> 寅将
  { zhongQi: '冬至', branchIdx: 1, generalName: '大吉' },    // 十一月中 -> 丑将
  { zhongQi: '大寒', branchIdx: 0, generalName: '神后' },    // 十二月中 -> 子将
];

// 所有中气名称（用于判断是否为中气）
const ZHONG_QI_NAMES = ['雨水', '春分', '谷雨', '小满', '夏至', '大暑', '处暑', '秋分', '霜降', '小雪', '冬至', '大寒'];

/**
 * 根据日期精确计算当前节气和月将
 * 使用 lunar-javascript 库的 getJieQiTable 获取年度节气表
 * @param date 日期
 * @returns { jieQi: 当前节气, zhongQi: 当前生效的中气, monthlyGeneral: 月将信息 }
 */
export function getJieQiAndMonthlyGeneral(date: Date): {
  jieQi: string;
  zhongQi: string;
  monthlyGeneral: { name: string; branch: string; branchIdx: number };
} {
  try {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    const year = solar.getYear();
    
    // 获取当前所在的节气
    const currentJieQi = lunar.getJieQi() || '';
    
    // 获取当前节气（如果不在节气当天，则取上一个节气）
    let activeJieQi = currentJieQi;
    if (!activeJieQi) {
      const prevJQ = lunar.getPrevJieQi();
      activeJieQi = prevJQ?.getName() || '';
    }
    
    // 获取该年和前一年的节气表，找出所有中气
    const jieQiTable: Record<string, Solar> = {
      ...Solar.fromYmd(year - 1, 1, 1).getLunar().getJieQiTable(),
      ...lunar.getJieQiTable(),
    };
    
    // 过滤出所有中气，并按日期排序
    const zhongQiList: { name: string; date: Date }[] = [];
    for (const [name, solarDate] of Object.entries(jieQiTable)) {
      if (ZHONG_QI_NAMES.includes(name) && solarDate) {
        zhongQiList.push({
          name,
          date: new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay()),
        });
      }
    }
    zhongQiList.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // 找出当前日期之前最近的中气
    let prevZhongQi = '';
    const targetTime = date.getTime();
    for (let i = zhongQiList.length - 1; i >= 0; i--) {
      if (zhongQiList[i].date.getTime() <= targetTime) {
        prevZhongQi = zhongQiList[i].name;
        break;
      }
    }
    
    // 根据中气查找月将
    const zhongQiInfo = ZHONG_QI_GENERAL_MAP.find(z => z.zhongQi === prevZhongQi);
    const branchIdx = zhongQiInfo?.branchIdx ?? 8; // 默认传送申
    
    return {
      jieQi: activeJieQi,
      zhongQi: prevZhongQi,
      monthlyGeneral: {
        name: TWELVE_GENERALS[branchIdx],
        branch: EARTHLY_BRANCHES[branchIdx],
        branchIdx,
      },
    };
  } catch (e) {
    console.warn('Failed to calculate JieQi and MonthlyGeneral', e);
    return {
      jieQi: '',
      zhongQi: '',
      monthlyGeneral: {
        name: TWELVE_GENERALS[8],
        branch: EARTHLY_BRANCHES[8],
        branchIdx: 8,
      },
    };
  }
}

/**
 * 根据农历月份获取月将及对应节气（兼容旧接口）
 * @param lunarMonth 农历月份 1-12
 * @returns 月将信息 { name, branch, branchIdx, solarTerm }
 */
export function getMonthlyGeneral(lunarMonth: number): { name: string; branch: string; branchIdx: number; solarTerm: string } {
  // 农历月份 -> 月将地支索引（简化映射）
  const LUNAR_MONTH_GENERALS: Record<number, number> = {
    1: 11,  // 正月 -> 登明(亥)
    2: 10,  // 二月 -> 河魁(戌)
    3: 9,   // 三月 -> 从魁(酉)
    4: 8,   // 四月 -> 传送(申)
    5: 7,   // 五月 -> 小吉(未)
    6: 6,   // 六月 -> 胜光(午)
    7: 5,   // 七月 -> 太乙(巳)
    8: 4,   // 八月 -> 天罡(辰)
    9: 3,   // 九月 -> 太冲(卯)
    10: 2,  // 十月 -> 功曹(寅)
    11: 1,  // 十一月 -> 大吉(丑)
    12: 0,  // 十二月 -> 神后(子)
  };
  
  const branchIdx = LUNAR_MONTH_GENERALS[lunarMonth] ?? 0;
  const termInfo = ZHONG_QI_GENERAL_MAP.find(t => t.branchIdx === branchIdx);
  return {
    name: TWELVE_GENERALS[branchIdx],
    branch: EARTHLY_BRANCHES[branchIdx],
    branchIdx,
    solarTerm: termInfo?.zhongQi ?? '',
  };
}

// 地支到宫位的映射（用于月将加临时支）
const BRANCH_TO_PALACE: Record<number, number> = {
  0: 1,   // 子 -> 坎1
  1: 8,   // 丑 -> 艮8
  2: 8,   // 寅 -> 艮8
  3: 3,   // 卯 -> 震3
  4: 4,   // 辰 -> 巽4
  5: 4,   // 巳 -> 巽4
  6: 9,   // 午 -> 离9
  7: 2,   // 未 -> 坤2
  8: 2,   // 申 -> 坤2
  9: 7,   // 酉 -> 兑7
  10: 6,  // 戌 -> 乾6
  11: 6,  // 亥 -> 乾6
};

/**
 * 月将加临时支法
 * 月将从时柱地支所在的宫位开始，按洛书轨迹飞布
 * @param hourBranchIdx 时柱地支索引 0-11
 * @param monthlyGeneralBranchIdx 月将地支索引 0-11
 * @returns 每个宫位上的地支索引列表 Record<palaceId, branchIdx[]>
 */
export function calculateGeneralPositionsByHourBranch(
  hourBranchIdx: number,
  monthlyGeneralBranchIdx: number
): Record<number, number[]> {
  // 洛书飞布顺序（不含中宫5）
  const LUO_SHU_SEQUENCE = [1, 8, 3, 4, 9, 2, 7, 6];
  
  // 起跳宫位：时支所在的宫位
  const startPalace = BRANCH_TO_PALACE[hourBranchIdx] ?? 1;
  
  // 找到起跳宫位在洛书序列中的位置
  const startIdx = LUO_SHU_SEQUENCE.indexOf(startPalace);
  if (startIdx === -1) {
    return { ...PALACE_BRANCH_MAP };
  }
  
  // 初始化结果
  const positions: Record<number, number[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
  };
  
  // 从月将地支开始，按洛书顺序飞布12个地支
  // 四正宫（1,3,7,9）各1个地支，四隅宫（2,4,6,8）各2个地支
  let branchOffset = 0;
  for (let i = 0; i < 8; i++) {
    const seqIdx = (startIdx + i) % 8;
    const palaceId = LUO_SHU_SEQUENCE[seqIdx];
    
    const isSiZheng = [1, 3, 7, 9].includes(palaceId);
    const branchCount = isSiZheng ? 1 : 2;
    
    for (let j = 0; j < branchCount; j++) {
      const branchIdx = (monthlyGeneralBranchIdx + branchOffset) % 12;
      positions[palaceId].push(branchIdx);
      branchOffset++;
    }
  }
  
  return positions;
}

/**
 * 兼容旧接口（使用固定宫位对应）
 */
export function calculateGeneralPositionsByJu(
  juNum: number,
  monthlyGeneralBranchIdx: number
): Record<number, number[]> {
  return { ...PALACE_BRANCH_MAP };
}

/**
 * 建除十二神（从月将地支起建，顺行十二支）
 * 例如：月将申，则申为建，酉为除，戌为满，亥为平...
 * @param branchIdx 地支索引 0-11
 * @param monthlyGeneralBranchIdx 月将地支索引 0-11
 * @returns 建除神索引 0-11
 */
export function getJianChuIndex(branchIdx: number, monthlyGeneralBranchIdx: number): number {
  // 从月将地支起建，顺行
  return (branchIdx - monthlyGeneralBranchIdx + 12) % 12;
}

/**
 * 计算建除十二神位置（从月将地支起建）
 * @param generalPositions 各宫位的地支列表
 * @param monthlyGeneralBranchIdx 月将地支索引
 * @returns 每个宫位上的建除神索引列表 Record<palaceId, spiritIdx[]>
 */
export function calculateJianChuByGenerals(
  generalPositions: Record<number, number[]>,
  monthlyGeneralBranchIdx: number
): Record<number, number[]> {
  const positions: Record<number, number[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
  };
  
  for (const [palaceIdStr, branches] of Object.entries(generalPositions)) {
    const palaceId = parseInt(palaceIdStr, 10);
    positions[palaceId] = branches.map(branchIdx => getJianChuIndex(branchIdx, monthlyGeneralBranchIdx));
  }
  
  return positions;
}

/**
 * 四门户定义
 * 天门：戌亥之间（乾宫6）
 * 地户：辰巳之间（巽宫4）
 * 人门：申未之间（坤宫2）
 * 鬼门：丑寅之间（艮宫8）
 */
export interface FourGates {
  tianMen: number; // 天门宫位
  diHu: number;    // 地户宫位
  renMen: number;  // 人门宫位
  guiMen: number;  // 鬼门宫位
}

export const FOUR_GATES: FourGates = {
  tianMen: 6,  // 乾宫 - 天门
  diHu: 4,     // 巽宫 - 地户
  renMen: 2,   // 坤宫 - 人门
  guiMen: 8,   // 艮宫 - 鬼门
};

/**
 * 获取宫位的四门户标识
 * @param palaceId 宫位ID
 * @returns 门户名称或null
 */
export function getGateName(palaceId: number): string | null {
  switch (palaceId) {
    case 6: return '天门';
    case 4: return '地户';
    case 2: return '人门';
    case 8: return '鬼门';
    default: return null;
  }
}

/**
 * 获取宫位上的月将和建除神（组合格式：门+月将名+地支+建除神）
 * 月将临时支法：建除随月将飞布，每个地支固定对应一个建除神
 * @param palaceId 宫位ID
 * @param palaceGeneralBranches 该宫位飞布的地支列表
 * @param palaceJianChuSpirits 该宫位的建除神索引列表
 * @param doorName 该宫位的门名称
 * @returns { entries: Array<{ door: string, general: string, branch: string, jianChu: string }> }
 */
export function getPalaceSpirits(
  palaceId: number,
  palaceGeneralBranches: number[],
  palaceJianChuSpirits: number[],
  doorName: string
): { entries: Array<{ door: string; general: string; branch: string; jianChu: string }> } {
  const entries = palaceGeneralBranches.map((branchIdx, idx) => {
    const spiritIdx = palaceJianChuSpirits[idx] ?? 0;
    return {
      // 只在第一个条目显示门名，避免重复
      door: idx === 0 ? (doorName?.charAt(0) || '') : '',
      general: TWELVE_GENERALS[branchIdx] || '',
      branch: EARTHLY_BRANCHES[branchIdx],
      jianChu: JIAN_CHU_SPIRITS[spiritIdx] || '',
    };
  });
  
  return { entries };
}

export interface TianDiMenHuData {
  // 月将信息
  monthlyGeneral: { name: string; branch: string; branchIdx: number };
  // 节气信息
  jieQi: string;
  zhongQi: string;
  // 每个宫位飞布的地支列表 Record<palaceId, branchIdx[]>
  generalPositions: Record<number, number[]>;
  // 每个宫位的建除神索引列表 Record<palaceId, spiritIdx[]>
  jianChuPositions: Record<number, number[]>;
  // 四门户
  fourGates: FourGates;
}

/**
 * 计算完整的天地门户数据（月将加临时支法）
 * @param date 日期
 * @param hourBranchIdx 时柱地支索引 0-11
 * @param juNum 局数 1-9（暂未使用）
 * @param yinYang 阴阳局（暂未使用）
 */
export function calculateTianDiMenHuByDate(
  date: Date,
  hourBranchIdx: number,
  juNum: number,
  yinYang: 'Yin' | 'Yang'
): TianDiMenHuData {
  const jieQiInfo = getJieQiAndMonthlyGeneral(date);
  // 月将加临时支：从时支所在宫位开始飞布
  const generalPositions = calculateGeneralPositionsByHourBranch(hourBranchIdx, jieQiInfo.monthlyGeneral.branchIdx);
  // 建除从月将地支起建，顺行
  const jianChuPositions = calculateJianChuByGenerals(generalPositions, jieQiInfo.monthlyGeneral.branchIdx);
  
  return {
    monthlyGeneral: jieQiInfo.monthlyGeneral,
    jieQi: jieQiInfo.jieQi,
    zhongQi: jieQiInfo.zhongQi,
    generalPositions,
    jianChuPositions,
    fourGates: FOUR_GATES,
  };
}

/**
 * 计算完整的天地门户数据（兼容旧接口，使用农历月份近似）
 * @param lunarMonth 农历月份
 * @param juNum 局数 1-9
 * @param yinYang 阴阳局
 */
export function calculateTianDiMenHu(
  lunarMonth: number,
  juNum: number,
  yinYang: 'Yin' | 'Yang'
): TianDiMenHuData {
  const monthlyGeneral = getMonthlyGeneral(lunarMonth);
  const generalPositions = calculateGeneralPositionsByJu(juNum, monthlyGeneral.branchIdx);
  // 建除从月将地支起建，顺行
  const jianChuPositions = calculateJianChuByGenerals(generalPositions, monthlyGeneral.branchIdx);
  
  return {
    monthlyGeneral: {
      name: monthlyGeneral.name,
      branch: monthlyGeneral.branch,
      branchIdx: monthlyGeneral.branchIdx,
    },
    jieQi: '',
    zhongQi: monthlyGeneral.solarTerm,
    generalPositions,
    jianChuPositions,
    fourGates: FOUR_GATES,
  };
}
