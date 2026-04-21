import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, Zap, Copy } from 'lucide-react';
import { Combination, Language } from '@/types/index';

interface DetailedCombinationsCardProps {
  combinations: Combination[];
  currentLanguage: Language;
  translations: any;
  displayNumber: string;
}

export function DetailedCombinationsCard({ combinations, currentLanguage, translations, displayNumber }: DetailedCombinationsCardProps) {
  const translateStarName = (name: string): string => {
    if (currentLanguage === 'zh') return name;
    
    // Extract the base star name by removing modifiers and numbers
    let baseName = name
      .replace(/^(隐藏|加强|混合|Hidden\s+|Enhanced\s+|Mixed\s+)/i, '')
      .replace(/[1-4]$/, '');
    
    // Get the trailing number if it exists
    const numberMatch = name.match(/[1-4]$/);
    const number = numberMatch ? numberMatch[0] : '';
    
    // Look up translation
    const translated = translations.starNames[baseName];
    return translated ? `${translated}${number}` : name;
  };

  const handleCopy = () => {
    let copyText = `${displayNumber}\n`;
    combinations.forEach(combo => {
      const comboName = translateStarName(combo.name);
      copyText += `[${combo.digits}]${comboName}\n`;
    });
    
    navigator.clipboard.writeText(copyText.trim()).then(() => {
      alert(currentLanguage === 'zh' ? '详细分析已复制到剪贴板' : 'Detailed analysis copied to clipboard');
    });
  };

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">{translations.detailedAnalysis}</h3>
        {/* <button 
          onClick={handleCopy}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          title={currentLanguage === 'zh' ? '复制详细分析' : 'Copy detailed analysis'}
        >
          <Copy className="w-4 h-4 text-muted-foreground" />
        </button> */}
      </div>
      
      <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">
              {currentLanguage === 'zh' ? '分析号码' : currentLanguage === 'en' ? 'Analyzed Number' : 'Nombor Dianalisis'}
            </div>
            <div className="text-xl font-mono font-bold">
              {displayNumber}
            </div>
          </div>
          {/* <button 
            onClick={handleCopy}
            className="ml-3 p-2 bg-background hover:bg-muted rounded-md transition-colors shadow-sm border border-border"
            title={currentLanguage === 'zh' ? '复制详细分析' : 'Copy detailed analysis'}
          >
            <Copy className="w-4 h-4 text-primary" />
          </button> */}
        </div>
      </div>
      
      <div className="space-y-3">
        {combinations.map((combo, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Badge variant={combo.type === 'lucky' ? 'outline' : 'destructive'} className={`font-mono ${combo.type === 'lucky' ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400' : ''}`}>
                [{combo.digits}]
              </Badge>
              <div>
                <div className="font-medium flex items-center gap-2">
                  {translateStarName(combo.name)}
                  {combo.isHidden && (
                    <Eye className="w-3 h-3 text-muted-foreground" />
                  )}
                  {combo.modifier?.includes('加强') && (
                    <Zap className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentLanguage === 'zh' ? combo.description : translations.descriptions[combo.description]}
                </div>
              </div>
            </div>
            {/* <div className="text-right">
              <div className="font-bold text-lg">{combo.score}{translations.salesAnalysis.score}</div>
              {combo.modifier && (
                <div className="text-xs text-primary">{combo.modifier}</div>
              )}
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
}
