import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, LogOut, Settings, HelpCircle, ChevronRight, ChevronLeft, Crown, Star, KeyRound, Eye, EyeOff, Shield, FileText, Infinity, Compass, Copy, Check, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TIER_CONFIG = {
  owner: { label: 'Owner', icon: Shield, className: 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-600' },
  superadmin: { label: 'SuperAdmin', icon: Shield, className: 'bg-purple-600 text-white border-purple-700 hover:bg-purple-600' },
  admin: { label: 'Admin', icon: Shield, className: 'bg-red-600 text-white border-red-700 hover:bg-red-600' },
  subscriber: { label: '订阅会员', icon: Crown, className: 'bg-amber-500 text-white border-amber-600 hover:bg-amber-500' },
  vip_plus: { label: '订阅会员', icon: Crown, className: 'bg-amber-500 text-white border-amber-600 hover:bg-amber-500' },
  vip: { label: '订阅会员', icon: Star, className: 'bg-primary text-primary-foreground hover:bg-primary' },
  normal: { label: '普通会员', icon: null, className: 'bg-muted text-muted-foreground hover:bg-muted' },
} as const;

function MembershipInfoCard() {
  const { user, profile, isAdmin, isSuperAdmin, isOwner } = useAuth();
  const navigate = useNavigate();
  const [memberData, setMemberData] = useState<{ member_tier: string; membership_expires_at: string | null } | null>(null);
  const [reportQuota, setReportQuota] = useState<{ used: number; limit: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      // Fetch membership info
      const { data } = await supabase
        .from('profiles')
        .select('member_tier, membership_expires_at')
        .eq('id', user.id)
        .single();
      if (data) setMemberData(data as any);

      // Determine effective tier
      const effectiveTier = isAdmin ? 'subscriber' : (data as any)?.member_tier || 'normal';
      
      if (isAdmin) {
        setReportQuota({ used: 0, limit: -1 }); // -1 = unlimited
      } else if (effectiveTier === 'normal') {
        setReportQuota({ used: 0, limit: 0 }); // 0 = pay per use
      } else {
        // Check yearly vs monthly subscription
        const { data: latestOrder } = await supabase
          .from('membership_orders')
          .select('duration_months, created_at')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(1);
        const isYearly = latestOrder?.[0]?.duration_months === 12;

        // For yearly: count from subscription start; for monthly: count from start of month
        let countSince: string;
        if (isYearly && latestOrder?.[0]?.created_at) {
          countSince = latestOrder[0].created_at;
        } else {
          const now = new Date();
          countSince = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        }

        const { count } = await supabase
          .from('client_reports')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', countSince);
        const used = count || 0;

        let limit = 0;
        if (effectiveTier === 'subscriber' || effectiveTier === 'vip' || effectiveTier === 'vip_plus') {
          limit = isYearly ? -1 : 10;
        }
        setReportQuota({ used, limit });
      }
    };
    fetchAll();
  }, [user, isAdmin]);

  if (!memberData) return null;

  const isExpired = !isAdmin && memberData.membership_expires_at && new Date(memberData.membership_expires_at) < new Date();
  const effectiveTier = isAdmin ? 'subscriber' : (isExpired ? 'normal' : memberData.member_tier);
  const displayTierKey = isOwner ? 'owner' : isSuperAdmin ? 'superadmin' : isAdmin ? 'admin' : effectiveTier;
  const tierConfig = TIER_CONFIG[displayTierKey as keyof typeof TIER_CONFIG];

  const isPaidTier = effectiveTier !== 'normal';
  const showReportQuota = !isAdmin && isPaidTier && reportQuota && reportQuota.limit !== -1;

  return (
    <div className="mx-4 mb-3">
      <div className="bg-muted/50 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">会员信息</span>
        </div>

        {/* Tier */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">当前等级</span>
          <Badge className={cn("px-2 py-0.5 gap-1", tierConfig.className)}>
            {tierConfig.icon && <tierConfig.icon className="h-3 w-3" />}
            {tierConfig.label}
          </Badge>
        </div>

        {/* Expiry */}
        {!isAdmin && memberData.member_tier !== 'normal' && memberData.membership_expires_at && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">到期时间</span>
            <span className={cn("text-sm font-medium", isExpired && "text-destructive")}>
              {format(new Date(memberData.membership_expires_at), 'yyyy-MM-dd')}
              {isExpired && ' (已过期)'}
            </span>
          </div>
        )}


        {/* Upgrade / Renew button - hide for active subscribers */}
        {!isAdmin && (effectiveTier === 'normal' || isExpired) && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-1"
            onClick={() => navigate('/pricing')}
          >
            {isExpired ? '续费会员' : '升级会员'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function UserProfile() {
  const { user, profile, signOut, isAdmin, isSuperAdmin, isOwner } = useAuth();
  const navigate = useNavigate();
  
  const tier = profile?.member_tier || 'normal';
  const displayTier = isOwner ? 'owner' : isSuperAdmin ? 'superadmin' : isAdmin ? 'admin' : tier;
  const tierConfig = TIER_CONFIG[displayTier];

  const [hasBirthData, setHasBirthData] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('birth_date, birth_hour, referral_code').eq('id', user.id).single()
      .then(({ data }) => {
        if (data?.birth_date && data?.birth_hour !== null) setHasBirthData(true);
        if (data?.referral_code) setReferralCode(data.referral_code);
      });
  }, [user]);

  const handleCopyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success('推荐码已复制');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentVerified, setCurrentVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleVerifyCurrentPassword = async () => {
    if (!currentPassword || !profile?.email) return;
    setVerifying(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      });
      if (error) {
        toast.error('当前密码不正确');
      } else {
        setCurrentVerified(true);
        toast.success('密码验证成功');
      }
    } catch {
      toast.error('验证失败');
    } finally {
      setVerifying(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 12) {
      toast.error('新密码至少需要12个字符');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      toast.error('新密码必须包含至少一个小写字母');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast.error('新密码必须包含至少一个大写字母');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      toast.error('新密码必须包含至少一个数字');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword)) {
      toast.error('新密码必须包含至少一个特殊字符');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('两次输入的新密码不一致');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error('密码更新失败: ' + error.message);
      } else {
        toast.success('密码已成功更新');
        setShowChangePassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentVerified(false);
      }
    } catch {
      toast.error('密码更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleEmailClick = () => {
  const email = "mvpharvard@gmail.com";
  const subject = encodeURIComponent("Help & Feedback");
  const body = encodeURIComponent("Please describe your issue here...");
  
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
};

  const handleNavigateToSettings = () => {
    navigate('/settings');
  };

  const handleBack = () => {
    // navigate(-1);
     navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky Header */}
      <div className="">
        <div className="flex items-center p-4 justify-between">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
                {/* Logout button */}
      <div>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 text-foreground hover:text-muted-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>退出登录</span>
        </button>
      </div>
        </div>
      </div>

      {/* User info */}
      <div className="flex flex-col items-center px-6 pb-6 mt-10">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {profile?.display_name || '用户'}
        </h2>
        <p className="text-sm text-muted-foreground mb-2">
          {profile?.email}
        </p>
        {referralCode && (
          <button
            onClick={handleCopyReferralCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <span>推荐码: {referralCode}</span>
            {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* View Destiny Button */}
      {hasBirthData && (
        <div className="px-4 mb-3">
          <Button
            className="w-full gap-2"
            onClick={() => navigate('/destiny?mode=self')}
          >
            <Compass className="h-5 w-5" />
            查看我的命盘
          </Button>
        </div>
      )}

      {/* Membership Info Card */}
      <MembershipInfoCard />

      {/* Menu sections */}
      <div className="flex-1 px-4 space-y-3">
        {/* Referral Program */}
        <div className="bg-muted/50 rounded-xl overflow-hidden">
          <button 
            onClick={() => navigate('/referral-program')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground">Referral Program</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Settings box */}
        <div className="bg-muted/50 rounded-xl overflow-hidden">
          <button 
            onClick={handleNavigateToSettings}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground">个人设置</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Change Password box */}
        <div className="bg-muted/50 rounded-xl overflow-hidden">
          <button 
            onClick={() => {
              setShowChangePassword(!showChangePassword);
              if (showChangePassword) {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setCurrentVerified(false);
              }
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground">更换密码</span>
            </div>
            <ChevronRight className={cn("h-5 w-5 text-muted-foreground transition-transform", showChangePassword && "rotate-90")} />
          </button>
          
          {showChangePassword && (
            <div className="px-4 pb-4 space-y-3">
              {/* Current password */}
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">当前密码</label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="输入当前密码"
                      disabled={currentVerified}
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {!currentVerified && (
                    <Button size="sm" onClick={handleVerifyCurrentPassword} disabled={!currentPassword || verifying}>
                      {verifying ? '验证中...' : '验证'}
                    </Button>
                  )}
                  {currentVerified && <span className="text-sm text-green-500">✓ 已验证</span>}
                </div>
              </div>

              {/* New password fields - only shown after verification */}
              {currentVerified && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm text-muted-foreground">新密码</label>
                    <div className="relative">
                      <Input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="输入新密码"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Password requirements checklist */}
                    <div className="text-xs space-y-0.5 mt-1">
                      <p className={newPassword.length >= 12 ? 'text-primary' : 'text-muted-foreground'}>
                        {newPassword.length >= 12 ? '✓' : '○'} 至少12个字符
                      </p>
                      <p className={/[a-z]/.test(newPassword) ? 'text-primary' : 'text-muted-foreground'}>
                        {/[a-z]/.test(newPassword) ? '✓' : '○'} 至少1个小写字母
                      </p>
                      <p className={/[A-Z]/.test(newPassword) ? 'text-primary' : 'text-muted-foreground'}>
                        {/[A-Z]/.test(newPassword) ? '✓' : '○'} 至少1个大写字母
                      </p>
                      <p className={/[0-9]/.test(newPassword) ? 'text-primary' : 'text-muted-foreground'}>
                        {/[0-9]/.test(newPassword) ? '✓' : '○'} 至少1个数字
                      </p>
                      <p className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword) ? 'text-primary' : 'text-muted-foreground'}>
                        {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword) ? '✓' : '○'} 至少1个特殊字符
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-muted-foreground">确认新密码</label>
                    <div className="relative">
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="再次输入新密码"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <p className={cn("text-xs mt-1", confirmPassword === newPassword ? 'text-primary' : 'text-destructive')}>
                        {confirmPassword === newPassword ? '✓ 密码一致' : '✗ 密码不一致'}
                      </p>
                    )}
                  </div>
                  <Button className="w-full" onClick={handleChangePassword} disabled={!newPassword || !confirmPassword || submitting}>
                    {submitting ? '更新中...' : '确认更换密码'}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Help box */}
        <div className="bg-muted/50 rounded-xl overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-muted/80 transition-colors" onClick={handleEmailClick}>
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground">帮助与反馈</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
