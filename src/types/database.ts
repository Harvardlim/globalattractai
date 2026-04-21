export interface Client {
  id: string;
  name: string;
  birth_date: string;
  birth_hour: number | null; // null means unknown birth time
  birth_minute: number;
  gender: '男' | '女';
  notes: string | null;
  phone_number: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

// Default categories that cannot be deleted (only these two are protected)
export const DEFAULT_CATEGORIES = ['家人', '未分类'] as const;
// Initial categories for new users (what they start with)
export const INITIAL_CATEGORIES = ['家人', '未分类'] as const;
export type ClientCategory = typeof DEFAULT_CATEGORIES[number] | string;

/**
 * Convert hour (0-23) to traditional Chinese shi-chen
 * 子时分早晚：
 * - 早子时: 00:00-01:00 (属于当天)
 * - 晚子时: 23:00-23:59 (属于次日)
 */
export function hourToShichen(hour: number): { name: string; range: string; isLateZi?: boolean; isEarlyZi?: boolean } {
  const shichenMap = [
    { name: '子时', range: '23:00-01:00' },
    { name: '丑时', range: '01:00-03:00' },
    { name: '寅时', range: '03:00-05:00' },
    { name: '卯时', range: '05:00-07:00' },
    { name: '辰时', range: '07:00-09:00' },
    { name: '巳时', range: '09:00-11:00' },
    { name: '午时', range: '11:00-13:00' },
    { name: '未时', range: '13:00-15:00' },
    { name: '申时', range: '15:00-17:00' },
    { name: '酉时', range: '17:00-19:00' },
    { name: '戌时', range: '19:00-21:00' },
    { name: '亥时', range: '21:00-23:00' },
  ];
  
  // Map hour to shichen index
  let idx: number;
  if (hour === 23 || hour === 0) idx = 0;
  else idx = Math.floor((hour + 1) / 2);
  
  const result = shichenMap[idx];
  
  // 标记早子时和晚子时
  if (hour === 0) {
    return { ...result, name: '早子时', range: '00:00-01:00', isEarlyZi: true };
  }
  if (hour === 23) {
    return { ...result, name: '晚子时', range: '23:00-00:00', isLateZi: true };
  }
  
  return result;
}

// Topic must match the CHECK constraint in the database
export type ConsultationTopic = '健康' | '财富' | '关系' | '轨道' | '学业' | '家庭' | '贵人' | '风险' | '综合' | null;

export interface Consultation {
  id: string;
  client_id: string;
  user_id?: string | null;
  chart_type: '实时盘' | '命理盘';
  chart_date: string;
  chart_data: any;
  title: string | null;  // Display title (e.g., "Reagan Saw - 风险分析")
  topic: ConsultationTopic;  // Category (must match DB enum constraint)
  mentioned_client_ids?: string[];
  created_at: string;
}

export interface Interpretation {
  id: string;
  consultation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface RealtimeConsultation {
  id: string;
  chart_date: string;
  chart_data: any;
  issue: string | null;
  topic: string | null;
  title: string | null;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  mentioned_client_ids: string[];
  mentioned_consultation_ids: string[];
  created_at: string;
}

export type ChartMode = '实时盘' | '命理盘' | 'Chat';

/**
 * 时辰选项 - 子时分早晚
 * value 对应实际小时：早子=0, 晚子=23, 其他时辰用起始小时
 */
export const HOUR_OPTIONS: { value: number; label: string; shichen: string }[] = [
  { value: 0, label: '早子时 (00:00-01:00)', shichen: '早子' },
  { value: 1, label: '丑时 (01:00-03:00)', shichen: '丑' },
  { value: 3, label: '寅时 (03:00-05:00)', shichen: '寅' },
  { value: 5, label: '卯时 (05:00-07:00)', shichen: '卯' },
  { value: 7, label: '辰时 (07:00-09:00)', shichen: '辰' },
  { value: 9, label: '巳时 (09:00-11:00)', shichen: '巳' },
  { value: 11, label: '午时 (11:00-13:00)', shichen: '午' },
  { value: 13, label: '未时 (13:00-15:00)', shichen: '未' },
  { value: 15, label: '申时 (15:00-17:00)', shichen: '申' },
  { value: 17, label: '酉时 (17:00-19:00)', shichen: '酉' },
  { value: 19, label: '戌时 (19:00-21:00)', shichen: '戌' },
  { value: 21, label: '亥时 (21:00-23:00)', shichen: '亥' },
  { value: 23, label: '晚子时 (23:00-00:00)', shichen: '晚子' },
];

export const ANALYSIS_TOPICS = [
  { value: '健康', label: '健康', icon: '🏥', description: '身体状况、疾病预防、养生调理' },
  { value: '财富', label: '财富', icon: '💰', description: '财运、投资、事业收入' },
  { value: '关系', label: '关系', icon: '❤️', description: '感情、婚姻、人际交往' },
  { value: '轨道', label: '轨道', icon: '🎯', description: '事业方向、人生规划' },
  { value: '学业', label: '学业', icon: '📚', description: '考试运、学习方向、进修' },
  { value: '家庭', label: '家庭', icon: '🏠', description: '家庭和睦、子女运势' },
  { value: '贵人', label: '贵人', icon: '🤝', description: '贵人运、合作关系' },
  { value: '风险', label: '风险', icon: '⚠️', description: '灾厄、官非、小人' },
  { value: '综合', label: '综合', icon: '📊', description: '全面分析各方面运势' },
] as const;
