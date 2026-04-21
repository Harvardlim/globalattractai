import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, Search, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { UserMenu } from '@/components/UserMenu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useProducts, getEffectivePrice } from '@/hooks/useProducts';
import { PriceDisplay } from '@/components/PriceDisplay';
import { useCart } from '@/hooks/useCart';
import { useGuestCart } from '@/hooks/useGuestCart';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useAllProductOptions } from '@/hooks/useProductOptions';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function Store() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { products, isLoading } = useProducts();
  const authCart = useCart();
  const guestCart = useGuestCart();
  const { categories } = useProductCategories();
  const { optionsMap } = useAllProductOptions();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [variantStockMap, setVariantStockMap] = useState<Record<string, number>>({});

  // Fetch variant stock grouped by product_id
  useEffect(() => {
    (async () => {
      const { data } = await (supabase
        .from('product_variants' as any)
        .select('product_id, quantity')) as any;
      if (data) {
        const map: Record<string, number> = {};
        for (const v of data as { product_id: string; quantity: number }[]) {
          map[v.product_id] = (map[v.product_id] || 0) + v.quantity;
        }
        setVariantStockMap(map);
      }
    })();
  }, [products]);

  const productHasAnyStock = (product: any) => {
    // If product itself has stock, it's available
    if (product.quantity > 0) return true;
    // If any variant has stock, it's available
    if (variantStockMap[product.id] > 0) return true;
    return false;
  };

  const totalItems = user ? authCart.totalItems : guestCart.totalItems;

  // Build category filter options from DB categories
  const categoryFilters = useMemo(() => {
    const cats = [{ label: '全部', value: 'all' }];
    categories.forEach(c => {
      if (c.name !== '未分类') {
        cats.push({ label: c.name, value: c.name });
      }
    });
    return cats;
  }, [categories]);

  const userSource = (user as any)?.user_metadata?.source || profile?.source || 'public';

  const filtered = useMemo(() => {
    return products.filter(p => {
      // Platform visibility filter
      const vp = (p as any).visible_platforms as string[] | undefined;
      if (vp && vp.length > 0 && !vp.includes(userSource)) return false;
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'all' || (p as any).category === category;
      return matchSearch && matchCategory;
    });
  }, [products, search, category, userSource]);

  const productHasOptions = (productId: string) => {
    return (optionsMap[productId] || []).length > 0;
  };

  const productIsBundle = (product: any) => {
    return product.is_bundle && product.bundle_quantity > 1;
  };

  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // If product has options or is a bundle, navigate to detail page for selection
    if (productHasOptions(productId) || productIsBundle(products.find(p => p.id === productId))) {
      navigate(`/store/${productId}`);
      return;
    }
    const p = products.find(pr => pr.id === productId);
    if (!p) return;
    if (user) {
      authCart.addToCart.mutate({ productId });
    } else {
      const productData = { id: p.id, name: p.name, price: Number(p.price), currency: p.currency, image_url: p.image_url, quantity: p.quantity, weight_kg: p.weight_kg };
      guestCart.addToCart(productId, 1, productData);
    }
  };

  const [removeTarget, setRemoveTarget] = useState<{ productId: string; cartItemId: string; name: string } | null>(null);

  const handleUpdateQuantity = (productId: string, cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      const product = products.find(p => p.id === productId);
      setRemoveTarget({ productId, cartItemId, name: product?.name || '' });
      return;
    }
    if (user) {
      authCart.updateQuantity.mutate({ itemId: cartItemId, quantity: newQty });
    } else {
      guestCart.updateQuantity(cartItemId, newQty);
    }
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    if (user) {
      authCart.removeItem.mutate(removeTarget.cartItemId);
    } else {
      guestCart.removeItem(removeTarget.cartItemId);
    }
    setRemoveTarget(null);
  };

  const getCartItem = (productId: string) => {
    const items = user ? authCart.cartItems : guestCart.cartItems;
    return items.find(i => i.product_id === productId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 max-w-lg">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold flex-1">商城</h1>
            <div className="flex items-center gap-2">
              <button className="relative p-1" onClick={() => navigate('/cart')}>
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-lg">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索商品..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {categoryFilters.map(c => (
            <Button
              key={c.value}
              variant={category === c.value ? 'default' : 'outline'}
              size="sm"
              className="shrink-0 h-8 text-xs rounded-full"
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {search || category !== 'all' ? '没有找到匹配的商品' : '暂无商品'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(product => (
              <Card key={product.id} className="overflow-hidden border-border/50 cursor-pointer" onClick={() => navigate(`/store/${product.id}`)}>
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <h3 className="font-medium text-sm line-clamp-1 flex-1">{product.name}</h3>
                    {product.is_bundle && product.bundle_quantity > 1 && (
                      <Badge variant="outline" className="text-[9px] shrink-0 px-1 py-0">x{product.bundle_quantity}</Badge>
                    )}
                  </div>
                  {((product as any).summary || product.description) && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{(product as any).summary || product.description}</p>
                  )}
                  <div className="flex flex-col gap-3 mt-2">
                    <PriceDisplay
                      price={Number(product.price)}
                      sellingPrice={product.selling_price != null ? Number(product.selling_price) : null}
                      currency={product.currency}
                      size="sm"
                    />
                    {!productHasAnyStock(product) ? (
                      <Badge variant="secondary" className="text-[10px] w-fit">缺货</Badge>
                    ) : (() => {
                      const hasOpts = productHasOptions(product.id);
                      const isBundleProd = productIsBundle(product);
                      const inCart = (hasOpts || isBundleProd) ? null : getCartItem(product.id);
                      return inCart ? (
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleUpdateQuantity(product.id, inCart.id, inCart.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-medium w-5 text-center">{inCart.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleUpdateQuantity(product.id, inCart.id, inCart.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={(e) => handleAddToCart(product.id, e)}
                          disabled={user ? authCart.addToCart.isPending : false}
                        >
                          加入购物车
                        </Button>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent className="rounded-lg max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle>确认移除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要从购物车中移除「{removeTarget?.name}」吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
