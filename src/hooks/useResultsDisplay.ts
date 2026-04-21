
import { useState } from 'react';
import { AnalysisResults, Language } from '../types/index';

export function useResultsDisplay() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const isCardExpanded = (cardId: string) => expandedCards.has(cardId);

  const formatResultsForCopy = (results: AnalysisResults, currentLanguage: Language, translations: any) => {
    let text = `${translations.resultsTitle}：${results.displayNumber}\n\n`;
    text += `${translations.dominantField}：${results.stats.dominantField}\n\n`;
    
    results.combinations.forEach(combo => {
      text += `[${combo.digits}] ${combo.name} - ${combo.score}分\n`;
    });
    
    if (results.specialCombinations.length > 0) {
      text += `\n${translations.specialCombinations}：\n`;
      results.specialCombinations.forEach(special => {
        text += `${special.number} - ${special.name}\n`;
      });
    }
    
    return text;
  };

  return {
    expandedCards,
    toggleCardExpansion,
    isCardExpanded,
    formatResultsForCopy
  };
}
