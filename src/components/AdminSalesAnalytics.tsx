import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Order } from '@/hooks/useOrders';
import { MembershipOrder } from '@/hooks/useMembershipOrders';
import { DollarSign, TrendingUp, ShoppingBag, Crown, CalendarIcon, Users } from 'lucide-react';
import { format, startOfDay, isAfter, isBefore, parseISO, subDays, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type Period = 'daily' | 'monthly' | 'quarterly' | 'yearly';

interface ReferralIncome {
  id: string;
  amount: number;
  tier: string;
  created_at: string;
}

function groupByPeriod<T extends { created_at: string }>(items: T[], period: Period, amountFn: (item: T) => number) {
  const map = new Map<string, number>();
  items.forEach(item => {
    const date = parseISO(item.created_at);
    let key: string;
    switch (period) {
      case 'daily': key = format(date, 'yyyy-MM-dd'); break;
      case 'monthly': key = format(date, 'yyyy-MM'); break;
      case 'quarterly': key = `${format(date, 'yyyy')}-Q${Math.ceil((date.getMonth() + 1) / 3)}`; break;
      case 'yearly': key = format(date, 'yyyy'); break;
    }
    map.set(key, (map.get(key) || 0) + amountFn(item));
  });
  return Array.from(map.entries())
    .map(([label, amount]) => ({ label, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

interface Props {
  orders: Order[];
  membershipOrders: MembershipOrder[];
}

export default function AdminSalesAnalytics({ orders, membershipOrders }: Props) {
  const [period, setPeriod] = useState<Period>('daily');
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date>(new Date());

  const { data: referralIncomeData = [] } = useQuery({
    queryKey: ['admin-referral-income'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_income')
        .select('id, amount, tier, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ReferralIncome[];
    },
  });

  const filteredOrders = useMemo(() =>
    orders.filter(o => {
      const d = parseISO(o.created_at);
      return isAfter(d, startOfDay(dateFrom)) && isBefore(d, endOfDay(dateTo)) && o.status !== 'cancelled';
    }),
    [orders, dateFrom, dateTo]
  );

  const approvedMembership = useMemo(() =>
    membershipOrders.filter(o => {
      const d = parseISO(o.created_at);
      return isAfter(d, startOfDay(dateFrom)) && isBefore(d, endOfDay(dateTo)) && o.status === 'approved';
    }),
    [membershipOrders, dateFrom, dateTo]
  );

  const filteredReferralIncome = useMemo(() =>
    referralIncomeData.filter(r => {
      const d = parseISO(r.created_at);
      return isAfter(d, startOfDay(dateFrom)) && isBefore(d, endOfDay(dateTo));
    }),
    [referralIncomeData, dateFrom, dateTo]
  );

  const storeSales = useMemo(() => filteredOrders.reduce((s, o) => s + Number(o.total_amount), 0), [filteredOrders]);
  const membershipSales = useMemo(() => approvedMembership.reduce((s, o) => s + Number(o.amount), 0), [approvedMembership]);
  const referralSales = useMemo(() => filteredReferralIncome.reduce((s, r) => s + Number(r.amount), 0), [filteredReferralIncome]);
  const totalSales = storeSales + membershipSales + referralSales;

  const todayStart = startOfDay(new Date());
  const todayStoreSales = orders.filter(o => isAfter(parseISO(o.created_at), todayStart) && o.status !== 'cancelled').reduce((s, o) => s + Number(o.total_amount), 0);
  const todayMemberSales = membershipOrders.filter(o => isAfter(parseISO(o.created_at), todayStart) && o.status === 'approved').reduce((s, o) => s + Number(o.amount), 0);
  const todayReferralSales = referralIncomeData.filter(r => isAfter(parseISO(r.created_at), todayStart)).reduce((s, r) => s + Number(r.amount), 0);

  const overallData = useMemo(() => {
    const storeMap = new Map<string, number>();
    const memberMap = new Map<string, number>();
    const referralMap = new Map<string, number>();
    groupByPeriod(filteredOrders, period, o => Number(o.total_amount)).forEach(d => storeMap.set(d.label, d.amount));
    groupByPeriod(approvedMembership, period, o => Number(o.amount)).forEach(d => memberMap.set(d.label, d.amount));
    groupByPeriod(filteredReferralIncome, period, r => Number(r.amount)).forEach(d => referralMap.set(d.label, d.amount));
    const allKeys = new Set([...storeMap.keys(), ...memberMap.keys(), ...referralMap.keys()]);
    return Array.from(allKeys).sort().map(label => ({
      label,
      store: storeMap.get(label) || 0,
      membership: memberMap.get(label) || 0,
      referral: referralMap.get(label) || 0,
      total: (storeMap.get(label) || 0) + (memberMap.get(label) || 0) + (referralMap.get(label) || 0),
    }));
  }, [filteredOrders, approvedMembership, filteredReferralIncome, period]);

  const storeData = useMemo(() => groupByPeriod(filteredOrders, period, o => Number(o.total_amount)), [filteredOrders, period]);
  const membershipData = useMemo(() => groupByPeriod(approvedMembership, period, o => Number(o.amount)), [approvedMembership, period]);
  const referralData = useMemo(() => groupByPeriod(filteredReferralIncome, period, r => Number(r.amount)), [filteredReferralIncome, period]);

  const productData = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach(o => {
      o.order_items?.forEach(item => {
        const key = item.product_name;
        map.set(key, (map.get(key) || 0) + item.quantity * Number(item.unit_price));
      });
    });
    return Array.from(map.entries())
      .map(([label, amount]) => ({ label, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filteredOrders]);

  const periodLabel = { daily: '日', monthly: '月', quarterly: '季度', yearly: '年' }[period];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">今日销售</span>
            </div>
            <p className="text-xl font-bold text-primary">MYR {(todayStoreSales + todayMemberSales + todayReferralSales).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">商品销售</span>
            </div>
            <p className="text-xl font-bold">MYR {storeSales.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">会员收入</span>
            </div>
            <p className="text-xl font-bold">MYR {membershipSales.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Referral 收入</span>
            </div>
            <p className="text-xl font-bold">MYR {referralSales.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">总销售额</span>
            </div>
            <p className="text-xl font-bold text-primary">MYR {totalSales.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Range + Period Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-1 h-4 w-4" />
              {format(dateFrom, 'yyyy-MM-dd')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateFrom} onSelect={d => d && setDateFrom(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>
        <span className="text-sm text-muted-foreground">至</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-1 h-4 w-4" />
              {format(dateTo, 'yyyy-MM-dd')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateTo} onSelect={d => d && setDateTo(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>
        <Select value={period} onValueChange={v => setPeriod(v as Period)}>
          <SelectTrigger className="w-24 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">按日</SelectItem>
            <SelectItem value="monthly">按月</SelectItem>
            <SelectItem value="quarterly">按季度</SelectItem>
            <SelectItem value="yearly">按年</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overall">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="overall">综合</TabsTrigger>
          <TabsTrigger value="store">商品</TabsTrigger>
          <TabsTrigger value="membership">会员</TabsTrigger>
          <TabsTrigger value="referral">Referral</TabsTrigger>
          <TabsTrigger value="products">排行</TabsTrigger>
        </TabsList>

        <TabsContent value="overall">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">综合销售趋势 ({periodLabel})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overallData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number) => `MYR ${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="store" name="商品" fill="hsl(var(--primary))" stackId="a" />
                    <Bar dataKey="membership" name="会员" fill="hsl(var(--accent))" stackId="a" />
                    <Bar dataKey="referral" name="Referral" fill="hsl(142 76% 36%)" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">商品销售趋势 ({periodLabel})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={storeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number) => `MYR ${value.toFixed(2)}`} />
                    <Line type="monotone" dataKey="amount" name="销售额" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="membership">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">会员购买趋势 ({periodLabel})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={membershipData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number) => `MYR ${value.toFixed(2)}`} />
                    <Line type="monotone" dataKey="amount" name="会员收入" stroke="hsl(var(--accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referral">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Referral 收入趋势 ({periodLabel})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={referralData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number) => `MYR ${value.toFixed(2)}`} />
                    <Line type="monotone" dataKey="amount" name="Referral 收入" stroke="hsl(142 76% 36%)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">商品销售排行</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip formatter={(value: number) => `MYR ${value.toFixed(2)}`} />
                    <Bar dataKey="amount" name="销售额" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
