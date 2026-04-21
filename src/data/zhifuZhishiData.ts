/**
 * 值符值使分析数据 - 基于《御定奇门宝鉴》
 * 共享于奇门分析（命理盘）和奇门全书
 */

// 宫位五行
const PALACE_ELEMENT: Record<number, string> = {
  1: '水', 2: '土', 3: '木', 4: '木',
  6: '金', 7: '金', 8: '土', 9: '火',
};

const PALACE_NAME: Record<number, string> = {
  1: '坎一宫', 2: '坤二宫', 3: '震三宫', 4: '巽四宫',
  6: '乾六宫', 7: '兑七宫', 8: '艮八宫', 9: '离九宫',
};

const SHENG_MAP: Record<string, string> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

const KE_MAP: Record<string, string> = {
  '木': '土', '火': '金', '土': '水', '金': '木', '水': '火',
};

export interface ZhiFuZhiShiRelation {
  type: '同宫' | '相生' | '相克';
  subType?: string;
  description: string;
  points: string[];
  zhiFuPalaceId?: number;
  zhiShiPalaceId?: number;
  zhiFuPalaceName?: string;
  zhiShiPalaceName?: string;
}

interface PalaceLike {
  id: number;
  star: string;
  door: string;
}

/**
 * 分析值符（星）与值使（门）的落宫关系
 */
export function analyzeZhiFuZhiShi(
  zhiFuStar: string,
  zhiShiDoor: string,
  palaces?: PalaceLike[]
): ZhiFuZhiShiRelation {
  let fuPalaceId: number | undefined;
  let shiPalaceId: number | undefined;

  if (palaces) {
    const fuP = palaces.find(p => p.star === zhiFuStar && p.id !== 5);
    const shiP = palaces.find(p => p.door === zhiShiDoor && p.id !== 5);
    fuPalaceId = fuP?.id;
    shiPalaceId = shiP?.id;
  }

  const fuPalaceName = fuPalaceId ? PALACE_NAME[fuPalaceId] : undefined;
  const shiPalaceName = shiPalaceId ? PALACE_NAME[shiPalaceId] : undefined;

  const base = {
    zhiFuPalaceId: fuPalaceId,
    zhiShiPalaceId: shiPalaceId,
    zhiFuPalaceName: fuPalaceName,
    zhiShiPalaceName: shiPalaceName,
  };

  // 同宫
  if (fuPalaceId && shiPalaceId && fuPalaceId === shiPalaceId) {
    return {
      ...base,
      type: '同宫',
      description: `值符值使同落${fuPalaceName}，权威与执行力合一，事件易成`,
      points: [
        '能量集中，象征权威与执行力合一，事件易成',
        '领导意图与执行方向一致，效率最高',
        '求事最佳格局之一，阻力最小',
      ],
    };
  }

  const fuElement = fuPalaceId ? PALACE_ELEMENT[fuPalaceId] : undefined;
  const shiElement = shiPalaceId ? PALACE_ELEMENT[shiPalaceId] : undefined;

  if (fuElement && shiElement) {
    if (SHENG_MAP[fuElement] === shiElement) {
      return {
        ...base, type: '相生', subType: '值符生值使',
        description: `值符落${fuPalaceName}（${fuElement}）生值使落${shiPalaceName}（${shiElement}），权威推动执行`,
        points: ['权威推动事件发展，领导支持下属执行', '事业上易得上级提拔，资源配合到位', '求职求测：易得领导推荐入职'],
      };
    }
    if (SHENG_MAP[shiElement] === fuElement) {
      return {
        ...base, type: '相生', subType: '值使生值符',
        description: `值使落${shiPalaceName}（${shiElement}）生值符落${fuPalaceName}（${fuElement}），执行反哺权威`,
        points: ['执行力反哺权威，先行动后思考也能成事', '通过实际行动获得上级认可', '适合先做再说，实践出真知'],
      };
    }
    if (KE_MAP[fuElement] === shiElement) {
      return {
        ...base, type: '相克', subType: '值符克值使',
        description: `值符落${fuPalaceName}（${fuElement}）克值使落${shiPalaceName}（${shiElement}），权威压制执行`,
        points: ['权威压制执行力，上级干预过多导致执行困难', '事业上领导管控严格，自主性受限', '需调整策略，寻找上级能接受的执行方式'],
      };
    }
    if (KE_MAP[shiElement] === fuElement) {
      return {
        ...base, type: '相克', subType: '值使克值符',
        description: `值使落${shiPalaceName}（${shiElement}）克值符落${fuPalaceName}（${fuElement}），下克上之象`,
        points: ['执行违背权威，下属不服管理或政策执行偏差，做和讲不一致', '诉讼求测：法院判决不利，需调整策略', '需要重新审视执行方向，避免与领导对立'],
      };
    }
    if (fuElement === shiElement) {
      return {
        ...base, type: '相生', subType: '比和',
        description: `值符落${fuPalaceName}与值使落${shiPalaceName}同属${fuElement}，比和之象`,
        points: ['符使五行相同，能量平稳，事情可成但缓慢', '无明显助力也无明显阻碍', '需自身主动推动事态发展'],
      };
    }
  }

  return { ...base, type: '同宫', description: '值符与值使关系平和', points: ['关系中性，无明显生克'] };
}

// === 奇门全书用的静态知识 ===

export interface ZhiFuZhiShiKnowledge {
  title: string;
  sections: {
    heading: string;
    nature: 'auspicious' | 'inauspicious' | 'neutral';
    items: string[];
  }[];
}

export const ZHIFU_KNOWLEDGE: ZhiFuZhiShiKnowledge = {
  title: '值符：领导力与权威的象征',
  sections: [
    {
      heading: '核心象征',
      nature: 'neutral',
      items: [
        '天时与贵人：值符为九星之首（通常为天蓬星、天任星等），象征最高权威、政策支持或关键贵人',
        '稳定与保护：值符所在宫位能量稳定，可化解凶门凶神，类似"护身符"',
      ],
    },
    {
      heading: '能量特性',
      nature: 'auspicious',
      items: [
        '吉门强化：值符临吉门（如开门、生门）时，权威与资源聚集，事业易成',
        '凶门制约：值符临凶门（如死门、伤门）时，阻力减小，但需防范隐性风险',
      ],
    },
    {
      heading: '实战应用',
      nature: 'neutral',
      items: [
        '求测贵人：日干与值符同宫或相生，易得领导、长辈扶持',
        '案例：求测晋升，日干"甲"与值符（天任星）同落坎宫，得高层背书',
        '化解危机：值符落宫克凶门（如死门），可通过权威干预化解风险',
        '案例：疾病求测，死门落离宫，值符（天蓬星）落乾宫，乾金克离火，暗示找权威医生可治愈',
      ],
    },
  ],
};

export const ZHISHI_KNOWLEDGE: ZhiFuZhiShiKnowledge = {
  title: '值使：执行力的象征',
  sections: [
    {
      heading: '核心象征',
      nature: 'neutral',
      items: [
        '值使为八门之首，代表事件的执行力、落实能力和具体行动方向',
        '值使的状态直接反映事情能否顺利推进、落地执行',
      ],
    },
    {
      heading: '吉凶判断',
      nature: 'auspicious',
      items: [
        '值使临吉门（开、休、生）：执行顺利，事情容易落实',
        '值使临凶门（死、伤、惊）：执行受阻，需要调整策略或时机',
      ],
    },
    {
      heading: '与值符的关系',
      nature: 'neutral',
      items: [
        '符使同宫：能量集中，权威与执行力合一，事件易成',
        '符使相生：顺送大成。值符生值使=权威推动事件发展；值使生值符=执行反哺权威',
        '符使相克：阻力与调整。值符克值使=权威压制执行；值使克值符=执行违背权威',
      ],
    },
  ],
};
