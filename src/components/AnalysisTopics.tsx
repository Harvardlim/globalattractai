import React from "react";
import { ANALYSIS_TOPICS } from "@/types/database";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface AnalysisTopicsProps {
  selectedTopic: string | null;
  onSelectTopic: (topic: string) => void;
  disabled?: boolean;
  variant?: 'grid' | 'list';
}

const AnalysisTopics: React.FC<AnalysisTopicsProps> = ({ 
  selectedTopic, 
  onSelectTopic, 
  disabled,
  variant = 'grid'
}) => {
  if (variant === 'list') {
    return (
      <div className="divide-y divide-border">
        {ANALYSIS_TOPICS.map((topic) => (
          <button
            key={topic.value}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors",
              "hover:bg-muted/50 active:bg-muted",
              selectedTopic === topic.value && "bg-primary/5",
              disabled && "opacity-50 pointer-events-none"
            )}
            onClick={() => onSelectTopic(topic.value)}
            disabled={disabled}
          >
            <span className="text-xl flex-shrink-0">{topic.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{topic.label}</div>
              <div className="text-xs text-muted-foreground truncate">{topic.description}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">专项分析</h4>
      <div className="flex flex-wrap gap-2">
        {ANALYSIS_TOPICS.slice(0, 5).map((topic) => (
          <button
            key={topic.value}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors",
              "border border-border hover:bg-muted/50",
              selectedTopic === topic.value && "bg-primary text-primary-foreground border-primary",
              disabled && "opacity-50 pointer-events-none"
            )}
            onClick={() => onSelectTopic(topic.value)}
            disabled={disabled}
          >
            <span className="text-base">{topic.icon}</span>
            <span>{topic.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnalysisTopics;