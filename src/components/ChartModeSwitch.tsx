import React from 'react';
import { cn } from '@/lib/utils';
import { ChartMode } from '@/types/database';

interface ChartModeSwitchProps {
  mode: ChartMode;
  onChange: (mode: ChartMode) => void;
}

const ChartModeSwitch: React.FC<ChartModeSwitchProps> = ({ mode, onChange }) => {
  return (
    <div className="flex rounded-lg bg-muted p-1">
      <button
        className={cn(
          'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
          mode === '实时盘'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => onChange('实时盘')}
      >
        实时盘
      </button>
      <button
        className={cn(
          'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
          mode === '命理盘'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => onChange('命理盘')}
      >
        命理盘
      </button>
      <button
        className={cn(
          'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
          mode === 'Chat'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => onChange('Chat')}
      >
        Chat
      </button>
    </div>
  );
};

export default ChartModeSwitch;
