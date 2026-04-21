import React, { useState } from 'react';
import { Lock, Crown, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface UnlockReadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  onUnlock: () => Promise<boolean>;
  unlockPrice?: number;
}

const UnlockReadingDialog: React.FC<UnlockReadingDialogProps> = ({
  open,
  onOpenChange,
  clientName,
  onUnlock,
  unlockPrice = 19.90,
}) => {
  const navigate = useNavigate();
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = async () => {
    setUnlocking(true);
    const success = await onUnlock();
    setUnlocking(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            解锁命盘分析
          </DialogTitle>
          <DialogDescription>
            解锁 <span className="font-medium text-foreground">{clientName}</span> 的完整命盘分析
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* One-time payment option */}
          <div className="rounded-lg border-2 border-primary/50 bg-primary/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">单次解锁</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">RM {unlockPrice.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">一次性付费</div>
              </div>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground mb-3">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-500" />
                永久解锁此客户命盘
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-500" />
                八字解说 · 奇门解说 · 六爻分析
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-500" />
                大运流年 · 格局分析
              </li>
            </ul>
            <Button
              className="w-full"
              onClick={handleUnlock}
              disabled={unlocking}
            >
              {unlocking ? '处理中...' : `立即解锁 RM ${unlockPrice.toFixed(2)}`}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">或</span>
            </div>
          </div>

          {/* Upgrade option */}
          <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <span className="font-semibold">升级会员</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              升级至订阅会员可无限解锁所有客户命盘，享受更多专属功能
            </p>
            <Button
              variant="outline"
              className="w-full border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/30"
              onClick={() => {
                onOpenChange(false);
                navigate('/pricing');
              }}
            >
              <Crown className="h-4 w-4 mr-2 text-amber-500" />
              查看会员方案
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnlockReadingDialog;
