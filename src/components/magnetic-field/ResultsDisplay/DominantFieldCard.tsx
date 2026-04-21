import React from 'react';
import { Info, Copy } from 'lucide-react';
import { AnalysisResults, Language } from '@/types/index';

interface DominantFieldCardProps {
  results: AnalysisResults;
  currentLanguage: Language;
  translations: any;
  onCopyResults: () => void;
}

export function DominantFieldCard({ results, currentLanguage, translations, onCopyResults }: DominantFieldCardProps) {
  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium flex items-center gap-2">
          {/* <Info className="w-4 h-4 text-primary" /> */}
          {translations.dominantField}
        </h2>
        {/* <button onClick={onCopyResults} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Copy className="w-4 h-4 text-muted-foreground" />
        </button> */}
      </div>
      
      <div className="bg-emerald-500/10 rounded-lg p-4 mb-4">
        <div className="text-center">
          <div className="inline-block bg-emerald-500/20 rounded-lg px-4 py-2 mb-2">
            <div className="text-emerald-700 dark:text-emerald-300 text-xl font-bold">
              {currentLanguage === 'zh' ? results.stats.dominantField : translations.starNames[results.stats.dominantField] || results.stats.dominantField}{currentLanguage === 'zh' ? '磁场' : currentLanguage === 'ms' ? ' Medan' : ' Field'}
            </div>
          </div>
          <div className="text-muted-foreground text-sm">
            {currentLanguage === 'zh' ? 
              `此号码的主导磁场是${results.stats.dominantField}（因为磁场分数最高）` : 
              currentLanguage === 'ms' ?
                `Medan dominan nombor ini ialah ${translations.starNames[results.stats.dominantField] || results.stats.dominantField} (skor medan tertinggi)` :
                `This number's dominant field is ${translations.starNames[results.stats.dominantField] || results.stats.dominantField} (highest field score)`
            }
          </div>
        </div>
      </div>

      <div className="text-2xl font-bold text-center">
        {results.displayNumber}
      </div>
    </div>
  );
}
