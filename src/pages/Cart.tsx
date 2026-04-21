import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserMenu } from '@/components/UserMenu';
import { useCart } from '@/hooks/useCart';
import { useGuestCart } from '@/hooks/useGuestCart';
import { useAuth } from '@/contexts/AuthContext';
import { formatSelectedOptions, hasSelectedOptions } from '@/utils/optionsDisplay';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const authCart = useCart();
  const guestCart = useGuestCart();
  const [deleteTarget, setDeleteTarget] = useState<{ itemId: string; productId: string; name: string } | null>(null);

  const cartItems = user ? authCart.cartItems : guestCart.cartItems;
  const isLoading = user ? authCart.isLoading : guestCart.isLoading;
  const totalAmount = user ? authCart.totalAmount : guestCart.totalAmount;
  const totalItems = user ? authCart.totalItems : guestCart.totalItems;

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      const item = cartItems.find(i => i.id === itemId);
      setDeleteTarget({ itemId, productId: item?.product_id || '', name: item?.product?.name || '' });
      return;
    }
    if (user) {
      authCart.updateQuantity.mutate({ itemId, quantity });
    } else {
      guestCart.updateQuantity(itemId, quantity);
    }
  };

  const confirmRemove = () => {
    if (!deleteTarget) return;
    if (user) {
      authCart.removeItem.mutate(deleteTarget.itemId);
    } else {
      guestCart.removeItem(deleteTarget.itemId);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-1 max-w-lg">
          <div className="flex items-center ">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">购物车</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-lg">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-10">加载中...</p>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">购物车是空的</p>
            <Button onClick={() => navigate('/store')}>去逛逛</Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {cartItems.map(item => (
                <Card key={item.id} className="border-border/50">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {item.product?.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-1">{item.product?.name}</h3>
                      {item.selected_options && hasSelectedOptions(item.selected_options) && (
                        <p className="text-[11px] text-muted-foreground">
                          {formatSelectedOptions(item.selected_options)}
                        </p>
                      )}
                      <p className="text-primary font-semibold text-sm mt-1">
                        {item.product?.currency} {(item.product?.selling_price != null ? Number(item.product.selling_price) : Number(item.product?.price || 0)).toFixed(2)}
                        {item.product?.selling_price != null && Number(item.product.selling_price) < Number(item.product?.price) && (
                          <span className="text-muted-foreground line-through text-xs ml-1.5">
                            {Number(item.product?.price || 0).toFixed(2)}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={() => setDeleteTarget({ itemId: item.id, productId: item.product_id, name: item.product?.name || '' })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Checkout */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">共 {totalItems} 件</span>
                  <span className="text-lg font-bold">
                    {cartItems[0]?.product?.currency || 'MYR'} {totalAmount.toFixed(2)}
                  </span>
                </div>
                <Button className="w-full" size="lg" onClick={() => navigate('/checkout')}>
                  去结账
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-lg max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要从购物车中移除「{deleteTarget?.name}」吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
