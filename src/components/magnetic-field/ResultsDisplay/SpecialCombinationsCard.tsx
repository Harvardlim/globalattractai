import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Eye, Zap, Info } from 'lucide-react';
import { SpecialCombination, Language } from '@/types/index';

interface SpecialCombinationsCardProps {
  specialCombinations: SpecialCombination[];
  translations: any;
  currentLanguage?: Language;
}

export function SpecialCombinationsCard({ specialCombinations, translations, currentLanguage = 'zh' }: SpecialCombinationsCardProps) {
  if (specialCombinations.length === 0) return null;

  // Function to translate names (both star combinations and special combinations)
  const translateName = (name: string, type: string, number?: string) => {
    if (currentLanguage === 'zh') {
      return name;
    }

    if (type === 'star_combination') {
      // Parse star names from Chinese and translate them
      const starMatches = name.match(/(天医|延年|生气|伏位|绝命|祸害|五鬼|六煞)/g);
      if (starMatches && starMatches.length === 2) {
        const translatedStars = starMatches.map(star => translations.starNames?.[star] || star);
        return `${translatedStars[0]} + ${translatedStars[1]}`;
      }
    } else if (type === 'special') {
      // Check for specific special pattern texts first
      if (name === '三重力量') return translations.specialCombinationTexts?.tripleForce || name;
      if (name === '连续上升') return translations.specialCombinationTexts?.continuousUp || name;
      if (name === '连续下降') return translations.specialCombinationTexts?.continuousDown || name;
      
      // For multi-digit meanings, use the number field directly
      if (number && translations.multiDigitMeanings?.[number]) {
        return translations.multiDigitMeanings[number];
      }
      
      // Fallback: try to extract number from name
      const extractedNumber = name.match(/\d+/)?.[0];
      if (extractedNumber && translations.multiDigitMeanings?.[extractedNumber]) {
        return translations.multiDigitMeanings[extractedNumber];
      }
    }
    
    return name;
  };

  // Function to translate descriptions
  const translateDescription = (name: string, description: string, type: string, number?: string) => {
    if (currentLanguage === 'zh') {
      return description;
    }

    if (type === 'star_combination') {
      // For star combinations, find the matching translation key
      const starMatches = name.match(/(天医|延年|生气|伏位|绝命|祸害|五鬼|六煞)/g);
      if (starMatches && starMatches.length === 2) {
        // Try both orders: original and reversed
        const combination1 = starMatches.join('');
        const combination2 = starMatches.reverse().join('');
        return translations.twoStarCombinations?.[combination1] || 
               translations.twoStarCombinations?.[combination2] || 
               description;
      }
    } else if (type === 'special') {
      // Check for specific special pattern descriptions
      if (description === '三位相同数字') return translations.specialCombinationTexts?.tripleForceDesc || description;
      if (description === '三位连续递增数字') return translations.specialCombinationTexts?.continuousUpDesc || description;
      if (description === '三位连续递减数字') return translations.specialCombinationTexts?.continuousDownDesc || description;
      
      // For multi-digit meanings, use the number field directly
      if (number && translations.multiDigitMeanings?.[number]) {
        return translations.multiDigitMeanings[number];
      }
      
      // Fallback: try to extract number from name
      const extractedNumber = name.match(/\d+/)?.[0];
      if (extractedNumber && translations.multiDigitMeanings?.[extractedNumber]) {
        return translations.multiDigitMeanings[extractedNumber];
      }
    }

    return description;
  };

  // Function to translate effect text
  const translateEffect = (name: string, effect: string, type: string) => {
    if (currentLanguage === 'zh' || !effect) {
      return effect;
    }

    if (type === 'special') {
      // Check for specific effect patterns
      if (effect.includes('数字3的强化效果')) {
        return translations.specialCombinationTexts?.tripleForceEffect || effect;
      }
      if (effect === '能量递增') return translations.specialCombinationTexts?.continuousUpEffect || effect;
      if (effect === '能量递减') return translations.specialCombinationTexts?.continuousDownEffect || effect;
    }

    return effect;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'hidden': return <Eye className="w-4 h-4 text-muted-foreground" />;
      case 'enhanced': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'star_combination': return <Star className="w-4 h-4 text-blue-500" />;
      case 'special': return <Star className="w-4 h-4 text-purple-500" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'hidden': return 'bg-muted/50 border-border';
      case 'enhanced': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'star_combination': return 'bg-blue-500/10 border-blue-500/20';
      case 'special': return 'bg-purple-500/10 border-purple-500/20';
      default: return 'bg-muted/50 border-border';
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
        <Star className="w-4 h-4 text-yellow-500" />
        {translations.specialCombinations}
      </h3>
      <div className="space-y-3">
        {specialCombinations.map((special, index) => (
          <div key={index} className={`border rounded-lg p-3 ${getBgColor(special.type)}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getIcon(special.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono text-xs">
                    {special.number}
                  </Badge>
                  <span className="font-medium text-sm">
                    {translateName(special.name, special.type, special.number)}
                  </span>
                  <Badge 
                    variant={
                      special.type === 'enhanced' ? 'default' : 
                      special.type === 'hidden' ? 'secondary' : 
                      special.type === 'star_combination' ? 'default' :
                      'outline'
                    }
                    className="text-xs"
                  >
                    {special.type === 'star_combination' ? 
                      (translations.specialTypes?.star_combination || 'Star Combination') : 
                      (translations.specialTypes?.[special.type as keyof typeof translations.specialTypes] || special.type)
                    }
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {translateDescription(special.name, special.description, special.type, special.number)}
                </div>
                <div className="text-xs text-muted-foreground/70">
                  {translateEffect(special.name, special.effect, special.type)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
