import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Users, Star, Crown, Gem, Loader2, Copy, Check, DollarSign, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

const REFERRAL_TIERS = [
  { key: 'member', label: '会员', icon: Users, color: 'bg-green-500 text-white' },
  { key: 'promoter', label: '推广会员', icon: Star, color: 'bg-blue-500 text-white' },
  { key: 'super_promoter', label: '超级推广会员', icon: Crown, color: 'bg-purple-500 text-white' },
  { key: 'starlight', label: '星光', icon: Gem, color: 'bg-amber-500 text-white' },
  { key: 'king', label: '王者', icon: Crown, color: 'bg-red-500 text-white' },
] as const;

interface Referee {
  id: string;
  display_name: string | null;
  email: string | null;
  created_at: string;
}

interface Application {
  id: string;
  requested_tier: string;
  status: string;
  notes: string | null;
  created_at: string;
}

interface Commission {
  id: string;
  commission_amount: number;
  currency: string;
  status: string;
  source_type: string;
  notes: string | null;
  created_at: string;
}

interface Payout {
  id: string;
  amount: number;
  currency: string;
  notes: string | null;
  created_at: string;
}

export default function ReferralProgram() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referralTier, setReferralTier] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('member');
  const [applying, setApplying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('referral_tier, referral_code')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setReferralTier((profileData as any).referral_tier);
        setReferralCode(profileData.referral_code || '');
      }

      const { data: appData } = await supabase
        .from('referral_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (appData) setApplications(appData as any);

      if ((profileData as any)?.referral_tier) {
        const [refResult, commResult, payResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, display_name, email, created_at')
            .eq('referred_by', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('referral_commissions')
            .select('*')
            .eq('referrer_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('referral_payouts')
            .select('*')
            .eq('referrer_id', user.id)
            .order('created_at', { ascending: false }),
        ]);
        
        if (refResult.data) setReferees(refResult.data as any);
        if (commResult.data) setCommissions(commResult.data as any);
        if (payResult.data) setPayouts(payResult.data as any);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) return;
    setApplying(true);
    try {
      const { error } = await supabase
        .from('referral_applications')
        .insert({
          user_id: user.id,
          requested_tier: selectedTier,
        } as any);

      if (error) throw error;
      toast.success('申请已提交，等待审核');
      fetchData();
    } catch (err: any) {
      toast.error('申请失败: ' + err.message);
    } finally {
      setApplying(false);
    }
  };

  const handleCopyLink = async () => {
    const link = `https://www.theglobalattract.com/create-account?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('推荐链接已复制');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  const hasPendingApplication = applications.some(a => a.status === 'pending');
  const latestApplication = applications[0];
  const isApproved = !!referralTier;
  const currentTierConfig = REFERRAL_TIERS.find(t => t.key === referralTier);

  const totalEarned = commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0);
  const totalPaid = payouts.reduce((sum, p) => sum + Number(p.amount), 0);
  const balance = totalEarned - totalPaid;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center p-4 gap-3">
          <button onClick={() => navigate('/profile')} className="p-1">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">Referral Program</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Status */}
        {isApproved && currentTierConfig && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-full", currentTierConfig.color)}>
                  <currentTierConfig.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">当前等级</p>
                  <p className="font-semibold">{currentTierConfig.label}</p>
                </div>
              </div>

              {/* Referral Link */}
              <div className="space-y-2">
                <p className="text-sm font-medium">我的推荐链接</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted rounded-lg p-2.5 text-xs text-muted-foreground truncate">
                    https://www.theglobalattract.com/create-account?ref={referralCode}
                  </div>
                  <Button size="sm" variant="outline" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>已推荐 <strong>{referees.length}</strong> 人</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Earnings Summary */}
        {isApproved && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">收益概览</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-green-500/10 rounded-xl">
                  <DollarSign className="h-4 w-4 mx-auto mb-1 text-green-600" />
                  <p className="text-xs text-muted-foreground">总佣金</p>
                  <p className="text-sm font-bold text-green-600">RM {totalEarned.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 bg-blue-500/10 rounded-xl">
                  <Wallet className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-muted-foreground">已支付</p>
                  <p className="text-sm font-bold text-blue-600">RM {totalPaid.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 bg-amber-500/10 rounded-xl">
                  <DollarSign className="h-4 w-4 mx-auto mb-1 text-amber-600" />
                  <p className="text-xs text-muted-foreground">待支付</p>
                  <p className="text-sm font-bold text-amber-600">RM {balance.toFixed(2)}</p>
                </div>
              </div>

              {/* Commission History */}
              {commissions.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">佣金记录</p>
                  {commissions.map(c => (
                    <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0 text-xs">
                      <div>
                        <span>{c.source_type === 'membership_order' ? '会员订阅' : c.source_type === 'order' ? '商品订单' : c.source_type}</span>
                        {c.notes && <span className="text-muted-foreground ml-1">· {c.notes}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-green-600">+RM {Number(c.commission_amount).toFixed(2)}</span>
                        <Badge variant={c.status === 'paid' ? 'default' : 'secondary'} className="text-[10px]">
                          {c.status === 'paid' ? '已结' : '待结'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Payout History */}
              {payouts.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">支付记录</p>
                  {payouts.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0 text-xs">
                      <div>
                        <span>{format(new Date(p.created_at), 'yyyy-MM-dd')}</span>
                        {p.notes && <span className="text-muted-foreground ml-1">· {p.notes}</span>}
                      </div>
                      <span className="font-medium text-blue-600">RM {Number(p.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {commissions.length === 0 && payouts.length === 0 && (
                <p className="text-center text-xs text-muted-foreground mt-4">暂无收益记录</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Referees List */}
        {isApproved && referees.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">推荐记录</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {referees.map(ref => (
                <div key={ref.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{ref.display_name || ref.email || '用户'}</p>
                    <p className="text-xs text-muted-foreground">{ref.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(ref.created_at), 'yyyy-MM-dd')}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {isApproved && referees.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              还没有推荐记录，分享你的推荐链接开始推广吧！
            </CardContent>
          </Card>
        )}

        {/* Apply Section (if not approved) */}
        {!isApproved && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">申请加入 Referral Program</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              {hasPendingApplication ? (
                <div className="text-center py-4">
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 mb-2">审核中</Badge>
                  <p className="text-sm text-muted-foreground">
                    您的申请正在审核中，请耐心等待
                  </p>
                  {latestApplication && (
                    <p className="text-xs text-muted-foreground mt-1">
                      申请等级: {REFERRAL_TIERS.find(t => t.key === latestApplication.requested_tier)?.label}
                      {' · '}
                      提交时间: {format(new Date(latestApplication.created_at), 'yyyy-MM-dd HH:mm')}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    选择您想要申请的推广等级：
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {REFERRAL_TIERS.map(tier => {
                      const priceMap: Record<string, string> = {
                        member: 'RM 3,000',
                        promoter: 'RM 6,000',
                        super_promoter: 'RM 12,000',
                        starlight: 'RM 30,000',
                        king: 'RM 60,000',
                      };
                      return (
                        <button
                          key={tier.key}
                          onClick={() => setSelectedTier(tier.key)}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all text-left",
                            selectedTier === tier.key
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/30"
                          )}
                        >
                          <tier.icon className={cn("h-5 w-5 mb-1", selectedTier === tier.key ? "text-primary" : "text-muted-foreground")} />
                          <p className="text-sm font-medium">{tier.label}</p>
                          <p className={cn("text-xs mt-0.5", selectedTier === tier.key ? "text-green-600 font-semibold" : "text-muted-foreground")}>{priceMap[tier.key]}</p>
                        </button>
                      );
                    })}
                  </div>



                  {/* Earning Breakdown */}
                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                    <p className="text-sm font-semibold">收益分成说明</p>
                    <p className="text-[11px] text-muted-foreground mb-1">以每 RM 1,000 推荐收入为例：</p>
                    <div className="space-y-1.5">
                      {[
                        { label: '会员（基础）', earning: 'RM 300', key: 'member' },
                        { label: '推广会员', earning: 'RM 400', key: 'promoter' },
                        { label: '超级推广会员', earning: 'RM 500', key: 'super_promoter' },
                        { label: '星光', earning: 'RM 600', key: 'starlight' },
                        { label: '王者', earning: '70% 佣金 + 30% 分红', key: 'king' },
                      ].map(item => (
                        <div
                          key={item.key}
                          className={cn(
                            "flex items-center justify-between text-xs py-1.5 px-2 rounded-lg",
                            selectedTier === item.key ? "bg-primary/10 font-semibold" : ""
                          )}
                        >
                          <span>{item.label}</span>
                          <span className="text-green-600 font-medium">{item.earning}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleApply} disabled={applying}>
                    {applying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    提交申请
                  </Button>
                </>
              )}

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
