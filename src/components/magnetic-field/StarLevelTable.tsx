import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { getEnergyTranslations } from '@/data/energyTranslations';
import { getTranslations } from '@/data/translations';

const STARS = [
  { name: '天医', type: 'lucky', levels: ['13/31', '68/86', '49/94', '27/72'] },
  { name: '延年', type: 'lucky', levels: ['19/91', '78/87', '34/43', '26/62'] },
  { name: '生气', type: 'lucky', levels: ['14/41', '67/76', '39/93', '28/82'] },
  { name: '伏位', type: 'lucky', levels: ['11/22', '88/99', '66/77', '33/44'] },
  { name: '绝命', type: 'unlucky', levels: ['12/21', '69/96', '48/84', '37/73'] },
  { name: '祸害', type: 'unlucky', levels: ['17/71', '89/98', '46/64', '23/32'] },
  { name: '五鬼', type: 'unlucky', levels: ['18/81', '79/97', '36/63', '24/42'] },
  { name: '六煞', type: 'unlucky', levels: ['16/61', '47/74', '38/83', '29/92'] },
];

export const StarLevelTable: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const et = getEnergyTranslations(currentLanguage);
  const t = getTranslations(currentLanguage);
  const LEVEL_LABELS = [et.level1, et.level2, et.level3, et.level4];
  const translateStar = (name: string) => t.starNames?.[name] || name;

  const luckyStars = STARS.filter(s => s.type === 'lucky');
  const unluckyStars = STARS.filter(s => s.type === 'unlucky');

  const renderTable = (stars: typeof STARS, title: string, headerColor: string, headerBg: string) => (
    <div className="space-y-1">
      <p className={cn("text-sm font-bold text-center", headerColor)}>{title}</p>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className={cn("text-xs", headerBg)}>
              <th className="py-1.5 px-2 text-left font-medium border-r border-border">{title}</th>
              {LEVEL_LABELS.map(l => (
                <th key={l} className="py-1.5 px-1 text-center font-medium border-r border-border last:border-r-0">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stars.map((star, i) => (
              <tr key={star.name} className={cn("border-t border-border", i % 2 === 0 ? "bg-background" : "bg-muted/30")}>
                <td className="py-2 px-2 font-medium border-r border-border">{translateStar(star.name)}</td>
                {star.levels.map((pair, li) => (
                  <td key={li} className="py-2 px-1 text-center text-xs font-mono border-r border-border last:border-r-0">
                    {pair}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderTable(luckyStars, et.luckyStars, 'text-green-600', 'bg-green-50 dark:bg-green-900/20')}
      {renderTable(unluckyStars, et.unluckyStars, 'text-rose-600', 'bg-rose-50 dark:bg-rose-900/20')}
    </div>
  );
};
