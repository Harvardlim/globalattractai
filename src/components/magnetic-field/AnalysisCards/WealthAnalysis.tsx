import React from 'react';
import { DollarSign } from 'lucide-react';
import { Combination, MagneticFieldStats, Language } from '@/types/index';
import { getTranslations } from '@/data/translations';

interface WealthAnalysisProps {
  combinations: Combination[];
  stats: MagneticFieldStats;
  currentLanguage: Language;
}

export function WealthAnalysis({ combinations, stats, currentLanguage }: WealthAnalysisProps) {
  const t = getTranslations(currentLanguage);
  const wealthCombos = combinations.filter(c => c.description.includes('财富'));
  const totalWealthScore = wealthCombos.reduce((sum, c) => sum + c.score, 0);
  
  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-green-500" />
        {t.salesAnalysis.wealthAnalysis}
      </h3>
      <div className="space-y-3">
        <div className="bg-green-500/10 p-3 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {t.salesAnalysis.wealthIndex}: {totalWealthScore}{t.salesAnalysis.score}
          </div>
          <div className="text-sm text-green-600/80 mt-1">
            {totalWealthScore > 200 ? t.salesAnalysis.excellent : 
             totalWealthScore > 100 ? t.salesAnalysis.good : 
             totalWealthScore > 50 ? t.salesAnalysis.moderate : t.salesAnalysis.needsPlanning}
          </div>
        </div>
        {wealthCombos.length > 0 && (
          <div>
            <div className="font-medium mb-2 text-sm">{t.salesAnalysis.relatedFields}:</div>
            {wealthCombos.map((combo, idx) => (
              <div key={idx} className="text-sm bg-muted/50 p-2 rounded">
                [{combo.digits}] {currentLanguage === 'zh' ? combo.name : t.starNames[combo.name.replace(/[1-4]$/, '').replace('隐藏', '').replace('加强', '')] + combo.name.slice(-1)} - {combo.score}{t.salesAnalysis.score}
              </div>
            ))}
          </div>
        )}
        <div className="text-sm text-muted-foreground">
          <strong>{t.salesAnalysis.analysisAdvice}：</strong>
          {totalWealthScore > 150 ? 
            (currentLanguage === 'zh' ? '您拥有较强的财富积累能力，适合投资理财产品。' : 
             currentLanguage === 'ms' ? 'Anda mempunyai keupayaan pengumpulan kekayaan yang kuat, sesuai untuk produk pelaburan.' : 
             'You have strong wealth accumulation ability, suitable for investment products.') :
           totalWealthScore > 75 ? 
            (currentLanguage === 'zh' ? '您具备一定的财富管理能力，可考虑平衡型投资。' : 
             currentLanguage === 'ms' ? 'Anda mempunyai keupayaan pengurusan kekayaan yang baik, boleh mempertimbangkan pelaburan seimbang.' : 
             'You have decent wealth management ability, consider balanced investments.') :
            (currentLanguage === 'zh' ? '建议您重点关注稳健型财富积累方式。' : 
             currentLanguage === 'ms' ? 'Cadangkan anda fokus kepada kaedah pengumpulan kekayaan yang stabil.' : 
             'Focus on stable wealth accumulation methods.')}
        </div>
      </div>
    </div>
  );
}
