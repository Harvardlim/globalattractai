export enum Gender {
  MALE = '男',
  FEMALE = '女',
}

export enum ChartType {
  LIFETIME = 'Lifetime (终身盘)',
  REALTIME = 'Realtime (时实盘)',
}

export interface GanZhi {
  gan: string;
  zhi: string;
  ganIdx: number; // 0-9
  zhiIdx: number; // 0-11
}

export interface FourPillars {
  year: GanZhi;
  month: GanZhi;
  day: GanZhi;
  hour: GanZhi;
}

export interface StemStatus {
  isMu: boolean;
  isXing: boolean;
}

export interface PalaceData {
  id: number; // 1-9
  name: string;
  position: string;
  bagua: string;
  
  earthStem: string;
  earthStem2?: string;
  skyStem: string;
  skyStem2?: string;
  hiddenStem: string;
  hiddenStem2?: string;
  
  door: string;
  star: string;
  god: string;
  
  empty: boolean; 
  horse: boolean;
  
  lifeStages: string[];
  
  // Status for stems
  skyStatus: StemStatus;
  sky2Status?: StemStatus;
  earthStatus: StemStatus;
  earth2Status?: StemStatus;
  
  isMenPo: boolean;
}

export interface BigCycle {
  year: number;
  gan: string;
  zhi: string;
  desc: string;
}

export interface AnnualCycle {
  year: number;
  gan: string;
  zhi: string;
  age: number;
  desc: string; // 十神描述
}

export interface ChartData {
  name: string;
  gender: Gender;
  zodiac: string;
  issue?: string; // For Realtime charts
  date: Date;
  solarTerm: string;
  yinYang: 'Yin' | 'Yang';
  juNum: number;
  pillars: FourPillars;
  palaces: PalaceData[];
  chartType: ChartType;
  
  zhiFu: string;
  zhiShi: string;
  xunShou?: string; // 旬首（甲遁入的六仪）
  horseBranch: string;
  voidBranches: string;

  // 伏吟/反吟判断
  isFuYin: boolean;  // 伏吟局：星门都回本宫
  isFanYin: boolean; // 反吟局：星门都落对冲宫
  isStarFuYin?: boolean;  // 星伏吟
  isDoorFuYin?: boolean;  // 门伏吟
  isStarFanYin?: boolean; // 星反吟
  isDoorFanYin?: boolean; // 门反吟

  bigCycles: BigCycle[];
  annualCycles: AnnualCycle[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}
