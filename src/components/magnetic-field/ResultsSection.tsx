
import React from 'react';
import { getTranslations } from '@/data/translations';
import { EnergyAnalysisDisplay } from './ResultsDisplay/EnergyAnalysisDisplay';
import { EnergyInformationDisplay } from './ResultsDisplay/EnergyInformationDisplay';
import { WealthAnalysis, HealthAnalysis, RelationshipAnalysis } from './AnalysisCards';
import { ActiveTab, AnalysisResults, Language } from '@/types/index';

interface ResultsSectionProps {
  numberGenerator?: boolean
  results: AnalysisResults;
  currentLanguage: Language;
  // activeTab: ActiveTab;
  onCopyResults: () => void;
}

export function ResultsSection({ numberGenerator, results, currentLanguage, onCopyResults }: ResultsSectionProps) {
  const t = getTranslations(currentLanguage);

  return (
    <div className="space-y-4 pb-20">
      
      <EnergyAnalysisDisplay 
        results={results}
        currentLanguage={currentLanguage}
        translations={t}
        onCopyResults={onCopyResults}
      />

      <EnergyInformationDisplay currentLanguage={currentLanguage} combinations={results.combinations} />


      {numberGenerator? (
        <div></div>
      ):(
        <div className="flex flex-col gap-4">
         <WealthAnalysis combinations={results.combinations} stats={results.stats} currentLanguage={currentLanguage} />
         <HealthAnalysis combinations={results.combinations} stats={results.stats} currentLanguage={currentLanguage} />
         <RelationshipAnalysis combinations={results.combinations} stats={results.stats} currentLanguage={currentLanguage} />
        </div>
      )}
    </div>
  );
}
