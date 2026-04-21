import React from 'react';
import { Heart } from 'lucide-react';
import { Combination, MagneticFieldStats, Language } from '@/types/index';
import { getTranslations } from '@/data/translations';

interface HealthAnalysisProps {
  combinations: Combination[];
  stats: MagneticFieldStats;
  currentLanguage: Language;
}

export function HealthAnalysis({ combinations, stats, currentLanguage }: HealthAnalysisProps) {
  const t = getTranslations(currentLanguage);
  const healthCombos = combinations.filter(c => c.description.includes('健康') || c.description.includes('疾病'));
  const positiveHealthScore = combinations.filter(c => c.description.includes('健康') && c.type === 'lucky').reduce((sum, c) => sum + c.score, 0);
  const negativeHealthScore = combinations.filter(c => c.description.includes('疾病')).reduce((sum, c) => sum + c.score, 0);
  
  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
        <Heart className="w-4 h-4 text-red-500" />
        {t.salesAnalysis.healthAnalysis}
      </h3>
      <div className="space-y-3">
        <div className="bg-red-500/10 p-3 rounded-lg">
          <div className="text-lg font-bold text-red-600">
            {t.salesAnalysis.healthIndex}: {positiveHealthScore > negativeHealthScore ? t.salesAnalysis.healthGood : t.salesAnalysis.needsAttention}
          </div>
          <div className="text-sm text-red-600/80 mt-1">
            {t.salesAnalysis.positiveHealthEnergy}: {positiveHealthScore}{t.salesAnalysis.score} | {t.salesAnalysis.healthConcerns}: {negativeHealthScore}{t.salesAnalysis.score}
          </div>
        </div>
        {healthCombos.length > 0 && (
          <div>
            <div className="font-medium mb-2 text-sm">{t.salesAnalysis.relatedFields}:</div>
            {healthCombos.map((combo, idx) => (
              <div key={idx} className={`text-sm p-2 rounded ${combo.type === 'lucky' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                [{combo.digits}] {currentLanguage === 'zh' ? combo.name : t.starNames[combo.name.replace(/[1-4]$/, '').replace('隐藏', '').replace('加强', '')] + combo.name.slice(-1)} - {combo.score}{t.salesAnalysis.score}
              </div>
            ))}
          </div>
        )}
        <div className="text-sm text-muted-foreground">
          <strong>{t.salesAnalysis.healthAdvice}：</strong>
          {positiveHealthScore > negativeHealthScore ? 
           (currentLanguage === 'zh' ? '您的健康能量较为积极，适合保持当前的生活方式。' : 
            currentLanguage === 'ms' ? 'Tenaga kesihatan anda adalah positif, kekalkan gaya hidup semasa.' : 
            'Your health energy is positive, maintain current lifestyle.') :
           (currentLanguage === 'zh' ? '建议您多关注身体健康，注意预防疾病。' : 
            currentLanguage === 'ms' ? 'Cadangkan anda memberi lebih perhatian kepada kesihatan dan pencegahan penyakit.' : 
            'Pay more attention to health and disease prevention.')}
        </div>
      </div>
    </div>
  );
}
