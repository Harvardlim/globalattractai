import { Crown, Star } from 'lucide-react';

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const ZODIACS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

export const BAGUA = [
  '', '坎', '坤', '震', '巽', '中', '乾', '兑', '艮', '离'
];

export const STARS = [
  '天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英',
];

export const DOORS = [
  '休门', '死门', '伤门', '杜门', '', '开门', '惊门', '生门', '景门',
];

export const GODS = [
  '值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天',
];

export const LUO_SHU_RING = [1, 8, 3, 4, 9, 2, 7, 6]; 

// 对冲宫位映射（洛书九宫对冲）
export const OPPOSITE_PALACES: Record<number, number> = {
  1: 9, 9: 1,  // 坎离相对
  3: 7, 7: 3,  // 震兑相对
  4: 6, 6: 4,  // 巽乾相对
  8: 2, 2: 8,  // 艮坤相对
  5: 5         // 中宫无对冲
};

export const BRANCH_PALACE_MAP: Record<number, number> = {
  0: 1, 1: 8, 2: 8, 3: 3, 4: 4, 5: 4, 6: 9, 7: 2, 8: 2, 9: 7, 10: 6, 11: 6,
};

export const PALACE_INFO: Record<number, { name: string; position: string; defaultStarIdx: number; defaultDoorIdx: number }> = {
  1: { name: '坎', position: 'N', defaultStarIdx: 0, defaultDoorIdx: 0 },
  8: { name: '艮', position: 'NE', defaultStarIdx: 7, defaultDoorIdx: 7 },
  3: { name: '震', position: 'E', defaultStarIdx: 2, defaultDoorIdx: 2 },
  4: { name: '巽', position: 'SE', defaultStarIdx: 3, defaultDoorIdx: 3 },
  9: { name: '离', position: 'S', defaultStarIdx: 8, defaultDoorIdx: 8 },
  2: { name: '坤', position: 'SW', defaultStarIdx: 1, defaultDoorIdx: 1 },
  7: { name: '兑', position: 'W', defaultStarIdx: 6, defaultDoorIdx: 6 },
  6: { name: '乾', position: 'NW', defaultStarIdx: 5, defaultDoorIdx: 5 },
  5: { name: '中', position: 'C', defaultStarIdx: 4, defaultDoorIdx: -1 },
};

export const LIFE_STAGES = [
  '长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'
];

// Fire/Earth Shared (Yin Pan Standard)
export const STEM_CHANG_SHENG_START: Record<number, number> = {
  0: 11, // Jia -> Hai
  1: 6,  // Yi -> Wu
  2: 2,  // Bing -> Yin
  3: 9,  // Ding -> You
  4: 2,  // Wu -> Yin (Shared with Bing)
  5: 9,  // Ji -> You (Shared with Ding)
  6: 5,  // Geng -> Si
  7: 0,  // Xin -> Zi
  8: 8,  // Ren -> Shen
  9: 3,  // Gui -> Mao
};

export const STEM_DIRECTION: Record<number, number> = {
  0: 1, 1: -1, 2: 1, 3: -1, 4: 1, 5: -1, 6: 1, 7: -1, 8: 1, 9: -1
};

export const PALACE_BRANCHES: Record<number, number[]> = {
  1: [0],        // Kan -> Zi
  8: [1, 2],     // Gen -> Chou, Yin
  3: [3],        // Zhen -> Mao
  4: [4, 5],     // Xun -> Chen, Si
  9: [6],        // Li -> Wu
  2: [7, 8],     // Kun -> Wei, Shen
  7: [9],        // Dui -> You
  6: [10, 11],   // Qian -> Xu, Hai
  5: [],
};

export enum Element { WOOD, FIRE, EARTH, METAL, WATER }

export const PALACE_ELEMENTS: Record<number, Element> = {
  1: Element.WATER, 8: Element.EARTH, 3: Element.WOOD, 4: Element.WOOD, 
  9: Element.FIRE, 2: Element.EARTH, 7: Element.METAL, 6: Element.METAL, 5: Element.EARTH
};

export const DOOR_ELEMENTS: Record<number, Element> = {
  0: Element.WATER, 1: Element.EARTH, 2: Element.WOOD, 3: Element.WOOD, 
  5: Element.METAL, 6: Element.METAL, 7: Element.EARTH, 8: Element.FIRE
};

export const MEMBER_TIER_LABELS: Record<string, { label: string; icon?: any, color: string }> = {
  normal: { label: '普通', icon: Crown, color: 'bg-muted text-muted-foreground' },
  subscriber: { label: '订阅会员', icon: Star, color: 'bg-amber-500 text-white border-amber-600' },
  vip: { label: '订阅会员', icon: Star,  color: 'bg-primary text-primary-foreground' },
  vip_plus: { label: '订阅会员', icon: null, color: 'bg-amber-500 text-white border-amber-600' },
};

export const ORDER_STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline', class: string }> = {
  pending: { label: '待处理', variant: 'outline', class: '' },
  processing: { label: '处理中', variant: 'default', class: 'bg-yellow-500' },
  completed: { label: '已完成', variant: 'secondary', class: 'bg-green-600' },
  cancelled: { label: '已取消', variant: 'destructive', class: 'bg-red-600' },
};