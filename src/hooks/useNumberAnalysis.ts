
import { useState } from 'react';
import { analyzeNumberEnhanced } from '@/utils/enhancedAnalysisUtils';
import { convertAlphabetsToNumbers } from '@/utils/alphabetConverter';
import { Language, AnalysisResults } from '../types/index';

export function useNumberAnalysis() {
  const [inputNumber, setInputNumber] = useState('');
  const [inputError, setInputError] = useState('');
  const [results, setResults] = useState<AnalysisResults | null>(null);

  const handleAnalyzeNumber = (currentLanguage: Language) => {
    setInputError('');
    
    if (!inputNumber.trim()) {
      setInputError('请输入号码');
      return;
    }
    
    try {
      const convertedNumber = convertAlphabetsToNumbers(inputNumber);
      const analysisResults = analyzeNumberEnhanced(convertedNumber, currentLanguage);
      setResults(analysisResults);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Analysis failed');
    }
  };
  
  const handleInputChange = (value: string) => {
    setInputNumber(value);
    if (inputError) setInputError('');
  };

  const clearInput = () => setInputNumber('');

  const copyResults = async (currentLanguage: Language) => {
    if (!results) return;
    
    const { getTranslations } = await import('@/data/translations');
    const t = getTranslations(currentLanguage);
    
    let text = `${t.resultsTitle}：${results.displayNumber}\n\n`;
    text += `${t.dominantField}：${results.stats.dominantField}\n\n`;
    
    results.combinations.forEach(combo => {
      text += `[${combo.digits}] ${combo.name} - ${combo.score}分\n`;
    });
    
    if (results.specialCombinations.length > 0) {
      text += `\n${t.specialCombinations}：\n`;
      results.specialCombinations.forEach(special => {
        text += `${special.number} - ${special.name}\n`;
      });
    }
    
    navigator.clipboard.writeText(text).then(() => {
      alert(currentLanguage === 'zh' ? '结果已复制到剪贴板' : 'Results copied to clipboard');
    });
  };

  return {
    inputNumber,
    setInputNumber: handleInputChange,
    inputError,
    results,
    setResults,
    handleAnalyzeNumber,
    clearInput,
    copyResults
  };
}
