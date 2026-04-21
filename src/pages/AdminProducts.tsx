import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Package, Tags, X, Edit, Trash2, ChevronLeft, ChevronRight, Ticket, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useProducts } from '@/hooks/useProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useCoupons, Coupon } from '@/hooks/useCoupons';

import { SkuInventoryTable } from '@/components/SkuInventoryTable';
import { useToast } from '@/hooks/use-toast';

export default function AdminProducts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { products, isLoading, deleteProduct } = useProducts(true);
  const { categories, addCategory, deleteCategory } = useProductCategories();
  const { coupons, createCoupon, deleteCoupon, updateCoupon } = useCoupons();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'product' | 'category' | 'coupon'; id: string; name: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Coupon form
  const [couponForm, setCouponForm] = useState({ code: '', discount_type: 'percentage' as 'percentage' | 'fixed', discount_value: '', min_order_amount: '0', max_uses: '', expires_at: '' });
  const [showCouponForm, setShowCouponForm] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'product') {
        await deleteProduct.mutateAsync(deleteTarget.id);
        toast({ title: '商品已删除' });
      } else if (deleteTarget.type === 'category') {
        await deleteCategory.mutateAsync(deleteTarget.id);
        toast({ title: '分类已删除' });
      } else {
        await deleteCoupon.mutateAsync(deleteTarget.id);
        toast({ title: '优惠券已删除' });
      }
    } catch (err: any) {
      toast({ title: '删除失败', description: err.message, variant: 'destructive' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const totalPages = Math.ceil(products.length / pageSize);
  const paginatedProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold flex-1">商品管理</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="products">
          <TabsList className="w-full">
            <TabsTrigger value="products" className="flex-1">
              <Package className="h-4 w-4 mr-1" /> 商品
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex-1">
              <BarChart3 className="h-4 w-4 mr-1" /> 库存
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex-1">
              <Ticket className="h-4 w-4 mr-1" /> 优惠券
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex-1">
              <Tags className="h-4 w-4 mr-1" /> 分类
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">共 {products.length} 件</span>
                <span className="text-xs text-muted-foreground">· 每页</span>
                <select
                  className="text-xs border border-border rounded px-1.5 py-1 bg-background"
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <Button size="sm" onClick={() => navigate('/admin/products/new')}>
                <Plus className="h-4 w-4 mr-1" /> 新增商品
              </Button>
            </div>

            {isLoading ? (
              <p className="text-center text-muted-foreground py-10">加载中...</p>
            ) : (
              <>
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <Table className='bg-white'>
                    <TableHeader>
                      <TableRow>
                        <TableHead>商品</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map(p => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                                {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <Package className="h-4 w-4 text-muted-foreground" />}
                              </div>
                              <div>
                                <div className="flex flex-row gap-2 items-center">
                                  <span className="font-medium text-sm">{p.name}</span>
                                  {p.is_active ? (
                                    <Badge variant="default" className="bg-green-800 text-[10px]">上架</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-red-200 text-[10px]">下架</Badge>
                                  )}
                                </div>
                                {p.category && <p className="text-[10px] text-muted-foreground">{p.category}</p>}
                                {p.sku && <p className="text-[10px] text-muted-foreground">SKU: {p.sku}</p>}
                                <p className="text-sm text-muted-foreground">
                                  价格: {p.currency} {Number(p.price).toFixed(2)}
                                  {p.selling_price != null && (
                                    <span className="ml-1 text-destructive font-medium">→ {Number(p.selling_price).toFixed(2)}</span>
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground">数量: {p.quantity}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: 'product', id: p.id, name: p.name })}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
          </TabsContent>

          <TabsContent value="inventory" className="mt-4">
            <SkuInventoryTable products={products} />
          </TabsContent>

          <TabsContent value="coupons" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground">共 {coupons.length} 张</span>
              <Button size="sm" onClick={() => setShowCouponForm(!showCouponForm)}>
                <Plus className="h-4 w-4 mr-1" /> 新增优惠券
              </Button>
            </div>
            {showCouponForm && (
              <Card className="border-border/50 mb-4">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>优惠码 *</Label>
                      <Input value={couponForm.code} onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="如 SAVE10" />
                    </div>
                    <div>
                      <Label>类型</Label>
                      <Select value={couponForm.discount_type} onValueChange={v => setCouponForm(f => ({ ...f, discount_type: v as any }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">百分比折扣</SelectItem>
                          <SelectItem value="fixed">固定金额</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>{couponForm.discount_type === 'percentage' ? '折扣 (%)' : '金额'} *</Label>
                      <Input type="number" value={couponForm.discount_value} onChange={e => setCouponForm(f => ({ ...f, discount_value: e.target.value }))} />
                    </div>
                    <div>
                      <Label>最低消费</Label>
                      <Input type="number" value={couponForm.min_order_amount} onChange={e => setCouponForm(f => ({ ...f, min_order_amount: e.target.value }))} />
                    </div>
                    <div>
                      <Label>使用上限</Label>
                      <Input type="number" value={couponForm.max_uses} onChange={e => setCouponForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="不限" />
                    </div>
                  </div>
                  <div>
                    <Label>过期日期</Label>
                    <Input type="datetime-local" value={couponForm.expires_at} onChange={e => setCouponForm(f => ({ ...f, expires_at: e.target.value }))} />
                  </div>
                  <Button size="sm" disabled={!couponForm.code || !couponForm.discount_value} onClick={() => {
                    createCoupon.mutate({
                      code: couponForm.code.trim(),
                      discount_type: couponForm.discount_type,
                      discount_value: parseFloat(couponForm.discount_value),
                      min_order_amount: parseFloat(couponForm.min_order_amount) || 0,
                      max_uses: couponForm.max_uses ? parseInt(couponForm.max_uses) : null,
                      expires_at: couponForm.expires_at || null,
                    } as any, {
                      onSuccess: () => { toast({ title: '优惠券已创建' }); setShowCouponForm(false); setCouponForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', max_uses: '', expires_at: '' }); },
                      onError: (err: any) => toast({ title: '创建失败', description: err.message, variant: 'destructive' }),
                    });
                  }}>创建</Button>
                </CardContent>
              </Card>
            )}
            <div className="space-y-2">
              {coupons.map(c => (
                <Card key={c.id} className="border-border/50">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm">{c.code}</span>
                        <Badge variant={c.is_active ? 'default' : 'secondary'} className="text-[10px]">
                          {c.is_active ? '有效' : '停用'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {c.discount_type === 'percentage' ? `${c.discount_value}% 折扣` : `减 ${c.discount_value}`}
                        {c.min_order_amount > 0 && ` · 满${c.min_order_amount}`}
                        {c.max_uses && ` · ${c.used_count}/${c.max_uses}次`}
                        {c.expires_at && ` · 至${new Date(c.expires_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                        updateCoupon.mutate({ id: c.id, is_active: !c.is_active } as any);
                      }}>
                        <Switch checked={c.is_active} className="pointer-events-none scale-75" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: 'coupon', id: c.id, name: c.code })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {coupons.length === 0 && <p className="text-center text-muted-foreground py-6 text-sm">暂无优惠券</p>}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="新分类名称..."
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newCategoryName.trim()) {
                        addCategory.mutate(newCategoryName.trim(), {
                          onSuccess: () => { setNewCategoryName(''); toast({ title: '分类已添加' }); },
                          onError: (err: any) => toast({ title: '添加失败', description: err.message, variant: 'destructive' }),
                        });
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    disabled={!newCategoryName.trim() || addCategory.isPending}
                    onClick={() => {
                      if (!newCategoryName.trim()) return;
                      addCategory.mutate(newCategoryName.trim(), {
                        onSuccess: () => { setNewCategoryName(''); toast({ title: '分类已添加' }); },
                        onError: (err: any) => toast({ title: '添加失败', description: err.message, variant: 'destructive' }),
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> 添加
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <Badge key={cat.id} variant="secondary" className="text-sm py-1.5 px-3 gap-1.5">
                      {cat.name}
                      {cat.name !== '未分类' && (
                        <button
                          className="ml-1 hover:text-destructive"
                          onClick={() => setDeleteTarget({ type: 'category', id: cat.id, name: cat.name })}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-xs mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除{deleteTarget?.type === 'product' ? '商品' : '分类'} "{deleteTarget?.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}