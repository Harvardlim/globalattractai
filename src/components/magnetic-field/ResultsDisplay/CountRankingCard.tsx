import React from 'react';
import { Language } from '@/types/index';

interface CountRankingCardProps {
  sortedByCount: Array<[string, { score: number; type: 'lucky' | 'unlucky'; count: number }]>;
  currentLanguage: Language;
  translations: any;
}

export function CountRankingCard({ sortedByCount, currentLanguage, translations }: CountRankingCardProps) {
  const maxCount = sortedByCount[0]?.[1]?.count || 1;

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-500 rounded"></div>
        {translations.fieldRanking}
      </h3>
      <div className="space-y-3">
        {sortedByCount.map(([starName, stats], index) => {
          const percentage = (stats.count / maxCount) * 100;
          const isLucky = stats.type === 'lucky';
          
          return (
            <div key={starName} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                isLucky ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {currentLanguage === 'zh' ? starName[0] : (translations.starNames[starName] || starName).slice(0,2)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    {currentLanguage === 'zh' ? starName : translations.starNames[starName] || starName}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold">{stats.count}</span>
                    <span className="text-xs text-muted-foreground">↑</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isLucky ? 'bg-blue-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
