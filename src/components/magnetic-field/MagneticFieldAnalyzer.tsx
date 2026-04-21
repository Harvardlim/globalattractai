import React, { useState } from 'react';
import { getTranslations } from '@/data/translations';
import { getEnergyTranslations } from '@/data/energyTranslations';
import { useNumberAnalysis } from '@/hooks/useNumberAnalysis';
import { InputSection } from './InputSection';
import { useLanguage } from '@/hooks/useLanguage';
import { ResultsSection } from './ResultsSection';
import { AnalysisResults } from '@/types/index';
import { Client } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Check, BookmarkPlus } from 'lucide-react';
import ClientSearchSelect from '@/components/ClientSearchSelect';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface MagneticFieldAnalyzerProps {
  onAnalysisComplete?: (inputNumber: string, results: AnalysisResults, title?: string, clientId?: string) => void;
  clients?: Client[];
  initialInput?: string;
  initialResults?: AnalysisResults;
}

export function MagneticFieldAnalyzer({ onAnalysisComplete, clients = [], initialInput, initialResults }: MagneticFieldAnalyzerProps) {
  const { currentLanguage, setLanguage } = useLanguage();
  const { 
    inputNumber, 
    setInputNumber, 
    inputError,
    results, 
    setResults,
    handleAnalyzeNumber, 
    clearInput, 
    copyResults 
  } = useNumberAnalysis();

  const [initialized, setInitialized] = React.useState(false);
  React.useEffect(() => {
    if (!initialized && initialInput && initialResults) {
      setInputNumber(initialInput);
      setResults(initialResults);
      setInitialized(true);
    }
  }, [initialized, initialInput, initialResults]);

  const t = getTranslations(currentLanguage);
  const et = getEnergyTranslations(currentLanguage);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const onAnalyze = () => {
    handleAnalyzeNumber(currentLanguage);
    setSaved(false);
    setSaveTitle('');
    setSelectedClient(null);
  };
  const onCopyResults = () => copyResults(currentLanguage);

  const handleSave = async () => {
    if (!results || !onAnalysisComplete || saving) return;
    setSaving(true);
    const title = saveTitle.trim() || selectedClient?.name || undefined;
    await onAnalysisComplete(inputNumber, results, title, selectedClient?.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSheetOpen(false), 600);
  };

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    if (client && !saveTitle.trim()) {
      setSaveTitle(client.name);
    }
  };

  const openSaveSheet = () => {
    setSaved(false);
    setSaveTitle('');
    setSelectedClient(null);
    setSheetOpen(true);
  };

  return (
    <div>
      <div className="space-y-4">
        <InputSection
          inputNumber={inputNumber}
          onInputChange={setInputNumber}
          onSubmit={onAnalyze}
          onClear={clearInput}
          inputPlaceholder={t.inputPlaceholder}
          submitButton={t.submitButton}
          error={inputError}
          inputLabel={et.inputLabel}
        />

        {results && (
          <ResultsSection 
            results={results}
            currentLanguage={currentLanguage}
            onCopyResults={onCopyResults}
          />
        )}
      </div>

      {/* Floating save button */}
      {results && onAnalysisComplete && (
        <Button
          onClick={openSaveSheet}
          size="icon"
          className="fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full shadow-lg"
        >
          <BookmarkPlus className="h-5 w-5" />
        </Button>
      )}

      {/* Save sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{et.saveTitle}</SheetTitle>
            <SheetDescription>{et.saveDesc}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 pt-4">
            <Input
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder={et.notePlaceholder}
              disabled={saving || saved}
            />
            {clients.length > 0 && (
              <ClientSearchSelect
                clients={clients}
                selectedClient={selectedClient}
                onSelect={handleClientSelect}
                placeholder={et.clientPlaceholder}
              />
            )}
            <Button
              className="w-full gap-2"
              variant={saved ? "secondary" : "default"}
              onClick={handleSave}
              disabled={saving || saved}
            >
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? et.saving : saved ? et.saved : et.save}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
