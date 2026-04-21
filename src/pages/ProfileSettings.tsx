import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, Loader2, Save, Calendar as CalendarIcon, Check, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Solar } from 'lunar-javascript';
import { getFourPillars } from '@/lib/ganzhiHelper';
import { hourToShichen } from '@/types/database';
import FourPillarsDisplay from '@/components/FourPillarsDisplay';
import LiuYaoDisplay from '@/components/LiuYaoDisplay';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ShippingAddressDialog } from '@/components/ShippingAddressDialog';
import { MapPin, Plus, Pencil, Crown, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function ShippingAddressSection() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shippingData, setShippingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchShipping = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('shipping_first_name, shipping_last_name, shipping_address, shipping_address2, shipping_city, shipping_state, shipping_postcode, shipping_country')
      .eq('id', user.id)
      .single();
    setShippingData(data);
    setLoading(false);
  };

  useEffect(() => { fetchShipping(); }, [user]);

  // Auto-open dialog if no shipping address
  useEffect(() => {
    if (!loading && shippingData && !shippingData.shipping_address) {
      // Don't auto-open, just show prompt
    }
  }, [loading, shippingData]);

  const hasAddress = shippingData?.shipping_address;

  if (loading) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          配送地址
        </Label>
        <Button variant="ghost" size="sm" onClick={() => setDialogOpen(true)} className="text-primary">
          {hasAddress ? <Pencil className="h-3.5 w-3.5 mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
          {hasAddress ? '编辑' : '添加'}
        </Button>
      </div>
      {hasAddress ? (
        <div className="bg-muted/50 rounded-xl p-3 text-sm space-y-0.5">
          <p className="font-medium">{shippingData.shipping_first_name} {shippingData.shipping_last_name}</p>
          <p className="text-muted-foreground">{shippingData.shipping_address}</p>
          {shippingData.shipping_address2 && <p className="text-muted-foreground">{shippingData.shipping_address2}</p>}
          <p className="text-muted-foreground">{shippingData.shipping_postcode} {shippingData.shipping_city}, {shippingData.shipping_state}</p>
          <p className="text-muted-foreground">{shippingData.shipping_country}</p>
        </div>
      ) : (
        <button
          onClick={() => setDialogOpen(true)}
          className="w-full border border-dashed border-border rounded-xl p-4 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          点击添加配送地址
        </button>
      )}
      <ShippingAddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={fetchShipping}
        initialData={hasAddress ? {
          firstName: shippingData.shipping_first_name || '',
          lastName: shippingData.shipping_last_name || '',
          address: shippingData.shipping_address || '',
          address2: shippingData.shipping_address2 || '',
          city: shippingData.shipping_city || '',
          state: shippingData.shipping_state || '',
          postcode: shippingData.shipping_postcode || '',
          country: shippingData.shipping_country || 'Malaysia',
        } : undefined}
      />
    </div>
  );
}

function MembershipInfoSection() {
  const { user, profile, isAdmin, isSuperAdmin, isOwner } = useAuth();
  const navigate = useNavigate();
  const [memberData, setMemberData] = useState<{ member_tier: string; membership_expires_at: string | null; last_login_at: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data } = await (supabase
        .from('profiles')
        .select('member_tier, membership_expires_at, last_login_at')
        .eq('id', user.id)
        .single()) as any;
      if (data) setMemberData(data);
    };
    fetchData();
  }, [user]);

  if (!memberData) return null;

  const tierLabels: Record<string, string> = { normal: '普通会员', subscriber: '订阅会员', vip: '订阅会员', vip_plus: '订阅会员' };
  const isExpired = !isAdmin && memberData.membership_expires_at && new Date(memberData.membership_expires_at) < new Date();
  const effectiveTier = isAdmin ? 'subscriber' : (isExpired ? 'normal' : memberData.member_tier);
  const isPaid = effectiveTier !== 'normal';
  const displayLabel = isOwner ? 'Owner' : isSuperAdmin ? 'SuperAdmin' : isAdmin ? 'Admin' : (tierLabels[effectiveTier] || '普通会员');

  return (
    <div className="space-y-2 mt-4">
      <Label className="flex items-center gap-1.5">
        <Crown className="h-4 w-4" />
        会员信息
      </Label>
      <div className="bg-muted/50 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">当前等级</span>
          <Badge variant={isPaid ? 'default' : 'outline'} className={isOwner ? 'bg-emerald-600' : isSuperAdmin ? 'bg-purple-600' : isAdmin ? 'bg-red-600' : (effectiveTier === 'subscriber' || effectiveTier === 'vip_plus' || effectiveTier === 'vip') ? 'bg-amber-500' : ''}>
            {displayLabel}
          </Badge>
        </div>
        {!isAdmin && memberData.member_tier !== 'normal' && (
          <div className="flex items-center justify-between">
            <span className="text-sm">到期时间</span>
            {memberData.membership_expires_at ? (
              <span className={`text-sm font-medium ${isExpired ? 'text-destructive' : ''}`}>
                {format(new Date(memberData.membership_expires_at), 'yyyy-MM-dd')}
                {isExpired && ' (已过期)'}
              </span>
            ) : (
              <span className="text-sm font-medium text-amber-600">永久</span>
            )}
          </div>
        )}
        {memberData.last_login_at && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm">最近登录</span>
            <span className="text-sm text-muted-foreground">
              {format(new Date(memberData.last_login_at), 'yyyy-MM-dd HH:mm')}
            </span>
          </div>
        )}
        {/* {!isAdmin && effectiveTier !== 'vip_plus' && (
        <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate('/pricing')}>
          {isExpired ? '续费/升级' : '升级会员'}
        </Button>
        )} */}
      </div>
    </div>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

interface ProfileData {
  display_name: string | null;
  birth_date: string | null;
  birth_hour: number | null;
  birth_minute: number | null;
  gender: string | null;
  phone_number: string | null;
  referral_code: string | null;
}

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [hourDrawerOpen, setHourDrawerOpen] = useState(false);
  const [minuteDrawerOpen, setMinuteDrawerOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: null,
    birth_date: null,
    birth_hour: null,
    birth_minute: 0,
    gender: null,
    phone_number: null,
    referral_code: null,
  });

  // Convert string date to Date object for calendar
  const birthDateObj = useMemo(() => {
    if (!profileData.birth_date) return new Date();
    const [year, month, day] = profileData.birth_date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }, [profileData.birth_date]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, birth_date, birth_hour, birth_minute, gender, phone_number, referral_code')
        .eq('id', user.id)
        .single();
      
      if (data && !error) {
        setProfileData({
          display_name: data.display_name,
          birth_date: data.birth_date,
          birth_hour: data.birth_hour,
          birth_minute: data.birth_minute ?? 0,
          gender: data.gender,
          phone_number: data.phone_number ?? null,
          referral_code: (data as any).referral_code ?? null,
        });
      }
      setLoading(false);
    };
    
    fetchProfile();
  }, [user]);

  // Calculate Four Pillars and related info
  const baziInfo = useMemo(() => {
    if (!profileData.birth_date || profileData.birth_hour === null) return null;
    
    const [year, month, day] = profileData.birth_date.split('-').map(Number);
    const hour = profileData.birth_hour;
    const minute = profileData.birth_minute ?? 0;
    
    // Create Date object for getFourPillars
    const birthDate = new Date(year, month - 1, day, hour, minute, 0);
    const pillars = getFourPillars(birthDate);
    
    // Calculate lunar date
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    const lunarDate = `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
    
    // Calculate age
    const today = new Date();
    let age = today.getFullYear() - year;
    const ageMonthDiff = today.getMonth() + 1 - month;
    if (ageMonthDiff < 0 || (ageMonthDiff === 0 && today.getDate() < day)) {
      age--;
    }
    const xuSui = age + 1; // 虚岁
    
    return {
      pillars,
      lunarDate,
      age,
      xuSui,
    };
  }, [profileData.birth_date, profileData.birth_hour, profileData.birth_minute]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setProfileData({ 
        ...profileData, 
        birth_date: format(date, 'yyyy-MM-dd') 
      });
    }
  };

  const shichen = profileData.birth_hour !== null ? hourToShichen(profileData.birth_hour) : null;

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profileData.display_name,
        birth_date: profileData.birth_date,
        birth_hour: profileData.birth_hour,
        birth_minute: profileData.birth_minute,
        gender: profileData.gender,
        phone_number: profileData.phone_number,
      })
      .eq('id', user.id);
    
    if (error) {
      toast({
        title: '保存失败',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      // Sync to "自己" client if it exists
      if (profileData.birth_date && profileData.gender) {
        const genderLabel = profileData.gender === 'male' ? '男' : '女';
        await supabase
          .from('clients')
          .update({
            name: profileData.display_name || '我',
            birth_date: profileData.birth_date,
            birth_hour: profileData.birth_hour ?? null,
            birth_minute: profileData.birth_minute ?? 0,
            gender: genderLabel,
            phone_number: profileData.phone_number ?? null,
          })
          .eq('user_id', user.id)
          .eq('category', '自己');
      }

      toast({
        title: '保存成功',
        description: '个人资料已更新',
      });
    }
    setSaving(false);
  };

  const canViewDestiny = profileData.birth_date && profileData.birth_hour !== null && profileData.gender;

  const handleViewDestiny = () => {
    if (!canViewDestiny) return;
    // Convert gender to 男/女 format
    const genderLabel = profileData.gender === 'male' ? '男' : '女';
    
    // Navigate to destiny with profile data as query params
    const params = new URLSearchParams({
      mode: 'self',
      birthDate: profileData.birth_date!,
      birthHour: profileData.birth_hour!.toString(),
      birthMinute: (profileData.birth_minute ?? 0).toString(),
      gender: genderLabel,
      name: profile?.display_name || '我',
    });
    navigate(`/destiny?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">个人设置</h1>
          <Button onClick={handleSave} disabled={saving} size="sm" className="py-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6 mb-10">
        {/* User Info Header */}
        <div className="bg-muted/50 rounded-xl p-4 flex justify-between">
        <div className="flex flex-col gap-2">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-base text-black font-bold mb-2">{profileData.display_name}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            {profileData.referral_code && (
              <p className="text-xs text-muted-foreground mt-1">推荐码: <span className="font-mono font-medium bg-muted px-1.5 py-0.5 rounded">{profileData.referral_code}</span></p>
            )}
          </div>
          <div>
            <MembershipInfoSection></MembershipInfoSection>
          </div>
        </div>
          {canViewDestiny && (
            <Button onClick={handleViewDestiny} variant="outline" size="sm">
              看命盘
            </Button>
          )}
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label>显示名称</Label>
          <Input
            type="text"
            value={profileData.display_name || ''}
            onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
            placeholder="输入显示名称"
          />
        </div>

        {/* Birth Date - Mobile uses Dialog, Desktop uses Popover */}
        {isMobile ? (
          <div className="space-y-2">
            <Label>出生日期</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal"
              onClick={() => setDateDialogOpen(true)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {profileData.birth_date 
                ? format(birthDateObj, 'yyyy年M月d日')
                : '选择出生日期'
              }
            </Button>

            <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
              <DialogContent className="w-[calc(100%-3rem)] max-w-lg left-1/2 -translate-x-1/2 rounded-lg">
                <DialogHeader>
                  <DialogTitle>选择出生日期</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center py-2">
                  <Calendar
                    mode="single"
                    selected={birthDateObj}
                    onSelect={handleDateSelect}
                    defaultMonth={birthDateObj}
                    className="pointer-events-auto"
                  />
                </div>
                <DialogFooter className="flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      handleDateSelect(new Date());
                    }}
                  >
                    今天
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => setDateDialogOpen(false)}>
                    确认
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>出生日期</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn("w-full justify-start text-left font-normal")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {profileData.birth_date 
                    ? format(birthDateObj, 'yyyy年M月d日')
                    : '选择出生日期'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthDateObj}
                  onSelect={handleDateSelect}
                  defaultMonth={birthDateObj}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Birth Time */}
        {isMobile ? (
          <div className="space-y-3">
            <Label>出生时间</Label>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="w-20" onClick={() => setHourDrawerOpen(true)}>
                {(profileData.birth_hour ?? 0).toString().padStart(2, "0")}时
              </Button>
              <span className="text-muted-foreground">:</span>
              <Button type="button" variant="outline" className="w-20" onClick={() => setMinuteDrawerOpen(true)}>
                {(profileData.birth_minute ?? 0).toString().padStart(2, "0")}分
              </Button>
              {shichen && (
                <span className="text-sm text-muted-foreground ml-2">
                  {shichen.name}
                </span>
              )}
            </div>

            {/* Hour Drawer */}
            <Drawer open={hourDrawerOpen} onOpenChange={setHourDrawerOpen}>
              <DrawerContent className="max-h-[70vh]">
                <DrawerHeader className="border-b">
                  <DrawerTitle>选择时辰</DrawerTitle>
                </DrawerHeader>
                <ScrollArea className="flex-1 max-h-[50vh] overflow-y-scroll">
                  <div className="divide-y">
                    {HOURS.map((h) => {
                      const shi = hourToShichen(h);
                      const isSelected = profileData.birth_hour === h;
                      return (
                        <button
                          key={h}
                          type="button"
                          className={cn(
                            "w-full px-4 py-3 flex items-center justify-between text-left transition-colors",
                            isSelected ? "bg-primary/10" : "hover:bg-muted/50",
                          )}
                          onClick={() => {
                            setProfileData({ ...profileData, birth_hour: h });
                            setHourDrawerOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base font-medium">{h.toString().padStart(2, "0")}时</span>
                            {/* <span className="text-sm text-muted-foreground">
                              {shi.name} ({shi.range})
                            </span> */}
                          </div>
                          {isSelected && <Check className="h-5 w-5 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </DrawerContent>
            </Drawer>

            {/* Minute Drawer */}
            <Drawer open={minuteDrawerOpen} onOpenChange={setMinuteDrawerOpen}>
              <DrawerContent className="max-h-[60vh]">
                <DrawerHeader className="border-b">
                  <DrawerTitle>选择分钟</DrawerTitle>
                </DrawerHeader>
                <ScrollArea className="flex-1 max-h-[50vh] overflow-y-scroll">
                  <div className="divide-y">
                    {MINUTES.map((m) => {
                      const isSelected = profileData.birth_minute === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          className={cn(
                            "w-full px-4 py-3 flex items-center justify-between text-left transition-colors",
                            isSelected ? "bg-primary/10" : "hover:bg-muted/50",
                          )}
                          onClick={() => {
                            setProfileData({ ...profileData, birth_minute: m });
                            setMinuteDrawerOpen(false);
                          }}
                        >
                          <span className="text-base font-medium">{m.toString().padStart(2, "0")}分</span>
                          {isSelected && <Check className="h-5 w-5 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </DrawerContent>
            </Drawer>
          </div>
        ) : (
          <div className="space-y-3">
            <Label>出生时间</Label>
            <div className="flex items-center gap-2">
              <Select 
                value={(profileData.birth_hour ?? 12).toString()} 
                onValueChange={(v) => setProfileData({ ...profileData, birth_hour: parseInt(v) })}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h.toString().padStart(2, "0")}时
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">:</span>
              <Select 
                value={(profileData.birth_minute ?? 0).toString()} 
                onValueChange={(v) => setProfileData({ ...profileData, birth_minute: parseInt(v) })}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MINUTES.map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {m.toString().padStart(2, "0")}分
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {shichen && (
                <span className="text-sm text-muted-foreground ml-2">
                  {shichen.name} ({shichen.range})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Gender */}
        <div className="space-y-2">
          <Label>性别</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={profileData.gender === 'male' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setProfileData({ ...profileData, gender: 'male' })}
            >
              男
            </Button>
            <Button
              type="button"
              variant={profileData.gender === 'female' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setProfileData({ ...profileData, gender: 'female' })}
            >
              女
            </Button>
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label>电话号码</Label>
          <Input
            type="tel"
            value={profileData.phone_number || ''}
            onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
            placeholder="输入电话号码"
          />
        </div>

        {/* Shipping Address */}
        <ShippingAddressSection />

        {/* Display calculated info if birth data exists */}
        {baziInfo && (
          <>
            {/* Age & Lunar Date */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">周岁</span>
                <span className="font-medium">{baziInfo.age}岁</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">虚岁</span>
                <span className="font-medium">{baziInfo.xuSui}岁</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">农历生日</span>
                <span className="font-medium">{baziInfo.lunarDate}</span>
              </div>
            </div>

            {/* Four Pillars */}
            <FourPillarsDisplay pillars={baziInfo.pillars} />

            {/* Liu Yao */}
            <LiuYaoDisplay pillars={baziInfo.pillars} />
          </>
        )}

        {!baziInfo && profileData.birth_date && (
          <p className="text-sm text-muted-foreground text-center py-4">
            请选择出生时辰以查看八字和六爻
          </p>
        )}
      </div>
    </div>
  );
}
