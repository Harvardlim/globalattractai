
import { getTranslations } from '@/data/translations';
import { 
  createBaseCombinationMap, 
  detectSpecialPattern, 
  isSpecialSingleDigit,
  detectFuweiPattern,
  findStarCombinationMeaning,
  findMultiDigitMeaning,
  findTwoStarCombinationMeaning,
  isValidMagneticFieldSequence
} from './magneticFieldRules';
import { Language, Combination, SpecialCombination, MagneticFieldStats } from '../types/index';

/**
 * Enhanced number analysis using rule-based detection
 */
export function analyzeNumberEnhanced(inputNumber: string, currentLanguage: Language) {
  const input = inputNumber.trim();
  if (!input) {
    throw new Error(currentLanguage === 'zh' ? '请输入数字' : 'Please enter numbers');
  }

  const numbers = input.replace(/\D/g, '');
  if (numbers.length < 2) {
    throw new Error(currentLanguage === 'zh' ? '请输入至少2位数字' : 'Please enter at least 2 digits');
  }

  const combinations: (Combination & { _startIndex: number })[] = [];
  const specialCombinations: SpecialCombination[] = [];
  const baseCombinations = createBaseCombinationMap();
  
  // Enhanced scanning strategy
  const scannedPositions = new Set<string>();
  
  // 1. Scan for multi-digit special combinations first (longest first)
  for (let length = Math.min(numbers.length, 8); length >= 3; length--) {
    for (let i = 0; i <= numbers.length - length; i++) {
      const sequence = numbers.substr(i, length);
      const positionKey = `${i}-${i + length - 1}`;
      
      if (scannedPositions.has(positionKey)) continue;
      
      // Check for multi-digit special meanings
      const multiDigitMeaning = findMultiDigitMeaning(sequence);
      if (multiDigitMeaning) {
        const t = getTranslations(currentLanguage);
        const translatedMeaning = t.multiDigitMeanings?.[sequence] || multiDigitMeaning;
        
        specialCombinations.push({
          number: sequence,
          position: `位置${i + 1}-${i + length}`,
          type: 'special',
          name: translatedMeaning,
          description: translatedMeaning
        });
        
        // Also extract base combinations within special sequences
        extractBaseCombinationsFromSequence(sequence, i, combinations, baseCombinations);
        
        scannedPositions.add(positionKey);
        continue;
      }
      
      // Check for special patterns (hidden/enhanced)
      const specialPattern = detectSpecialPattern(sequence);
      if (specialPattern.type && specialPattern.extractedPair) {
        const baseCombination = baseCombinations[specialPattern.extractedPair];
        if (baseCombination) {
          let modifier = '';
          let score = baseCombination.baseScore;
          let name = baseCombination.name;
          
          if (specialPattern.type === 'hidden') {
            score = Math.round(score * 0.8);
            modifier = currentLanguage === 'zh' ? '隐藏(-20%)' : 'Hidden(-20%)';
            name = currentLanguage === 'zh' ? `隐藏${baseCombination.name}` : `Hidden ${baseCombination.name}`;
          } else if (specialPattern.type === 'enhanced') {
            score = Math.round(score * 1.2);
            modifier = currentLanguage === 'zh' ? '加强(+20%)' : 'Enhanced(+20%)';
            name = currentLanguage === 'zh' ? `加强${baseCombination.name}` : `Enhanced ${baseCombination.name}`;
          } else if (specialPattern.type === 'mixed') {
            // Handle mixed effects (combination of hidden and enhanced)
            score = baseCombination.baseScore; // Neutral effect for mixed
            modifier = currentLanguage === 'zh' ? '混合效果' : 'Mixed Effect';
            name = currentLanguage === 'zh' ? `混合${baseCombination.name}` : `Mixed ${baseCombination.name}`;
          }
          
          combinations.push({
            number: sequence,
            position: `[${sequence}]`,
            digits: sequence,
            name,
            type: baseCombination.type,
            level: baseCombination.level,
            description: baseCombination.description,
            score,
            originalScore: baseCombination.baseScore,
            modifier,
            isHidden: specialPattern.type === 'hidden',
            _startIndex: i
          });
          
          scannedPositions.add(positionKey);
        }
      }
      
      // Check for Fuwei patterns
      const fuweiPattern = detectFuweiPattern(sequence);
      if (fuweiPattern.type && fuweiPattern.meaning) {
        const baseCombination = baseCombinations[sequence.substr(0, 2)];
        if (baseCombination) {
          let score = baseCombination.baseScore;
          let modifier = '';
          
          if (fuweiPattern.type === 'enhanced_5') {
            score = Math.round(score * 1.5); // 50% boost for 5-enhanced Fuwei
            modifier = currentLanguage === 'zh' ? '5的伏位(+50%)' : '5 Fuwei(+50%)';
          }
          
          combinations.push({
            number: sequence,
            position: `[${sequence}]`,
            digits: sequence,
            name: baseCombination.name,
            type: baseCombination.type,
            level: baseCombination.level,
            description: fuweiPattern.meaning,
            score,
            originalScore: baseCombination.baseScore,
            modifier,
            isHidden: false,
            _startIndex: i
          });
          
          specialCombinations.push({
            number: sequence,
            position: `位置${i + 1}-${i + length}`,
            type: 'special',
            name: currentLanguage === 'zh' ? '伏位特殊效果' : 'Fuwei Special Effect',
            description: fuweiPattern.meaning
          });
          
          scannedPositions.add(positionKey);
        }
      }
    }
  }
  
  // 2. Scan for basic two-digit combinations
  for (let i = 0; i < numbers.length - 1; i++) {
    const positionKey = `${i}-${i + 1}`;
    if (scannedPositions.has(positionKey)) continue;
    
    const combo = numbers.substr(i, 2);
    const baseCombination = baseCombinations[combo];
    
    if (baseCombination) {
      combinations.push({
        number: combo,
        position: `[${combo}]`,
        digits: combo,
        name: baseCombination.name,
        type: baseCombination.type,
        level: baseCombination.level,
        description: baseCombination.description,
        score: baseCombination.baseScore,
        originalScore: baseCombination.baseScore,
        isHidden: false,
        _startIndex: i
      });
    }
  }
  
  // 3. Priority scan for two-star combinations (enhanced detection with better deduplication)
  const foundStarCombinations = new Set<string>();
  
  // Scan all possible subsequences of different lengths (start with shortest for specificity)
  for (let length = 3; length <= Math.min(numbers.length, 8); length++) {
    for (let i = 0; i <= numbers.length - length; i++) {
      const sequence = numbers.substr(i, length);
      
      const twoStarResultForSequence = findTwoStarCombinationMeaning(sequence);
      if (twoStarResultForSequence.meaning && twoStarResultForSequence.stars) {
        const t = getTranslations(currentLanguage);
        
        // Determine the correct order based on which star appears first in the sequence
        const orderedStars = getStarsInSequenceOrder(sequence, twoStarResultForSequence.stars);
        const combinationKey1 = orderedStars.join('');
        const combinationKey2 = orderedStars.slice().reverse().join('');
        const translatedDescription = t.twoStarCombinations?.[combinationKey1] || 
                                     t.twoStarCombinations?.[combinationKey2] || 
                                     twoStarResultForSequence.meaning;
        
        // Format star names for display in correct order
        const starNames = orderedStars.map(star => 
          currentLanguage === 'zh' ? star : (t.starNames?.[star] || star)
        );
        const displayName = currentLanguage === 'zh' 
          ? `${starNames[0]} + ${starNames[1]}`
          : `${starNames[0]} + ${starNames[1]}`;
        
        // Find the most specific part that triggered this combination
        const relevantPart = findRelevantSequenceForStars(sequence, orderedStars);
        const finalSequence = relevantPart || sequence;
        
        // Use the actual number sequence as primary key to prevent same sequence appearing twice
        const numberSequenceKey = finalSequence;
        
        if (!foundStarCombinations.has(numberSequenceKey)) {
          specialCombinations.push({
            number: finalSequence,
            position: `位置${i + 1}-${i + length}`,
            type: 'star_combination',
            name: displayName,
            description: translatedDescription
          });
          foundStarCombinations.add(numberSequenceKey);
        }
      }
    }
  }
  
  // 5. Detect continuous patterns
  detectContinuousPatterns(numbers, specialCombinations, currentLanguage);
  
  // 6. Calculate stats
  const stats = calculateMagneticFieldStats(combinations, specialCombinations);
  
  // Sort combinations by their position in the number sequence
  combinations.sort((a, b) => a._startIndex - b._startIndex);
  
  // Strip internal _startIndex before returning
  const sortedCombinations: Combination[] = combinations.map(({ _startIndex, ...rest }) => rest);

  return {
    combinations: sortedCombinations,
    specialCombinations,
    stats,
    displayNumber: numbers
  };
}

/**
 * Extract base combinations from special sequences like 103 (contains 13)
 */
function extractBaseCombinationsFromSequence(
  sequence: string, 
  startIndex: number, 
  combinations: (Combination & { _startIndex: number })[], 
  baseCombinations: Record<string, any>
) {
  // For sequences like 103, extract all possible 2-digit combinations
  // Check consecutive pairs only (skip-one patterns removed to avoid false detections)
  for (let i = 0; i < sequence.length - 1; i++) {
    const combo = sequence.substr(i, 2);
    const baseCombination = baseCombinations[combo];
    
    if (baseCombination) {
      combinations.push({
        number: combo,
        position: `[${combo}]`,
        digits: combo,
        name: baseCombination.name,
        type: baseCombination.type,
        level: baseCombination.level,
        description: baseCombination.description,
        score: baseCombination.baseScore,
        originalScore: baseCombination.baseScore,
        isHidden: false,
        _startIndex: startIndex + i
      });
    }
  }
}

/**
 * Detect continuous patterns like 123, 321, 111
 */
function detectContinuousPatterns(numbers: string, specialCombinations: SpecialCombination[], currentLanguage: Language) {
  const t = getTranslations(currentLanguage);
  
  for (let i = 0; i < numbers.length - 2; i++) {
    const threeDigit = numbers.substr(i, 3);
    const digits = threeDigit.split('').map(Number);
    
    // Ascending sequence
    if (digits[1] === digits[0] + 1 && digits[2] === digits[1] + 1) {
      specialCombinations.push({
        number: threeDigit,
        position: `位置${i + 1}-${i + 3}`,
        type: 'special',
        name: t.specialCombinationTexts?.continuousUp || '连续上升',
        description: t.specialCombinationTexts?.continuousUpDesc || '连续上升数字组合',
        effect: t.specialCombinationTexts?.continuousUpEffect || '能量递增'
      });
    }
    
    // Descending sequence
    if (digits[1] === digits[0] - 1 && digits[2] === digits[1] - 1) {
      specialCombinations.push({
        number: threeDigit,
        position: `位置${i + 1}-${i + 3}`,
        type: 'special',
        name: t.specialCombinationTexts?.continuousDown || '连续下降',
        description: t.specialCombinationTexts?.continuousDownDesc || '连续下降数字组合',
        effect: t.specialCombinationTexts?.continuousDownEffect || '能量递减'
      });
    }
    
    // Triple same digits
    if (digits[0] === digits[1] && digits[1] === digits[2]) {
      specialCombinations.push({
        number: threeDigit,
        position: `位置${i + 1}-${i + 3}`,
        type: 'special',
        name: t.specialCombinationTexts?.tripleForce || '三重力量',
        description: t.specialCombinationTexts?.tripleForceDesc || '三位相同数字',
        effect: currentLanguage === 'zh' ? 
          `数字${digits[0]}的强化效果` : 
          `Enhanced effect of number ${digits[0]}`
      });
    }
  }
}

/**
 * Determine the correct order of stars based on their appearance in the sequence
 */
function getStarsInSequenceOrder(sequence: string, stars: string[]): string[] {
  const baseCombinations = createBaseCombinationMap();
  const starPositions: { star: string; position: number }[] = [];
  
  // Find the earliest position of each star in the sequence
  stars.forEach(star => {
    let earliestPosition = sequence.length;
    
    // Check all possible 2-digit combinations in the sequence
    for (let i = 0; i < sequence.length - 1; i++) {
      const combo = sequence.substr(i, 2);
      const baseCombination = baseCombinations[combo];
      if (baseCombination) {
        const starName = baseCombination.name.replace(/[1-4]$/, '');
        if (starName === star && i < earliestPosition) {
          earliestPosition = i;
        }
      }
    }
    
    // Skip-one detection removed to avoid false positives
    
    // Removed: Check all possible 2-digit combinations - was creating false positives
    
    starPositions.push({ star, position: earliestPosition });
  });
  
  // Sort by position and return the ordered stars
  return starPositions
    .sort((a, b) => a.position - b.position)
    .map(item => item.star);
}

/**
 * Find the most relevant part of a sequence that contains the given stars
 */
function findRelevantSequenceForStars(sequence: string, stars: string[]): string | null {
  const baseCombinations = createBaseCombinationMap();
  const starBaseNames = stars.map(star => star.replace(/[1-4]$/, ''));
  
  // Look for the shortest subsequence that contains both stars
  for (let length = 3; length <= sequence.length; length++) {
    for (let i = 0; i <= sequence.length - length; i++) {
      const subseq = sequence.substr(i, length);
      const detectedStars = new Set<string>();
      
      // Check consecutive pairs
      for (let j = 0; j < subseq.length - 1; j++) {
        const combo = subseq.substr(j, 2);
        const baseCombination = baseCombinations[combo];
        if (baseCombination) {
          const starName = baseCombination.name.replace(/[1-4]$/, '');
          detectedStars.add(starName);
        }
      }
      
      // Skip-one detection removed to avoid false positives
      
      // Removed: Check all possible 2-digit combinations - was creating false positives
      
      // Check if this subsequence contains both target stars
      if (starBaseNames.every(star => detectedStars.has(star))) {
        return subseq;
      }
    }
  }
  
  return null;
}

/**
 * Calculate magnetic field statistics
 */
function calculateMagneticFieldStats(combinations: Combination[], specialCombinations: SpecialCombination[]): MagneticFieldStats {
  let totalLuckyScore = 0;
  let totalUnluckyScore = 0;
  let luckyCount = 0;
  let unluckyCount = 0;

  const starStats: Record<string, { score: number; count: number; type: 'lucky' | 'unlucky' }> = {};

  combinations.forEach(combo => {
    const baseName = combo.name.replace(/[1-4]$/, '').replace('隐藏', '').replace('加强', '').replace('混合', '').replace('Hidden ', '').replace('Enhanced ', '').replace('Mixed ', '');
    
    if (!starStats[baseName]) {
      starStats[baseName] = { score: 0, count: 0, type: combo.type };
    }
    
    starStats[baseName].score += combo.score;
    starStats[baseName].count += 1;
    
    if (combo.type === 'lucky') {
      totalLuckyScore += combo.score;
      luckyCount++;
    } else {
      totalUnluckyScore += combo.score;
      unluckyCount++;
    }
  });

  // Find dominant field
  let dominantField = '';
  let dominantType: 'lucky' | 'unlucky' = 'lucky';
  let maxScore = 0;

  Object.entries(starStats).forEach(([starName, stats]) => {
    if (stats.score > maxScore) {
      maxScore = stats.score;
      dominantField = starName;
      dominantType = stats.type;
    }
  });

  return {
    totalLuckyScore,
    totalUnluckyScore,
    dominantField,
    dominantType,
    luckyCount,
    unluckyCount,
    specialCount: specialCombinations.length
  };
}