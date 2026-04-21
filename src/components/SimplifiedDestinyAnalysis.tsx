import React, { useMemo } from 'react';
import { Heart, Compass, Brain, Users, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FourPillars } from '@/types';
import { analyzeBaziPattern, STEM_ELEMENTS, ELEMENT_NAMES, HEAVENLY_STEMS } from '@/lib/baziPatternAnalysis';
import { DAY_MASTER_PERSONALITIES } from '@/data/dayMasterPersonalityData';
import { useLanguage } from '@/hooks/useLanguage';
import { getSimplifiedAnalysisTranslations } from '@/data/destinyTranslations';

interface SimplifiedDestinyAnalysisProps {
  pillars: FourPillars;
  includeHour: boolean;
  chart?: any;
  restrictedMode?: boolean;
  gender?: '男' | '女';
}

interface AnalysisCard {
  key: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  items: { label: string; content: string }[];
  locked?: boolean;
}

const SimplifiedDestinyAnalysis: React.FC<SimplifiedDestinyAnalysisProps> = ({
  pillars,
  includeHour,
  chart,
  restrictedMode = false,
  gender,
}) => {
  const { currentLanguage } = useLanguage();
  const t = useMemo(() => getSimplifiedAnalysisTranslations(currentLanguage), [currentLanguage]);

  const analysis = useMemo(() => {
    return analyzeBaziPattern(pillars, includeHour);
  }, [pillars, includeHour]);

  const dayStem = HEAVENLY_STEMS[pillars.day.ganIdx];
  const personality = DAY_MASTER_PERSONALITIES[dayStem];

  const cards = useMemo<AnalysisCard[]>(() => {
    const result: AnalysisCard[] = [];

    // 1. Personality - always visible
    if (personality) {
      result.push({
        key: 'personality',
        icon: <Brain className="h-5 w-5" />,
        title: t.personality,
        color: 'text-purple-500',
        items: [
          { label: t.dayMasterLabel, content: `${dayStem}（${personality.nickname}）- ${personality.polarity}${personality.element}` },
          { label: t.corePersonality, content: personality.elementTraits },
          { label: t.strengths, content: personality.strengths.join('、') },
          { label: t.reminders, content: personality.weaknesses.join('、') },
          ...(personality.communication ? [
            { label: t.communicationStyle, content: personality.communication.approach },
          ] : []),
        ],
      });
    }

    // 2. Health - always visible
    const healthItems: { label: string; content: string }[] = [];
    if (personality?.health) {
      const genderFocus = gender === '女' ? personality.health.femaleFocus : gender === '男' ? personality.health.maleFocus : undefined;
      const focusItems = [...personality.health.focus, ...(genderFocus || [])];
      const genderAdvice = gender === '女' ? personality.health.femaleAdvice : gender === '男' ? personality.health.maleAdvice : undefined;
      healthItems.push(
        { label: t.healthFocus, content: focusItems.join('、') },
        { label: t.healthAdvice, content: [personality.health.advice, genderAdvice].filter(Boolean).join('') },
      );
    }
    const { dayMaster } = analysis;
    const bodyStrength = dayMaster.strength === 'strong' ? t.bodyStrong : 
                         dayMaster.strength === 'weak' ? t.bodyWeak : t.bodyBalanced;
    healthItems.push({ label: t.bodyStatus, content: `${bodyStrength}，${t.dayMasterLabel}${ELEMENT_NAMES[STEM_ELEMENTS[pillars.day.ganIdx]]}` });

    if (chart) {
      const dayGanIdx = pillars.day.ganIdx;
      const dayGan = HEAVENLY_STEMS[dayGanIdx];
      for (const palace of chart.palaces || []) {
        if (palace.heavenlyStem === dayGan || palace.earthlyStem === dayGan) {
          if (palace.isVoid) {
            healthItems.push({ label: t.qimenHint, content: t.qimenVoidMsg });
          }
          break;
        }
      }
    }

    result.push({
      key: 'health',
      icon: <Heart className="h-5 w-5" />,
      title: t.health,
      color: 'text-red-500',
      items: healthItems,
    });

    // 3. Life Trajectory - locked for normal
    const trajectoryItems: { label: string; content: string }[] = [];
    if (personality?.career) {
      trajectoryItems.push(
        { label: t.suitableDirection, content: personality.career.suitable.slice(0, 5).join('、') },
        { label: t.careerAdvice, content: personality.career.advice },
      );
      if (personality.career.unsuitable.length > 0) {
        trajectoryItems.push({ label: t.avoidNote, content: personality.career.unsuitable.slice(0, 3).join('、') });
      }
    }
    if (dayMaster.strength === 'strong') {
      trajectoryItems.push({ label: t.destinyFeature, content: t.strongDestiny });
    } else if (dayMaster.strength === 'weak') {
      trajectoryItems.push({ label: t.destinyFeature, content: t.weakDestiny });
    } else {
      trajectoryItems.push({ label: t.destinyFeature, content: t.balancedDestiny });
    }

    result.push({
      key: 'trajectory',
      icon: <Compass className="h-5 w-5" />,
      title: t.trajectory,
      color: 'text-blue-500',
      items: trajectoryItems,
      locked: restrictedMode,
    });

    // 4. Relationships - locked for normal
    const relationshipItems: { label: string; content: string }[] = [];
    if (personality?.relationship) {
      relationshipItems.push(
        { label: t.loveStyle, content: personality.relationship.style },
        { label: t.loveStrengths, content: personality.relationship.strengths.join('、') },
        { label: t.loveChallenges, content: personality.relationship.challenges.join('、') },
        { label: t.idealPartner, content: personality.relationship.idealPartner },
        { label: t.marriageAdvice, content: personality.relationship.advice },
      );
    }

    result.push({
      key: 'relationship',
      icon: <Users className="h-5 w-5" />,
      title: t.relationship,
      color: 'text-pink-500',
      items: relationshipItems,
      locked: restrictedMode,
    });

    return result;
  }, [personality, analysis, pillars, chart, dayStem, restrictedMode, t, gender]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">{t.title}</h3>
      {cards.map((card) => (
        <Collapsible key={card.key} defaultOpen={!card.locked}>
          <Card className={cn("border", card.locked && "opacity-60")}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <span className={card.color}>{card.icon}</span>
                  <span className="font-medium text-sm">{card.title}</span>
                  {card.locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {card.locked ? (
                <CardContent className="pt-0 pb-4">
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p>{t.upgradeToUnlock}</p>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="pt-0 pb-4 space-y-2">
                  {card.items.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium text-muted-foreground">{item.label}：</span>
                      <span>{item.content}</span>
                    </div>
                  ))}
                </CardContent>
              )}
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
};

export default SimplifiedDestinyAnalysis;
