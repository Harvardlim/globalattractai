import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserMenu } from '@/components/UserMenu';
import { useOrders } from '@/hooks/useOrders';
import { Loader2 } from 'lucide-react';
import { ORDER_STATUS_MAP } from '@/lib/constants';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; class: string }> = ORDER_STATUS_MAP

export default function MyOrders() {
  const navigate = useNavigate();
  const { orders, isLoading } = useOrders();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 max-w-lg">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold flex-1">我的订单</h1>           
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground">暂无订单</p>
            <Button variant="outline" onClick={() => navigate('/store')}>去逛逛</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
              return (
                <Card
                  key={order.id}
                  className="border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</span>
                      <Badge variant={status.variant} className={status.class}>{status.label}</Badge>
                    </div>
                    <div className="space-y-1">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="line-clamp-1 flex-1">{item.product_name} x{item.quantity}</span>
                          <span className="text-muted-foreground shrink-0 ml-2">
                            {order.currency} {(item.unit_price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/30">
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('zh-CN')}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm">
                          {order.currency} {Number(order.total_amount).toFixed(2)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
