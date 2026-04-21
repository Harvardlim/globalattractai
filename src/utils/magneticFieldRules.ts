import { Language } from '@/types/index';

// Base star types and their energy levels
export const STAR_TYPES = {
  // Lucky stars (四吉星)
  天医: { type: 'lucky' as const, description: '财富 & 婚姻', levels: ['13/31', '68/86', '49/94', '27/72'] },
  延年: { type: 'lucky' as const, description: '事业 & 健康', levels: ['19/91', '78/87', '34/43', '26/62'] },
  生气: { type: 'lucky' as const, description: '贵人 & 人脉', levels: ['14/41', '67/76', '39/93', '28/82'] },
  伏位: { type: 'lucky' as const, description: '耐力 & 持续', levels: ['11', '22/88/99', '66/77', '33/44'] },
  
  // Unlucky stars (四凶星)
  绝命: { type: 'unlucky' as const, description: '投资 & 情绪', levels: ['12/21', '69/96', '48/84', '37/73'] },
  祸害: { type: 'unlucky' as const, description: '口才 & 疾病', levels: ['17/71', '89/98', '46/64', '23/32'] },
  五鬼: { type: 'unlucky' as const, description: '智慧 & 灵性', levels: ['18/81', '79/97', '36/63', '24/42'] },
  六煞: { type: 'unlucky' as const, description: '情商 & 桃花', levels: ['16/61', '47/74', '38/83', '29/92'] }
};

export const ENERGY_LEVELS = [100, 75, 50, 25]; // Level 1, 2, 3, 4 scores

// Pattern matching for hidden and enhanced effects
export const SPECIAL_PATTERNS = {
  HIDDEN: /^(\d)(0+)(\d)$/, // X + one or more 0s + Y
  ENHANCED: /^(\d)(5+)(\d)$/, // X + one or more 5s + Y
  MIXED: /^(\d)(0+)(5+)(\d)|^(\d)(5+)(0+)(\d)$/ // Mixed patterns
};

// Two-star combination special meanings
export const TWO_STAR_COMBINATIONS = {
  // 生气组合
  生气天医: { meaning: '有贵人送钱给你' },
  生气六煞: { meaning: '贵人让你抱怨，可以买房' },
  生气祸害: { meaning: '贵人 = 小人（好心办坏事）' },
  生气五鬼: { meaning: '贵人给建议' },
  生气延年: { meaning: '主管而非老板，延年的大小决定格局大小' },
  生气绝命: { meaning: '朋友破财，不能合作' },
  
  // 延年组合
  延年祸害: { meaning: '工作容易犯小人，做事被抱怨' },
  延年六煞: { meaning: '工作抑郁不开心' },
  延年生气: { meaning: '工作越做越开心，小能量转大能量' },
  延年天医: { meaning: '付出有回报' },
  延年五鬼: { meaning: '想换工作，换行业' },
  延年绝命: { meaning: '过度自信，破财，高风险职业' },
  延年伏位: { meaning: '工作感到疲惫' },
  
  // 天医组合
  天医祸害: { meaning: '婚后抱怨、吵架，不利健康' },
  天医绝命: { meaning: '赌必输，有钱就去赌' },
  天医生气: { meaning: '有钱就开心，贵人会来' },
  天医六煞: { meaning: '钱用到家里' },
  天医五鬼: { meaning: '钱瞬间没了' },
  天医延年: { meaning: '老板/主管格局，对感情负责' },
  
  // 绝命组合
  绝命五鬼: { meaning: '喜欢赌博，赚的钱转眼就没' },
  绝命六煞: { meaning: '钱用到家里，买房' },
  绝命祸害: { meaning: '投资破财，破财后抱怨' },
  绝命天医: { meaning: '赌必赢，少说话赚钱' },
  绝命生气: { meaning: '花钱不手软，舍得花钱开心' },
  绝命延年: { meaning: '可以买房，女性易离婚' },
  
  // 五鬼组合
  五鬼绝命: { meaning: '只要有想法就会破财' },
  五鬼生气: { meaning: '喜欢动脑筋，适合旅游或政府工作' },
  五鬼祸害: { meaning: '做业务，容易车祸' },
  五鬼延年: { meaning: '旅游团领队、老师' },
  五鬼天医: { meaning: '赚钱但花光' },
  五鬼六煞: { meaning: '抱怨，无法展现才华，容易生病' },
  
  // 六煞组合
  六煞绝命: { meaning: '女人会让你破财' },
  六煞生气: { meaning: '偏桃花，喜欢谈恋爱，花花公子' },
  六煞五鬼: { meaning: '癌症' },
  六煞祸害: { meaning: '情绪上来讲话难听，房屋风水有问题' },
  六煞天医: { meaning: '买房子带来大钱' },
  六煞延年: { meaning: '顾家，买大房子' },
  
  // 祸害组合
  祸害绝命: { meaning: '小人让你破财，易胖，女性易做妇科手术' },
  祸害延年: { meaning: '挑好的吃，说话大声' },
  祸害六煞: { meaning: '易怒，适合做餐饮生意，靠嘴吃饭' },
  祸害五鬼: { meaning: '意外血光' },
  祸害天医: { meaning: '开口赚钱，开口有桃花，嘴巴甜' },
  祸害生气: { meaning: '一开口就有贵人，生病也不在意' }
};

// Legacy patterns for backward compatibility
export const STAR_COMBINATION_MEANINGS = {
  生气天医: { pattern: /41.*3|14.*3|413|314/, meaning: '有贵人送钱给你' },
  生气六煞: { pattern: /41.*6|14.*6|416/, meaning: '贵人让你抱怨，可以买房' },
  生气祸害: { pattern: /41.*7|14.*7|417/, meaning: '贵人 = 小人（好心办坏事）' },
  生气五鬼: { pattern: /41.*8|14.*8|418/, meaning: '贵人给建议' },
  延年天医: { pattern: /91.*3|19.*3|913|194/, meaning: '付出有回报' },
  延年祸害: { pattern: /91.*7|19.*7|917/, meaning: '工作容易犯小人，做事被抱怨' },
  延年绝命: { pattern: /91.*2|19.*2|912/, meaning: '过度自信，破财，高风险职业' },
  天医绝命: { pattern: /31.*2|13.*2|312/, meaning: '赌必输，有钱就去赌' },
  天医生气: { pattern: /31.*4|13.*4|314/, meaning: '有钱就开心，贵人会来' },
  天医五鬼: { pattern: /31.*8|13.*8|318/, meaning: '钱瞬间没了' },
  绝命五鬼: { pattern: /21.*8|12.*8|812/, meaning: '只要有想法就会破财' },
  绝命六煞: { pattern: /21.*6|12.*6|216/, meaning: '钱用到家里，买房' },
  绝命祸害: { pattern: /21.*7|12.*7|217/, meaning: '投资破财，破财后抱怨' },
  五鬼六煞: { pattern: /81.*6|18.*6|816|618/, meaning: '癌症' },
  六煞祸害: { pattern: /61.*7|16.*7|617/, meaning: '情绪上来讲话难听，房屋风水有问题' },
  祸害生气: { pattern: /71.*4|17.*4|714/, meaning: '一开口就有贵人，生病也不在意' }
};

// Multi-digit special combinations
export const MULTI_DIGIT_MEANINGS = {
  '103': '感情不好，仅适合宗教/命理使用',
  '108': '感情不好，仅适合宗教/命理使用',
  '102': '绝命组合，需非常小心此类人',
  '609': '绝命组合，需非常小心此类人',
  '804': '绝命组合，需非常小心此类人',
  '307': '绝命组合，需非常小心此类人',
  '811': '长期想调整',
  '711': '病不会好',
  '177': '持续抱怨',
  '911': '多想，工作被动',
  '218': '破财后注意血光',
  '121': '容易官司，离婚敢分手',
  '213': '做大事，越做越有钱',
  '219': '有理财观念但没钱',
  '484': '小心官司缠身',
  '713': '多说话就来钱',
  '7168': '开店赚钱',
  '969': '做夜班工作'
};

// Fuwei special rules
export const FUWEI_PATTERNS = {
  SINGLE: ['11', '22', '33', '44', '66', '77', '88', '99'],
  ENHANCED_5: /^(\d)5(\1)$/ // Same digit with 5 in between (like 151, 252)
};

/**
 * Creates a base combination lookup from star types
 */
export function createBaseCombinationMap() {
  const map: Record<string, { name: string, type: 'lucky' | 'unlucky', level: number, description: string, baseScore: number }> = {};
  
  Object.entries(STAR_TYPES).forEach(([starName, starData]) => {
    starData.levels.forEach((levelStr, index) => {
      const level = index + 1;
      const score = ENERGY_LEVELS[index];
      
      // Parse combinations like "13/31" or "22/88/99"
      const combinations = levelStr.split('/');
      combinations.forEach(combo => {
        map[combo] = {
          name: `${starName}${level}`,
          type: starData.type,
          level,
          description: starData.description,
          baseScore: score
        };
      });
    });
  });
  
  return map;
}

/**
 * Detects special patterns in a number sequence
 */
export function detectSpecialPattern(sequence: string): {
  type: 'hidden' | 'enhanced' | 'mixed' | null,
  extractedPair: string | null,
  fullSequence: string
} {
  // Check for hidden pattern (X + 0s + Y)
  const hiddenMatch = sequence.match(SPECIAL_PATTERNS.HIDDEN);
  if (hiddenMatch) {
    return {
      type: 'hidden',
      extractedPair: hiddenMatch[1] + hiddenMatch[3],
      fullSequence: sequence
    };
  }
  
  // Check for enhanced pattern (X + 5s + Y)
  const enhancedMatch = sequence.match(SPECIAL_PATTERNS.ENHANCED);
  if (enhancedMatch) {
    return {
      type: 'enhanced',
      extractedPair: enhancedMatch[1] + enhancedMatch[3],
      fullSequence: sequence
    };
  }
  
  // Check for mixed patterns
  const mixedMatch = sequence.match(SPECIAL_PATTERNS.MIXED);
  if (mixedMatch) {
    // Extract the first and last digits for the base combination
    const first = mixedMatch[1] || mixedMatch[5];
    const last = mixedMatch[4] || mixedMatch[8];
    return {
      type: 'mixed',
      extractedPair: first + last,
      fullSequence: sequence
    };
  }
  
  return { type: null, extractedPair: null, fullSequence: sequence };
}

/**
 * Checks if a number is a special single digit (0 or 5)
 */
export function isSpecialSingleDigit(digit: string): boolean {
  return digit === '0' || digit === '5';
}

/**
 * Detects Fuwei special patterns
 */
export function detectFuweiPattern(sequence: string): {
  type: 'single' | 'double' | 'enhanced_5' | null,
  meaning: string | null
} {
  // Check for single Fuwei (11, 22, 33, etc.)
  if (FUWEI_PATTERNS.SINGLE.includes(sequence)) {
    return {
      type: 'single',
      meaning: '跟着章节和团队成员走'
    };
  }
  
  // Check for enhanced 5 pattern (like 151, 252)
  const enhanced5Match = sequence.match(FUWEI_PATTERNS.ENHANCED_5);
  if (enhanced5Match) {
    return {
      type: 'enhanced_5',
      meaning: '能量放大效果'
    };
  }
  
  return { type: null, meaning: null };
}

/**
 * Finds star combination meanings based on patterns
 */
export function findStarCombinationMeaning(sequence: string): string | null {
  for (const [key, { pattern, meaning }] of Object.entries(STAR_COMBINATION_MEANINGS)) {
    if (pattern.test(sequence)) {
      return meaning;
    }
  }
  return null;
}

/**
 * Checks for multi-digit special meanings
 */
export function findMultiDigitMeaning(sequence: string): string | null {
  return MULTI_DIGIT_MEANINGS[sequence] || null;
}

/**
 * Detects two-star combinations and returns their special meanings
 */
export function findTwoStarCombinationMeaning(sequence: string): { 
  meaning: string | null, 
  stars: string[] | null 
} {
  const baseCombinations = createBaseCombinationMap();
  const detectedStars: string[] = [];
  
  // Find all stars present in the sequence using multiple scanning methods
  
  // Method 1: Check consecutive pairs
  for (let i = 0; i < sequence.length - 1; i++) {
    const combo = sequence.substr(i, 2);
    const baseCombination = baseCombinations[combo];
    if (baseCombination) {
      const starName = baseCombination.name.replace(/[1-4]$/, '');
      if (!detectedStars.includes(starName)) {
        detectedStars.push(starName);
      }
    }
  }
  
  // Method 2: Check skip-one patterns for 3+ digit sequences
  if (sequence.length >= 3) {
    for (let i = 0; i < sequence.length - 2; i++) {
      const combo = sequence[i] + sequence[i + 2];
      const baseCombination = baseCombinations[combo];
      if (baseCombination) {
        const starName = baseCombination.name.replace(/[1-4]$/, '');
        if (!detectedStars.includes(starName)) {
          detectedStars.push(starName);
        }
      }
    }
  }
  
  // Method 3: Removed - was creating false positives by checking all possible digit combinations
  
  // Method 4: Fallback to legacy regex patterns for complex sequences
  if (detectedStars.length < 2) {
    for (const [combinationName, { pattern, meaning }] of Object.entries(STAR_COMBINATION_MEANINGS)) {
      if (pattern.test(sequence)) {
        // Extract star names from combination name (e.g., "生气天医" -> ["生气", "天医"])
        const starNames = combinationName.match(/(生气|延年|天医|绝命|祸害|五鬼|六煞|伏位)/g);
        if (starNames && starNames.length === 2) {
          return { meaning, stars: starNames };
        }
      }
    }
  }
  
  // If we have exactly 2 stars, check for combination meanings
  if (detectedStars.length === 2) {
    const [star1, star2] = detectedStars.sort();
    const combinationKey1 = `${star1}${star2}`;
    const combinationKey2 = `${star2}${star1}`;
    
    const meaning = TWO_STAR_COMBINATIONS[combinationKey1]?.meaning || 
                   TWO_STAR_COMBINATIONS[combinationKey2]?.meaning || 
                   null;
    
    return { meaning, stars: meaning ? detectedStars : null };
  }
  
  // Also return meaning if we have more than 2 stars - use the first two found
  if (detectedStars.length > 2) {
    const [star1, star2] = detectedStars.slice(0, 2).sort();
    const combinationKey1 = `${star1}${star2}`;
    const combinationKey2 = `${star2}${star1}`;
    
    const meaning = TWO_STAR_COMBINATIONS[combinationKey1]?.meaning || 
                   TWO_STAR_COMBINATIONS[combinationKey2]?.meaning || 
                   null;
    
    return { meaning, stars: meaning ? detectedStars.slice(0, 2) : null };
  }
  
  return { meaning: null, stars: null };
}

/**
 * Validates if a sequence can form a valid magnetic field combination
 */
export function isValidMagneticFieldSequence(sequence: string): boolean {
  // Must be at least 2 digits
  if (sequence.length < 2) return false;
  
  // Check if it's a base combination, special pattern, or has special meaning
  const baseCombinations = createBaseCombinationMap();
  const specialPattern = detectSpecialPattern(sequence);
  const multiDigitMeaning = findMultiDigitMeaning(sequence);
  const fuweiPattern = detectFuweiPattern(sequence);
  
  return !!(
    baseCombinations[sequence] ||
    specialPattern.type ||
    multiDigitMeaning ||
    fuweiPattern.type
  );
}