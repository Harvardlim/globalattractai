import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lock, Crown, Sparkles, Check, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MagneticFieldAnalyzer } from "@/components/magnetic-field/MagneticFieldAnalyzer";
import { NumberGenerator } from "@/components/magnetic-field/NumberGenerator";
import { HexagramCalculator } from "@/components/magnetic-field/HexagramCalculator";
import { useMemberPermissions } from "@/hooks/useMemberPermissions";
import { useEnergyAnalyses } from "@/hooks/useEnergyAnalyses";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { getEnergyTranslations } from "@/data/energyTranslations";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { AnalysisResults } from "@/types/index";

const NumberGeneratorLocked: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const t = getEnergyTranslations(currentLanguage);

  return (
    <div className="relative mx-3 space-y-4">
      <div className="blur-sm pointer-events-none select-none max-h-72 overflow-hidden" aria-hidden="true">
        <NumberGenerator />
      </div>
      <div className="absolute inset-0 flex flex-col items-center pt-8 bg-background/60 backdrop-blur-[2px] rounded-lg">
        <Card className="max-w-sm w-full border-2 border-primary/30 shadow-lg">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">{t.lockedTitle}</h3>
            </div>
            <p className="text-sm text-muted-foreground text-center">{t.lockedDesc}</p>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {t.lockedFeature1}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {t.lockedFeature2}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {t.lockedFeature3}
                </li>
              </ul>
            </div>
            <Button
              className="w-full gap-2 bg-amber-500 hover:bg-amber-600"
              onClick={() => navigate('/pricing')}
            >
              <Crown className="h-4 w-4" />
              {t.upgradeVip}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Energy: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("analyze");
  const { canAccess } = useMemberPermissions();
  const { isSuperAdmin } = useAuth();
  const showHexagram = true; // All features enabled
  const { saveAnalysis, history, fetchHistory } = useEnergyAnalyses();
  const { clients } = useClients();
  const { toast } = useToast();
  const { currentLanguage } = useLanguage();
  const t = getEnergyTranslations(currentLanguage);

  const analysisId = searchParams.get('analysisId');
  const [initialInput, setInitialInput] = useState<string | undefined>();
  const [initialResults, setInitialResults] = useState<AnalysisResults | undefined>();

  useEffect(() => {
    if (!analysisId) return;
    const found = history.find(h => h.id === analysisId);
    if (found) {
      setInitialInput(found.input_number);
      setInitialResults(found.analysis_data as AnalysisResults);
    } else {
      fetchHistory().then(() => {});
    }
  }, [analysisId, history.length]);

  const handleAnalysisComplete = useCallback(async (inputNumber: string, results: AnalysisResults, title?: string, clientId?: string) => {
    const id = await saveAnalysis(inputNumber, results, title, clientId);
    if (id) {
      toast({ title: t.analysisSaved });
    }
  }, [saveAnalysis, toast, t.analysisSaved]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4 py-3 max-w-7xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold flex-1">{t.title}</h1>
            <Button variant="outline" size="sm" onClick={() => navigate("/energy/history")}>
              <History className="h-4 w-4 mr-3" />
              {t.history}
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-2 sm:px-4 pb-3 max-w-7xl">
          <Tabs defaultValue="analyze" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`w-full grid ${showHexagram ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="analyze">{t.analyzeTab}</TabsTrigger>
              <TabsTrigger value="generate">{t.generateTab}</TabsTrigger>
              {showHexagram && <TabsTrigger value="hexagram">{currentLanguage === 'zh' ? '解卦' : currentLanguage === 'en' ? 'Hexagram' : 'Heksagram'}</TabsTrigger>}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl mb-0">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="analyze" className="mt-0">
            <MagneticFieldAnalyzer onAnalysisComplete={handleAnalysisComplete} clients={clients} initialInput={initialInput} initialResults={initialResults} />
          </TabsContent>
          <TabsContent value="generate">
            {canAccess('number_generator') ? (
              <NumberGenerator />
            ) : (
              <NumberGeneratorLocked />
            )}
          </TabsContent>
          {showHexagram && (
            <TabsContent value="hexagram" className="mt-0">
              {canAccess('hexagram') ? (
                <HexagramCalculator />
              ) : (
                <NumberGeneratorLocked />
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Energy;
