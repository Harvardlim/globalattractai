import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Loader2, GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { UserMenu } from '@/components/UserMenu';
import { useProducts, Product } from '@/hooks/useProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductImages } from '@/hooks/useProductImages';
import { useProductOptions } from '@/hooks/useProductOptions';
import { useProductVariants, generateOptionCombinations, ProductVariant } from '@/hooks/useProductVariants';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ProductEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { toast } = useToast();
  const { products, isLoading: productsLoading, createProduct, updateProduct } = useProducts(true);
  const { categories } = useProductCategories();
  const { images: existingImages, addImage, removeImage } = useProductImages(id);
  const { options: existingOptions, addOption, updateOption, deleteOption } = useProductOptions(id);
  const { variants: existingVariants, upsertVariants } = useProductVariants(id);
  const product = isEditing ? products.find(p => p.id === id) : undefined;

  const [form, setForm] = useState({
    name: '', description: '', price: '', selling_price: '', currency: 'MYR', sku: '',
    quantity: '0', weight_kg: '1', image_url: '', is_digital: false,
    is_active: true, category: '未分类', max_per_customer: '', summary: '',
    is_bundle: false, bundle_quantity: '1',
  });
  const [visiblePlatforms, setVisiblePlatforms] = useState<string[]>([]);
  const [allPlatforms, setAllPlatforms] = useState<{ id: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Extra images (gallery)
  const [extraImages, setExtraImages] = useState<{ url: string; id?: string }[]>([]);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  
  // Product options state
  const [localOptions, setLocalOptions] = useState<{ id?: string; label: string; values: string[]; newValue: string }[]>([]);
  const [optionsInitialized, setOptionsInitialized] = useState(false);
  // Variant inventory state
  const [localVariants, setLocalVariants] = useState<{ sku: string; quantity: number; option_values: Record<string, string> }[]>([]);
  const [variantsInitialized, setVariantsInitialized] = useState(false);

  // Fetch platforms
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('platforms').select('id, name').order('created_at');
      if (data) setAllPlatforms(data);
    })();
  }, []);

  useEffect(() => {
    if (existingOptions.length > 0 && !optionsInitialized) {
      setLocalOptions(existingOptions.map(o => ({ id: o.id, label: o.option_label, values: o.option_values, newValue: '' })));
      setOptionsInitialized(true);
    }
  }, [existingOptions, optionsInitialized]);

  // Initialize variant inventory from DB
  useEffect(() => {
    if (existingVariants.length > 0 && !variantsInitialized) {
      setLocalVariants(existingVariants.map(v => ({
        sku: v.sku || '',
        quantity: v.quantity,
        option_values: v.option_values as Record<string, string>,
      })));
      setVariantsInitialized(true);
    }
  }, [existingVariants, variantsInitialized]);

  // Auto-generate variants when options change
  const generateVariants = () => {
    const validOptions = localOptions.filter(o => o.label.trim() && o.values.length > 0);
    if (validOptions.length === 0) return;
    const combos = generateOptionCombinations(validOptions.map(o => ({ option_label: o.label, option_values: o.values })));
    setLocalVariants(combos.map(combo => {
      // Preserve existing variant data if combo matches
      const existing = localVariants.find(v => {
        return Object.keys(combo).every(k => v.option_values[k] === combo[k]) && Object.keys(v.option_values).length === Object.keys(combo).length;
      });
      return existing || { sku: '', quantity: 0, option_values: combo };
    }));
  };

  useEffect(() => {
    if (isEditing && product && !initialized) {
      setForm({
        name: product.name || '', description: product.description || '',
        price: product.price?.toString() || '',
        selling_price: product.selling_price?.toString() || '',
        currency: product.currency || 'MYR',
        sku: product.sku || '', quantity: product.quantity?.toString() || '0',
        weight_kg: product.weight_kg?.toString() || '1', image_url: product.image_url || '',
        is_digital: product.is_digital || false, is_active: product.is_active ?? true,
        category: (product as any).category || '未分类',
        max_per_customer: (product as any).max_per_customer?.toString() || '',
        summary: (product as any).summary || '',
        is_bundle: product.is_bundle || false,
        bundle_quantity: product.bundle_quantity?.toString() || '1',
      });
      setImagePreview(product.image_url || null);
      setVisiblePlatforms((product as any).visible_platforms || []);
      setInitialized(true);
    }
  }, [product, isEditing, initialized]);

  useEffect(() => {
    if (existingImages.length > 0) {
      setExtraImages(existingImages.map(img => ({ url: img.image_url, id: img.id })));
    }
  }, [existingImages]);

  const uploadFile = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) throw new Error('请选择图片文件');
    if (file.size > 5 * 1024 * 1024) throw new Error('图片大小不能超过5MB');
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setForm(f => ({ ...f, image_url: url }));
      setImagePreview(url);
    } catch (err: any) {
      toast({ title: '上传失败', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleExtraImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingExtra(true);
    try {
      const url = await uploadFile(file);
      setExtraImages(prev => [...prev, { url }]);
    } catch (err: any) {
      toast({ title: '上传失败', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingExtra(false);
    }
  };

  const clearImage = () => {
    setForm(f => ({ ...f, image_url: '' }));
    setImagePreview(null);
  };

  const removeExtraImage = async (idx: number) => {
    const img = extraImages[idx];
    if (img.id) {
      await removeImage.mutateAsync(img.id);
    }
    setExtraImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Require product-level SKU only when no variants
    if (localVariants.length === 0 && !form.sku.trim()) {
      toast({ title: '请填写SKU', variant: 'destructive' });
      return;
    }
    const data: any = {
      ...form,
      price: parseFloat(form.price),
      selling_price: form.selling_price ? parseFloat(form.selling_price) : null,
      quantity: parseInt(form.quantity),
      weight_kg: parseFloat(form.weight_kg) || 1,
      max_per_customer: form.max_per_customer ? parseInt(form.max_per_customer) : null,
      summary: form.summary.trim() || null,
      is_bundle: form.is_bundle,
      bundle_quantity: form.is_bundle ? parseInt(form.bundle_quantity) || 1 : 1,
      visible_platforms: visiblePlatforms,
    };
    try {
      let productId = id;
      if (isEditing && product) {
        await updateProduct.mutateAsync({ id: product.id, ...data });
      } else {
        const created = await createProduct.mutateAsync(data);
        productId = created.id;
      }

      // Save extra images
      if (productId) {
        const existingIds = existingImages.map(i => i.id);
        const currentIds = extraImages.filter(i => i.id).map(i => i.id!);
        for (let i = 0; i < extraImages.length; i++) {
          const img = extraImages[i];
          if (!img.id) {
            await addImage.mutateAsync({ productId, imageUrl: img.url, sortOrder: i });
          }
        }

        // Save product options
        for (const opt of localOptions) {
          if (!opt.label.trim() || opt.values.length === 0) continue;
          if (opt.id) {
            await updateOption.mutateAsync({ id: opt.id, label: opt.label, values: opt.values });
          } else {
            await addOption.mutateAsync({ productId, label: opt.label, values: opt.values });
          }
        }

        // Save product variants (option-level inventory)
        if (localVariants.length > 0) {
          await upsertVariants.mutateAsync(
            localVariants.map(v => ({
              product_id: productId!,
              sku: v.sku || null,
              quantity: v.quantity,
              option_values: v.option_values,
            }))
          );
        }
      }

      toast({ title: isEditing ? '商品已更新' : '商品已创建' });
      navigate('/admin/products');
    } catch (err: any) {
      toast({ title: isEditing ? '更新失败' : '创建失败', description: err.message, variant: 'destructive' });
    }
  };

  if (isEditing && productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 max-w-lg">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/products')} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold flex-1">{isEditing ? '编辑商品' : '新增商品'}</h1>            
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>商品名称 *</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <Label>分类</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue placeholder="选择分类" /></SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>简介（商城卡片显示，最多30字）</Label>
            <Input
              value={form.summary}
              onChange={e => { if (e.target.value.length <= 30) setForm(f => ({ ...f, summary: e.target.value })); }}
              placeholder="简短描述，展示在商城列表"
              maxLength={30}
            />
            <p className="text-xs text-muted-foreground mt-1">{form.summary.length}/30</p>
          </div>
          <div>
            <Label>详细描述</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>原价 *</Label>
              <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
            </div>
            <div>
              <Label>售价（促销价，选填）</Label>
              <Input type="number" step="0.01" value={form.selling_price} onChange={e => setForm(f => ({ ...f, selling_price: e.target.value }))} placeholder="不填则按原价" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>货币</Label>
              <Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} />
            </div>
          </div>
          {/* Only show product-level SKU if no variants */}
          {localVariants.length === 0 && (
            <div>
              <Label>SKU *</Label>
              <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required placeholder="必填，库存在库存Tab管理" />
              <p className="text-xs text-muted-foreground mt-1">库存数量请到商品管理 → 库存Tab 中调整</p>
            </div>
          )}
          {localVariants.length > 0 && (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">此商品已有变体，SKU 和库存通过变体管理。库存数量请到商品管理 → 库存Tab 中调整。</p>
          )}
          <div>
            <Label>重量 (kg)</Label>
            <Input type="number" step="0.1" min="0.1" value={form.weight_kg} onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))} />
          </div>

          {/* Main Image */}
          <div>
            <Label>主图</Label>
            {imagePreview ? (
              <div className="relative mt-2 w-32 h-32 rounded-lg overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={clearImage}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="mt-2 flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                {uploading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">点击上传主图 (最大5MB)</span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Extra Gallery Images */}
          <div>
            <Label>更多图片（轮播展示）</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {extraImages.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={img.url} alt={`Extra ${idx + 1}`} className="w-full h-full object-cover" />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-0.5 right-0.5 h-5 w-5" onClick={() => removeExtraImage(idx)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={handleExtraImageUpload} disabled={uploadingExtra} />
                {uploadingExtra ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : (
                  <Upload className="h-4 w-4 text-muted-foreground" />
                )}
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">主图 + 更多图片将在详情页轮播展示</p>
          </div>

          {/* Product Options (selectable by customers) */}
          <div>
            <Label>顾客选项（如命格、口味等）</Label>
            <div className="space-y-3 mt-2">
              {localOptions.map((opt, idx) => (
                <Card key={idx} className="border-border/50">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="选项名称（如：命格）"
                        value={opt.label}
                        onChange={e => {
                          const updated = [...localOptions];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setLocalOptions(updated);
                        }}
                        className="flex-1"
                      />
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => {
                        if (opt.id) deleteOption.mutate(opt.id);
                        setLocalOptions(prev => prev.filter((_, i) => i !== idx));
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {opt.values.map((v, vi) => (
                        <Badge key={vi} variant="secondary" className="text-xs gap-1">
                          {v}
                          <button type="button" onClick={() => {
                            const updated = [...localOptions];
                            updated[idx] = { ...updated[idx], values: updated[idx].values.filter((_, i) => i !== vi) };
                            setLocalOptions(updated);
                          }}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <Input
                        placeholder="添加选项值..."
                        value={opt.newValue}
                        onChange={e => {
                          const updated = [...localOptions];
                          updated[idx] = { ...updated[idx], newValue: e.target.value };
                          setLocalOptions(updated);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && opt.newValue.trim()) {
                            e.preventDefault();
                            const updated = [...localOptions];
                            updated[idx] = { ...updated[idx], values: [...updated[idx].values, updated[idx].newValue.trim()], newValue: '' };
                            setLocalOptions(updated);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm" disabled={!opt.newValue.trim()} onClick={() => {
                        if (!opt.newValue.trim()) return;
                        const updated = [...localOptions];
                        updated[idx] = { ...updated[idx], values: [...updated[idx].values, updated[idx].newValue.trim()], newValue: '' };
                        setLocalOptions(updated);
                      }}>
                        添加
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setLocalOptions(prev => [...prev, { label: '', values: [], newValue: '' }])}>
                <Plus className="h-4 w-4 mr-1" /> 添加选项组
              </Button>
            </div>
          </div>

          {/* Variant Inventory (per-option-combination stock) */}
          {localOptions.some(o => o.label.trim() && o.values.length > 0) && (
            <div>
              <div className="flex items-center justify-between">
                <Label>变体库存管理</Label>
                <Button type="button" variant="outline" size="sm" onClick={generateVariants}>
                  生成变体
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 mb-2">为每个选项组合设置独立的SKU，库存数量请到库存Tab管理</p>
              {localVariants.length > 0 ? (
                <div className="space-y-2">
                  {localVariants.map((v, idx) => (
                    <Card key={idx} className="border-border/50">
                      <CardContent className="p-3">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {Object.entries(v.option_values).map(([k, val]) => (
                            <Badge key={k} variant="secondary" className="text-[10px]">{k}: {val}</Badge>
                          ))}
                        </div>
                        <div>
                          <Label className="text-xs">SKU *</Label>
                          <Input
                            placeholder="变体SKU（必填）"
                            value={v.sku}
                            onChange={e => {
                              const updated = [...localVariants];
                              updated[idx] = { ...updated[idx], sku: e.target.value };
                              setLocalVariants(updated);
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                  点击"生成变体"按钮，根据选项组合自动创建变体
                </p>
              )}
            </div>
          )}

          {/* Bundle Selection */}
          <div>
            <Label>套装（Bundle）</Label>
            <div className="flex items-center gap-3 mt-1">
              <Switch
                checked={form.is_bundle}
                onCheckedChange={v => setForm(f => ({ ...f, is_bundle: v, bundle_quantity: v ? (f.bundle_quantity || '2') : '1' }))}
              />
              <span className="text-sm text-muted-foreground">{form.is_bundle ? '已开启套装' : '非套装'}</span>
            </div>
            {form.is_bundle && (
              <div className="mt-2">
                <Label className="text-xs text-muted-foreground">一次购买几件</Label>
                <Input
                  type="number"
                  min="2"
                  className="mt-1"
                  placeholder="套装数量"
                  value={form.bundle_quantity}
                  onChange={e => setForm(f => ({ ...f, bundle_quantity: e.target.value }))}
                />
                {localOptions.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    顾客将为每件分别选择选项（共 {form.bundle_quantity} 组选项）
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Per-customer purchase limit */}
          <div>
            <Label>每位顾客限购数量</Label>
            <div className="flex items-center gap-3 mt-1">
              <Switch
                checked={!!form.max_per_customer}
                onCheckedChange={v => setForm(f => ({ ...f, max_per_customer: v ? '1' : '' }))}
              />
              <span className="text-sm text-muted-foreground">{form.max_per_customer ? '已开启限购' : '不限购'}</span>
            </div>
            {form.max_per_customer && (
              <Input
                type="number"
                min="1"
                className="mt-2"
                placeholder="最多可买几件"
                value={form.max_per_customer}
                onChange={e => setForm(f => ({ ...f, max_per_customer: e.target.value }))}
              />
            )}
          </div>

          {/* Platform Visibility */}
          <div>
            <Label>平台可见性</Label>
            <p className="text-xs text-muted-foreground mt-1 mb-2">不勾选任何平台 = 全部平台可见</p>
            <div className="flex flex-wrap gap-3">
              {allPlatforms.map(p => (
                <label key={p.id} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={visiblePlatforms.includes(p.name)}
                    onCheckedChange={(checked) => {
                      setVisiblePlatforms(prev =>
                        checked
                          ? [...prev, p.name]
                          : prev.filter(n => n !== p.name)
                      );
                    }}
                  />
                  {p.name}
                </label>
              ))}
            </div>
            {visiblePlatforms.length > 0 && (
              <p className="text-xs text-primary mt-1">仅 {visiblePlatforms.join('、')} 的用户可见</p>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_digital} onCheckedChange={v => setForm(f => ({ ...f, is_digital: v }))} />
              <Label>数字商品</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>上架</Label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={uploading || uploadingExtra || createProduct.isPending || updateProduct.isPending}>
              {(createProduct.isPending || updateProduct.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              保存
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>取消</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
