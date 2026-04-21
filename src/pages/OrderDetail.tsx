import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Loader2, User, Phone, Mail, MapPin, Truck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { UserMenu } from '@/components/UserMenu';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { ORDER_STATUS_MAP } from '@/lib/constants';
import { formatSelectedOptions, hasSelectedOptions } from '@/utils/optionsDisplay';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline', class: string }> = ORDER_STATUS_MAP

function parseShippingNotes(notes: string | null) {
  if (!notes) return null;
  const lines = notes.split('\n');
  const info: Record<string, string> = {};
  
  // First line is name
  info.name = lines[0] || '';
  
  // Extract labeled fields
  const addressParts: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('Email: ')) {
      info.email = line.replace('Email: ', '');
    } else if (line.startsWith('Phone: ')) {
      info.phone = line.replace('Phone: ', '');
    } else if (line.startsWith('Shipping: ')) {
      info.shipping = line.replace('Shipping: ', '');
    } else if (line.startsWith('Remarks: ')) {
      info.remarks = line.replace('Remarks: ', '');
    } else {
      addressParts.push(line);
    }
  }
  info.address = addressParts.join('\n');
  
  return info;
}

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { orders, isLoading } = useOrders(true);
  const [updating, setUpdating] = useState(false);

  const order = orders.find(o => o.id === id);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
      if (error) throw error;
      toast({ title: '订单状态已更新' });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err: any) {
      toast({ title: '更新失败', description: err.message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

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
        <Button variant="outline" onClick={() => navigate('/admin')}>返回管理后台</Button>
      </div>
    );
  }

  const shippingInfo = parseShippingNotes(order.notes);
  const statusConfig = STATUS_MAP[order.status] || STATUS_MAP.pending;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 max-w-2xl">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold flex-1">订单详情</h1>            
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        {/* Order Header */}
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

        {/* Status Update */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium">更新状态</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Select value={order.status} onValueChange={handleStatusChange} disabled={updating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="processing">处理中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
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
            <CardContent className="px-4 pb-4 space-y-3">
              {shippingInfo.name && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-sm">{shippingInfo.name}</span>
                </div>
              )}
              {shippingInfo.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-sm">{shippingInfo.phone}</span>
                </div>
              )}
              {shippingInfo.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-sm">{shippingInfo.email}</span>
                </div>
              )}
              {shippingInfo.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-sm whitespace-pre-line">{shippingInfo.address}</span>
                </div>
              )}
              {shippingInfo.shipping && (
                <div className="flex items-start gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{shippingInfo.shipping}</span>
                </div>
              )}
              {shippingInfo.remarks && (
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">备注</p>
                    <p className="text-sm">{shippingInfo.remarks}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
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

        {/* Raw Notes Fallback */}
        {!shippingInfo && order.notes && (
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium">备注</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-sm whitespace-pre-line text-muted-foreground">{order.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
