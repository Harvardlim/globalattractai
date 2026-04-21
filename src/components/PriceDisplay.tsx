import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  sellingPrice?: number | null;
  currency: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceDisplay({ price, sellingPrice, currency, size = 'md', className }: PriceDisplayProps) {
  const hasDiscount = sellingPrice != null && sellingPrice < price;
  const effectivePrice = hasDiscount ? sellingPrice : price;
  const discount = hasDiscount ? Math.round((1 - sellingPrice / price) * 100) : 0;

  const sizeClasses = {
    sm: { price: 'text-sm', ori: 'text-[10px]', badge: 'text-[9px] px-1 py-0' },
    md: { price: 'text-sm', ori: 'text-xs', badge: 'text-[10px] px-1.5 py-0.5' },
    lg: { price: 'text-2xl', ori: 'text-sm', badge: 'text-xs px-1.5 py-0.5' },
  };

  const s = sizeClasses[size];

  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      <span className={cn('font-bold text-primary', s.price)}>
        {currency} {Number(effectivePrice).toFixed(2)}
      </span>
      {hasDiscount && (
        <>
          <span className={cn('line-through text-muted-foreground', s.ori)}>
            {currency} {Number(price).toFixed(2)}
          </span>
          <span className={cn('bg-destructive/10 text-destructive font-semibold rounded', s.badge)}>
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
}
