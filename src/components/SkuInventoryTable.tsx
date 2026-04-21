import { useEffect, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  is_active: boolean;
}

interface VariantRow {
  id: string;
  sku: string | null;
  quantity: number;
  option_values: Record<string, string>;
  product_id: string;
}

interface SkuRow {
  sku: string;
  quantity: number;
  /** IDs of products with this SKU (to update) */
  productIds: string[];
  /** IDs of variants with this SKU (to update) */
  variantIds: string[];
  sources: { type: 'product' | 'variant'; name: string; optionLabel: string }[];
}

export function SkuInventoryTable({ products }: { products: Product[] }) {
  const { toast } = useToast();
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [editQuantities, setEditQuantities] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchVariants = useCallback(async () => {
    const { data } = await (supabase
      .from('product_variants' as any)
      .select('id, sku, quantity, option_values, product_id')) as any;
    setVariants((data || []) as VariantRow[]);
  }, []);

  useEffect(() => {
    fetchVariants();
  }, [products, fetchVariants]);

  // Build SKU map
  const skuMap = new Map<string, SkuRow>();

  for (const p of products) {
    if (p.sku) {
      const existing = skuMap.get(p.sku) || { sku: p.sku, quantity: 0, productIds: [], variantIds: [], sources: [] };
      existing.quantity = p.quantity;
      existing.productIds.push(p.id);
      existing.sources.push({ type: 'product', name: p.name, optionLabel: '' });
      skuMap.set(p.sku, existing);
    }
  }

  for (const v of variants) {
    if (v.sku) {
      const productName = products.find(p => p.id === v.product_id)?.name || '未知商品';
      const optionLabel = Object.entries(v.option_values).map(([k, val]) => `${k}:${val}`).join(', ');
      const existing = skuMap.get(v.sku) || { sku: v.sku, quantity: 0, productIds: [], variantIds: [], sources: [] };
      existing.quantity = v.quantity;
      existing.variantIds.push(v.id);
      existing.sources.push({ type: 'variant', name: productName, optionLabel });
      skuMap.set(v.sku, existing);
    }
  }

  const skuRows = Array.from(skuMap.values()).sort((a, b) => a.sku.localeCompare(b.sku));

  // Initialize edit values
  useEffect(() => {
    const init: Record<string, string> = {};
    skuRows.forEach(r => {
      if (!(r.sku in editQuantities)) {
        init[r.sku] = r.quantity.toString();
      }
    });
    if (Object.keys(init).length > 0) {
      setEditQuantities(prev => ({ ...init, ...prev }));
    }
  }, [skuRows.length]);

  const handleSave = async (row: SkuRow) => {
    const newQty = parseInt(editQuantities[row.sku] || '0') || 0;
    setSaving(row.sku);
    try {
      // Update all products with this SKU
      if (row.productIds.length > 0) {
        const { error } = await supabase
          .from('products')
          .update({ quantity: newQty })
          .in('id', row.productIds);
        if (error) throw error;
      }
      // Update all variants with this SKU
      if (row.variantIds.length > 0) {
        const { error } = await (supabase
          .from('product_variants' as any)
          .update({ quantity: newQty })
          .in('id', row.variantIds)) as any;
        if (error) throw error;
      }
      toast({ title: `SKU ${row.sku} 库存已更新为 ${newQty}` });
      fetchVariants();
    } catch (err: any) {
      toast({ title: '更新失败', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">共 {skuRows.length} 个SKU · 修改库存后点击保存按钮</p>

      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table className="bg-white">
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>关联商品/变体</TableHead>
              <TableHead className="text-right w-32">库存</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skuRows.map(row => {
              const edited = editQuantities[row.sku];
              const changed = edited !== undefined && parseInt(edited) !== row.quantity;
              return (
                <TableRow key={row.sku}>
                  <TableCell className="font-mono text-sm font-medium">{row.sku}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      {row.sources.map((s, i) => (
                        <div key={i} className="text-xs text-muted-foreground">
                          <span>{s.name}</span>
                          {s.optionLabel && (
                            <span className="ml-1 text-[10px] text-muted-foreground/70">({s.optionLabel})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min="0"
                      className="h-8 text-xs w-20 ml-auto text-right"
                      value={editQuantities[row.sku] ?? row.quantity}
                      onChange={e => setEditQuantities(prev => ({ ...prev, [row.sku]: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell>
                    {changed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        disabled={saving === row.sku}
                        onClick={() => handleSave(row)}
                      >
                        {saving === row.sku ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {skuRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6 text-sm">
                  暂无库存数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
