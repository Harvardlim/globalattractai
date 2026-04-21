import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, BarChart3, Crown, Shield, Globe, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useMembershipOrders } from '@/hooks/useMembershipOrders';
import { useAuth } from '@/contexts/AuthContext';
import AdminSalesAnalytics from '@/components/AdminSalesAnalytics';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { products } = useProducts(true);
  const { orders } = useOrders(true);
  const { membershipOrders } = useMembershipOrders(true);
  const { isSuperAdmin, profile } = useAuth();
  const adminSource = (profile?.source || 'public').trim();

  // Fetch all profiles to map user_id -> source
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['admin-profiles-source-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, source');
      if (error) throw error;
      return data || [];
    },
  });

  const userSourceMap = useMemo(() => {
    const map = new Map<string, string>();
    allProfiles.forEach(p => map.set(p.id, (p.source || 'public').trim()));
    return map;
  }, [allProfiles]);

  const filteredOrders = useMemo(() => {
    if (isSuperAdmin) return orders;
    return orders.filter(o => userSourceMap.get(o.user_id) === adminSource);
  }, [orders, isSuperAdmin, userSourceMap, adminSource]);

  const filteredMembershipOrders = useMemo(() => {
    if (isSuperAdmin) return membershipOrders;
    return membershipOrders.filter(o => userSourceMap.get(o.user_id) === adminSource);
  }, [membershipOrders, isSuperAdmin, userSourceMap, adminSource]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold flex-1">管理后台</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Navigation */}
        <div className="flex flex-row overflow-x-auto gap-3">
          <Button variant="outline" className="p-4 gap-1.5" onClick={() => navigate('/admin/products')}>
            <Package className="h-5 w-5" />
            <span>商品 & 分类</span>
          </Button>
          <Button variant="outline" className="p-4 gap-1.5" onClick={() => navigate('/admin/orders')}>
            <BarChart3 className="h-5 w-5" />
            <span>订单管理</span>
          </Button>
          {/* <Button variant="outline" className="p-4 gap-1.5" onClick={() => navigate('/admin/referrals')}>
            <Users className="h-5 w-5" />
            <span>推广管理</span>
          </Button> */}
        </div>

        {/* Sales Analytics */}
        <AdminSalesAnalytics orders={filteredOrders} membershipOrders={filteredMembershipOrders} />

      </div>
    </div>
  );
}
