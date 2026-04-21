import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ChevronDown, ChevronUp, Ticket, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { useGuestCart, clearGuestCartStorage } from '@/hooks/useGuestCart';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateCoupon, calculateDiscount, incrementCouponUsage, type Coupon } from '@/hooks/useCoupons';
import { formatSelectedOptions, hasSelectedOptions } from '@/utils/optionsDisplay';

const MALAYSIAN_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
  'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah',
  'Sarawak', 'Selangor', 'Terengganu', 'W.P. Kuala Lumpur',
  'W.P. Labuan', 'W.P. Putrajaya',
];

const EAST_MALAYSIA_STATES = ['Sabah', 'Sarawak', 'W.P. Labuan'];
const FREE_SHIPPING_THRESHOLD = 300;
const SEMENANJUNG_FLAT_RATE = 6;
const EAST_MY_FIRST_KG = 8;
const EAST_MY_ADDITIONAL_KG = 5;

function calculateShippingFee(state: string, totalWeight: number, subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  if (!state) return 0;
  if (EAST_MALAYSIA_STATES.includes(state)) {
    if (totalWeight <= 1) return EAST_MY_FIRST_KG;
    return EAST_MY_FIRST_KG + Math.ceil(totalWeight - 1) * EAST_MY_ADDITIONAL_KG;
  }
  return SEMENANJUNG_FLAT_RATE;
}

interface CheckoutForm {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  address2: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
  subscribeNews: boolean;
  remarks: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const authCart = useCart();
  const guestCartHook = useGuestCart();

  // Use auth cart or guest cart based on login status
  const cartItems = user ? authCart.cartItems : guestCartHook.cartItems;
  const totalAmount = user ? authCart.totalAmount : guestCartHook.totalAmount;
  const totalItems = user ? authCart.totalItems : guestCartHook.totalItems;

  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [form, setForm] = useState<CheckoutForm>({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    address2: '',
    postcode: '',
    city: '',
    state: '',
    country: 'Malaysia',
    subscribeNews: false,
    remarks: '',
  });

  // Pre-fill if logged in
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('email, phone_number, display_name, shipping_first_name, shipping_last_name, shipping_address, shipping_address2, shipping_city, shipping_state, shipping_postcode, shipping_country')
        .eq('id', user.id)
        .single();
      if (data) {
        setForm(prev => ({
          ...prev,
          email: data.email || prev.email,
          phone: data.phone_number || prev.phone,
          firstName: data.shipping_first_name || data.display_name || prev.firstName,
          lastName: data.shipping_last_name || prev.lastName,
          address: data.shipping_address || prev.address,
          address2: data.shipping_address2 || prev.address2,
          city: data.shipping_city || prev.city,
          state: data.shipping_state || prev.state,
          postcode: data.shipping_postcode || prev.postcode,
          country: data.shipping_country || 'Malaysia',
        }));
      }
    };
    fetchProfile();
  }, [user]);

  const updateField = (field: keyof CheckoutForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.phone.trim()) {
      toast({ title: '请填写电话号码', description: '电话号码为必填项', variant: 'destructive' });
      return;
    }
    if (!form.address.trim()) {
      toast({ title: '请填写配送地址', description: '地址为必填项', variant: 'destructive' });
      return;
    }
    if (!form.email || !form.lastName || !form.postcode || !form.city || !form.state) {
      toast({ title: '请填写所有必填信息', variant: 'destructive' });
      return;
    }
    if (cartItems.length === 0) {
      toast({ title: '购物车为空', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      if (!user) {
        // Guest checkout - clear local cart and show success
        guestCartHook.clearCart();
        toast({ title: '订单已提交', description: '请通过邮件确认订单详情' });
        navigate('/store');
        return;
      }

      // Create order with shipping info in notes
      const shippingInfo = `${form.firstName} ${form.lastName}\n${form.address}\n${form.address2 ? form.address2 + '\n' : ''}${form.postcode} ${form.city}, ${form.state}\n${form.country}\nEmail: ${form.email}\nPhone: ${form.phone}\nShipping: ${currency} ${shippingFee.toFixed(2)} (${totalWeight.toFixed(1)}kg)${appliedCoupon ? '\nCoupon: ' + appliedCoupon.code + ' (-' + currency + ' ' + couponDiscount.toFixed(2) + ')' : ''}${form.remarks.trim() ? '\nRemarks: ' + form.remarks.trim() : ''}`;

      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: grandTotal,
          currency: cartItems[0]?.product?.currency || 'MYR',
          status: 'pending',
          notes: shippingInfo,
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      const orderItems = cartItems.map(item => {
        const effectivePrice = item.product?.selling_price != null ? Number(item.product.selling_price) : Number(item.product?.price || 0);
        return {
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product?.name || '',
          quantity: item.quantity,
          unit_price: effectivePrice,
          selected_options: (item as any).selected_options || {},
        };
      });

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      // Reduce stock for each product (and variant if applicable)
      for (const item of cartItems) {
        await supabase.rpc('decrement_stock' as any, { p_product_id: item.product_id, p_quantity: item.quantity });
        
        // Try to decrement matching variant stock
        const opts = (item as any).selected_options;
        if (opts && typeof opts === 'object' && !Array.isArray(opts) && Object.keys(opts).length > 0) {
          // Find matching variant by option_values
          const { data: matchingVariants } = await (supabase
            .from('product_variants' as any)
            .select('id, option_values')
            .eq('product_id', item.product_id)) as any;
          if (matchingVariants) {
            const match = matchingVariants.find((v: any) => {
              const vOpts = v.option_values as Record<string, string>;
              return Object.keys(opts).every((k: string) => vOpts[k] === opts[k]);
            });
            if (match) {
              await supabase.rpc('decrement_variant_stock' as any, { p_variant_id: match.id, p_quantity: item.quantity });
            }
          }
        }
      }

      // Save shipping address to profile
      await supabase.from('profiles').update({
        shipping_first_name: form.firstName,
        shipping_last_name: form.lastName,
        shipping_address: form.address,
        shipping_address2: form.address2,
        shipping_city: form.city,
        shipping_state: form.state,
        shipping_postcode: form.postcode,
        shipping_country: form.country,
      }).eq('id', user.id);

      // Increment coupon usage if applied
      if (appliedCoupon) {
        await incrementCouponUsage(appliedCoupon.id);
      }

      await authCart.clearCart.mutateAsync();
      toast({ title: '订单已提交', description: '订单编号: ' + order.id.slice(0, 8) });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: '下单失败', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const currency = cartItems[0]?.product?.currency || 'MYR';
  const totalWeight = cartItems.reduce((sum, i) => sum + (Number(i.product?.weight_kg) || 1) * i.quantity, 0);
  const shippingFee = useMemo(() => calculateShippingFee(form.state, totalWeight, totalAmount), [form.state, totalWeight, totalAmount]);
  const couponDiscount = appliedCoupon ? calculateDiscount(appliedCoupon, totalAmount) : 0;
  const grandTotal = totalAmount - couponDiscount + shippingFee;
  const isFreeShipping = totalAmount >= FREE_SHIPPING_THRESHOLD;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    const result = await validateCoupon(couponCode, totalAmount);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponCode('');
    } else {
      setCouponError(result.error || '优惠券无效');
    }
    setValidatingCoupon(false);
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Order Summary Bar */}
      <div className="sticky top-0 z-40 bg-muted/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-3 max-w-lg">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => setOrderSummaryOpen(!orderSummaryOpen)}
          >
            <div className="flex items-center gap-2 text-primary">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-sm font-medium">
                {orderSummaryOpen ? '隐藏' : '查看'}订单摘要
              </span>
              {orderSummaryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
            <span className="font-bold text-lg">{currency} {grandTotal.toFixed(2)}</span>
          </button>

          {orderSummaryOpen && (
            <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
              {cartItems.map(item => {
                const opts = (item as any).selected_options;
                const hasOpts = hasSelectedOptions(opts);
                return (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded bg-background border border-border/50 flex items-center justify-center overflow-hidden relative">
                      {item.product?.image_url ? (
                        <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className='flex flex-col gap-1'>
                      <span className="line-clamp-1">{item.product?.name}</span>
                      {hasOpts && (
                        <span className="text-[11px] text-muted-foreground line-clamp-2">
                          {formatSelectedOptions(opts)}
                        </span>
                      )}
                      <span className='text-xs text-muted-foreground'>数量: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="text-muted-foreground shrink-0">{currency} {((item.product?.selling_price != null ? Number(item.product.selling_price) : Number(item.product?.price || 0)) * item.quantity).toFixed(2)}</span>
                </div>
                );
              })}
              <div className="flex justify-between text-sm pt-2 border-t border-border/30">
                <span>小计 ({totalItems} 件)</span>
                <span>{currency} {totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>运费 {totalWeight > 0 && `(${totalWeight.toFixed(1)}kg)`}</span>
                {isFreeShipping ? (
                  <span className="text-green-600 font-medium">免运费</span>
                ) : form.state ? (
                  <span>{currency} {shippingFee.toFixed(2)}</span>
                ) : (
                  <span className="text-muted-foreground">请选择州/省</span>
                )}
              </div>
              {!isFreeShipping && totalAmount > 0 && (
                <p className="text-[11px] text-muted-foreground">满 RM{FREE_SHIPPING_THRESHOLD} 免运费，还差 RM{(FREE_SHIPPING_THRESHOLD - totalAmount).toFixed(2)}</p>
              )}
              <div className="flex justify-between font-bold pt-1 border-t border-border/30">
                <span>总计</span>
                <span>{currency} {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-3 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">结账</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-lg pb-10 space-y-6">
        {/* Contact Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">联系方式</h2>
            {!user && (
              <Button variant="link" className="text-sm p-0 h-auto" onClick={() => navigate('/login')}>
                登录
              </Button>
            )}
          </div>
          <div className="space-y-3">
            <Input
              placeholder="电子邮件或手机号码"
              value={form.email}
              onChange={e => updateField('email', e.target.value)}
            />
            <Input
              placeholder="电话号码 *"
              value={form.phone}
              onChange={e => updateField('phone', e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="subscribe"
                checked={form.subscribeNews}
                onCheckedChange={v => updateField('subscribeNews', !!v)}
              />
              <Label htmlFor="subscribe" className="text-sm text-muted-foreground cursor-pointer">
                接收最新资讯和优惠
              </Label>
            </div>
          </div>
        </div>

        {/* Delivery Section */}
        <div>
          <h2 className="text-lg font-bold mb-3">配送地址</h2>
          <div className="space-y-3">
            <div>
              <Select value={form.country} onValueChange={v => updateField('country', v)}>
                <SelectTrigger>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-muted-foreground">国家/地区</span>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Malaysia">Malaysia</SelectItem>
                  <SelectItem value="Singapore">Singapore</SelectItem>
                  <SelectItem value="Indonesia">Indonesia</SelectItem>
                  <SelectItem value="Thailand">Thailand</SelectItem>
                  <SelectItem value="China">China</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="名 (选填)"
                value={form.firstName}
                onChange={e => updateField('firstName', e.target.value)}
              />
              <Input
                placeholder="姓"
                value={form.lastName}
                onChange={e => updateField('lastName', e.target.value)}
              />
            </div>

            <Input
              placeholder="地址 *"
              value={form.address}
              onChange={e => updateField('address', e.target.value)}
            />
            <Input
              placeholder="公寓、门牌号等 (选填)"
              value={form.address2}
              onChange={e => updateField('address2', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="邮编"
                value={form.postcode}
                onChange={e => updateField('postcode', e.target.value)}
              />
              <Input
                placeholder="城市"
                value={form.city}
                onChange={e => updateField('city', e.target.value)}
              />
            </div>

            <Select value={form.state} onValueChange={v => updateField('state', v)}>
              <SelectTrigger>
                <SelectValue placeholder="州/省" />
              </SelectTrigger>
              <SelectContent>
                {MALAYSIAN_STATES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <h2 className="text-lg font-bold mb-3">备注 (选填)</h2>
          <Textarea
            placeholder="如有特殊要求，请在此填写..."
            value={form.remarks}
            onChange={e => updateField('remarks', e.target.value)}
            rows={3}
          />
        </div>

        {/* Coupon */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Ticket className="h-5 w-5" /> 优惠券
          </h2>
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div>
                <span className="font-mono font-bold text-sm">{appliedCoupon.code}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}% 折扣` : `减 ${currency} ${appliedCoupon.discount_value}`}
                  {' · '}节省 {currency} {couponDiscount.toFixed(2)}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAppliedCoupon(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="输入优惠码"
                value={couponCode}
                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
              />
              <Button variant="outline" size="sm" disabled={!couponCode.trim() || validatingCoupon} onClick={handleApplyCoupon}>
                {validatingCoupon ? '验证中...' : '使用'}
              </Button>
            </div>
          )}
          {couponError && <p className="text-xs text-destructive mt-1">{couponError}</p>}
        </div>

        {/* Shipping Info */}
        <div className="bg-muted/50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">小计</span>
            <span>{currency} {totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">运费 {EAST_MALAYSIA_STATES.includes(form.state) ? '(东马)' : form.state ? '(西马)' : ''}</span>
            {isFreeShipping ? (
              <span className="text-green-600 font-medium">免运费 </span>
            ) : form.state ? (
              <span>{currency} {shippingFee.toFixed(2)}</span>
            ) : (
              <span className="text-muted-foreground text-xs">请先选择州</span>
            )}
          </div>
          {!isFreeShipping && totalAmount > 0 && (
            <p className="text-[11px] text-muted-foreground">满 RM{FREE_SHIPPING_THRESHOLD} 免运费</p>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-sm text-primary">
              <span>优惠券折扣</span>
              <span>-{currency} {couponDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-2 border-t border-border/50">
            <span>总计</span>
            <span className="text-lg">{currency} {grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit */}
        <Button className="w-full" size="lg" disabled={submitting} onClick={handleSubmit}>
          {submitting ? '提交中...' : `提交订单 · ${currency} ${grandTotal.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
