import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Users, Star, Crown, Gem, Loader2, Check, X, ChevronDown, ChevronUp, DollarSign, Plus, Wallet, Trash2, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const REFERRAL_TIERS = [
  { key: 'member', label: '会员', icon: Users, color: 'bg-green-500 text-white' },
  { key: 'promoter', label: '推广会员', icon: Star, color: 'bg-blue-500 text-white' },
  { key: 'super_promoter', label: '超级推广会员', icon: Crown, color: 'bg-purple-500 text-white' },
  { key: 'starlight', label: '星光', icon: Gem, color: 'bg-amber-500 text-white' },
  { key: 'king', label: '王者', icon: Crown, color: 'bg-red-500 text-white' },
] as const;

interface Application {
  id: string;
  user_id: string;
  requested_tier: string;
  status: string;
  notes: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface ReferralMember {
  id: string;
  display_name: string | null;
  email: string | null;
  referral_tier: string;
  referral_code: string;
  referee_count: number;
  total_earned: number;
  total_paid: number;
  referees: { id: string; display_name: string | null; email: string | null; created_at: string }[];
}

const TIER_PRICES: Record<string, number> = {
  member: 3000,
  promoter: 6000,
  super_promoter: 12000,
  starlight: 30000,
  king: 60000,
};

export default function AdminReferrals() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'applications' | 'members'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [members, setMembers] = useState<ReferralMember[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // Commission dialog
  const [commissionDialog, setCommissionDialog] = useState<{ open: boolean; memberId: string; memberName: string }>({ open: false, memberId: '', memberName: '' });
  const [commAmount, setCommAmount] = useState('');
  const [commNotes, setCommNotes] = useState('');
  const [commSourceType, setCommSourceType] = useState('manual');
  const [submittingComm, setSubmittingComm] = useState(false);

  // Payout dialog
  const [payoutDialog, setPayoutDialog] = useState<{ open: boolean; memberId: string; memberName: string }>({ open: false, memberId: '', memberName: '' });
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [pendingTierChanges, setPendingTierChanges] = useState<Record<string, string>>({});
  const [savingTier, setSavingTier] = useState<string | null>(null);
  const [submittingPay, setSubmittingPay] = useState(false);

  const [removingMember, setRemovingMember] = useState<{ id: string; name: string } | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberTierFilter, setMemberTierFilter] = useState<string>('all');

  // Add member dialog
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [addMemberResults, setAddMemberResults] = useState<{ id: string; display_name: string | null; email: string | null; referral_tier: string | null }[]>([]);
  const [addMemberSearching, setAddMemberSearching] = useState(false);
  const [addMemberSelected, setAddMemberSelected] = useState<string | null>(null);
  const [addMemberTier, setAddMemberTier] = useState('member');
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch applications
      const { data: appData } = await supabase
        .from('referral_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appData) {
        const userIds = [...new Set(appData.map(a => a.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, display_name')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        setApplications(appData.map(a => ({
          ...a,
          user_email: profileMap.get(a.user_id)?.email || '',
          user_name: profileMap.get(a.user_id)?.display_name || '',
        })));
      }

      // Fetch members with referral_tier
      const { data: memberData } = await supabase
        .from('profiles')
        .select('id, display_name, email, referral_tier, referral_code')
        .not('referral_tier', 'is', null)
        .order('referral_tier');

      if (memberData) {
        const memberIds = memberData.map(m => m.id);
        
        const [refResult, commResult, payResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, display_name, email, referred_by, created_at')
            .in('referred_by', memberIds),
          supabase
            .from('referral_commissions')
            .select('referrer_id, commission_amount')
            .in('referrer_id', memberIds),
          supabase
            .from('referral_payouts')
            .select('referrer_id, amount')
            .in('referrer_id', memberIds),
        ]);

        const refereeMap = new Map<string, typeof refResult.data>();
        refResult.data?.forEach(r => {
          const key = (r as any).referred_by;
          if (!refereeMap.has(key)) refereeMap.set(key, []);
          refereeMap.get(key)!.push(r);
        });

        const commMap = new Map<string, number>();
        commResult.data?.forEach(c => {
          commMap.set(c.referrer_id, (commMap.get(c.referrer_id) || 0) + Number(c.commission_amount));
        });

        const payMap = new Map<string, number>();
        payResult.data?.forEach(p => {
          payMap.set(p.referrer_id, (payMap.get(p.referrer_id) || 0) + Number(p.amount));
        });

        setMembers(memberData.map(m => ({
          ...m,
          referral_tier: (m as any).referral_tier || '',
          referral_code: m.referral_code || '',
          referee_count: refereeMap.get(m.id)?.length || 0,
          total_earned: commMap.get(m.id) || 0,
          total_paid: payMap.get(m.id) || 0,
          referees: (refereeMap.get(m.id) || []).map(r => ({
            id: r.id,
            display_name: r.display_name,
            email: r.email,
            created_at: r.created_at,
          })),
        })));
      }

      // Fetch total referral income
      const { data: incomeData } = await supabase
        .from('referral_income')
        .select('amount');
      if (incomeData) {
        setTotalIncome(incomeData.reduce((sum: number, r: any) => sum + Number(r.amount), 0));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app: Application) => {
    setProcessing(app.id);
    try {
      await supabase
        .from('referral_applications')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() } as any)
        .eq('id', app.id);

      await supabase
        .from('profiles')
        .update({ referral_tier: app.requested_tier } as any)
        .eq('id', app.user_id);

      // Record referral income
      const amount = TIER_PRICES[app.requested_tier] || 0;
      if (amount > 0) {
        const tierLabel = REFERRAL_TIERS.find(t => t.key === app.requested_tier)?.label || app.requested_tier;
        await supabase
          .from('referral_income')
          .insert({
            application_id: app.id,
            user_id: app.user_id,
            tier: app.requested_tier,
            amount,
            notes: `${tierLabel}申请费`,
          } as any);
      }

      toast.success('已批准');
      fetchData();
    } catch (err: any) {
      toast.error('操作失败: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (app: Application) => {
    setProcessing(app.id);
    try {
      await supabase
        .from('referral_applications')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() } as any)
        .eq('id', app.id);

      toast.success('已拒绝');
      fetchData();
    } catch (err: any) {
      toast.error('操作失败: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleAddCommission = async () => {
    if (!commAmount || isNaN(Number(commAmount))) {
      toast.error('请输入有效金额');
      return;
    }
    setSubmittingComm(true);
    try {
      const { error } = await supabase
        .from('referral_commissions')
        .insert({
          referrer_id: commissionDialog.memberId,
          referee_id: commissionDialog.memberId,
          source_type: commSourceType,
          commission_amount: Number(commAmount),
          notes: commNotes || null,
        } as any);
      if (error) throw error;
      toast.success('佣金已添加');
      setCommissionDialog({ open: false, memberId: '', memberName: '' });
      setCommAmount('');
      setCommNotes('');
      fetchData();
    } catch (err: any) {
      toast.error('添加失败: ' + err.message);
    } finally {
      setSubmittingComm(false);
    }
  };

  const handleAddPayout = async () => {
    if (!payAmount || isNaN(Number(payAmount))) {
      toast.error('请输入有效金额');
      return;
    }
    setSubmittingPay(true);
    try {
      const { error } = await supabase
        .from('referral_payouts')
        .insert({
          referrer_id: payoutDialog.memberId,
          amount: Number(payAmount),
          notes: payNotes || null,
          paid_by: user?.id,
        } as any);
      if (error) throw error;
      toast.success('支付记录已添加');
      setPayoutDialog({ open: false, memberId: '', memberName: '' });
      setPayAmount('');
      setPayNotes('');
      fetchData();
    } catch (err: any) {
      toast.error('添加失败: ' + err.message);
    } finally {
      setSubmittingPay(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setProcessing(memberId);
    try {
      await supabase
        .from('profiles')
        .update({ referral_tier: null } as any)
        .eq('id', memberId);
      toast.success('已移除推广成员');
      setRemovingMember(null);
      fetchData();
    } catch (err: any) {
      toast.error('移除失败: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleSearchMembers = async (query: string) => {
    setAddMemberSearch(query);
    if (query.trim().length < 2) {
      setAddMemberResults([]);
      return;
    }
    setAddMemberSearching(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, email, referral_tier')
        .or(`display_name.ilike.%${query.trim()}%,email.ilike.%${query.trim()}%`)
        .limit(10);
      setAddMemberResults((data || []).map(d => ({ ...d, referral_tier: (d as any).referral_tier })));
    } catch (err) {
      console.error(err);
    } finally {
      setAddMemberSearching(false);
    }
  };

  const handleAddMemberToReferral = async () => {
    if (!addMemberSelected) return;
    setAddingMember(true);
    try {
      await supabase
        .from('profiles')
        .update({ referral_tier: addMemberTier } as any)
        .eq('id', addMemberSelected);

      // Record referral income
      const amount = TIER_PRICES[addMemberTier] || 0;
      if (amount > 0) {
        const tierLabel = REFERRAL_TIERS.find(t => t.key === addMemberTier)?.label || addMemberTier;
        await supabase
          .from('referral_income')
          .insert({
            user_id: addMemberSelected,
            tier: addMemberTier,
            amount,
            notes: `管理员手动添加 - ${tierLabel}`,
          } as any);
      }

      toast.success('已添加推广成员');
      setAddMemberOpen(false);
      setAddMemberSearch('');
      setAddMemberResults([]);
      setAddMemberSelected(null);
      setAddMemberTier('member');
      fetchData();
    } catch (err: any) {
      toast.error('添加失败: ' + err.message);
    } finally {
      setAddingMember(false);
    }
  };
  const filteredMembers = members.filter(m => {
    const searchLower = memberSearch.toLowerCase();
    const matchesSearch = !memberSearch || 
      (m.display_name || '').toLowerCase().includes(searchLower) || 
      (m.email || '').toLowerCase().includes(searchLower);
    const matchesTier = memberTierFilter === 'all' || m.referral_tier === memberTierFilter;
    return matchesSearch && matchesTier;
  });

  const pendingApps = applications.filter(a => a.status === 'pending');
  const processedApps = applications.filter(a => a.status !== 'pending');

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
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-1">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold">Referral Program 管理</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl space-y-4">
        {/* Income Summary */}
        {totalIncome > 0 && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Referral 总收入</p>
                <p className="text-lg font-bold text-green-600">RM {totalIncome.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 items-center">
          <Button variant={tab === 'applications' ? 'default' : 'outline'} size="sm" onClick={() => setTab('applications')}>
            申请审核 {pendingApps.length > 0 && <Badge className="ml-1 bg-destructive text-destructive-foreground px-1.5">{pendingApps.length}</Badge>}
          </Button>
          <Button variant={tab === 'members' ? 'default' : 'outline'} size="sm" onClick={() => setTab('members')}>
            推广成员 ({members.length})
          </Button>
          <div className="flex-1" />
          <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setAddMemberOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            添加成员
          </Button>
        </div>

        {/* Applications Tab */}
        {tab === 'applications' && (
          <div className="space-y-3">
            {pendingApps.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-muted-foreground">待审核</h2>
                {pendingApps.map(app => {
                  const tierConfig = REFERRAL_TIERS.find(t => t.key === app.requested_tier);
                  return (
                    <Card key={app.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{app.user_name || app.user_email}</p>
                            <p className="text-xs text-muted-foreground">{app.user_email}</p>
                          </div>
                          <Badge className={cn("text-xs", tierConfig?.color)}>
                            {tierConfig?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>{format(new Date(app.created_at), 'yyyy-MM-dd HH:mm')}</span>
                          <span className="font-semibold text-green-600">RM {(TIER_PRICES[app.requested_tier] || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1" onClick={() => handleApprove(app)} disabled={processing === app.id}>
                            {processing === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                            批准
                          </Button>
                          <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleReject(app)} disabled={processing === app.id}>
                            <X className="h-4 w-4 mr-1" />
                            拒绝
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}

            {pendingApps.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">暂无待审核申请</div>
            )}

          </div>
        )}

        {/* Members Tab */}
        {tab === 'members' && (
          <div className="space-y-3">
            {/* Search & Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索名称或邮箱..."
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={memberTierFilter} onValueChange={setMemberTierFilter}>
                <SelectTrigger className="w-[130px] shrink-0">
                  <SelectValue placeholder="全部等级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部等级</SelectItem>
                  {REFERRAL_TIERS.map(t => (
                    <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {members.length === 0 ? '暂无推广成员' : '没有匹配的结果'}
              </div>
            )}
            {filteredMembers.map(member => {
              const tierConfig = REFERRAL_TIERS.find(t => t.key === member.referral_tier);
              const isExpanded = expandedMember === member.id;
              const balance = member.total_earned - member.total_paid;
              return (
                <Card key={member.id}>
                  <CardContent className="p-0">
                    <button
                      className="w-full p-4 flex items-center justify-between text-left"
                      onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-1.5 rounded-full", tierConfig?.color)}>
                          {tierConfig?.icon && <tierConfig.icon className="h-3.5 w-3.5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.display_name || member.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {tierConfig?.label} · {member.referee_count} 推荐
                            {member.total_earned > 0 && (
                              <> · <span className="text-green-600">RM {member.total_earned.toFixed(2)}</span></>
                            )}
                            {balance > 0 && (
                              <> · <span className="text-amber-600">待付 RM {balance.toFixed(2)}</span></>
                            )}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                        <div className="flex gap-2 text-xs">
                          <span className="text-muted-foreground">推荐码: {member.referral_code}</span>
                          <span className="text-muted-foreground">· {member.email}</span>
                        </div>

                        {/* Change Tier */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium whitespace-nowrap">等级:</label>
                          <select
                            className="flex-1 border rounded-lg p-1.5 text-xs bg-background"
                            value={pendingTierChanges[member.id] ?? member.referral_tier}
                            onChange={(e) => setPendingTierChanges(prev => ({ ...prev, [member.id]: e.target.value }))}
                          >
                            {REFERRAL_TIERS.map(t => (
                              <option key={t.key} value={t.key}>{t.label}</option>
                            ))}
                          </select>
                          {(pendingTierChanges[member.id] && pendingTierChanges[member.id] !== member.referral_tier) && (
                            <Button
                              size="sm"
                              className="text-xs px-3"
                              disabled={savingTier === member.id}
                              onClick={async () => {
                                setSavingTier(member.id);
                                try {
                                  await supabase
                                    .from('profiles')
                                    .update({ referral_tier: pendingTierChanges[member.id] } as any)
                                    .eq('id', member.id);
                                  toast.success('等级已更新');
                                  setPendingTierChanges(prev => { const n = { ...prev }; delete n[member.id]; return n; });
                                  fetchData();
                                } catch (err: any) {
                                  toast.error('更新失败: ' + err.message);
                                } finally {
                                  setSavingTier(null);
                                }
                              }}
                            >
                              {savingTier === member.id ? <Loader2 className="h-3 w-3 animate-spin" /> : '保存'}
                            </Button>
                          )}
                        </div>

                        {/* Earnings summary */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-green-500/10 rounded-lg p-2">
                            <p className="text-muted-foreground">总佣金</p>
                            <p className="font-bold text-green-600">RM {member.total_earned.toFixed(2)}</p>
                          </div>
                          <div className="bg-blue-500/10 rounded-lg p-2">
                            <p className="text-muted-foreground">已支付</p>
                            <p className="font-bold text-blue-600">RM {member.total_paid.toFixed(2)}</p>
                          </div>
                          <div className="bg-amber-500/10 rounded-lg p-2">
                            <p className="text-muted-foreground">待支付</p>
                            <p className="font-bold text-amber-600">RM {balance.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={() => setCommissionDialog({ open: true, memberId: member.id, memberName: member.display_name || member.email || '' })}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            添加佣金
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={() => setPayoutDialog({ open: true, memberId: member.id, memberName: member.display_name || member.email || '' })}
                          >
                            <Wallet className="h-3 w-3 mr-1" />
                            记录支付
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full text-xs"
                          onClick={() => setRemovingMember({ id: member.id, name: member.display_name || member.email || '' })}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          移除推广资格
                        </Button>

                        {/* Referees */}
                        {member.referees.length > 0 ? (
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium">推荐名单 ({member.referees.length})</p>
                            {member.referees.map(ref => (
                              <div key={ref.id} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                                <div>
                                  <span>{ref.display_name || ref.email}</span>
                                  {ref.display_name && ref.email && (
                                    <span className="text-muted-foreground ml-1.5">({ref.email})</span>
                                  )}
                                </div>
                                <span className="text-muted-foreground shrink-0 ml-2">{format(new Date(ref.created_at), 'yyyy-MM-dd')}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">暂无推荐记录</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Commission Dialog */}
      <Dialog open={commissionDialog.open} onOpenChange={(open) => { if (!open) setCommissionDialog({ open: false, memberId: '', memberName: '' }); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加佣金 - {commissionDialog.memberName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">金额 (MYR)</label>
              <Input type="number" placeholder="0.00" value={commAmount} onChange={e => setCommAmount(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">来源类型</label>
              <select
                className="w-full border rounded-lg p-2 text-sm bg-background"
                value={commSourceType}
                onChange={e => setCommSourceType(e.target.value)}
              >
                <option value="manual">手动添加</option>
                <option value="membership_order">会员订阅</option>
                <option value="order">商品订单</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">备注</label>
              <Textarea placeholder="可选" value={commNotes} onChange={e => setCommNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddCommission} disabled={submittingComm}>
              {submittingComm ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payout Dialog */}
      <Dialog open={payoutDialog.open} onOpenChange={(open) => { if (!open) setPayoutDialog({ open: false, memberId: '', memberName: '' }); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>记录支付 - {payoutDialog.memberName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">支付金额 (MYR)</label>
              <Input type="number" placeholder="0.00" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">备注</label>
              <Textarea placeholder="如：银行转账、现金等" value={payNotes} onChange={e => setPayNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddPayout} disabled={submittingPay}>
              {submittingPay ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              确认支付
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!removingMember} onOpenChange={(open) => !open && setRemovingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>移除推广成员</AlertDialogTitle>
            <AlertDialogDescription>
              确定要将 <strong>{removingMember?.name}</strong> 从推广计划中移除吗？此操作将清除其推广等级。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => removingMember && handleRemoveMember(removingMember.id)}
            >
              确认移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={(open) => { if (!open) { setAddMemberOpen(false); setAddMemberSearch(''); setAddMemberResults([]); setAddMemberSelected(null); setAddMemberTier('member'); } }}>
        <DialogContent className="w-[calc(100%-3rem)] max-w-lg left-1/2 -translate-x-1/2 rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              添加推广成员
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">搜索会员</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="输入姓名或邮箱搜索..."
                  value={addMemberSearch}
                  onChange={(e) => handleSearchMembers(e.target.value)}
                  className="pl-9"
                />
              </div>
              {addMemberSearching && <p className="text-xs text-muted-foreground">搜索中...</p>}
              {addMemberResults.length > 0 && (
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {addMemberResults.map(r => {
                    const alreadyMember = !!r.referral_tier;
                    return (
                      <button
                        key={r.id}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm border-b last:border-b-0 transition-colors",
                          addMemberSelected === r.id ? "bg-primary/10" : "hover:bg-muted",
                          alreadyMember && "opacity-50"
                        )}
                        onClick={() => !alreadyMember && setAddMemberSelected(r.id)}
                        disabled={alreadyMember}
                      >
                        <span className="font-medium">{r.display_name || r.email}</span>
                        {r.display_name && r.email && <span className="text-muted-foreground ml-1.5 text-xs">({r.email})</span>}
                        {alreadyMember && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">
                            已是推广成员
                          </Badge>
                        )}
                        {addMemberSelected === r.id && <Check className="inline h-4 w-4 ml-2 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
              {addMemberSearch.trim().length >= 2 && addMemberResults.length === 0 && !addMemberSearching && (
                <p className="text-xs text-muted-foreground">没有找到匹配的会员</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">推广等级</label>
              <Select value={addMemberTier} onValueChange={setAddMemberTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REFERRAL_TIERS.map(t => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.label} — RM {TIER_PRICES[t.key]?.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleAddMemberToReferral}
              disabled={!addMemberSelected || addingMember}
            >
              {addingMember ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {addingMember ? '添加中...' : '确认添加'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
