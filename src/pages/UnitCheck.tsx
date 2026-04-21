import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Building2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/contexts/AuthContext';
import { useFeaturePackages } from '@/hooks/useFeaturePackages';
import { analyzeNumberEnhanced } from '@/utils/enhancedAnalysisUtils';
import { convertAlphabetsToNumbers } from '@/utils/alphabetConverter';
import { DetailedCombinationsCard } from '@/components/magnetic-field/ResultsDisplay/DetailedCombinationsCard';
import { DominantFieldCard } from '@/components/magnetic-field/ResultsDisplay/DominantFieldCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTranslations } from '@/data/translations';
import { AnalysisResults } from '@/types/index';

export default function UnitCheck() {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { isOwner, isSuperAdmin } = useAuth();
  const { hasFeature, loading: pkgLoading } = useFeaturePackages();
  const t = getTranslations(currentLanguage);

  const [inputNumber, setInputNumber] = useState('');
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);

  // Access control — must be after all hooks
  const canAccess = isOwner || isSuperAdmin || hasFeature('real_estate');
  if (!pkgLoading && !canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAnalyze = () => {
    setError('');
    if (!inputNumber.trim()) {
      setError(currentLanguage === 'zh' ? '请输入门牌号' : 'Please enter a unit number');
      return;
    }
    try {
      const converted = convertAlphabetsToNumbers(inputNumber);
      const analysisResults = analyzeNumberEnhanced(converted, currentLanguage);
      setResults(analysisResults);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    }
  };

  const handleCopy = () => {
    if (!results) return;
    let text = `门牌号分析：${results.displayNumber}\n\n`;
    results.combinations.forEach(combo => {
      text += `[${combo.digits}] ${combo.name} - ${combo.score}分\n`;
    });
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Building2 className="h-5 w-5 text-primary" />
        <h1 className="font-semibold text-lg">
          {currentLanguage === 'zh' ? '查单位' : 'Unit Check'}
        </h1>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          {currentLanguage === 'zh' ? '输入门牌号码，查看吉星磁场分析' : 'Enter unit/door number to view lucky star analysis'}
        </p>

        <div className="flex gap-2">
          <Input
            value={inputNumber}
            onChange={(e) => { setInputNumber(e.target.value); setError(''); }}
            placeholder={currentLanguage === 'zh' ? '输入门牌号...' : 'Enter unit number...'}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            className="flex-1"
          />
          <Button onClick={handleAnalyze} className="gap-2">
            <Search className="h-4 w-4" />
            {currentLanguage === 'zh' ? '分析' : 'Analyze'}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}

        {results && results.combinations.length > 0 && (
          <div className="space-y-4">
            <DominantFieldCard
              results={results}
              currentLanguage={currentLanguage}
              translations={t}
              onCopyResults={handleCopy}
            />
            <Collapsible open={detailOpen} onOpenChange={setDetailOpen}>
              <div className="bg-card rounded-lg border border-border">
                <CollapsibleTrigger className="w-full flex items-center justify-between p-4">
                  <span className="text-sm font-medium">{t.detailedAnalysis}</span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", detailOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <DetailedCombinationsCard
                    combinations={results.combinations}
                    currentLanguage={currentLanguage}
                    translations={t}
                    displayNumber={results.displayNumber}
                  />
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        )}

        {results && results.combinations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>{currentLanguage === 'zh' ? '此门牌号没有磁场组合' : 'No field combinations found for this unit number'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
