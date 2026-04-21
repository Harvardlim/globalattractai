import { useAuth } from '@/contexts/AuthContext';

export type MemberTier = 'normal' | 'subscriber';

export type Feature = 
  | 'clients'           // 记录
  | 'energy'            // 数字能量
  | 'number_generator'  // 生成号码
  | 'hexagram'          // 解卦
  | 'realtime'          // 实时盘
  | 'destiny'           // 命理盘基础（八字盘、奇门盘）
  | 'destiny_full'      // 命理盘完整功能
  | 'ai_chat'           // AI 对话
  | 'ai_assistant'      // AI 解盘助手
  | 'branch_relations'  // 地支关系
  | 'bazi_encyclopedia' // 八字宝典
  | 'energy_encyclopedia' // 数字能量宝典
  | 'qimen_encyclopedia'  // 奇门全书
  | 'liuyao_encyclopedia' // 六爻宝典
  | 'sihai_encyclopedia'  // 四害宝典
  | 'personal_calendar' // 个人万年历
  | 'synastry'          // 合盘
  | 'xiao_liu_ren'      // 小六壬
  | 'flying_stars'      // 九宫飞星
  | 'numerology';       // 数字学

// Permission matrix: subscriber gets all features, normal is restricted
const PERMISSIONS: Record<Feature, MemberTier[]> = {
  clients: ['normal', 'subscriber'],
  energy: ['normal', 'subscriber'],
  number_generator: ['subscriber'],
  hexagram: ['subscriber'],
  realtime: ['normal', 'subscriber'],
  destiny: ['normal', 'subscriber'],
  destiny_full: ['subscriber'],
  ai_chat: ['subscriber'],
  ai_assistant: ['subscriber'],
  branch_relations: ['subscriber'],
  bazi_encyclopedia: ['subscriber'],
  energy_encyclopedia: ['subscriber'],
  qimen_encyclopedia: ['subscriber'],
  liuyao_encyclopedia: ['subscriber'],
  sihai_encyclopedia: ['subscriber'],
  personal_calendar: ['subscriber'],
  synastry: ['subscriber'],
  xiao_liu_ren: ['subscriber'],
  flying_stars: ['subscriber'],
  numerology: ['normal', 'subscriber'],
};

export function useMemberPermissions() {
  const { profile, isAdmin, isOwner } = useAuth();
  
  // Map legacy tiers (vip, vip_plus) to new subscriber tier
  const rawTier: string = profile?.member_tier || 'normal';
  const tier: MemberTier = (rawTier === 'vip' || rawTier === 'vip_plus' || rawTier === 'subscriber') ? 'subscriber' : 'normal';
  
  const canAccess = (feature: Feature): boolean => {
    if (isAdmin || isOwner) return true;
    return PERMISSIONS[feature].includes(tier);
  };
  
  const getRequiredTier = (feature: Feature): MemberTier => {
    const allowed = PERMISSIONS[feature];
    if (allowed.includes('normal')) return 'normal';
    return 'subscriber';
  };
  
  const getTierLabel = (t: MemberTier): string => {
    if (isAdmin && t === tier) return 'Admin';
    switch (t) {
      case 'subscriber': return '订阅会员';
      default: return '普通会员';
    }
  };
  
  const isSubscriber = tier === 'subscriber';
  
  return {
    tier,
    canAccess,
    getRequiredTier,
    getTierLabel,
    isNormal: !isAdmin && !isOwner && tier === 'normal',
    isSubscriber,
    isOwner,
    // Legacy aliases for backward compatibility
    isVip: isSubscriber,
    isVipPlus: isSubscriber,
    isAdmin,
  };
}
