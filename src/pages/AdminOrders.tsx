import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminOrders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { orders, isLoading } = useOrders(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[]; label: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const parseNamePhone = (notes: string | null) => {
    if (!notes) return { name: '', phone: '' };
    const lines = notes.split('\n');
    const name = lines[0] || '';
    const phoneLine = lines.find(l => l.startsWith('Phone: '));
    const phone = phoneLine ? phoneLine.replace('Phone: ', '') : '';
    return { name, phone };
  };

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allPageSelected = paginatedOrders.length > 0 && paginatedOrders.every(o => selectedIds.has(o.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        paginatedOrders.forEach(o => next.delete(o.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        paginatedOrders.forEach(o => next.add(o.id));
        return next;
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // Delete order_items first, then orders
      for (const id of deleteTarget.ids) {
        const { error: itemsErr } = await supabase.from('order_items').delete().eq('order_id', id);
        if (itemsErr) throw itemsErr;
        const { error: orderErr } = await supabase.from('orders').delete().eq('id', id);
        if (orderErr) throw orderErr;
      }
      toast({ title: `已删除 ${deleteTarget.ids.length} 条订单` });
      setSelectedIds(prev => {
        const next = new Set(prev);
        deleteTarget.ids.forEach(id => next.delete(id));
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err: any) {
      toast({ title: '删除失败', description: err.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold flex-1">订单管理</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-10">加载中...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">暂无订单</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { value: 'all', label: '全部' },
                { value: 'pending', label: '待处理' },
                { value: 'processing', label: '处理中' },
                { value: 'completed', label: '已完成' },
                { value: 'cancelled', label: '已取消' },
              ].map(s => (
                <Button
                  key={s.value}
                  variant={statusFilter === s.value ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => { setStatusFilter(s.value); setCurrentPage(1); }}
                >
                  {s.label}
                  {s.value === 'all'
                    ? ` (${orders.length})`
                    : ` (${orders.filter(o => o.status === s.value).length})`}
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Checkbox checked={allPageSelected} onCheckedChange={toggleSelectAll} />
                <span className="text-xs text-muted-foreground">共 {filteredOrders.length} 条</span>
                {selectedIds.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setDeleteTarget({ ids: Array.from(selectedIds), label: `${selectedIds.size} 条订单` })}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> 删除 ({selectedIds.size})
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">每页</span>
                <select
                  className="text-xs border border-border rounded px-1.5 py-1 bg-background"
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-xs text-muted-foreground">条</span>
              </div>
            </div>

            <div className="space-y-3">
              {paginatedOrders.map(order => {
                const { name, phone } = parseNamePhone(order.notes);
                return (
                  <Card key={order.id} className="border-border/50 hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5" onClick={e => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(order.id)}
                            onCheckedChange={() => toggleSelect(order.id)}
                          />
                        </div>
                        <div className="flex-1 cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</span>
                            <div className="flex items-center gap-1.5">
                              <select
                                className="text-[10px] border border-border rounded px-1.5 py-0.5 bg-background"
                                value={order.status}
                                onClick={e => e.stopPropagation()}
                                onChange={async (e) => {
                                  try {
                                    const { error } = await supabase.from('orders').update({ status: e.target.value }).eq('id', order.id);
                                    if (error) throw error;
                                    toast({ title: '订单状态已更新' });
                                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                                  } catch (err: any) {
                                    toast({ title: '更新失败', description: err.message, variant: 'destructive' });
                                  }
                                }}
                              >
                                <option value="pending">待处理</option>
                                <option value="processing">处理中</option>
                                <option value="completed">已完成</option>
                                <option value="cancelled">已取消</option>
                              </select>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={e => {
                                  e.stopPropagation();
                                  setDeleteTarget({ ids: [order.id], label: `订单 #${order.id.slice(0, 8)}` });
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {(name || phone) && (
                            <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground">
                              {name && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" /> {name}
                                </span>
                              )}
                              {phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {phone}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="space-y-1">
                            {order.order_items?.map((item: any) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.product_name} x{item.quantity}</span>
                                <span>{order.currency} {(item.unit_price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between mt-2 pt-2 border-t border-border/50">
                            <span className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('zh-CN')}
                            </span>
                            <span className="font-bold text-sm">
                              {order.currency} {Number(order.total_amount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-xs mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 {deleteTarget?.label} 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
