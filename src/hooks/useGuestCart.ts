import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface GuestCartItem {
  id: string; // unique key for cart line
  product_id: string;
  quantity: number;
  selected_options: Record<string, string> | null;
  product: {
    id: string;
    name: string;
    price: number;
    selling_price?: number | null;
    currency: string;
    image_url: string | null;
    quantity: number;
    weight_kg: number;
  };
}

const STORAGE_KEY = 'guest_cart';

function readCart(): { id: string; product_id: string; quantity: number; selected_options?: Record<string, string> }[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Migrate old format (no id field)
    return parsed.map((item: any) => ({
      ...item,
      id: item.id || item.product_id,
    }));
  } catch {
    return [];
  }
}

function writeCart(items: { id: string; product_id: string; quantity: number; selected_options?: Record<string, string> }[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function clearGuestCartStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function useGuestCart() {
  const { toast } = useToast();
  const [rawItems, setRawItems] = useState<{ id: string; product_id: string; quantity: number; selected_options?: Record<string, string> }[]>([]);
  const [products, setProducts] = useState<Map<string, GuestCartItem['product']>>(new Map());

  // Load from localStorage on mount
  useEffect(() => {
    setRawItems(readCart());
  }, []);

  // Fetch product details for items in cart
  useEffect(() => {
    if (rawItems.length === 0) return;
    const ids = rawItems.map(i => i.product_id);
    import('@/integrations/supabase/client').then(({ supabase }) => {
      supabase
        .from('products')
        .select('id, name, price, selling_price, currency, image_url, quantity, weight_kg')
        .in('id', ids)
        .then(({ data }) => {
          if (data) {
            const map = new Map<string, GuestCartItem['product']>();
            data.forEach(p => map.set(p.id, p as GuestCartItem['product']));
            setProducts(map);
          }
        });
    });
  }, [rawItems]);

  const cartItems: GuestCartItem[] = rawItems
    .filter(i => products.has(i.product_id))
    .map(i => ({
      id: i.id,
      product_id: i.product_id,
      quantity: i.quantity,
      selected_options: i.selected_options || null,
      product: products.get(i.product_id)!,
    }));

  const addToCart = useCallback((productId: string, qty = 1, productData?: GuestCartItem['product'], selectedOptions?: any) => {
    setRawItems(prev => {
      let next: typeof prev;
      if (selectedOptions && Object.keys(selectedOptions).length > 0) {
        // Always add as new line when options exist
        const lineId = `${productId}_${Date.now()}`;
        next = [...prev, { id: lineId, product_id: productId, quantity: qty, selected_options: selectedOptions }];
      } else {
        const existing = prev.find(i => i.product_id === productId && (!i.selected_options || Object.keys(i.selected_options).length === 0));
        if (existing) {
          next = prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + qty } : i);
        } else {
          next = [...prev, { id: productId, product_id: productId, quantity: qty }];
        }
      }
      writeCart(next);
      return next;
    });
    if (productData) {
      setProducts(prev => {
        const next = new Map(prev);
        next.set(productId, productData);
        return next;
      });
    }
    toast({ title: '已加入购物车' });
  }, [toast]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setRawItems(prev => {
      let next: typeof prev;
      if (quantity <= 0) {
        next = prev.filter(i => i.id !== itemId);
      } else {
        next = prev.map(i => i.id === itemId ? { ...i, quantity } : i);
      }
      writeCart(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setRawItems(prev => {
      const next = prev.filter(i => i.id !== itemId);
      writeCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setRawItems([]);
    clearGuestCartStorage();
  }, []);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cartItems.reduce((sum, i) => {
    const effectivePrice = i.product?.selling_price != null ? Number(i.product.selling_price) : Number(i.product?.price || 0);
    return sum + i.quantity * effectivePrice;
  }, 0);

  return {
    cartItems,
    isLoading: false,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalAmount,
  };
}
