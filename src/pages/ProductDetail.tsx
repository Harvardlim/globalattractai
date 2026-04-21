import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Package, Minus, Plus, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserMenu } from '@/components/UserMenu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Carousel, CarouselContent, CarouselItem,
} from '@/components/ui/carousel';
import { useProducts, getEffectivePrice } from '@/hooks/useProducts';
import { PriceDisplay } from '@/components/PriceDisplay';
import { useProductImages } from '@/hooks/useProductImages';
import { useProductOptions } from '@/hooks/useProductOptions';
import { useProductVariants, findMatchingVariant } from '@/hooks/useProductVariants';
import { useCart } from '@/hooks/useCart';
import { useGuestCart } from '@/hooks/useGuestCart';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { products, isLoading } = useProducts();
  const { images: extraImages, isLoading: imagesLoading } = useProductImages(id);
  const { options: productOptions } = useProductOptions(id);
  const { variants } = useProductVariants(id);
  const authCart = useCart();
  const guestCart = useGuestCart();
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  // For bundle products: array of option sets, one per bundle item
  const [bundleOptions, setBundleOptions] = useState<Record<string, string>[]>([]);
  const [showCartConfirm, setShowCartConfirm] = useState(false);
  const [addQty, setAddQty] = useState(1);

  const product = products.find(p => p.id === id);
  const totalItems = user ? authCart.totalItems : guestCart.totalItems;

  // Related products: same category, exclude current, max 6
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.id !== product.id && (p as any).category === (product as any).category && p.quantity > 0)
      .slice(0, 2);
  }, [products, product]);

  // Build all images: main image + extra images
  const allImages = product ? [
    ...(product.image_url ? [product.image_url] : []),
    ...extraImages.map(i => i.image_url),
  ] : [];

  const getCartItems = () => {
    if (!id) return [];
    const items = user ? authCart.cartItems : guestCart.cartItems;
    return items.filter(i => i.product_id === id);
  };

  const cartItemsForProduct = getCartItems();
  const inCart = cartItemsForProduct.length > 0 ? cartItemsForProduct[0] : undefined;
  const hasOptions = productOptions.length > 0;
  const totalInCart = cartItemsForProduct.reduce((s, i) => s + i.quantity, 0);
  const maxPerCustomer = (product as any)?.max_per_customer as number | null;
  const remainingQuota = maxPerCustomer ? Math.max(0, maxPerCustomer - totalInCart) : null;

  const isBundle = product?.is_bundle || false;
  const bundleQty = product?.bundle_quantity || 1;

  // Initialize bundle options when product loads
  const effectiveBundleQty = isBundle ? bundleQty : 1;

  // Check if all required options are selected
  const allOptionsSelected = !hasOptions || (() => {
    if (isBundle && hasOptions) {
      // For bundles, check all bundle item option sets
      if (bundleOptions.length < effectiveBundleQty) return false;
      return bundleOptions.every(optSet =>
        productOptions.every(opt => !!optSet[opt.id])
      );
    }
    return productOptions.every(opt => !!selectedOptions[opt.id]);
  })();

  // Check variant stock when options are selected (only for non-bundle products with variants)
  const hasVariants = variants.length > 0;
  const matchedVariant = (hasVariants && hasOptions && !isBundle && allOptionsSelected)
    ? findMatchingVariant(variants, selectedOptions, productOptions)
    : null;
  const variantOutOfStock = hasVariants && hasOptions && !isBundle && allOptionsSelected && matchedVariant && matchedVariant.quantity <= 0;
  const variantStock = matchedVariant?.quantity;

  const handleAddToCart = () => {
    if (!product) return;
    if (!allOptionsSelected) {
      toast({ title: '请选择所有选项', description: '请先选择所有产品选项后再加入购物车', variant: 'destructive' });
      return;
    }
    if (remainingQuota !== null && addQty > remainingQuota) {
      toast({ title: '超出限购数量', description: `每位顾客最多可购买 ${maxPerCustomer} 件，您已加入 ${totalInCart} 件`, variant: 'destructive' });
      return;
    }

    // Build selected options payload
    let optionsPayload: Record<string, string> | Record<string, string>[] | undefined;

    if (hasOptions) {
      if (isBundle && bundleQty > 1) {
        // Bundle: store array of option sets
        const bundlePayload: Record<string, string>[] = [];
        for (let i = 0; i < effectiveBundleQty; i++) {
          const optSet: Record<string, string> = {};
          productOptions.forEach(opt => {
            if (bundleOptions[i]?.[opt.id]) {
              optSet[opt.option_label] = bundleOptions[i][opt.id];
            }
          });
          bundlePayload.push(optSet);
        }
        optionsPayload = bundlePayload;
      } else {
        const singlePayload: Record<string, string> = {};
        productOptions.forEach(opt => {
          if (selectedOptions[opt.id]) {
            singlePayload[opt.option_label] = selectedOptions[opt.id];
          }
        });
        if (Object.keys(singlePayload).length > 0) optionsPayload = singlePayload;
      }
    }

    if (user) {
      authCart.addToCart.mutate({ productId: product.id, quantity: addQty, selectedOptions: optionsPayload });
    } else {
      guestCart.addToCart(product.id, addQty, {
        id: product.id, name: product.name, price: Number(product.price),
        currency: product.currency, image_url: product.image_url,
        quantity: product.quantity, weight_kg: product.weight_kg,
      }, optionsPayload);
    }
    // Reset selections
    if (hasOptions) {
      setSelectedOptions({});
      setBundleOptions([]);
    }
    setAddQty(1);
    setShowCartConfirm(true);
  };

  const handleUpdateQuantity = (newQty: number) => {
    if (!inCart || !product) return;
    if (newQty <= 0) {
      setRemoveTarget(product.name);
      return;
    }
    if (user) {
      authCart.updateQuantity.mutate({ itemId: inCart.id, quantity: newQty });
    } else {
      guestCart.updateQuantity(inCart.id, newQty);
    }
  };

  const confirmRemove = () => {
    if (!inCart || !product) return;
    if (user) {
      authCart.removeItem.mutate(inCart.id);
    } else {
      guestCart.removeItem(inCart.id);
    }
    setRemoveTarget(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-4 max-w-lg">
          <Skeleton className="w-full aspect-square rounded-xl mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  // Platform visibility check
  const userSource = user?.user_metadata?.source || profile?.source || 'public';
  const vp = (product as any)?.visible_platforms as string[] | undefined;
  const platformBlocked = product && vp && vp.length > 0 && !vp.includes(userSource);

  if (!product || platformBlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">商品不存在</p>
          <Button onClick={() => navigate('/store')}>返回商城</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 max-w-lg">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold flex-1 line-clamp-1">商品详情</h1>
            <div className="flex items-center gap-2">
              <button
                className="p-1"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url).then(() => {
                    toast({ title: '链接已复制', description: '可以分享给好友啦' });
                  }).catch(() => {
                    toast({ title: '复制失败', variant: 'destructive' });
                  });
                }}
              >
                <Share2 className="h-5 w-5" />
              </button>
              {/* <button className="relative p-1" onClick={() => navigate('/cart')}>          
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button> */}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-lg">
        {/* Image Carousel */}
        {allImages.length > 1 ? (
          <div className="relative">
            <Carousel
              opts={{ loop: true }}
              setApi={(api) => {
                api?.on('select', () => {
                  setCurrentSlide(api.selectedScrollSnap());
                });
              }}
            >
              <CarouselContent className="ml-0">
                {allImages.map((url, idx) => (
                  <CarouselItem key={idx} className="pl-0">
                    <div className="w-full aspect-square bg-muted">
                      <img src={url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {/* Dots indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentSlide ? 'bg-primary' : 'bg-primary/30'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full aspect-square bg-muted flex items-center justify-center">
            {allImages.length === 1 ? (
              <img src={allImages[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="h-20 w-20 text-muted-foreground" />
            )}
          </div>
        )}

        {/* Product Info */}
        <div className="px-4 py-4 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-bold">{product.name}</h2>
              <div className="flex gap-1.5 shrink-0">
                {isBundle && bundleQty > 1 && (
                  <Badge variant="outline" className="shrink-0">套装 x{bundleQty}</Badge>
                )}
                {product.quantity <= 0 && (!hasVariants || variants.every(v => v.quantity <= 0)) && (
                  <Badge variant="secondary" className="shrink-0">缺货</Badge>
                )}
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <PriceDisplay
                price={Number(product.price)}
                sellingPrice={product.selling_price != null ? Number(product.selling_price) : null}
                currency={product.currency}
                size="lg"
              />
              {isBundle && bundleQty > 1 && (
                <span className="text-xs text-muted-foreground">（含 {bundleQty} 件）</span>
              )}
            </div>
          </div>

          {/* Product Options */}
          {productOptions.length > 0 && !isBundle && (
            <div className="space-y-3">
              {productOptions.map(opt => {
                const getOptionStock = (optionValue: string) => {
                  if (!hasVariants) return null;
                  const matching = variants.filter(v => {
                    const vals = v.option_values as Record<string, string>;
                    if (vals[opt.option_label] !== optionValue) return false;
                    for (const otherOpt of productOptions) {
                      if (otherOpt.id === opt.id) continue;
                      const sel = selectedOptions[otherOpt.id];
                      if (sel && vals[otherOpt.option_label] !== sel) return false;
                    }
                    return true;
                  });
                  if (matching.length === 0) return 0;
                  return matching.reduce((sum, v) => sum + v.quantity, 0);
                };

                return (
                  <div key={opt.id}>
                    <label className="text-sm font-medium">{opt.option_label}</label>
                    <Select
                      value={selectedOptions[opt.id] || ''}
                      onValueChange={v => setSelectedOptions(prev => ({ ...prev, [opt.id]: v }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={`请选择${opt.option_label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {opt.option_values.map(v => {
                          const stock = getOptionStock(v);
                          const outOfStock = stock !== null && stock <= 0;
                          return (
                            <SelectItem key={v} value={v} disabled={outOfStock}>
                              {v}{stock !== null ? ` (${stock})` : ''}{outOfStock ? ' · 缺货' : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bundle Options: N sets of option selectors */}
          {productOptions.length > 0 && isBundle && bundleQty > 1 && (
            <div className="space-y-4">
              <p className="text-sm font-medium">套装 · 共 {bundleQty} 件，请分别选择</p>
              {Array.from({ length: effectiveBundleQty }).map((_, bundleIdx) => (
                <div key={bundleIdx} className="border border-border rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">第 {bundleIdx + 1} 件</p>
                  {productOptions.map(opt => (
                    <div key={opt.id}>
                      <label className="text-xs font-medium">{opt.option_label}</label>
                      <Select
                        value={bundleOptions[bundleIdx]?.[opt.id] || ''}
                        onValueChange={v => {
                          setBundleOptions(prev => {
                            const next = [...prev];
                            while (next.length <= bundleIdx) next.push({});
                            next[bundleIdx] = { ...next[bundleIdx], [opt.id]: v };
                            return next;
                          });
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={`请选择${opt.option_label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {opt.option_values.map(v => {
                            const matching = variants.filter(vr => {
                              const vals = vr.option_values as Record<string, string>;
                              if (vals[opt.option_label] !== v) return false;
                              for (const otherOpt of productOptions) {
                                if (otherOpt.id === opt.id) continue;
                                const sel = bundleOptions[bundleIdx]?.[otherOpt.id];
                                if (sel && vals[otherOpt.option_label] !== sel) return false;
                              }
                              return true;
                            });
                            const stock = hasVariants ? matching.reduce((s, vr) => s + vr.quantity, 0) : null;
                            const outOfStock = stock !== null && stock <= 0;
                            return (
                              <SelectItem key={v} value={v} disabled={outOfStock}>
                                {v}{stock !== null ? ` (${stock})` : ''}{outOfStock ? ' · 缺货' : ''}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Quantity Selector */}
          {(product.quantity > 0 || (hasVariants && variants.some(v => v.quantity > 0))) && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">数量</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setAddQty(q => Math.max(1, q - 1))} disabled={addQty <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold w-8 text-center">{addQty}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setAddQty(q => q + 1)} disabled={addQty >= (remainingQuota !== null ? Math.min(product.quantity, remainingQuota) : product.quantity)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col items-end ml-auto text-xs text-muted-foreground">
                {!hasVariants && <span>库存: {product.quantity}</span>}
                {hasVariants && matchedVariant && <span>库存: {matchedVariant.quantity}</span>}
                {maxPerCustomer && <span>限购: {maxPerCustomer}件/人{totalInCart > 0 ? ` (已加${totalInCart}件)` : ''}</span>}
                {variantOutOfStock && <span className="text-destructive font-medium">该选项已售罄</span>}
              </div>
            </div>
          )}

          {product.description && (
            <div>
              <h3 className="font-semibold text-sm mb-1">商品描述</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-2">
              <h3 className="font-semibold text-sm mb-3">相关商品</h3>
              <div className="grid grid-cols-2 gap-2">
                {relatedProducts.map(rp => (
                  <div
                    key={rp.id}
                    className="cursor-pointer rounded-lg border border-border overflow-hidden hover:shadow-sm transition-shadow"
                    onClick={() => navigate(`/store/${rp.id}`)}
                  >
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {rp.image_url ? (
                        <img src={rp.image_url} alt={rp.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium line-clamp-1">{rp.name}</p>
                      <PriceDisplay
                        price={Number(rp.price)}
                        sellingPrice={(rp as any).selling_price != null ? Number((rp as any).selling_price) : null}
                        currency={rp.currency}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      {(product.quantity > 0 || (hasVariants && variants.some(v => v.quantity > 0))) && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40">
          <div>
            <div className="space-y-2">
              {cartItemsForProduct.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  已加入 {cartItemsForProduct.reduce((s, i) => s + i.quantity, 0)} 件到购物车
                </p>
              )}
              <Button className="w-full" size="lg" onClick={handleAddToCart} disabled={(user ? authCart.addToCart.isPending : false) || !allOptionsSelected || (remainingQuota !== null && remainingQuota <= 0) || !!variantOutOfStock}>
                {variantOutOfStock ? '该选项已售罄' : remainingQuota !== null && remainingQuota <= 0 ? '已达限购上限' : !allOptionsSelected ? '请先选择选项' : `加入购物车 (${addQty}件)`}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent className="rounded-lg max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle>确认移除</AlertDialogTitle>
            <AlertDialogDescription>确定要从购物车中移除「{removeTarget}」吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">移除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCartConfirm} onOpenChange={setShowCartConfirm}>
        <AlertDialogContent className="rounded-lg max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle>已加入购物车</AlertDialogTitle>
            <AlertDialogDescription>商品已成功加入购物车，是否前往购物车查看？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>继续选购</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/cart')}>去购物车</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
