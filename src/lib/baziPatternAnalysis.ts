/**
 * BaZi Pattern Analysis (八字格局分析)
 * Calculates 通根 (rooting), 通气 (qi connection), and 成格 (pattern formation)
 */

import { FourPillars, GanZhi } from '@/types';
import { NORMAL_PATTERNS, NormalPatternInfo } from '@/data/baziPatternData';
import { TIAOHUO_TABLE, monthBranchToLunarMonth, LUNAR_MONTH_NAMES, STEM_NAME_TO_IDX, STEM_IDX_TO_NAME } from '@/data/tiaohouData';

// 天干
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干对应的五行：甲乙-木(0), 丙丁-火(1), 戊己-土(2), 庚辛-金(3), 壬癸-水(4)
export const STEM_ELEMENTS = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];

// 地支对应的五行
export const BRANCH_ELEMENTS = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

// 五行名称
export const ELEMENT_NAMES = ['木', '火', '土', '金', '水'];

// 地支藏干表 - 每个地支的本气、中气、余气 (stem indices)
export const BRANCH_HIDDEN_STEMS: Record<number, number[]> = {
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

// 藏干力量权重：本气100%，中气60%，余气40%
export const HIDDEN_STEM_WEIGHTS = [1.0, 0.6, 0.4];

// 月令对应的当令五行（司令）
export const MONTH_RULING_ELEMENT: Record<number, number> = {
  0: 4,  // 子月 - 水当令
  1: 2,  // 丑月 - 土当令
  2: 0,  // 寅月 - 木当令
  3: 0,  // 卯月 - 木当令
  4: 2,  // 辰月 - 土当令
  5: 1,  // 巳月 - 火当令
  6: 1,  // 午月 - 火当令
  7: 2,  // 未月 - 土当令
  8: 3,  // 申月 - 金当令
  9: 3,  // 酉月 - 金当令
  10: 2, // 戌月 - 土当令
  11: 4, // 亥月 - 水当令
};

// 天干的阴阳：偶数(0,2,4,6,8)为阳，奇数(1,3,5,7,9)为阴
export const isYangStem = (idx: number): boolean => idx % 2 === 0;

// 十神名称 (完整)
export const TEN_GOD_NAMES = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];

// 十神简称
export const TEN_GOD_SHORT = ['比', '劫', '食', '伤', '才', '财', '杀', '官', '枭', '印'];

/**
 * 计算十神类型 (0-9)
 */
export const getTenGodType = (selfStemIdx: number, targetStemIdx: number): number => {
  const selfElement = STEM_ELEMENTS[selfStemIdx];
  const targetElement = STEM_ELEMENTS[targetStemIdx];
  const samePolarity = isYangStem(selfStemIdx) === isYangStem(targetStemIdx);
  const elementDiff = (targetElement - selfElement + 5) % 5;
  
  // 0=比肩, 1=劫财, 2=食神, 3=伤官, 4=偏财, 5=正财, 6=七杀, 7=正官, 8=偏印, 9=正印
  const baseType = elementDiff * 2;
  return samePolarity ? baseType : baseType + 1;
};

/**
 * 获取十神简称
 */
export const getTenGodShort = (selfStemIdx: number, targetStemIdx: number): string => {
  const type = getTenGodType(selfStemIdx, targetStemIdx);
  return TEN_GOD_SHORT[type];
};

/**
 * 获取十神全称
 */
export const getTenGodName = (selfStemIdx: number, targetStemIdx: number): string => {
  const type = getTenGodType(selfStemIdx, targetStemIdx);
  return TEN_GOD_NAMES[type];
};

export interface RootInfo {
  branch: string;      // 地支
  branchIdx: number;   // 地支索引
  hiddenStem: string;  // 藏干
  hiddenStemIdx: number;
  weight: number;      // 力量权重 (1.0, 0.6, 0.4)
  position: string;    // 本气/中气/余气
  pillarName: string;  // 年/月/日/时
  isMonthBranch: boolean; // 是否是月令
  rootType: 'mainQi' | 'midQi' | 'residualQi'; // 通根类型
}

// 有气信息（印星生扶）
export interface QiSupportInfo {
  hasQi: boolean;           // 是否有气
  supportBranches: {
    branch: string;
    branchIdx: number;
    pillarName: string;
    element: number;
    elementName: string;
  }[];
  description: string;
}

// 透干信息
export interface TouGanInfo {
  isTouGan: boolean;        // 是否透干
  touGanStems: {
    stem: string;
    stemIdx: number;
    fromBranch: string;
    fromBranchIdx: number;
    pillarName: string;     // 透出的天干所在柱
    branchPillarName: string; // 藏干所在地支的柱
  }[];
  description: string;
}

// 根的受伤状态
export interface RootInjuryInfo {
  isInjured: boolean;
  injuryType?: 'chong' | 'xing' | 'hai' | 'po' | 'he';
  injuryName?: string;
  description?: string;
}

export interface StemAnalysis {
  stem: string;
  stemIdx: number;
  pillarName: string;
  element: number;
  elementName: string;
  tenGodType: number;
  tenGodName: string;
  tenGodShort: string;
  roots: RootInfo[];       // 通根信息
  totalRootStrength: number; // 通根总力量
  hasMonthRoot: boolean;   // 是否得月令通根
  isRooted: boolean;       // 是否通根（有根）
  hasMainQiRoot: boolean;  // 是否有本气通根
  hasMidQiRoot: boolean;   // 是否有中气通根
  hasResidualQiRoot: boolean; // 是否有余气通根
  qiSupport: QiSupportInfo; // 有气信息（印星生扶）
  touGan: TouGanInfo;       // 透干信息
  rootInjury: RootInjuryInfo; // 根受伤信息
  rootMeaning: string[];    // 有根/无根的命理表现
}

export interface PatternInfo {
  name: string;           // 格局名称
  description: string;    // 格局描述
  strength: 'strong' | 'medium' | 'weak'; // 成格强度
  mainGod: string;        // 主神
  isEstablished: boolean; // 是否成格
  failureReason?: string; // 不成格原因
}

export interface FavorableGod {
  element: number;        // 五行 (0-4)
  elementName: string;    // 五行名称
  stem?: string;          // 具体天干（如丙、丁），调候用神时使用
  tenGods: string[];      // 对应十神
  priority: number;       // 优先级 (1=第一喜用, 2=第二喜用, etc.)
  reason: string;         // 原因说明
  isWealth?: boolean;     // 是否为财神（调候用神同时为财）
}

// 神煞信息
export interface ShenShaInfo {
  name: string;           // 神煞名称
  type: 'auspicious' | 'inauspicious'; // 吉神/凶神
  description: string;    // 说明
  location: string;       // 位置（年柱/月柱/日柱/时柱）
  effect: string;         // 影响
}

// 特殊格局信息
export interface SpecialPatternInfo {
  name: string;           // 格局名称
  type: 'auspicious' | 'inauspicious'; // 吉格/凶格
  description: string;    // 说明
  conditions: string[];   // 成立条件
  isEstablished: boolean; // 是否成立
}

// 运势喜忌分析
export interface FortuneAnalysis {
  currentLuck: string;      // 当前运势总评
  favorableYears: string[]; // 喜用神年份
  unfavorableYears: string[]; // 忌神年份
  advices: string[];        // 建议
}

// 日主强弱分析详情
export interface DayMasterStrengthAnalysis {
  deLing: boolean;        // 得令 - 月令生扶日主
  deLingDesc: string;     // 得令说明
  deDi: boolean;          // 得地 - 日主在地支有根
  deDiDesc: string;       // 得地说明
  deDiRoots: RootInfo[];  // 得地通根
  deShi: boolean;         // 得势 - 天干地支多助力
  deShiDesc: string;      // 得势说明
  deShiCount: number;     // 得势助力数量
  strength: 'strong' | 'weak' | 'neutral'; // 最终判断
  strengthReason: string; // 判断依据
  strengthScore?: number; // 综合得分百分比 (0-100)
  subStrength?: 'leaning_strong' | 'balanced' | 'leaning_weak'; // 平和细分：偏强/平/偏弱
  subStrengthDesc?: string; // 细分说明
}

// 自坐信息（日干与日支关系）
export interface SelfSittingInfo {
  relationship: string;     // 关系名称（如"正财"、"偏印"等）
  element: number;          // 日支本气五行
  elementName: string;      // 日支本气五行名称
  description: string;      // 描述
}

// 旺相休囚死信息
export interface SeasonalStrengthInfo {
  state: '旺' | '相' | '休' | '囚' | '死';  // 五行状态
  description: string;      // 描述
}

// 调候用神信息（平和命局专用）
export interface TiaohouInfo {
  lunarMonth: number;           // 农历月份
  lunarMonthName: string;       // 农历月份名
  allStems: string[];           // 调候表中所有推荐天干
  matchedStems: { stem: string; priority: number; location: string }[]; // 在八字中匹配到的天干
  note: string;                 // 调候提要
}

export interface BaziAnalysisResult {
  dayMaster: {
    stem: string;
    stemIdx: number;
    element: number;
    elementName: string;
    isYang: boolean;
    strength: 'strong' | 'weak' | 'neutral'; // 日主强弱
    rootStrength: number;
    strengthAnalysis: DayMasterStrengthAnalysis; // 强弱分析详情
    selfSitting: SelfSittingInfo;   // 自坐
    seasonalStrength: SeasonalStrengthInfo; // 旺相休囚死
  };
  stemAnalyses: StemAnalysis[]; // 所有天干分析 (不含日主)
  allRoots: RootInfo[];         // 所有通根汇总
  pattern: PatternInfo;         // 格局判断
  monthBranch: {
    branch: string;
    branchIdx: number;
    rulingElement: number;
    rulingElementName: string;
  };
  elementStrengths: Record<number, number>; // 各五行力量
  favorableGods: FavorableGod[];  // 喜用神 (排序后)
  unfavorableGods: FavorableGod[]; // 忌神
  wealthGods: FavorableGod[];     // 财（我克，独立分类，非喜非忌）
  tiaohou?: TiaohouInfo;          // 调候用神信息（仅平和命局）
  shenSha: ShenShaInfo[];         // 神煞
  specialPatterns: SpecialPatternInfo[]; // 特殊格局
  fortuneAnalysis: FortuneAnalysis; // 运势喜忌分析
}

/**
 * 检查天干是否在地支中通根
 */
const findRoots = (
  stemIdx: number,
  pillars: { pillar: GanZhi; name: string }[],
  monthBranchIdx: number
): RootInfo[] => {
  const roots: RootInfo[] = [];
  const stemElement = STEM_ELEMENTS[stemIdx];
  
  for (const { pillar, name } of pillars) {
    const hiddenStems = BRANCH_HIDDEN_STEMS[pillar.zhiIdx] || [];
    
    hiddenStems.forEach((hiddenStemIdx, i) => {
      // 通根条件：藏干与天干同一五行
      if (STEM_ELEMENTS[hiddenStemIdx] === stemElement) {
        const positions = ['本气', '中气', '余气'];
        const rootTypes: Array<'mainQi' | 'midQi' | 'residualQi'> = ['mainQi', 'midQi', 'residualQi'];
        roots.push({
          branch: pillar.zhi,
          branchIdx: pillar.zhiIdx,
          hiddenStem: HEAVENLY_STEMS[hiddenStemIdx],
          hiddenStemIdx,
          weight: HIDDEN_STEM_WEIGHTS[i] || 0.4,
          position: positions[i] || '余气',
          pillarName: name,
          isMonthBranch: pillar.zhiIdx === monthBranchIdx,
          rootType: rootTypes[i] || 'residualQi',
        });
      }
    });
  }
  
  return roots;
};

/**
 * 查找有气（印星生扶）
 * 地支虽然不含同类五行，但能生助天干
 */
const findQiSupport = (
  stemIdx: number,
  pillars: { pillar: GanZhi; name: string }[]
): QiSupportInfo => {
  const stemElement = STEM_ELEMENTS[stemIdx];
  // 生我者为印：(element + 4) % 5
  const generatingElement = (stemElement + 4) % 5;
  
  const supportBranches: QiSupportInfo['supportBranches'] = [];
  
  for (const { pillar, name } of pillars) {
    const hiddenStems = BRANCH_HIDDEN_STEMS[pillar.zhiIdx] || [];
    // 检查地支本气是否能生助天干
    if (hiddenStems.length > 0) {
      const mainHiddenElement = STEM_ELEMENTS[hiddenStems[0]];
      if (mainHiddenElement === generatingElement) {
        supportBranches.push({
          branch: pillar.zhi,
          branchIdx: pillar.zhiIdx,
          pillarName: name,
          element: mainHiddenElement,
          elementName: ELEMENT_NAMES[mainHiddenElement],
        });
      }
    }
  }
  
  const hasQi = supportBranches.length > 0;
  let description = '';
  if (hasQi) {
    const branchDescs = supportBranches.map(b => `${b.pillarName}支${b.branch}(${b.elementName})`);
    description = `${branchDescs.join('、')}生扶，有气辅助`;
  } else {
    description = '无印星生扶';
  }
  
  return { hasQi, supportBranches, description };
};

/**
 * 查找透干信息
 * 地支藏干在天干显现
 */
const findTouGan = (
  stemIdx: number,
  pillarName: string,
  pillars: { pillar: GanZhi; name: string }[]
): TouGanInfo => {
  const stemElement = STEM_ELEMENTS[stemIdx];
  const touGanStems: TouGanInfo['touGanStems'] = [];
  
  // 检查此天干是否从某个地支藏干透出
  for (const { pillar, name: branchPillarName } of pillars) {
    const hiddenStems = BRANCH_HIDDEN_STEMS[pillar.zhiIdx] || [];
    
    for (const hiddenStemIdx of hiddenStems) {
      // 透干条件：地支藏干与天干同一五行（更严格的是同一天干）
      if (STEM_ELEMENTS[hiddenStemIdx] === stemElement) {
        touGanStems.push({
          stem: HEAVENLY_STEMS[stemIdx],
          stemIdx,
          fromBranch: pillar.zhi,
          fromBranchIdx: pillar.zhiIdx,
          pillarName,
          branchPillarName,
        });
      }
    }
  }
  
  const isTouGan = touGanStems.length > 0;
  let description = '';
  if (isTouGan) {
    const fromDescs = touGanStems.map(t => `${t.branchPillarName}支${t.fromBranch}`);
    // 去重
    const uniqueFromDescs = [...new Set(fromDescs)];
    description = `从${uniqueFromDescs.join('、')}透出`;
  } else {
    description = '未透干';
  }
  
  return { isTouGan, touGanStems, description };
};

/**
 * 检查根是否受伤（刑冲合害破）
 */
const checkRootInjury = (
  roots: RootInfo[],
  pillars: { pillar: GanZhi; name: string }[]
): RootInjuryInfo => {
  if (roots.length === 0) {
    return { isInjured: false };
  }
  
  const branches = pillars.map(p => p.pillar.zhiIdx);
  
  // 六冲对照表
  const liuChong: Record<number, number> = {
    0: 6, 6: 0,   // 子午冲
    1: 7, 7: 1,   // 丑未冲
    2: 8, 8: 2,   // 寅申冲
    3: 9, 9: 3,   // 卯酉冲
    4: 10, 10: 4, // 辰戌冲
    5: 11, 11: 5, // 巳亥冲
  };
  
  // 检查每个根是否被冲
  for (const root of roots) {
    const chongBranch = liuChong[root.branchIdx];
    if (chongBranch !== undefined && branches.includes(chongBranch)) {
      return {
        isInjured: true,
        injuryType: 'chong',
        injuryName: '冲',
        description: `${root.pillarName}支${root.branch}被冲，根受伤`,
      };
    }
  }
  
  // 简化处理：这里只检查冲，实际还可以扩展刑害破合
  return { isInjured: false };
};

/**
 * 获取十神有根/无根的命理表现
 */
const getTenGodRootMeanings = (
  tenGodName: string,
  isRooted: boolean,
  isInjured: boolean
): string[] => {
  // 十神有根的命理表现
  const meanings: Record<string, { hasRoot: string[]; noRoot: string[]; injured: string[] }> = {
    比肩: {
      hasRoot: ['自身身体健康', '意志坚定自信', '能得同辈帮助'],
      noRoot: ['体质偏弱', '缺乏自信', '难得同侪相助'],
      injured: ['兄弟朋友关系易有波折', '合作中易遇背叛'],
    },
    劫财: {
      hasRoot: ['行动力强', '竞争意识旺盛', '善于争取资源'],
      noRoot: ['行动力不足', '难以争取机会'],
      injured: ['破财损失', '兄弟争端'],
    },
    食神: {
      hasRoot: ['才华横溢', '表达能力强', '想法能落实为行动', '福气厚重'],
      noRoot: ['才华难以发挥', '表达受阻'],
      injured: ['才华被压制', '子女缘薄'],
    },
    伤官: {
      hasRoot: ['才华出众', '创新能力强', '艺术天赋'],
      noRoot: ['才华无处施展', '锋芒被磨平'],
      injured: ['口舌是非', '官非纠纷'],
    },
    偏财: {
      hasRoot: ['财源广进', '善于投资理财', '人脉广泛'],
      noRoot: ['财来财去', '难聚财富'],
      injured: ['破财失财', '父缘薄'],
    },
    正财: {
      hasRoot: ['财有源头', '为人稳重', '求财有道', '经济状况稳定'],
      noRoot: ['财源不稳', '收入波动'],
      injured: ['财务损失', '妻缘受损'],
    },
    七杀: {
      hasRoot: ['事业心强', '有魄力担当', '权势在握'],
      noRoot: ['压力无法转化为动力', '缺乏权威感'],
      injured: ['小人陷害', '官灾诉讼'],
    },
    正官: {
      hasRoot: ['主贵显达', '事业心强', '有管理能力', '有责任感'],
      noRoot: ['难得贵人提拔', '仕途艰难'],
      injured: ['官场失意', '职位不稳'],
    },
    偏印: {
      hasRoot: ['思维独特', '玄学悟性高', '技艺精湛'],
      noRoot: ['学业不精', '思维受限'],
      injured: ['学业中断', '精神困扰'],
    },
    正印: {
      hasRoot: ['学识扎实', '长辈缘分深', '心态平和', '有贵人缘'],
      noRoot: ['学业基础薄弱', '长辈缘浅'],
      injured: ['学业受挫', '母缘薄'],
    },
  };
  
  const m = meanings[tenGodName];
  if (!m) return [];
  
  if (!isRooted) return m.noRoot;
  if (isInjured) return m.injured;
  return m.hasRoot;
};

/**
 * 分析单个天干
 */
const analyzeStem = (
  stemIdx: number,
  pillarName: string,
  dayStemIdx: number,
  pillars: { pillar: GanZhi; name: string }[],
  monthBranchIdx: number
): StemAnalysis => {
  const element = STEM_ELEMENTS[stemIdx];
  const tenGodType = getTenGodType(dayStemIdx, stemIdx);
  const tenGodName = TEN_GOD_NAMES[tenGodType];
  const roots = findRoots(stemIdx, pillars, monthBranchIdx);
  const totalRootStrength = roots.reduce((sum, r) => sum + r.weight, 0);
  
  // 分类统计通根类型
  const hasMainQiRoot = roots.some(r => r.rootType === 'mainQi');
  const hasMidQiRoot = roots.some(r => r.rootType === 'midQi');
  const hasResidualQiRoot = roots.some(r => r.rootType === 'residualQi');
  const isRooted = roots.length > 0;
  
  // 有气（印星生扶）
  const qiSupport = findQiSupport(stemIdx, pillars);
  
  // 透干信息
  const touGan = findTouGan(stemIdx, pillarName, pillars);
  
  // 根受伤检查
  const rootInjury = checkRootInjury(roots, pillars);
  
  // 命理表现
  const rootMeaning = getTenGodRootMeanings(tenGodName, isRooted, rootInjury.isInjured);
  
  return {
    stem: HEAVENLY_STEMS[stemIdx],
    stemIdx,
    pillarName,
    element,
    elementName: ELEMENT_NAMES[element],
    tenGodType,
    tenGodName,
    tenGodShort: TEN_GOD_SHORT[tenGodType],
    roots,
    totalRootStrength,
    hasMonthRoot: roots.some(r => r.isMonthBranch),
    isRooted,
    hasMainQiRoot,
    hasMidQiRoot,
    hasResidualQiRoot,
    qiSupport,
    touGan,
    rootInjury,
    rootMeaning,
  };
};

/**
 * 判断格局 - 根据成格条件
 * 参考《御定奇门宝鉴》及传统命理学成格条件
 */
const determinePattern = (
  dayStemIdx: number,
  monthBranchIdx: number,
  stemAnalyses: StemAnalysis[],
  dayMasterStrength: number
): PatternInfo => {
  const monthHiddenStems = BRANCH_HIDDEN_STEMS[monthBranchIdx] || [];
  const monthMainStemIdx = monthHiddenStems[0]; // 月令本气
  
  // 月令本气对应的十神
  const monthMainGodType = getTenGodType(dayStemIdx, monthMainStemIdx);
  const monthMainGodName = TEN_GOD_NAMES[monthMainGodType];
  
  // 检查月令本气是否透干（天干中有同一五行）
  const monthMainElement = STEM_ELEMENTS[monthMainStemIdx];
  const isMonthlyStemRevealed = stemAnalyses.some(s => s.element === monthMainElement);
  
  // 格局名称映射
  const patternNames: Record<number, string> = {
    0: '建禄格',  // 比肩 - 月令见禄
    1: '羊刃格',  // 劫财 - 月令见刃
    2: '食神格',  // 食神
    3: '伤官格',  // 伤官
    4: '偏财格',  // 偏财
    5: '正财格',  // 正财
    6: '七杀格',  // 七杀/偏官
    7: '正官格',  // 正官
    8: '偏印格',  // 偏印/枭神
    9: '正印格',  // 正印
  };
  
  const patternName = patternNames[monthMainGodType] || '杂气格';
  
  // 获取格局数据中的成格条件
  const patternData = NORMAL_PATTERNS[patternName];
  
  // ===== 成格条件判断 =====
  let isEstablished = false;
  let strengthLevel: 'strong' | 'medium' | 'weak' = 'weak';
  let description = '';
  let failureReason = '';
  
  // 检查天干中各十神是否存在
  const hasShangGuan = stemAnalyses.some(s => s.tenGodName === '伤官');
  const hasZhengGuan = stemAnalyses.some(s => s.tenGodName === '正官');
  const hasQiSha = stemAnalyses.some(s => s.tenGodName === '七杀');
  const hasShiShen = stemAnalyses.some(s => s.tenGodName === '食神');
  const hasZhengYin = stemAnalyses.some(s => s.tenGodName === '正印');
  const hasPianYin = stemAnalyses.some(s => s.tenGodName === '偏印');
  const hasZhengCai = stemAnalyses.some(s => s.tenGodName === '正财');
  const hasPianCai = stemAnalyses.some(s => s.tenGodName === '偏财');
  const hasBiJian = stemAnalyses.some(s => s.tenGodName === '比肩');
  const hasJieCai = stemAnalyses.some(s => s.tenGodName === '劫财');
  
  // 检查十神是否有根
  const isShangGuanRooted = stemAnalyses.some(s => s.tenGodName === '伤官' && s.isRooted);
  const isZhengYinRooted = stemAnalyses.some(s => s.tenGodName === '正印' && s.isRooted);
  const isShiShenRooted = stemAnalyses.some(s => s.tenGodName === '食神' && s.isRooted);
  const isQiShaRooted = stemAnalyses.some(s => s.tenGodName === '七杀' && s.isRooted);

  switch (patternName) {
    case '正官格':
      // 成格条件：月令透正官，无伤官破局
      if (isMonthlyStemRevealed && !hasShangGuan) {
        isEstablished = true;
        strengthLevel = 'strong';
        description = '月令透正官，无伤官破局，官格成立';
      } else if (isMonthlyStemRevealed && hasShangGuan && hasZhengYin) {
        isEstablished = true;
        strengthLevel = 'medium';
        description = '月令透正官，虽有伤官但有印星护官';
      } else if (isMonthlyStemRevealed && hasShangGuan) {
        isEstablished = false;
        strengthLevel = 'weak';
        failureReason = '伤官见官，官格受损';
        description = `月令透正官，但${failureReason}`;
      } else if (!isMonthlyStemRevealed) {
        isEstablished = false;
        strengthLevel = 'weak';
        failureReason = '正官未透干';
        description = `月令藏正官，但${failureReason}，格局不显`;
      }
      break;
      
    case '七杀格':
      // 成格条件：月令透七杀，有食制或印化
      if (isMonthlyStemRevealed && (hasShiShen || hasZhengYin)) {
        isEstablished = true;
        strengthLevel = 'strong';
        description = hasShiShen ? '月令透七杀，食神制杀成格' : '月令透七杀，印星化杀成格';
      } else if (isMonthlyStemRevealed && !hasShiShen && !hasZhengYin) {
        isEstablished = false;
        strengthLevel = 'weak';
        failureReason = '杀无制化，杀重身轻';
        description = `月令透七杀，但${failureReason}`;
      } else if (!isMonthlyStemRevealed && (hasShiShen || hasZhengYin)) {
        isEstablished = true;
        strengthLevel = 'medium';
        description = '月令藏七杀，虽未透干但有制化';
      }
      break;
      
    case '正印格':
      // 成格条件：月令透正印，忌财星破印
      if (isMonthlyStemRevealed && !hasZhengCai && !hasPianCai) {
        isEstablished = true;
        strengthLevel = 'strong';
        description = '月令透正印，无财星破印，印格纯清';
      } else if (isMonthlyStemRevealed && (hasZhengCai || hasPianCai)) {
        isEstablished = false;
        strengthLevel = 'weak';
        failureReason = '财星破印';
        description = `月令透正印，但${failureReason}，印格受损`;
      } else if (!isMonthlyStemRevealed) {
        isEstablished = false;
        strengthLevel = 'weak';
        description = '月令藏正印，未透干格局不显';
      }
      break;
      
    case '偏印格':
      // 成格条件：月令透偏印，需见财星或食神
      if (isMonthlyStemRevealed && (hasZhengCai || hasPianCai || hasShiShen)) {
        isEstablished = true;
        strengthLevel = 'strong';
        description = hasShiShen ? '月令透偏印，食神解枭成格' : '月令透偏印，财星制枭成格';
      } else if (isMonthlyStemRevealed && !hasZhengCai && !hasPianCai && !hasShiShen) {
        isEstablished = false;
        strengthLevel = 'weak';
        failureReason = '枭神无制，恐夺食';
        description = `月令透偏印，但${failureReason}`;
      }
      break;
      
    case '正财格':
      // 成格条件：月令透正财，配官印更佳，忌比劫夺
      if (isMonthlyStemRevealed && !hasBiJian && !hasJieCai) {
        isEstablished = true;
        strengthLevel = (hasZhengGuan || hasZhengYin) ? 'strong' : 'medium';
        description = (hasZhengGuan || hasZhengYin) 
          ? '月令透正财，配官印成格，财官双美' 
          : '月令透正财，无比劫争夺，财格成立';
      } else if (isMonthlyStemRevealed && (hasBiJian || hasJieCai)) {
        isEstablished = false;
        strengthLevel = 'weak';
        failureReason = '比劫争财';
        description = `月令透正财，但${failureReason}`;
      }
      break;
      
    case '偏财格':
      // 成格条件：月令透偏财，需身强能任，忌比劫争
      if (isMonthlyStemRevealed && !hasBiJian && !hasJieCai && dayMasterStrength > 1.5) {
        isEstablished = true;
        strengthLevel = 'strong';
        description = '月令透偏财，身强能任财，偏财格成立';
      } else if (isMonthlyStemRevealed && (hasBiJian || hasJieCai)) {
        isEstablished = false;
        strengthLevel = 'weak';
        failureReason = '比劫争财';
        description = `月令透偏财，但${failureReason}`;
      } else if (isMonthlyStemRevealed && dayMasterStrength <= 1.5) {
        isEstablished = false;
        strengthLevel = 'weak';
        failureReason = '身弱不能任财';
        description = `月令透偏财，但${failureReason}`;
      }
      break;
      
    case '食神格':
      // 成格条件：月令透食神，忌枭神夺食
      if (isMonthlyStemRevealed && !hasPianYin) {
        isEstablished = true;
        strengthLevel = 'strong';
        description = '月令透食神，无枭神夺食，食神格成立';
      } else if (isMonthlyStemRevealed && hasPianYin && (hasZhengCai || hasPianCai)) {
        isEstablished = true;
        strengthLevel = 'medium';
        description = '月令透食神，虽有枭神但财星制枭';
      } else if (isMonthlyStemRevealed && hasPianYin) {
        isEstablished = false;
        strengthLevel = 'weak';
        failureReason = '枭神夺食';
        description = `月令透食神，但${failureReason}`;
      }
      break;
      
    case '伤官格':
      // 成格条件：月令透伤官，佩印或制杀成格
      if (isMonthlyStemRevealed && hasZhengYin) {
        isEstablished = true;
        strengthLevel = 'strong';
        description = '月令透伤官，印星佩伤，伤官佩印格成立';
      } else if (isMonthlyStemRevealed && hasQiSha) {
        isEstablished = true;
        strengthLevel = 'strong';
        description = '月令透伤官，伤官驾杀，格局成立';
      } else if (isMonthlyStemRevealed && !hasZhengYin && !hasQiSha) {
        if (hasZhengGuan) {
          isEstablished = false;
          strengthLevel = 'weak';
          failureReason = '伤官见官';
          description = `月令透伤官，${failureReason}，格局有损`;
        } else {
          isEstablished = true;
          strengthLevel = 'medium';
          description = '月令透伤官，格局成立但缺制化';
        }
      }
      break;
      
    case '建禄格':
      // 成格条件：月令见日主之禄（比肩），需有财官为用
      if (hasZhengCai || hasPianCai || hasZhengGuan || hasQiSha) {
        isEstablished = true;
        strengthLevel = 'strong';
        description = '月令建禄，有财官为用，格局成立';
      } else {
        isEstablished = false;
        strengthLevel = 'weak';
        failureReason = '无财官可用';
        description = `月令建禄，但${failureReason}，难以取贵`;
      }
      break;
      
    case '羊刃格':
      // 成格条件：月令见日主之刃（劫财），需官杀制刃
      if (hasZhengGuan || hasQiSha) {
        isEstablished = true;
        strengthLevel = 'strong';
        description = '月令羊刃，官杀制刃，格局成立';
      } else {
        isEstablished = false;
        strengthLevel = 'weak';
        failureReason = '刃无官杀制';
        description = `月令羊刃，但${failureReason}，刃旺无制`;
      }
      break;
      
    default:
      // 杂气格或其他
      if (isMonthlyStemRevealed) {
        isEstablished = true;
        strengthLevel = 'medium';
        description = `月令藏${HEAVENLY_STEMS[monthMainStemIdx]}透干成格`;
      } else {
        isEstablished = false;
        strengthLevel = 'weak';
        description = `月令藏${HEAVENLY_STEMS[monthMainStemIdx]}，未透干`;
      }
  }
  
  return {
    name: patternName,
    description,
    strength: strengthLevel,
    mainGod: monthMainGodName,
    isEstablished,
  };
};

/**
 * 计算各五行总力量
 */
const calculateElementStrengths = (
  pillars: { pillar: GanZhi; name: string }[],
  monthBranchIdx: number
): Record<number, number> => {
  const strengths: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  const monthRulingElement = MONTH_RULING_ELEMENT[monthBranchIdx];
  
  // 天干力量
  for (const { pillar, name } of pillars) {
    const stemElement = STEM_ELEMENTS[pillar.ganIdx];
    let power = 1.0;
    if (name === '月') power = 1.2; // 月干略强
    strengths[stemElement] += power;
  }
  
  // 地支藏干力量
  for (const { pillar, name } of pillars) {
    const hiddenStems = BRANCH_HIDDEN_STEMS[pillar.zhiIdx] || [];
    const isMonthBranch = name === '月';
    
    hiddenStems.forEach((hiddenStemIdx, i) => {
      const element = STEM_ELEMENTS[hiddenStemIdx];
      let power = HIDDEN_STEM_WEIGHTS[i] || 0.4;
      if (isMonthBranch) power *= 2; // 月令加倍
      strengths[element] += power;
    });
  }
  
  // 当令加成
  strengths[monthRulingElement] += 1.5;
  
  return strengths;
};

/**
 * 计算喜用神和忌神
 * 五行相生相克：木->火->土->金->水->木 (生)
 *              木->土->水->火->金->木 (克)
 */
// 根据日主五行和目标五行，返回对应的十神名称
const getElementTenGods = (dayElement: number, targetElement: number): string[] => {
  const diff = (targetElement - dayElement + 5) % 5;
  const godPairs: Record<number, string[]> = {
    0: ['比肩', '劫财'],
    1: ['食神', '伤官'],
    2: ['正财', '偏财'],
    3: ['正官', '七杀'],
    4: ['正印', '偏印'],
  };
  return godPairs[diff] || [];
};
// 根据五行获取对应的两个天干名称（如 火 → 丙/丁）
const getElementStems = (element: number): string => {
  return `${HEAVENLY_STEMS[element * 2]}/${HEAVENLY_STEMS[element * 2 + 1]}`;
};

const calculateFavorableGods = (
  dayElement: number,
  dayMasterStrength: 'strong' | 'weak' | 'neutral',
  isYang: boolean,
  dayStemIdx?: number,
  monthBranchIdx?: number,
  chartStems?: number[],  // 八字中所有天干索引
  chartBranches?: number[],  // 八字中所有地支索引
  subStrength?: 'leaning_strong' | 'balanced' | 'leaning_weak'
): { favorable: FavorableGod[], unfavorable: FavorableGod[], wealthGods: FavorableGod[], tiaohou?: TiaohouInfo } => {
  // 五行关系计算
  const sameEl = dayElement;                  // 比劫
  const generateMe = (dayElement + 4) % 5;    // 印枭 (生我)
  const iGenerate = (dayElement + 1) % 5;     // 食伤 (我生)
  const iControl = (dayElement + 2) % 5;      // 财才 (我克)
  const controlMe = (dayElement + 3) % 5;     // 官杀 (克我)
  
  const favorable: FavorableGod[] = [];
  const unfavorable: FavorableGod[] = [];
  const wealthGods: FavorableGod[] = []; // 财（我克）独立分类
  let tiaohou: TiaohouInfo | undefined;

  // 财（我克）始终独立分出，不归类为喜用或忌神
  wealthGods.push({
    element: iControl,
    elementName: ELEMENT_NAMES[iControl],
    stem: getElementStems(iControl),
    tenGods: ['正财', '偏财'],
    priority: 1,
    reason: '财为我克之物，独立看待',
  });
  
  if (dayMasterStrength === 'strong') {
    // 身强喜：克泄 (官杀、食伤) — 财已独立
    favorable.push({
      element: controlMe,
      elementName: ELEMENT_NAMES[controlMe],
      stem: getElementStems(controlMe),
      tenGods: ['正官', '七杀'],
      priority: 1,
      reason: '身强喜官杀克身，制约过旺日主'
    });
    favorable.push({
      element: iGenerate,
      elementName: ELEMENT_NAMES[iGenerate],
      stem: getElementStems(iGenerate),
      tenGods: ['食神', '伤官'],
      priority: 2,
      reason: '身强喜食伤泄秀，发挥旺气'
    });
    
    // 身强忌：生扶 (印、比劫)
    unfavorable.push({
      element: generateMe,
      elementName: ELEMENT_NAMES[generateMe],
      stem: getElementStems(generateMe),
      tenGods: ['正印', '偏印'],
      priority: 1,
      reason: '身强忌印再生，会更加旺盛'
    });
    unfavorable.push({
      element: sameEl,
      elementName: ELEMENT_NAMES[sameEl],
      stem: getElementStems(sameEl),
      tenGods: ['比肩', '劫财'],
      priority: 2,
      reason: '身强忌比劫帮身，会更加强盛'
    });
  } else if (dayMasterStrength === 'weak') {
    // 身弱喜：生扶 (印、比劫)
    favorable.push({
      element: generateMe,
      elementName: ELEMENT_NAMES[generateMe],
      stem: getElementStems(generateMe),
      tenGods: ['正印', '偏印'],
      priority: 1,
      reason: '身弱喜印生身，增强日主力量'
    });
    favorable.push({
      element: sameEl,
      elementName: ELEMENT_NAMES[sameEl],
      stem: getElementStems(sameEl),
      tenGods: ['比肩', '劫财'],
      priority: 2,
      reason: '身弱喜比劫帮身，增添助力'
    });
    
    // 身弱忌：克泄 (官杀、食伤) — 财已独立
    unfavorable.push({
      element: controlMe,
      elementName: ELEMENT_NAMES[controlMe],
      stem: getElementStems(controlMe),
      tenGods: ['正官', '七杀'],
      priority: 1,
      reason: '身弱忌官杀克身，会更加衰弱'
    });
    unfavorable.push({
      element: iGenerate,
      elementName: ELEMENT_NAMES[iGenerate],
      stem: getElementStems(iGenerate),
      tenGods: ['食神', '伤官'],
      priority: 2,
      reason: '身弱忌食伤泄气，耗损元神'
    });
  } else {
    // 平和 - 使用调候表确定用神，无忌神
    if (dayStemIdx !== undefined && monthBranchIdx !== undefined && chartStems) {
      const lunarMonth = monthBranchToLunarMonth(monthBranchIdx);
      const tiaohouEntry = TIAOHUO_TABLE[dayStemIdx]?.[lunarMonth];
      
      if (tiaohouEntry) {
        const matchedStems: { stem: string; priority: number; location: string }[] = [];
        
        // 收集八字中所有天干（含日主）的名称
        const chartStemNames = chartStems.map(idx => STEM_IDX_TO_NAME[idx]);
        
        // 按调候表优先级匹配（天干 + 地支藏干）
        let priorityCounter = 1;
        const pillarNames = ['年干', '月干', '日干', '时干'];
        const branchPillarNames = ['年支', '月支', '日支', '时支'];
        for (const tiaohouStem of tiaohouEntry.stems) {
          const stemLocations: string[] = [];
          // 只检查天干（八字里的四柱天干）
          chartStems.forEach((stemIdx, i) => {
            if (STEM_IDX_TO_NAME[stemIdx] === tiaohouStem) {
              stemLocations.push(pillarNames[i] || `第${i+1}柱`);
            }
          });
          
          // 藏干位置仅作参考显示，不影响是否打勾
          const hiddenLocations: string[] = [];
          if (chartBranches) {
            const tiaohouStemIdx = STEM_NAME_TO_IDX[tiaohouStem];
            chartBranches.forEach((branchIdx, i) => {
              const hiddenStems = BRANCH_HIDDEN_STEMS[branchIdx] || [];
              hiddenStems.forEach((hStemIdx, hIdx) => {
                if (hStemIdx === tiaohouStemIdx) {
                  const posName = hIdx === 0 ? '本气' : hIdx === 1 ? '中气' : '余气';
                  hiddenLocations.push(`${branchPillarNames[i] || `第${i+1}支`}藏${posName}`);
                }
              });
            });
          }
          
          // 天干或藏干匹配都算"八字里有"
          const allLocations = [...stemLocations, ...hiddenLocations];
          if (allLocations.length > 0) {
            matchedStems.push({
              stem: tiaohouStem,
              priority: priorityCounter,
              location: allLocations.join('、'),
            });
          }
          
          // 所有调候表推荐天干都加入喜用神（同五行合并显示）
          const stemIdx = STEM_NAME_TO_IDX[tiaohouStem];
          const stemElement = STEM_ELEMENTS[stemIdx];
          const tenGodType = getTenGodType(dayStemIdx, stemIdx);
          const found = allLocations.length > 0;
          const isWealth = stemElement === iControl; // 是否为财神（我克）
          const label = isWealth ? '喜用/财神' : '喜用神';
          
          // 检查是否已有同五行的条目，合并为 丙/丁 格式
          const existingIdx = favorable.findIndex(f => f.element === stemElement && (f.reason.startsWith('喜用神') || f.reason.startsWith('喜用/财神')));
          if (existingIdx >= 0) {
            const existing = favorable[existingIdx];
            existing.stem = `${existing.stem}/${tiaohouStem}`;
            if (!existing.tenGods.includes(TEN_GOD_NAMES[tenGodType])) {
              existing.tenGods.push(TEN_GOD_NAMES[tenGodType]);
            }
            // 如果任一天干是财神，升级标签和标记
            if (isWealth) {
              existing.isWealth = true;
              if (!existing.reason.startsWith('喜用/财神')) {
                existing.reason = existing.reason.replace(/^喜用神/, '喜用/财神');
              }
            }
            existing.reason += `；${tiaohouStem}${found ? `八字里有，见于${allLocations.join('、')}` : '八字未见此干'}`;
          } else {
            favorable.push({
              element: stemElement,
              elementName: ELEMENT_NAMES[stemElement],
              stem: tiaohouStem,
              tenGods: [TEN_GOD_NAMES[tenGodType]],
              priority: priorityCounter,
              reason: `${label}：${tiaohouStem}（${LUNAR_MONTH_NAMES[lunarMonth]}${STEM_IDX_TO_NAME[dayStemIdx]}日主调候第${priorityCounter}用神${found ? `，八字里有，见于${allLocations.join('、')}` : '，八字未见此干'}）`,
              isWealth,
            });
            priorityCounter++;
          }
        }
        
        tiaohou = {
          lunarMonth,
          lunarMonthName: LUNAR_MONTH_NAMES[lunarMonth],
          allStems: tiaohouEntry.stems,
          matchedStems,
          note: tiaohouEntry.note,
        };
      }
    }
    
    // 如果调候用神已作为喜用/财神加入 favorable，清空 wealthGods 避免重复显示
    const hasWealthInFavorable = favorable.some(f => f.isWealth);
    if (hasWealthInFavorable) {
      wealthGods.length = 0;
    }
    
    // 平和命季节喜用五行补充（基于月支）
    // 寅卯月喜火金，巳午月喜水土，申酉月喜水木，亥子月喜火木，辰丑月喜火，未戌月喜火
    if (monthBranchIdx !== undefined) {
      const seasonalFavorable: { element: number; reason: string }[] = [];
      if (monthBranchIdx === 2 || monthBranchIdx === 3) {
        // 寅卯月（春）主喜火和金
        seasonalFavorable.push({ element: 1, reason: '平和命生于寅卯月（春季木旺），喜火泄木秀气' });
        seasonalFavorable.push({ element: 3, reason: '平和命生于寅卯月（春季木旺），喜金制木平衡' });
      } else if (monthBranchIdx === 5 || monthBranchIdx === 6) {
        // 巳午月（夏）主喜水和土
        seasonalFavorable.push({ element: 4, reason: '平和命生于巳午月（夏季火旺），喜水调候降温' });
        seasonalFavorable.push({ element: 2, reason: '平和命生于巳午月（夏季火旺），喜土泄火生金' });
      } else if (monthBranchIdx === 8 || monthBranchIdx === 9) {
        // 申酉月（秋）主喜水和木
        seasonalFavorable.push({ element: 4, reason: '平和命生于申酉月（秋季金旺），喜水泄金秀气' });
        seasonalFavorable.push({ element: 0, reason: '平和命生于申酉月（秋季金旺），喜木疏土通气' });
      } else if (monthBranchIdx === 11 || monthBranchIdx === 0) {
        // 亥子月（冬）主喜火和木
        seasonalFavorable.push({ element: 1, reason: '平和命生于亥子月（冬季水旺），喜火调候暖局' });
        seasonalFavorable.push({ element: 0, reason: '平和命生于亥子月（冬季水旺），喜木泄水生火' });
      } else if (monthBranchIdx === 4 || monthBranchIdx === 1) {
        // 辰丑月（湿土）主喜火
        seasonalFavorable.push({ element: 1, reason: '平和命生于辰丑月（湿土当令），喜火暖局去湿' });
      } else if (monthBranchIdx === 7 || monthBranchIdx === 10) {
        // 未戌月（燥土）主喜火
        seasonalFavorable.push({ element: 1, reason: '平和命生于未戌月（燥土当令），喜火炼金生明' });
      }

      // 将季节喜用补充到 favorable 中（避免重复五行）
      const existingElements = new Set(favorable.map(f => f.element));
      let nextPriority = favorable.length > 0 ? Math.max(...favorable.map(f => f.priority)) + 1 : 1;
      for (const sf of seasonalFavorable) {
        if (!existingElements.has(sf.element)) {
          favorable.push({
            element: sf.element,
            elementName: ELEMENT_NAMES[sf.element],
            stem: getElementStems(sf.element),
            tenGods: getElementTenGods(dayElement, sf.element),
            priority: nextPriority++,
            reason: sf.reason,
          });
          existingElements.add(sf.element);
        }
      }
    }

    // 如果调候表和季节都没有产生用神，fallback
    if (favorable.length === 0) {
      favorable.push({
        element: generateMe,
        elementName: ELEMENT_NAMES[generateMe],
        stem: getElementStems(generateMe),
        tenGods: ['正印', '偏印'],
        priority: 1,
        reason: '中和命宜适度生扶，保持平衡'
      });
      favorable.push({
        element: iGenerate,
        elementName: ELEMENT_NAMES[iGenerate],
        stem: getElementStems(iGenerate),
        tenGods: ['食神', '伤官'],
        priority: 2,
        reason: '中和命宜食伤生财，流通气机'
      });
    }
    // 平和偏强时，补充身强喜用作为参考（官杀、食伤，财已独立）
    if (subStrength === 'leaning_strong') {
      const existingElements = new Set(favorable.map(f => f.element));
      let nextPriority = favorable.length > 0 ? Math.max(...favorable.map(f => f.priority)) + 1 : 1;
      
      const strongFavorableElements = [
        { el: controlMe, gods: ['正官', '七杀'], reason: '平和偏强，参考身强喜官杀克身' },
        { el: iGenerate, gods: ['食神', '伤官'], reason: '平和偏强，参考身强喜食伤泄秀' },
      ];
      for (const sf of strongFavorableElements) {
        if (!existingElements.has(sf.el)) {
          favorable.push({
            element: sf.el,
            elementName: ELEMENT_NAMES[sf.el],
            stem: getElementStems(sf.el),
            tenGods: sf.gods,
            priority: nextPriority++,
            reason: sf.reason,
          });
          existingElements.add(sf.el);
        }
      }
    }

    // 平和偏弱时：保留调候用神五行，移除非调候五行的生我(印)和同我(比劫)
    if (subStrength === 'leaning_weak') {
      // 收集调候表推荐天干对应的五行
      const tiaohouElements = new Set<number>();
      if (tiaohou) {
        for (const stem of tiaohou.allStems) {
          const idx = STEM_NAME_TO_IDX[stem];
          tiaohouElements.add(STEM_ELEMENTS[idx]);
        }
      }
      const supportElements = new Set([generateMe, sameEl]);
      const kept = favorable.filter(f => !supportElements.has(f.element) || tiaohouElements.has(f.element));
      favorable.length = 0;
      kept.forEach(f => favorable.push(f));
    }

    // 所有平和：从喜用中移除非调候的财（我克），调候用神中的财保留为"喜用/财神"
    const filteredFavorable = favorable.filter(f => f.element !== iControl || f.isWealth);
    favorable.length = 0;
    filteredFavorable.forEach(f => favorable.push(f));

    // 平和命无忌神
  }

  // 身强/身弱时，也计算调候信息作为参考（不影响喜忌神）
  if ((dayMasterStrength === 'strong' || dayMasterStrength === 'weak') && !tiaohou) {
    if (dayStemIdx !== undefined && monthBranchIdx !== undefined && chartStems) {
      const lunarMonth = monthBranchToLunarMonth(monthBranchIdx);
      const tiaohouEntry = TIAOHUO_TABLE[dayStemIdx]?.[lunarMonth];
      
      if (tiaohouEntry) {
        const matchedStems: { stem: string; priority: number; location: string }[] = [];
        const pillarNames = ['年干', '月干', '日干', '时干'];
        const branchPillarNames = ['年支', '月支', '日支', '时支'];
        let priorityCounter = 1;
        
        for (const tiaohouStem of tiaohouEntry.stems) {
          const stemLocations: string[] = [];
          // 只检查天干（八字里的四柱天干）
          chartStems.forEach((stemIdx, i) => {
            if (STEM_IDX_TO_NAME[stemIdx] === tiaohouStem) {
              stemLocations.push(pillarNames[i] || `第${i+1}柱`);
            }
          });
          
          // 藏干位置仅作参考显示，不影响是否打勾
          const hiddenLocations: string[] = [];
          if (chartBranches) {
            const tiaohouStemIdx = STEM_NAME_TO_IDX[tiaohouStem];
            chartBranches.forEach((branchIdx, i) => {
              const hiddenStems = BRANCH_HIDDEN_STEMS[branchIdx] || [];
              hiddenStems.forEach((hStemIdx, hIdx) => {
                if (hStemIdx === tiaohouStemIdx) {
                  const posName = hIdx === 0 ? '本气' : hIdx === 1 ? '中气' : '余气';
                  hiddenLocations.push(`${branchPillarNames[i] || `第${i+1}支`}藏${posName}`);
                }
              });
            });
          }
          
          // 天干或藏干匹配都算"八字里有"
          const allLocations = [...stemLocations, ...hiddenLocations];
          if (allLocations.length > 0) {
            matchedStems.push({
              stem: tiaohouStem,
              priority: priorityCounter,
              location: allLocations.join('、'),
            });
            priorityCounter++;
          }
        }
        
        tiaohou = {
          lunarMonth,
          lunarMonthName: LUNAR_MONTH_NAMES[lunarMonth],
          allStems: tiaohouEntry.stems,
          matchedStems,
          note: tiaohouEntry.note,
        };
      }
    }
  }
  
  return { favorable, unfavorable, wealthGods, tiaohou };
};

/**
 * 计算神煞 (吉神凶神)
 * 依据《御定奇门宝鉴》
 */
const calculateShenSha = (
  pillars: { pillar: GanZhi; name: string }[],
  dayStemIdx: number,
  dayBranchIdx: number,
  yearBranchIdx: number
): ShenShaInfo[] => {
  const shenSha: ShenShaInfo[] = [];
  
  // ========== 吉神 ==========
  
  // 天乙贵人 - 根据日干查（《御定奇门宝鉴》）【顶级吉神·逢凶化吉型】
  // 甲戊兼牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，庚辛逢马虎，此是贵人方
  const tianYiMap: Record<number, number[]> = {
    0: [1, 7],   // 甲 -> 丑、未
    1: [0, 8],   // 乙 -> 子、申
    2: [11, 9],  // 丙 -> 亥、酉
    3: [11, 9],  // 丁 -> 亥、酉
    4: [1, 7],   // 戊 -> 丑、未
    5: [0, 8],   // 己 -> 子、申
    6: [6, 2],   // 庚 -> 午、寅
    7: [6, 2],   // 辛 -> 午、寅
    8: [3, 5],   // 壬 -> 卯、巳
    9: [3, 5],   // 癸 -> 卯、巳
  };
  const tianYiBranches = tianYiMap[dayStemIdx] || [];
  for (const { pillar, name } of pillars) {
    if (tianYiBranches.includes(pillar.zhiIdx)) {
      // 根据位置给出不同效应
      let locationEffect = '得贵人扶助，遇事有人帮扶，化险为夷';
      if (name === '年') {
        locationEffect = '【年柱】祖荫深厚，幼年得贵人庇护，家世背景优越';
      } else if (name === '月') {
        locationEffect = '【月柱】事业运中贵人多助，中年发达有靠山';
      } else if (name === '日') {
        locationEffect = '【日柱】配偶有助力，婚姻中遇贵人，夫妻互相扶持';
      } else if (name === '时') {
        locationEffect = '【时柱】晚年遇贵人，子女有成就，晚福绑身';
      }
      shenSha.push({
        name: '天乙贵人',
        type: 'auspicious',
        description: '【顶级吉神】最强守护神，解生死灾厄、提升社会地位，从政经商者命局多见',
        location: `${name}柱`,
        effect: locationEffect
      });
    }
  }
  
  // 太极贵人 - 根据日干查（《御定奇门宝鉴》）
  // 甲乙生人子午中，丙丁卯酉报君知，戊己两干辰戌位，庚辛巳亥不须疑，壬癸丑未为贵地
  const taiJiMap: Record<number, number[]> = {
    0: [0, 6],   // 甲 -> 子、午
    1: [0, 6],   // 乙 -> 子、午
    2: [3, 9],   // 丙 -> 卯、酉
    3: [3, 9],   // 丁 -> 卯、酉
    4: [4, 10],  // 戊 -> 辰、戌
    5: [4, 10],  // 己 -> 辰、戌
    6: [5, 11],  // 庚 -> 巳、亥
    7: [5, 11],  // 辛 -> 巳、亥
    8: [1, 7],   // 壬 -> 丑、未
    9: [1, 7],   // 癸 -> 丑、未
  };
  const taiJiBranches = taiJiMap[dayStemIdx] || [];
  for (const { pillar, name } of pillars) {
    if (taiJiBranches.includes(pillar.zhiIdx)) {
      shenSha.push({
        name: '太极贵人',
        type: 'auspicious',
        description: '主聪明好学，有钻研之心',
        location: `${name}柱`,
        effect: '利于学术研究，易得名声'
      });
    }
  }
  
  // 天德贵人 - 根据月支查（《御定奇门宝鉴》）【顶级吉神·逢凶化吉型】
  // 正丁二申宫，三壬四辛同，五亥六甲上，七癸八艮逢，九丙十居乙，子巽丑庚中
  // 正月(寅)见丁，二月(卯)见申，三月(辰)见壬，四月(巳)见辛，
  // 五月(午)见亥，六月(未)见甲，七月(申)见癸，八月(酉)见寅，
  // 九月(戌)见丙，十月(亥)见乙，十一月(子)见巳，十二月(丑)见庚
  const monthPillar = pillars.find(p => p.name === '月');
  if (monthPillar) {
    // 天德以天干为主（部分为地支，需特殊处理）
    const tianDeGanMap: Record<number, number> = {
      2: 3,   // 寅月(正月) -> 丁
      4: 8,   // 辰月(三月) -> 壬
      5: 7,   // 巳月(四月) -> 辛
      7: 0,   // 未月(六月) -> 甲
      8: 9,   // 申月(七月) -> 癸
      10: 2,  // 戌月(九月) -> 丙
      11: 1,  // 亥月(十月) -> 乙
      1: 6,   // 丑月(十二月) -> 庚
    };
    // 天德以地支为主的月份
    const tianDeZhiMap: Record<number, number> = {
      3: 8,   // 卯月(二月) -> 申
      6: 11,  // 午月(五月) -> 亥
      9: 2,   // 酉月(八月) -> 寅
      0: 5,   // 子月(十一月) -> 巳
    };
    
    const tianDeGan = tianDeGanMap[monthPillar.pillar.zhiIdx];
    const tianDeZhi = tianDeZhiMap[monthPillar.pillar.zhiIdx];
    
    for (const { pillar, name } of pillars) {
      let found = false;
      if (tianDeGan !== undefined && pillar.ganIdx === tianDeGan) {
        found = true;
      }
      if (tianDeZhi !== undefined && pillar.zhiIdx === tianDeZhi) {
        found = true;
      }
      if (found) {
        shenSha.push({
          name: '天德贵人',
          type: 'auspicious',
          description: '【顶级吉神】化解意外灾劫（车祸/事故），增强阴德福报，高危行业从业者的守护星',
          location: `${name}柱`,
          effect: '一生少灾厄，遇难有救，可化解血光之灾'
        });
      }
    }
  }
  
  // 月德贵人 - 根据月支查（《御定奇门宝鉴》）【顶级吉神·逢凶化吉型】
  // 寅午戌月丙，申子辰月壬，亥卯未月甲，巳酉丑月庚
  if (monthPillar) {
    const yueDeMap: Record<number, number> = {
      2: 2, 6: 2, 10: 2,   // 寅午戌 -> 丙
      8: 8, 0: 8, 4: 8,    // 申子辰 -> 壬
      11: 0, 3: 0, 7: 0,   // 亥卯未 -> 甲
      5: 6, 9: 6, 1: 6,    // 巳酉丑 -> 庚
    };
    const yueDeStem = yueDeMap[monthPillar.pillar.zhiIdx];
    if (yueDeStem !== undefined) {
      for (const { pillar, name } of pillars) {
        if (pillar.ganIdx === yueDeStem) {
          shenSha.push({
            name: '月德贵人',
            type: 'auspicious',
            description: '【顶级吉神】月中德神，消减病痛官非，增强贵人缘',
            location: `${name}柱`,
            effect: '一生平安，逢凶化吉，官非口舌易化解'
          });
        }
      }
    }
  }
  
  // 文昌贵人 - 根据日干查（《御定奇门宝鉴》）【顶级吉神·逢凶化吉型】
  // 甲乙巳午报君知，丙戊申宫丁己鸡，庚猪辛鼠壬逢虎，癸人见卯入云梯
  const wenChangMap: Record<number, number> = {
    0: 5,  // 甲 -> 巳
    1: 6,  // 乙 -> 午
    2: 8,  // 丙 -> 申
    3: 9,  // 丁 -> 酉
    4: 8,  // 戊 -> 申
    5: 9,  // 己 -> 酉
    6: 11, // 庚 -> 亥
    7: 0,  // 辛 -> 子
    8: 2,  // 壬 -> 寅
    9: 3,  // 癸 -> 卯
  };
  const wenChangBranch = wenChangMap[dayStemIdx];
  for (const { pillar, name } of pillars) {
    if (pillar.zhiIdx === wenChangBranch) {
      shenSha.push({
        name: '文昌贵人',
        type: 'auspicious',
        description: '【顶级吉神】主聪明智慧，考试运倍增（配学堂贵人效力+200%），创造型人才标志（作家/科学家/工程师）',
        location: `${name}柱`,
        effect: '利于文职、考试、学术，主科甲登第，学业事业顺遂'
      });
    }
  }
  
  // 学堂词馆 - 根据日干查（《御定奇门宝鉴》）
  // 学堂：日干长生位；词馆：日干临官位
  const xueTangMap: Record<number, number> = {
    0: 11, 1: 6,   // 甲木长生亥，乙木长生午
    2: 2, 3: 9,    // 丙火长生寅，丁火长生酉
    4: 2, 5: 9,    // 戊土长生寅，己土长生酉
    6: 5, 7: 0,    // 庚金长生巳，辛金长生子
    8: 8, 9: 3,    // 壬水长生申，癸水长生卯
  };
  const xueTangBranch = xueTangMap[dayStemIdx];
  for (const { pillar, name } of pillars) {
    if (pillar.zhiIdx === xueTangBranch) {
      shenSha.push({
        name: '学堂',
        type: 'auspicious',
        description: '主学业有成，聪慧过人',
        location: `${name}柱`,
        effect: '利于求学、考试，易有功名'
      });
    }
  }
  
  // 驿马 - 根据年支或日支查（《御定奇门宝鉴》）【特殊类型神煞】
  // 申子辰马在寅，寅午戌马在申，亥卯未马在巳，巳酉丑马在亥
  // 驿马为移动、变动：工作变动、居住地变动、奔波、升职、出国出差、婚姻变动、财来财去
  // 单驿马：常出差/外派；双驿马：移民/跨国企业高管
  const yiMaMap: Record<number, number> = {
    0: 2, 4: 2, 8: 2,     // 申子辰 -> 寅
    2: 8, 6: 8, 10: 8,    // 寅午戌 -> 申
    5: 11, 9: 11, 1: 11,  // 巳酉丑 -> 亥
    11: 5, 3: 5, 7: 5,    // 亥卯未 -> 巳
  };
  // 从年支和日支都查驿马
  const yiMaFromYear = yiMaMap[yearBranchIdx];
  const yiMaFromDay = yiMaMap[dayBranchIdx];
  let yiMaCount = 0;
  let yiMaLocations: string[] = [];
  
  for (const { pillar, name } of pillars) {
    // 从年支查驿马
    if (yiMaFromYear !== undefined && pillar.zhiIdx === yiMaFromYear) {
      yiMaCount++;
      yiMaLocations.push(`${name}柱`);
    }
    // 从日支查驿马（如果不同于年支驿马）
    if (yiMaFromDay !== undefined && pillar.zhiIdx === yiMaFromDay && yiMaFromDay !== yiMaFromYear) {
      yiMaCount++;
      if (!yiMaLocations.includes(`${name}柱`)) {
        yiMaLocations.push(`${name}柱`);
      }
    }
  }
  
  if (yiMaCount > 0) {
    const locationStr = yiMaLocations.join('、');
    const isDualYiMa = yiMaCount >= 2;
    shenSha.push({
      name: isDualYiMa ? '双驿马' : '驿马',
      type: 'auspicious',
      description: isDualYiMa 
        ? '【特殊类型】命带双驿马，移民/跨国企业高管配置' 
        : '【特殊类型】驿马为移动变动之星，主奔波走动',
      location: locationStr,
      effect: isDualYiMa 
        ? '一生变动极大，适合跨国/移民/外派高管；环境越变动越能发挥'
        : '代表工作变动、居住地变动、奔波升职、出国出差、婚姻变动、财来财去'
    });
  }
  
  // 桃花（咸池）- 根据年支或日支查（《御定奇门宝鉴》）
  // 申子辰桃花在酉，寅午戌桃花在卯，亥卯未桃花在子，巳酉丑桃花在午
  const taoHuaMap: Record<number, number> = {
    0: 9, 4: 9, 8: 9,     // 申子辰 -> 酉
    2: 3, 6: 3, 10: 3,    // 寅午戌 -> 卯
    5: 6, 9: 6, 1: 6,     // 巳酉丑 -> 午
    11: 0, 3: 0, 7: 0,    // 亥卯未 -> 子
  };
  const taoHuaBranch = taoHuaMap[yearBranchIdx];
  if (taoHuaBranch !== undefined) {
    for (const { pillar, name } of pillars) {
      if (pillar.zhiIdx === taoHuaBranch) {
        shenSha.push({
          name: '桃花',
          type: 'auspicious',
          description: '主人缘、魅力、感情缘',
          location: `${name}柱`,
          effect: '人缘好，异性缘佳，易有风流韵事'
        });
      }
    }
  }
  
  // 华盖 - 根据年支或日支查（《御定奇门宝鉴》）【特殊类型神煞】
  // 申子辰华盖在辰，寅午戌华盖在戌，亥卯未华盖在未，巳酉丑华盖在丑
  // 华盖代表艺术、文笔、学历等文化方面的才能和兴趣
  // 命带华盖的人通常具有孤僻的性格，不喜欢与人过多交往，更喜欢独处和思考
  const huaGaiMap: Record<number, number> = {
    0: 4, 4: 4, 8: 4,     // 申子辰 -> 辰
    2: 10, 6: 10, 10: 10, // 寅午戌 -> 戌
    5: 1, 9: 1, 1: 1,     // 巳酉丑 -> 丑
    11: 7, 3: 7, 7: 7,    // 亥卯未 -> 未
  };
  const huaGaiBranch = huaGaiMap[yearBranchIdx];
  let hasHuaGai = false;
  let huaGaiLocation = '';
  if (huaGaiBranch !== undefined) {
    for (const { pillar, name } of pillars) {
      if (pillar.zhiIdx === huaGaiBranch) {
        hasHuaGai = true;
        huaGaiLocation = `${name}柱`;
        shenSha.push({
          name: '华盖',
          type: 'auspicious',
          description: '【特殊类型】代表艺术、文笔、学历等文化方面的才能和兴趣',
          location: `${name}柱`,
          effect: '命带华盖的人通常具有孤僻的性格，不喜欢与人过多交往，更喜欢独处和思考；利于艺术、宗教、学术研究'
        });
      }
    }
  }
  
  // 检测华盖+文昌组合 = 玄学/物理学大家（如爱因斯坦）
  if (hasHuaGai) {
    const hasWenChang = shenSha.some(s => s.name === '文昌贵人');
    if (hasWenChang) {
      shenSha.push({
        name: '华盖文昌',
        type: 'auspicious',
        description: '【特殊类型·黄金组合】华盖+文昌同现',
        location: '命局',
        effect: '玄学/物理学大家配置（如爱因斯坦）；学术研究能力极强，易成为领域专家'
      });
    }
  }
  
  // 将星 - 根据年支查（《御定奇门宝鉴》）【财富事业关键神煞】
  // 申子辰将星在子，寅午戌将星在午，亥卯未将星在卯，巳酉丑将星在酉
  // 将星+正官：政界要员；将星+七杀：创业领袖
  const jiangXingMap: Record<number, number> = {
    0: 0, 4: 0, 8: 0,     // 申子辰 -> 子
    2: 6, 6: 6, 10: 6,    // 寅午戌 -> 午
    5: 9, 9: 9, 1: 9,     // 巳酉丑 -> 酉
    11: 3, 3: 3, 7: 3,    // 亥卯未 -> 卯
  };
  const jiangXingBranch = jiangXingMap[yearBranchIdx];
  if (jiangXingBranch !== undefined) {
    for (const { pillar, name } of pillars) {
      if (pillar.zhiIdx === jiangXingBranch) {
        shenSha.push({
          name: '将星',
          type: 'auspicious',
          description: '【财富事业】领导力密码，主权威与管理才能',
          location: `${name}柱`,
          effect: '有领导才能，可掌权柄；地支见将星为中层管理者，配正官主政界要员，配七杀主创业领袖'
        });
      }
    }
  }
  
  // 天医 - 根据月支查（《御定奇门宝鉴》）
  // 正月在丑，二月在寅...月后第一位
  if (monthPillar) {
    const tianYiBranch = (monthPillar.pillar.zhiIdx + 11) % 12; // 月前一位
    for (const { pillar, name } of pillars) {
      if (pillar.zhiIdx === tianYiBranch) {
        shenSha.push({
          name: '天医',
          type: 'auspicious',
          description: '主医药、治病之能',
          location: `${name}柱`,
          effect: '利于从医，逢凶化吉'
        });
      }
    }
  }
  
  // 金舆 - 根据日干查（《御定奇门宝鉴》）【财富事业关键神煞】
  // 甲辰乙巳丙未宫，丁申戊酉己戌中，庚子辛丑壬寅位，癸卯金舆定荣恭
  const jinYuMap: Record<number, number> = {
    0: 4,  // 甲 -> 辰
    1: 5,  // 乙 -> 巳
    2: 7,  // 丙 -> 未
    3: 8,  // 丁 -> 申
    4: 9,  // 戊 -> 酉
    5: 10, // 己 -> 戌
    6: 0,  // 庚 -> 子
    7: 1,  // 辛 -> 丑
    8: 2,  // 壬 -> 寅
    9: 3,  // 癸 -> 卯
  };
  const jinYuBranch = jinYuMap[dayStemIdx];
  for (const { pillar, name } of pillars) {
    if (pillar.zhiIdx === jinYuBranch) {
      shenSha.push({
        name: '金舆',
        type: 'auspicious',
        description: '【财富事业】主尊贵、财富与配偶助力之象',
        location: `${name}柱`,
        effect: '主富贵，男命主得贤内助，女命主嫁入豪门'
      });
    }
  }
  
  // 禄神 - 根据日干查（《御定奇门宝鉴》）【财富事业关键神煞】
  // 甲禄在寅，乙禄在卯，丙戊禄在巳，丁己禄在午，庚禄在申，辛禄在酉，壬禄在亥，癸禄在子
  // 禄代表身体与身份，遇刑冲合害而动则工作或居住变动
  const luShenMap: Record<number, number> = {
    0: 2,  // 甲 -> 寅
    1: 3,  // 乙 -> 卯
    2: 5,  // 丙 -> 巳
    3: 6,  // 丁 -> 午
    4: 5,  // 戊 -> 巳
    5: 6,  // 己 -> 午
    6: 8,  // 庚 -> 申
    7: 9,  // 辛 -> 酉
    8: 11, // 壬 -> 亥
    9: 0,  // 癸 -> 子
  };
  const luShenBranch = luShenMap[dayStemIdx];
  for (const { pillar, name } of pillars) {
    if (pillar.zhiIdx === luShenBranch) {
      shenSha.push({
        name: '禄神',
        type: 'auspicious',
        description: '【财富事业】主财禄与身份地位，代表稳定收入来源',
        location: `${name}柱`,
        effect: '一生衣食无忧，财源稳定；禄遇刑冲则工作/居住易变动'
      });
    }
  }
  
  // 金匮 - 根据日干查日支财库【财富事业关键神煞】
  // 财库：木日主见戌（土库），火日主见丑（金库），土日主见辰（水库），金日主见未（木库），水日主见戌（火库）
  // 日支为财库：配偶财能，男命得贤内助，女命嫁豪门
  // 库逢冲（辰戌/丑未）为暴富契机
  const dayPillarForJinKui = pillars.find(p => p.name === '日');
  if (dayPillarForJinKui) {
    // 根据日干五行确定财库
    const dayElement = dayStemIdx % 5; // 0=木,1=火,2=土,3=金,4=水（简化）
    // 更准确的日干五行映射
    const ganToElement: Record<number, number> = {
      0: 0, 1: 0,  // 甲乙 -> 木
      2: 1, 3: 1,  // 丙丁 -> 火
      4: 2, 5: 2,  // 戊己 -> 土
      6: 3, 7: 3,  // 庚辛 -> 金
      8: 4, 9: 4,  // 壬癸 -> 水
    };
    // 财库：我克者的墓库
    // 木克土，土库在戌(10)；火克金，金库在丑(1)；土克水，水库在辰(4)；
    // 金克木，木库在未(7)；水克火，火库在戌(10)
    const caiKuMap: Record<number, number> = {
      0: 10, // 木日主 -> 戌（土库，财为土）
      1: 1,  // 火日主 -> 丑（金库，财为金）
      2: 4,  // 土日主 -> 辰（水库，财为水）
      3: 7,  // 金日主 -> 未（木库，财为木）
      4: 10, // 水日主 -> 戌（火库，财为火）
    };
    const myElement = ganToElement[dayStemIdx];
    const caiKuBranch = caiKuMap[myElement];
    
    // 检查日支是否为财库
    if (dayPillarForJinKui.pillar.zhiIdx === caiKuBranch) {
      shenSha.push({
        name: '金匮',
        type: 'auspicious',
        description: '【财富事业】日支坐财库，配偶财能强',
        location: '日柱',
        effect: '男命得贤内助，女命嫁豪门；库逢冲（辰戌/丑未互冲）为暴富契机'
      });
    }
  }
  
  // ========== 凶神 ==========
  
  // 羊刃 - 根据日干查地支（《御定奇门宝鉴》）【重要凶煞·双刃剑】
  // 甲木羊刃在卯，丙火羊刃在午，庚金羊刃在酉，壬水羊刃在子
  // 注：阴干和土五行的羊刃争议较大，此处采用禄前一位的传统算法
  // 羊刃是双刃剑：用得好则伤人自利，用不好则害己
  // 吉凶置换：官星制刃(大吉权柄)、食伤泄秀(转吉才华)、印星化刃(转平学识)
  //          财星无护(大凶破财)、刃逢刑冲(极凶血光)、双刃叠见(暴死风险)
  const yangRenMap: Record<number, number> = {
    0: 3,  // 甲 -> 卯 (甲木羊刃)
    1: 4,  // 乙 -> 辰 (乙木羊刃，争议)
    2: 6,  // 丙 -> 午 (丙火羊刃)
    3: 7,  // 丁 -> 未 (丁火羊刃，争议)
    4: 6,  // 戊 -> 午 (戊土寄火，争议)
    5: 7,  // 己 -> 未 (己土寄火，争议)
    6: 9,  // 庚 -> 酉 (庚金羊刃)
    7: 10, // 辛 -> 戌 (辛金羊刃，争议)
    8: 0,  // 壬 -> 子 (壬水羊刃)
    9: 1,  // 癸 -> 丑 (癸水羊刃，争议)
  };
  // 阳干的羊刃更为确定
  const yangGanYangRen = [0, 2, 6, 8]; // 甲丙庚壬
  const yangRenBranch = yangRenMap[dayStemIdx];
  let yangRenCount = 0;
  for (const { pillar, name } of pillars) {
    if (pillar.zhiIdx === yangRenBranch) {
      yangRenCount++;
      const isYangGan = yangGanYangRen.includes(dayStemIdx);
      shenSha.push({
        name: '羊刃',
        type: 'inauspicious',
        description: isYangGan 
          ? '【重要凶煞】帝旺之位，能量极盛，双刃剑性质' 
          : '【凶煞】羊刃（阴干/土干，力量稍弱）',
        location: `${name}柱`,
        effect: '原始特性：刚暴凶险，易伤身破财；官星制刃可转吉为权柄，食伤泄秀转才华，刃逢刑冲主血光'
      });
    }
  }
  // 双刃叠见特殊警告
  if (yangRenCount >= 2) {
    shenSha.push({
      name: '双刃叠见',
      type: 'inauspicious',
      description: '【极凶】命中羊刃重叠，暴死风险',
      location: '命局',
      effect: '突发灾祸风险极高，需特别注意安全，宜修身养性'
    });
  }
  
  // 劫煞 - 根据年支查（《御定奇门宝鉴》）【重要凶煞】
  // 三合局绝位：申子辰见巳，寅午戌见亥，亥卯未见申，巳酉丑见寅
  // 劫煞+亡神：黑社会/高危职业；流年引动：提前献血可化解70%
  const jieShaMap: Record<number, number> = {
    0: 5, 4: 5, 8: 5,     // 申子辰 -> 巳
    2: 11, 6: 11, 10: 11, // 寅午戌 -> 亥
    5: 2, 9: 2, 1: 2,     // 巳酉丑 -> 寅
    11: 8, 3: 8, 7: 8,    // 亥卯未 -> 申
  };
  const jieShaBranch = jieShaMap[yearBranchIdx];
  if (jieShaBranch !== undefined) {
    for (const { pillar, name } of pillars) {
      if (pillar.zhiIdx === jieShaBranch) {
        shenSha.push({
          name: '劫煞',
          type: 'inauspicious',
          description: '【重要凶煞】三合局绝位，主劫难与血光',
          location: `${name}柱`,
          effect: '易有破财、失物、遭劫之象；劫煞+亡神同现为血光预警'
        });
      }
    }
  }
  
  // 灾煞 - 根据年支查（劫煞对冲位）【重要凶煞】
  // 申子辰见午，寅午戌见子，亥卯未见酉，巳酉丑见卯
  const zaiShaMap: Record<number, number> = {
    0: 6, 4: 6, 8: 6,     // 申子辰 -> 午
    2: 0, 6: 0, 10: 0,    // 寅午戌 -> 子
    5: 3, 9: 3, 1: 3,     // 巳酉丑 -> 卯
    11: 9, 3: 9, 7: 9,    // 亥卯未 -> 酉
  };
  const zaiShaBranch = zaiShaMap[yearBranchIdx];
  if (zaiShaBranch !== undefined) {
    for (const { pillar, name } of pillars) {
      if (pillar.zhiIdx === zaiShaBranch) {
        shenSha.push({
          name: '灾煞',
          type: 'inauspicious',
          description: '【重要凶煞】劫煞对冲位，主天灾人祸',
          location: `${name}柱`,
          effect: '易遭天灾、水火之灾、意外伤害'
        });
      }
    }
  }
  
  // 亡神 - 根据年支或日支查（《御定奇门宝鉴》）【特殊类型神煞·双面刃】
  // 申子辰亡神在亥，寅午戌亡神在巳，亥卯未亡神在寅，巳酉丑亡神在申
  // 双面刃效应：
  // 吉：顶级战略家（任正非命局特征），深谋远虑，善于布局
  // 凶：诉讼缠身（需配正印约束）
  const wangShenMap: Record<number, number> = {
    0: 11, 4: 11, 8: 11,  // 申子辰 -> 亥
    2: 5, 6: 5, 10: 5,    // 寅午戌 -> 巳
    5: 8, 9: 8, 1: 8,     // 巳酉丑 -> 申
    11: 2, 3: 2, 7: 2,    // 亥卯未 -> 寅
  };
  const wangShenBranch = wangShenMap[yearBranchIdx];
  let hasWangShen = false;
  let wangShenLocation = '';
  if (wangShenBranch !== undefined) {
    for (const { pillar, name } of pillars) {
      if (pillar.zhiIdx === wangShenBranch) {
        hasWangShen = true;
        wangShenLocation = `${name}柱`;
        
        // 检测是否有正印约束
        const dayElement = STEM_ELEMENTS[dayStemIdx];
        const yinElement = (dayElement + 4) % 5; // 生我者五行
        const dayStemIsYang = dayStemIdx % 2 === 0;
        
        let hasZhengYin = false;
        for (const { pillar: p } of pillars) {
          const stemElement = STEM_ELEMENTS[p.ganIdx];
          if (stemElement === yinElement) {
            const stemIsYang = p.ganIdx % 2 === 0;
            if (stemIsYang !== dayStemIsYang) {
              // 异阴阳为正印
              hasZhengYin = true;
              break;
            }
          }
        }
        
        shenSha.push({
          name: '亡神',
          type: hasZhengYin ? 'auspicious' : 'inauspicious',
          description: hasZhengYin 
            ? '【特殊类型·双面刃转吉】亡神配正印，顶级战略家配置'
            : '【特殊类型·双面刃】主暗昧是非，需正印约束',
          location: `${name}柱`,
          effect: hasZhengYin 
            ? '深谋远虑，善于布局（任正非命局特征）；有正印约束，凶性化解'
            : '吉则顶级战略家，凶则诉讼缠身；建议寻找正印贵人相助'
        });
      }
    }
  }
  
  // ========== 情感婚姻核心神煞 ==========
  
  // 阴差阳错 - 12特定日柱【情感婚姻核心神煞】
  // 丙子、丁丑、戊寅、辛卯、壬辰、癸巳、丙午、丁未、戊申、辛酉、壬戌、癸亥
  // 婚变预警，早婚离婚率超80%，晚婚可降风险50%
  const yinChaYangCuoPillars = [
    [2, 0],  // 丙子
    [3, 1],  // 丁丑
    [4, 2],  // 戊寅
    [7, 3],  // 辛卯
    [8, 4],  // 壬辰
    [9, 5],  // 癸巳
    [2, 6],  // 丙午
    [3, 7],  // 丁未
    [4, 8],  // 戊申
    [7, 9],  // 辛酉
    [8, 10], // 壬戌
    [9, 11], // 癸亥
  ];
  const dayPillarForMarriage = pillars.find(p => p.name === '日');
  if (dayPillarForMarriage) {
    const isYinChaYangCuo = yinChaYangCuoPillars.some(
      ([gan, zhi]) => dayPillarForMarriage.pillar.ganIdx === gan && dayPillarForMarriage.pillar.zhiIdx === zhi
    );
    if (isYinChaYangCuo) {
      shenSha.push({
        name: '阴差阳错',
        type: 'inauspicious',
        description: '【情感婚姻】婚姻宫坐阴差阳错，感情易有波折',
        location: '日柱',
        effect: '婚变预警：早婚离婚率超80%；化解：晚婚（男32+/女30+）可降风险50%'
      });
    }
  }
  
  // 桃花煞 - 根据年支或日支查【情感婚姻核心神煞】
  // 寅午戌见卯，申子辰见酉，亥卯未见子，巳酉丑见午
  // 桃花在年月为"墙内桃花"（婚前桃花旺），在时辰为"墙外桃花"（婚后易有婚外情）
  const taoHuaShaMap: Record<number, number> = {
    2: 3, 6: 3, 10: 3,    // 寅午戌 -> 卯
    8: 9, 0: 9, 4: 9,     // 申子辰 -> 酉
    11: 0, 3: 0, 7: 0,    // 亥卯未 -> 子
    5: 6, 9: 6, 1: 6,     // 巳酉丑 -> 午
  };
  // 以年支和日支为主查桃花
  const taoHuaShaFromYear = taoHuaShaMap[yearBranchIdx];
  const taoHuaShaFromDay = taoHuaShaMap[dayBranchIdx];
  let hasTaoHuaSha = false;
  let taoHuaLocations: string[] = [];
  let isWallOutsideTaoHua = false; // 墙外桃花
  
  for (const { pillar, name } of pillars) {
    // 从年支查桃花
    if (taoHuaShaFromYear !== undefined && pillar.zhiIdx === taoHuaShaFromYear) {
      hasTaoHuaSha = true;
      taoHuaLocations.push(`${name}柱`);
      if (name === '时') isWallOutsideTaoHua = true;
    }
    // 从日支查桃花
    if (taoHuaShaFromDay !== undefined && pillar.zhiIdx === taoHuaShaFromDay && taoHuaShaFromDay !== taoHuaShaFromYear) {
      hasTaoHuaSha = true;
      if (!taoHuaLocations.includes(`${name}柱`)) {
        taoHuaLocations.push(`${name}柱`);
      }
      if (name === '时') isWallOutsideTaoHua = true;
    }
  }
  
  if (hasTaoHuaSha) {
    // 基础桃花煞
    const locationStr = taoHuaLocations.join('、');
    const wallType = isWallOutsideTaoHua ? '墙外桃花' : '墙内桃花';
    shenSha.push({
      name: '桃花煞',
      type: 'inauspicious', // 桃花煞本身是中性偏凶
      description: `【情感婚姻】${wallType}，主感情、人缘、桃花运`,
      location: locationStr,
      effect: isWallOutsideTaoHua 
        ? '时支见桃花为墙外桃花，婚后易有婚外情或感情纠纷' 
        : '年月见桃花为墙内桃花，婚前桃花旺，婚后趋于稳定'
    });
    
    // 检测桃花+正官组合 = 异性贵人
    // 使用天干五行关系判断：克我者（官杀），同阴阳为正官
    const dayElement = STEM_ELEMENTS[dayStemIdx];
    const guanShaElement = (dayElement + 3) % 5; // 克我者五行
    const dayStemIsYang = dayStemIdx % 2 === 0;
    
    let hasZhengGuan = false;
    let hasQiSha = false;
    for (const { pillar } of pillars) {
      const stemElement = STEM_ELEMENTS[pillar.ganIdx];
      if (stemElement === guanShaElement) {
        const stemIsYang = pillar.ganIdx % 2 === 0;
        if (stemIsYang !== dayStemIsYang) {
          // 异阴阳为正官
          hasZhengGuan = true;
        } else {
          // 同阴阳为七杀
          hasQiSha = true;
        }
      }
    }
    
    if (hasZhengGuan) {
      shenSha.push({
        name: '桃花正官',
        type: 'auspicious',
        description: '【情感婚姻·吉配】桃花+正官，异性贵人',
        location: '命局',
        effect: '感情端正，易得异性贵人相助；如董明珠（甲午日柱）之类成功人士配置'
      });
    }
    
    // 检测桃花+七杀组合 = 情色纠纷
    if (hasQiSha) {
      shenSha.push({
        name: '桃花七杀',
        type: 'inauspicious',
        description: '【情感婚姻·凶配】桃花+七杀，情色纠纷',
        location: '命局',
        effect: '感情激烈，易有情色纠纷；娱乐圈塌房艺人常见配置'
      });
    }
  }
  
  // 孤辰寡宿 - 根据年支查（《御定奇门宝鉴》）【情感婚姻核心神煞】
  // 传统查法：寅见巳，巳见申，申见亥（三合局前一位为孤辰，后一位为寡宿）
  // 古代：晚年孤苦；现代：独立研究者/数字游民的优势配置
  const guChenMap: Record<number, number[]> = {
    2: [5], 3: [5], 4: [5],     // 寅卯辰年 -> 巳为孤辰
    5: [8], 6: [8], 7: [8],     // 巳午未年 -> 申为孤辰
    8: [11], 9: [11], 10: [11], // 申酉戌年 -> 亥为孤辰
    11: [2], 0: [2], 1: [2],    // 亥子丑年 -> 寅为孤辰
  };
  const guaSuMap: Record<number, number[]> = {
    2: [1], 3: [1], 4: [1],     // 寅卯辰年 -> 丑为寡宿
    5: [4], 6: [4], 7: [4],     // 巳午未年 -> 辰为寡宿
    8: [7], 9: [7], 10: [7],    // 申酉戌年 -> 未为寡宿
    11: [10], 0: [10], 1: [10], // 亥子丑年 -> 戌为寡宿
  };
  const guChenBranches = guChenMap[yearBranchIdx] || [];
  const guaSuBranches = guaSuMap[yearBranchIdx] || [];
  let hasGuChen = false;
  let hasGuaSu = false;
  for (const { pillar, name } of pillars) {
    if (guChenBranches.includes(pillar.zhiIdx)) {
      hasGuChen = true;
      shenSha.push({
        name: '孤辰',
        type: 'inauspicious',
        description: '【情感婚姻】三合局前一位，主孤独清高',
        location: `${name}柱`,
        effect: '古代：晚年孤苦；现代转化：适合独立研究者/数字游民/自由职业者，享受独处'
      });
    }
    if (guaSuBranches.includes(pillar.zhiIdx)) {
      hasGuaSu = true;
      shenSha.push({
        name: '寡宿',
        type: 'inauspicious',
        description: '【情感婚姻】三合局后一位，主清冷孤寂',
        location: `${name}柱`,
        effect: '古代：感情淡漠；现代转化：内心世界丰富，适合艺术/学术/修行领域'
      });
    }
  }
  
  // 孤辰寡宿同现 - 特殊组合
  if (hasGuChen && hasGuaSu) {
    shenSha.push({
      name: '孤鸾寡鹄',
      type: 'inauspicious',
      description: '【情感婚姻·预警】孤辰+寡宿同现',
      location: '命局',
      effect: '婚姻波折可能性高；现代转化：极度独立，适合成为领域专家或精神导师'
    });
  }
  
  // 空亡 - 根据日柱旬查（《御定奇门宝鉴》）
  // 甲子旬空戌亥，甲戌旬空申酉，甲申旬空午未，甲午旬空辰巳，甲辰旬空寅卯，甲寅旬空子丑
  const dayPillar = pillars.find(p => p.name === '日');
  if (dayPillar) {
    const gap = (dayPillar.pillar.zhiIdx - dayPillar.pillar.ganIdx + 12) % 12;
    const void1 = (gap + 10) % 12;
    const void2 = (void1 + 1) % 12;
    for (const { pillar, name } of pillars) {
      if (pillar.zhiIdx === void1 || pillar.zhiIdx === void2) {
        shenSha.push({
          name: '空亡',
          type: 'inauspicious',
          description: '主空虚、落空之象',
          location: `${name}柱`,
          effect: '所临六亲或事项易有虚空之象'
        });
      }
    }
  }
  
  // 丧门吊客 - 根据年支查（《御定奇门宝鉴》）
  // 丧门：年前二位；吊客：年后二位
  const sangMenBranch = (yearBranchIdx + 2) % 12;
  const diaokeBranch = (yearBranchIdx + 10) % 12;
  for (const { pillar, name } of pillars) {
    if (pillar.zhiIdx === sangMenBranch) {
      shenSha.push({
        name: '丧门',
        type: 'inauspicious',
        description: '主丧服、哭泣之事',
        location: `${name}柱`,
        effect: '易有丧服之事，需防孝服'
      });
    }
    if (pillar.zhiIdx === diaokeBranch) {
      shenSha.push({
        name: '吊客',
        type: 'inauspicious',
        description: '主吊唁、悲伤之事',
        location: `${name}柱`,
        effect: '易有吊丧之事，心情抑郁'
      });
    }
  }
  
  // 白虎 - 根据年支查（《御定奇门宝鉴》）
  // 年前四位为白虎
  const baiHuBranch = (yearBranchIdx + 4) % 12;
  for (const { pillar, name } of pillars) {
    if (pillar.zhiIdx === baiHuBranch) {
      shenSha.push({
        name: '白虎',
        type: 'inauspicious',
        description: '主血光、伤灾之神',
        location: `${name}柱`,
        effect: '易有伤灾、血光之象'
      });
    }
  }
  
  // 天狗 - 根据年支查（《御定奇门宝鉴》）
  // 年后六位为天狗
  const tianGouBranch = (yearBranchIdx + 6) % 12;
  for (const { pillar, name } of pillars) {
    if (pillar.zhiIdx === tianGouBranch) {
      shenSha.push({
        name: '天狗',
        type: 'inauspicious',
        description: '主破财、口舌之神',
        location: `${name}柱`,
        effect: '易有破财、口舌是非'
      });
    }
  }
  
  // 元辰 - 根据年支查，男女有别（《御定奇门宝鉴》）
  // 男命：年支后五位；女命：年支前五位
  // 此处简化为通用查法
  const yuanChenBranch = (yearBranchIdx + 7) % 12;
  for (const { pillar, name } of pillars) {
    if (pillar.zhiIdx === yuanChenBranch) {
      shenSha.push({
        name: '元辰',
        type: 'inauspicious',
        description: '主破耗、灾祸之神',
        location: `${name}柱`,
        effect: '易有破财失物，精神不振'
      });
    }
  }
  
  // 天罗地网 - 根据地支查【重要凶煞】
  // 戌（天罗）见亥，辰（地网）见巳
  // 传统解释：官非牢狱；现代转化：互联网大数据行业（辰戌为信息库象）
  for (const { pillar: p1, name: n1 } of pillars) {
    for (const { pillar: p2, name: n2 } of pillars) {
      if (n1 !== n2) {
        // 戌见亥 = 天罗
        if (p1.zhiIdx === 10 && p2.zhiIdx === 11) {
          shenSha.push({
            name: '天罗',
            type: 'inauspicious',
            description: '【重要凶煞】戌见亥为天罗，主困顿阻碍',
            location: `${n1}柱戌-${n2}柱亥`,
            effect: '传统：易有官非诉讼；现代转化：适合互联网/大数据/信息库相关行业'
          });
          break;
        }
        // 辰见巳 = 地网
        if (p1.zhiIdx === 4 && p2.zhiIdx === 5) {
          shenSha.push({
            name: '地网',
            type: 'inauspicious',
            description: '【重要凶煞】辰见巳为地网，主困顿束缚',
            location: `${n1}柱辰-${n2}柱巳`,
            effect: '传统：易有牢狱之灾；现代转化：适合数据安全/网络技术相关行业'
          });
          break;
        }
      }
    }
  }
  // 辰戌同现 = 天罗地网
  const hasChen = pillars.some(p => p.pillar.zhiIdx === 4);
  const hasXu = pillars.some(p => p.pillar.zhiIdx === 10);
  if (hasChen && hasXu) {
    shenSha.push({
      name: '天罗地网',
      type: 'inauspicious',
      description: '【重要凶煞】辰戌同现，困顿与突破并存',
      location: '命局',
      effect: '传统：官非牢狱之象；现代转化：辰戌为信息库，适合互联网/大数据行业，困境即机遇'
    });
  }
  
  // ========== 黄金组合检测 ==========
  
  // 天月二德同现 - 顶级逢凶化吉组合
  const hasTianDe = shenSha.some(s => s.name === '天德贵人');
  const hasYueDe = shenSha.some(s => s.name === '月德贵人');
  if (hasTianDe && hasYueDe) {
    shenSha.push({
      name: '天月二德',
      type: 'auspicious',
      description: '【黄金组合】天德+月德同现，逢凶化吉的最强护身组合',
      location: '命局',
      effect: '大灾化小，小灾化无；一生贵人运极旺，遇难呈祥，万事逢凶化吉'
    });
  }
  
  // 文昌+学堂同现 - 学业黄金组合
  const hasWenChang = shenSha.some(s => s.name === '文昌贵人');
  const hasXueTang = shenSha.some(s => s.name === '学堂');
  if (hasWenChang && hasXueTang) {
    shenSha.push({
      name: '文昌学堂',
      type: 'auspicious',
      description: '【黄金组合】文昌+学堂同现，学业考试的最强配置',
      location: '命局',
      effect: '考试运倍增（效力+200%），科甲登第，学术成就斐然'
    });
  }
  
  // ========== 凶煞组合检测 ==========
  
  // 劫煞+亡神同现 - 血光预警
  const hasJieSha = shenSha.some(s => s.name === '劫煞');
  const hasWangShenInChart = shenSha.some(s => s.name === '亡神');
  if (hasJieSha && hasWangShenInChart) {
    shenSha.push({
      name: '劫亡同现',
      type: 'inauspicious',
      description: '【血光预警】劫煞+亡神同现，高危组合',
      location: '命局',
      effect: '易涉及黑社会/高危职业；流年引动时需特别注意安全，提前献血可化解部分煞气'
    });
  }
  
  // 羊刃+劫煞同现 - 极凶组合
  const hasYangRen = shenSha.some(s => s.name === '羊刃');
  if (hasYangRen && hasJieSha) {
    shenSha.push({
      name: '刃劫同现',
      type: 'inauspicious',
      description: '【极凶组合】羊刃+劫煞同现',
      location: '命局',
      effect: '意外灾祸风险极高，需特别注意人身安全与财物保管'
    });
  }
  
  return shenSha;
};

/**
 * 检测从格（弃命从格）
 * 条件：日主极弱（无本气通根） + 克泄耗（财官食伤）占绝对优势
 * 
 * 从格类型：
 * - 从财格：财星透干，地支财多，无比劫印透干
 * - 从杀格：官杀透干，地支官杀多或三合成官杀，无食伤印比透干
 * - 从儿格：食伤透干，地支食伤多或三合成食伤，无印官透干
 * - 从势格：不符合以上三种，但财官食伤占绝对优势
 */
const detectCongGe = (
  dayStemIdx: number,
  pillars: { pillar: GanZhi; name: string }[],
  dayMasterRoots: RootInfo[],
  stemAnalyses: StemAnalysis[]
): { isEstablished: boolean; type: string; description: string; conditions: string[]; favorableGods: string[]; unfavorableGods: string[]; fortuneAdvice: string } | null => {
  const dayElement = STEM_ELEMENTS[dayStemIdx];
  
  // 条件1：日主必须无根或极弱（本气通根）
  const hasMainRoot = dayMasterRoots.some(r => r.position === '本气');
  if (hasMainRoot) {
    return null;
  }
  
  // 计算日主力量
  const dayMasterStrength = dayMasterRoots.reduce((sum, r) => sum + r.weight, 0);
  if (dayMasterStrength > 0.5) {
    return null; // 日主还有一定力量，不适合从格
  }
  
  // 五行关系
  const controlMe = (dayElement + 3) % 5;  // 官杀
  const iGenerate = (dayElement + 1) % 5;  // 食伤
  const iControl = (dayElement + 2) % 5;   // 财
  const sameElement = dayElement;           // 比劫
  const generateMe = (dayElement + 4) % 5; // 印星
  
  // 统计各类十神
  const stemElements = pillars.map(p => STEM_ELEMENTS[p.pillar.ganIdx]);
  
  // 检查天干中是否有比劫印透干（破格因素）
  const hasBiJieInStems = stemElements.some(el => el === sameElement);
  const hasYinInStems = stemElements.some(el => el === generateMe);
  
  // 检查天干中是否有财官食伤透干
  const hasCaiInStems = stemElements.some(el => el === iControl);
  const hasGuanShaInStems = stemElements.some(el => el === controlMe);
  const hasShiShangInStems = stemElements.some(el => el === iGenerate);
  
  // 统计地支藏干中各五行的数量
  const branchElementCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const { pillar } of pillars) {
    const hiddenStems = BRANCH_HIDDEN_STEMS[pillar.zhiIdx] || [];
    if (hiddenStems.length > 0) {
      const mainElement = STEM_ELEMENTS[hiddenStems[0]];
      branchElementCounts[mainElement] += 1;
    }
  }
  
  // 从格基本条件：克泄耗占绝对优势（至少3柱）
  const exhaustPillarCount = branchElementCounts[controlMe] + branchElementCounts[iControl] + branchElementCounts[iGenerate];
  if (exhaustPillarCount < 2) {
    return null;
  }
  
  // 尝试判断具体从格类型
  let congType = '';
  let congDesc = '';
  let favorableGods: string[] = [];
  let unfavorableGods: string[] = [];
  let fortuneAdvice = '';
  let isEstablished = false;
  
  // 1. 从财格判定
  if (hasCaiInStems && branchElementCounts[iControl] >= 2 && !hasBiJieInStems && !hasYinInStems) {
    congType = '从财格';
    congDesc = '日元极弱，财星透干，地支财多，无比劫印透干，从财格成立';
    favorableGods = ['财', '食伤'];
    unfavorableGods = ['印', '比劫'];
    fortuneAdvice = '从财格成，局中喜见食伤生财。运忌行印星、比劫来生扶帮身，反主灾疾';
    isEstablished = true;
  }
  // 2. 从杀格判定
  else if (hasGuanShaInStems && branchElementCounts[controlMe] >= 2 && !hasShiShangInStems && !hasBiJieInStems && !hasYinInStems) {
    congType = '从杀格';
    congDesc = '日元极弱，官杀透干，地支官杀多，无食伤印比透干，从杀格成立';
    favorableGods = ['杀', '财'];
    unfavorableGods = ['印', '比劫', '食伤'];
    fortuneAdvice = '从官杀格成，局中喜见财星，才能富贵全美；若不见财星，只是贵而不富';
    isEstablished = true;
  }
  // 3. 从儿格判定
  else if (hasShiShangInStems && branchElementCounts[iGenerate] >= 2 && !hasYinInStems && !hasGuanShaInStems) {
    congType = '从儿格';
    congDesc = '日元极弱，食伤透干，地支食伤多，无印官透干，从儿格成立';
    favorableGods = ['食伤', '财'];
    unfavorableGods = ['印', '官'];
    fortuneAdvice = '局中喜见比劫（但不可太旺），定要见财星且不能被克破，从儿格才真';
    isEstablished = true;
  }
  // 4. 从势格判定（不符合以上三种，但财官食伤占绝对优势）
  else if (exhaustPillarCount >= 3 && !hasBiJieInStems && !hasYinInStems) {
    congType = '从势格';
    
    // 从势格特殊：以食伤决定贵气大小
    const shiShangCount = branchElementCounts[iGenerate];
    if (shiShangCount >= 2 || hasShiShangInStems) {
      congDesc = '日元极弱，月令为财星/官杀/食伤，局中干支都是财星/官杀/食伤，不符合从财/从杀/从儿格，从势格成立。局中见食伤，贵气较大';
    } else {
      congDesc = '日元极弱，财官食伤占绝对优势，从势格成立。局中食伤不见或数量少，主富而不贵';
    }
    
    favorableGods = ['财', '官', '食伤'];
    unfavorableGods = ['印', '比劫'];
    fortuneAdvice = '从势格以食伤决定命造贵气大小。运忌行印星、比劫来生扶帮身，反主灾疾。亦忌月支逢岁运来冲克';
    isEstablished = true;
  }
  
  if (!isEstablished) {
    return null;
  }
  
  return {
    isEstablished: true,
    type: congType,
    description: congDesc,
    conditions: [
      '日主无本气通根，日元极弱',
      congType === '从财格' ? '财星透干，地支财多' :
      congType === '从杀格' ? '官杀透干，地支官杀多' :
      congType === '从儿格' ? '食伤透干，地支食伤多' :
      '财官食伤占绝对优势',
      '无比劫印星透干破格'
    ],
    favorableGods,
    unfavorableGods,
    fortuneAdvice
  };
};

/**
 * 检测专旺格（一行得气格）
 * 条件：三合局成立 + 同党（比劫印）占3柱或以上
 * 
 * 专旺格类型：
 * - 曲直格（木）、炎上格（火）、稼穑格（土）、从革格（金）、润下格（水）
 */
const detectZhuanWangGe = (
  dayStemIdx: number,
  pillars: { pillar: GanZhi; name: string }[],
  monthBranchIdx: number
): { isEstablished: boolean; type: string; description: string; conditions: string[]; favorableGods: string[]; unfavorableGods: string[]; fortuneAdvice: string } | null => {
  const dayElement = STEM_ELEMENTS[dayStemIdx];
  const branches = pillars.map(p => p.pillar.zhiIdx);
  
  // 同党五行：日主本身 + 生我
  const sameElement = dayElement;
  const generateMe = (dayElement + 4) % 5;
  const allyElements = [sameElement, generateMe];
  
  // 检查三合局或方局
  const sanHeJu = [
    { branches: [8, 0, 4], element: 4, name: '申子辰三合水局' },   // 水
    { branches: [11, 3, 7], element: 0, name: '亥卯未三合木局' },  // 木
    { branches: [2, 6, 10], element: 1, name: '寅午戌三合火局' },  // 火
    { branches: [5, 9, 1], element: 3, name: '巳酉丑三合金局' },   // 金
  ];
  
  // 方局（三会局）
  const fangJu = [
    { branches: [2, 3, 4], element: 0, name: '寅卯辰三会木局' },   // 木
    { branches: [5, 6, 7], element: 1, name: '巳午未三会火局' },   // 火
    { branches: [8, 9, 10], element: 3, name: '申酉戌三会金局' },  // 金
    { branches: [11, 0, 1], element: 4, name: '亥子丑三会水局' },  // 水
    { branches: [4, 7, 10, 1], element: 2, name: '辰戌丑未四库土局' }, // 土
  ];
  
  let formedJu: { branches: number[]; element: number; name: string } | null = null;
  
  // 优先检查三合局
  for (const ju of sanHeJu) {
    if (ju.branches.every(b => branches.includes(b))) {
      if (allyElements.includes(ju.element)) {
        formedJu = ju;
        break;
      }
    }
  }
  
  // 如果没有三合局，检查方局
  if (!formedJu) {
    for (const ju of fangJu) {
      const requiredCount = ju.branches.length === 4 ? 3 : ju.branches.length; // 土局需要至少3个
      const matchCount = ju.branches.filter(b => branches.includes(b)).length;
      if (matchCount >= requiredCount) {
        if (allyElements.includes(ju.element)) {
          formedJu = ju;
          break;
        }
      }
    }
  }
  
  if (!formedJu) {
    return null;
  }
  
  // 统计同党柱数
  let allyPillarCount = 0;
  const allyPillars: string[] = [];
  
  for (const { pillar, name } of pillars) {
    const stemElement = STEM_ELEMENTS[pillar.ganIdx];
    const hiddenStems = BRANCH_HIDDEN_STEMS[pillar.zhiIdx] || [];
    const branchMainElement = hiddenStems.length > 0 ? STEM_ELEMENTS[hiddenStems[0]] : -1;
    
    if (allyElements.includes(stemElement) || allyElements.includes(branchMainElement)) {
      allyPillarCount++;
      allyPillars.push(name);
    }
  }
  
  // 条件：同党占3柱或以上
  if (allyPillarCount >= 3) {
    // 根据日主五行确定专旺格类型
    const wangGeNames: Record<number, string> = {
      0: '曲直格',   // 木
      1: '炎上格',   // 火
      2: '稼穑格',   // 土
      3: '从革格',   // 金
      4: '润下格',   // 水
    };
    
    // 专旺格喜忌和运势
    const wangGeInfo: Record<number, { favorable: string[]; unfavorable: string[]; fortune: string }> = {
      0: { 
        favorable: ['木', '水'], 
        unfavorable: ['金'],
        fortune: '曲直格忌运行官杀（金），主破败、凶灾、疾厄、意外、刑伤。亦忌月支逢岁运来冲克'
      },
      1: { 
        favorable: ['火', '木'], 
        unfavorable: ['水'],
        fortune: '炎上格忌运行官杀（水），主破败、凶灾。亦忌月支逢岁运来冲克'
      },
      2: { 
        favorable: ['土', '火'], 
        unfavorable: ['木'],
        fortune: '稼穑格忌运行官杀（木），主破败、凶灾。土旺需火生扶'
      },
      3: { 
        favorable: ['金', '土'], 
        unfavorable: ['火'],
        fortune: '从革格忌运行官杀（火），运逢火主凶灾'
      },
      4: { 
        favorable: ['水', '金'], 
        unfavorable: ['土'],
        fortune: '润下格忌运行官杀（土），运逢土主凶灾'
      },
    };
    
    const geName = wangGeNames[dayElement] || '专旺格';
    const info = wangGeInfo[dayElement] || { favorable: [], unfavorable: [], fortune: '' };
    
    // 检查月支是否被冲
    const monthBranch = monthBranchIdx;
    const chongMap: Record<number, number> = { 0: 6, 1: 7, 2: 8, 3: 9, 4: 10, 5: 11, 6: 0, 7: 1, 8: 2, 9: 3, 10: 4, 11: 5 };
    const chongBranch = chongMap[monthBranch];
    const hasMonthChong = branches.includes(chongBranch);
    
    let fortuneAdvice = info.fortune;
    if (hasMonthChong) {
      fortuneAdvice += '。原命局月支逢他支来冲，反主一生多波折，多冲击、奔波、出外、多阻难';
    }
    
    return {
      isEstablished: true,
      type: geName,
      description: `${formedJu.name}成局，同党占${allyPillarCount}柱，${ELEMENT_NAMES[dayElement]}气专旺`,
      conditions: [
        formedJu.name,
        `同党（比劫印）占${allyPillarCount}柱（${allyPillars.join('、')}）`
      ],
      favorableGods: info.favorable,
      unfavorableGods: info.unfavorable,
      fortuneAdvice
    };
  }
  
  return null;
};

/**
 * 检测化气格
 * 条件：天干五合 + 化神透干 + 无破
 * 五合化：甲己合化土、乙庚合化金、丙辛合化水、丁壬合化木、戊癸合化火
 */
const detectHuaQiGe = (
  dayStemIdx: number,
  pillars: { pillar: GanZhi; name: string }[],
  monthBranchIdx: number
): { isEstablished: boolean; type: string; description: string; conditions: string[] } | null => {
  const stems = pillars.map(p => p.pillar.ganIdx);
  
  // 五合配对及化神
  const wuHeHua: { pair: [number, number]; huaElement: number; name: string }[] = [
    { pair: [0, 5], huaElement: 2, name: '甲己合化土' },
    { pair: [1, 6], huaElement: 3, name: '乙庚合化金' },
    { pair: [2, 7], huaElement: 4, name: '丙辛合化水' },
    { pair: [3, 8], huaElement: 0, name: '丁壬合化木' },
    { pair: [4, 9], huaElement: 1, name: '戊癸合化火' },
  ];
  
  // 检查日干是否参与五合
  for (const { pair, huaElement, name } of wuHeHua) {
    const [stemA, stemB] = pair;
    
    // 日干必须是合的一方
    if (dayStemIdx !== stemA && dayStemIdx !== stemB) {
      continue;
    }
    
    // 检查另一方是否在天干中（必须相邻才能合）
    const otherStem = dayStemIdx === stemA ? stemB : stemA;
    let hasAdjacentHe = false;
    
    // 月干与日干相合
    if (pillars.length >= 2 && pillars[1].pillar.ganIdx === otherStem) {
      hasAdjacentHe = true;
    }
    // 时干与日干相合（如果有时柱）
    if (pillars.length >= 4 && pillars[3].pillar.ganIdx === otherStem) {
      hasAdjacentHe = true;
    }
    
    if (!hasAdjacentHe) {
      continue;
    }
    
    // 条件2：化神透干（化神五行的天干在四柱天干中出现）
    const huaStemIndices = [huaElement * 2, huaElement * 2 + 1]; // 阳干和阴干
    const hasHuaShenTouGan = stems.some(s => huaStemIndices.includes(s));
    
    if (!hasHuaShenTouGan) {
      continue;
    }
    
    // 条件3：无破（检查是否有克化神的五行）
    // 克化神的五行
    const breakElement = (huaElement + 3) % 5;
    const breakStemIndices = [breakElement * 2, breakElement * 2 + 1];
    
    // 检查天干是否有破
    const hasTianGanBreak = stems.some(s => breakStemIndices.includes(s));
    
    // 检查月令是否克化神
    const monthRulingElement = MONTH_RULING_ELEMENT[monthBranchIdx];
    const hasMonthBreak = monthRulingElement === breakElement;
    
    if (hasTianGanBreak || hasMonthBreak) {
      continue;
    }
    
    // 化气格成立
    return {
      isEstablished: true,
      type: `化${ELEMENT_NAMES[huaElement]}格`,
      description: `${name}，化神透干，无破化气成格`,
      conditions: [
        name,
        `${ELEMENT_NAMES[huaElement]}神透干`,
        '无克破'
      ]
    };
  }
  
  return null;
};

/**
 * 判断特殊格局（吉格凶格）
 */
const calculateSpecialPatterns = (
  pillars: { pillar: GanZhi; name: string }[],
  dayStemIdx: number,
  monthBranchIdx: number,
  stemAnalyses: StemAnalysis[],
  dayMasterStrength: 'strong' | 'weak' | 'neutral',
  dayMasterRoots: RootInfo[]
): SpecialPatternInfo[] => {
  const patterns: SpecialPatternInfo[] = [];
  const stems = pillars.map(p => p.pillar.ganIdx);
  const branches = pillars.map(p => p.pillar.zhiIdx);
  
  // ===== 特殊格局优先检测 =====
  
  // 1. 从格检测
  const congGe = detectCongGe(dayStemIdx, pillars, dayMasterRoots, stemAnalyses);
  if (congGe) {
    patterns.push({
      name: congGe.type,
      type: 'auspicious',
      description: `${congGe.description}。喜用：${congGe.favorableGods.join('、')}；忌：${congGe.unfavorableGods.join('、')}。${congGe.fortuneAdvice}`,
      conditions: congGe.conditions,
      isEstablished: true
    });
  }
  
  // 2. 专旺格检测
  const zhuanWangGe = detectZhuanWangGe(dayStemIdx, pillars, monthBranchIdx);
  if (zhuanWangGe) {
    patterns.push({
      name: zhuanWangGe.type,
      type: 'auspicious',
      description: `${zhuanWangGe.description}。喜用：${zhuanWangGe.favorableGods.join('、')}；忌：${zhuanWangGe.unfavorableGods.join('、')}。${zhuanWangGe.fortuneAdvice}`,
      conditions: zhuanWangGe.conditions,
      isEstablished: true
    });
  }
  
  // 3. 化气格检测
  const huaQiGe = detectHuaQiGe(dayStemIdx, pillars, monthBranchIdx);
  if (huaQiGe) {
    patterns.push({
      name: huaQiGe.type,
      type: 'auspicious',
      description: huaQiGe.description,
      conditions: huaQiGe.conditions,
      isEstablished: true
    });
  }
  
  // ===== 常规格局检测 =====
  
  // 三奇贵人 - 天上三奇（甲戊庚）、地下三奇（乙丙丁）、人中三奇（壬癸辛）
  const hasTianSanQi = stems.includes(0) && stems.includes(4) && stems.includes(6);
  const hasDiSanQi = stems.includes(1) && stems.includes(2) && stems.includes(3);
  const hasRenSanQi = stems.includes(8) && stems.includes(9) && stems.includes(7);
  
  if (hasTianSanQi) {
    patterns.push({
      name: '天上三奇',
      type: 'auspicious',
      description: '甲戊庚三干齐现，主聪慧过人',
      conditions: ['天干见甲', '天干见戊', '天干见庚'],
      isEstablished: true
    });
  }
  if (hasDiSanQi) {
    patterns.push({
      name: '地下三奇',
      type: 'auspicious',
      description: '乙丙丁三干齐现，主才华横溢',
      conditions: ['天干见乙', '天干见丙', '天干见丁'],
      isEstablished: true
    });
  }
  if (hasRenSanQi) {
    patterns.push({
      name: '人中三奇',
      type: 'auspicious',
      description: '壬癸辛三干齐现，主机智聪敏',
      conditions: ['天干见壬', '天干见癸', '天干见辛'],
      isEstablished: true
    });
  }
  
  // 天干五合检查
  const wuHeCheck = (a: number, b: number): boolean => {
    const pairs = [[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]];
    return pairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
  };
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      if (wuHeCheck(stems[i], stems[j])) {
        const heNames = ['甲己合', '乙庚合', '丙辛合', '丁壬合', '戊癸合'];
        const pairs = [[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]];
        const heName = pairs.findIndex(([x, y]) => 
          (stems[i] === x && stems[j] === y) || (stems[i] === y && stems[j] === x)
        );
        patterns.push({
          name: heNames[heName] || '天干合',
          type: 'auspicious',
          description: `${pillars[i].name}干与${pillars[j].name}干相合`,
          conditions: [`${HEAVENLY_STEMS[stems[i]]}与${HEAVENLY_STEMS[stems[j]]}相合`],
          isEstablished: true
        });
      }
    }
  }
  
  // 地支三合局
  const sanHeJu = [
    { branches: [8, 0, 4], element: '水', name: '申子辰三合水局' },
    { branches: [11, 3, 7], element: '木', name: '亥卯未三合木局' },
    { branches: [2, 6, 10], element: '火', name: '寅午戌三合火局' },
    { branches: [5, 9, 1], element: '金', name: '巳酉丑三合金局' },
  ];
  for (const ju of sanHeJu) {
    if (ju.branches.every(b => branches.includes(b))) {
      patterns.push({
        name: ju.name,
        type: 'auspicious',
        description: `地支形成${ju.element}局，${ju.element}气旺盛`,
        conditions: ju.branches.map(b => `地支见${EARTHLY_BRANCHES[b]}`),
        isEstablished: true
      });
    }
  }
  
  // 地支六冲
  const liuChong = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];
  const chongNames = ['子午冲', '丑未冲', '寅申冲', '卯酉冲', '辰戌冲', '巳亥冲'];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const chongIdx = liuChong.findIndex(([a, b]) => 
        (branches[i] === a && branches[j] === b) || (branches[i] === b && branches[j] === a)
      );
      if (chongIdx !== -1) {
        patterns.push({
          name: chongNames[chongIdx],
          type: 'inauspicious',
          description: `${pillars[i].name}支与${pillars[j].name}支相冲，动荡不安`,
          conditions: [`${EARTHLY_BRANCHES[branches[i]]}与${EARTHLY_BRANCHES[branches[j]]}相冲`],
          isEstablished: true
        });
      }
    }
  }
  
  // 天干相冲（对冲）- 甲庚、乙辛、丙壬、丁癸
  const ganChong = [[0, 6], [1, 7], [2, 8], [3, 9]];
  const ganChongNames = ['甲庚冲', '乙辛冲', '丙壬冲', '丁癸冲'];
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const chongIdx = ganChong.findIndex(([a, b]) => 
        (stems[i] === a && stems[j] === b) || (stems[i] === b && stems[j] === a)
      );
      if (chongIdx !== -1) {
        patterns.push({
          name: ganChongNames[chongIdx],
          type: 'inauspicious',
          description: `${pillars[i].name}干与${pillars[j].name}干相冲，冲克不和`,
          conditions: [`${HEAVENLY_STEMS[stems[i]]}与${HEAVENLY_STEMS[stems[j]]}相冲`],
          isEstablished: true
        });
      }
    }
  }
  
  return patterns;
};

/**
 * 生成运势喜忌分析
 */
const generateFortuneAnalysis = (
  dayElement: number,
  dayMasterStrength: 'strong' | 'weak' | 'neutral',
  favorableGods: FavorableGod[],
  unfavorableGods: FavorableGod[]
): FortuneAnalysis => {
  const strengthText = dayMasterStrength === 'strong' ? '身强' : 
                       dayMasterStrength === 'weak' ? '身弱' : '中和';
  
  // 喜用五行对应的年份干支
  const elementYears: Record<number, string[]> = {
    0: ['甲、乙年', '寅、卯年'], // 木
    1: ['丙、丁年', '巳、午年'], // 火
    2: ['戊、己年', '辰、戌、丑、未年'], // 土
    3: ['庚、辛年', '申、酉年'], // 金
    4: ['壬、癸年', '亥、子年'], // 水
  };
  
  const favorableYears: string[] = [];
  const unfavorableYears: string[] = [];
  
  for (const god of favorableGods) {
    const years = elementYears[god.element];
    if (years) {
      favorableYears.push(...years.map(y => `${god.elementName}（${y}）`));
    }
  }
  
  for (const god of unfavorableGods) {
    const years = elementYears[god.element];
    if (years) {
      unfavorableYears.push(...years.map(y => `${god.elementName}（${y}）`));
    }
  }
  
  // 生成建议
  const advices: string[] = [];
  if (dayMasterStrength === 'strong') {
    advices.push('身强宜从事需要魄力、担当的事业');
    advices.push('宜多行善事，化解过旺之气');
    advices.push('选择事业时可偏向财运、官运方向');
  } else if (dayMasterStrength === 'weak') {
    advices.push('身弱宜低调稳健，避免过度劳累');
    advices.push('宜多结交贵人，寻求帮助');
    advices.push('选择事业时可偏向文职、技术方向');
  } else {
    advices.push('中和命局适应性强，可多方发展');
    advices.push('注意保持平衡，避免极端');
  }
  
  // 喜用神相关建议
  if (favorableGods.length > 0) {
    const firstFavorable = favorableGods[0];
    advices.push(`宜接近${firstFavorable.elementName}性行业或方位以增运`);
  }
  
  return {
    currentLuck: `${strengthText}之命，${favorableGods.length > 0 ? `喜${favorableGods[0].elementName}` : ''}`,
    favorableYears,
    unfavorableYears,
    advices
  };
};

/**
 * 分析日主强弱 - 使用传统得令/得地/得势方法
 * 得令：月令生扶日主（月支五行与日主同类或生日主）
 * 得地：日主在四柱地支有通根
 * 得势：天干有比劫印星帮扶
 */
// 日柱干支专旺组合（天干坐本气禄根）→ 可论平和
const PINGHE_DAY_PILLARS: [number, number][] = [
  [0, 2],  // 甲寅
  [2, 6],  // 丙午
  [4, 10], // 戊戌
  [5, 7],  // 己未
  [8, 0],  // 壬子
  [9, 11], // 癸亥
  [6, 8],  // 庚申
  [7, 9],  // 辛酉
  [1, 3],  // 乙卯
  [3, 5],  // 丁巳
];

const analyzeDayMasterStrength = (
  dayStemIdx: number,
  dayElement: number,
  pillars: { pillar: GanZhi; name: string }[],
  monthBranchIdx: number,
  dayMasterRoots: RootInfo[],
  stemAnalyses: StemAnalysis[],
  dayBranchIdx?: number
): DayMasterStrengthAnalysis => {
  // 生我的五行
  const generateMeElement = (dayElement + 4) % 5;
  // 月令五行
  const monthRulingElement = MONTH_RULING_ELEMENT[monthBranchIdx];
  
  // ===== 1. 得令判断 =====
  // 月令五行与日主同类，或生日主
  let deLing = false;
  let deLingDesc = '';
  
  if (monthRulingElement === dayElement) {
    // 月令与日主同类（比劫当令）
    deLing = true;
    deLingDesc = `月令${EARTHLY_BRANCHES[monthBranchIdx]}（${ELEMENT_NAMES[monthRulingElement]}）与日主同类，得令`;
  } else if (monthRulingElement === generateMeElement) {
    // 月令生日主（印星当令）
    deLing = true;
    deLingDesc = `月令${EARTHLY_BRANCHES[monthBranchIdx]}（${ELEMENT_NAMES[monthRulingElement]}）生扶日主，得令`;
  } else {
    // 检查月支藏干中是否有日主本气或印星本气
    const monthHiddenStems = BRANCH_HIDDEN_STEMS[monthBranchIdx] || [];
    const monthMainStemIdx = monthHiddenStems[0];
    const monthMainElement = STEM_ELEMENTS[monthMainStemIdx];
    
    if (monthMainElement === dayElement || monthMainElement === generateMeElement) {
      deLing = true;
      deLingDesc = `月令藏干${HEAVENLY_STEMS[monthMainStemIdx]}（${ELEMENT_NAMES[monthMainElement]}）${monthMainElement === dayElement ? '与日主同类' : '生扶日主'}，得令`;
    } else {
      deLingDesc = `月令${EARTHLY_BRANCHES[monthBranchIdx]}（${ELEMENT_NAMES[monthRulingElement]}）不生扶日主，失令`;
    }
  }
  
  // ===== 2. 得地判断 =====
  // 日主在地支有通根（本气通根权重高）
  let deDi = false;
  let deDiDesc = '';
  const mainRoots = dayMasterRoots.filter(r => r.position === '本气');
  const otherRoots = dayMasterRoots.filter(r => r.position !== '本气');
  
  if (mainRoots.length >= 2) {
    deDi = true;
    deDiDesc = `日主有${mainRoots.length}处本气通根（${mainRoots.map(r => r.pillarName + '支' + r.branch).join('、')}），得地有力`;
  } else if (mainRoots.length === 1 && otherRoots.length >= 1) {
    deDi = true;
    deDiDesc = `日主有${mainRoots.length}处本气、${otherRoots.length}处余气通根，得地`;
  } else if (mainRoots.length === 1) {
    deDi = true;
    deDiDesc = `日主有${mainRoots.length}处本气通根（${mainRoots[0].pillarName}支${mainRoots[0].branch}），得地`;
  } else if (otherRoots.length >= 2) {
    deDi = true;
    deDiDesc = `日主有${otherRoots.length}处余气通根，勉强得地`;
  } else if (otherRoots.length === 1) {
    deDiDesc = `日主仅有1处余气通根（${otherRoots[0].pillarName}支${otherRoots[0].branch}），得地不力`;
  } else {
    deDiDesc = '日主在四柱地支无通根，失地';
  }
  
  // ===== 3. 得势判断 =====
  // 月柱天干五行生日主或同日主五行，即得势
  let deShi = false;
  let deShiDesc = '';
  
  const monthPillarEntry = pillars.find(p => p.name === '月柱') || pillars[1];
  const monthStemIdx = monthPillarEntry.pillar.ganIdx;
  const monthStemElement = STEM_ELEMENTS[monthStemIdx];
  
  if (monthStemElement === dayElement) {
    deShi = true;
    deShiDesc = `月干${HEAVENLY_STEMS[monthStemIdx]}（${ELEMENT_NAMES[monthStemElement]}）与日主同五行，得势`;
  } else if (monthStemElement === generateMeElement) {
    deShi = true;
    deShiDesc = `月干${HEAVENLY_STEMS[monthStemIdx]}（${ELEMENT_NAMES[monthStemElement]}）生扶日主，得势`;
  } else {
    deShiDesc = `月干${HEAVENLY_STEMS[monthStemIdx]}（${ELEMENT_NAMES[monthStemElement]}）不生扶日主，失势`;
  }
  
  // ===== 综合百分比评分 =====
  // 月令主气 (50%): 生助日主=得令50%, 克泄日主=0%
  let score = 0;
  if (deLing) score += 50;

  // 地支根气 (30%): 本气根=30%, 余气根=15%, 无根=0%
  // 热地加成（东南亚/赤道地区）：土根+25%, 木根-15%
  const mainQiRoots = dayMasterRoots.filter(r => r.position === '本气');
  const midQiRoots = dayMasterRoots.filter(r => r.position === '中气');
  const residualQiRoots = dayMasterRoots.filter(r => r.position === '余气');
  let rootScore = 0;
  if (mainQiRoots.length > 0) {
    rootScore = 30; // 有本气根=强根30%
  } else if (midQiRoots.length > 0 || residualQiRoots.length > 0) {
    rootScore = 15; // 只有中气/余气根=弱根15%
  }
  // 热地修正：土(2)根+25%, 木(0)根-15%
  if (rootScore > 0) {
    if (dayElement === 2) { // 土
      rootScore = Math.round(rootScore * 1.25);
    } else if (dayElement === 0) { // 木
      rootScore = Math.round(rootScore * 0.85);
    }
  }
  score += rootScore;
  // 无根=0%

  // 天干势力 (20%): 比劫≥2=得势20%, 克泄≥3=失势(0%)
  // 统计天干中比劫和克泄数量（不含日主本身）
  const biJieCount = stemAnalyses.filter(s => s.tenGodName === '比肩' || s.tenGodName === '劫财').length;
  const keXieCount = stemAnalyses.filter(s => 
    s.tenGodName === '食神' || s.tenGodName === '伤官' || 
    s.tenGodName === '正财' || s.tenGodName === '偏财' || 
    s.tenGodName === '正官' || s.tenGodName === '七杀'
  ).length;
  
  if (biJieCount >= 2) {
    score += 20; // 比劫≥2=得势20%
  } else if (keXieCount >= 3) {
    // 克泄≥3=失势，不加分
  }

  // ===== 综合判断（使用原有逻辑） =====
  // 得令最重要（占40%），得地次之（占35%），得势再次（占25%）
  let strength: 'strong' | 'weak' | 'neutral' = 'neutral';
  let strengthReason = '';
  
  const trueCount = [deLing, deDi, deShi].filter(Boolean).length;
  
  if (deLing && deDi && deShi) {
    strength = 'strong';
    strengthReason = '得令、得地、得势三者俱全，日主极旺（身强）';
  } else if (deLing && deDi) {
    strength = 'strong';
    strengthReason = '得令且得地，日主旺相（身强）';
  } else if (deLing && deShi) {
    strength = 'strong';
    strengthReason = '得令且得势，日主旺相（身强）';
  } else if (deLing) {
    if (dayMasterRoots.length > 0) {
      strength = 'neutral';
      strengthReason = '得令但地势不足，日主中和偏强';
    } else {
      strength = 'neutral';
      strengthReason = '仅得令，地势皆失，日主中和';
    }
  } else if (deDi && deShi) {
    strength = 'neutral';
    strengthReason = '失令但得地得势，日主中和偏强（平和）';
  } else if (deDi) {
    if (mainRoots.length >= 2) {
      strength = 'neutral';
      strengthReason = '失令但有多处本气通根，日主中和';
    } else {
      strength = 'weak';
      strengthReason = '失令且通根不力，日主偏弱（身弱）';
    }
  } else if (deShi) {
    strength = 'weak';
    strengthReason = '失令失地仅得势，日主偏弱（身弱）';
  } else {
    strength = 'weak';
    strengthReason = '失令、失地、失势，日主极弱（身弱）';
  }
  
  // ===== 额外平和条件 =====
  if (dayBranchIdx !== undefined && strength !== 'neutral') {
    const isPinghePillar = PINGHE_DAY_PILLARS.some(([g, z]) => g === dayStemIdx && z === dayBranchIdx);
    if (isPinghePillar) {
      strength = 'neutral';
      strengthReason += `；日柱${HEAVENLY_STEMS[dayStemIdx]}${EARTHLY_BRANCHES[dayBranchIdx]}为干支同气，可论平和`;
    }
  }

  // ===== 平和细分：偏强/平/偏弱 =====
  // Cap score at 0-100
  score = Math.max(0, Math.min(100, score));
  
  let subStrength: 'leaning_strong' | 'balanced' | 'leaning_weak' | undefined;
  let subStrengthDesc: string | undefined;
  
  if (strength === 'neutral') {
    // 热地加成说明
    const regionNote = (dayElement === 2 && rootScore > 0) ? '（含热地土根+25%加成）' :
                       (dayElement === 0 && rootScore > 0) ? '（含热地木根-15%修正）' : '';
    // 使用百分比评分细分
    // ≥60% = 偏强, 40%-59% = 平, <40% = 偏弱
    if (score >= 60) {
      subStrength = 'leaning_strong';
      subStrengthDesc = `综合得分${score}%${regionNote}（≥60%），平和偏强，可参考身强喜用`;
    } else if (score >= 40) {
      subStrength = 'balanced';
      subStrengthDesc = `综合得分${score}%${regionNote}（40%-59%），真正中和`;
    } else {
      subStrength = 'leaning_weak';
      subStrengthDesc = `综合得分${score}%${regionNote}（<40%），平和偏弱，可参考身弱喜用`;
    }
  }

  return {
    deLing,
    deLingDesc,
    deDi,
    deDiDesc,
    deDiRoots: dayMasterRoots,
    deShi,
    deShiDesc,
    deShiCount: deShi ? 1 : 0,
    strength,
    strengthReason,
    strengthScore: score,
    subStrength,
    subStrengthDesc,
  };
};

/**
 * 计算自坐 - 日干与日支的关系
 */
const calculateSelfSitting = (dayStemIdx: number, dayBranchIdx: number): SelfSittingInfo => {
  const dayBranchHiddenStems = BRANCH_HIDDEN_STEMS[dayBranchIdx] || [];
  const mainHiddenStemIdx = dayBranchHiddenStems[0]; // 日支本气
  const mainHiddenElement = STEM_ELEMENTS[mainHiddenStemIdx];
  
  // 计算日干与日支本气的十神关系
  const tenGodType = getTenGodType(dayStemIdx, mainHiddenStemIdx);
  const tenGodName = TEN_GOD_NAMES[tenGodType];
  
  // 生成描述
  const descriptions: Record<number, string> = {
    0: '日坐比肩，自立自强，独立性强',
    1: '日坐劫财，竞争心强，破财之象',
    2: '日坐食神，福气厚重，心宽体胖',
    3: '日坐伤官，才华横溢，个性鲜明',
    4: '日坐偏财，财运流动，善于经营',
    5: '日坐正财，财源稳定，持家有方',
    6: '日坐七杀，压力较大，有魄力担当',
    7: '日坐正官，端正稳重，受人尊敬',
    8: '日坐偏印，思维独特，易有孤独',
    9: '日坐正印，受人照顾，有贵人缘',
  };
  
  return {
    relationship: tenGodName,
    element: mainHiddenElement,
    elementName: ELEMENT_NAMES[mainHiddenElement],
    description: descriptions[tenGodType] || '',
  };
};

/**
 * 计算旺相休囚死 - 日主在月令的状态
 * 依据《御定奇门宝鉴》五行旺相休囚死规则：
 * - 旺：当令之行
 * - 相：令生之行
 * - 休：生令之行
 * - 囚：克令之行
 * - 死：令克之行
 */
const calculateSeasonalStrength = (dayElement: number, monthBranchIdx: number): SeasonalStrengthInfo => {
  const monthRulingElement = MONTH_RULING_ELEMENT[monthBranchIdx];
  
  // 五行相生关系：木生火, 火生土, 土生金, 金生水, 水生木
  // (element + 1) % 5 是 element 所生之行
  // (element + 4) % 5 是生 element 之行
  // (element + 2) % 5 是 element 所克之行
  // (element + 3) % 5 是克 element 之行
  
  let state: '旺' | '相' | '休' | '囚' | '死';
  let description: string;
  
  if (dayElement === monthRulingElement) {
    // 日主与月令同行 - 旺
    state = '旺';
    description = `日主${ELEMENT_NAMES[dayElement]}在${ELEMENT_NAMES[monthRulingElement]}月当令，气势最强`;
  } else if ((monthRulingElement + 1) % 5 === dayElement) {
    // 月令生日主 - 相
    state = '相';
    description = `月令${ELEMENT_NAMES[monthRulingElement]}生日主${ELEMENT_NAMES[dayElement]}，得生扶之力`;
  } else if ((dayElement + 1) % 5 === monthRulingElement) {
    // 日主生月令 - 休
    state = '休';
    description = `日主${ELEMENT_NAMES[dayElement]}生月令${ELEMENT_NAMES[monthRulingElement]}，泄气休息`;
  } else if ((dayElement + 2) % 5 === monthRulingElement) {
    // 日主克月令 - 囚
    state = '囚';
    description = `日主${ELEMENT_NAMES[dayElement]}克月令${ELEMENT_NAMES[monthRulingElement]}，受困被囚`;
  } else {
    // 月令克日主 - 死
    state = '死';
    description = `月令${ELEMENT_NAMES[monthRulingElement]}克日主${ELEMENT_NAMES[dayElement]}，气势最弱`;
  }
  
  return { state, description };
}

/**
 * 主分析函数 - 分析八字格局
 */
export const analyzeBaziPattern = (pillars: FourPillars, includeHour: boolean = true): BaziAnalysisResult => {
  const dayStemIdx = pillars.day.ganIdx;
  const dayElement = STEM_ELEMENTS[dayStemIdx];
  const monthBranchIdx = pillars.month.zhiIdx;
  const dayBranchIdx = pillars.day.zhiIdx;
  const yearBranchIdx = pillars.year.zhiIdx;
  
  // 构建四柱数组
  const pillarArray: { pillar: GanZhi; name: string }[] = [
    { pillar: pillars.year, name: '年' },
    { pillar: pillars.month, name: '月' },
    { pillar: pillars.day, name: '日' },
  ];
  if (includeHour) {
    pillarArray.push({ pillar: pillars.hour, name: '时' });
  }
  
  // 分析每个天干（不含日主本身）
  const stemAnalyses: StemAnalysis[] = [];
  
  // 年干
  stemAnalyses.push(analyzeStem(pillars.year.ganIdx, '年', dayStemIdx, pillarArray, monthBranchIdx));
  // 月干
  stemAnalyses.push(analyzeStem(pillars.month.ganIdx, '月', dayStemIdx, pillarArray, monthBranchIdx));
  // 时干（如果有）
  if (includeHour) {
    stemAnalyses.push(analyzeStem(pillars.hour.ganIdx, '时', dayStemIdx, pillarArray, monthBranchIdx));
  }
  
  // 日主通根分析
  const dayMasterRoots = findRoots(dayStemIdx, pillarArray, monthBranchIdx);
  const dayMasterRootStrength = dayMasterRoots.reduce((sum, r) => sum + r.weight, 0);
  
  // 计算五行力量
  const elementStrengths = calculateElementStrengths(pillarArray, monthBranchIdx);
  
  // 判断日主强弱 - 使用传统得令/得地/得势方法
  const strengthAnalysis = analyzeDayMasterStrength(
    dayStemIdx, 
    dayElement, 
    pillarArray, 
    monthBranchIdx, 
    dayMasterRoots, 
    stemAnalyses,
    dayBranchIdx
  );
  const dayMasterStrengthLevel = strengthAnalysis.strength;
  
  // 判断格局
  const pattern = determinePattern(dayStemIdx, monthBranchIdx, stemAnalyses, dayMasterRootStrength);
  
  // 汇总所有通根
  const allRoots = stemAnalyses.flatMap(s => s.roots);
  
  // 收集八字中所有天干
  const chartStems = [pillars.year.ganIdx, pillars.month.ganIdx, pillars.day.ganIdx];
  if (includeHour) chartStems.push(pillars.hour.ganIdx);
  
  // 收集八字中所有地支
  const chartBranches = [pillars.year.zhiIdx, pillars.month.zhiIdx, pillars.day.zhiIdx];
  if (includeHour) chartBranches.push(pillars.hour.zhiIdx);
  
  // 计算喜用神和忌神（平和命局使用调候表）
  const { favorable, unfavorable, wealthGods, tiaohou } = calculateFavorableGods(
    dayElement, 
    dayMasterStrengthLevel, 
    isYangStem(dayStemIdx),
    dayStemIdx,
    monthBranchIdx,
    chartStems,
    chartBranches,
    strengthAnalysis.subStrength
  );
  
  // 计算神煞
  const shenSha = calculateShenSha(pillarArray, dayStemIdx, dayBranchIdx, yearBranchIdx);
  
  // 计算特殊格局
  const specialPatterns = calculateSpecialPatterns(
    pillarArray, 
    dayStemIdx, 
    monthBranchIdx, 
    stemAnalyses,
    dayMasterStrengthLevel,
    dayMasterRoots
  );
  
  // 生成运势分析
  const fortuneAnalysis = generateFortuneAnalysis(
    dayElement,
    dayMasterStrengthLevel,
    favorable,
    unfavorable
  );
  
  // 计算自坐
  const selfSitting = calculateSelfSitting(dayStemIdx, dayBranchIdx);
  
  // 计算旺相休囚死
  const seasonalStrength = calculateSeasonalStrength(dayElement, monthBranchIdx);
  
  return {
    dayMaster: {
      stem: HEAVENLY_STEMS[dayStemIdx],
      stemIdx: dayStemIdx,
      element: dayElement,
      elementName: ELEMENT_NAMES[dayElement],
      isYang: isYangStem(dayStemIdx),
      strength: dayMasterStrengthLevel,
      rootStrength: dayMasterRootStrength,
      strengthAnalysis,
      selfSitting,
      seasonalStrength,
    },
    stemAnalyses,
    allRoots,
    pattern,
    monthBranch: {
      branch: EARTHLY_BRANCHES[monthBranchIdx],
      branchIdx: monthBranchIdx,
      rulingElement: MONTH_RULING_ELEMENT[monthBranchIdx],
      rulingElementName: ELEMENT_NAMES[MONTH_RULING_ELEMENT[monthBranchIdx]],
    },
    elementStrengths,
    favorableGods: favorable,
    unfavorableGods: unfavorable,
    wealthGods,
    tiaohou,
    shenSha,
    specialPatterns,
    fortuneAnalysis,
  };
};

/**
 * 格式化通根信息为显示文本
 */
export const formatRootInfo = (roots: RootInfo[]): string => {
  if (roots.length === 0) return '无根';
  return roots.map(r => `${r.pillarName}支${r.branch}(${r.position})`).join('、');
};

/**
 * 格式化通根强度信息
 */
export const formatRootStrength = (analysis: StemAnalysis): string => {
  if (!analysis.isRooted) {
    // 检查是否有气（印星生扶）
    if (analysis.qiSupport.hasQi) {
      return `无根但${analysis.qiSupport.description}`;
    }
    return '无根无气，虚浮无力';
  }
  
  const rootDescs: string[] = [];
  if (analysis.hasMainQiRoot) {
    rootDescs.push('本气通根');
  }
  if (analysis.hasMidQiRoot) {
    rootDescs.push('中气通根');
  }
  if (analysis.hasResidualQiRoot) {
    rootDescs.push('余气通根');
  }
  
  let result = rootDescs.join('、');
  
  if (analysis.rootInjury.isInjured) {
    result += `，但${analysis.rootInjury.description}`;
  }
  
  if (analysis.qiSupport.hasQi) {
    result += `，兼${analysis.qiSupport.description}`;
  }
  
  return result;
};

/**
 * 格式化十神根气信息为简洁显示
 */
export const formatTenGodRootStatus = (analysis: StemAnalysis): {
  status: 'strong' | 'weak' | 'injured' | 'none' | 'qi-only';
  label: string;
  description: string;
} => {
  if (!analysis.isRooted) {
    if (analysis.qiSupport.hasQi) {
      return {
        status: 'qi-only',
        label: '有气',
        description: analysis.qiSupport.description,
      };
    }
    return {
      status: 'none',
      label: '无根',
      description: '虚浮无力',
    };
  }
  
  if (analysis.rootInjury.isInjured) {
    return {
      status: 'injured',
      label: '根伤',
      description: analysis.rootInjury.description || '根基受损',
    };
  }
  
  if (analysis.hasMainQiRoot) {
    return {
      status: 'strong',
      label: '强根',
      description: '本气通根，根深蒂固',
    };
  }
  
  return {
    status: 'weak',
    label: '弱根',
    description: analysis.hasMidQiRoot ? '中气通根' : '余气通根',
  };
};

/**
 * 格式化格局分析结果
 */
export const formatPatternSummary = (result: BaziAnalysisResult): string => {
  const { dayMaster, pattern, monthBranch } = result;
  const strengthText = dayMaster.strength === 'strong' ? '身强' : dayMaster.strength === 'weak' ? '身弱' : '中和';
  return `${pattern.name}（${strengthText}）- ${pattern.description}`;
};
