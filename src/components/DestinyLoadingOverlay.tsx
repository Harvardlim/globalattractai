import React, { useEffect, useState, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { getLoadingOverlayTranslations } from "@/data/destinyTranslations";

interface DestinyLoadingOverlayProps {
  isOpen: boolean;
  duration?: number;
  onComplete: () => void;
}

const DestinyLoadingOverlay: React.FC<DestinyLoadingOverlayProps> = ({
  isOpen,
  duration = 5000,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const { currentLanguage } = useLanguage();
  const t = useMemo(() => getLoadingOverlayTranslations(currentLanguage), [currentLanguage]);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.setAttribute('data-destiny-loading', 'true');
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.removeAttribute('data-destiny-loading');
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.removeAttribute('data-destiny-loading');
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setMessageIndex(0);
      return;
    }

    const startTime = Date.now();
    const messageInterval = duration / t.messages.length;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      const newMessageIndex = Math.min(
        Math.floor(elapsed / messageInterval),
        t.messages.length - 1
      );
      setMessageIndex(newMessageIndex);

      if (elapsed >= duration) {
        clearInterval(progressInterval);
        onComplete();
      }
    }, 16);

    return () => clearInterval(progressInterval);
  }, [isOpen, duration, onComplete, t.messages.length]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
      onTouchMove={(e) => e.preventDefault()}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10">
          <div className="w-full h-full rounded-full border border-primary/30 animate-ping" style={{ animationDuration: '3s' }} />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-20">
          <div className="w-full h-full rounded-full border border-primary/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] opacity-30">
          <div className="w-full h-full rounded-full border border-primary/50 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '1s' }} />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-sm w-full">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" style={{ animationDuration: '1s' }} />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">{t.title}</h2>
          <p className={cn("text-muted-foreground text-sm transition-all duration-300")}>
            {t.messages[messageIndex]}
          </p>
        </div>

        <div className="w-full space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default DestinyLoadingOverlay;
