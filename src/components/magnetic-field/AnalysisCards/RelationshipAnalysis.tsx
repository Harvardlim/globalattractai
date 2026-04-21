import React from 'react';
import { Users } from 'lucide-react';
import { Combination, MagneticFieldStats, Language } from '@/types/index';
import { getTranslations } from '@/data/translations';

interface RelationshipAnalysisProps {
  combinations: Combination[];
  stats: MagneticFieldStats;
  currentLanguage: Language;
}

export function RelationshipAnalysis({ combinations, stats, currentLanguage }: RelationshipAnalysisProps) {
  const t = getTranslations(currentLanguage);
  const relationshipCombos = combinations.filter(c => 
    c.description.includes('人脉') || c.description.includes('婚姻') || c.description.includes('桃花')
  );
  const relationshipScore = relationshipCombos.reduce((sum, c) => sum + c.score, 0);
  
  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-500" />
        {t.salesAnalysis.relationshipAnalysis}
      </h3>
      <div className="space-y-3">
        <div className="bg-blue-500/10 p-3 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{t.salesAnalysis.relationshipIndex}: {relationshipScore}{t.salesAnalysis.score}</div>
          <div className="text-sm text-blue-600/80 mt-1">
            {relationshipScore > 150 ? t.salesAnalysis.excellentRelationships : 
             relationshipScore > 75 ? t.salesAnalysis.goodSocial : 
             relationshipScore > 25 ? t.salesAnalysis.averageNetwork : t.salesAnalysis.introverted}
          </div>
        </div>
        {relationshipCombos.length > 0 && (
          <div>
            <div className="font-medium mb-2 text-sm">{t.salesAnalysis.relatedFields}:</div>
            {relationshipCombos.map((combo, idx) => (
              <div key={idx} className="text-sm bg-muted/50 p-2 rounded">
                [{combo.digits}] {currentLanguage === 'zh' ? combo.name : t.starNames[combo.name.replace(/[1-4]$/, '').replace('隐藏', '').replace('加强', '')] + combo.name.slice(-1)} - {combo.score}{t.salesAnalysis.score}
              </div>
            ))}
          </div>
        )}
        <div className="text-sm text-muted-foreground">
          <strong>{t.salesAnalysis.relationshipAdvice}：</strong>
          {relationshipScore > 100 ? 
           (currentLanguage === 'zh' ? '您的人际关系能量很好，善于社交和建立人脉。' : 
            currentLanguage === 'ms' ? 'Tenaga hubungan anda sangat baik, mahir dalam sosial dan membina rangkaian.' : 
            'Your relationship energy is excellent, good at socializing and networking.') :
           relationshipScore > 50 ?
           (currentLanguage === 'zh' ? '您具备稳定的人际关系，建议多参与社交活动。' : 
            currentLanguage === 'ms' ? 'Anda mempunyai hubungan yang stabil, cadangkan lebih banyak penyertaan dalam aktiviti sosial.' : 
            'You have stable relationships, consider participating in more social activities.') :
           (currentLanguage === 'zh' ? '建议您多花时间维护和发展人际关系。' : 
            currentLanguage === 'ms' ? 'Cadangkan anda meluangkan lebih banyak masa untuk mengekalkan dan membangunkan hubungan.' : 
            'Spend more time maintaining and developing relationships.')}
        </div>
      </div>
    </div>
  );
}
