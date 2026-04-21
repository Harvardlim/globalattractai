import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InputSectionProps {
  inputNumber: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  inputPlaceholder: string;
  submitButton: string;
  error?: string;
  inputLabel?: string;
}

export function InputSection({
  inputNumber,
  onInputChange,
  onSubmit,
  onClear,
  inputPlaceholder,
  submitButton,
  error,
  inputLabel = '输入号码'
}: InputSectionProps) {
  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">{inputLabel}</label>
          <div className="relative">
            <Input
              type="text"
              value={inputNumber}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={inputPlaceholder}
              onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
              className={error ? 'border-destructive' : ''}
            />
            {inputNumber && (
              <button
                onClick={onClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
          </div>
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
        <Button 
          onClick={onSubmit}
          className="w-full"
        >
          {submitButton}
        </Button>
      </div>
    </div>
  );
}
