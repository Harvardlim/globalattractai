import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LockedContentProps {
  children: React.ReactNode;
  isLocked: boolean;
  requiredTier?: string;
  className?: string;
}

const LockedContent: React.FC<LockedContentProps> = ({
  children,
  isLocked,
  requiredTier = '订阅会员',
  className,
}) => {
  const navigate = useNavigate();

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative max-h-72 overflow-hidden rounded-lg", className)}>
      {/* Blurred content - limited height */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>
      
      {/* Overlay with upgrade prompt - positioned at top */}
      <div className="absolute inset-0 flex flex-col items-center pt-6 bg-background/60 backdrop-blur-[2px] rounded-lg">
        <div className="flex flex-col gap-3 px-4 py-3 rounded-xl bg-background/90 border shadow-sm max-w-xs">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-600" />
            <div className='flex flex-col gap-1'>
              <p className="font-medium text-sm">解说</p>
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            <p className="font-medium text-sm">八字全景解说、奇门遁甲精析、六爻精准占卜等深度内容，现为{requiredTier}专属权益。</p>
            <p className="font-medium text-sm">解锁完整智慧，洞见未来玄机。</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              size="sm"
              className="gap-1.5 h-8 w-full bg-amber-500 hover:bg-amber-600"
              onClick={() => navigate('/pricing')}
            >
              <Crown className="h-3.5 w-3.5" />
              升级会员
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockedContent;
