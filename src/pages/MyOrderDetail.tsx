import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Loader2, Truck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserMenu } from '@/components/UserMenu';
import { useOrders } from '@/hooks/useOrders';
import { ORDER_STATUS_MAP } from '@/lib/constants';
import { formatSelectedOptions, hasSelectedOptions } from '@/utils/optionsDisplay';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline', class: string }> = ORDER_STATUS_MAP

function parseShippingNotes(notes: string | null) {
  if (!notes) return null;
  const lines = notes.split('\n');
  const info: Record<string, string> = {};
  info.name = lines[0] || '';
  const addressParts: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('Email: ')) info.email = line.replace('Email: ', '');
    else if (line.startsWith('Phone: ')) info.phone = line.replace('Phone: ', '');
    else if (line.startsWith('Shipping: ')) info.shipping = line.replace('Shipping: ', '');
    else if (line.startsWith('Remarks: ')) info.remarks = line.replace('Remarks: ', '');
    else addressParts.push(line);
  }
  info.address = addressParts.join('\n');
  return info;
}

export default function MyOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { orders, isLoading } = useOrders();
  const order = orders.find(o => o.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">订单不存在</p>
        <Button variant="outline" onClick={() => navigate('/orders')}>返回订单列表</Button>
      </div>
    );
  }

  const statusConfig = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const shippingInfo = parseShippingNotes(order.notes);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 max-w-lg">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/orders')} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold flex-1">订单详情</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg space-y-4">
        {/* Status & Basic Info */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">订单编号</p>
                <p className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <Badge variant={statusConfig.variant} className={statusConfig.class}>{statusConfig.label}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">下单时间</p>
                <p className="text-sm">{new Date(order.created_at).toLocaleString('zh-CN')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">订单总额</p>
                <p className="text-lg font-bold text-primary">{order.currency} {Number(order.total_amount).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Info */}
        {shippingInfo && (
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Truck className="h-4 w-4" /> 配送信息
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {shippingInfo.name && (
                <p className="text-sm font-medium">{shippingInfo.name}</p>
              )}
              {shippingInfo.phone && (
                <p className="text-sm text-muted-foreground">{shippingInfo.phone}</p>
              )}
              {shippingInfo.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm whitespace-pre-line">{shippingInfo.address}</p>
                </div>
              )}
              {shippingInfo.shipping && (
                <p className="text-xs text-muted-foreground">运费: {shippingInfo.shipping}</p>
              )}
              {shippingInfo.remarks && (
                <p className="text-xs text-muted-foreground">备注: {shippingInfo.remarks}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Items */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" /> 商品明细
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-3">
              {order.order_items?.map((item: any) => {
                const opts = item.selected_options;
                const hasOpts = hasSelectedOptions(opts);
                return (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{item.product_name}</p>
                    {hasOpts && (
                      <p className="text-[11px] text-muted-foreground">
                        {formatSelectedOptions(opts)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">x{item.quantity} · 单价 {order.currency} {Number(item.unit_price).toFixed(2)}</p>
                  </div>
                  <span className="text-sm font-medium">
                    {order.currency} {(item.unit_price * item.quantity).toFixed(2)}
                  </span>
                </div>
                );
              })}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-bold">
              <span>总计</span>
              <span>{order.currency} {Number(order.total_amount).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
