import React, { useMemo } from 'react';
import { Phone } from 'lucide-react';
import { analyzeNumberEnhanced } from '@/utils/enhancedAnalysisUtils';
import { convertAlphabetsToNumbers } from '@/utils/alphabetConverter';
import { getTranslations } from '@/data/translations';
import { EnergyAnalysisDisplay } from '@/components/magnetic-field/ResultsDisplay/EnergyAnalysisDisplay';
import { ResultsSection } from '@/components/magnetic-field/ResultsSection';
import { Language } from '@/types/index';
import { useLanguage } from '@/hooks/useLanguage';

interface PhoneEnergySectionProps {
  phoneNumber: string;
}

export const PhoneEnergySection: React.FC<PhoneEnergySectionProps> = ({ phoneNumber }) => {
  const { currentLanguage } = useLanguage();
  const t = getTranslations(currentLanguage);

  const results = useMemo(() => {
    try {
      const converted = convertAlphabetsToNumbers(phoneNumber);
      return analyzeNumberEnhanced(converted, currentLanguage);
    } catch {
      return null;
    }
  }, [phoneNumber]);

  if (!results) return null;

  const handleCopy = () => {
    let text = `数字能量分析：${results.displayNumber}\n\n`;
    text += `主导磁场：${results.stats.dominantField}\n\n`;
    results.combinations.forEach(combo => {
      text += `[${combo.digits}] ${combo.name} - ${combo.score}分\n`;
    });
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-3">
      <EnergyAnalysisDisplay
        results={results}
        currentLanguage={currentLanguage}
        translations={t}
        onCopyResults={handleCopy}
        collapsible
      />
    </div>
  );
};
