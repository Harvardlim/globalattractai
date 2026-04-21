
export interface EnergyMapping {
  name: string;
  type: 'lucky' | 'unlucky';
  level: number;
  description: string;
  baseScore: number;
}

export interface Combination {
  number: string;
  position: string;
  digits: string;
  name: string;
  type: 'lucky' | 'unlucky';
  level: number;
  description: string;
  score: number;
  originalScore: number;
  modifier?: string;
  isHidden?: boolean;
}

export interface SpecialCombination {
  number: string;
  position: string;
  type: 'hidden' | 'enhanced' | 'special' | 'star_combination';
  name: string;
  description: string;
  effect?: string;
}

export interface MagneticFieldStats {
  totalLuckyScore: number;
  totalUnluckyScore: number;
  dominantField: string;
  dominantType: 'lucky' | 'unlucky';
  luckyCount: number;
  unluckyCount: number;
  specialCount: number;
}

export interface AnalysisResults {
  combinations: Combination[];
  specialCombinations: SpecialCombination[];
  stats: MagneticFieldStats;
  displayNumber: string;
}

export type Language = 'zh' | 'en' | 'ms';
export type ActiveTab = 'energy' | 'energyInfo' | 'wealth' | 'health' | 'relationships';
