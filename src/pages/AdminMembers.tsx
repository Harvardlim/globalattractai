import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Star, Users, Shield, Calendar as CalendarIcon, ChevronDown, ChevronRight, Loader2, Search, ArrowUpDown, Filter, UserPlus, Mail, Clock, Trash2, KeyRound, Eye, EyeOff, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserMenu } from '@/components/UserMenu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { addMonths, format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as DayCalendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PACKAGE_LABELS, type FeaturePackage } from '@/hooks/useFeaturePackages';

interface MemberProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  member_tier: string;
  membership_expires_at: string | null;
  phone_number: string | null;
  source: string;
  referral_code: string | null;
  referred_by: string | null;
  referred_by_name?: string | null;
  referred_by_code?: string | null;
  client_count?: number;
  isAdmin?: boolean;
  adminRole?: string;
  confirmed_at?: string | null;
  last_sign_in_at?: string | null;
}

// Platforms loaded dynamically

const TIER_LABELS: Record<string, string> = {
  admin: 'Admin',
  normal: '普通会员',
  subscriber: '订阅会员',
  vip: '订阅会员',
  vip_plus: '订阅会员',
};

const TIER_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  normal: 'outline',
  subscriber: 'default',
  vip: 'default',
  vip_plus: 'default',
};

export default function AdminMembers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editTier, setEditTier] = useState('');
  const [editDuration, setEditDuration] = useState('1');
  const [editStartDate, setEditStartDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByExpiry, setSortByExpiry] = useState(false);
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('all');


  // Check if current user is superadmin or owner
  const { data: currentUserRole } = useQuery({
    queryKey: ['current-user-role', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id)
        .in('role', ['admin', 'superadmin', 'owner'] as any)
        .maybeSingle();
      return (data as any)?.role as string | null;
    },
    enabled: !!user,
  });
  const isOwner = currentUserRole === 'owner';
  const isSuperAdmin = currentUserRole === 'superadmin' || isOwner;
  const adminSource = profile?.source || '全球发愿';

  // Fetch platforms dynamically
  const { data: platformNames = [] } = useQuery({
    queryKey: ['platforms-list'],
    queryFn: async () => {
      const { data, error } = await (supabase.from('platforms' as any).select('name').order('created_at') as any);
      if (error) throw error;
      return (data || []).map((p: any) => p.name as string);
    },
    enabled: !!user,
  });

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [resending, setResending] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<MemberProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Add member dialog state
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addTier, setAddTier] = useState('normal');
  const [addDuration, setAddDuration] = useState('1');
  const [addSource, setAddSource] = useState('');
  const [addReferralCode, setAddReferralCode] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  // Edit referrer state
  const [editingReferrerUser, setEditingReferrerUser] = useState<string | null>(null);
  const [editReferrerCode, setEditReferrerCode] = useState('');
  const [savingReferrer, setSavingReferrer] = useState(false);
  
  // Reset password state
  const [resetPwUser, setResetPwUser] = useState<MemberProfile | null>(null);
  const [resetPwValue, setResetPwValue] = useState('');
  const [resetPwConfirm, setResetPwConfirm] = useState('');
  const [showResetPw, setShowResetPw] = useState(false);
  const [resettingPw, setResettingPw] = useState(false);

  // Email editing state
  const [editingEmailUser, setEditingEmailUser] = useState<string | null>(null);
  const [editEmailValue, setEditEmailValue] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  // Fetch all profiles (admin only)
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['admin-members'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('profiles')
        .select('id, email, display_name, member_tier, membership_expires_at, phone_number, source, last_login_at, referral_code, referred_by')
        .order('member_tier', { ascending: false })) as any;
      if (error) throw error;
      // Fetch admin roles
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['admin', 'superadmin', 'owner'] as any);
      const adminIds = new Set((adminRoles || []).map((r: any) => r.user_id));
      const roleMap = new Map((adminRoles || []).map((r: any) => [r.user_id, r.role]));

      // Build referred_by name map
      const profileMap = new Map((data || []).map((p: any) => [p.id, p]));

      // Fetch client counts per user
      const { data: clientCounts } = await (supabase
        .from('clients')
        .select('user_id') as any);
      const clientCountMap = new Map<string, number>();
      (clientCounts || []).forEach((c: any) => {
        if (c.user_id) {
          clientCountMap.set(c.user_id, (clientCountMap.get(c.user_id) || 0) + 1);
        }
      });

      return ((data || []) as MemberProfile[]).map(m => ({
        ...m,
        isAdmin: adminIds.has(m.id),
        adminRole: roleMap.get(m.id) || undefined,
        referred_by_name: m.referred_by ? ((profileMap.get(m.referred_by) as any)?.display_name || (profileMap.get(m.referred_by) as any)?.email || null) : null,
        referred_by_code: m.referred_by ? ((profileMap.get(m.referred_by) as any)?.referral_code || null) : null,
        client_count: clientCountMap.get(m.id) || 0,
      }));
    },
    enabled: !!user,
  });

  // Fetch pending membership orders with user profile info
  const { data: pendingOrders = [] } = useQuery({
    queryKey: ['admin-membership-orders'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('membership_orders' as any)
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })) as any;
      if (error) throw error;
      const orders = data || [];
      // Deduplicate: keep only the latest order per user
      const latestByUser = new Map<string, any>();
      for (const o of orders) {
        if (!latestByUser.has(o.user_id) || new Date(o.created_at) > new Date(latestByUser.get(o.user_id).created_at)) {
          latestByUser.set(o.user_id, o);
        }
      }
      const dedupedOrders = [...latestByUser.values()];
      // Enrich with profile info
      const userIds = [...latestByUser.keys()];
      if (userIds.length === 0) return dedupedOrders;
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      return dedupedOrders.map((o: any) => ({
        ...o,
        _profile: profileMap.get(o.user_id) || null,
      }));
    },
    enabled: !!user,
  });

  // Fetch all user feature packages
  const { data: allUserPackages = [], refetch: refetchPackages } = useQuery({
    queryKey: ['admin-user-packages'],
    queryFn: async () => {
      const { data } = await (supabase.from('user_feature_packages' as any).select('user_id, package_key')) as any;
      return (data || []) as { user_id: string; package_key: FeaturePackage }[];
    },
    enabled: !!user,
  });

  const getUserPackages = (userId: string): FeaturePackage[] => {
    return allUserPackages.filter(p => p.user_id === userId).map(p => p.package_key);
  };

  const toggleUserPackage = async (userId: string, pkg: FeaturePackage) => {
    const current = getUserPackages(userId);
    if (current.includes(pkg)) {
      await (supabase.from('user_feature_packages' as any).delete().eq('user_id', userId).eq('package_key', pkg) as any);
    } else {
      await (supabase.from('user_feature_packages' as any).insert({ user_id: userId, package_key: pkg } as any) as any);
    }
    refetchPackages();
  };

  // We store invited user IDs in localStorage as a simple tracking mechanism
  const getPendingInvites = (): Set<string> => {
    try {
      const stored = localStorage.getItem('admin_pending_invites');
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  };

  const addPendingInvite = (userId: string) => {
    const pending = getPendingInvites();
    pending.add(userId);
    localStorage.setItem('admin_pending_invites', JSON.stringify([...pending]));
  };

  const removePendingInvite = (userId: string) => {
    const pending = getPendingInvites();
    pending.delete(userId);
    localStorage.setItem('admin_pending_invites', JSON.stringify([...pending]));
  };

  const pendingInvites = getPendingInvites();

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { email: inviteEmail.trim(), displayName: inviteName.trim() || undefined },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Track as pending
      if (data?.user?.id) {
        addPendingInvite(data.user.id);
      }

      toast({ title: '邀请已发送', description: `已发送邀请邮件至 ${inviteEmail}` });
      setInviteOpen(false);
      setInviteName('');
      setInviteEmail('');
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
    } catch (err: any) {
      const msg = err.message || '发送失败';
      toast({ title: '邀请失败', description: msg.includes('already been registered') ? '该邮箱已注册' : msg, variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const handleResendInvite = async (email: string, userId: string) => {
    setResending(userId);
    try {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { email, action: 'resend' },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: '邮件已重发', description: `已重新发送邮件至 ${email}` });
    } catch (err: any) {
      toast({ title: '重发失败', description: err.message, variant: 'destructive' });
    } finally {
      setResending(null);
    }
  };

  const handleApproveOrder = async (order: any) => {
    setSaving(true);
    try {
      const isPermanent = order.duration_months === 0;
      const expiresAt = isPermanent ? null : addMonths(new Date(), order.duration_months);
      
      // Update profile tier and expiry
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          member_tier: order.tier as any,
          membership_expires_at: isPermanent ? null : expiresAt!.toISOString(),
        } as any)
        .eq('id', order.user_id);
      if (profileErr) throw profileErr;

      // Mark order as approved
      const { error: orderErr } = await (supabase
        .from('membership_orders' as any)
        .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: user?.id } as any)
        .eq('id', order.id)) as any;
      if (orderErr) throw orderErr;

      // Auto-reject other pending orders from the same user
      await (supabase
        .from('membership_orders' as any)
        .update({ status: 'rejected' } as any)
        .eq('user_id', order.user_id)
        .eq('status', 'pending')
        .neq('id', order.id)) as any;

      toast({ title: '会员已激活' });
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
      queryClient.invalidateQueries({ queryKey: ['admin-membership-orders'] });
    } catch (err: any) {
      toast({ title: '操作失败', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleRejectOrder = async (order: any) => {
    try {
      // Reject all pending orders from the same user
      const { error } = await (supabase
        .from('membership_orders' as any)
        .update({ status: 'rejected' } as any)
        .eq('user_id', order.user_id)
        .eq('status', 'pending')) as any;
      if (error) throw error;
      toast({ title: '已拒绝' });
      queryClient.invalidateQueries({ queryKey: ['admin-membership-orders'] });
    } catch (err: any) {
      toast({ title: '操作失败', description: err.message, variant: 'destructive' });
    }
  };

  const calcExpiry = (start: Date, dur: string): Date | null => {
    if (dur === 'permanent') return null;
    const startOfDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    if (dur === '1d') return new Date(startOfDay.getTime() + 1 * 86400000);
    if (dur === '14d') return new Date(startOfDay.getTime() + 14 * 86400000);
    const months = parseInt(dur);
    return addMonths(startOfDay, months);
  };

  const handleSaveEdit = async (memberId: string) => {
    setSaving(true);
    try {
      const isSettingAdmin = editTier === 'admin';
      const isSettingSuperAdmin = editTier === 'superadmin';
      
      if (isSettingAdmin || isSettingSuperAdmin) {
        // Set as admin/superadmin: update profile to subscriber and set role
        const { error: profileErr } = await (supabase
          .from('profiles')
          .update({
            member_tier: 'subscriber' as any,
            membership_expires_at: null,
          } as any)
          .eq('id', memberId)) as any;
        if (profileErr) throw profileErr;

        // Upsert role
        const { error: deleteErr } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', memberId);
        if (deleteErr) throw deleteErr;
        
        const targetRole = isSettingSuperAdmin ? 'superadmin' : 'admin';
        const { error: roleErr } = await (supabase
          .from('user_roles')
          .insert({ user_id: memberId, role: targetRole } as any)) as any;
        if (roleErr) throw roleErr;
      } else {
        // Set as regular member: update profile tier and remove admin role if exists
        const expiresAt = calcExpiry(editStartDate, editDuration);
        
        const { error: profileErr } = await (supabase
          .from('profiles')
          .update({
            member_tier: editTier as any,
            membership_expires_at: editTier === 'normal' ? null : (expiresAt ? expiresAt.toISOString() : null),
          } as any)
          .eq('id', memberId)) as any;
        if (profileErr) throw profileErr;

        // Remove admin role, set back to user
        const { error: deleteErr } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', memberId);
        if (deleteErr) throw deleteErr;
        
        const { error: roleErr } = await (supabase
          .from('user_roles')
          .insert({ user_id: memberId, role: 'user' } as any)) as any;
        if (roleErr) throw roleErr;
      }

      toast({ title: '会员信息已更新' });
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
    } catch (err: any) {
      toast({ title: '更新失败', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (member: MemberProfile) => {
    setEditingUser(member.id);
    // Map legacy tiers to new system
    const mappedTier = member.adminRole === 'superadmin' ? 'superadmin' : member.isAdmin ? 'admin' : (member.member_tier === 'vip' || member.member_tier === 'vip_plus') ? 'subscriber' : member.member_tier;
    setEditTier(mappedTier);
    // If no expiry set and member is subscriber, default to permanent
    setEditDuration((!member.membership_expires_at && mappedTier === 'subscriber') ? 'permanent' : '1');
    setEditStartDate(new Date());
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: memberToDelete.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: '会员已删除' });
      removePendingInvite(memberToDelete.id);
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
    } catch (err: any) {
      toast({ title: '删除失败', description: err.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
      setMemberToDelete(null);
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const handleCreateMember = async () => {
    if (!addEmail.trim()) return;
    setAddingMember(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-member', {
        body: {
          email: addEmail.trim(),
          display_name: addName.trim() || undefined,
          member_tier: addTier,
          duration: addTier === 'normal' ? undefined : addDuration,
          source: addSource || adminSource,
          referral_code: addReferralCode.trim() || undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: '会员已创建', description: `默认密码: Globalattract123@\n用户首次登录需修改密码` });
      setAddMemberOpen(false);
      setAddName('');
      setAddEmail('');
      setAddTier('normal');
      setAddDuration('1');
      setAddSource('');
      setAddReferralCode('');
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
    } catch (err: any) {
      const msg = err.message || '创建失败';
      toast({
        title: '创建失败',
        description: msg.includes('already been registered') ? '该邮箱已注册' : msg,
        variant: 'destructive',
      });
    } finally {
      setAddingMember(false);
    }
  };

  const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

  const isPasswordValid = (pw: string) =>
    pw.length >= 12 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    SPECIAL_CHAR_REGEX.test(pw);

  const handleResetPassword = async () => {
    if (!resetPwUser || !resetPwValue) return;
    if (!isPasswordValid(resetPwValue)) {
      toast({ title: '密码不符合要求', variant: 'destructive' });
      return;
    }
    if (resetPwValue !== resetPwConfirm) {
      toast({ title: '两次密码不一致', variant: 'destructive' });
      return;
    }
    setResettingPw(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { user_id: resetPwUser.id, password: resetPwValue },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      // Force logout the user on all devices
      await supabase.functions.invoke('revoke-user-session', {
        body: { user_id: resetPwUser.id },
      });
      const envLabel = (typeof window !== 'undefined' && (window.location.hostname === 'www.theglobalattract.com' || window.location.hostname === 'globalattract.lovable.app')) ? 'Live' : 'Test';
      toast({ title: `密码已重置（${envLabel}）`, description: `${resetPwUser.display_name || resetPwUser.email} 的密码已更新，该用户已被强制登出` });
      setResetPwUser(null);
      setResetPwValue('');
      setResetPwConfirm('');
    } catch (err: any) {
      toast({ title: '重置失败', description: err.message, variant: 'destructive' });
    } finally {
      setResettingPw(false);
    }
  };

  // Helper: check if current admin can manage this member
  const canManageMember = (member: MemberProfile) => {
    // Nobody can edit an owner
    if (member.adminRole === 'owner') return false;
    // Only owner can manage superadmins
    if (member.adminRole === 'superadmin' && !isOwner) return false;
    if (isSuperAdmin) return true;
    const memberSource = (member.source || '全球发愿').trim();
    // Admin can only manage members from their own platform
    if (!memberSource) return false;
    return memberSource === adminSource;
  };

  const handleUpdateEmail = async (memberId: string) => {
    if (!editEmailValue.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmailValue.trim())) {
      toast({ title: '无效的邮箱格式', variant: 'destructive' });
      return;
    }
    setSavingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-update-email', {
        body: { user_id: memberId, email: editEmailValue.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: '邮箱已更新' });
      setEditingEmailUser(null);
      setEditEmailValue('');
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
    } catch (err: any) {
      toast({ title: '更新失败', description: err.message, variant: 'destructive' });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleUpdateReferrer = async (memberId: string) => {
    setSavingReferrer(true);
    try {
      if (!editReferrerCode.trim()) {
        // Clear referrer
        await (supabase.from('profiles').update({ referred_by: null } as any).eq('id', memberId) as any);
        toast({ title: '推荐人已清除' });
      } else {
        // Look up referral code
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .eq('referral_code', editReferrerCode.trim().toUpperCase())
          .maybeSingle();
        if (!referrerProfile) {
          toast({ title: '推荐码不存在', variant: 'destructive' });
          setSavingReferrer(false);
          return;
        }
        if (referrerProfile.id === memberId) {
          toast({ title: '不能推荐自己', variant: 'destructive' });
          setSavingReferrer(false);
          return;
        }
        await (supabase.from('profiles').update({ referred_by: referrerProfile.id } as any).eq('id', memberId) as any);
        toast({ title: '推荐人已更新', description: `已设置为 ${referrerProfile.display_name || referrerProfile.email}` });
      }
      setEditingReferrerUser(null);
      setEditReferrerCode('');
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
    } catch (err: any) {
      toast({ title: '更新失败', description: err.message, variant: 'destructive' });
    } finally {
      setSavingReferrer(false);
    }
  };

  // Filter and sort members
  const filteredMembers = members
    .filter(m => {
      // Platform-based access: admin only sees their platform members + admins
      if (!isSuperAdmin) {
        const memberSource = (m.source || '全球发愿').trim();
        // Admin can see members from their own platform only
        if (!memberSource) return false;
        if (memberSource !== adminSource) return false;
      }
      if (tierFilter === 'admin' && !m.isAdmin) return false;
      if (tierFilter === 'subscriber' && m.member_tier !== 'subscriber' && m.member_tier !== 'vip' && m.member_tier !== 'vip_plus') return false;
      if (tierFilter !== 'all' && tierFilter !== 'admin' && tierFilter !== 'pending' && tierFilter !== 'subscriber' && m.member_tier !== tierFilter) return false;
      if (sourceFilter !== 'all' && (m.source || '全球发愿') !== sourceFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (m.display_name?.toLowerCase().includes(q)) ||
             (m.email?.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (!sortByExpiry) return 0;
      const aExp = a.membership_expires_at ? new Date(a.membership_expires_at).getTime() : Infinity;
      const bExp = b.membership_expires_at ? new Date(b.membership_expires_at).getTime() : Infinity;
      return aExp - bExp;
    });

  const sourceOptions = Array.from(
    new Set(
      [...platformNames, ...members.map((m) => (m.source || '全球发愿').trim())].filter(
        (source): source is string => !!source
      )
    )
  ).sort((a, b) => {
    if (a === '全球发愿') return -1;
    if (b === '全球发愿') return 1;
    return a.localeCompare(b, 'zh-Hans-CN');
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center gap-3 py-3">
            <button onClick={() => navigate('/admin')} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold flex-1">会员管理</h1>
            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setAddMemberOpen(true)}>
              <UserPlus className="h-3.5 w-3.5" />
              添加会员
            </Button>
          </div>
          {/* Search & Filter - sticky under header */}
          <div className="flex flex-col gap-2 pb-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索姓名或邮箱..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant={sortByExpiry ? 'default' : 'outline'}
                size="sm"
                className="shrink-0 text-xs gap-1"
                onClick={() => setSortByExpiry(!sortByExpiry)}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                即将到期
              </Button>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['all', 'admin', 'pending', 'normal', 'subscriber'].map(tier => (
                <Button
                  key={tier}
                  variant={tierFilter === tier ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-7 px-2.5 shrink-0"
                  onClick={() => setTierFilter(tier)}
                >
                  {tier === 'all' ? '全部' : tier === 'pending' ? 'Pending' : TIER_LABELS[tier]}
                  {tier === 'pending' && pendingInvites.size > 0 && (
                    <span className="ml-1 bg-amber-500 text-white rounded-full text-[9px] w-4 h-4 inline-flex items-center justify-center">
                      {pendingInvites.size}
                    </span>
                  )}
                </Button>
              ))}
              {isSuperAdmin && (
                <>
                  <span className="w-px h-5 bg-border shrink-0" />
                  {['all', ...sourceOptions].map(s => (
                    <Button
                      key={`src-${s}`}
                      variant={sourceFilter === s ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-7 px-2.5 shrink-0"
                      onClick={() => setSourceFilter(s)}
                    >
                      {s === 'all' ? '全部来源' : s}
                    </Button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Pending Orders - only show orders admin can manage */}
        {pendingOrders.filter((order: any) => {
          if (isSuperAdmin) return true;
          // Find the member's source from the profile
          const orderMember = members.find(m => m.id === order.user_id);
          const orderSource = (orderMember?.source || order._profile?.source || '全球发愿').trim();
          if (!orderSource) return false;
          return orderSource === adminSource;
        }).length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">待审核订单</h2>
            <div className="space-y-3">
              {pendingOrders.filter((order: any) => {
                if (isSuperAdmin) return true;
                const orderMember = members.find(m => m.id === order.user_id);
                const orderSource = (orderMember?.source || order._profile?.source || '全球发愿').trim();
                if (!orderSource) return false;
                return orderSource === adminSource;
              }).map((order: any) => (
                <Card key={order.id} className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-amber-600 border-amber-500/50">
                        待审核
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                     <p className="text-sm font-medium">
                       {order._profile?.display_name || '未命名'}
                       {order._profile?.email && (
                         <span className="text-xs text-muted-foreground ml-2">{order._profile.email}</span>
                       )}
                     </p>
                     <p className="text-sm mb-1">
                       申请 <Badge variant="default" className="text-xs">{TIER_LABELS[order.tier]}</Badge> · {order.duration_months === 0 ? '永久' : `${order.duration_months}个月`}
                     </p>
                     <p className="text-sm font-bold mb-3">{order.currency} {Number(order.amount).toFixed(2)}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" disabled={saving} onClick={() => handleApproveOrder(order)}>
                        批准并激活
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" disabled={saving} onClick={() => handleRejectOrder(order)}>
                        拒绝
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Member List */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            全部会员 ({filteredMembers.length})
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map(member => {
                const expired = isExpired(member.membership_expires_at);
                const isEditing = editingUser === member.id;
                const isPending = pendingInvites.has(member.id);

                return (
                  <Card key={member.id} className={`border-border/50 ${isPending ? 'border-amber-400/50' : ''}`}>
                    <CardContent className="p-3">
                      {/* Collapsed row - always visible */}
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedUser(expandedUser === member.id ? null : member.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expandedUser === member.id ? '' : '-rotate-90'}`} />
                          <span className="font-medium text-sm truncate">{member.display_name || member.email || '未命名'}</span>
                          <Badge variant={member.isAdmin ? 'default' : TIER_VARIANTS[member.member_tier] || 'outline'} className={`text-[10px] ${member.adminRole === 'owner' ? 'bg-emerald-600 hover:bg-emerald-700' : member.adminRole === 'superadmin' ? 'bg-purple-600 hover:bg-purple-700' : member.isAdmin ? 'bg-red-600 hover:bg-red-700' : (member.member_tier === 'subscriber' || member.member_tier === 'vip_plus' || member.member_tier === 'vip') ? 'bg-amber-500 hover:bg-amber-600' : ''}`}>
                            {member.adminRole === 'owner' ? 'Owner' : member.adminRole === 'superadmin' ? 'SuperAdmin' : member.isAdmin ? 'Admin' : TIER_LABELS[member.member_tier]}
                          </Badge>
                          {member.source && (
                            <Badge variant="secondary" className="text-[10px]">
                              {member.source}
                            </Badge>
                          )}
                          {isPending && (
                            <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600 bg-amber-50">
                              <Clock className="h-2.5 w-2.5 mr-0.5" />
                              PENDING
                            </Badge>
                          )}
                          {!member.isAdmin && expired && member.member_tier !== 'normal' && (
                            <Badge variant="destructive" className="text-[10px]">已过期</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isPending && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7 px-2"
                              disabled={resending === member.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (member.email) handleResendInvite(member.email, member.id);
                              }}
                            >
                              {resending === member.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Mail className="h-3 w-3 mr-1" />
                                  重发
                                </>
                              )}
                            </Button>
                          )}
                          {!isEditing && (isOwner || !member.isAdmin) && canManageMember(member) && (
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); startEdit(member); setExpandedUser(member.id); }}>
                              编辑
                            </Button>
                          )}
                          {(isOwner || !member.isAdmin) && canManageMember(member) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); setMemberToDelete(member); }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Expanded content */}
                      {expandedUser === member.id && (
                        <div className="mt-2 pl-6 flex flex-row justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {editingEmailUser === member.id ? (
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    value={editEmailValue}
                                    onChange={(e) => setEditEmailValue(e.target.value)}
                                    className="h-7 text-xs w-48 rounded-md"
                                    placeholder="新邮箱"
                                    type="email"
                                    disabled={savingEmail}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-green-600"
                                    disabled={savingEmail}
                                    onClick={() => handleUpdateEmail(member.id)}
                                  >
                                    {savingEmail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    disabled={savingEmail}
                                    onClick={() => { setEditingEmailUser(null); setEditEmailValue(''); }}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  {member.email && <span>{member.email}</span>}
                                  {canManageMember(member) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingEmailUser(member.id);
                                        setEditEmailValue(member.email || '');
                                      }}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                            {member.referral_code && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs text-muted-foreground">推荐码:</span>
                                <span className="text-xs font-mono font-medium bg-muted px-2 py-0.5 rounded">{member.referral_code}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs text-muted-foreground">推荐人:</span>
                              {editingReferrerUser === member.id ? (
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    value={editReferrerCode}
                                    onChange={(e) => setEditReferrerCode(e.target.value)}
                                    className="h-6 text-xs w-28 rounded-md font-mono uppercase"
                                    placeholder="推荐码"
                                    disabled={savingReferrer}
                                  />
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-600" disabled={savingReferrer} onClick={() => handleUpdateReferrer(member.id)}>
                                    {savingReferrer ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled={savingReferrer} onClick={() => { setEditingReferrerUser(null); setEditReferrerCode(''); }}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  {member.referred_by_code && (
                                    <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{member.referred_by_code}</span>
                                  )}
                                  <span className="text-xs font-medium">{member.referred_by_name || '无'}</span>
                                  {isSuperAdmin && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingReferrerUser(member.id);
                                        setEditReferrerCode('');
                                      }}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                            {isSuperAdmin && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs text-muted-foreground">客户数:</span>
                                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                  <Users className="h-3 w-3 mr-1" />
                                  {member.client_count || 0} 人
                                </Badge>
                              </div>
                            )}
                            {isSuperAdmin && (
                            <div className="flex items-center gap-1.5 mt-1.5 mb-4">
                              <span className="text-xs text-muted-foreground">来源:</span>
                              {platformNames.map(s => (
                                <button
                                  key={s}
                                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                                    (member.source || '全球发愿') === s
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                                  }`}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await (supabase.from('profiles').update({ source: s } as any).eq('id', member.id) as any);
                                      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
                                      toast({ title: '来源已更新' });
                                    } catch (err: any) {
                                      toast({ title: '更新失败', description: err.message, variant: 'destructive' });
                                    }
                                  }}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                            )}
                            {/* Feature Packages - hide for superadmin/owner members */}
                            {isSuperAdmin && member.adminRole !== 'superadmin' && member.adminRole !== 'owner' && (
                            <div className="flex items-center gap-1.5 mt-1.5 mb-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">功能包:</span>
                              {(Object.keys(PACKAGE_LABELS) as FeaturePackage[]).map(pkg => {
                                const userPkgs = getUserPackages(member.id);
                                const hasPkg = userPkgs.includes(pkg);
                                return (
                                  <label
                                    key={pkg}
                                    className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border cursor-pointer transition-colors ${
                                      hasPkg
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleUserPackage(member.id, pkg);
                                    }}
                                  >
                                    <Checkbox checked={hasPkg} className="h-3 w-3" tabIndex={-1} />
                                    {PACKAGE_LABELS[pkg]}
                                  </label>
                                );
                              })}
                            </div>
                            )}
                            {isPending && (
                              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                等待用户完成密码设置
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-xs h-auto p-0 ml-2 text-muted-foreground"
                                  onClick={() => removePendingInvite(member.id)}
                                >
                                  标记已完成
                                </Button>
                              </p>
                            )}
                            {member.member_tier !== 'normal' && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                <CalendarIcon className="h-3 w-3 inline mr-1" />
                                {member.membership_expires_at ? (
                                  <>
                                    到期: {format(new Date(member.membership_expires_at), 'yyyy-MM-dd')}
                                    {expired && <span className="text-destructive ml-1">（已过期）</span>}
                                  </>
                                ) : (
                                  <span className="text-amber-600">永久会员</span>
                                )}
                              </p>
                            )}
                            {(member as any).last_login_at && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                <Clock className="h-3 w-3 inline mr-1" />
                                最近登录: {format(new Date((member as any).last_login_at), 'yyyy-MM-dd HH:mm')}
                              </p>
                            )}
                            {!(member as any).last_login_at && (
                              <p className="text-xs text-muted-foreground/50 mt-0.5">
                                <Clock className="h-3 w-3 inline mr-1" />
                                尚未登录
                              </p>
                            )}

                            {isEditing && (
                              <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs text-muted-foreground">会员等级</label>
                                    <Select value={editTier} onValueChange={setEditTier}>
                                      <SelectTrigger className="h-9">
                                        <SelectValue />
                                      </SelectTrigger>
                                       <SelectContent>
                                        <SelectItem value="normal">普通会员</SelectItem>
                                        <SelectItem value="subscriber">订阅会员</SelectItem>
                                        {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                                        {isOwner && <SelectItem value="superadmin">SuperAdmin</SelectItem>}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {editTier !== 'normal' && editTier !== 'admin' && editTier !== 'superadmin' && (
                                    <div>
                                      <label className="text-xs text-muted-foreground">时长</label>
                                      <Select value={editDuration} onValueChange={setEditDuration}>
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="选择时长" />
                                      </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1d">1天</SelectItem>
                                          <SelectItem value="14d">14天</SelectItem>
                                          <SelectItem value="1">1个月</SelectItem>
                                          <SelectItem value="3">3个月</SelectItem>
                                          <SelectItem value="6">6个月</SelectItem>
                                          <SelectItem value="12">12个月</SelectItem>
                                          <SelectItem value="permanent">永久</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                </div>
                                {editTier !== 'normal' && editTier !== 'admin' && editDuration !== 'permanent' && (
                                  <div>
                                    <label className="text-xs text-muted-foreground">起始日期</label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-9 justify-start text-left font-normal text-sm">
                                          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                          {format(editStartDate, 'yyyy-MM-dd')}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <DayCalendar
                                          mode="single"
                                          selected={editStartDate}
                                          onSelect={(d) => d && setEditStartDate(d)}
                                          className="p-3 pointer-events-auto"
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      到期日: {format(calcExpiry(editStartDate, editDuration)!, 'yyyy-MM-dd')}
                                    </p>
                                  </div>
                                )}
                                {editDuration === 'permanent' && editTier !== 'normal' && editTier !== 'admin' && (
                                  <p className="text-xs text-amber-600 font-medium">永久会员，不会过期</p>
                                )}
                                <div className="flex gap-2">
                                  <Button size="sm" className="flex-1" disabled={saving} onClick={() => handleSaveEdit(member.id)}>
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : '保存'}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>取消</Button>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* {isSuperAdmin && (
                            <div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setResetPwUser(member);
                                  setResetPwValue('');
                                  setResetPwConfirm('');
                                  setShowResetPw(false);
                                }}
                              >
                                <KeyRound className="h-3.5 w-3.5 mr-1" />
                                重置密码
                              </Button>
                            </div>
                          )} */}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent className="w-[calc(100%-3rem)] max-w-lg left-1/2 -translate-x-1/2 rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除会员</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除会员「{memberToDelete?.display_name || memberToDelete?.email}」吗？此操作将永久删除该用户的账号及所有数据，无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
            <AlertDialogCancel className="flex-1 mt-0" disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              disabled={deleting}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPwUser} onOpenChange={(open) => { if (!open) { setResetPwUser(null); setResetPwValue(''); setResetPwConfirm(''); } }}>
        <DialogContent className="w-[calc(100%-3rem)] max-w-lg left-1/2 -translate-x-1/2 rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              重置密码
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {(() => {
              const isLive = typeof window !== 'undefined' && (window.location.hostname === 'www.theglobalattract.com' || window.location.hostname === 'globalattract.lovable.app');
              return (
                <div className={`rounded-md px-3 py-2 text-xs font-medium border ${isLive ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'bg-accent border-border text-muted-foreground'}`}>
                  {isLive ? '⚡ 当前环境：Live（正式）— 修改将立即生效' : '🧪 当前环境：Test（测试）— 修改不会影响 Live 用户'}
                </div>
              );
            })()}
            <p className="text-sm text-muted-foreground">
              为「{resetPwUser?.display_name || resetPwUser?.email}」设置新密码
            </p>
            <div className="space-y-1.5">
              <Label>新密码</Label>
              <div className="relative">
                <Input
                  type={showResetPw ? 'text' : 'password'}
                  value={resetPwValue}
                  onChange={(e) => setResetPwValue(e.target.value)}
                  placeholder="输入新密码"
                />
                <button type="button" onClick={() => setShowResetPw(!showResetPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showResetPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="text-xs space-y-0.5 mt-1">
                <p className={resetPwValue.length >= 12 ? 'text-primary' : 'text-muted-foreground'}>
                  {resetPwValue.length >= 12 ? '✓' : '○'} 至少12个字符
                </p>
                <p className={/[a-z]/.test(resetPwValue) ? 'text-primary' : 'text-muted-foreground'}>
                  {/[a-z]/.test(resetPwValue) ? '✓' : '○'} 至少1个小写字母
                </p>
                <p className={/[A-Z]/.test(resetPwValue) ? 'text-primary' : 'text-muted-foreground'}>
                  {/[A-Z]/.test(resetPwValue) ? '✓' : '○'} 至少1个大写字母
                </p>
                <p className={/[0-9]/.test(resetPwValue) ? 'text-primary' : 'text-muted-foreground'}>
                  {/[0-9]/.test(resetPwValue) ? '✓' : '○'} 至少1个数字
                </p>
                <p className={SPECIAL_CHAR_REGEX.test(resetPwValue) ? 'text-primary' : 'text-muted-foreground'}>
                  {SPECIAL_CHAR_REGEX.test(resetPwValue) ? '✓' : '○'} 至少1个特殊字符
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>确认新密码</Label>
              <Input
                type="password"
                value={resetPwConfirm}
                onChange={(e) => setResetPwConfirm(e.target.value)}
                placeholder="再次输入新密码"
              />
              {resetPwConfirm && (
                <p className={`text-xs mt-1 ${resetPwConfirm === resetPwValue ? 'text-primary' : 'text-destructive'}`}>
                  {resetPwConfirm === resetPwValue ? '✓ 密码一致' : '✗ 密码不一致'}
                </p>
              )}
            </div>
            <Button
              className="w-full"
              onClick={handleResetPassword}
              disabled={!isPasswordValid(resetPwValue) || resetPwValue !== resetPwConfirm || resettingPw}
            >
              {resettingPw ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {resettingPw ? '更新中...' : '确认重置密码'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={(open) => { if (!open) { setAddMemberOpen(false); setAddName(''); setAddEmail(''); setAddTier('normal'); setAddDuration('1'); setAddSource(''); setAddReferralCode(''); } }}>
        <DialogContent className="w-[calc(100%-3rem)] max-w-lg left-1/2 -translate-x-1/2 rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              添加会员
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>姓名</Label>
              <Input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="会员姓名"
                disabled={addingMember}
              />
            </div>
            <div className="space-y-1.5">
              <Label>邮箱 *</Label>
              <Input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="会员邮箱"
                disabled={addingMember}
              />
            </div>
            <div className="space-y-1.5">
              <Label>来源渠道</Label>
              <Select value={addSource || adminSource} onValueChange={setAddSource} disabled={!isSuperAdmin}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isSuperAdmin ? platformNames.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  )) : (
                    <SelectItem value={adminSource}>{adminSource}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>推荐码（选填）</Label>
              <Input
                value={addReferralCode}
                onChange={(e) => setAddReferralCode(e.target.value.toUpperCase())}
                placeholder="输入推荐人的推荐码"
                disabled={addingMember}
                className="font-mono uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>会员等级</Label>
                <Select value={addTier} onValueChange={setAddTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">普通会员</SelectItem>
                    <SelectItem value="subscriber">订阅会员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {addTier === 'subscriber' && (
                <div className="space-y-1.5">
                  <Label>时长</Label>
                  <Select value={addDuration} onValueChange={setAddDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">1天</SelectItem>
                      <SelectItem value="14d">14天</SelectItem>
                      <SelectItem value="1">1个月</SelectItem>
                      <SelectItem value="3">3个月</SelectItem>
                      <SelectItem value="6">6个月</SelectItem>
                      <SelectItem value="12">12个月</SelectItem>
                      <SelectItem value="permanent">永久</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground space-y-1">
              <p>• 默认密码: <span className="font-mono font-medium text-foreground">Globalattract123@</span></p>
              <p>• 用户首次登录后须修改密码才能使用</p>
            </div>
            <Button
              className="w-full"
              onClick={handleCreateMember}
              disabled={!addEmail.trim() || addingMember}
            >
              {addingMember ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              {addingMember ? '创建中...' : '创建会员'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
