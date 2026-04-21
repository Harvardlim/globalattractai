import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { analyzeNumberEnhanced } from '@/utils/enhancedAnalysisUtils';
import { ResultsSection } from './ResultsSection';
import { Language, AnalysisResults } from '@/types/index';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { getEnergyTranslations } from '@/data/energyTranslations';
import { getTranslations } from '@/data/translations';

// 八星定义：每颗星按等级分组
const STAR_DEFINITIONS = [
  {
    name: '天医', type: 'lucky' as const, description: '财富 & 婚姻',
    levels: { 1: ['13', '31'], 2: ['68', '86'], 3: ['49', '94'], 4: ['27', '72'] },
  },
  {
    name: '延年', type: 'lucky' as const, description: '事业 & 健康',
    levels: { 1: ['19', '91'], 2: ['78', '87'], 3: ['34', '43'], 4: ['26', '62'] },
  },
  {
    name: '生气', type: 'lucky' as const, description: '贵人 & 人脉',
    levels: { 1: ['14', '41'], 2: ['67', '76'], 3: ['39', '93'], 4: ['28', '82'] },
  },
  {
    name: '伏位', type: 'lucky' as const, description: '耐力 & 持续',
    levels: { 1: ['11', '22'], 2: ['88', '99'], 3: ['66', '77'], 4: ['33', '44'] },
  },
  {
    name: '绝命', type: 'unlucky' as const, description: '投资 & 情绪',
    levels: { 1: ['12', '21'], 2: ['69', '96'], 3: ['48', '84'], 4: ['37', '73'] },
  },
  {
    name: '祸害', type: 'unlucky' as const, description: '口才 & 疾病',
    levels: { 1: ['17', '71'], 2: ['89', '98'], 3: ['46', '64'], 4: ['23', '32'] },
  },
  {
    name: '五鬼', type: 'unlucky' as const, description: '智慧 & 灵性',
    levels: { 1: ['18', '81'], 2: ['79', '97'], 3: ['36', '63'], 4: ['24', '42'] },
  },
  {
    name: '六煞', type: 'unlucky' as const, description: '情商 & 桃花',
    levels: { 1: ['16', '61'], 2: ['47', '74'], 3: ['38', '83'], 4: ['29', '92'] },
  },
];

// Selection key: "天医-1", "天医-2", etc.
type StarLevelKey = string;
function makeKey(starName: string, level: number): StarLevelKey {
  return `${starName}-${level}`;
}

function generateAllNumbers(selectedKeys: StarLevelKey[], maxCount: number, digitCount: number): string[] {
  const pairSet = new Set<string>();
  for (const key of selectedKeys) {
    const [starName, levelStr] = key.split('-');
    const level = parseInt(levelStr) as 1 | 2 | 3 | 4;
    const star = STAR_DEFINITIONS.find(s => s.name === starName);
    if (star) star.levels[level]?.forEach(p => pairSet.add(p));
  }
  if (pairSet.size === 0) return [];

  const pairs = Array.from(pairSet);
  const adjMap: Record<string, string[]> = {};
  for (const p of pairs) {
    if (!adjMap[p[0]]) adjMap[p[0]] = [];
    adjMap[p[0]].push(p);
  }

  const results: string[] = [];
  const pairsNeeded = digitCount - 1;

  function dfs(chain: string[], lastDigit: string) {
    if (chain.length === pairsNeeded) {
      const digits = chain[0];
      const rest = chain.slice(1).map(p => p[1]).join('');
      results.push(digits + rest);
      return;
    }
    const next = adjMap[lastDigit] || [];
    for (const p of next) {
      if (results.length >= maxCount) return;
      chain.push(p);
      dfs(chain, p[1]);
      chain.pop();
    }
  }

  for (const p of pairs) {
    if (results.length >= maxCount) break;
    dfs([p], p[1]);
  }
  return results;
}

const PAGE_SIZE = 20;

export function NumberGenerator() {
  const [selectedKeys, setSelectedKeys] = useState<StarLevelKey[]>([]);
  const [digitCount, setDigitCount] = useState<4 | 6>(4);
  const [generatedNumbers, setGeneratedNumbers] = useState<string[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const { currentLanguage } = useLanguage();
  const et = getEnergyTranslations(currentLanguage);
  const t = getTranslations(currentLanguage);
  const LEVEL_LABELS = [et.level1, et.level2, et.level3, et.level4];
  const translateStar = (name: string) => t.starNames?.[name] || name;

  const toggleLevel = (starName: string, level: number) => {
    const key = makeKey(starName, level);
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleStar = (starName: string) => {
    const allKeys = [1, 2, 3, 4].map(l => makeKey(starName, l));
    const allSelected = allKeys.every(k => selectedKeys.includes(k));
    setSelectedKeys(prev =>
      allSelected
        ? prev.filter(k => !allKeys.includes(k))
        : [...new Set([...prev, ...allKeys])]
    );
  };

  const isStarFullySelected = (starName: string) =>
    [1, 2, 3, 4].every(l => selectedKeys.includes(makeKey(starName, l)));

  const isStarPartiallySelected = (starName: string) =>
    [1, 2, 3, 4].some(l => selectedKeys.includes(makeKey(starName, l))) && !isStarFullySelected(starName);

  const handleGenerate = () => {
    if (selectedKeys.length === 0) return;
    const nums = generateAllNumbers(selectedKeys, 500, digitCount);
    setGeneratedNumbers(nums);
    setHasGenerated(true);
    setCurrentPage(0);
  };

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num).then(() => {
      toast({ title: et.copied, description: et.copiedDesc.replace('{num}', num) });
    });
  };

  const totalPages = Math.ceil(generatedNumbers.length / PAGE_SIZE);
  const pagedNumbers = generatedNumbers.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const analyzedResults = useMemo(() => {
    return pagedNumbers.map(num => {
      try {
        return { num, results: analyzeNumberEnhanced(num, currentLanguage) };
      } catch {
        return { num, results: null };
      }
    });
  }, [pagedNumbers, currentLanguage]);

  const luckyStars = STAR_DEFINITIONS.filter(s => s.type === 'lucky');
  const unluckyStars = STAR_DEFINITIONS.filter(s => s.type === 'unlucky');

  const renderStarGroup = (stars: typeof STAR_DEFINITIONS, label: string, dotColor: string) => (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          {label}
        </h3>
        <div className="space-y-2">
          {stars.map(star => {
            const fully = isStarFullySelected(star.name);
            const partial = isStarPartiallySelected(star.name);
            return (
              <div key={star.name} className="space-y-1">
                <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                  fully ? 'border-primary bg-primary/10' : partial ? 'border-primary/50 bg-primary/5' : 'border-border hover:bg-muted/50'
                }`}>
                  <Checkbox
                    checked={fully}
                    // @ts-ignore
                    indeterminate={partial}
                    onCheckedChange={() => toggleStar(star.name)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{translateStar(star.name)}</p>
                      <p className="text-xs text-muted-foreground">{et.starDescriptions?.[star.description] || star.description}</p>
                    </div>
                  </div>
                </label>
                {/* Level checkboxes */}
                <div className="grid grid-cols-2 gap-1 pl-6">
                  {([1, 2, 3, 4] as const).map(level => {
                    const key = makeKey(star.name, level);
                    const selected = selectedKeys.includes(key);
                    const pairs = star.levels[level].join('/');
                    return (
                      <label
                        key={level}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer border transition-colors ${
                          selected ? 'border-primary bg-primary/10 font-medium' : 'border-border/50 hover:bg-muted/30'
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleLevel(star.name, level)}
                          className="h-3 w-3"
                        />
                        <span>{LEVEL_LABELS[level - 1]}</span>
                        <span className="text-muted-foreground font-mono">{pairs}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 mx-3 mb-20">
      {renderStarGroup(luckyStars, et.luckyStars, 'bg-green-500')}
      {renderStarGroup(unluckyStars, et.unluckyStars, 'bg-red-500')}

      {/* Digit count selection */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{et.digitCount}</span>
        <div className="flex gap-2">
          {([4, 6] as const).map(count => (
            <Button key={count} variant={digitCount === count ? 'default' : 'outline'} size="sm" onClick={() => setDigitCount(count)}>
              {count}{et.digits}
            </Button>
          ))}
        </div>
      </div>

      <Button onClick={handleGenerate} className="w-full" disabled={selectedKeys.length === 0}>
        {hasGenerated ? et.regenerate : et.generate}
      </Button>

      {/* Results */}
      {hasGenerated && generatedNumbers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{et.totalResults.replace('{count}', String(generatedNumbers.length))}</h3>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground">{currentPage + 1}/{totalPages}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {analyzedResults.map(({ num, results }, i) => (
            <Collapsible key={`${num}-${i}`}>
              <Card>
                <CardContent className="p-0">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-mono font-bold tracking-widest">{num}</span>
                        {results && (
                          <span className="text-xs text-muted-foreground">{results.stats.dominantField}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {results && (
                          <div className="flex gap-1 mr-2">
                            {results.combinations.slice(0, 3).map((c, ci) => (
                              <Badge
                                key={ci}
                                variant={c.type === 'lucky' ? 'outline' : 'destructive'}
                                className={`text-[10px] px-1 py-0 ${c.type === 'lucky' ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400' : ''}`}
                              >
                                {c.name.replace(/\d+$/, '')}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); copyNumber(num); }}>
                          <Copy className="w-3 h-3" />
                        </Button>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t border-border p-3">
                      {results && (
                        <ResultsSection
                          numberGenerator={true}
                          results={results}
                          currentLanguage={currentLanguage}
                          onCopyResults={() => {
                            let text = `${et.energyAnalysis}：${results.displayNumber}\n`;
                            text += `${et.dominantFieldLabel}：${results.stats.dominantField}\n`;
                            results.combinations.forEach(c => {
                              text += `[${c.digits}] ${c.name} - ${c.score}\n`;
                            });
                            navigator.clipboard.writeText(text).then(() => {
                              toast({ title: et.copied, description: et.resultsCopied });
                            });
                          }}
                        />
                      )}
                    </div>
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
          ))}

          {/* Bottom pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> {et.prevPage}
              </Button>
              <span className="text-sm text-muted-foreground">{currentPage + 1} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>
                {et.nextPage} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {hasGenerated && generatedNumbers.length === 0 && (
        <p className="text-sm text-center text-muted-foreground py-4">{et.noResults}</p>
      )}
    </div>
  );
}
