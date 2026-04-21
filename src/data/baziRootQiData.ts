/**
 * 八字通根有气数据
 * 通根（有根）、有气（印生）、透干概念
 */

// ===== 通根强度定义 =====
export type RootStrength = 'mainQi' | 'midQi' | 'residualQi' | 'none';

export interface RootStrengthInfo {
  type: RootStrength;
  name: string;
  description: string;
  weight: number;  // 力量权重
}

export const ROOT_STRENGTH_INFO: Record<RootStrength, RootStrengthInfo> = {
  mainQi: {
    type: 'mainQi',
    name: '本气通根',
    description: '地支主气与天干同类，根深蒂固，能量旺盛',
    weight: 1.0,
  },
  midQi: {
    type: 'midQi',
    name: '中气通根',
    description: '地支藏干中气与天干同类，力量中等',
    weight: 0.6,
  },
  residualQi: {
    type: 'residualQi',
    name: '余气通根',
    description: '地支藏干余气与天干同类，力量较弱',
    weight: 0.4,
  },
  none: {
    type: 'none',
    name: '无根',
    description: '地支中无同类五行，虚浮无力',
    weight: 0,
  },
};

// ===== 有气（印星生扶）=====
export interface QiSupportInfo {
  hasQi: boolean;
  description: string;
  supportBranches: string[];  // 提供生扶的地支
}

// ===== 透干定义 =====
export interface TouGanInfo {
  isTouGan: boolean;
  description: string;
  fromBranch: string;  // 从哪个地支透出
  hiddenStem: string;  // 所透藏干
}

// ===== 十神有根的命理表现 =====
export interface TenGodRootMeaning {
  tenGod: string;
  hasRootMeaning: string[];    // 有根时的表现
  noRootMeaning: string[];     // 无根时的表现
  injuredRootMeaning: string[]; // 根受伤时的表现
}

export const TEN_GOD_ROOT_MEANINGS: Record<string, TenGodRootMeaning> = {
  比肩: {
    tenGod: '比肩',
    hasRootMeaning: ['自身身体健康','意志坚定自信','能得同辈帮助','独立能力强'],
    noRootMeaning: ['体质偏弱','缺乏自信','孤军奋战','难得同侪相助'],
    injuredRootMeaning: ['兄弟朋友关系易有波折','合作中易遇背叛','身体隐患需注意'],
  },
  劫财: {
    tenGod: '劫财',
    hasRootMeaning: ['行动力强','竞争意识旺盛','善于争取资源','社交活跃',],
    noRootMeaning: ['行动力不足','难以争取机会','缺乏竞争力'],
    injuredRootMeaning: [
      '破财损失',
      '兄弟争端',
      '合伙不利',
    ],
  },
  食神: {
    tenGod: '食神',
    hasRootMeaning: [
      '才华横溢',
      '表达能力强',
      '想法能落实为行动',
      '口才好，创意佳',
      '福气厚重',
    ],
    noRootMeaning: [
      '才华难以发挥',
      '表达受阻',
      '想法难以落实',
    ],
    injuredRootMeaning: [
      '才华被压制',
      '子女缘薄',
      '肠胃健康问题',
    ],
  },
  伤官: {
    tenGod: '伤官',
    hasRootMeaning: [
      '才华出众',
      '创新能力强',
      '敢于挑战权威',
      '艺术天赋',
    ],
    noRootMeaning: [
      '才华无处施展',
      '锋芒被磨平',
      '创意难产',
    ],
    injuredRootMeaning: [
      '口舌是非',
      '官非纠纷',
      '子女健康问题',
    ],
  },
  偏财: {
    tenGod: '偏财',
    hasRootMeaning: [
      '财源广进',
      '善于投资理财',
      '人脉广泛',
      '意外之财常有',
    ],
    noRootMeaning: [
      '财来财去',
      '难聚财富',
      '投资易失',
    ],
    injuredRootMeaning: [
      '破财失财',
      '父缘薄',
      '投资亏损',
    ],
  },
  正财: {
    tenGod: '正财',
    hasRootMeaning: [
      '财有源头',
      '为人稳重',
      '求财有道',
      '经济状况稳定',
      '理财能力强',
    ],
    noRootMeaning: [
      '财源不稳',
      '收入波动',
      '理财困难',
    ],
    injuredRootMeaning: [
      '财务损失',
      '妻缘（男命）受损',
      '经济危机',
    ],
  },
  七杀: {
    tenGod: '七杀',
    hasRootMeaning: [
      '事业心强',
      '有魄力担当',
      '权势在握',
      '危机处理能力强',
    ],
    noRootMeaning: [
      '压力无法转化为动力',
      '缺乏权威感',
      '难以服众',
    ],
    injuredRootMeaning: [
      '小人陷害',
      '官灾诉讼',
      '事业挫折',
    ],
  },
  正官: {
    tenGod: '正官',
    hasRootMeaning: [
      '主贵显达',
      '事业心强',
      '有管理能力',
      '遵纪守法',
      '有责任感',
    ],
    noRootMeaning: [
      '难得贵人提拔',
      '仕途艰难',
      '管理能力弱',
    ],
    injuredRootMeaning: [
      '官场失意',
      '职位不稳',
      '名誉受损',
    ],
  },
  偏印: {
    tenGod: '偏印',
    hasRootMeaning: [
      '思维独特',
      '玄学悟性高',
      '技艺精湛',
      '独立研究能力强',
    ],
    noRootMeaning: [
      '学业不精',
      '思维受限',
      '难有独到见解',
    ],
    injuredRootMeaning: [
      '学业中断',
      '精神困扰',
      '偏门不利',
    ],
  },
  正印: {
    tenGod: '正印',
    hasRootMeaning: [
      '学识扎实',
      '长辈缘分深',
      '心态平和',
      '受人照顾',
      '有贵人缘',
    ],
    noRootMeaning: [
      '学业基础薄弱',
      '长辈缘浅',
      '缺乏庇护',
    ],
    injuredRootMeaning: ['学业受挫','母缘薄','名誉受损'],
  },
};

// ===== 根受伤的类型 =====
export type RootInjuryType = 'chong' | 'xing' | 'hai' | 'po' | 'he';

export interface RootInjuryInfo {
  type: RootInjuryType;
  name: string;
  description: string;
  severity: 'severe' | 'moderate' | 'mild';
}

export const ROOT_INJURY_TYPES: Record<RootInjuryType, RootInjuryInfo> = {
  chong: {
    type: 'chong',
    name: '冲',
    description: '根被冲击，力量大减',
    severity: 'severe',
  },
  xing: {
    type: 'xing',
    name: '刑',
    description: '根被刑伤，带病之象',
    severity: 'severe',
  },
  hai: {
    type: 'hai',
    name: '害',
    description: '根被暗害，阴损暗伤',
    severity: 'moderate',
  },
  po: {
    type: 'po',
    name: '破',
    description: '根被破坏，残缺不全',
    severity: 'moderate',
  },
  he: {
    type: 'he',
    name: '合',
    description: '根被合走，力量转移',
    severity: 'mild',
  },
};

// ===== 工具函数 =====

/**
 * 根据通根位置获取强度信息
 * @param position 本气/中气/余气
 */
export const getRootStrengthByPosition = (position: string): RootStrengthInfo => {
  switch (position) {
    case '本气':
      return ROOT_STRENGTH_INFO.mainQi;
    case '中气':
      return ROOT_STRENGTH_INFO.midQi;
    case '余气':
      return ROOT_STRENGTH_INFO.residualQi;
    default:
      return ROOT_STRENGTH_INFO.none;
  }
};

/**
 * 获取十神有根的命理表现
 * @param tenGodName 十神名称
 * @param hasRoot 是否有根
 * @param isInjured 根是否受伤
 */
export const getTenGodRootMeaning = (
  tenGodName: string,
  hasRoot: boolean,
  isInjured: boolean = false
): string[] => {
  const meaning = TEN_GOD_ROOT_MEANINGS[tenGodName];
  if (!meaning) return [];
  
  if (!hasRoot) {
    return meaning.noRootMeaning;
  }
  
  if (isInjured) {
    return meaning.injuredRootMeaning;
  }
  
  return meaning.hasRootMeaning;
};

/**
 * 判断根的总体状态
 */
export const evaluateRootStatus = (
  hasMainQiRoot: boolean,
  hasMidQiRoot: boolean,
  hasResidualQiRoot: boolean,
  isInjured: boolean
): { status: 'strong' | 'weak' | 'injured' | 'none'; description: string } => {
  if (!hasMainQiRoot && !hasMidQiRoot && !hasResidualQiRoot) {
    return { status: 'none', description: '无根，虚浮无力' };
  }
  
  if (isInjured) {
    return { status: 'injured', description: '有根但受伤，根基不稳' };
  }
  
  if (hasMainQiRoot) {
    return { status: 'strong', description: '本气通根，根深蒂固' };
  }
  
  if (hasMidQiRoot) {
    return { status: 'weak', description: '中气通根，力量中等' };
  }
  
  return { status: 'weak', description: '余气通根，力量较弱' };
};

// ===== 五行生克关系 =====
// 用于判断"有气"（印星生扶）

/**
 * 获取生助某五行的五行（印星关系）
 * @param element 目标五行 (0=木, 1=火, 2=土, 3=金, 4=水)
 */
export const getGeneratingElement = (element: number): number => {
  // 生我者为印：水生木、木生火、火生土、土生金、金生水
  return (element + 4) % 5;
};

/**
 * 判断地支是否能生助天干（有气判断）
 * @param stemElement 天干五行
 * @param branchElement 地支本气五行
 */
export const canBranchSupportStem = (stemElement: number, branchElement: number): boolean => {
  const generatingElement = getGeneratingElement(stemElement);
  return branchElement === generatingElement;
};
