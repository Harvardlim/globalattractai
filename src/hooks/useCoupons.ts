import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useCoupons() {
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as Coupon[];
    },
  });

  const createCoupon = useMutation({
    mutationFn: async (coupon: Partial<Coupon> & { code: string; discount_value: number }) => {
      const { data, error } = await supabase.from('coupons').insert(coupon as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  const updateCoupon = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Coupon> & { id: string }) => {
      const { data, error } = await supabase.from('coupons').update(updates as any).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  return { coupons, isLoading, createCoupon, updateCoupon, deleteCoupon };
}

/** Validate a coupon code against the current order */
export async function validateCoupon(code: string, orderAmount: number): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .single();

  if (error || !data) return { valid: false, error: '优惠券不存在或已失效' };

  const coupon = data as unknown as Coupon;
  const now = new Date();

  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, error: '优惠券尚未生效' };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, error: '优惠券已过期' };
  }
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return { valid: false, error: '优惠券已达使用上限' };
  }
  if (orderAmount < coupon.min_order_amount) {
    return { valid: false, error: `订单金额需满 ${coupon.min_order_amount} 才可使用` };
  }

  // Check per-user usage
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: usage } = await supabase
      .from('coupon_usages' as any)
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (usage) {
      return { valid: false, error: '您已使用过此优惠券' };
    }
  }

  return { valid: true, coupon };
}

/** Calculate discount amount */
export function calculateDiscount(coupon: Coupon, orderAmount: number): number {
  if (coupon.discount_type === 'percentage') {
    return Math.round(orderAmount * coupon.discount_value / 100 * 100) / 100;
  }
  return Math.min(coupon.discount_value, orderAmount);
}

/** Increment coupon used_count and record per-user usage */
export async function incrementCouponUsage(couponId: string) {
  await supabase.rpc('increment_coupon_usage' as any, { p_coupon_id: couponId });
  // Record per-user usage
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('coupon_usages' as any).insert({ coupon_id: couponId, user_id: user.id });
  }
}
