
import React, { useState } from 'react';
import { AnalysisResults, Language } from '@/types/index';
import { getStarRankings } from '@/utils/analysisUtils';
import { DominantFieldCard } from './DominantFieldCard';
import { SpecialCombinationsCard } from './SpecialCombinationsCard';
import { ScoreRankingCard } from './ScoreRankingCard';
import { CountRankingCard } from './CountRankingCard';
import { DetailedCombinationsCard } from './DetailedCombinationsCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEnergyTranslations } from '@/data/energyTranslations';

interface EnergyAnalysisDisplayProps {
  numberGenerator?: boolean;
  results: AnalysisResults;
  currentLanguage: Language;
  translations: any;
  onCopyResults: () => void;
  collapsible?: boolean;
}

export function EnergyAnalysisDisplay({ numberGenerator, results, currentLanguage, translations, onCopyResults, collapsible }: EnergyAnalysisDisplayProps) {
  const { sortedByScore, sortedByCount } = getStarRankings(results.combinations);
  const [open, setOpen] = useState(false);
  const et = getEnergyTranslations(currentLanguage);

  const content = (
    <div className="space-y-4">
      {numberGenerator ? (
        <div></div>
      ) : (
        <DominantFieldCard
          results={results}
          currentLanguage={currentLanguage}
          translations={translations}
          onCopyResults={onCopyResults}
        />
      )}

      <DetailedCombinationsCard
        combinations={results.combinations}
        currentLanguage={currentLanguage}
        translations={translations}
        displayNumber={results.displayNumber}
      />

      <SpecialCombinationsCard
        specialCombinations={results.specialCombinations}
        translations={translations}
        currentLanguage={currentLanguage}
      />
    </div>
  );

  if (collapsible) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="bg-card rounded-lg border border-border">
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {et.digitalEnergyAnalysis}
              </span>
              <span className="text-xs text-muted-foreground">{results.displayNumber}</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            {content}
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  return content;
}
